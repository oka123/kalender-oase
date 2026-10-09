---
name: oase-unud-ac-id-design-system
source: https://oase.unud.ac.id/
extracted: 2026-10-09
theme: light # measured from neutral usage weight
colors: # roles inferred from usage frequency + luminance; names verified against values
  canvas: "#ffffff"
  ink: "#343a40"
  text-muted: "#6c757d"
  surface: "#eeeeee"
  hairline: "#cccccc"
  accent: "#dee2e6" # pale-cyan
  accent-2: "#2c49b6" # blue
  accent-3: "#dc3545" # red
fonts:
  primary: "Font Awesome 6 Brands" # medium-confidence: usage counts are close
  mono: "SFMono-Regular"
---

# Home | oase — Design System

Extracted from **https://oase.unud.ac.id/** on 2026-10-09.

Every value below is mined from the site's live CSS (120 native custom properties, ranked usage counts). Role assignments are inferred from usage and luminance and marked as such — treat them as a strong starting point, not gospel.

## Overview

The system reads as light: measured neutral usage weighs 645 light against 375 dark. The palette is chromatic: 12 saturated values against 11 neutrals, led by pale-cyan (`#dee2e6`). **Font Awesome 6 Brands** leads the font stack, though usage counts are close — verify against rendered pages before committing. Geometry mixes sharp corners (2px) with full pills.

## Usage rules

Derived from the measured usage below — each rule cites its evidence.

- Chromatic color carries 40% of measured usage — this palette uses color structurally. Saturated values can hold large surfaces here; timidity would misrepresent the source.
- The theme is light (measured neutral weight 645:375). Don't flip individual sections to the opposite mode.
- `.25rem` is the workhorse radius (x89); treat the other radii as exceptions, not options.
- Shadows stay tight (max 4px blur) — keep elevation subtle if you extend the scale.
- `SFMono-Regular` is the monospace — keep it for code, data, and metadata roles.

## Colors

### Neutrals (light → dark)

| Token         | Value     | Usage | Inferred role                                                           |
| ------------- | --------- | ----- | ----------------------------------------------------------------------- |
| `neutral-50`  | `#ffffff` | 488   | **canvas** — lightest neutral, matches the measured light-leaning theme |
| `neutral-100` | `#eeeeee` | 77    | **surface** — neutral closest to canvas luminance                       |
| `neutral-200` | `#cccccc` | 80    | **hairline** — next neutral near canvas, hairline-border weight         |
| `neutral-300` | `#bbbbbb` | 71    | —                                                                       |
| `neutral-400` | `#aaaaaa` | 13    | —                                                                       |
| `neutral-500` | `#999999` | 8     | —                                                                       |
| `neutral-600` | `#888888` | 14    | —                                                                       |
| `neutral-700` | `#6c757d` | 85    | **text-muted** — most-used mid-luminance neutral                        |
| `neutral-800` | `#666666` | 17    | —                                                                       |
| `neutral-900` | `#495057` | 60    | —                                                                       |
| `neutral-950` | `#343a40` | 80    | **ink** — darkest neutral, highest contrast against canvas              |

### Accents

| Token         | Value     | Usage | Inferred role                             |
| ------------- | --------- | ----- | ----------------------------------------- |
| `pale-cyan`   | `#dee2e6` | 288   | **accent** — most-used chromatic color    |
| `blue`        | `#2c49b6` | 109   | **accent-2** — supporting chromatic color |
| `red`         | `#dc3545` | 51    | **accent-3** — supporting chromatic color |
| `green`       | `#28a745` | 48    | —                                         |
| `yellow`      | `#ffc107` | 30    | —                                         |
| `teal`        | `#17a2b8` | 28    | —                                         |
| `pale-yellow` | `#fff3cd` | 27    | —                                         |
| `pale-red`    | `#f8d7da` | 27    | —                                         |
| `teal-2`      | `#b9e3ea` | 18    | —                                         |
| `cyan`        | `#0d5ca1` | 17    | —                                         |
| `blue-2`      | `#22398d` | 16    | —                                         |
| `yellow-2`    | `#fee7ae` | 16    | —                                         |

## Typography

**Font Awesome 6 Brands** has the most `font-family` declarations, but the margin over the rest is thin — treat the primary-face call as provisional and verify on rendered pages. Full list by usage:

| Family                | Usage |
| --------------------- | ----- |
| Font Awesome 6 Brands | 189   |
| Font Awesome 6 Free   | 134   |
| Roboto                | 61    |
| VideoJS               | 49    |
| Arial                 | 5     |
| helvetica             | 3     |
| bootstrap-icons       | 2     |
| SFMono-Regular        | 2     |

**Size scale (px):** `11.2`, `12`, `12.8`, `14`, `16`, `17.6`, `19.2`, `20`, `22.4`, `24`, `32`, `48`

**Weights in use:** `300` (x15), `400` (x439), `500` (x17), `600` (x3), `700` (x148), `900` (x3)

**Line-heights (unitless):** `1`, `1.1`, `1.15`, `1.2`, `1.5`, `1.67`, `1.7`, `2`

**Letter-spacing values:** `-1000px`, `.4px`, `1px`, `1em`

## Spacing

Most-used values (px): `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `16`, `20`, `24`, `48`

## Border radius

| Token         | Value    | Usage |
| ------------- | -------- | ----- |
| `radius-sm`   | `2px`    | 4     |
| `radius-md`   | `.25rem` | 89    |
| `radius-lg`   | `6px`    | 5     |
| `radius-xl`   | `.5rem`  | 6     |
| `radius-2xl`  | `10px`   | 13    |
| `radius-3xl`  | `1rem`   | 23    |
| `radius-full` | `50%`    | 18    |

## Shadows (ordered by blur radius)

- `shadow-sm` — `0 .125rem .25rem rgb(0 0 0 / .075)` (x4)
- `shadow-md` — `3px 3px 4px #000` (x4)

### Focus rings (spread-only box-shadows, kept out of the elevation scale)

- `0 0 0 .2rem rgb(44 73 182 / .25)` (x13)
- `inset 0 0 0 2px #fff` (x8)
- `inset 0 0 0 2px #343a40` (x8)

## Breakpoints

`420px`, `480px`, `576px`, `670px`, `671px`, `767px`, `768px`, `960px`

## Starter recipes

Tokens composed into components. The source site's real components were **not** inspected — these are starting points built from the extracted values, with contrast ratios computed rather than assumed.

```css
.button-primary {
  background: var(--color-accent); /* #dee2e6 */
  color: var(--color-ink); /* #343a40 — contrast 8.8:1 */
  border-radius: 9999px; /* pill — mined as 50% */
  font-weight: 500;
}

.card {
  background: var(--color-surface); /* #eeeeee */
  border: 1px solid var(--color-hairline); /* #cccccc */
  border-radius: 0.25rem; /* most-used finite radius */
  box-shadow: var(--shadow-sm);
}

.input {
  background: var(--color-canvas); /* #ffffff */
  color: var(--color-ink); /* #343a40 — contrast 11.5:1 */
  border: 1px solid var(--color-hairline); /* #cccccc */
  border-radius: 2px;
  /* placeholder color: var(--color-text-muted) #6c757d */
}

.nav {
  background: var(--color-canvas); /* #ffffff */
  border-bottom: 1px solid var(--color-hairline); /* #cccccc */
  color: var(--color-ink); /* #343a40 */
  /* inactive links: var(--color-text-muted) #6c757d */
  /* active link: var(--color-accent) #dee2e6 — contrast vs canvas 1.3:1 */
}

.modal {
  background: var(--color-surface); /* #eeeeee */
  border-radius: 0.25rem;
  box-shadow: var(--shadow-md); /* largest mined shadow */
}

.modal-backdrop {
  background: color-mix(
    in srgb,
    var(--color-ink) 55%,
    transparent
  ); /* scrim from #343a40 */
}

.input-error {
  border-color: #dc3545; /* mined token: red */
  /* error text: #dc3545 on canvas — contrast 4.5:1 */
}

.input-success {
  border-color: #28a745; /* mined token: green */
}
```

## Observations

- 11 of 23 extracted colors are neutrals.
- 2 distinct shadows; the softest reaches 4px blur.
- 8 breakpoints, from 420px to 960px.
- The site ships a large native token system (120+ custom properties) — prefer those names when extending it.

## Native CSS custom properties

First 40 of 120:

```css
:root {
  --acsb-bg: #181818;
  --acsb-color: #ffffff;
  --acsb-bocolor: #282828;
  --acsb-filtercolor: brightness(0) saturate(100%) invert(100%) sepia(91%)
    saturate(0%) hue-rotate(298deg) brightness(105%) contrast(101%);
  --mb2-htmlscl: 0px;
  --mb2-pb-fsbase: 15px;
  --mb2-pb-textcolor: #4f4c51;
  --mb2-pb-textcolor_lighten: #a6a2a9;
  --mb2-pb-linkcolor: #0083fa;
  --mb2-pb-headingscolor: #242027;
  --mb2-pb-accent1: #005eb8;
  --mb2-pb-accent2: #27323a;
  --mb2-pb-accent3: #faa307;
  --mb2-pb-mhbgcolor: #041336;
  --mb2-pb-tbbgcolor: #1f2a44;
  --mb2-pb-mhbgcolorl: #f0f5f7;
  --mb2-pb-tbbgcolorl: #e6ebed;
  --mb2-pb-headerbgcolor: #001d62;
  --mb2-pb-headerbgcolor2: #204c96;
  --mb2-pb-headerlbgcolor: #f4f7f8;
  --mb2-pb-headerlbgcolor2: #d6e4e5;
  --mb2-pb-color_success: #25a18e;
  --mb2-pb-color_warning: #ff7000;
  --mb2-pb-color_danger: #eb455f;
  --mb2-pb-color_info: #2c49b6;
  --mb2-pb-btn-bgcolor: #005eb8;
  --mb2-pb-btn-primarybgcolor: #005eb8;
  --mb2-pb-btn-btnsecondarycolor: #0069cc;
  --mb2-pb-btn-btninversecolor: #2a373f;
  --mb2-pb-fwlight: 300;
  --mb2-pb-fwnormal: 400;
  --mb2-pb-fwmedium: 500;
  --mb2-pb-fwbold: 700;
  --mb2-acsb_color1: #033860;
  --mb2-acsb_color2: #004ba8;
  --mb2-acsb_color3: #d9ecf2;
  --mb2-pb-spinner: url(https://oase.unud.ac.id/theme/image.php/mb2nl/theme/1791190921/spinner-default);
  --headerh: calc(50px + 40px);
  --mb2-rowtoph: var(--headerh);
  --menuh: 53px;
}
```

## Components

5 UI components were detected and rebuilt from the site's own CSS (see `components.html` for the rendered gallery):

- **Buttons** (3) — `Enter this course`, `Tooltips`, `ADHD`
- **Inputs** (1) — `Search`
- **Cards** (1) — `Card`

Each is a reconstruction: real component classes matched against the extracted stylesheet with custom properties resolved. Hover/focus states are not captured.

## Files

- `tailwind.css` — Tailwind v4 `@theme` block; tokens become utilities (e.g. `bg-neutral-900`, `text-pale-cyan`). Semantic roles alias the base palette; sizes carry line-heights; dark mode included.
- `preview.html` — a visual style-guide of this system: palette cards, type scale, spacing tables, and do/don't guidelines.
- `components.html` — a rendered gallery of the detected UI components, each with a copyable snippet.
- `variables.css` — framework-agnostic `:root` variables with semantic aliases and a `data-theme="dark"` block.
- `tokens.json` — W3C DTCG design tokens: semantic aliases, composite shadow and typography tokens, for Figma plugins, Style Dictionary, etc.
