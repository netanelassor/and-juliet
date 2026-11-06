# Maintaining Ron's & Juliet storybook

This repository is self-contained. Start with `README.md`, `docs/ASSETS_MAINTENANCE.md`, `source-assets/manifest.json` and `docs/ANIMATION_ASSETS.md`. Historical print editions and editable layouts are indexed in `docs/ASSET_ARCHIVES.md` and stored in the linked GitHub Release.

- Preserve the complete canonical 48-scene story, all 48 original illustrations, identities, humor and relevant song cues. `src/content/full-story.json` is the interactive text authority; keep duplicated scene text in `chapters-data.json` consistent. The source PDF is `source-assets/story/and-juliet-book-he.pdf`. The approved name is ג'ולייט.
- Keep the approved English graphic cover logo and cover composition. The illustrated artwork is approved; change layout or motion without regenerating visible characters unless requested.
- Keep Rubik Regular 400 and the existing readable iPad text sizing. Maintain the approved dark theatrical reading design and RTL navigation. Avoid AI-like story punctuation such as double hyphens or underscores.
- Animations repeat automatically. Preserve the global stop setting, reduced-motion behavior, visibility gating and static original-art fallback.
- Use existing Apple Music/Spotify integration. Do not add commercial recordings, lyrics or service credentials to the repository. Provider/account restrictions still apply.
- The owner requested no added or routinely run automated test suites. For changes, use a production build and focused visual inspection of affected screens, including a dense page at iPad landscape size. Existing historical preservation tests remain available if explicitly requested.
- Use `npm ci`, `npm run dev` and `VITE_BASE_PATH=/and-juliet/ npm run build` with Node 24. Deploy is manual through `.github/workflows/deploy.yml`; a source push does not publish the website.
- Master PNGs, plates, cover components and generation prompts are tracked in `source-assets/`. Runtime assets remain in `public/assets/`. Keep source hashes and portable paths current when intentionally replacing originals.
- Historical briefs, reviews and scripts document previous versions. They are not a request to restore rejected layouts. Old print scripts may contain machine-specific paths; see the archive notes before reusing them.
