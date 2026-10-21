# Worked example: a Linear-style changelog reference

Two short product-changelog films in the now-familiar "Linear style": real UI on a borderless tilted
plane, a slow camera that never stops, and fast, precise UI micro-animations. One is a **mobile** cut (20.8 s)
and one a **desktop** cut (13.5 s).

> **No media here.** The reference videos and frames are copyrighted and deliberately not part of this repo.
> This page holds **numbers only**: what the measurement found and the brief we wrote from it. We used it
> to produce two original SaaS feature-launch films.

Measured at 1920×1080, 24 fps, with the precursor of `camera_track.py` (Shi-Tomasi + pyramidal LK +
RANSAC similarity, per-shot medians). Cuts were verified frame by frame on contact sheets. Optics and audio
were transcribed by eye and ear; this version of the tool can now measure them too.

---

## Measurements

### Reference 1: mobile cut (20.84 s)

| # | in → out (s) | dur (s) | vx, vy (px/s) | speed px/s | %W/s | speed cv | scale %/s | Δscale in shot | read as |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.000 → 2.625 | 2.63 | −22.7, +8.7 | **24.6** | 1.28 | 0.10 | +1.17 | +3.1 % | truck-right + push-in |
| 2 | 2.625 → 10.292 | 7.67 | +5.4, −18.8 | **19.7** | 1.02 | 0.12 | −0.50 | −3.8 % | pedestal-down, slight pull |
| 3 | 10.292 → 14.917 | 4.63 | −20.2, −3.0 | **20.5** | 1.07 | 0.04 | +1.79 | +8.3 % | truck-right + push-in |
| 4 | 14.917 → 17.292 | 2.38 | +23.5, +23.7 | **33.5** | 1.74 | 0.02 | −2.92 | −6.8 % | diagonal + pull-out |
| 5 | 17.292 → 20.842 | 3.54 | 0, 0 | 0 | 0 | — | 0 | 0 | static end card |

UI shots: median **≈ 21 px/s (≈ 1.1 %W/s)**, range 19.7–33.5 px/s; durations 2.4–7.7 s (mean 4.3 s).

### Reference 2: desktop cut (13.54 s)

| # | in → out (s) | dur (s) | vx, vy (px/s) | speed px/s | %W/s | speed cv | scale %/s | Δscale in shot | read as |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.000 → 3.375 | 3.38 | −16.1, −44.5 | **47.3** | 2.46 | 0.05 | +1.74 | +5.7 % | pedestal-down + push-in |
| 2 | 3.375 → 7.667 | 4.29 | −51.3, +12.9 | **52.8** | 2.75 | 0.03 | +0.81 | +3.4 % | truck-right + push-in |
| 3 | 7.667 → 13.542 | 5.88 | −69.3, +12.9 | **70.5** | 3.67 | 0.07 | +1.16 | +7.0 % | truck-right + push-in |

Median **≈ 53 px/s (≈ 2.75 %W/s)**, range 47–71 px/s; durations 3.4–5.9 s (mean 4.5 s); no end card.

### What the numbers say

- **Constant velocity.** Speed cv is 0.02–0.12 in every UI shot: no easing on the lens.
- **The camera never stops.** The slowest frame of any UI shot still moves ≥ 15 px/s. Every shot enters
  already moving and is cut while still moving.
- **Slow, but not the same slow.** 20–70 px/s at 1080p (1.0–3.7 %W/s). The mobile cut is about 2.5× slower in
  pixels than the desktop cut.
- **Push-in is the default scale move:** +0.8 to +1.8 %/s, about 3–8 % per shot.
- **Pull-outs exist but are rare.** Two mobile shots shrink slightly (−3.8 %, −6.8 %).
- **Hard cuts only**, 0 frames, with shots of 2.4–7.7 s.

---

## The recreation brief we wrote from it

> **Distilled spec:** 16:9 1920×1080 at 24 fps, 14–21 s, 3–5 shots of 4–7 s joined by 0-frame hard cuts
> (optional static end card ≈ 4 s, no effects). Real UI on a borderless 3D plane (pitch back 15–25°, yaw
> 10–15°) floating on a plain background. Camera: **linear and continuous**, one move per shot at
> 35–55 px/s of in-focus subject motion (≈ 1.8–2.9 %W/s), push-in ≤ +1.5 %/s, scale never decreases, no
> frame ever static. Optics: ultra-shallow tilt-shift band locked on the subject, optical bokeh above and
> below, soft bloom, fine grain, light vignette, very subtle chromatic aberration in the defocused edges.
> Audio: minimal ambient electronic bed with slow synth pulses; the only SFX is realistic typing synced
> to on-screen text; nothing on the cuts.

### Camera rules

- The camera **never stops**. It moves the whole film at low, constant, linear speed (no ease-in/out), with no
  static frame. Each shot starts moving and is cut moving.
- **Never pull out.** Scale only grows inside a shot; a wider framing arrives by cutting to a new shot.
- One move per shot: slow push-in, slow truck, gentle pedestal, or a combination of them. No whip, orbit, shake or fast zoom.
- Targets: **35–55 px/s** (between the mobile and desktop references), push-in **≤ +1.5 %/s**, speed
  variation inside a shot ≤ 12 %, slowest frame ≥ 15 px/s.

### Optics (transcribed by eye)

- Ultra-shallow DOF in tilt-shift style: a thin horizontal/diagonal sharp band; heavy *optical* bokeh
  (disc lens blur, not a flat gaussian) above and below.
- Focal plane fixed on the subject of the shot, with no rack focus.
- Soft bloom/halation on bright elements and accents, fine film grain everywhere, light vignette, and very
  subtle chromatic aberration only where the image is defocused.

### Editing & pacing

- 0-frame hard cuts only: no dissolve, blur transition or whip.
- Shots of about 4–7 s, few cuts. Open on a macro of a header/context, move down into the action, and close
  on a wider shot. The wider framing comes **from the cut**, never from a pull-out.

### UI action vs camera (the contrast that sets the tone)

- Slow, ambient camera vs fast, precise UI micro-animations.
- Real actions: typing in an input with a caret, counters ticking up, progress bars drawing, pills
  entering and pushing their neighbours, % rings filling.
- No mouse cursor unless it's part of the action. Prefer the UI acting on its own.

### Audio (transcribed by ear)

- Minimal ambient electronic bed, slow synth pulses, focused/technical mood, fade out on the end card.
- Only SFX: realistic typing synced to the text. No whoosh, hit or click on the cuts.

### Do / Don't

- ✅ Linear camera tweens (`ease: "none"`), 35–55 px/s, push-in ≤ +1.5 %/s, shots 4–7 s.
- ✅ Enter every shot moving; cut while moving.
- ✅ Let the real UI do the action; keep the subject inside the sharp band.
- ❌ No pull-out, no zoom-out, no reversing scale mid-shot.
- ❌ No text overlays, CTAs, fake "ghost" cards, cursor theatre, transitions or strongly eased moves.
- ❌ Don't crop the important element at the end of a push-in.
- ❌ Don't copy the reference's theme, palette or branding.

### Deviations from the reference (logged on purpose)

| what | reference | ours | why |
|---|---|---|---|
| scale reversals | 2 mobile shots pull out slightly (−3.8 %, −6.8 %) | scale never decreases | a continuous forward glide read better for product launches |
| speed | 21 px/s (mobile) / 53 px/s (desktop) | 35–55 px/s | one target that works on both laptop and phone playback |

---

## Did the recreation hit the brief? (measured on our renders)

Two original feature-launch films were rendered from this brief and measured with the same tools
(LK tracker + an independent ORB tracker, plus a magenta-stage render to prove the tilted plane never
exposes its edge):

| gate | target | film A (4 shots) | film B (7 shots) |
|---|---|---|---|
| camera speed | 35–55 px/s | 40–47 px/s | 41–47 px/s¹ |
| push-in | ≤ +1.5 %/s | +0.73 to +0.91 %/s | +0.4 to +1.4 %/s |
| slowest frame | ≥ 15 px/s | 30 px/s | ≥ 40 px/s |
| pull-out windows (0.5 s) | 0 | 0 | 0 camera (reflow-only windows flagged) |
| shot durations | 4–7 s | 4.0–6.25 s | 3.0–4.3 s² |
| plane edge visible | 0 % | visible from ~11 s (fixed in the next film) | 0.000 % of pixels, all frames |

¹ Measured the same way as the references (per-frame similarity translation). `camera_track.py` reports
centre-only speed, which reads 27–30 px/s on film B's two push-in-heavy shots and 41–46 px/s on the rest.
² Film B deliberately used more, shorter shots and a new angle/move on every cut (a logged deviation).

Lessons that became features of this tool: UI reflows fake both **cuts** and **pull-outs** (now rejected
by trajectory continuity and reported as `reflow_suspect`), and per-frame scale fits over-read slow zooms
(rates now come from 0.5 s window fits).
