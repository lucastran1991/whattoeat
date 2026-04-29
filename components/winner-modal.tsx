"use client";

// WinnerModal — displays the winning dish after the wheel stops.
// Uses a fixed overlay with full a11y: ESC close, auto-focus, focus trap, focus restore.

import React, { useEffect, useRef } from "react";
import type { Dish } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";

export interface WinnerModalProps {
  dish: Dish | null;
  onClose: () => void;
  onSpinAgain: () => void;
}

export function WinnerModal({
  dish,
  onClose,
  onSpinAgain,
}: WinnerModalProps): React.ReactElement | null {
  const spinAgainRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Cache focused element so we can restore it when modal closes
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!dish) return;
    // Cache currently-focused element before taking focus
    previousFocusRef.current = document.activeElement;
    // Auto-focus the primary action button
    spinAgainRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Simple focus trap: cycle Tab / Shift+Tab between the two buttons
      if (e.key === "Tab") {
        const buttons = [spinAgainRef.current, closeRef.current].filter(Boolean) as HTMLButtonElement[];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to previously-focused element
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [dish, onClose]);

  if (!dish) return null;

  const categoryLabel = CATEGORY_LABELS[dish.category];
  const categoryColor = CATEGORY_COLORS[dish.category];
  const dishNameId = "winner-dish-name";

  function handleSpinAgain(): void {
    onSpinAgain();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    // Backdrop — fixed, full-screen, semi-transparent
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={dishNameId}
    >
      {/* Modal card */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 flex flex-col items-center gap-5 text-center">
        <p className="text-4xl select-none" aria-hidden="true">🎉</p>

        <h2 className="text-xl font-semibold text-gray-600 tracking-wide uppercase">
          Today you&apos;re eating
        </h2>

        <p id={dishNameId} className="text-3xl font-bold text-gray-900 leading-tight break-words">
          {dish.name}
        </p>

        <span
          className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryLabel}
        </span>

        {/* Action buttons — focus trap cycles between these two */}
        <div className="flex gap-3 mt-2 w-full">
          <button
            ref={spinAgainRef}
            type="button"
            onClick={handleSpinAgain}
            className="flex-1 rounded-full py-3 px-5 text-base font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: categoryColor }}
          >
            Spin again
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full py-3 px-5 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
