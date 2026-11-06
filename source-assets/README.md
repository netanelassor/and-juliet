# Original artwork and editable sources

These files are tracked directly in Git. A normal clone includes the originals; no Git LFS account, local Codex folder or image-generation service is needed.

| Folder | Contents |
| --- | --- |
| `story-masters/` | All 48 original 1536 × 1024 PNG paintings, unchanged |
| `story/` | Canonical original 60-page PDF and original manuscript, before the approved name replacement |
| `cover/` | Approved front cover PNG and self-contained editable SVG, base painting, graphic logo, back cover and album QR |
| `characters/` | Original cast reference sheet |
| `animation-plates/` | Five original PNG background repairs for layered animation |
| `theatre/` | Original illustrated curtain PNG and generation notes |
| `prompts/` | Original cover, cast and scene generation prompts |
| `briefs/` and `references/` | Historical user-supplied production briefs, reviews and visual references |
| `original-production/` and `fonts/` | Original production/music metadata and print font |
| `tools/` | Optional offline, data-only matte authoring helper |

[Scene source index](STORY_INDEX.md) links all 48 paintings to their canonical story moments and PDF pages.

Read [the maintenance guide](../docs/ASSETS_MAINTENANCE.md) before editing. The current interactive story lives in `src/content/`, with the approved name **ג'ולייט**. Historical print versions and review documents describe earlier states; they do not supersede the current product.

[manifest.json](manifest.json) records each original's relative path, byte size, SHA-256 and provenance. Original artwork has not been upscaled or repainted for this backup. The browser serves smaller WebP assets from `public/assets/`; these source PNGs are not added to the website or its offline download.

The back cover SVG intentionally sits in `cover/editable/` and refers to `../assets/`. Preserve that relationship when moving it. `front-approved.svg` embeds both source images and is self-contained.

Previous print layouts, spreads, editable files, prototypes and authoring history are downloadable from [Source assets and design archive](https://github.com/netanelassor/and-juliet/releases/tag/source-assets-v0.5.0). [Archive index](../docs/ASSET_ARCHIVES.md).
