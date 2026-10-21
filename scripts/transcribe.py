#!/usr/bin/env python3
"""Word-level transcription with faster-whisper.

    python3 scripts/transcribe.py input.mp4 -o captions.json [--model small] [--language en]

Writes {"language", "text", "words": [{text, start, end}]} plus an .srt beside it.
"""
import argparse
import json
import os
from pathlib import Path

from faster_whisper import WhisperModel


def srt_time(t):
    h, rem = divmod(int(t * 1000), 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("-o", "--output", default="captions.json")
    ap.add_argument("--model", default=os.environ.get("WHISPER_MODEL", "small"))
    ap.add_argument("--language", default=None)
    args = ap.parse_args()

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(args.input, word_timestamps=True, language=args.language, vad_filter=True)

    words, lines = [], []
    for seg in segments:
        lines.append(seg)
        for w in seg.words or []:
            words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

    out = Path(args.output)
    out.write_text(json.dumps({"language": info.language, "text": " ".join(s.text.strip() for s in lines), "words": words}, indent=1))
    srt = [f"{i}\n{srt_time(s.start)} --> {srt_time(s.end)}\n{s.text.strip()}\n" for i, s in enumerate(lines, 1)]
    out.with_suffix(".srt").write_text("\n".join(srt))
    print(f"{len(words)} words ({info.language}) -> {out}")


if __name__ == "__main__":
    main()
