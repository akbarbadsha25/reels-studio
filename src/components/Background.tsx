import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Brand } from "../types";

// Slow drifting colour blobs over the brand background.
export const Background: React.FC<{ brand: Brand }> = ({ brand }) => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, color: string, size: number, speed: number) => (
    <div
      style={{
        position: "absolute",
        left: `${x + Math.sin(f * speed) * 12}%`,
        top: `${y + Math.cos(f * speed * 0.8) * 10}%`,
        width: `${size}%`,
        aspectRatio: "1",
        borderRadius: "50%",
        background: color,
        filter: "blur(120px)",
        opacity: 0.35,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: brand.background, overflow: "hidden" }}>
      {blob(20, 25, brand.accent, 70, 0.012)}
      {blob(85, 75, "#6C5CE7", 80, 0.009)}
      {blob(60, 10, "#00B8D9", 50, 0.015)}
    </AbsoluteFill>
  );
};
