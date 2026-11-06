# Source archives and design history

Current editable originals are tracked directly in Git: [source assets](../source-assets/README.md), [48-scene index](../source-assets/STORY_INDEX.md), [maintenance guide](ASSETS_MAINTENANCE.md) and [animation guide](ANIMATION_ASSETS.md).

For a single download containing the current application and its original sources, choose **Source code (zip)** in the [source release](https://github.com/netanelassor/and-juliet/releases/tag/source-assets-v0.5.0). It includes `source-assets/`; no previous developer's local files are needed to run the site.

## Historical downloads

| Archive | Contents | MiB |
| --- | --- | --- |
| [and-juliet-history-approved-print-v9.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-history-approved-print-v9.zip) | Approved full printed v9, complete and standalone. Keep editable SVG/assets/docs together. | 471.7 |
| [and-juliet-history-print-v7-v8.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-history-print-v7-v8.zip) | Complete Rubik v7 and emotional-polish v8 printed editions. | 686.2 |
| [and-juliet-history-early-editorial-v1-v6.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-history-early-editorial-v1-v6.zip) | All unique early user-facing layouts, sample versions, top-level PDFs/HTML/manuscript/previews. | 494.2 |
| [and-juliet-history-original-source-folder.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-history-original-source-folder.zip) | Original source-files folder including art, content, prompts and original HTML/PDF layout. Distinct from the older editorial source ZIP. | 261.0 |
| [and-juliet-history-interactive-v01-v05.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-history-interactive-v01-v05.zip) | All interactive versions from the first iPad prototype through the full premium v0.5 book, including source snapshots, demos, screenshots and delivery records. | 219.1 |
| [and-juliet-history-authoring-sources.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-history-authoring-sources.zip) | Curated historical authoring scripts, original art/prompts, editable type, masks/backgrounds, manuscripts, plans and provider metadata. Workspace-relative paths retained; derived QA frames/final flat render copies excluded. | 460.0 |
| [and-juliet-source-files-original-editorial.zip](https://github.com/netanelassor/and-juliet/releases/download/source-assets-v0.5.0/and-juliet-source-files-original-editorial.zip) | Preserved original editorial source ZIP: unique scripts, manuscript, storyboard and original layout. Its contents differ from the later source-files folder. | 244.4 |

Total: seven archives, 2,974,494,232 bytes, covering 1,795 workspace files. All ZIP files were opened and CRC-verified before upload. [ASSET_ARCHIVES.json](ASSET_ARCHIVES.json) records paths, sizes and SHA-256 hashes; `SHA256SUMS.txt` is attached to the release.

## Restore and edit

Download the edition you need and extract it with its directory structure intact. Keep each historical `editable/` folder next to its `assets/` and `docs/` folders; the SVG layouts use relative image references. Newly packaged archives include `ARCHIVE_CONTENTS.json` with each original file path, size and SHA-256. The original editorial ZIP is preserved byte for byte with an external checksum.

Historical print scripts and prototype utilities can contain old machine-specific paths. They are preserved as authoring history. The current interactive application runs directly from this repository with `npm ci` and `npm run dev`, independently of print scripts. The animation guide includes an optional portable data-only matte generator.

Rebuildable `node_modules/`, `dist/`, browser installations, caches and local authentication files are excluded. Identical copies are omitted with explicit aliases in the JSON inventory: the duplicate v5 directory, one identical manuscript and six redundant ZIPs whose files are preserved in their original output folders. Each historical edition keeps its own asset relationships so it can be opened independently.

Historical briefs and reviews describe previous states; current approved story, design and product requirements take precedence. No commercial music recordings are stored here. Playback continues through Apple Music and Spotify.
