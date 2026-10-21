# reels-studio

Script or raw video in, platform-ready reels out: Instagram Reels, YouTube Shorts,
LinkedIn (4:5 and 1:1) and X (16:9 and 1:1), with animated captions and motion graphics.

Built on [Remotion](https://remotion.dev) + FFmpeg + [faster-whisper](https://github.com/SYSTRAN/faster-whisper).
See [CLAUDE.md](CLAUDE.md) for the full workflow and `job.json` reference.

## Set up on a Mac (MacBook Air etc.)

1. Install [Homebrew](https://brew.sh) if you don't have it.
2. Clone and run setup (installs Node, FFmpeg, Python, Remotion and Whisper):
   ```sh
   git clone https://github.com/akbarbadsha25/reels-studio.git
   cd reels-studio
   ./scripts/setup.sh
   ```
3. Try it:
   ```sh
   node scripts/render.mjs example-script
   open out/example-script
   ```

Apple Silicon renders noticeably faster than a cloud container. The first Whisper run
downloads its model (~500 MB for `small`).

## Everyday use

```sh
# From a script (paragraphs become scenes)
node scripts/new-job.mjs my-tip --script ~/Desktop/script.txt
node scripts/render.mjs my-tip

# From raw footage (auto-captions, hook headline, every format)
node scripts/new-job.mjs my-vlog --video ~/Desktop/raw.mov --hook "I tried this for 30 days"
python3 scripts/footage.py jumpcut jobs/my-vlog/raw.mov jobs/my-vlog/cut.mp4   # optional
node scripts/render.mjs my-vlog
```

Outputs land in `out/<job>/`. Edit `brand.json` for your colours, font and @handle.
Live preview/editor: `npx remotion studio --public-dir jobs/<job>`.

## Optional: AI voiceover

Set `ELEVENLABS_API_KEY` (in your shell, or as an environment secret in Claude cloud
environments), then `python3 scripts/voiceover.py jobs/<job>`.

Remotion is free for individuals and companies of up to 3 people; larger companies need a
[company licence](https://remotion.pro).
