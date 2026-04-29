"use client";

// CategoryFilter — controlled chip-based filter for cuisine categories.
// Parent owns state (Set<Category>); this component is purely presentational + event emitter.

import React from "react";
import type { Category } from "@/lib/types";
import { CATEGORY_LIST, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";

export interface CategoryFilterProps {
  selected: Set<Category>;
  onChange: (next: Set<Category>) => void;
  dishCounts: Record<Category, number>;
  /** When true, all buttons are disabled (e.g. while wheel is spinning). */
  disabled?: boolean;
}

export function CategoryFilter(props: CategoryFilterProps): React.ReactElement {
  const { selected, onChange, dishCounts, disabled = false } = props;

  // Total dishes across currently-selected categories
  const totalSelected = CATEGORY_LIST.reduce(
    (sum, cat) => (selected.has(cat) ? sum + dishCounts[cat] : sum),
    0
  );

  function toggle(cat: Category): void {
    if (disabled) return;
    // Always create a new Set to ensure referential inequality → triggers re-render
    const next = new Set(selected);
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    onChange(next);
  }

  function selectAll(): void {
    if (disabled) return;
    onChange(new Set(CATEGORY_LIST));
  }

  function clearAll(): void {
    if (disabled) return;
    onChange(new Set<Category>());
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar: summary + bulk actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">
          {totalSelected} {totalSelected === 1 ? "dish" : "dishes"} selected
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            aria-label="Select all categories"
            className={`py-1.5 px-3 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]${disabled ? " opacity-60 cursor-not-allowed" : ""}`}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled}
            aria-label="Clear all categories"
            className={`py-1.5 px-3 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]${disabled ? " opacity-60 cursor-not-allowed" : ""}`}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by cuisine">
        {CATEGORY_LIST.map((cat) => {
          const isActive = selected.has(cat);
          const count = dishCounts[cat] ?? 0;
          const color = CATEGORY_COLORS[cat];

          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              disabled={disabled}
              aria-pressed={isActive}
              className={`py-2 px-4 rounded-full text-sm font-medium transition-colors min-h-[44px] border${disabled ? " opacity-60 cursor-not-allowed" : ""}`}
              style={
                isActive
                  ? {
                      backgroundColor: color,
                      borderColor: color,
                      color: "#ffffff",
                    }
                  : {
                      backgroundColor: "transparent",
                      borderColor: "#d1d5db", // gray-300
                      color: "#6b7280", // gray-500
                    }
              }
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
