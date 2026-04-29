# Phase 03 — Category Filter UI

## Context Links
- [plan.md](./plan.md)
- Depends on: phase-02

## Overview
- **Priority:** P1
- **Status:** completed
- **Description:** Client component with checkbox per category. Toggling updates parent state. Default: all on.
- **Completion notes:** components/category-filter.tsx implemented with 10 category chips, select/clear-all buttons, live dish counts. Post-review: added aria-label, focus-visible styling, fixed font inheritance issue (M1).

## Key Insights
- State lives in parent (page or wheel container) so wheel reacts to changes
- Use `Set<Category>` for O(1) toggle + filter
- Each chip shows category color + count of dishes in that category

## Requirements
**Functional**
- Render 10 togglable chips/checkboxes
- Default all selected
- "Select all" / "Clear all" buttons
- Disable spin (in Phase 04) when 0 selected → handled in wheel
- Show live count of currently active dishes (e.g. "23 dishes")

**Non-functional**
- Mobile-friendly (wrap, tap targets ≥44px)
- File <150 LOC

## Architecture
```
components/
└── category-filter.tsx
```

Props:
```ts
interface Props {
  selected: Set<Category>;
  onChange: (next: Set<Category>) => void;
  dishCounts: Record<Category, number>;
}
```

State lifted to page-level (or to a wheel container component).

## Related Code Files
**Create**
- `components/category-filter.tsx`

**Modify**
- `app/page.tsx` — placeholder integration (real wiring in phase 04)

## Implementation Steps
1. Create `components/category-filter.tsx`:
   - "use client" directive
   - Render `CATEGORY_LIST.map` → toggle button per category
   - Each button shows label + count (`Vietnamese (8)`)
   - Active state: solid bg with category color, white text
   - Inactive state: outline only
   - "Select all" / "Clear all" actions
2. Compute `dishCounts` once: `DISHES.reduce((acc, d) => { acc[d.category]++; return acc }, ...)` — memoize at module scope or via `useMemo`
3. In `app/page.tsx`, hold `selected` state with `useState<Set<Category>>(new Set(CATEGORY_LIST))`, render filter
4. Show "X dishes selected" counter below filter
5. Verify `pnpm dev` toggles work
6. Commit: `feat: add category filter component`

## Todo List
- [x] Create `category-filter.tsx`
- [x] Memo dish counts per category
- [x] Wire `selected` state in `page.tsx`
- [x] Active/inactive visual states using `CATEGORY_COLORS`
- [x] Select-all / Clear-all
- [x] Test on mobile viewport (DevTools)
- [x] Commit

## Success Criteria
- All 10 categories render with counts
- Click toggles include/exclude
- Select-all / Clear-all work
- Counter reflects filtered total
- Tap targets ≥44px on mobile

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Set re-renders confused (referential equality) | Always create new Set: `new Set(prev)` then mutate |
| Colors clash on inactive chips | Use neutral border for inactive; only fill on active |

## Security Considerations
- N/A

## Next Steps
- Phase 04: Wheel reads filtered dishes
