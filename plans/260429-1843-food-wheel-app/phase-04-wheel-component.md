# Phase 04 — Wheel Component + Winner Modal

## Context Links
- [plan.md](./plan.md)
- Depends on: phase-02, phase-03

## Overview
- **Priority:** P0 (the core feature)
- **Status:** completed
- **Description:** Spinning wheel using `react-custom-roulette`. Filtered dishes → wheel slices. Spin button → animation → winner modal.
- **Completion notes:** food-wheel.tsx, wheel-canvas.tsx, winner-modal.tsx implemented. Post-review fixes applied: spinDuration 0.4→1.0 (C1), disabled CategoryFilter during spin (C2/C3), modal uses <dialog> with ESC+focus trap (H1), prizeNumber clamped (H2), setTimeout(0) removed (H3), font inheritance fixed (M1), grapheme-safe truncation (M2), magic numbers extracted (L3), focus-visible ring added (L6).

## Key Insights
- `react-custom-roulette` requires `data: { option: string, style?: { backgroundColor, textColor } }[]`
- Pre-compute `prizeNumber` (winning index) BEFORE setting `mustStartSpinning=true` — the lib uses this to drive animation
- `onStopSpinning` callback fires when animation ends — use to open modal
- Library is client-only — needs `dynamic(import, { ssr: false })` to avoid SSR errors with `window`/`canvas`

## Requirements
**Functional**
- Wheel renders slice per filtered dish, colored by category
- Click "Spin" → randomly pick winner index → trigger spin
- During spin: button disabled, show "Spinning..."
- On stop: open modal with winner name + category + "Spin again" button
- If filtered dishes < 2: disable spin, show hint "Select at least 2 categories"

**Non-functional**
- Wheel sized responsively (smaller on mobile)
- Long dish names truncated on slice (full in modal)
- Animation 4-6 seconds

## Architecture
```
components/
├── food-wheel.tsx       # Container: state, derived data, spin logic
├── wheel-canvas.tsx     # Wraps Wheel from react-custom-roulette (dynamic import)
└── winner-modal.tsx     # Modal showing winner
```

Split because `food-wheel.tsx` becomes parent containing filter + wheel + modal.

## Related Code Files
**Create**
- `components/food-wheel.tsx` (container, ~120 LOC)
- `components/wheel-canvas.tsx` (~80 LOC, wraps lib)
- `components/winner-modal.tsx` (~60 LOC)

**Modify**
- `app/page.tsx` — render `<FoodWheel />`, move state in here
- `lib/types.ts` — add helper `truncate(name: string, max: number): string` if needed (or inline)

## Implementation Steps
1. Move `selected` filter state from `page.tsx` into `food-wheel.tsx` (or keep at page; either works)
2. Create `wheel-canvas.tsx`:
   - "use client"
   - `import dynamic from "next/dynamic"` then `const Wheel = dynamic(() => import("react-custom-roulette").then(m => m.Wheel), { ssr: false })`
   - Props: `data`, `prizeNumber`, `mustStartSpinning`, `onStopSpinning`
   - Pass through; render `<Wheel ... outerBorderColor textColors backgroundColors />`
3. Create `food-wheel.tsx`:
   - Hold `selected` Set, `mustSpin: boolean`, `prizeNumber: number`, `winner: Dish | null`
   - Derive `filtered = useMemo(() => DISHES.filter(d => selected.has(d.category)), [selected])`
   - Derive `wheelData` from filtered: `{ option: truncate(dish.name, 14), style: { backgroundColor: CATEGORY_COLORS[dish.category], textColor: "#fff" } }`
   - `handleSpin()`:
     ```ts
     if (mustSpin || filtered.length < 2) return;
     const idx = Math.floor(Math.random() * filtered.length);
     setPrizeNumber(idx);
     setMustSpin(true);
     ```
   - `handleStop()`: `setMustSpin(false); setWinner(filtered[prizeNumber]);`
   - Render: `<CategoryFilter />`, `<WheelCanvas />`, spin button, `<WinnerModal />`
4. Create `winner-modal.tsx`:
   - Plain `<dialog>` element or fixed div + backdrop (KISS, no Radix needed)
   - Show: dish name (large), category label as chip, "Spin again" + "Close" buttons
   - "Spin again" closes modal then triggers spin
5. Update `app/page.tsx`:
   - "use client" not needed at top level — page renders `<FoodWheel />` (client component)
   - Title + brief explainer + `<FoodWheel />`
6. Edge case: when filter shrinks while modal open, modal stays — fine. When `filtered.length < 2`, disable spin button + tooltip.
7. Test: spin 5+ times, toggle filters, ensure no jank
8. Commit: `feat: implement food wheel with winner modal`

## Todo List
- [x] Dynamic import wrapper `wheel-canvas.tsx`
- [x] Container `food-wheel.tsx` with state machine
- [x] Winner modal
- [x] Integrate filter into container
- [x] Disable spin when <2 dishes
- [x] Truncate long names on slices
- [x] Test full flow in dev
- [x] Commit (with all post-review critical/high fixes applied)

## Success Criteria
- Wheel spins on click, lands on slice, opens modal with that dish
- Toggling filter immediately updates wheel
- No SSR hydration errors (`dynamic` with `ssr: false`)
- Winner is unbiased (uniform random over filtered)
- Modal closes via button + backdrop tap

## Risk Assessment
| Risk | Mitigation |
|---|---|
| `react-custom-roulette` SSR error (window undefined) | `dynamic({ ssr: false })` wrapper |
| Long Vietnamese names (e.g. "Bánh tráng cuốn thịt heo") cramp slices | Truncate to 14 chars + ellipsis; full name in modal |
| Wheel doesn't re-render on filter change (lib caches data) | Pass `key={filtered.length}` to force remount if needed |
| Random index off-by-one (lib expects 0-based) | Verify with `filtered.length - 1` upper bound — `Math.floor(Math.random() * filtered.length)` is correct |
| Multiple rapid clicks start spin during spin | Guard: `if (mustSpin) return` in handler |

## Security Considerations
- All client-side, no user input persistence — no XSS surface
- No external network calls

## Next Steps
- Phase 05: responsive polish, font, deploy
