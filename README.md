# Fieldnote portfolio illustrations

A standalone React + Vite project with four original, independently designed boards about continuing an existing event-planning MVP. Fieldnote and every visible person, event, and record are fictional. These are portfolio illustrations only: there is no Supabase project, production connection, real authentication, or real data behind the mock interactions.

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL and use the gallery, or visit a board directly:

- `/mock` — product workspace
- `/workflow` — connected workflow
- `/architecture` — implementation architecture
- `/before-after` — existing prototype and integration scope

## Checks and exports

```sh
npm run lint
npm run build
npx playwright install chromium
npm run export
```

The export script starts a temporary Vite server, waits for the page and fonts to settle, disables transient animations, and captures each 1600 × 1200 CSS-pixel board at device scale 2. PNGs are written to `exports/` at 3200 × 2400 pixels. The browser capture contains only the board, without gallery navigation or browser chrome.

The task status, notes, filters, template preview, and event preview are local illustrative interactions; they do not save to a backend or claim to prove production persistence. The boards describe task CRUD separately from event creation/deletion, and call out that persistent event editing, realtime collaboration, notifications, Excel synchronization, and in-app user administration are not implemented.
