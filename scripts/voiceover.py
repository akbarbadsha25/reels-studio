#!/usr/bin/env python3
"""Optional AI voiceover via ElevenLabs. Needs ELEVENLABS_API_KEY in the environment.

    python3 scripts/voiceover.py jobs/my-reel            # reads job.json scenes, writes vo.mp3, sets "voiceover"
    python3 scripts/voiceover.py --text "Hello" -o vo.mp3

Voice: ELEVENLABS_VOICE_ID env var or --voice (default "Rachel").
"""
import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path


def tts(text, voice, out):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set. Add it as an environment secret (see CLAUDE.md), or record the voiceover yourself.")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    with urllib.request.urlopen(req) as r:
        Path(out).write_bytes(r.read())
    print(f"voiceover -> {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("job", nargs="?")
    ap.add_argument("--text")
    ap.add_argument("-o", "--output", default="vo.mp3")
    ap.add_argument("--voice", default=os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"))
    a = ap.parse_args()
    if a.text:
        return tts(a.text, a.voice, a.output)
    job_dir = Path(a.job)
    job = json.loads((job_dir / "job.json").read_text())
    text = " ".join(s["text"].replace("*", "") for s in job["scenes"])
    tts(text, a.voice, job_dir / "vo.mp3")
    job["voiceover"] = "vo.mp3"
    (job_dir / "job.json").write_text(json.dumps(job, indent=2))


if __name__ == "__main__":
    main()
