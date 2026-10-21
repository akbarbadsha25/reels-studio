#!/usr/bin/env python3
"""FFmpeg helpers for raw footage.

    python3 scripts/footage.py info raw.mp4
    python3 scripts/footage.py trim raw.mp4 out.mp4 --start 3.5 --end 42
    python3 scripts/footage.py jumpcut raw.mp4 out.mp4 [--threshold -35] [--min-silence 0.45] [--pad 0.08]
    python3 scripts/footage.py normalize raw.mp4 out.mp4          # loudness to -14 LUFS (social standard)
    python3 scripts/footage.py resize raw.mp4 out.mp4 --preset 9x16 [--mode blur|crop]
    python3 scripts/footage.py extract-audio raw.mp4 out.wav
"""
import argparse
import json
import re
import subprocess
import sys

PRESETS = {"9x16": (1080, 1920), "4x5": (1080, 1350), "1x1": (1080, 1080), "16x9": (1920, 1080)}
ENCODE = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart"]


def run(cmd):
    print("+", " ".join(cmd), file=sys.stderr)
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path]).stdout
    return float(json.loads(out)["format"]["duration"])


def info(a):
    out = run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", a.input]).stdout
    d = json.loads(out)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"), {})
    print(json.dumps({"duration": float(d["format"]["duration"]), "width": v.get("width"), "height": v.get("height"),
                      "fps": v.get("r_frame_rate"), "has_audio": any(s["codec_type"] == "audio" for s in d["streams"])}, indent=1))


def trim(a):
    cmd = ["ffmpeg", "-y", "-ss", str(a.start), "-i", a.input]
    if a.end is not None:
        cmd += ["-t", str(a.end - a.start)]
    run(cmd + ENCODE + [a.output])


def jumpcut(a):
    """Remove silent gaps (classic talking-head jump cuts)."""
    log = subprocess.run(["ffmpeg", "-i", a.input, "-af", f"silencedetect=noise={a.threshold}dB:d={a.min_silence}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total = duration(a.input)
    keep, cursor = [], 0.0
    for s, e in zip(starts, ends + [total] * (len(starts) - len(ends))):
        if s - cursor > 0.05:
            keep.append((max(0, cursor - a.pad), min(total, s + a.pad)))
        cursor = e
    if total - cursor > 0.05:
        keep.append((max(0, cursor - a.pad), total))
    if not keep:
        sys.exit("everything is silent; try a lower --threshold")
    expr = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in keep)
    run(["ffmpeg", "-y", "-i", a.input, "-vf", f"select='{expr}',setpts=N/FRAME_RATE/TB",
         "-af", f"aselect='{expr}',asetpts=N/SR/TB"] + ENCODE + [a.output])
    kept = sum(e - s for s, e in keep)
    print(f"kept {kept:.1f}s of {total:.1f}s in {len(keep)} segments -> {a.output}")


def normalize(a):
    run(["ffmpeg", "-y", "-i", a.input, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", a.output])


def resize(a):
    w, h = PRESETS[a.preset]
    if a.mode == "crop":
        vf = f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1"
        run(["ffmpeg", "-y", "-i", a.input, "-vf", vf] + ENCODE + [a.output])
    else:
        fc = (f"[0:v]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=30:5,eq=brightness=-0.15[bg];"
              f"[0:v]scale={w}:{h}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[v]")
        run(["ffmpeg", "-y", "-i", a.input, "-filter_complex", fc, "-map", "[v]", "-map", "0:a?"] + ENCODE + [a.output])


def extract_audio(a):
    run(["ffmpeg", "-y", "-i", a.input, "-vn", "-ac", "1", "-ar", "16000", a.output])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("info"); p.add_argument("input"); p.set_defaults(fn=info)
    p = sub.add_parser("trim"); p.add_argument("input"); p.add_argument("output")
    p.add_argument("--start", type=float, default=0); p.add_argument("--end", type=float); p.set_defaults(fn=trim)
    p = sub.add_parser("jumpcut"); p.add_argument("input"); p.add_argument("output")
    p.add_argument("--threshold", type=float, default=-35); p.add_argument("--min-silence", type=float, default=0.45)
    p.add_argument("--pad", type=float, default=0.08); p.set_defaults(fn=jumpcut)
    p = sub.add_parser("normalize"); p.add_argument("input"); p.add_argument("output"); p.set_defaults(fn=normalize)
    p = sub.add_parser("resize"); p.add_argument("input"); p.add_argument("output")
    p.add_argument("--preset", choices=PRESETS, required=True); p.add_argument("--mode", choices=["blur", "crop"], default="blur")
    p.set_defaults(fn=resize)
    p = sub.add_parser("extract-audio"); p.add_argument("input"); p.add_argument("output"); p.set_defaults(fn=extract_audio)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
