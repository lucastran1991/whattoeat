# Phase 02 — Data Layer + Types

## Context Links
- [plan.md](./plan.md)
- Depends on: phase-01

## Overview
- **Priority:** P0
- **Status:** completed
- **Description:** Define `Dish` + `Category` types and the static dish list (40 items) in typed TS module.
- **Completion notes:** lib/types.ts and data/dishes.ts created with all 40 dishes, UTF-8 Vietnamese diacritics verified, TypeScript compilation clean.

## Key Insights
- All names are Vietnamese diacritic strings or English — UTF-8 file required
- 10 categories: vietnamese, seafood, street_food, indian, thai, lao, japanese, italian, western, mexican
- `Category` as union type for autocompletion + per-category color mapping later

## Requirements
**Functional**
- Single source of truth for dishes
- Type-safe `category` field (no typos)
- Easy to add/remove dishes via single file edit

**Non-functional**
- File <200 LOC
- No runtime cost (static import, tree-shakable)

## Architecture
```
lib/
└── types.ts        # Dish, Category, CATEGORY_LIST, CATEGORY_LABELS, CATEGORY_COLORS
data/
└── dishes.ts       # DISHES: Dish[]
```

## Related Code Files
**Create**
- `lib/types.ts` — type defs + category metadata (label + hex color per category)
- `data/dishes.ts` — exports `DISHES: Dish[]` with all 40 entries from brainstorm

## Implementation Steps
1. Create `lib/types.ts`:
   ```ts
   export type Category =
     | "vietnamese" | "seafood" | "street_food"
     | "indian" | "thai" | "lao" | "japanese"
     | "italian" | "western" | "mexican";

   export interface Dish {
     name: string;
     category: Category;
   }

   export const CATEGORY_LIST: Category[] = [...];

   export const CATEGORY_LABELS: Record<Category, string> = {
     vietnamese: "Vietnamese",
     street_food: "Street Food",
     // ...
   };

   export const CATEGORY_COLORS: Record<Category, string> = {
     vietnamese: "#ef4444",   // red-500
     seafood: "#0ea5e9",      // sky-500
     // ... 10 distinct hues, AA contrast against white text
   };
   ```
2. Create `data/dishes.ts`:
   ```ts
   import type { Dish } from "@/lib/types";
   export const DISHES: Dish[] = [
     { name: "Mì Quảng", category: "vietnamese" },
     // ... all 40 from brainstorm args
   ];
   ```
3. Verify TS compile: `pnpm tsc --noEmit`
4. Commit: `feat: add dish data and types`

## Todo List
- [x] Create `lib/types.ts`
- [x] Create `data/dishes.ts` with all 40 dishes
- [x] Pick 10 distinct accessible hex colors per category
- [x] Verify `pnpm tsc --noEmit` passes
- [x] Commit

## Success Criteria
- `DISHES.length === 40`
- All `dish.category` values members of `Category` union
- `CATEGORY_COLORS` defined for all 10 categories
- TypeScript compiles clean

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Wrong UTF-8 encoding mangles diacritics | Confirm file saves as UTF-8; visually check `Mì Quảng` in editor |
| Color contrast fails on wheel slices | Test with white slice text; pick mid-tone colors (500-600 range) |

## Security Considerations
- N/A (static data, no user input)

## Next Steps
- Phase 03: Filter UI consumes `DISHES` + `CATEGORY_LIST`
