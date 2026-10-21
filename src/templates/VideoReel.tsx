import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "../components/Captions";
import { Chrome } from "../components/Chrome";
import { useLayout } from "../components/layout";
import { fontFamily } from "../fonts";
import { VideoReelProps } from "../types";

const Hook: React.FC<{ text: string; props: VideoReelProps; font: string }> = ({ text, props, font }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout(props.preset);
  const inP = spring({ frame, fps, config: { damping: 13, stiffness: 150 } });
  const out = interpolate(frame, [2.2 * fps, 2.6 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: (L.vertical ? 300 : 90) * L.unit }}>
      <div
        style={{
          fontFamily: font,
          fontWeight: 900,
          fontSize: 76 * L.unit,
          lineHeight: 1.1,
          textAlign: "center",
          color: props.brand.background,
          background: props.brand.accent,
          padding: `${18 * L.unit}px ${34 * L.unit}px`,
          borderRadius: 20 * L.unit,
          maxWidth: L.width - L.safeX * 2,
          textWrap: "balance",
          opacity: out,
          transform: `scale(${inP * out}) rotate(${(1 - inP) * -6}deg)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const VideoReel: React.FC<VideoReelProps> = (props) => {
  const { fps } = useVideoConfig();
  const font = fontFamily(props.brand);
  const src = staticFile(props.video);
  const trimBefore = Math.round((props.trimStart ?? 0) * fps);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {props.fit === "blur" ? (
        <>
          <AbsoluteFill style={{ filter: "blur(40px) brightness(0.6)", transform: "scale(1.15)" }}>
            <OffthreadVideo src={src} trimBefore={trimBefore} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <AbsoluteFill>
            <OffthreadVideo src={src} trimBefore={trimBefore} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </AbsoluteFill>
        </>
      ) : (
        <OffthreadVideo src={src} trimBefore={trimBefore} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {props.captions && props.captionStyle !== "none" ? (
        <Captions
          words={props.captions}
          brand={props.brand}
          preset={props.preset}
          font={font}
          style={props.captionStyle ?? "highlight"}
          offset={props.trimStart ?? 0}
        />
      ) : null}
      {props.hook ? <Hook text={props.hook} props={props} font={font} /> : null}
      <Chrome brand={props.brand} preset={props.preset} font={font} />
      {props.music ? <Audio src={staticFile(props.music)} volume={props.musicVolume ?? 0.08} loop /> : null}
    </AbsoluteFill>
  );
};
