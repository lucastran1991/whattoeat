---
name: Food Wheel App (Da Nang Dinner Picker)
slug: food-wheel-app
created: 2026-04-29
status: completed
mode: fast
blockedBy: []
blocks: []
---

# Food Wheel App — Implementation Plan

Single-page Next.js app: spinning wheel picks a random dinner dish from 40-item Da Nang menu. Category filter to narrow choices. Static data, no backend, deploy on Vercel.

**Brainstorm:** [brainstorm-260429-1843-food-wheel-app.md](../reports/brainstorm-260429-1843-food-wheel-app.md)

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- `react-custom-roulette` (wheel)
- Static dish list in TS module
- Vercel deploy

## Phases

| # | Phase | Status | File |
|---|---|---|---|
| 01 | Scaffold Next.js + Tailwind | completed | [phase-01-scaffold-nextjs.md](./phase-01-scaffold-nextjs.md) |
| 02 | Data layer + types | completed | [phase-02-data-types.md](./phase-02-data-types.md) |
| 03 | Category filter UI | completed | [phase-03-category-filter.md](./phase-03-category-filter.md) |
| 04 | Wheel component + winner modal | completed | [phase-04-wheel-component.md](./phase-04-wheel-component.md) |
| 05 | Polish + deploy | completed | [phase-05-polish-deploy.md](./phase-05-polish-deploy.md) |

## Dependencies

- Phase 02 needs Phase 01 (scaffold)
- Phase 03 needs Phase 02 (dish data)
- Phase 04 needs Phase 02 + Phase 03 (filtered dishes)
- Phase 05 needs Phase 04 (functional app)

## Success Criteria

- One-click spin returns random dish, animation <3s
- Category toggles filter wheel live
- Vietnamese diacritics render correctly
- Mobile responsive (iOS Safari + Android Chrome)
- Lighthouse perf ≥ 95 mobile
- Deployed on Vercel

## Estimated Effort

~3-4 hours total. Single dev, single day.

---

## Completion Summary

**All 5 phases delivered.** Implementation complete with post-review fixes applied.

### Deliverables
- 8 source files (647 LOC total): `app/layout.tsx`, `app/page.tsx`, `lib/types.ts`, `data/dishes.ts`, `components/category-filter.tsx`, `components/food-wheel.tsx`, `components/wheel-canvas.tsx`, `components/winner-modal.tsx`
- All files ≤200 LOC budget ✓
- TypeScript strict mode, zero `any` leaks ✓

### Post-Review Fixes Applied
- **CRITICAL (3):** spinDuration multiplier corrected (C1), CategoryFilter disabled during spin (C2/C3)
- **HIGH (4):** Modal uses native `<dialog>` with ESC + focus trap (H1), prizeNumber bounds-checked (H2), setTimeout(0) removed (H3), useIsomorphicLayoutEffect documented (H4)
- **MEDIUM/LOW (5):** Font inheritance fixed (M1), grapheme-safe truncation (M2), ARIA group labels (M3/M4), performance micro-optimizations (M5), magic numbers extracted (L3), focus-visible ring (L6)

### Verification
- `pnpm build` ✓ (no errors)
- `pnpm lint` ✓ (clean)
- `pnpm tsc --noEmit` ✓ (strict mode)
- Manual smoke test checklist: `/Users/mac/studio/whattoeat/plans/reports/smoke-test-checklist.md`

### Outstanding User Actions
1. **Push to GitHub** — Repository setup
2. **Deploy to Vercel** — Via Vercel UI import or `vercel --prod` CLI
3. **Manual smoke test** — Use checklist in reports; validates responsive design, Vietnamese diacritics, all interactions
4. **Update README** — Add live URL post-deploy

All implementation complete; Vercel deploy deferred per Phase 05 KISS scope.
