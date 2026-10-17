# Ease AI Day Composer

The app remains usable offline. Without the secure service, Shape today uses a smaller on-device fallback and never sends data anywhere.

To activate the ChatGPT-level interpreter:

1. Create an OpenAI API key and set a low monthly spending limit in the OpenAI API dashboard.
2. Deploy this folder to any Node.js host that supports environment variables.
3. Set `OPENAI_API_KEY` on the host. Optionally set `OPENAI_MODEL`; the default is `gpt-6-luna`.
4. Start with `npm start`.
5. If the app and service use different web addresses, open **Update Ease → AI Day Composer**, enter the full address ending in `/api/compose`, save, and test it.

Never paste the API key into Ease or into `index.html`. The service keeps it away from the browser and phone.
