# Code Review — Food Wheel App (Pre-Deploy + Adversarial)

**Date:** 2026-04-29
**Reviewer:** code-reviewer
**Plan:** /Users/mac/studio/whattoeat/plans/260429-1843-food-wheel-app/
**Brainstorm:** /Users/mac/studio/whattoeat/plans/reports/brainstorm-260429-1843-food-wheel-app.md
**Scope:** 8 source files / 647 LOC total / static SPA, no backend

---

## Scope

| File | LOC |
|---|---|
| app/layout.tsx | 26 |
| app/page.tsx | 28 |
| lib/types.ts | 61 |
| data/dishes.ts | 65 |
| components/category-filter.tsx | 104 |
| components/food-wheel.tsx | 196 |
| components/wheel-canvas.tsx | 67 |
| components/winner-modal.tsx | 100 |

All files within 200-LOC budget. Largest is `food-wheel.tsx` at 196 — at the ceiling but justified (single owner of all wheel state).

---

## Overall Assessment

Solid, idiomatic Next.js 16 / React 19 implementation. Architecture is clean (server shell → client island), state ownership is centralized, types are strict with no `any` leaks, accessibility is above baseline. Two correctness bugs and one library-misuse bug stand between this and ship-ready. Adversarial paths (filter-shrinks-mid-spin, modal stale-closure) need guards.

---

## Scores

| Category | Score | Notes |
|---|---|---|
| Correctness | 6/10 | Stale-closure on stop, prizeNumber-stale-after-shrink, spinDuration misuse |
| TypeScript / Strict | 9/10 | Clean. One implicit `any` via reduce accumulator cast |
| React patterns | 7/10 | wheelKey rebuild on every filter toggle is heavy-handed; useMemo deps OK |
| Accessibility | 6/10 | Modal lacks focus trap + ESC close; live region good; chips OK |
| Performance | 8/10 | Bundle slim; resize debounced; minor: wheelKey forces lib remount |
| Maintainability | 9/10 | <200 LOC files, kebab-case names, clear comments, no dead code |
| Security | 9/10 | Static SPA, no inputs, no eval, no secrets — minimal surface |

**Overall: 7.5/10** — ship-blocking issues are surgical, not architectural.

---

## CRITICAL (blocking)

### C1. `spinDuration={0.4}` is a multiplier, not seconds — spin is too fast

**File:** `components/wheel-canvas.tsx:63`
```ts
// Spin duration: ~4 s feels snappy without being too slow
spinDuration={0.4}
```

**Problem:** Per upstream docs ([effectussoftware/react-custom-roulette](https://github.com/effectussoftware/react-custom-roulette)), `spinDuration` is a **coefficient on the default duration** (default `1.0`, range `[0.01..]`). `0.4` means 40% of default — roughly ~1.6 s, not "~4 s" as the comment claims. The comment is wrong; the spin will feel jarring/abrupt vs. the brainstorm success criterion ("animation <3 s" implies a real animation, not a snap).

**Fix:** Use `1.0` (default) or `0.8` for slightly snappier. Update the comment.

**Severity:** CRITICAL — breaks UX intent and contradicts code comment.

---

### C2. `handleStop` reads stale `filtered` via closure if filter changed mid-spin

**File:** `components/food-wheel.tsx:109-112`
```ts
function handleStop(): void {
  setMustSpin(false);
  setWinner(filtered[prizeNumber]);
}
```

**Problem:** If the user toggles a category while the wheel is mid-spin, three bad things compound:
1. `filtered` re-derives → new array, possibly shorter than `prizeNumber`.
2. `wheelKey = filtered.map(d => d.name).join("|")` changes → `<WheelCanvas key={wheelKey}>` **unmounts** the spinning Wheel and remounts with new data. The animation aborts. `onStopSpinning` may or may not fire (lib-dependent).
3. If it does fire, `filtered[prizeNumber]` reads from the **new** filtered array, indexing into a different dish than the one the wheel visually landed on (or `undefined` if shrunk past `prizeNumber`).

`setWinner(undefined)` would crash `WinnerModal` because the prop is typed `Dish | null`, not `Dish | undefined`. `WinnerModal` checks `!dish` so the `undefined` path silently shows nothing — but TS strict mode means the type lie propagates.

**Fix options (pick one):**
- Disable `CategoryFilter` while `mustSpin === true` (preferred — KISS).
- Snapshot `filtered` into a ref at spin-start and read from the ref in `handleStop`.

**Severity:** CRITICAL — adversarial path explicitly called out in scope, currently broken.

---

### C3. `wheelKey` rebuild on every filter change can mid-spin remount the Wheel

**File:** `components/food-wheel.tsx:96-97`
```ts
const wheelKey = filtered.map((d) => d.name).join("|");
```

**Problem:** Comment says it forces remount "when filtered list changes so the lib re-initialises." That's correct, but there is no guard for mid-spin. If the user changes the filter while the wheel is spinning, the Wheel unmounts mid-animation. Combined with C2, this leaves dangling state (`mustSpin = true` is never cleared by `onStopSpinning`).

**Fix:** Either gate the filter UI during spin (recommended), or freeze `wheelKey` while `mustSpin` is true (e.g., `useRef` cached key reset after `handleStop`).

**Severity:** CRITICAL — paired with C2.

---

## HIGH

### H1. Modal: no focus trap, no ESC-to-close, no initial focus

**File:** `components/winner-modal.tsx`

**Problem:**
- `role="dialog"` + `aria-modal="true"` declared, but actual focus management is missing. Tab can escape to underlying content (Spin button, filter chips).
- ESC key does not close. Standard expectation for any `aria-modal="true"` dialog.
- No element receives focus on open → keyboard users land at body start.
- No focus return to the Spin button on close.

**Fix:** Either adopt the native `<dialog>` element (handles ESC, focus, backdrop semantics for free) or implement a small focus-trap (focus first button on open, listen for `keydown Escape`, restore focus on close).

**Severity:** HIGH — declared accessibility contract not met.

---

### H2. `prizeNumber` not bounds-checked when filter shrinks before next spin

**File:** `components/food-wheel.tsx:101-107`
```ts
function handleSpin(): void {
  if (mustSpin || filtered.length < 2) return;
  const idx = Math.floor(Math.random() * filtered.length);
  setPrizeNumber(idx);
  setMustSpin(true);
}
```

**Problem:** `handleSpin` is fine here — it always recomputes `idx` against current `filtered.length`. **However**, `prizeNumber` state retains the previous value across renders. When `<WheelCanvas>` is rendered after a filter shrink (no spin in between) with `prizeNumber > filtered.length - 1`, `react-custom-roulette` requires `0 <= prizeNumber <= data.length - 1` — out-of-range can blank/throw on spin (per upstream contract, [GitHub effectussoftware/react-custom-roulette](https://github.com/effectussoftware/react-custom-roulette)). Currently masked because the `key={wheelKey}` remount + the next spin re-sets `prizeNumber` first, but the order is fragile.

**Fix:** In the `useMemo` for `filtered`, also clamp `prizeNumber`:
```ts
useEffect(() => {
  if (prizeNumber >= filtered.length) setPrizeNumber(0);
}, [filtered.length, prizeNumber]);
```

**Severity:** HIGH — defensive correctness; current masking is incidental.

---

### H3. `handleSpinAgain` race: `setTimeout(0)` is fragile

**File:** `components/food-wheel.tsx:118-122`
```ts
function handleSpinAgain(): void {
  setTimeout(handleSpin, 0);
}
```

Combined with `WinnerModal.handleSpinAgain` which calls `onSpinAgain()` then `onClose()`:

```ts
// winner-modal.tsx
function handleSpinAgain(): void {
  onSpinAgain();   // schedules setTimeout → handleSpin
  onClose();       // setWinner(null) — synchronous
}
```

**Problem:** Order is: `setTimeout(handleSpin, 0)` queued → `setWinner(null)` runs → React commits → microtask runs → `handleSpin` fires. Works in practice, but couples flow to event-loop ordering across two components. Comment in `food-wheel.tsx` admits the smell ("avoids stale prizeNumber"). The actual stale issue is solved by React's natural state-batching; the `setTimeout` is cargo-culted.

**Fix:** Just `handleSpin()` directly — `setWinner(null)` and `setMustSpin(true)` will batch in React 19. Drop the setTimeout.

**Severity:** HIGH — fragile race that will bite in concurrent-mode features (transitions, `useTransition`).

---

### H4. SSR / hydration: `useIsomorphicLayoutEffect` selection is per-module-load, not per-render

**File:** `components/food-wheel.tsx:18-19`
```ts
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

**Problem:** This pattern works but evaluates `typeof window` **once at module load**. In a Next.js server component → client hydration flow, the module loads on the server (`useEffect` selected), then ships to the client where `window` exists but the import already chose `useEffect`. Net effect: you always get `useEffect` on the client, never `useLayoutEffect` — defeating the comment's stated intent ("syncs before first paint without flash").

**Verification:** Module-level `typeof window` in a "use client" file evaluates in both environments (server bundle and client bundle). Server bundle picks `useEffect`. Client bundle picks `useLayoutEffect`. So actually this works **per bundle**, not per render. OK — but it is brittle if anyone moves logic into the component body. Add a code comment to that effect, and the warning the comment cites is from `useLayoutEffect` running during SSR rendering, which doesn't happen here because the wrapper resolves at bundle build time.

Net: the pattern works but the comment is mis-explaining why. Worth clarifying.

**Severity:** HIGH (documentation/maintainability, not runtime).

---

## MEDIUM

### M1. `next/font` warning — comment in `wheel-canvas.tsx` mentions Geist but layout uses Inter

**File:** `app/globals.css:11-12` references `--font-geist-sans` / `--font-geist-mono` but `app/layout.tsx` loads only Inter. The CSS vars are dangling (unused). Tailwind may resolve `font-sans` to Arial fallback rather than Inter because `--color-background` etc. are remapped but `--font-sans: var(--font-geist-sans)` resolves to nothing.

**Fix:** Either remove the Geist vars from `globals.css` or wire Inter to `--font-sans` via `Inter({ variable: "--font-inter" })` and update the @theme inline block. Currently the `body` rule (`font-family: Arial, Helvetica, sans-serif`) **overrides** the `inter.className`, so the page may render in Arial despite loading Inter.

**Severity:** MEDIUM — Vietnamese diacritics still render (Arial supports them), but you're paying the ~30 KB Inter download for nothing. Visual regression vs. design intent.

---

### M2. Truncation can cut a Vietnamese diacritic mid-grapheme cluster

**File:** `components/food-wheel.tsx:23-25`
```ts
function truncate(name: string, max: number): string {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}
```

**Problem:** `String.prototype.slice` operates on UTF-16 code units. Vietnamese stacked diacritics (e.g., "ặ" can be NFD-decomposed into 'a' + '̣' + '̆') would split between base char and combining mark, producing visual artifacts. NFC strings (most likely your data) are mostly safe because each precomposed char is one BMP code unit, but "Bún bò Huế" → 10 chars vs. 14 limit, no clip. "Bánh tráng cuốn thịt heo" → 24 chars, clipped at 13 + "…". Verify the actual clip points produce valid display.

Quick sanity: at `max=14`, "Bánh tráng cuốn thịt heo".slice(0,13) = "Bánh tráng cu" — fine.

**Fix:** Use `Intl.Segmenter` or just `Array.from(name).slice(0, max - 1).join("") + "…"` to be NFD-safe.

**Severity:** MEDIUM — current data is NFC, hidden bug for future entries.

---

### M3. `CategoryFilter` lacks `aria-label` on chip group

`<div className="flex flex-wrap gap-2">` containing the chips has no role/label. Screen reader users hear 10 unlabeled toggle buttons. Wrap in `role="group" aria-label="Filter by cuisine"`.

**Severity:** MEDIUM.

---

### M4. Bulk-action buttons read poorly with screen readers

"Select all" / "Clear all" buttons have no aria context — should be `aria-label="Select all categories"` etc., or at least live in the `role="group"` container so context is implied.

**Severity:** MEDIUM.

---

### M5. `wheelKey = filtered.map(d => d.name).join("|")` — O(n) string build per render

For 40 dishes this is trivial, but it allocates a new array + string every render of `<FoodWheel>`. `useMemo` would help, but the more KISS fix is `wheelKey = filtered.length + ":" + filtered[0]?.name` which is sufficient to detect filter changes for a fixed dish list. Or just use `filtered.length` if dishes never reorder (they don't — DISHES is `as const`).

**Severity:** MEDIUM — perf is fine, but the current key is more work than needed.

---

## LOW

### L1. `DISH_COUNTS` reduce accumulator uses `{} as Record<Category, number>`

**File:** `components/food-wheel.tsx:28-34`

The `as` cast is the only minor type-safety lapse. Could be `Object.fromEntries(CATEGORY_LIST.map(c => [c, DISHES.filter(d => d.category === c).length]))` typed via mapped types — but for one-off init code, the cast is acceptable.

### L2. `wheel-canvas.tsx` — `outerBorderColor`, `radiusLineColor` are hardcoded

If a dark-mode is added later (your `globals.css` has dark-mode CSS vars, hinting intent), these colors will look wrong. Currently no dark-mode toggle exists, so YAGNI applies, but flag for future.

### L3. `truncate(name, 14)` — magic number

Pull `MAX_SLICE_LABEL_LEN = 14` to module top with a one-line rationale. Same for `380`, `280`, `480`, `48` in `getWheelSize`.

### L4. Modal `<p>🎉</p>` is heading-adjacent decorative emoji

`aria-hidden="true"` is correctly applied. Good.

### L5. Page metadata duplicated

`app/layout.tsx:11-14` and `app/page.tsx:8-11` declare identical metadata. Remove one (page-level overrides layout, so the layout one is dead). Minor DRY.

### L6. Spin button on touch devices: no `:focus-visible` style

Tailwind classes include `hover:` and `active:` but no `focus-visible:ring-*`. Keyboard users get default browser outline (which Tailwind preflight strips). Add `focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none`.

---

## Adversarial Scan Results

| Scenario | Result | Severity |
|---|---|---|
| User spams Spin mid-animation | Guarded by `mustSpin` check at line 103 — OK |  — |
| Filter shrinks to 0 mid-spin | **BROKEN** — wheelKey changes → Wheel unmounts → `onStopSpinning` may not fire → `mustSpin` stuck → app frozen | CRITICAL (C2/C3) |
| Filter shrinks to 0 mid-modal | Modal still shows winner from previous filter — no crash, but jarring. Re-opening filter selection while modal up is allowed | LOW |
| Long dish names overflow on slice | Truncation works for current data set; NFC-safe (M2 caveat) | MEDIUM |
| Window resize during spin | Resize → debounced 200ms → `setWheelSize` → `<WheelCanvas>` re-renders with new `size` prop — but the lib uses size as canvas pixel dim, may not reflow mid-animation cleanly | MEDIUM |
| Keyboard-only nav through filter chips | Tabs through fine; chips are real `<button>` with `aria-pressed` — OK. No focus indicator (L6) | LOW |
| Tab into modal → focus escapes | **BROKEN** — no focus trap, tab leaves dialog | HIGH (H1) |
| ESC inside modal | **BROKEN** — no listener | HIGH (H1) |
| Click backdrop to close | Works (line 33-38 of winner-modal.tsx) | — |
| Spin Again rapid-clicks | `mustSpin` check prevents re-entry, but `setTimeout(0)` adds a small race window where double-trigger is theoretically possible | MEDIUM (H3) |
| `prizeNumber` from previous spin > new `filtered.length - 1` | Masked by remount, fragile | HIGH (H2) |

---

## Positive Observations

- Server-component shell + single client-island boundary is textbook App Router usage.
- `dynamic(..., { ssr: false })` for `react-custom-roulette` correctly avoids `window is not defined` at SSR.
- `aria-live="polite"` on dish-count announcer is a nice touch.
- `min-h-[44px]` on chip + button hits Apple HIG / WCAG tap-target spec.
- Strict TS, `readonly` on DISHES + CATEGORY_LIST — correct use of `as const`.
- KISS scope respected — no auth, no DB, no over-engineering. Brainstorm's YAGNI principles followed.
- Clear separation of concerns: `category-filter.tsx` is purely presentational; state lives in parent.

---

## Recommended Actions (priority order)

1. **C1** — Fix `spinDuration={0.4}` → `1.0` (default) or `0.8`. Update comment. (1 line)
2. **C2 + C3** — Disable `<CategoryFilter>` during `mustSpin` to prevent mid-spin filter mutation. (Add `disabled` prop, gate chip onClick.) Most KISS fix for both. (5 lines)
3. **H1** — Modal: replace fixed div with `<dialog>` element, OR add ESC listener + focus trap + auto-focus on first button. (`<dialog>` is simplest — Tailwind 4 supports `:open` selectors.)
4. **H2** — Clamp `prizeNumber` when filter shrinks below it.
5. **H3** — Drop `setTimeout(0)` in `handleSpinAgain`, call `handleSpin()` directly.
6. **M1** — Fix font wiring: either remove Geist CSS vars or wire Inter to `--font-sans`. Currently Inter is loaded but body falls through to Arial.
7. **M3 + M4** — Add ARIA group label to chip container.
8. **L5** — Drop duplicate metadata in `app/page.tsx`.
9. **M2** — Switch `slice()` to `Array.from(...).slice()` for grapheme-safe truncation (defensive).
10. **L6** — Add `focus-visible` ring to Spin button.

---

## Metrics

| Metric | Value |
|---|---|
| Total LOC (source) | 647 |
| Files >200 LOC | 0 |
| `any` leaks | 0 |
| `as` casts | 1 (acceptable, L1) |
| TODO/FIXME | 0 |
| Test coverage | Untested (out of scope per brainstorm KISS) |
| Security surface | Static SPA, no inputs, no eval — minimal |

---

## Unresolved Questions

1. Should the Wheel allow spinning with `filtered.length === 1`? Currently disabled (`< 2`). Single dish = trivial outcome, but UX could allow it for "force the choice." Confirm intent.
2. Does the user want Lighthouse perf ≥ 95 verified before ship? Brainstorm sets that bar but no CI hook is present.
3. Dark-mode CSS variables exist in `globals.css` — intentional placeholder or dead code? Tied to L2/M1.
4. Should `prefers-reduced-motion` shorten `spinDuration`? react-custom-roulette doesn't honor it natively. Not in scope, but accessibility-adjacent.

---

Sources consulted:
- [react-custom-roulette GitHub (effectussoftware)](https://github.com/effectussoftware/react-custom-roulette) — spinDuration / prizeNumber contract
- [react-custom-roulette npm](https://www.npmjs.com/package/react-custom-roulette) — prop docs

---

**Status:** DONE_WITH_CONCERNS
**Overall score:** 7.5/10
**Critical:** 3 | **High:** 4 | **Medium:** 5 | **Low:** 6
**Recommendation:** FIX_FIRST
**Report path:** /Users/mac/studio/whattoeat/plans/reports/code-reviewer-260429-1909-food-wheel-app.md
