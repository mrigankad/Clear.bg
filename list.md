# Clear.bg — Feature List & Roadmap

> Rebranding: the project is now **Clear.bg** — local, private, instant background removal.
> Tagline: *"Your images. Your machine. Crystal clear."*

---

## Already Built ✅

- Drag-and-drop multi-image upload (full-viewport drop zone)
- Before/after comparison slider on every image card
- 3 AI models: ISNet (best quality), U²-Net (fast), U²-Net Human (portraits)
- Alpha matting toggle for smooth hair/fur edges
- Solid color background replacement (6 presets + custom color picker)
- Custom image background upload and compositing
- Per-image progress states: queued → processing → done → error
- Single download (PNG) + Download all (sequential)
- Batch CLI (`python main.py cli ./folder --batch`)
- FastAPI REST API with Swagger docs at `/docs`
- Session caching — model stays loaded between requests (no cold-start)
- Keyboard shortcuts: `Space` = process, `Esc` = clear
- Dark UI with checkerboard transparency preview
- Zero cloud dependency — runs entirely on your machine

---

## High Priority — Users Expect These 🔥

- [ ] **Erase/restore brush** — Paint back or erase parts of the mask after AI processing. The #1 feature competitors have that we don't. Users always need to fix edge cases.
- [ ] **One-click background presets** — Beyond solid colors: gradient backgrounds, blurred studio looks, seasonal scenes. Competitors sell these as premium.
- [ ] **Download as ZIP** — One click downloads all processed images as a single ZIP. (API has this via `/remove/batch`, UI doesn't expose it yet.)
- [ ] **Drag to reorder grid** — Reorder images before batch download so output order matches intent.
- [ ] **Resolution indicator** — Show original dimensions and file size on each card. Users want to know what they're working with.
- [ ] **Format selector** — Let users pick PNG / WebP / JPEG for output. WebP is 30–50% smaller than PNG.

---

## Strong Differentiators — What Makes Clear.bg Stand Out 💎

- [ ] **100% local / privacy badge** — Make a visible "Never leaves your machine" badge in the UI. This is the #1 reason someone chooses Clear.bg over remove.bg.
- [ ] **GPU acceleration** — Swap `rembg[cpu]` → `rembg[gpu]` for 5–10× speed on NVIDIA GPUs. Auto-detect and show current mode (CPU/GPU) in the sidebar.
- [ ] **Video background removal** — Frame-by-frame removal using the same rembg engine. Only Photoroom and Adobe have this. Massive differentiator.
- [ ] **4K / high-res output** — No cloud tool can offer 8K output without a $40/mo plan. We can.
- [ ] **Object-level isolation** — Let users click a subject in the image to remove only that object's background (uses SAM — already in the model enum, not wired up yet).
- [ ] **Shadow generation** — Add realistic drop shadow under the cutout. Product photography use-case.
- [ ] **Upscaling** — Integrate Real-ESRGAN to upscale after removal. Niche but powerful.

---

## UX Improvements — Polish Users Notice ✨

- [ ] **Processing speed display** — Show `2.3s` under each done card. Users love knowing how fast local AI is vs the cloud.
- [ ] **Undo/redo** — Command+Z to undo the last removal and re-process with different settings.
- [ ] **Zoom on card** — Click a card to open a full-screen lightbox view with the before/after slider.
- [ ] **Toast improvements** — Distinguish success vs. warning vs. error with color + icon, not just a border.
- [ ] **Mobile layout** — Collapse sidebar into a bottom sheet on narrow screens.
- [ ] **Drag images out** — Drag a processed card directly to Finder/Explorer or another app.
- [ ] **Paste from clipboard** — `Ctrl+V` to paste an image directly into the app.

---

## Infrastructure & Developer Features ⚙️

- [ ] **Real-time SSE progress** — Stream per-image progress during batch jobs via Server-Sent Events. (FastAPI supports this natively.)
- [ ] **Webhook support** — POST to a URL when a batch job finishes. Useful for automation pipelines.
- [ ] **`/remove/url` endpoint** — Accept a public image URL instead of a file upload.
- [ ] **Auto-cleanup** — Delete files in `outputs/` older than N days.
- [ ] **Docker container** — One-command setup: `docker run clearbg`. No Python environment fiddling.

---

## Branding Checklist 🎨

- [ ] Update `index.html` title → `Clear.bg`
- [ ] Update logo in `Header` component → `clear<span>.</span>bg`
- [ ] Update FastAPI `title` and `description` in `server.py`
- [ ] Update `README.md`
- [ ] Favicon — minimal dot/circle mark in accent purple
- [ ] Domain placeholder in footer

---

## Competitive Comparison

| Feature | remove.bg | Canva | Photoroom | **Clear.bg** |
|---|---|---|---|---|
| Free removes | 1/month (HD) | 1/month | 3/month | ∞ (local) |
| Batch | Paid | Paid | Paid | ✅ Free |
| API | Paid | No | Paid | ✅ Free |
| Privacy | Cloud | Cloud | Cloud | ✅ 100% local |
| Offline | No | No | No | ✅ Yes |
| GPU speed | N/A | N/A | N/A | Planned |
| Brush tool | ✅ | ✅ | ✅ | Planned |
| Video | No | No | ✅ Paid | Planned |
| Price | $9+/mo | $13/mo | $10/mo | **Free** |
