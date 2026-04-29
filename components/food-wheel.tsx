"use client";

// FoodWheel — top-level container for the spin experience.
// Owns all state: filter selection, spin lifecycle, and winner.
// Composes CategoryFilter + WheelCanvas + WinnerModal.

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Category, Dish } from "@/lib/types";
import { CATEGORY_LIST, CATEGORY_COLORS } from "@/lib/types";
import { DISHES } from "@/data/dishes";
import { CategoryFilter } from "@/components/category-filter";
import { WheelCanvas } from "@/components/wheel-canvas";
import { WinnerModal } from "@/components/winner-modal";

// useLayoutEffect causes a warning during SSR. Use useEffect on the server
// and useLayoutEffect on the client so the wheel size syncs before first paint
// without triggering a hydration mismatch.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Truncate long dish names so they fit on narrow wheel slices.
// Array.from iterates by Unicode code point, making this NFD/grapheme-safe
// for Vietnamese stacked diacritics and emoji.
function truncate(name: string, max: number): string {
  const chars = Array.from(name);
  return chars.length > max ? chars.slice(0, max - 1).join("") + "…" : name;
}

// Pre-compute per-category dish counts once (stable across renders)
const DISH_COUNTS = CATEGORY_LIST.reduce(
  (acc, cat) => {
    acc[cat] = DISHES.filter((d) => d.category === cat).length;
    return acc;
  },
  {} as Record<Category, number>
);

// Compute responsive wheel size based on viewport width.
// Clamped between 280px (small phones) and 480px (desktop).
function getWheelSize(): number {
  if (typeof window === "undefined") return 380;
  return Math.min(480, Math.max(280, window.innerWidth - 48));
}

export function FoodWheel(): React.ReactElement {
  // --- State ---
  const [selected, setSelected] = useState<Set<Category>>(
    () => new Set(CATEGORY_LIST) // all categories on by default
  );
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<Dish | null>(null);
  // Responsive wheel size: updated on mount + window resize (debounced 200ms).
  // Server renders with default 380; client corrects synchronously before paint
  // via useIsomorphicLayoutEffect, avoiding a visible flash of wrong size.
  const [wheelSize, setWheelSize] = useState<number>(380);

  useIsomorphicLayoutEffect(() => {
    setWheelSize(getWheelSize());
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function handleResize(): void {
      clearTimeout(timer);
      timer = setTimeout(() => setWheelSize(getWheelSize()), 200);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // --- Derived data ---

  // Dishes matching currently-selected categories
  const filtered = useMemo(
    () => DISHES.filter((d) => selected.has(d.category)),
    [selected]
  );

  // Wheel slice data — truncated names + category colors
  const wheelData = useMemo(
    () =>
      filtered.map((dish) => ({
        option: truncate(dish.name, 14),
        style: {
          backgroundColor: CATEGORY_COLORS[dish.category],
          textColor: "#ffffff",
        },
      })),
    [filtered]
  );

  // Clamp prizeNumber defensively: react-custom-roulette requires
  // 0 <= prizeNumber <= data.length - 1. Derived at render time — no effect needed.
  const safePrizeNumber =
    filtered.length > 0 && prizeNumber >= filtered.length ? 0 : prizeNumber;

  // Stable key: forces WheelCanvas remount when filtered list changes so the
  // lib re-initialises its internal slice array (it caches data on mount).
  const wheelKey = filtered.map((d) => d.name).join("|");

  // --- Handlers ---

  function handleSpin(): void {
    // Guard: prevent double-spin and spinning with too few dishes
    if (mustSpin || filtered.length < 2) return;
    const idx = Math.floor(Math.random() * filtered.length);
    setPrizeNumber(idx);
    setMustSpin(true);
  }

  function handleStop(): void {
    setMustSpin(false);
    setWinner(filtered[prizeNumber]);
  }

  function handleCloseWinner(): void {
    setWinner(null);
  }

  function handleSpinAgain(): void {
    // React 19 batches setWinner(null) + setMustSpin(true) naturally — no setTimeout needed.
    handleSpin();
  }

  // --- Render helpers ---

  const canSpin = filtered.length >= 2 && !mustSpin;
  const tooFewDishes = filtered.length < 2;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Category filter chips */}
      <div className="w-full max-w-2xl">
        <CategoryFilter
          selected={selected}
          onChange={setSelected}
          dishCounts={DISH_COUNTS}
          disabled={mustSpin}
        />
      </div>

      {/* Dish count summary — aria-live announces filter changes to screen readers */}
      <p className="text-sm text-gray-500" aria-live="polite" aria-atomic="true">
        {filtered.length} {filtered.length === 1 ? "dish" : "dishes"} in the wheel
      </p>

      {/* Wheel or placeholder when too few dishes are selected */}
      {filtered.length >= 2 ? (
        <div className="w-full max-w-[480px]">
          <WheelCanvas
            key={wheelKey}
            data={wheelData}
            prizeNumber={safePrizeNumber}
            mustStartSpinning={mustSpin}
            onStopSpinning={handleStop}
            size={wheelSize}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-[420px] h-64 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-400 text-center text-sm px-6">
            {filtered.length === 0
              ? "No dishes selected — enable at least one category above"
              : "Select at least 2 categories to spin"}
          </p>
        </div>
      )}

      {/* Spin button */}
      <button
        type="button"
        onClick={handleSpin}
        disabled={!canSpin}
        aria-disabled={!canSpin}
        aria-label="Spin the wheel to pick a random dish"
        className="rounded-full px-10 py-4 text-lg font-bold text-white shadow-md transition-all
          bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
          focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none
          disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {mustSpin ? "Spinning…" : "Spin"}
      </button>

      {/* Hint shown when spin is disabled due to insufficient dishes */}
      {tooFewDishes && (
        <p className="text-sm text-amber-600 font-medium -mt-3">
          Select at least 2 categories to enable spinning
        </p>
      )}

      {/* Winner overlay — renders null when dish is null */}
      <WinnerModal
        dish={winner}
        onClose={handleCloseWinner}
        onSpinAgain={handleSpinAgain}
      />
    </div>
  );
}
