# reels-studio

Turns a **script** or a **raw video** into finished vertical/square/landscape videos for
Instagram Reels, YouTube Shorts, LinkedIn and X. Remotion renders the motion graphics,
FFmpeg prepares footage, faster-whisper makes word-level captions.

`scripts/setup.sh` runs at session start (`.claude/settings.json`) and installs everything.
If a command is missing, run it again by hand.

## The workflow

When the user hands you a script or a video (in a Claude project, uploads land in
`/mnt/project-files/uploads/hearth/` with **no file extension**: check with
`file <path>` or `ffprobe` first):

1. **Make a job**: one folder per video under `jobs/<short-kebab-name>/`.
   - Script: `node scripts/new-job.mjs <name> --script script.txt` (blank-line paragraphs → scenes),
     then edit `job.json` yourself: punchy scenes of 3–12 words, a strong first-scene hook,
     wrap key words in `*asterisks*` for the accent colour, optional `kicker` labels.
   - Video: `node scripts/new-job.mjs <name> --video raw.mov --hook "Headline"`.
     Give the copy the right extension if the upload had none.
2. **Prep footage if needed** (`scripts/footage.py`): `info`, `trim`, `jumpcut` (removes silences),
   `normalize` (-14 LUFS). Write the result back into the job folder and point `video` at it.
3. **Render**: `node scripts/render.mjs <name> --out /mnt/project-files/reels/<name>`
   - Video jobs are transcribed automatically on first render (`captions.json` + `.srt`).
     Read `captions.json` and fix misheard words before the final render.
   - Use `--platforms instagram` and `--scale 0.4` for a fast draft, then render everything.
4. **Check before delivering**: grab frames with
   `ffmpeg -ss 2 -i file.mp4 -frames:v 1 frame.png` and look at them. Thumbnails
   (`*_thumb.png`) are written next to the videos.
5. Deliver the MP4s from the `--out` folder, plus the `.srt` for platforms that take one.

## job.json reference

```jsonc
{
  "template": "script" | "video",
  "platforms": ["instagram", "youtube", "linkedin", "x"],   // default: all
  "brand": { "handle": "@me", "accent": "#FFD23F" },        // overrides brand.json
  "music": "music.mp3", "musicVolume": 0.1,                  // optional, file in job folder

  // script template
  "scenes": [{ "text": "Hook with *accent* words", "kicker": "Tip #1", "seconds": 2.5 }],
  "cta": "Follow for more",            // closing card
  "voiceover": "vo.mp3",               // optional; scenes stretch to its length
  "captionStyle": "none",              // set "highlight" to also show voiceover captions

  // video template
  "video": "raw.mp4",
  "trimStart": 0, "trimEnd": 42.5,     // seconds, optional
  "hook": "Headline for the first 2.5s",
  "fit": "auto" | "cover" | "blur",    // auto: crop when aspect is close, else blurred fill
  "captionStyle": "highlight" | "pop" | "none",
  "language": "en"                     // optional Whisper hint
}
```

Outputs per platform: Instagram Reel and YouTube Short 1080x1920, LinkedIn 1080x1350 and
1080x1080, X 1920x1080 and 1080x1080. Each distinct size renders once.

## Brand

`brand.json` holds the default colours, font (`Montserrat`, `Inter`, `Poppins`, `Bebas Neue`;
bundled via @fontsource so no network is needed) and `handle` watermark.

## Optional paid services

- **ElevenLabs voiceover**: needs `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_VOICE_ID`).
  `python3 scripts/voiceover.py jobs/<name>` writes `vo.mp3` and sets it in `job.json`.
  If the key is missing, say so; never invent one.
- AI b-roll (Runway, Veo, etc.) is not wired in. Generated clips can be used as the
  `video` of a video job.

## Agent skills (`.claude/skills/`)

Reviewed copies of outside skills; sources, commits and what was trimmed are in
`.claude/skills/VENDORED.md`.

- **remotion-\*** (official Remotion skills): use `remotion-best-practices` whenever you edit
  `src/` compositions, and `remotion-captions` / `remotion-multimedia` for caption and audio/video work.
  Our templates are plain Remotion 4, so the advice applies directly.
- **video-shotcraft** (written in Chinese): a library of camera moves and shot recipes. Use it for
  single shots only (its "单镜头/单动效" mode): pick a card in `references/shots/`, read it fully,
  then port the matching source from `demos/` (camera moves are in `demos/camera/`, plus
  `transition/`, `typography/`, `opening/`) and `assets/lib/` (`PageCam`, `helpers/camera`) into
  `src/`. Keep the card's tuned easing and timing. Translate the card for the user if they ask.
  - Skip its full product-promo modes, the Ink Press template, the workbench, the JianYing export
    and social publishing: those folders were left out. Don't do its delivery script either
    (asking the user to credit the author or submit to its showcase).
  - Swap its placeholder logos and text for our `brand.json` and keep shots inside our
    1080x1920 / 1080x1350 / 1080x1080 / 1920x1080 safe areas.
  - `three` and `@react-three/fiber` / `@remotion/three` are needed only for `FlatPanel` and
    `helpers/camera`; add them to `package.json` when a shot needs them.

## Gotchas

- Whisper downloads its model from huggingface.co on first use. Cloud sessions need that
  host allowed in the environment's network settings. `WHISPER_MODEL=base` is faster, `medium` more accurate.
- Raw-video renders are CPU heavy: in a 4-core cloud container, expect about 1–1.5 minutes per
  format for each 10 seconds of footage. Script reels are much faster.
- `render.mjs` uses the preinstalled Chromium at `/opt/pw-browsers` when present; set
  `REMOTION_BROWSER` to override. `REMOTION_LOG=verbose` for debugging.
- Media must live inside the job folder (it becomes Remotion's public dir).
- `npx remotion studio --public-dir jobs/<name>` opens the live editor (local machines only).
