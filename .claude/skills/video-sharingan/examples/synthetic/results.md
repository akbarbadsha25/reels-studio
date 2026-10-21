| check | ground truth | measured | tolerance | |
|---|---|---|---|---|
| cut frames | [84, 174, 252, 330, 396] | [84, 174, 252, 330, 396] | exact | ✅ |
| shot 1 duration (s) | 3.5 | 3.5 | ±1 frame | ✅ |
| shot 1 move | truck-right | truck-right | same labels | ✅ |
| shot 1 speed (px/s) | 40.0 | 40.0 | ±3% | ✅ |
| shot 1 vx, vy (px/s) | [-40.0, 0.0] | [-40.0, -0.0] | ±1.5 px/s | ✅ |
| shot 1 scale (%/s) | 0.0 | -0.001 | ±0.08 | ✅ |
| shot 1 total scale (%) | 0.0 | -0.0 | ±0.3 | ✅ |
| shot 1 ease | linear | linear | exact | ✅ |
| shot 1 never stops | True | True | exact | ✅ |
| shot 1 pull-out flag | False | False | exact | ✅ |
| shot 1 DOF | deep | deep | exact | ✅ |
| shot 2 duration (s) | 3.75 | 3.75 | ±1 frame | ✅ |
| shot 2 move | push-in | push-in | same labels | ✅ |
| shot 2 speed (px/s) | 0.0 | 0.0 | ≤1 px/s | ✅ |
| shot 2 scale (%/s) | 1.5113 | 1.51 | ±0.08 | ✅ |
| shot 2 total scale (%) | 5.72 | 5.71 | ±0.3 | ✅ |
| shot 2 ease | linear | linear | exact | ✅ |
| shot 2 never stops | True | True | exact | ✅ |
| shot 2 pull-out flag | False | False | exact | ✅ |
| shot 2 DOF | shallow-band | shallow-band | exact | ✅ |
| shot 3 duration (s) | 3.25 | 3.25 | ±1 frame | ✅ |
| shot 3 move | pedestal-up | pedestal-up | same labels | ✅ |
| shot 3 travel (px) | 160.0 | 160.2 | ±3% | ✅ |
| shot 3 scale (%/s) | 0.0 | -0.001 | ±0.08 | ✅ |
| shot 3 total scale (%) | 0.0 | -0.0 | ±0.3 | ✅ |
| shot 3 ease | power1.inOut | power1.inOut | exact | ✅ |
| shot 3 never stops | False | False | exact | ✅ |
| shot 3 pull-out flag | False | False | exact | ✅ |
| shot 3 DOF | deep | deep | exact | ✅ |
| shot 4 duration (s) | 3.25 | 3.25 | ±1 frame | ✅ |
| shot 4 move | pull-out | pull-out | same labels | ✅ |
| shot 4 speed (px/s) | 0.0 | 0.0 | ≤1 px/s | ✅ |
| shot 4 scale (%/s) | -1.9801 | -1.981 | ±0.08 | ✅ |
| shot 4 total scale (%) | -6.215 | -6.22 | ±0.3 | ✅ |
| shot 4 ease | linear | linear | exact | ✅ |
| shot 4 never stops | True | True | exact | ✅ |
| shot 4 pull-out flag | True | True | exact | ✅ |
| shot 4 DOF | deep | deep | exact | ✅ |
| shot 5 duration (s) | 2.75 | 2.75 | ±1 frame | ✅ |
| shot 5 move | static | static | same labels | ✅ |
| shot 5 speed (px/s) | 0.0 | 0.0 | ≤1 px/s | ✅ |
| shot 5 scale (%/s) | 0.0 | -0.0 | ±0.08 | ✅ |
| shot 5 total scale (%) | 0.0 | -0.0 | ±0.3 | ✅ |
| shot 5 pull-out flag | False | False | exact | ✅ |
| shot 5 DOF | deep | deep | exact | ✅ |
| shot 6 duration (s) | 3.5 | 3.5 | ±1 frame | ✅ |
| shot 6 move | truck-right+pedestal-up+push-in | truck-right+pedestal-up+push-in | same labels | ✅ |
| shot 6 speed (px/s) | 53.141 | 53.3 | ±3% | ✅ |
| shot 6 vx, vy (px/s) | [-50.0, 18.0] | [-50.2, 18.1] | ±1.5 px/s | ✅ |
| shot 6 scale (%/s) | 1.2072 | 1.202 | ±0.08 | ✅ |
| shot 6 total scale (%) | 4.237 | 4.22 | ±0.3 | ✅ |
| shot 6 ease | linear | linear | exact | ✅ |
| shot 6 never stops | True | True | exact | ✅ |
| shot 6 pull-out flag | False | False | exact | ✅ |
| shot 6 DOF | deep | deep | exact | ✅ |
| UI event frames | [30, 351, 369] | [30, 351, 369] | exact | ✅ |
| framing order (zoom 1.6 > 1.0 > 0.6) | shot2 > shot1 > shot5 | [3.33, 2.78, 1.39] | ordering | ✅ |
| tempo (BPM) | 120 | 120.1 | ±1 | ✅ |
| cuts on beat | [True, False, True, False, True] | [True, False, True, False, True] | exact | ✅ |
| audio class | music+sfx | music+sfx | exact | ✅ |
| SFX→UI sync (ms) | 0 (ticks on UI frames) | [0.7, 0.0, 0.9] | ≤1 frame | ✅ |
| vignette detected | corner falloff 0.30 at extreme corner | 0.238 | 0.15–0.35 (ring r>0.85) | ✅ |
| grain detected | σ 2.0 before x264 | 1.48 | 0.8–2.5 after codec | ✅ |

**63/63 checks pass.**
