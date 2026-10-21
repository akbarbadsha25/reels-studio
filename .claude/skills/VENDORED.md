# Vendored agent skills

These skills are copied into the repo (not installed at runtime) so every session sees the
same reviewed version. To update one, re-copy from the pinned source, review the diff, and
bump the commit below.

| Skill folder(s) | Source | Commit | License |
|---|---|---|---|
| `remotion-*` (12 skills) | [remotion-dev/skills](https://github.com/remotion-dev/skills) `skills/` | `039e8a2` (2026-10-19, v4.0.537) | Remotion License, same as Remotion itself: free for individuals and small teams |
| `video-shotcraft` | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | `43bd349` (2026-10-18) | Apache-2.0 (`video-shotcraft/LICENSE`) |

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
