import { PresetId } from "./presets";

export type Brand = {
  background: string; // base background colour
  primary: string; // main text colour
  accent: string; // highlight colour (active caption word, keywords)
  handle?: string; // e.g. "@akbar", shown as a small watermark
  font?: "Montserrat" | "Inter" | "Poppins" | "Bebas Neue";
};

export type Word = { text: string; start: number; end: number }; // seconds

export type Scene = {
  text: string; // wrap words in *asterisks* to colour them with the accent
  seconds?: number; // omit to auto-time from word count (or voiceover length)
  kicker?: string; // small label above the text, e.g. "Tip #1"
};

export type CommonProps = {
  preset: PresetId;
  durationInSeconds: number;
  brand: Brand;
  music?: string; // file in the job folder
  musicVolume?: number;
  captions?: Word[];
  captionStyle?: "highlight" | "pop" | "none";
  source?: string; // small credit line along the bottom, e.g. "Source: Reuters"
};

export type ScriptReelProps = CommonProps & {
  scenes: Scene[];
  voiceover?: string;
  cta?: string;
};

export type VideoReelProps = CommonProps & {
  video: string;
  trimStart?: number; // seconds into the source
  fit: "cover" | "blur"; // blur = contain over a blurred copy, for big aspect changes
  hook?: string; // headline shown for the first ~2.5s
};

export const DEFAULT_BRAND: Brand = {
  background: "#0B0B12",
  primary: "#FFFFFF",
  accent: "#FFD23F",
  font: "Montserrat",
};
