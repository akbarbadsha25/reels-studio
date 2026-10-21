import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand } from "../types";
import { PresetId } from "../presets";
import { useLayout } from "./layout";

// Progress bar + handle watermark shared by every template.
export const Chrome: React.FC<{ brand: Brand; preset: PresetId; font: string }> = ({ brand, preset, font }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const L = useLayout(preset);
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: 10 * L.unit, width: `${progress * 100}%`, background: brand.accent }} />
      {brand.handle ? (
        <div
          style={{
            position: "absolute",
            top: (L.vertical ? 120 : 50) * L.unit,
            left: L.safeX,
            fontFamily: font,
            fontWeight: 700,
            fontSize: 34 * L.unit,
            color: brand.primary,
            opacity: 0.75,
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {brand.handle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
