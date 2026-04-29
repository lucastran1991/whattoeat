# Brainstorm: Food Wheel App (Da Nang Dinner Picker)

**Date:** 2026-04-29
**Status:** Design approved, ready for /plan

## Problem

Decide what to eat for dinner in Da Nang from a 40-item curated list spanning 10 cuisines (vietnamese, seafood, street_food, indian, thai, lao, japanese, italian, western, mexican). Need a fun, low-friction picker that beats analysis paralysis.

## Requirements

**Functional**
- Display spinning wheel with dishes as slices
- Filter by cuisine category (toggle on/off) before spin
- Click "Spin" → wheel rotates → lands on a dish → show winner
- Pure random selection every spin
- Render Vietnamese diacritics correctly (Mì Quảng, Bún bò Huế, etc.)

**Non-functional**
- Static site, no backend, no DB
- Mobile-friendly (likely used on phone before dinner)
- Deploy on Vercel free tier
- Sub-200 LOC per file

## Approaches Evaluated

| Aspect | Chosen | Alternatives | Why chosen |
|---|---|---|---|
| Wheel viz | Spinning wheel (pie slices) | Slot reel, simple reveal | Most fun for "what to eat" use case |
| Wheel impl | `react-custom-roulette` | Custom SVG/Canvas, `spin-wheel` lib | Fast, maintained, ~10kB, handles physics |
| Filter | Category checkboxes | No filter | 40 slices unreadable; mood-based filtering useful |
| Data | Static TS/JSON | localStorage editable, DB | YAGNI — list rarely changes |
| Style | Tailwind CSS | shadcn/ui, CSS modules | Default Next.js DX, no over-engineering |
| Deploy | Vercel | Cloudflare Pages, local only | Native Next.js host, zero config |
| History | None | Track last N, history list | KISS — re-spin is one click |

## Final Solution

**Stack**
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- `react-custom-roulette` for wheel
- Static dish list in `src/data/dishes.ts`
- Deploy: Vercel

**Architecture (single page)**
```
src/
├── app/
│   ├── layout.tsx         # Root layout, font (Inter + Vietnamese support)
│   ├── page.tsx           # Main page (server component shell)
│   └── globals.css        # Tailwind base
├── components/
│   ├── food-wheel.tsx     # Client: wheel + spin button + winner modal
│   └── category-filter.tsx # Client: checkboxes per category
├── data/
│   └── dishes.ts          # Typed dish list (40 items)
└── lib/
    └── types.ts           # Dish, Category types
```

**Data flow**
1. `page.tsx` imports `dishes.ts` (static)
2. `food-wheel.tsx` holds state: selected categories (default all on), spinning flag, winner
3. Filtered dishes derived: `dishes.filter(d => selectedCategories.has(d.category))`
4. Spin → random index → `react-custom-roulette` animates → onStop → show winner
5. Disabled spin if filter result < 2 dishes (graceful edge case)

**Color palette per category** (10 categories → distinct hues, accessible contrast)

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Wheel cluttered with 40 slices | Category filter naturally reduces; also shorten long names with tooltip |
| Vietnamese diacritics break in slice labels | Test with Inter / Noto Sans Vietnamese; canvas font config in roulette lib |
| `react-custom-roulette` unmaintained | Acceptable — small lib, easy to fork/replace; fallback custom SVG is doable |
| Mobile small wheel illegible | Truncate label to ~12 chars on slice, full name in winner modal |

## Success Criteria

- One-click spin produces a random dish in <3s animation
- Filter toggling updates wheel without page reload
- Works on iOS Safari + Android Chrome
- Lighthouse perf ≥ 95 on mobile
- Total code <500 LOC (excl. data file)

## Next Steps

1. Run `/plan` to break into phases (scaffold → data + types → filter UI → wheel integration → polish + deploy)
2. Single-day build (~3-4 hours)

## Unresolved Questions

- None — design fully scoped.
