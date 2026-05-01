# UX-Driven Plan: Web UI for AI Background Remover

## Design Philosophy
Make it feel **instant, magical, and forgiving**. The user should be able to drop an image and see the result within 5 seconds, with zero clicks if they want defaults.

## Core User Journeys

### 1. The Lazy Path (90% of users)
Drop image → result appears → click download. **Three actions, zero configuration.**

### 2. The Power Path
Drop image(s) → tweak model/alpha matting → swap background (color/gradient/image) → download single or ZIP.

### 3. The Bulk Path
Drop folder of 20 images → live progress (`3/20 ✓`) → download all as ZIP.

## UX Principles
- **Zero cold-start surprise**: Show "warming up model…" on first request, never a silent 5-second delay
- **Show the result, not the loading**: Skeleton/blur of the original while processing, not a generic spinner
- **Before/After slider**: Drag to compare — instantly communicates the AI is working
- **Forgiving**: Drag a non-image? Friendly toast, not a red error. Too many files? Auto-batch.
- **No modal pop-ups**: Settings are always visible in a sidebar/panel, not hidden behind a gear icon
- **Keyboard-first**: Space = process, Cmd/Ctrl+S = download, Esc = clear
- **Responsive but desktop-first**: This is a tool for people working with images on real screens

## Visual Design
- Dark mode default (image work = dark UI)
- Checkered transparency pattern behind cutouts (industry standard, instantly readable)
- Subtle glassmorphism on side panel
- One accent color (electric purple `#a855f7`) — the rest is grayscale
- Inter font, generous spacing

## Feature Set (v1 — ship this)

### Frontend
- [x] Drag-and-drop zone covering full viewport
- [x] Click-to-browse fallback
- [x] Multi-file support with thumbnail grid
- [x] Real-time before/after slider (mouse drag)
- [x] Background replacement: transparent / solid color / gradient / custom image
- [x] Settings panel: model picker, alpha matting toggle
- [x] Per-image progress states (queued / processing / done / error)
- [x] Download single PNG or ZIP all
- [x] Drag-out reorder (nice-to-have, skip if time)

### Backend additions
- [x] Serve frontend statically from FastAPI
- [x] Add `bg_color` and `bg_image` params to `/remove` endpoint
- [x] Compose result onto background in `core/remover.py`
- [x] Move JSON root to `/api` so `/` serves the UI

## Tech Choices
- **No framework**. Single HTML file with vanilla JS + modern CSS. Why: zero build, instant iteration, no dependency hell. The whole UI is <500 lines.
- **No bundler, no npm**. The Python backend serves one HTML file.
- **Browser-native APIs**: `<input type=file>`, `FormData`, `fetch`, `URL.createObjectURL`.

## File Changes
1. `static/index.html` — entire UI (HTML+CSS+JS in one file)
2. `api/server.py` — mount static, add bg replacement params, move root JSON
3. `core/remover.py` — `compose_on_background()` helper

## Out of Scope (v2+)
- Real-time SSE progress (current synchronous flow is fast enough for now)
- Account/history
- Cloud storage
- GPU auto-detection
