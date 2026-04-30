"use client";

// WheelCanvas — custom SVG spinning wheel.
// Replaces react-custom-roulette (unmaintained, React 19 incompat).
// Self-contained: no runtime deps. Pure SVG + CSS transform animation.
// Animation lifecycle is driven by CSS transitionend, not setTimeout — this
// makes onStopSpinning robust against parent re-renders.

import React, { useEffect, useRef, useState } from "react";

export interface WheelSlice {
  option: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface WheelCanvasProps {
  data: WheelSlice[];
  prizeNumber: number;
  mustStartSpinning: boolean;
  onStopSpinning: () => void;
}

// Animation tuning
const SPIN_DURATION_MS = 6000;
const FULL_SPINS = 5; // extra full rotations before landing for visual flair
const SPIN_EASING = "cubic-bezier(0.17, 0.67, 0.21, 0.99)";

// SVG geometry (viewBox is 200x200; center at 100,100)
const RADIUS = 96;
const TEXT_RADIUS = 64;
const HUB_RADIUS = 6;

// Round to 3 decimals so server (Node) and client (browser) produce byte-identical
// SVG path strings. Math.cos/sin can differ in the last bit between JS engines,
// which causes React hydration mismatch on <path d=...> and breaks event-handler
// attachment for the entire client island.
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function polarToCartesian(angleDeg: number, r: number): { x: number; y: number } {
  // -90 so 0deg points to 12 o'clock
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: round3(100 + r * Math.cos(rad)), y: round3(100 + r * Math.sin(rad)) };
}

function slicePath(startAngle: number, endAngle: number, r: number): string {
  const start = polarToCartesian(endAngle, r);
  const end = polarToCartesian(startAngle, r);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M 100 100 L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function truncateLabel(text: string, max: number): string {
  const chars = Array.from(text);
  return chars.length > max ? chars.slice(0, max - 1).join("") + "…" : text;
}

export function WheelCanvas({
  data,
  prizeNumber,
  mustStartSpinning,
  onStopSpinning,
}: WheelCanvasProps): React.ReactElement {
  // Cumulative rotation (deg). Always grows so the wheel never snaps back between spins.
  const [rotation, setRotation] = useState(0);

  const numSlices = data.length;
  const sliceAngle = numSlices > 0 ? 360 / numSlices : 360;
  const maxLabel = numSlices > 24 ? 8 : numSlices > 16 ? 11 : 14;
  const fontSize = numSlices > 24 ? 3.6 : numSlices > 12 ? 5 : 6;

  // Stash the latest onStopSpinning in a ref so onTransitionEnd always calls
  // the current callback even if the parent re-renders mid-spin.
  const onStopRef = useRef(onStopSpinning);
  useEffect(() => {
    onStopRef.current = onStopSpinning;
  });

  // Track whether we have an in-flight spin so onTransitionEnd fires onStop only once.
  const isSpinningRef = useRef(false);

  // When mustStartSpinning flips from false→true, compute target rotation.
  // We deliberately keep the deps tight (only mustStartSpinning + the geometry
  // inputs) so unrelated parent re-renders don't re-trigger this effect.
  useEffect(() => {
    if (!mustStartSpinning || isSpinningRef.current || numSlices < 2) return;
    isSpinningRef.current = true;

    // The pointer is fixed at 12 o'clock (0deg). To land prizeNumber under it,
    // we rotate so its slice center sits at 0deg (mod 360).
    const winnerCenter = prizeNumber * sliceAngle + sliceAngle / 2;
    // Random jitter within slice so the pointer doesn't always hit dead-center
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.6);

    setRotation((prev) => {
      const currentMod = ((prev % 360) + 360) % 360;
      const targetMod = ((360 - winnerCenter + jitter) % 360 + 360) % 360;
      const delta = ((targetMod - currentMod + 360) % 360) + FULL_SPINS * 360;
      return prev + delta;
    });
    // No setTimeout — onTransitionEnd handler completes the spin lifecycle.
  }, [mustStartSpinning, prizeNumber, numSlices, sliceAngle]);

  function handleTransitionEnd(e: React.TransitionEvent<SVGSVGElement>): void {
    // Only the transform property's transition signals spin completion
    if (e.propertyName !== "transform") return;
    if (!isSpinningRef.current) return;
    isSpinningRef.current = false;
    onStopRef.current();
  }

  if (numSlices === 0) {
    return <div className="w-full h-full" aria-hidden="true" />;
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      role="img"
      aria-label={`Spinning wheel with ${numSlices} dish options`}
    >
      {/* Pointer triangle at top — fixed, doesn't rotate */}
      <div
        aria-hidden="true"
        className="absolute z-10 left-1/2 -translate-x-1/2"
        style={{
          top: -6,
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "22px solid #1f2937",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
        }}
      />

      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${SPIN_DURATION_MS}ms ${SPIN_EASING}`,
          willChange: "transform",
        }}
      >
        {/* Outer ring (sits behind slices) */}
        <circle cx="100" cy="100" r="99" fill="#1f2937" />
        {data.map((slice, i) => {
          const start = i * sliceAngle;
          const end = (i + 1) * sliceAngle;
          const mid = start + sliceAngle / 2;
          const textPos = polarToCartesian(mid, TEXT_RADIUS);
          const label = truncateLabel(slice.option, maxLabel);
          const bg = slice.style?.backgroundColor ?? "#6b7280";
          const fg = slice.style?.textColor ?? "#ffffff";

          return (
            <g key={`${i}-${slice.option}`}>
              <path
                d={slicePath(start, end, RADIUS)}
                fill={bg}
                stroke="#374151"
                strokeWidth="0.5"
              />
              <text
                x={textPos.x}
                y={textPos.y}
                fill={fg}
                fontSize={fontSize}
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid - 90}, ${textPos.x}, ${textPos.y})`}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* Center hub */}
        <circle
          cx="100"
          cy="100"
          r={HUB_RADIUS}
          fill="#1f2937"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
