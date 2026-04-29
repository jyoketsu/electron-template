# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev mode (Electron + Vite HMR)
pnpm build:mac    # Build macOS app (skips typecheck)
pnpm build:win    # Build Windows app (runs typecheck first)
pnpm typecheck    # Run TS typecheck for both main and renderer
pnpm lint         # ESLint
pnpm format       # Prettier
```

> `build:mac` skips `typecheck` step intentionally (see package.json). `build:win` runs `npm run build` which includes typecheck.

## Architecture

This is an **Electron + React + TypeScript** desktop app (electron-vite scaffold) for AI image generation.

### Process Boundary

- **Main process** (`src/main/index.ts`): All IPC handlers live here. Handles API calls to Grsai/OpenAI, image saving, history persistence (JSON file in `app.getPath('userData')`), and the `localfile://` custom protocol for displaying local images.
- **Preload** (`src/preload/index.ts`): Exposes `window.api` to the renderer via `contextBridge`. All renderer→main communication goes through `window.api.*`.
- **Renderer** (`src/renderer/src/`): React SPA using HashRouter.

### Renderer Structure

- **Routing**: `App.tsx` — `HashRouter` with routes for `/`, `/apps`, `/apps/outfit-swap`, `/tasks`, `/history`, `/templates`, `/settings`.
- **Global state**: Zustand stores in `src/renderer/src/store/`
  - `tasks.ts` — running task list + `submitGenerate()` method. **Important**: generation logic lives in the store, not in components, so tasks survive route navigation (component unmounts don't cancel in-flight requests).
  - `settings.ts` — persisted settings (apiKey, apiHost, apiMode, outputDir).
- **Pages**: One file per route in `src/renderer/src/pages/`. App workflows (like outfit swap) are separate pages under `/apps/:id`.
- **UI components**: shadcn/ui style in `src/renderer/src/components/ui/`. Tailwind CSS v4 via `@tailwindcss/vite`.

### IPC API Surface (`window.api`)

| Method | Description |
|--------|-------------|
| `generateImage(params)` | Calls Grsai or OpenAI, returns `{ ok, data: { type, b64 } }` |
| `saveImage(b64, outputDir)` | Saves base64 PNG to disk, returns absolute path |
| `historyList()` | Reads history.json |
| `historyAdd(record)` | Prepends record to history.json |
| `historyDelete(id)` | Removes record + deletes image file |
| `openDirectory()` | Native folder picker |
| `showInFolder(path)` | Reveals file in Finder/Explorer |

### Local Image Display

Local images are served via a custom `localfile://` protocol registered in main. Use this pattern in renderer:

```tsx
src={`localfile://${imagePath.replace(/\\/g, '/')}`}
```

The handler strips `localfile://` and on Windows removes the extra leading `/` before the drive letter (`/C:/...` → `C:/...`).

### Path Aliases

`@/` and `@renderer/` both resolve to `src/renderer/src/`. Configured in both `electron.vite.config.ts` (runtime) and `tsconfig.web.json` (TS language server).

### API Modes

Two modes selectable in Settings:
- **grsai**: Calls `POST /v1/draw/completions` then polls `POST /v1/draw/result` until `succeeded`. Returns a URL which is downloaded and converted to base64.
- **openai**: Calls `/v1/images/generations` (text-to-image) or `/v1/images/edits` (with reference images). Returns `b64_json` directly.

Ratio options differ per mode: Grsai uses aspect ratio strings (`1:1`, `16:9`…), OpenAI uses pixel dimensions (`1024x1024`…).
