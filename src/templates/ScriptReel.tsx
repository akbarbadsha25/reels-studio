import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Chrome } from "../components/Chrome";
import { useLayout } from "../components/layout";
import { fontFamily } from "../fonts";
import { Brand, Scene, ScriptReelProps } from "../types";
import { PresetId } from "../presets";

// Seconds per scene: explicit `seconds`, otherwise proportional to word count.
export const sceneTimings = (scenes: Scene[], total?: number) => {
  const est = scenes.map((s) => s.seconds ?? Math.max(1.6, s.text.split(/\s+/).length * 0.42));
  if (!total) return est;
  const fixed = scenes.reduce((a, s) => a + (s.seconds ?? 0), 0);
  const flexible = est.reduce((a, e, i) => a + (scenes[i].seconds ? 0 : e), 0);
  const scale = flexible > 0 ? Math.max(0.3, (total - fixed) / flexible) : 1;
  return est.map((e, i) => (scenes[i].seconds ? e : e * scale));
};

const SceneCard: React.FC<{ scene: Scene; brand: Brand; preset: PresetId; font: string; frames: number }> = ({
  scene,
  brand,
  preset,
  font,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout(preset);
  // "*a few words*" spans can cover several tokens, so track whether we're inside one.
  let inAccent = false;
  const words = scene.text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const opens = raw.startsWith("*");
      const accent = inAccent || opens;
      if (opens) inAccent = true;
      if (/\*[.,!?:;]*$/.test(raw.slice(opens ? 1 : 0))) inAccent = false;
      return { text: raw.replace(/\*/g, ""), accent };
    });
  const exit = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = (words.length <= 4 ? 120 : words.length <= 10 ? 92 : 70) * L.unit;
  const kick = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: `0 ${L.safeX}px`,
        opacity: exit,
        transform: `translateY(${(1 - exit) * -40 * L.unit}px)`,
      }}
    >
      {scene.kicker ? (
        <div
          style={{
            fontFamily: font,
            fontWeight: 800,
            fontSize: 40 * L.unit,
            letterSpacing: 4 * L.unit,
            textTransform: "uppercase",
            color: brand.background,
            background: brand.accent,
            padding: `${8 * L.unit}px ${22 * L.unit}px`,
            borderRadius: 12 * L.unit,
            marginBottom: 36 * L.unit,
            opacity: kick,
            transform: `scale(${0.7 + 0.3 * kick})`,
          }}
        >
          {scene.kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: font,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.12,
          textAlign: "center",
          maxWidth: L.width - L.safeX * 2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `0 ${size * 0.26}px`,
        }}
      >
        {words.map(({ text, accent }, i) => {
          const p = spring({ frame: frame - 4 - i * 3, fps, config: { damping: 14, stiffness: 160 } });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: accent ? brand.accent : brand.primary,
                opacity: p,
                transform: `translateY(${(1 - p) * 50 * L.unit}px) scale(${0.9 + 0.1 * p})`,
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ScriptReel: React.FC<ScriptReelProps> = (props) => {
  const { fps } = useVideoConfig();
  const font = fontFamily(props.brand);
  const scenes = props.cta ? [...props.scenes, { text: props.cta, seconds: 2.5, kicker: "Follow for more" }] : props.scenes;
  const timings = sceneTimings(scenes, props.voiceover ? props.durationInSeconds : undefined);
  let cursor = 0;

  return (
    <AbsoluteFill>
      <Background brand={props.brand} />
      {scenes.map((scene, i) => {
        const from = Math.round(cursor * fps);
        const frames = Math.round(timings[i] * fps);
        cursor += timings[i];
        return (
          <Sequence key={i} from={from} durationInFrames={frames} layout="none">
            <SceneCard scene={scene} brand={props.brand} preset={props.preset} font={font} frames={frames} />
          </Sequence>
        );
      })}
      {props.captions && props.captionStyle !== "none" ? (
        <Captions words={props.captions} brand={props.brand} preset={props.preset} font={font} style={props.captionStyle ?? "highlight"} />
      ) : null}
      <Chrome brand={props.brand} preset={props.preset} font={font} source={props.source} />
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.music ? <Audio src={staticFile(props.music)} volume={props.musicVolume ?? 0.12} loop /> : null}
    </AbsoluteFill>
  );
};
