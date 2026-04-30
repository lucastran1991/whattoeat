# Food Wheel App: First Release Shipped

**Date:** 2026-04-29 12:00
**Severity:** Info
**Component:** Food Wheel (Next.js 16 + React 19)
**Status:** Delivered (pending Vercel deploy)

## What Happened

Completed full-stack delivery of Food Wheel app in a single day: 5-phase plan → parallel implementation of phases 3 & 4 → tester + code-reviewer running in parallel → 4 bug fixes → pushed to origin/main. 647 LOC across 8 files.

## The Brutal Truth

This worked, but barely. The team caught THREE critical bugs after implementation that would have shipped broken. Without code review catching these, app would be frozen on prod. The implementing agent did not surface any of these in self-review — that's a process failure we need to fix.

## Technical Details

**Library Quirk #1: `spinDuration` is a multiplier, not duration in seconds**

react-custom-roulette's `spinDuration` prop is a multiplier against a default (≈ 4s). Shipped `spinDuration={0.4}` thinking "snappy 400ms spin". Actual result: 40% of ~4s = 1.6s. User experience was jarring. Reviewer caught this via upstream docs. Fixed to `spinDuration={1.0}` (4s spin, industry standard for gamification).

**Bug #2: Mid-spin filter toggle froze app**

`wheelKey = filtered.map(d => d.name).join("|")` rebuilt on every filter change. If user toggled a filter MID-SPIN, Wheel component unmounted, `mustSpin` state stuck at true, app locked up (spinner couldn't stop, filter button disabled). Root cause: trying to defend a broken state machine.

Fix: KISS principle — disable `<CategoryFilter>` button while `mustSpin={true}`. Gating the input is simpler than trying to patch the state machine. No extra renders, no complexity.

**Bug #3: Stale closure crash in `handleStop`**

```typescript
const handleStop = () => {
  const item = filtered[prizeNumber]; // stale closure if filter shrinks
  setWheelKey(Date.now().toString());
};
```

If user filtered categories AFTER spin result was chosen, `prizeNumber` could exceed `filtered.length`, crash with "cannot read property of undefined". 

Fix: Clamp prizeNumber as derived value, not closure read:
```typescript
const selectedItem = filtered[Math.min(prizeNumber, filtered.length - 1)];
```

Avoids extra `useEffect`-based fix (which would trigger re-render) and sidesteps `react-hooks/set-state-in-effect` lint rule.

**Bug #4: `next/font` CSS cascade landmine**

`app/globals.css` body declared `font-family: Arial`, overriding Inter from `inter.className`. Inter loaded but never visible. Fixed via CSS variable wiring: computed body uses `--font-sans`, assigned to Inter at import time.

**Bug #5: Modal accessibility declared but unimplemented**

Modal had `aria-modal="true"` but no ESC handler, focus trap, or auto-focus. Added all three — proper a11y requires all three, not just the attribute.

## What We Tried

1. Self-review by implementing agent (failed to catch any of the 3 critical bugs)
2. Tester manual smoke test (passed) — but didn't exercise filter + spin race condition
3. Code reviewer red-team scan (caught all 3 critical bugs in 30 mins)

## Root Cause Analysis

**Why didn't implementation agent catch these?**
- Library docs are upstream (react-custom-roulette) — agent read README but didn't dig into actual props behavior
- State machine bugs are invisible until race conditions trigger (filter + spin = race)
- CSS cascade is a classic gotcha; agent assumed `className` prop wins

**Why did code reviewer catch them?**
- Fresh eyes: reviewer reads code asking "what can break?" not "how do I build?"
- Adversarial mindset: assumes user is hostile (toggle filters, race the spinner)

## Lessons Learned

1. **Code review is not optional for multi-phase work.** Implementing agent's self-review is insufficient for race conditions and library quirks. Budget this time.

2. **`spinDuration` example teaches us to always validate library assumptions via minimal repro or source code, not just README.** Read the actual implementation if behavior seems wrong.

3. **Gating input (disable filter while spinning) beats defending state machines.** KISS wins. Don't build complexity to paper over a design flaw.

4. **Stale closures in event handlers are a React trap.** Always derive from current state/props in callback scope, not closure captures. `Math.min(prizeNumber, filtered.length - 1)` is cleaner than any `useEffect` dance.

5. **next/font CSS cascade is a gotcha.** The `className` prop wires the font, but CSS inheritance and specificity can override. Use CSS variables for reliability.

6. **Accessibility attributes require all three guards:** ESC close + focus trap + auto-focus. Attribute alone is cargo cult.

## Process Notes

- **`--auto --parallel` mode worked.** Phases 3 & 4 ran simultaneously with strict file ownership (CategoryFilter API contract specified in phase-3 spec, so phase-4 agent could import safely).
- **Tester skipped formal test framework.** Manual smoke checklist + build/lint/typecheck is KISS for a personal app. No mocks, no fake data.
- **Reviewer did a red-team scan.** Asked "what breaks if user does X?" — that adversarial mindset caught the race condition.

## Next Steps

1. **Vercel deploy:** User to trigger (app ready, pushed to origin/main)
2. **Live smoke test:** Verify deploy succeeded, spin the wheel, toggle filters, test modal ESC close
3. **Retrospective learning:** Document library quirks (spinDuration multiplier) in team wiki for future Next.js + react-custom-roulette projects
4. **Implement peer review as mandatory gate:** Before code review assignment, implementing agent must do self-review with explicit "red-team" checklist (library quirks, race conditions, a11y)

## Unresolved

- None — app is delivery-ready pending deploy

---

**Commit History:**
- `feat: initialize next.js app with food wheel spinner layout`
- `feat: implement category filter and spin results display`
- `fix: replace wheelKey race condition + accessibility + font cascade`
- `fix: clamp prizeNumber in stale closure + disable filter mid-spin`

**Files Modified:** 8 | **LOC:** 647 | **Warnings:** 0 (eslint clean)
