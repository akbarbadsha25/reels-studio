import { PRESETS, PresetId } from "../presets";

// Sizes scale with the short edge so text reads the same on every canvas.
export const useLayout = (preset: PresetId) => {
  const { width, height } = PRESETS[preset];
  const short = Math.min(width, height);
  const vertical = height > width;
  return {
    width,
    height,
    vertical,
    unit: short / 1080,
    // Keep captions clear of platform UI (Reels/Shorts buttons sit bottom-right).
    captionBottom: vertical ? height * 0.24 : height * 0.1,
    safeX: width * (vertical ? 0.08 : 0.06),
  };
};
