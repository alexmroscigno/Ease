import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import {pathToFileURL} from 'node:url';

const port=Number(process.env.PORT||8787);
const apiKey=process.env.OPENAI_API_KEY||'';
const model=process.env.OPENAI_MODEL||'gpt-6-luna';
const root=new URL('.',import.meta.url).pathname;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.css':'text/css; charset=utf-8'};
const send=(res,status,data,type='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end(typeof data==='string'?data:JSON.stringify(data))};
const body=req=>new Promise((resolve,reject)=>{let chunks=[],size=0;req.on('data',c=>{size+=c.length;if(size>1_000_000){reject(new Error('Request too large'));req.destroy()}else chunks.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'))}catch(e){reject(e)}});req.on('error',reject)});
const outputText=data=>data.output_text||data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text||'';

const schema={type:'object',additionalProperties:false,required:['summary','items'],properties:{summary:{type:'string'},items:{type:'array',maxItems:12,items:{type:'object',additionalProperties:false,required:['hour','title','type','sourceId','matchLabel','note'],properties:{hour:{type:'integer',minimum:0,maximum:23},title:{type:'string'},type:{type:'string',enum:['task','menu','plan','turn','outing','holding','pool','open']},sourceId:{type:'string'},matchLabel:{type:'string'},note:{type:'string'}}}}}};
function instructions(payload){return `You are the private Day Composer inside Ease, a low-pressure personal planning app. Interpret a natural spoken description into a light plan for today.

Rules:
- Search the supplied catalog first. Reuse an existing item whenever the meaning plausibly matches. Never invent a sourceId.
- Only use type task/menu/plan/turn/outing/holding when sourceId exactly matches an item in that catalog. Use pool for a requested rotating category and open for a protected activity or unmatched thought.
- Do not create tasks. Unmatched thoughts must be type open and labeled Needs review.
- Translate broad time language into sensible hours: early morning 7-9, morning 9-11, middle of day 11-13, around 1 = 13, mid-afternoon 14-16, evening 17-20.
- Preserve relationships. “Fold laundry while watching football” should be two items at the same hour and note that they go together.
- “A little clean/plan/computer work” means one place to begin, not an exhaustive list.
- “Things that haven't gotten Turns” means choose one or two least-recently-shown or starred Turn items.
- Avoid overfilling. Include Empty Space only when explicitly requested or clearly important to prevent crowding.
- This is a proposal only. Use warm, concise language. Do not claim anything was changed.

Today: ${payload.day}, ${payload.date}. Timezone: ${payload.timezone}.
Spoken thought: ${JSON.stringify(payload.transcript)}
Catalog: ${JSON.stringify(payload.catalog)}`}

export async function compose(payload){
  if(!apiKey)throw Object.assign(new Error('OPENAI_API_KEY is not configured'),{status:503});
  if(!payload?.transcript||typeof payload.transcript!=='string')throw Object.assign(new Error('A transcript is required'),{status:400});
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:instructions(payload),reasoning:{effort:'low'},text:{format:{type:'json_schema',name:'ease_day_plan',strict:true,schema}}})});
  const data=await response.json();
  if(!response.ok)throw Object.assign(new Error(data?.error?.message||'OpenAI request failed'),{status:502});
  const text=outputText(data);
  if(!text)throw Object.assign(new Error('The model returned no plan'),{status:502});
  return JSON.parse(text);
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS')return send(res,204,'');
  if(req.url==='/api/health')return send(res,200,{ok:true,ready:!!apiKey,model});
  if(req.url==='/api/compose'&&req.method==='POST'){
    try{return send(res,200,await compose(await body(req)))}catch(error){return send(res,error.status||500,{error:error.message})}
  }
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),safe=normalize(pathname).replace(/^(\.\.(\/|\\|$))+/,'');let path=join(root,safe==='/'?'index.html':safe);if((await stat(path)).isDirectory())path=join(path,'index.html');let file=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(file)}catch{return send(res,404,{error:'Not found'})}
});
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)server.listen(port,()=>console.log(`Ease is running at http://localhost:${port}`));
