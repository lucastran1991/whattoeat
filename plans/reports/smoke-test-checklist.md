# Food Wheel App — Manual Smoke-Test Checklist

**Date:** 2026-04-29  
**App:** What To Eat — Da Nang Dinner Wheel  
**Scope:** Browser-based validation (no automated test framework)  

Since the app intentionally has no formal test suite (KISS/scope), use this checklist to validate core functionality and UX in a browser.

---

## Setup

```bash
cd /Users/mac/studio/whattoeat
pnpm dev
# Opens http://localhost:3000
```

Then open browser DevTools (F12) and keep console visible during testing.

---

## Test Cases

### TC-001: Spin Functionality

- [ ] Load app
- [ ] Click **Spin** button
- [ ] Wheel animates smoothly (no jank, ~4 second duration)
- [ ] Wheel stops on a random slice
- [ ] Winner modal appears with dish name + category color
- [ ] Spin button is disabled during animation (grayed out, no cursor)

**Expected:** Wheel rotates, lands on a dish, modal shows result.

---

### TC-002: Winner Modal Display

- [ ] Modal shows "🎉" emoji at top
- [ ] Modal shows "Today you're eating" heading
- [ ] Modal shows winning dish name (largest text)
- [ ] Category badge displays correct label + matching color
  - E.g., "Vietnamese" in red (#ef4444)
  - E.g., "Seafood" in sky blue (#0ea5e9)
- [ ] Modal is centered on screen with dark backdrop
- [ ] Modal text is readable (contrast ≥ 4.5:1)

**Expected:** Professional, readable modal with all dish info.

---

### TC-003: Modal Actions

- [ ] Click **Spin again** button → Modal closes, wheel spins with new result
- [ ] Click **Close** button → Modal closes, wheel remains visible
- [ ] Click outside modal (on dark backdrop) → Modal closes
- [ ] Press **ESC** key → Modal closes (browser native behavior)

**Expected:** All 4 close methods work correctly.

---

### TC-004: Category Filter — Basic Toggling

- [ ] All 10 categories visible as chips:
  - Vietnamese, Seafood, Street Food, Indian, Thai, Lao, Japanese, Italian, Western, Mexican
- [ ] Each chip shows dish count in parentheses:
  - E.g., "Vietnamese (8)", "Seafood (4)"
- [ ] Click a chip → toggle active/inactive
- [ ] Active chip: colored background + white text + category color
- [ ] Inactive chip: transparent background + gray border + gray text
- [ ] Wheel updates live as you toggle (slices appear/disappear immediately)

**Expected:** Smooth filter toggling with instant visual feedback.

---

### TC-005: Category Filter — Bulk Actions

- [ ] Click **Select all** → All chips become active, all 40 dishes in wheel
- [ ] Click **Clear all** → All chips become inactive, wheel shows placeholder
- [ ] Dish count summary updates: "X dishes selected" (e.g., "40 dishes selected")

**Expected:** Bulk actions work instantly.

---

### TC-006: Spin Disabled States

- [ ] Uncheck all categories → Placeholder appears: "No dishes selected — enable at least one category above"
- [ ] Spin button is disabled (grayed out, `cursor: not-allowed`)
- [ ] Check 1 category (e.g., Vietnamese) → Placeholder still shows "Select at least 2 categories to spin"
- [ ] Spin button still disabled
- [ ] Check 2nd category → Placeholder disappears, wheel appears
- [ ] Spin button is enabled (normal colors, clickable)

**Expected:** Spin requires ≥2 categories; UX clearly communicates this.

---

### TC-007: Vietnamese Diacritics Rendering

Load the app and verify Vietnamese dishes render without mojibake (garbled characters or placeholder boxes):

- [ ] "Mì Quảng" — grave accent on ì + circumflex on â (not boxes)
- [ ] "Bún mắm nêm" — grave accents intact
- [ ] "Bún bò Huế" — grave + horn diacritic on ò
- [ ] "Cơm gà Đà Nẵng" — all diacritics (grave + breve + circumflex) intact
- [ ] "Bánh canh" — circumflex on â
- [ ] "Bánh tráng cuốn thịt heo" — circumflex + acute diacritic
- [ ] "Bê thui" — circumflex + macron
- [ ] "Bún thịt nướng" — multiple diacritics intact

Open DevTools → Application tab → Fonts and verify "Inter" font is loaded with "Vietnamese" subset.

**Expected:** All Vietnamese text renders legibly with correct Unicode characters.

---

### TC-008: Responsive Design — Mobile (375px, Portrait)

Resize browser or test on real device at 375px width:

- [ ] Wheel size reduces to ~280px (minimum clamped)
- [ ] Category chips stack/wrap to multiple lines if needed
- [ ] Spin button remains large enough to click (min-h-[44px], 44px)
- [ ] Modal fits within viewport without horizontal scroll
- [ ] Modal has 16px padding on left/right (px-4) to avoid edge cutoff
- [ ] All text is readable (font size adequate)
- [ ] No layout jank or unexpected shifts

**Expected:** App is usable on narrow phones.

---

### TC-009: Responsive Design — Tablet (768px, Landscape)

Resize browser or test on real tablet at 768px width:

- [ ] Wheel size ~330–350px (responsive scaling between 280–480px)
- [ ] Category chips may fit single line or wrap (layout is flexible)
- [ ] Layout is centered with proper max-width constraints
- [ ] No horizontal scroll
- [ ] All interactive elements (44px min height) are accessible

**Expected:** App adapts gracefully to medium screens.

---

### TC-010: Responsive Design — Desktop (1920px, Landscape)

Resize browser or test on desktop at 1920px width:

- [ ] Wheel size maxes at 480px (clamped maximum)
- [ ] Layout is centered within viewport with consistent margins
- [ ] No wasted whitespace on sides (max-width containers work)
- [ ] All spacing is balanced (gap-6, gap-3, etc.)
- [ ] Font sizes are comfortable to read

**Expected:** App looks polished on large screens.

---

### TC-011: Browser Console — No Errors

Open DevTools (F12) and keep console tab open throughout testing:

- [ ] No red error messages
- [ ] No yellow warnings about missing resources
- [ ] No "console.log" debug output (app is clean)
- [ ] No TypeScript errors
- [ ] No "window is not defined" errors (SSR guard works)
- [ ] No hydration mismatch warnings (useIsomorphicLayoutEffect prevents this)
- [ ] No font loading errors (Vietnamese subset loads)
- [ ] No CORS warnings

**Expected:** Console is clean (no errors, no debug logs).

---

### TC-012: Edge Cases

#### Spin While Result Displayed
- [ ] Winner modal is open
- [ ] Click **Spin again** or **Close** then immediately click **Spin**
- [ ] New spin begins correctly
- [ ] Modal closes before new spin animation starts

**Expected:** State transitions are clean, no stale results.

#### Rapid Category Toggling
- [ ] Quickly toggle categories on/off (click 5+ times)
- [ ] Wheel updates smoothly each time (no jank, no stale UI)
- [ ] No console errors during rapid updates

**Expected:** React re-renders efficiently; Set immutability works.

#### Resize During Spin
- [ ] Start a spin animation
- [ ] While wheel is spinning, resize the browser window
- [ ] Wheel continues spinning (resize doesn't interrupt)
- [ ] After spin completes, wheel size has updated to match new viewport

**Expected:** Resize listener is debounced (200ms) and doesn't block spin.

#### Toggle Categories While Modal Open
- [ ] Winner modal is displayed
- [ ] Click a category chip to toggle it
- [ ] Modal remains open (filtering while modal is displayed works)
- [ ] Next spin will use updated filter

**Expected:** Filter state is independent of modal state.

---

### TC-013: Performance & Smoothness (Subjective)

- [ ] App loads instantly (< 1 second)
- [ ] Spin animation is 60fps (no stuttering)
- [ ] Category toggle is instant (no input lag)
- [ ] Modal appears immediately (no delay)
- [ ] Resize is smooth (debounce prevents jank)

**Expected:** App feels responsive and polished.

---

## Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-001 | ☐ | Spin functionality |
| TC-002 | ☐ | Modal display |
| TC-003 | ☐ | Modal actions (close, ESC, backdrop) |
| TC-004 | ☐ | Category filter toggling |
| TC-005 | ☐ | Select/Clear all buttons |
| TC-006 | ☐ | Spin disabled with < 2 categories |
| TC-007 | ☐ | Vietnamese diacritics render |
| TC-008 | ☐ | Mobile responsive (375px) |
| TC-009 | ☐ | Tablet responsive (768px) |
| TC-010 | ☐ | Desktop responsive (1920px) |
| TC-011 | ☐ | Browser console clean |
| TC-012 | ☐ | Edge cases (rapid, resize, modal+filter) |
| TC-013 | ☐ | Performance & smoothness |

---

## Notes

- **No automated tests:** Per KISS scope, this app uses no Jest/Vitest/etc. Manual smoke testing is the validation method.
- **Build is validated separately:** See `tester-260429-1909-food-wheel-app.md` for TypeScript, lint, and build results.
- **Check DevTools F12:** Keep console open throughout to catch runtime errors (even though none are expected).

---

**Date Tested:** ___________  
**Tester Name:** ___________  
**Overall Result:** ☐ PASS ☐ FAIL (note any failures above)
