import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { FPS, PRESETS } from "./presets";
import { ScriptReel } from "./templates/ScriptReel";
import { VideoReel } from "./templates/VideoReel";
import { CommonProps, DEFAULT_BRAND, ScriptReelProps, VideoReelProps } from "./types";

// Canvas size and length come from props, so one composition serves every platform.
const metadata: CalculateMetadataFunction<CommonProps> = ({ props }) => ({
  ...PRESETS[props.preset],
  fps: FPS,
  durationInFrames: Math.max(1, Math.round(props.durationInSeconds * FPS)),
});

const sampleScript: ScriptReelProps = {
  preset: "9x16",
  durationInSeconds: 12,
  brand: { ...DEFAULT_BRAND, handle: "@yourhandle" },
  scenes: [
    { text: "Stop editing reels *by hand*", kicker: "Hot take" },
    { text: "Write a script. Drop a video. Get *every platform* in one go." },
    { text: "Reels, Shorts, LinkedIn and X. *Done.*" },
  ],
  cta: "Save this for later",
};

const sampleVideo: VideoReelProps = {
  preset: "9x16",
  durationInSeconds: 5,
  brand: DEFAULT_BRAND,
  video: "sample.mp4",
  fit: "cover",
  hook: "Watch this",
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="ScriptReel"
      component={ScriptReel as React.FC<any>}
      defaultProps={sampleScript}
      calculateMetadata={metadata as any}
      {...PRESETS["9x16"]}
      fps={FPS}
      durationInFrames={360}
    />
    <Composition
      id="VideoReel"
      component={VideoReel as React.FC<any>}
      defaultProps={sampleVideo}
      calculateMetadata={metadata as any}
      {...PRESETS["9x16"]}
      fps={FPS}
      durationInFrames={150}
    />
  </>
);
