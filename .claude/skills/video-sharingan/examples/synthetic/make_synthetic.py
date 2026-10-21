#!/usr/bin/env python3
"""Generate a synthetic "launch video" with an exactly known camera, edit and audio.

Frames are rendered with sub-pixel-exact affine warps of a procedurally drawn
UI canvas (numpy/OpenCV) and encoded by ffmpeg (H.264 + AAC). Everything the
analyzer should find is written to ground_truth.json.

usage: make_synthetic.py [outdir]   -> outdir/synthetic.mp4 + outdir/ground_truth.json
"""
import json
import math
import subprocess
import sys
import wave
from pathlib import Path

import cv2
import numpy as np

W, H, FPS = 1280, 720, 24
C = np.array([W / 2, H / 2])
SR = 48000
BPM = 120

# shot plan (content velocity u in SCREEN px/s; k = log-scale rate per second; z0 = start zoom)
SHOTS = [
    dict(frames=84, center=(1200, 900), z0=1.0, u=(-40, 0), k=0.0, ease="linear",
         move="truck-right", events=[1.25]),
    dict(frames=90, center=(2600, 900), z0=1.6, u=(0, 0), k=0.015, ease="linear",
         move="push-in", tiltshift=True),
    dict(frames=78, center=(3900, 1000), z0=1.0, travel=(0, 160), k=0.0, ease="power1.inOut",
         move="pedestal-up"),
    dict(frames=78, center=(1300, 2200), z0=1.0, u=(0, 0), k=-0.02, ease="linear",
         move="pull-out"),
    dict(frames=66, center=(2700, 2300), z0=0.6, u=(0, 0), k=0.0, ease="none",
         move="static", events=[0.875, 1.625]),
    dict(frames=84, center=(4000, 2300), z0=1.0, u=(-50, 18), k=0.012, ease="linear",
         move="truck-right+pedestal-up+push-in"),
]


def ease(name, x):
    if name == "power1.inOut":  # GSAP power1 = quad
        return 2 * x * x if x < 0.5 else 1 - (-2 * x + 2) ** 2 / 2
    return x


def make_canvas(seed=7):
    rng = np.random.default_rng(seed)
    cw, ch = 5400, 3300
    img = np.full((ch, cw, 3), (242, 238, 236), np.uint8)  # BGR light UI background
    words = ["Inbox", "Assigned", "Review", "Done", "Status", "Priority", "Sprint", "Cycle",
             "Filter", "Label", "Owner", "Update", "Launch", "Roadmap", "Issue", "Backlog"]
    for y in range(60, ch - 200, 230):
        for x in range(60, cw - 300, 330):
            if rng.random() < 0.12:
                continue
            w, h = int(rng.integers(220, 310)), int(rng.integers(150, 210))
            col = tuple(int(v) for v in rng.integers(200, 255, 3))
            cv2.rectangle(img, (x, y), (x + w, y + h), col, -1)
            cv2.rectangle(img, (x, y), (x + w, y + h), (180, 180, 185), 2)
            acc = tuple(int(v) for v in rng.integers(30, 220, 3))
            cv2.circle(img, (x + 24, y + 26), 11, acc, -1)
            cv2.putText(img, " ".join(rng.choice(words, 2)), (x + 44, y + 34),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.62, (40, 40, 48), 2, cv2.LINE_AA)
            for j in range(3):
                ln = int(rng.integers(60, w - 40))
                cv2.line(img, (x + 18, y + 64 + j * 26), (x + 18 + ln, y + 64 + j * 26), (120, 120, 130), 3)
            cv2.putText(img, f"#{int(rng.integers(100, 9999))}", (x + 18, y + h - 16),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (90, 90, 100), 1, cv2.LINE_AA)
    return img


def tiltshift(frame):
    blur = cv2.GaussianBlur(frame, (0, 0), 7)
    yy = np.abs(np.arange(H) - H / 2)
    m = np.clip((yy - 70) / 160, 0, 1).astype(np.float32)[:, None, None]
    return (frame * (1 - m) + blur * m).astype(np.float32)


def render(outdir: Path):
    outdir.mkdir(parents=True, exist_ok=True)
    canvas = make_canvas()
    yy, xx = np.mgrid[0:H, 0:W]
    rr2 = (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 2
    vign = (1 - 0.30 * rr2).astype(np.float32)[..., None]
    rng = np.random.default_rng(1)
    vid = outdir / "_video.mp4"
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16",
                            "-preset", "medium", "-pix_fmt", "yuv420p", str(vid)], stdin=subprocess.PIPE)
    gt_shots, ui_events, cut_frames = [], [], []
    f0 = 0
    for si, s in enumerate(SHOTS):
        n = s["frames"]
        if si:
            cut_frames.append(f0)
        base = canvas
        z_base = 1.0
        if s["z0"] < 0.9:  # pre-filter big zoom-outs to avoid aliasing
            z_base = s["z0"]
            base = cv2.resize(canvas, None, fx=z_base, fy=z_base, interpolation=cv2.INTER_AREA)
        c = np.array(s["center"], float) * z_base
        z = s["z0"] / z_base
        ev_frames = [f0 + int(round(t * FPS)) for t in s.get("events", [])]
        travel = np.array(s.get("travel", (0, 0)), float)
        cur = base
        for i in range(n):
            gf = f0 + i
            if i > 0:
                z_new = z * math.exp(s["k"] / FPS)
                if "travel" in s:
                    d = travel * (ease(s["ease"], i / (n - 1)) - ease(s["ease"], (i - 1) / (n - 1)))
                else:
                    d = np.array(s["u"], float) / FPS
                # centre translation on screen = z_new*(c_old - c_new) = d
                c = c - d / z_new
                z = z_new
            if gf in ev_frames:  # instantaneous UI state change, drawn in content space
                cur = cur.copy()
                p = (c + (np.array([140, -60]) + 40 * len(ui_events)) / z).astype(int)
                cv2.rectangle(cur, tuple(p), tuple(p + int(90 / z)), (40, 60, 230), -1)
                ui_events.append(dict(frame=gf, time_s=round(gf / FPS, 4), shot=si + 1))
            M = np.array([[z, 0, C[0] - z * c[0]], [0, z, C[1] - z * c[1]]])
            fr = cv2.warpAffine(cur, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
            if s.get("tiltshift"):
                fr = tiltshift(fr)
            fr = fr * vign + rng.normal(0, 2.0, (H, W, 1)).astype(np.float32)
            enc.stdin.write(np.clip(fr + 0.5, 0, 255).astype(np.uint8).tobytes())
        u = np.array(s.get("u", (0, 0)), float)
        gt_shots.append(dict(
            index=si + 1, start_frame=f0, end_frame=f0 + n, dur_s=round(n / FPS, 4), move=s["move"],
            content_vx_px_s=u[0], content_vy_px_s=u[1], center_speed_px_s=round(float(np.hypot(*u)), 3),
            travel_px=list(travel) if "travel" in s else None,
            scale_pct_s=round(100 * (math.exp(s["k"]) - 1), 4), scale_total_pct=round(100 * (math.exp(s["k"] * (n - 1) / FPS) - 1), 3),
            ease=s["ease"], never_stops=s["ease"] == "linear", pull_out=s["k"] < 0,
            static=s["move"] == "static", zoom=s["z0"], tiltshift=bool(s.get("tiltshift"))))
        f0 += n
    enc.stdin.close()
    enc.wait()
    total = f0 / FPS

    # ---- audio: 120 BPM kick + sustained pad (= music) and short ticks on UI events (= SFX)
    t = np.arange(int(total * SR)) / SR
    a = 0.045 * (np.sin(2 * np.pi * 220 * t) + np.sin(2 * np.pi * 277.18 * t) + np.sin(2 * np.pi * 329.63 * t))
    beats = np.arange(0, total, 60 / BPM)
    for b in beats:
        i0 = int(b * SR)
        L = int(0.18 * SR)
        tt = np.arange(L) / SR
        seg = 0.6 * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.06) * np.minimum(1, (L - np.arange(L)) / (0.04 * SR))
        seg[: int(0.002 * SR)] += 0.4 * np.random.default_rng(int(b * 10)).uniform(-1, 1, int(0.002 * SR))
        a[i0:i0 + L] += seg[: len(a) - i0]
    for e in ui_events:
        i0 = int(e["time_s"] * SR)
        L = int(0.006 * SR)
        tt = np.arange(L) / SR
        a[i0:i0 + L] += 0.5 * np.sin(2 * np.pi * 2400 * tt) * np.hanning(L)
    a = np.clip(a, -1, 1)
    wav = outdir / "_audio.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((a * 32767).astype("<i2").tobytes())
    out = outdir / "synthetic.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(vid), "-i", str(wav), "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(out)], check=True)
    vid.unlink()
    wav.unlink()
    cut_times = [cf / FPS for cf in cut_frames]
    gt = dict(
        width=W, height=H, fps=FPS, frames=f0, duration_s=total,
        cut_frames=cut_frames, cut_times_s=[round(x, 4) for x in cut_times],
        cuts_on_beat=[abs(ct * BPM / 60 - round(ct * BPM / 60)) < 1e-6 for ct in cut_times],
        shots=gt_shots, ui_events=ui_events,
        audio=dict(bpm=BPM, music=True, sfx_on_ui_events=True, sfx_on_cuts=False),
        look=dict(vignette_corner_falloff=0.30, grain_sigma_prencode=2.0, tiltshift_shot=2),
        notes="content velocity is on-screen motion of the subject; the camera moves the opposite way.",
    )
    (outdir / "ground_truth.json").write_text(json.dumps(gt, indent=2) + "\n")
    return out


if __name__ == "__main__":
    o = render(Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent))
    print(o)
