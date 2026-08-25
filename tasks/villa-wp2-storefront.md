# WP2: Storefront page compositions

Repo: laVillaSB monorepo, work only in `app/frontend`.
Read `docs/architecture/design-system.md` FIRST (palette, typography, section personalities, motion rules).
Depends on WP1 (brand components in `src/components/brand/` exist).
Brand assets: `src/lib/brand-manifest.json` keys villaScene, kunst, lavirgen, stickerFox, stickerBubble, foxSornero (each `{src, width, height, blurDataURL?}`), files under `public/brand/`.

## Spec

Rework `src/app/(store)/page.tsx` into deliberate editorial sections.
One brand, multiple expressions: each section gets its own composition; never reuse the same artwork twice.

### 1. Hero (villaScene)

Asymmetric two-zone composition on `villa-black` with a `villa-maroon` tinted panel.
`villaScene` via `next/image` (blurDataURL placeholder, `priority`), cropped editorially (object-cover, allow off-canvas crop on mobile).
Oversized display headline in font-display uppercase ("THE DARKER SIDE" stays as the message, typographic treatment per spec: tight tracking, allowed to butt against the image edge).
One primary CTA to `/products` (btn-primary), one text link to a category.
Micro-label row (Archivo uppercase tracking-[0.12em] text-villa-smoke): "EST. LA VILLA / SKATE / COLOMBIA".
Subtle motion: single CSS reveal on load (translate+fade, 500ms, `cubic-bezier(0.16,1,0.3,1)`), disabled under `prefers-reduced-motion`.

### 2. Featured products rail

Keep the existing data flow (fetchStoreProducts, slice 6) and loading/error handling exactly as is.
Restyle: section header as display uppercase with a 1px `villa-smoke/25` rule, product grid unchanged structurally, add `stickerFox` as a small rotated (-6deg) decorative accent next to the section title (`aria-hidden`, ~56px).

### 3. Category tiles

Keep the 4 tiles and their links.
Restyle as hard-edged tiles with uppercase display labels and a fox-orange hover underline treatment (like category-subtabs), no rounded corners, no glassmorphism.

### 4. Community / editorial section (kunst)

New section, inverted palette: `villa-bone` background, `villa-black` text, `villa-slime` accents (ONLY here).
`kunst` artwork right-aligned ~40% width (blur placeholder, lazy), headline in display uppercase, 2-3 sentences of brand copy (write confident, non-cheesy skate-culture copy in English), link to `/products?category=apparel`.
Diagonal top edge on this section (clip-path polygon) echoing the chain-link diagonal of the hero art.

### 5. Heritage / shop section (lavirgen)

Dark section: `villa-black` with `villa-teal` accents (ONLY here).
`lavirgen` artwork left ~30% width, copy about the shop ("La Villa skate shop" heritage), link to `/products`.
Micro-label "LA VILLA SKATE SHOP" in teal.

### 6. Social/footer strip fixes

The fake social `<span>` elements on the home page and in `StoreFooter.tsx` are non-interactive frauds: convert them to real `<a>` elements with `href` from env-driven constants in a new `src/lib/site-links.ts` (`NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_WHATSAPP_URL`, fallback `#` and `rel="noopener noreferrer"`, `aria-label`s).
Use the same constants for the WhatsApp CTAs in `src/app/(store)/products/[id]/page.tsx` and `src/app/(store)/cart/page.tsx` (they currently hardcode `https://wa.me/` with NO number; preserve the existing message-building logic, just source the base URL from site-links).
Add the newsletter form input an accessible label and keep it non-submitting but honest: disable the button with title "Coming soon" or wire `mailto:`; pick the disabled treatment.

## Constraints

- Preserve ALL data fetching, states, and routing behavior; this is a visual/composition package plus the link honesty fixes above.
- All images through `next/image` with manifest dimensions.
- Mobile: every section must be an intentional mobile composition (stack order chosen deliberately, hero art cropped, min tap targets 44px); do not just shrink.
- Semantic HTML (`section`, headings in order), alt text for meaningful art, `aria-hidden` for decorative stickers.
- English-only UI copy. Match existing code style. No new dependencies.
- Aim under 500 changed lines.

## Verify (must pass)

```
cd app/frontend
npm run typecheck && npm run lint && npm run test && npm run build
```

Commit in small conventional-commit steps; never add a co-author line.
