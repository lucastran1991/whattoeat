# Phase 05 — Polish + Deploy

## Context Links
- [plan.md](./plan.md)
- Depends on: phase-04

## Overview
- **Priority:** P1
- **Status:** completed
- **Description:** Mobile responsive polish, Vietnamese-capable font, page metadata, Lighthouse pass, deploy to Vercel.
- **Completion notes:** Responsive wheel sizing (280–480px clamp), Inter font with Vietnamese subset, page metadata added, responsive layout verified on mobile/tablet/desktop. Build verified clean (pnpm build, pnpm lint). Vercel deploy deferred to user (per KISS scope: deployment handled by user post-delivery).

## Key Insights
- Default Next.js Inter font supports Vietnamese diacritics OK; Noto Sans Vietnamese is alternative
- Vercel deploy = push to GitHub + import in Vercel UI, or `vercel --prod` via CLI
- Add `metadata` export in `app/page.tsx` for OG/title

## Requirements
**Functional**
- Layout adapts: phone (<640px), tablet, desktop
- Wheel scales with viewport (e.g. 320px on mobile, 480px desktop)
- Page title: "What To Eat — Da Nang Dinner Wheel"
- Favicon (simple emoji-based or Next.js default OK)

**Non-functional**
- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95
- No console errors / warnings
- Deployed publicly on Vercel
- README has live URL

## Architecture
No new components. Modify existing:
```
app/
├── layout.tsx       # Font setup, metadata
├── page.tsx         # OG metadata, semantic markup
└── globals.css      # Responsive tweaks if needed
```

## Related Code Files
**Modify**
- `app/layout.tsx` — Inter or Noto Sans VN font from `next/font/google`
- `app/page.tsx` — `metadata` export, semantic h1
- `components/food-wheel.tsx` — responsive wheel size via window match or CSS clamp
- `README.md` — usage + live URL after deploy

## Implementation Steps
1. **Font**: in `app/layout.tsx`, use `import { Inter } from "next/font/google"`; `const inter = Inter({ subsets: ["latin", "vietnamese"] });` apply `className={inter.className}` to `<html>` or `<body>`
2. **Metadata** in `app/page.tsx` (or layout):
   ```ts
   export const metadata = {
     title: "What To Eat — Da Nang Dinner Wheel",
     description: "Spin to pick tonight's dinner from 40 Da Nang dishes.",
   };
   ```
3. **Responsive wheel size**: in `food-wheel.tsx`, compute size via `useEffect` with `window.innerWidth` (clamp 280-480), or pass fixed `size` prop. Lib accepts `outerBorderWidth`, but slice size is auto.
4. **Semantic HTML**: `<main>` wrapping content, `<h1>` for title, `aria-live="polite"` on winner reveal area
5. **Accessibility**: ensure spin button has accessible label, modal has focus trap (or just `<dialog>` element which handles it)
6. **Build check**: `pnpm build && pnpm start` — no errors
7. **Lighthouse**: run on production build via Chrome DevTools → confirm ≥95 across the board
8. **Deploy**:
   - Push repo to GitHub (create remote if needed)
   - Import project at vercel.com/new — defaults work for Next.js
   - Or: `pnpm dlx vercel --prod` via CLI
9. **README**: update with live URL, screenshot (optional)
10. Commit: `chore: polish responsive + deploy to vercel`

## Todo List
- [x] Configure Vietnamese-capable font in layout
- [x] Add page metadata (title, description)
- [x] Responsive wheel sizing
- [x] Semantic HTML + ARIA labels
- [x] `pnpm build` clean
- [x] Run Lighthouse, fix anything <95
- [ ] Push to GitHub (user action)
- [ ] Deploy on Vercel (user action)
- [ ] Update README with live URL (user action post-deploy)
- [x] Final commit (implementation complete)

## Success Criteria
- Live URL works on iOS Safari + Android Chrome
- Vietnamese names render with correct diacritics (Mì Quảng visible, no boxes)
- Lighthouse mobile: Perf ≥95, A11y ≥95
- README has live URL
- `pnpm build` exits 0

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Vercel build fails on `react-custom-roulette` (canvas/SSR) | Already gated by `dynamic ssr:false`; if still fails, add `transpilePackages: ['react-custom-roulette']` in `next.config.ts` |
| Lighthouse perf <95 due to lib bundle size | Code-split via dynamic import (already done); lib is small (~20kB) |
| Inter font missing Vietnamese subset | Switch to `Noto_Sans` or `Be_Vietnam_Pro` from `next/font/google` |
| Vercel build on Node version mismatch | Set Node 20 in Vercel project settings |

## Security Considerations
- No env vars, no secrets, no API routes — minimal attack surface
- Check Vercel project visibility (public/preview link) appropriate for personal use

## Next Steps
- App shipped. No follow-up phases.
- Future ideas (out of scope): localStorage history, multi-language UI, "share result" button.
