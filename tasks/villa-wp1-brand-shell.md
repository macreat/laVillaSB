# WP1: Brand shell (logo components + intro experience)

Repo: laVillaSB monorepo, work only in `app/frontend`.
Read `docs/architecture/design-system.md` FIRST; it is the visual source of truth.
Foundation already landed: villa Tailwind tokens, Anton/Archivo via next/font, optimized assets in `public/brand/`, manifest at `src/lib/brand-manifest.json` (keys: wordmark, wordmarkFire, wordmarkCamo, foxMark, foxSornero, villaScene, kunst, lavirgen, stickerFox, stickerBubble, macreatScript; each `{src, width, height, blurDataURL?}`).

## Spec

### 1. Brand mark components

Create `src/components/brand/BrandWordmark.tsx` and `src/components/brand/FoxMark.tsx`.
Client-safe, thin wrappers over `next/image` using the manifest (import JSON, `resolveJsonModule` is on).
`BrandWordmark`: props `variant?: 'default' | 'fire' | 'camo'` (default renders `wordmark`), `width` (number, height auto from aspect), `priority?`, `className?`.
`FoxMark`: props `size` (rendered height), `className?`.
Alt text: "La Villa Skateboarding" for the wordmark, "La Villa fox mark" for the fox.
Also create `src/components/brand/MacreatScript.tsx` for the `macreatScript` asset, alt "Macreat".

### 2. Replace every placeholder "LV" styled-div logo

Sites: `src/components/store/StoreHeader.tsx`, `src/components/store/StoreFooter.tsx`, `src/components/layout/Sidebar.tsx` (admin), `src/app/(auth)/login/page.tsx`.
Header: `BrandWordmark` at ~120px wide, links to `/`.
Footer: `BrandWordmark` ~150px plus a small `MacreatScript` (~90px wide) credit row reading area labeled "Developed by Macreat" (aria-label on the link/figure, no visible extra text).
Admin sidebar: `FoxMark` size 28 next to the existing "Admin" label styling.
Login: `FoxMark` size 48 centered above the form.

### 3. Intro experience (brand title sequence)

Create `src/components/brand/IntroOverlay.tsx`, mounted only in `src/app/(store)/layout.tsx` (never in admin).
Behavior:
- Full-screen fixed overlay on `villa-black`, z-index above the header.
- Sequence (total ~2.6s): beat 1 (0-0.9s) `MacreatScript` small, centered, fades in with a supporting micro-label "PERFORMANCE / DEVELOPED / MAINTAINED" in Archivo uppercase tracking-[0.2em] text-villa-smoke text-xs; beat 2 (0.9-2.2s) hard cut to `BrandWordmark` large (min(70vw, 560px)) with a masked wipe reveal (clip-path inset animation) and the words "LA VILLA SB" in font-display below it; beat 3 fade the whole overlay out (0.4s) and unmount.
- CSS keyframes only, easing `cubic-bezier(0.16,1,0.3,1)`. No animation library.
- Shows once per browser session: guard with `sessionStorage['lavilla_intro_seen']`; render nothing on subsequent navigations.
- `prefers-reduced-motion: reduce`: skip all animation, show the final wordmark frame for 1.2s statically, then unmount instantly.
- Accessibility: `role="dialog"` `aria-label="La Villa Skateboarding intro"`, a visible "Skip" button (top-right, btn-secondary, focusable, Escape key also skips), focus returns to document after unmount, page content stays in the DOM underneath (no layout shift).
- A "skip" click or Escape immediately unmounts and sets the session flag.
- SSR-safe: the overlay must not flash on hydration (initialize hidden, decide in an effect).
- Optional enhancement hook: if `/brand/intro-loop.webm` exists it may be used as a muted, `playsInline`, decorative background video for beat 2 with `onError` fallback to the static treatment; implement the fallback path first and treat the video as progressive enhancement (do not fail or wait on it).

### 4. Metadata polish

In `src/app/layout.tsx` metadata: add `metadataBase` from `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`), `openGraph` with title/description and `/brand/villa-scene.webp` as image.
Do not restructure the file otherwise.

## Constraints

- TypeScript strict, match existing code style (clsx, forwardRef where the neighbors use it).
- English-only UI copy and comments.
- Do not touch admin pages, store page sections, api client, auth, or cart logic.
- Keep changes reviewable: aim under 400 changed lines.

## Verify (must pass before you finish)

```
cd app/frontend
npm run typecheck
npm run lint
npm run test
npm run build
```

Add vitest coverage for IntroOverlay session-gating logic (extract the gating decision into a pure helper, e.g. `src/lib/intro-gate.ts`, and unit-test that; do not add jsdom).
Commit in small conventional-commit steps (`feat(frontend): ...`); never add a co-author line.
