# Vendored agent skills

These skills are copied into the repo (not installed at runtime) so every session sees the
same reviewed version. To update one, re-copy from the pinned source, review the diff, and
bump the commit below.

| Skill folder(s) | Source | Commit | License |
|---|---|---|---|
| `remotion-*` (12 skills) | [remotion-dev/skills](https://github.com/remotion-dev/skills) `skills/` | `039e8a2` (2026-10-19, v4.0.537) | Remotion License, same as Remotion itself: free for individuals and small teams |
| `video-shotcraft` | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | `43bd349` (2026-10-18) | Apache-2.0 (`video-shotcraft/LICENSE`) |
| `gsap-*` (8) | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) `skills/` | `aed9cfd` | MIT |
| `hyperframes*`, `embedded-captions`, `talking-head-recut`, `general-video`, `faceless-explainer`, `product-launch-video`, `pr-to-video`, `music-to-video`, `slideshow`, `motion-graphics`, `media-use`, `figma`, `remotion-to-hyperframes` (21) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) `skills/` | `0716670` | Apache-2.0 |
| `fireship-style-*`, `split-animated-*`, `longform-animated-talking-head`, `reverse-engineer` (6) | [kevinbadi/open-edits](https://github.com/kevinbadi/open-edits) `skills/` | `7fbd746` | MIT |
| `short-form-video`, `caption-animation`, `lower-thirds`, `countdown-video` | [iart-ai/tiktok-video-skills](https://github.com/iart-ai/tiktok-video-skills) | `2a77533` | MIT |
| `kinetic-typography` | [iart-ai/kinetic-typography-skills](https://github.com/iart-ai/kinetic-typography-skills) | `fccc94b` | MIT |
| `talking-head-b-roll` | [iart-ai/b-roll-skills](https://github.com/iart-ai/b-roll-skills) | `a51e34b` | MIT |
| 47 more skills from 13 other [iart-ai packs](https://github.com/iart-ai/motion-skills): text-message-video (`3a800e1`), youtube-video (`f3df381`), ecommerce-video (`2bd0dd1`), ad-video (`0de0f2a`), data-animation (`8ce2709`), explainer-video (`3e2d411`), map-animation (`390ca98`), web-animation (`b6dba3e`), motion-design (`3c129f7`), freelance-motion (`d85c2b4`), webgl-animation (`50697d6`), manim (`a15833c`), javascript-animation (`f7d0882`) | `iart-ai/<pack>-skills` `skills/` | as listed | MIT |
| `motionmaxxing` | [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) | `8c8ec0f` | Apache-2.0 |
| `bang-motion` | [bangtutorial/bang-motion](https://github.com/bangtutorial/bang-motion) | `c1aa65e` | MIT |
| `remotion-motion-graphics` | [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | `1dcbe5e` | MIT |
| `showreel-motion-graphics` | [Mort1d/motion-graphics-skills](https://github.com/Mort1d/motion-graphics-skills) (renamed from `motion-graphics`, which HyperFrames also uses) | `7f0c371` | MIT |
| `heditor` | [pycodebr/heditor](https://github.com/pycodebr/heditor) | `ab6f393` | MIT |
| `video-editing` | [6missedcalls/video-editing-skill](https://github.com/6missedcalls/video-editing-skill) | `7dc6e1d` | MIT |
| `video-sharingan` | [nikolasfaria/video-sharingan](https://github.com/nikolasfaria/video-sharingan) | `c7c2458` | MIT |
| `manim-skill` | [Yusuke710/manim-skill](https://github.com/Yusuke710/manim-skill) | `a0048d9` | MIT |
| `3brown1blue` | [AmitSubhash/3brown1blue](https://github.com/AmitSubhash/3brown1blue) `src/three_b1b/skill/` (renamed from `manim`, which iart's pack also uses) | `fd9bf9c` | MIT |
| `kinetic-multicam` | [aipauloshimas/kinetic-multicam](https://github.com/aipauloshimas/kinetic-multicam) | `114f045` | MIT |

For every skill except video-shotcraft (trimmed by hand, below), demo media (`*.gif`, `*.mp4`, `*.mov`,
`*.webm`), `docs/`, `media/`, `videos/`, `tests/`, `evals/`, `install.sh`, plugin manifests and
translated READMEs were left out. The repo's LICENSE was copied into each skill folder.

Reviewed but not added: OpenMontage (AGPL-3.0, so copying it in would put this repo under AGPL; its
skills also depend on its own Python pipeline), OpenChatCut (a desktop app), iart's
generative-illustration pack (no license) and its lower-thirds pack (same skill as the tiktok pack's,
which is kept), video-talkcraft and
anything2explainer (PolyForm Noncommercial: commercial use needs the author's permission),
krusemediallc/video-editor-agent (no license), zenstory-ai/video-recap-skills (Chinese-only narration,
uploads footage to Xiaomi's MiMo API).

## What was left out of video-shotcraft

The upstream repo is 67 MB. Only the shot cards, reference docs, demo sources and reusable
components were kept (about 7 MB). Removed:

- `assets/audio/` (36 MB of BGM and SFX; several files have unverified licenses per its ATTRIBUTION.md)
- `template/` (Ink Press product-promo template), `workbench/` (local dev-server editor), `gallery/`
  (use the online gallery instead: https://vincentwei1021.github.io/video-shotcraft/library.html)
- `publish/` and `references/publish-upload-post.md` (posts to social networks through a third-party API)
- `jianying-export/` and `references/jianying-export.md` (CapCut/JianYing project export)
- `demos/_legacy/`, `shot-polish/`, `videos/`, `.github/`, README images and translations

`SKILL.md` is unmodified, so it still mentions the removed parts; CLAUDE.md says how to use it here.
