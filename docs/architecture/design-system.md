# La Villa SB Design System

Source of truth for the La Villa Skateboarding visual identity implementation.
All UI work in `app/frontend` must follow this document.
Reference artwork lives in `reference/docs/imgs/` (originals, never modified) and optimized web derivatives live in `app/frontend/public/brand/`.

## 1. Brand essence

Editorial skate culture: raw, graphic, underground, but executed with technical precision.
One brand, multiple visual expressions.
Black-first surfaces, bone-white typography, fox-orange and blood-red accents.
No generic gradients, no glassmorphism, no rounded-card SaaS look.

## 2. Asset inventory and roles

| Asset (original) | Content | Role |
|---|---|---|
| `graphicLin/ilustraciones/Ilustraciones La Villa/logoOG.png` | LA VILLA wordmark built into a skateboard truck, white on black | PRIMARY LOGO (header, footer, intro) |
| `graphicLin/logo/Dos/logo fuego SI.png` | Fire variant of the truck wordmark | DECORATIVE MARK (moments of emphasis, hover/easter treatments) |
| `graphicLin/logo/Dos/Azul.png` | Blue camo variant of the truck wordmark | DECORATIVE MARK (secondary sections) |
| `.../Sornero-La Villa Logo.png` | White line-art fox head on black | COMPACT MARK (favicon, mobile nav, loading states, admin mark) |
| `.../Sornero zorror.png` | Full-color snarling red fox, "Sornero" script | HERO ART (intro experience, admin login backdrop) |
| `.../lavillasb.png` | Fox skater street scene with graffiti LA VILLA SB lettering | HERO ART (main page hero or featured section) |
| `.../kunst.png` | Raw hand-drawn skater, slime-green LAVILLA lettering | SECTION ART (editorial/community section) |
| `.../lavirgen.png` | La Villa skate shop madonna, tattoo-flash style, blackletter banner | SECTION ART (shop/heritage section) |
| `.../IMG_2890.png` | Die-cut sticker fox skater | UI ACCENT (empty states, badges) |
| `.../IMG_2899.png` | Bubble graffiti LA VILLA sticker on blue halftone | UI ACCENT (promos, category flair) |
| `designLet/macreat.jpeg` | Macreat white script lettering on black | CREDIT MARK (intro supporting line, footer credit) |

Missing files (Zone.Identifier present, image absent): `IMG_1723.png`, `IMG_2896.png`, `La Villa C Vallejo.png`, `Sornero-La Villa Logo Negativo.png`, `Sin títlo-1.png`.
Do not reference them.

Logo hierarchy:

```text
PRIMARY LOGO      logoOG (truck wordmark)
SECONDARY LOGO    truck wordmark variants (fuego, azul)
COMPACT MARK      Sornero fox line-art head
DECORATIVE MARK   stickers (IMG_2890, IMG_2899)
BACKGROUND MARK   oversized low-contrast fox head or truck outline watermark
```

## 3. Color tokens

Derived from the artwork, defined as CSS variables and Tailwind tokens.

| Token | Hex | Source | Use |
|---|---|---|---|
| `villa-black` | `#0A0A0A` | logo backgrounds | primary surface |
| `villa-ink` | `#161311` | lavillasb scene shadows | raised surface |
| `villa-bone` | `#EDE6D6` | fox skater shoes/tee | primary text on dark, light surface |
| `villa-fox` | `#D96830` | fox fur, graffiti lettering | primary accent, CTAs, active states |
| `villa-blood` | `#A81C13` | Sornero fox | danger, sale, aggressive emphasis |
| `villa-maroon` | `#5E2434` | lavillasb wall | section tint, dark alt surface |
| `villa-slime` | `#A8A432` | kunst lettering | rare editorial accent (one section max) |
| `villa-teal` | `#1F7A8C` | lavirgen veil | secondary accent (heritage/shop context) |
| `villa-smoke` | `#8C8577` | concrete tones | muted text, borders |

Rules: black-first layouts, bone for body text, fox-orange as the single dominant accent per view.
Slime and teal appear only inside their assigned sections, never globally.

## 4. Typography

| Layer | Direction | Implementation |
|---|---|---|
| Display | Condensed, heavy, industrial block caps echoing the truck wordmark | `Archivo Black` or `Anton` via `next/font`, uppercase, tight tracking (-0.02em), used for section headlines |
| Editorial serif-punch (optional, sparing) | Blackletter flavor from lavirgen only as graphic image, never as body font | Use artwork, not a blackletter webfont |
| UI text | Neutral grotesque, high legibility | `Archivo` (regular/medium), sentence case |
| Micro-labels | Uppercase, wide tracking (+0.12em), small size, smoke color | `Archivo` medium 11-12px |
| Credit script | Macreat script | Use `designLet/macreat.jpeg` derivative image, never a lookalike font |

Headline hierarchy: display uppercase for h1/h2, UI grotesque for h3 and below.
Numbers in data contexts use tabular figures.

## 5. Layout language

Asymmetric editorial compositions with strong negative space.
Hard edges: border-radius 0 by default, 2px maximum on small controls.
Thin 1px borders in `villa-smoke` at 25% opacity for structure.
Oversized display type is allowed to crop off-canvas deliberately.
Grain/halftone texture overlays are allowed at low opacity on hero surfaces only.
Diagonal section breaks may reference the chain-link diagonal from `lavillasb.png`.

## 6. Motion

Motion supports the brand: film title-card reveals, hard cuts, and masked wipes rather than bouncy easings.
Standard easing `cubic-bezier(0.16, 1, 0.3, 1)`, durations 200-600ms.
Intro experience: black frame, Macreat script credit beat, LA VILLA SB truck wordmark reveal, hard cut into the page.
Respect `prefers-reduced-motion`: replace animated reveals with instant static compositions that still look intentional.
Every animated asset must have a static fallback that renders if the asset fails to load.

## 7. Iconography

Single stroke-based icon set (Lucide already fits the grotesque UI layer) at 1.5px stroke, sized 16/20/24.
Icons inherit `currentColor`.
The fox compact mark is not an icon and never sits inside the icon grid.
Functional icons (cart, search, close) are never replaced by decorative artwork.

## 8. Section personalities (main page)

| Section | Art | Palette shift |
|---|---|---|
| Intro overlay | Macreat script then truck wordmark | pure black |
| Hero | `lavillasb.png` derivative, editorial crop | black + maroon + fox |
| Catalog/product rail | clean product UI, sticker accents | black + bone + fox |
| Community/editorial | `kunst.png` | bone surface + slime accent (inverted section) |
| Heritage/shop | `lavirgen.png` | black + teal + bone |
| Footer | truck wordmark + Macreat credit | pure black |

Admin ("control room"): villa-ink surfaces, compact density, fox-orange status accents, Sornero line-art mark, no illustrations inside data tables.

## 9. Asset pipeline

Originals in `reference/docs/imgs/` are read-only.
Web derivatives are generated into `app/frontend/public/brand/` as resized PNG/WebP pairs via a `sharp` script (`app/frontend/scripts/build-brand-assets.mjs`).
Large scenes (`lavillasb.png` 5.8MB, `Sornero zorror.png` 2.6MB) must ship at most ~1600px longest edge WebP plus a small blur placeholder.
All brand images are served through `next/image`.
