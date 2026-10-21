// Canvas sizes. Each platform maps to one or more of these.
export const PRESETS = {
  "9x16": { width: 1080, height: 1920 },
  "4x5": { width: 1080, height: 1350 },
  "1x1": { width: 1080, height: 1080 },
  "16x9": { width: 1920, height: 1080 },
} as const;

export type PresetId = keyof typeof PRESETS;

export const PLATFORMS: Record<string, { preset: PresetId; file: string }[]> = {
  instagram: [{ preset: "9x16", file: "instagram-reel" }],
  youtube: [{ preset: "9x16", file: "youtube-short" }],
  linkedin: [
    { preset: "4x5", file: "linkedin-portrait" },
    { preset: "1x1", file: "linkedin-square" },
  ],
  x: [
    { preset: "16x9", file: "x-landscape" },
    { preset: "1x1", file: "x-square" },
  ],
};

export const FPS = 30;
