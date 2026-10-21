#!/usr/bin/env node
// Scaffold a job folder from a script or a raw video.
//   node scripts/new-job.mjs <name> --script script.txt     (blank-line separated paragraphs become scenes)
//   node scripts/new-job.mjs <name> --video raw.mp4 [--hook "Headline"]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [name, ...rest] = process.argv.slice(2);
const opt = (k) => {
  const i = rest.indexOf(`--${k}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
if (!name || (!opt("script") && !opt("video"))) {
  console.error('usage: new-job.mjs <name> --script file.txt | --video file.mp4 [--hook "text"]');
  process.exit(1);
}
const dir = path.join(ROOT, "jobs", name);
fs.mkdirSync(dir, { recursive: true });

let job;
if (opt("script")) {
  const text = fs.readFileSync(opt("script"), "utf8").trim();
  const paras = text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  job = { template: "script", scenes: paras.map((text) => ({ text })), cta: "Follow for more", platforms: ["instagram", "youtube", "linkedin", "x"] };
} else {
  const src = opt("video");
  const ext = path.extname(src) || ".mp4";
  fs.copyFileSync(src, path.join(dir, `raw${ext}`));
  job = { template: "video", video: `raw${ext}`, hook: opt("hook"), captionStyle: "highlight", fit: "auto", platforms: ["instagram", "youtube", "linkedin", "x"] };
}
fs.writeFileSync(path.join(dir, "job.json"), JSON.stringify(job, null, 2));
console.log(`created ${path.relative(ROOT, dir)}/job.json`);
