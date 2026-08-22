# Ease

Ease is a mobile-first, offline-capable task organizer built around a simple distinction: your task quadrants hold **what needs to happen**, while **Day Rhythm** holds what you are doing now.

## What it does

- Shows Priorities, Scheduled Priorities, and Recurring Tasks alongside a primary Day Rhythm.
- Automatically highlights the current time block when opened: Early Morning through Night.
- Persists all data locally in the browser. No account or backend is required.
- Supports touch or mouse drag-and-drop into Day Rhythm, between Top/Bottom lanes, back to quadrants, and onto another Day Rhythm task to combine them for today.
- Checks off a merged activity and all its underlying tasks complete together.
- Keeps daily rhythms in their permanent home for tomorrow; one-time Day Rhythm placements are only for today.
- Offers a permanent “Set rhythm home” control from a task’s overflow menu.
- Shows scheduled and recurring items only when due; overdue items offer fast rescheduling (next day, next week, next open day, next month, custom date) and skip for recurring items.
- Installs as a PWA and caches the app shell for offline use.

## Run locally

This is a plain HTML/CSS/JavaScript app—no package install or build step is needed. It must be served over HTTP for its service worker to work.

With Python available:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). On an iPhone, open the deployed site in Safari and choose **Share → Add to Home Screen**.

## Deploy on GitHub Pages

1. Put these files at the root of the `alexmroscigno/Ease` repository and commit/push them to your chosen branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the branch (typically `main`) and the `/ (root)` folder, then save.
5. Visit the generated Pages URL once online. After that first load, the app shell is available offline.

Because the manifest uses relative paths, it works whether Pages serves the app from a custom domain or `/Ease/` project path.

## Data and limitations

Data is saved in `localStorage` under `ease-data-v1`, per browser/device. Clearing browser site data removes it, and it does not yet sync across devices. The task model is deliberately self-contained in `app.js`, making a future storage adapter for a cloud database/login straightforward.

The included SVG app icon works in modern browsers. For best iOS icon rendering, add 192px and 512px PNG exports of `icons/icon.svg` and reference them in the manifest.
