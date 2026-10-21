#!/usr/bin/env python3
"""Compare a sharingan analysis of the synthetic reel against its ground truth.

usage: check.py ground_truth.json analysis.json [-o results.md]
Exit code 1 if any check fails. Also imported by tests/test_synthetic.py.
"""
import json
import math
import sys
from pathlib import Path

def checks(gt, an):
    rows = []

    def add(name, truth, measured, ok, tol=""):
        rows.append({"check": name, "truth": truth, "measured": measured, "tol": tol, "ok": bool(ok)})

    cuts = [c["frame"] for c in an["edit"]["cuts"]]
    add("cut frames", gt["cut_frames"], cuts, cuts == gt["cut_frames"], "exact")
    cam = {s["index"]: s for s in an["camera"]["shots"]}
    foc = {s["index"]: s for s in an["focus"]["shots"]}
    for g in gt["shots"]:
        m = cam[g["index"]]
        i = g["index"]
        add(f"shot {i} duration (s)", g["dur_s"], m["dur_s"], abs(m["dur_s"] - g["dur_s"]) <= 1 / gt["fps"] + 1e-6, "±1 frame")
        tm = set(g["move"].split("+"))
        mm = set(m["move"].split("+"))
        add(f"shot {i} move", g["move"], m["move"], tm == mm, "same labels")
        if g["travel_px"]:
            tr = math.hypot(*g["travel_px"])
            mt = math.hypot(*m["travel_px"])
            add(f"shot {i} travel (px)", round(tr, 1), round(mt, 1), abs(mt - tr) <= 0.03 * tr, "±3%")
        elif g["center_speed_px_s"] > 0:
            add(f"shot {i} speed (px/s)", g["center_speed_px_s"], m["center_speed_px_s"],
                abs(m["center_speed_px_s"] - g["center_speed_px_s"]) <= 0.03 * g["center_speed_px_s"], "±3%")
            add(f"shot {i} vx, vy (px/s)", [g["content_vx_px_s"], g["content_vy_px_s"]], [m["vx_px_s"], m["vy_px_s"]],
                abs(m["vx_px_s"] - g["content_vx_px_s"]) <= 1.5 and abs(m["vy_px_s"] - g["content_vy_px_s"]) <= 1.5, "±1.5 px/s")
        else:
            add(f"shot {i} speed (px/s)", 0.0, m["center_speed_px_s"], abs(m["center_speed_px_s"]) <= 1.0, "≤1 px/s")
        add(f"shot {i} scale (%/s)", g["scale_pct_s"], m["scale_pct_s"], abs(m["scale_pct_s"] - g["scale_pct_s"]) <= 0.08, "±0.08")
        add(f"shot {i} total scale (%)", g["scale_total_pct"], m["scale_total_pct"], abs(m["scale_total_pct"] - g["scale_total_pct"]) <= 0.3, "±0.3")
        if g["ease"] != "none":
            add(f"shot {i} ease", g["ease"], (m.get("ease") or {}).get("best"), (m.get("ease") or {}).get("best") == g["ease"], "exact")
        if not g["static"]:
            add(f"shot {i} never stops", g["never_stops"], m["never_stops"], m["never_stops"] == g["never_stops"], "exact")
        add(f"shot {i} pull-out flag", g["pull_out"], m["pull_out"]["detected"], m["pull_out"]["detected"] == g["pull_out"], "exact")
        dof = foc[i]["dof"]
        want = "shallow-band" if g["tiltshift"] else "deep"
        add(f"shot {i} DOF", want, dof, dof == want, "exact")
    ev = [e["frame"] for e in an["camera"]["ui_events"]]
    gev = [e["frame"] for e in gt["ui_events"]]
    add("UI event frames", gev, ev, ev == gev, "exact")
    eh = {i: foc[i]["element_height_pct_h"] for i in foc}
    add("framing order (zoom 1.6 > 1.0 > 0.6)", "shot2 > shot1 > shot5", [eh[2], eh[1], eh[5]], eh[2] > eh[1] > eh[5], "ordering")
    au = an["audio"]
    add("tempo (BPM)", gt["audio"]["bpm"], au["tempo_bpm"], abs(au["tempo_bpm"] - gt["audio"]["bpm"]) <= 1.0, "±1")
    onb = [c["on_beat"] for c in au["cuts"]["per_cut"]]
    add("cuts on beat", gt["cuts_on_beat"], onb, onb == gt["cuts_on_beat"], "exact")
    add("audio class", "music+sfx", au["class"], au["class"] == "music+sfx", "exact")
    sync = [x["nearest_onset_ms"] for x in au["ui_events"]["per_event"]]
    add("SFX→UI sync (ms)", "0 (ticks on UI frames)", sync, all(x is not None and x <= 1000 / gt["fps"] for x in sync), "≤1 frame")
    lk = an["look"]
    add("vignette detected", "corner falloff 0.30 at extreme corner", lk["vignette"]["corner_falloff"],
        0.15 <= lk["vignette"]["corner_falloff"] <= 0.35, "0.15–0.35 (ring r>0.85)")
    add("grain detected", "σ 2.0 before x264", lk["grain"]["sigma_8bit"], 0.8 <= lk["grain"]["sigma_8bit"] <= 2.5, "0.8–2.5 after codec")
    return rows


def to_md(rows):
    out = ["| check | ground truth | measured | tolerance | |", "|---|---|---|---|---|"]
    for r in rows:
        out.append(f"| {r['check']} | {r['truth']} | {r['measured']} | {r['tol']} | {'✅' if r['ok'] else '❌'} |")
    n = sum(r["ok"] for r in rows)
    out.append(f"\n**{n}/{len(rows)} checks pass.**")
    return "\n".join(out)


if __name__ == "__main__":
    gt = json.loads(Path(sys.argv[1]).read_text())
    an = json.loads(Path(sys.argv[2]).read_text())
    rows = checks(gt, an)
    md = to_md(rows)
    if len(sys.argv) > 4 and sys.argv[3] == "-o":
        Path(sys.argv[4]).write_text(md + "\n")
    print(md)
    sys.exit(0 if all(r["ok"] for r in rows) else 1)
