"use client";

// WheelCanvas — thin wrapper around react-custom-roulette's Wheel.
// Dynamic import with ssr:false prevents "window is not defined" crash during SSR.

import dynamic from "next/dynamic";
import React from "react";

// Slice data shape expected by react-custom-roulette
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
  /** Wheel diameter in px. Defaults to 380. Passed from FoodWheel resize listener. */
  size?: number;
}

// Lazily import the Wheel so it only runs client-side (uses canvas + window)
const Wheel = dynamic(
  () => import("react-custom-roulette").then((m) => m.Wheel),
  { ssr: false }
);

export function WheelCanvas({
  data,
  prizeNumber,
  mustStartSpinning,
  onStopSpinning,
  size = 380,
}: WheelCanvasProps): React.ReactElement {
  // react-custom-roulette renders a canvas that fills its container width.
  // We set an explicit pixel size on the wrapper so the canvas scales
  // responsively based on the size value from FoodWheel's resize listener.
  const borderWidth = size < 320 ? 3 : 4;

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Wheel
        data={data}
        prizeNumber={prizeNumber}
        mustStartSpinning={mustStartSpinning}
        onStopSpinning={onStopSpinning}
        outerBorderColor="#1f2937"
        outerBorderWidth={borderWidth}
        radiusLineColor="#374151"
        radiusLineWidth={1}
        textColors={["#ffffff"]}
        fontSize={data.length > 20 ? 11 : 13}
        backgroundColors={data.map((s) => s.style?.backgroundColor ?? "#6b7280")}
        // spinDuration is a coefficient on default duration; 1.0 = default ~6s, 0.8 = snappier ~4.8s.
        spinDuration={1.0}
      />
    </div>
  );
}
