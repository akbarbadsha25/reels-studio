import React, { useMemo } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, Word } from "../types";
import { PresetId } from "../presets";
import { useLayout } from "./layout";

// Groups words into short "pages" of up to maxWords, breaking on pauses and sentence ends.
const paginate = (words: Word[], maxWords: number) => {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const gap = prev ? w.start - prev.end : 0;
    if (cur.length >= maxWords || gap > 0.6 || (prev && /[.!?]$/.test(prev.text))) {
      if (cur.length) pages.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) pages.push(cur);
  return pages;
};

export const Captions: React.FC<{
  words: Word[];
  brand: Brand;
  preset: PresetId;
  font: string;
  style: "highlight" | "pop";
  offset?: number; // seconds to subtract (e.g. trim start)
}> = ({ words, brand, preset, font, style, offset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout(preset);
  const t = frame / fps + offset;
  const pages = useMemo(() => paginate(words, L.vertical ? 3 : 5), [words, L.vertical]);
  const page = pages.find((p, i) => {
    const next = pages[i + 1];
    return t >= p[0].start && t < Math.min(p[p.length - 1].end + 0.4, next ? next[0].start : Infinity);
  });
  if (!page) return null;

  const pageStartFrame = (page[0].start - offset) * fps;
  const enter = spring({ frame: frame - pageStartFrame, fps, config: { damping: 14, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: L.captionBottom }}>
      <div
        style={{
          fontFamily: font,
          fontWeight: 900,
          fontSize: 88 * L.unit,
          lineHeight: 1.1,
          textAlign: "center",
          textTransform: "uppercase",
          maxWidth: L.width - L.safeX * 2,
          transform: `scale(${0.85 + 0.15 * enter})`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `0 ${30 * L.unit}px`,
        }}
      >
        {page.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const spoken = t >= w.start;
          const pop = spring({ frame: frame - (w.start - offset) * fps, fps, config: { damping: 12, stiffness: 220 } });
          return (
            <span
              key={i}
              style={{
                color: active ? brand.accent : brand.primary,
                opacity: style === "pop" && !spoken ? 0 : 1,
                display: "inline-block",
                transform: style === "pop" ? `scale(${spoken ? 0.6 + 0.4 * pop : 0.6})` : active ? "scale(1.04)" : "none",
                WebkitTextStroke: `${10 * L.unit}px #000`,
                paintOrder: "stroke fill",
                textShadow: `0 ${6 * L.unit}px ${24 * L.unit}px rgba(0,0,0,0.55)`,
              }}
            >
              {w.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
