# Clear.bg — End-to-End UX Plan

## Brand Voice
Simple, confident, technical but approachable. Like a great tool, not a SaaS product.
Tagline: **"Background removal that stays on your machine."**

---

## Design System

### Typography — Google Sans
- Display: Google Sans 700, 48–64px, tight tracking (−0.03em)
- Heading: Google Sans 600, 24–32px
- Body: Google Sans 400, 15px / 1.6
- Small / Label: Google Sans 500, 12–13px, letter-spacing 0.04em

### Color System — Light Mode
```
--bg:           #f8f7ff   /* near-white with a breath of purple */
--surface:      #ffffff
--surface-2:    #f3f2fb   /* lifted surfaces, inputs */
--border:       #e4e2f0
--text:         #1a1730   /* deep purple-black */
--text-2:       #4c4870   /* secondary */
--muted:        #9491aa   /* labels, hints */
--accent:       #6d28d9   /* violet — clear and deliberate */
--accent-2:     #8b5cf6   /* lighter accent for gradients */
--accent-light: #ede9fe   /* bg tints */
--accent-glow:  rgba(109,40,217,0.12)
--success:      #059669
--error:        #dc2626
--shadow-sm:    0 1px 3px rgba(26,23,48,0.08)
--shadow-md:    0 4px 12px rgba(26,23,48,0.10)
--shadow-lg:    0 20px 40px rgba(26,23,48,0.12)
```

### Spacing
4-point grid. Common values: 4, 8, 12, 16, 24, 32, 48, 64px.

### Radius
- Cards / modals: 16px
- Inputs / buttons: 10px
- Small elements: 6px
- Pills: 999px

---

## Pages & Views

The app is a single-page React app with **two views**, no router needed.
The view switches based on whether images are loaded.

---

### View 1: Landing (no images loaded)

This is the first thing users see. It needs to convert immediately.

```
┌─────────────────────────────────────────────────┐
│  HEADER                                          │
│  clear.bg                    Features  How it   │
│  (logo)                      works    GitHub    │
├─────────────────────────────────────────────────┤
│  HERO                                            │
│                                                  │
│  Background removal                              │
│  that stays on your machine.                     │
│                                                  │
│  Local AI · Zero uploads · Unlimited & free      │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │    ⬆  Drop images here                   │  │
│  │       or click to browse                 │  │
│  │       or Ctrl+V to paste                 │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│  PNG · JPG · WebP · up to any size              │
│                                                  │
├─────────────────────────────────────────────────┤
│  TRUST STRIP                                     │
│  🔒 Private  ·  ⚡ Instant  ·  ✦ Professional  │
├─────────────────────────────────────────────────┤
│  FEATURES (3 cards side by side)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 🔒       │  │ ⚡        │  │ 🎨       │      │
│  │ Private  │  │ Fast     │  │ Quality  │      │
│  │ ...      │  │ ...      │  │ ...      │      │
│  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────┤
│  HOW IT WORKS                                    │
│  01 Drop  →  02 AI removes bg  →  03 Download   │
├─────────────────────────────────────────────────┤
│  MODELS (table/cards)                            │
│  ISNet · U²-Net · U²-Net Human                  │
├─────────────────────────────────────────────────┤
│  FOOTER                                          │
│  clear.bg · Built locally · No data sent        │
└─────────────────────────────────────────────────┘
```

**Interactions:**
- Drop zone has dashed border with hover + drag-over animations
- Entire hero area is a drop target
- Clicking Browse opens file picker
- Dropping files → immediately transitions to Editor view

---

### View 2: Editor (images loaded)

Full-screen tool. Clean, focused, no distractions.

```
┌────────────────────────────────┬──────────────────┐
│ HEADER (sticky)                │                  │
│ clear.bg  + Add  Clear  ↓ All  │   SIDEBAR        │
├────────────────────────────────│                  │
│                                │  🟢 100% local   │
│  IMAGE GRID                    │                  │
│  ┌──────┐ ┌──────┐ ┌──────┐   │  ── Model ──     │
│  │before│ │before│ │before│   │  [ISNet ▾]       │
│  │ /    │ │ /    │ │      │   │  Alpha matting ○  │
│  │after │ │after │ │ ···  │   │                  │
│  └──────┘ └──────┘ └──────┘   │  ── Output ──    │
│  filename  filename  queued    │  PNG   WebP      │
│  3840×2160 ⚡2.1s              │                  │
│                                │  ── Background ──│
│  [← scroll for more →]        │  ▣ ■ □ ▪ ▫ + …  │
│                                │  Custom color    │
│                                │                  │
│                                │  ── ──────────── │
│                                │  [Process all]   │
└────────────────────────────────┴──────────────────┘
```

**Cards:**
- Aspect ratio 1:1
- Checkerboard bg (shows transparency)
- Before/After slider — drag horizontally to compare
- Hover shows: ⤢ zoom · ✏ brush edit · ↓ download · ✕ remove
- Bottom: filename, dimensions, processing time

**Sidebar (320px fixed):**
- Privacy badge (top)
- Model section
- Output format section
- Background section
- Process button (sticky bottom)

---

### Modal: Brush Editor
Opens over the editor when ✏ is clicked on a done card.

```
┌─────────────────────────────────────────────────┐
│  Refine edges — photo.jpg               ✕       │
├─────────────────────────────────────────────────┤
│                                                  │
│            [Canvas — checkered bg]               │
│            Shows result with edits live          │
│                                                  │
├─────────────────────────────────────────────────┤
│  [◌ Erase]  [◉ Restore]    Size ─────── 30px   │
│                              [Cancel]  [Save ✓] │
└─────────────────────────────────────────────────┘
```

Keyboard: `E` = erase, `R` = restore, `Esc` = close.

---

### Modal: Lightbox
Full-screen before/after view. Hover/drag the divider.

---

## Transition Between Views

**Landing → Editor:** When first file is dropped, animate the landing out and editor in.
- Landing fades/slides up
- Editor slides up from below
- Keep it fast (<300ms), don't be precious about it

**Editor → Landing (clear all):** Confirm if >3 images done (avoid accidental loss).

---

## What We're NOT Building (keeping scope tight)
- User accounts / history
- Cloud sync
- Multiple pages with router
- Dark mode toggle (light only)
- Mobile layout (desktop-first for now)
