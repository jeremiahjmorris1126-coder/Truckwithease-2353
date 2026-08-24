# TruckWithEase — Design System

Gold on black. Recovered from the launch-ready package (`tailwind.config.cjs`), which supersedes
the older navy/amber and navy/safety-orange variants. Do not reintroduce navy.

## Color

| Token | Hex | Use |
|---|---|---|
| `--color-twgold` | `#C9A84C` | primary gold, borders, labels |
| `--color-twgoldbright` | `#FFD700` | CTAs, active states, emphasis |
| `--color-twblack` | `#0a0a0a` | page background |
| `--color-twcard` | `#161616` | cards, panels |
| `--color-twnav` | `#111111` | nav, sidebar, headers |
| `--color-twborder` | `#222222` | hairlines, dividers |

Defined in `packages/web/src/web/styles.css` under Tailwind 4 `@theme`, so legacy classes
(`bg-twblack`, `text-twgold`, `border-twborder`) work without a Tailwind 3 config file.

Gradients: `.bg-gold-gradient`, `.twe-gold-grad`, `.text-gold-gradient`.

## Typography

- **Display** — Bebas Neue (`--font-display`): hero numbers, big statements
- **Heading** — Oswald (`--font-heading`): section titles, uppercase nav labels, tracking-wide
- **Body** — Inter (`--font-body`)
- **Mono** — JetBrains Mono: data, IDs, load numbers

Loaded in `packages/web/index.html` via the Google Fonts link.

## Layout

Dense, operational. This is a working tool for drivers and dispatchers, not a marketing site —
controlled density over generous whitespace on `/command`, `/dispatch`, `/traxes`.
Grouped collapsible sidebar. Uppercase Oswald section labels with letter-spacing.
Cards on `#161616` over `#0a0a0a` with `#222222` hairlines — no shadows, no rounded-2xl.

## Architecture note

Two UI layers coexist:

1. `src/web/pages/` — 15 managed pages wired to live Turso data, routed under `/app/*`.
2. `src/web/legacy/` — 296 recovered files, 253 pages, mounted wholesale as a Wouter catch-all
   in `app.tsx`. Its own `window.location.pathname` router serves 491 paths.

PocketBase is shimmed at `src/web/lib/pb-shim.ts` (aliased in `vite.config.ts`). Collections
migrate to Turso one at a time by adding them to `SERVER_COLLECTIONS` and building the matching
Hono route — no page edits required.

## Logo & brand assets

Reconstructed clean from Jeremiah's Canva original (the source was a photo of a monitor —
glare, moiré and perspective skew would not have survived at nav sizes).

Gold gradient stops: `#A9762A` → `#FFD700` → `#F5E79E` (vertical, bright stop at ~55%).

All assets live in `packages/web/public/static/` — the paths the recovered legacy code already
references, so all 124 existing `<img src="/static/...">` tags resolve without editing pages.

| File | Size | Use |
|---|---|---|
| `twe-logo.png` | 1024² | Stacked primary mark (truck over wordmark) |
| `twe-logo-transparent.png` | 1024² | Stacked, black knocked out |
| `twe-full-logo.jpg` | 1024², q92 | Stacked, opaque, for email/social |
| `truckwithease-icon.png` | 512² | Truck mark only, transparent — app icon / favicon source |
| `twe-logo-horizontal.png` | 2560×1440 | Wide lockup, full canvas |
| `twe-logo-horizontal-trim.png` | 2474×463 | Wide lockup, trimmed — **use this in headers** |
| `twe-logo-horizontal-transparent.png` | 2474×463 | Wide lockup, black knocked out |
| `twe-logo-nav.png` | 1368×256 | Pre-scaled nav bar raster |
| `truckwithease-logo.svg` | vector wrapper | Scalable wide lockup |
| `morrishive-logo.svg` | vector | MorrisHive hex + wordmark, gold gradient |
| `gen_truck-branded-hero-a44a85.webp` | 1920×1088 | Landing hero, black/gold semi at blue hour |

`public/favicon.ico` (16/32/48/64) and `public/og-image.png` (1200×630) are both derived from
the new mark. `public/twe-logo-full.png` is the master 1024² render.

### Usage rules

- **Stacked mark** only at 96px height or above. Below that the subtitle turns to mush.
- **Nav bars use the horizontal lockup.** Legacy headers render logos at `height: 38px` with
  `objectFit: contain` — a stacked logo is unreadable there.
- Minimum sizes: horizontal lockup 120px wide; icon mark 20px.
- Clear space: one truck-cab height on all sides.
- Gold on `#0a0a0a` or pure black only. Never gold on white, never recolor, never outline,
  never add a drop shadow — the gradient carries the depth.
