#!/usr/bin/env node
// Render one job into every requested platform format.
//   node scripts/render.mjs <job-folder> [--platforms instagram,x] [--out /some/dir] [--scale 0.5]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRESETS = { "9x16": [1080, 1920], "4x5": [1080, 1350], "1x1": [1080, 1080], "16x9": [1920, 1080] };
const PLATFORMS = {
  instagram: [["9x16", "instagram-reel"]],
  youtube: [["9x16", "youtube-short"]],
  linkedin: [["4x5", "linkedin-portrait"], ["1x1", "linkedin-square"]],
  x: [["16x9", "x-landscape"], ["1x1", "x-square"]],
};

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const jobArg = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!jobArg) {
  console.error("usage: node scripts/render.mjs <job-folder> [--platforms a,b] [--out dir] [--scale 0.5]");
  process.exit(1);
}
const jobDir = fs.existsSync(jobArg) ? path.resolve(jobArg) : path.join(ROOT, "jobs", jobArg);
const jobName = path.basename(jobDir);
const job = JSON.parse(fs.readFileSync(path.join(jobDir, "job.json"), "utf8"));
const brandFile = path.join(ROOT, "brand.json");
const brand = { ...(fs.existsSync(brandFile) ? JSON.parse(fs.readFileSync(brandFile, "utf8")) : {}), ...(job.brand ?? {}) };
const platforms = (flag("platforms") ?? (job.platforms ?? Object.keys(PLATFORMS)).join(",")).split(",");
const outDir = path.join(ROOT, "out", jobName);
const scale = Number(flag("scale") ?? 1);
fs.mkdirSync(outDir, { recursive: true });

const probe = (file) => {
  const json = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { encoding: "utf8" }),
  );
  const v = json.streams.find((s) => s.codec_type === "video");
  const rotated = v && Math.abs(Number(v.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? v.tags?.rotate ?? 0)) === 90;
  return {
    duration: Number(json.format.duration),
    width: v ? (rotated ? v.height : v.width) : 0,
    height: v ? (rotated ? v.width : v.height) : 0,
  };
};

const loadCaptions = (mediaFile) => {
  const capFile = path.join(jobDir, job.captions ?? "captions.json");
  if (!fs.existsSync(capFile)) {
    console.log(`Transcribing ${path.basename(mediaFile)} with Whisper...`);
    execFileSync("python3", [path.join(ROOT, "scripts/transcribe.py"), mediaFile, "-o", capFile, ...(job.language ? ["--language", job.language] : [])], {
      stdio: "inherit",
    });
  }
  return JSON.parse(fs.readFileSync(capFile, "utf8")).words;
};

// Mirrors sceneTimings() in src/templates/ScriptReel.tsx.
const scriptLength = (scenes) => scenes.reduce((a, s) => a + (s.seconds ?? Math.max(1.6, s.text.split(/\s+/).length * 0.42)), 0);

let composition;
let base;
let sourceAspect = null;
if (job.template === "video") {
  const file = path.join(jobDir, job.video);
  const info = probe(file);
  const start = job.trimStart ?? 0;
  const end = Math.min(job.trimEnd ?? info.duration, info.duration);
  sourceAspect = info.width / info.height;
  composition = "VideoReel";
  base = {
    video: job.video,
    trimStart: start,
    hook: job.hook,
    captionStyle: job.captionStyle ?? "highlight",
    durationInSeconds: end - start,
  };
  if (base.captionStyle !== "none") base.captions = loadCaptions(file);
} else {
  composition = "ScriptReel";
  const cta = job.cta ? 2.5 : 0;
  base = { scenes: job.scenes, cta: job.cta, voiceover: job.voiceover, captionStyle: job.captionStyle ?? "none" };
  if (job.voiceover) {
    base.durationInSeconds = probe(path.join(jobDir, job.voiceover)).duration + 0.4 + cta;
    if (base.captionStyle !== "none") base.captions = loadCaptions(path.join(jobDir, job.voiceover));
  } else {
    base.durationInSeconds = scriptLength(job.scenes) + cta;
  }
}
Object.assign(base, { brand, music: job.music, musicVolume: job.musicVolume, source: job.source });

// Prefer a preinstalled headless Chromium (cloud containers); otherwise Remotion downloads its own.
const findBrowser = () => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const dir = "/opt/pw-browsers";
  if (!fs.existsSync(dir)) return undefined;
  for (const d of fs.readdirSync(dir).filter((d) => d.startsWith("chromium_headless_shell")).sort().reverse()) {
    const p = path.join(dir, d, "chrome-linux", "headless_shell");
    if (fs.existsSync(p)) return p;
  }
  return undefined;
};
const browserExecutable = findBrowser();
const logLevel = process.env.REMOTION_LOG ?? "error";

console.log(`Bundling (${jobName})...`);
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: jobDir });

const presets = [...new Set(platforms.flatMap((p) => (PLATFORMS[p] ?? []).map(([preset]) => preset)))];
const rendered = {};
for (const preset of presets) {
  const [w, h] = PRESETS[preset];
  const fit = job.fit && job.fit !== "auto" ? job.fit : sourceAspect && Math.abs(sourceAspect - w / h) / (w / h) > 0.35 ? "blur" : "cover";
  const inputProps = { ...base, preset, fit };
  const comp = await selectComposition({ serveUrl, id: composition, inputProps, browserExecutable, logLevel });
  const file = path.join(outDir, `${jobName}_${preset}.mp4`);
  console.log(`Rendering ${preset} (${w}x${h}, ${base.durationInSeconds.toFixed(1)}s)...`);
  let last = -1;
  await renderMedia({
    serveUrl,
    composition: comp,
    inputProps,
    codec: "h264",
    crf: 18,
    pixelFormat: "yuv420p",
    audioCodec: "aac",
    enforceAudioTrack: true,
    scale,
    browserExecutable,
    logLevel,
    outputLocation: file,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) process.stdout.write(`  ${pct}%${pct === 100 ? "\n" : ""}`), (last = pct);
    },
  });
  await renderStill({
    serveUrl,
    composition: comp,
    inputProps,
    frame: Math.min(comp.durationInFrames - 1, Math.round(comp.fps * 1.2)),
    output: path.join(outDir, `${jobName}_${preset}_thumb.png`),
    scale: 0.5,
    browserExecutable,
    logLevel,
  });
  rendered[preset] = file;
}

// One file per platform, named for where it gets posted.
const results = [];
for (const p of platforms) {
  for (const [preset, name] of PLATFORMS[p] ?? []) {
    const [w, h] = PRESETS[preset];
    const target = path.join(outDir, `${name}_${w}x${h}.mp4`);
    fs.copyFileSync(rendered[preset], target);
    results.push(target);
  }
}
for (const f of Object.values(rendered)) fs.rmSync(f);

const dest = flag("out");
if (dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(outDir)) fs.copyFileSync(path.join(outDir, f), path.join(dest, f));
}
console.log("\nDone:");
for (const r of results) console.log("  " + (dest ? path.join(dest, path.basename(r)) : r));
