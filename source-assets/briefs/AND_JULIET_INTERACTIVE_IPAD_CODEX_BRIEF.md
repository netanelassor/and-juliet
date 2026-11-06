# CODEX BUILD BRIEF — & Juliet Interactive Story-Musical for Ron

## Your role
You are the lead frontend engineer, motion designer, interaction designer, and children's digital storytelling director for this project. Build a magical, polished **Hebrew interactive storybook / mini musical** based on the user's existing illustrated book, designed for a **6-year-old child using an 11-inch iPad in landscape**. The finished experience will be hosted as a static web app on **GitHub Pages**.

**Product vision:** Ron can experience the entire storyline in Hebrew, recognize the characters and stage moments, hear the corresponding songs from the Broadway cast recording, and then enjoy the English-language Broadway production even if he cannot follow every line of dialogue.

**Critical:** This is NOT a PDF viewer, a web edition of a printed book, a marketing website, or a slideshow. Make it feel like an *interactive musical theatre story*: the illustrated stage comes alive while the narrative remains calm, readable, and easy to follow.

## 1. Canonical story and asset sources — NO content reduction

- **Primary canonical source:** `and-juliet-book-he.pdf` (the ORIGINAL 60-page Hebrew illustrated PDF supplied by the user; if the repository contains another copy with a suffix such as `(1)`, compare and use the identical original).
- Its **48 illustrated story pages** are the story source. Preserve the full chronology, character motivations, jokes, emotional beats, side plots, and act break. In particular: Shakespeare and Anne's framing story; Juliet choosing to live; Romeo's previous romances; the plan to send Juliet to a convent; journey to Paris with May, Angélique, and Anne as April; Shakespeare driving; the ball and chandelier; May and François; Juliet and François; Angélique and Lance; the proposed wedding; the return of Romeo; Shakespeare and Anne's pen dispute; the wedding-band sequence; the interrupted wedding; Juliet's assertion of independence; reconciliation; Roar; the ending.
- Preserve **all meaningful Hebrew story text** from the original. Minor proofreading is fine, but **do not summarize, rewrite into much shorter scenes, omit subplots, or change the ending**. If reorganizing into chapters, preserve all source paragraphs and document any edits in a change log. The shorter editorial PDF and the previous `preview.html` are NOT the content source.
- Extract text and art separately from the PDF when technically possible; prefer higher-resolution original illustration assets already in the project. The PDF story pages generally have separate embedded illustrations and selectable text. DO NOT use complete page screenshots as the primary UI or bake text into images.
- Reuse all existing character designs and costume / stage references. Maintain consistent recognition: Juliet, Shakespeare, Anne/April, May, François, Angélique, Lance, and Romeo.
- Use Hebrew **יוליה** consistently unless the canonical source specifically requires another label. Keep correct Hebrew punctuation and full RTL support.
- The original includes an indexed Broadway cast-recording song list. Map each music cue to its exact canonical story location. Preserve both acts and all relevant tracks. Never invent song URLs.

## 2. Recommended technical architecture (adapt if the existing repo warrants it)

- **Vite + React + TypeScript**, static SPA, no backend, optimized for GitHub Pages.
- **GSAP** for precise, lightweight scene transitions and layered animations; native CSS transforms/transitions where sufficient. Avoid heavy 3D engines unless a particular interaction truly requires one.
- CSS Modules or similarly maintainable component styles; design tokens for color, spacing, type, motion. Keep dependencies lean and free to use.
- Scene content is **data-driven** in typed TS/JSON/MDX (not hard-coded inside JSX). Each scene includes: ID, act, order, exact story paragraphs, illustration assets, character IDs, music cue IDs, interaction descriptors, accessible fallback, and optional animation/video assets.
- React state plus localStorage for progress, last-read scene, mute/motion preferences, favorite songs, and preferred music service. No user accounts or analytics necessary.
- Optional PWA (manifest + service worker): install to home screen and cache the **story, images, and interface**. Third-party music remains online-only.
- No server runtime, private API keys, or paid services required for baseline functionality.
- Configure Vite `base` correctly for GitHub Pages project paths. Use hash-based scene deep links or base-safe navigation. Include GitHub Actions workflow and detailed deployment README.

## 3. Navigation and reading experience — Hebrew RTL, iPad-first

- Default **landscape** layout for an 11-inch iPad Safari/PWA; support portrait mode with a graceful reflow/orientation hint, not a broken viewport.
- Open from **right to left** like a Hebrew book. The clear 'next' action is on the LEFT, 'back' on the RIGHT. Tap the left/right edge or swipe to turn scenes, with sensible gesture thresholds and no interference with scrolling or audio controls.
- Use full-viewport immersive scenes: rich illustrated background/stage occupies 55–70% of the composition; a consistent calm Hebrew reading area occupies the rest. Avoid fixed 60:30 printed spread ratios inside an iPad viewport.
- Never put long text on busy scenery. Preserve contrast and comfortable line lengths. Keep **the previously approved simple Rubik Hebrew style** for narrative typography; expressive graphic text is for title/scene highlights only.
- Large touch targets (>=44 CSS px), readable body text (aim around 22–28 CSS px at landscape layout, verified on hardware), stable controls, no tiny or accidental hit zones.
- Parent-friendly control bar: start, next/back, contents/chapter list, music, settings, progress indicator. Prefer auto-hide while reading; keep discoverability.
- Support three modes: **Read** (normal), **Listen/Explore** (music and interactions prominent), **Quiet** (no ambient effects or automatic movement). Avoid autoplay audio.
- Auto-save progress; 'Continue where we left off'; 'Replay this scene'; optional 'Meet the characters' overlay and a small glossary. A child should never be forced through instructions before the story.
- Keep opening delightful but short: animated theatre curtain/logo, one large **Start the story** control. No multi-page intro/tutorial.
- Preserve the real **Act 1 / Act 2** boundary as a small theatrical intermission with an optional recap.

## 4. Art direction: existing assets, not a new aesthetic

Use the existing illustrations as the visual source of truth:
- Renaissance costumes + sneakers, streetwear/hip-hop attitude, Broadway lighting, magenta/purple/navy, electric cyan, gold, checkerboard stages, LED lights, curtains, balconies, Paris ball set, chandelier, and the final balcony.
- Do not redesign/reinterpret characters, replace the approved illustrations, generate generic stock art, or change the look to medieval watercolor/fantasy.
- Design **one coherent system** with three scene presentation families: (A) dialogue/character scene, (B) dynamic musical/set-piece scene, (C) quiet emotional scene. Use purposeful variations, not a different UI template per page.
- Text must be live HTML (selectable, accessible, editable) above a consistent quiet reading surface. No text generation inside art, no oversized chat bubbles, and no weird shape experiments.
- Build a polished, original cover/title treatment inspired by the existing cover, with movement of spotlights and curtains rather than multiple decorative stickers.

## 5. Animation principles: magical but achievable

**Do not promise to turn a flattened illustration into fully animated acting without source layers.** Separate what is feasible from existing stills and what requires additional generation.

### Tier 1 — MUST BUILD with existing assets (no video-generation service)
- Multi-plane parallax from scene artwork where composition allows it; subtle pan/zoom; depth and light sweeps.
- Flickering/moving stage spotlights, LED glow, soft particles/confetti, floating petals/stars, illuminated marquees, curtains, changing lighting.
- Carefully masked/segmented elements when extracted from stills without damaging character integrity: small bobbing/breathing, scarf/ribbon movement, floating paper, feather, chandelier swing.
- Smooth scene entrances and exits. Interactions triggered on user taps; motion pauses when the user is reading a paragraph.
- Use GPU-friendly transforms/opacity, avoid constant expensive filters and giant animated image layers. Respect `prefers-reduced-motion`, provide motion-off setting.

### Tier 2 — OPTIONAL, only if assets support it
- Short looping character gestures using layered art or manually constructed sprite assets; e.g. Shakespeare lifting his feather, Anne reacting, Juliet waving, dancers moving subtly.
- Short **muted** WebM/MP4 loops for selected climaxes if they can be created from user-provided or properly licensed assets with an available tool. Use poster image, tap-to-play, captions if needed, and fallback to static art.
- If generating character video or new art requires an external AI tool, service, API key, or paid credit, **do not secretly integrate it or imply Codex can generate it by itself**. Provide a precise asset-generation plan, filenames, storyboard, prompts, approximate duration, and integration points. The application must be fully usable without these videos.

### Suggested interactive theatrical moments (use 3 for the prototype)
1. **Opening:** tap to draw the curtain; Shakespeare flourishes his feather; Anne interrupts with a spotlight; briefly reveal the rewritten ending.
2. **Paris journey:** slowly moving carriage/background layers, moving landscape and city lights; tap luggage for a small discovery.
3. **Ball:** moving nightclub lights and dancers in depth; **chandelier gently swings** on tap (no unsafe strobe effect); sparkle/congratulation moment.
4. **Romeo's return:** dramatic spotlight and a playful 'surprise' reveal.
5. **Broken quill:** user taps the feather; brief snap/flying paper effect.
6. **Finale Roar:** Juliet on balcony, crowd lights and confetti, one user-triggered 'roar' moment (no unauthorized song audio).

Animate for story comprehension, not for constant visual noise. When reading starts, motion becomes subtle. Never autoplay intense flashes, loud sounds, or full-length video.

## 6. Music is a first-class storytelling feature

- At every canonical song cue, show a small, beautiful, clearly tappable **'Listen to the song'** control with **the exact English track title** and, optionally, original Broadway cast-recording artwork.
- Prefer **Apple Music** if its official embeddable player can play on the family's iPad; also offer **Spotify**. Provide a parent setting to choose the default service.
- Use only **official provider embeds or direct track links**. For Apple Music, start with official embedded preview/player or deep link; **avoid MusicKit developer tokens / Apple Developer Program dependency for v1**. For Spotify, use official Embeds / iFrame API if useful.
- Confirm track-specific URLs against the **Original Broadway Cast Recording**, not generic pop studio versions. Maintain a `music-cues.ts` mapping with `trackTitle`, `sceneId`, `spotifyTrackUrl`, `appleMusicTrackUrl`, verification status and fallback.
- If a specific track URL cannot be verified, mark it TODO and fall back visibly to the verified album link. NEVER fabricate IDs/links or silently play the wrong version.
- Music may need a paid subscription, provider login, or external-app handoff; full in-page playback and autoplay are NOT guaranteed on iPad Safari. Provide a graceful choice: 'Play here if supported' or 'Open in Apple Music / Spotify'.
- **No copyrighted song audio bundled in the repository. No unofficial MP3 downloads, no copying recordings, no reproduction of song lyrics.**
- The UI must keep bookmark/progress when a music app is opened and the child returns to Safari. The chapter must not restart.
- Offer a 'Songbook' screen with every song in story order and direct links, ideally with a remembered selected provider.

## 7. Learning and playful interactions for Ron (age six)

The goal is recognition before seeing the English stage production, NOT reading exercises or a game that distracts from the story.
- Tap a character for a one-sentence Hebrew identity reminder with portrait and name (especially Shakespeare/Anne-April, May/François, Juliet/Romeo).
- Optional small 'What happened?' recap at major transitions.
- Optional 'Which song is this?' track recognition at act end, user-triggered only.
- Celebrate key emotional messages gently: you can choose your own path; listening matters; friends can be different; saying the truth is brave.
- No ads, external shopping, login, points economy, flashing achievements, or intrusive pop-ups. No collection of a child's personal information.

## 8. Required project structure (illustrative)

```
src/
  app/                 # bootstrapping and navigation
  components/          # BookReader, StoryScene, MusicCue, StageLayer, controls
  content/             # scenes.ts, characters.ts, music-cues.ts, glossary.ts
  motion/              # reusable GSAP motion recipes, prefers-reduced-motion
  styles/              # tokens, typography, layout families
  utils/               # local progress, URL/deep-link handling
public/
  assets/story/        # optimized existing scene illustrations
  assets/characters/   # extracted/reused character assets if available
  assets/motion/       # optional layered assets / compact loops
.github/workflows/     # GitHub Pages deployment
```

Avoid overengineering. Include asset provenance, source-page mapping, and a clear README.

## 9. Performance and iPad quality bar

- Target the 11-inch iPad in Safari **landscape first**. Test physical viewport and safe areas; do not assume a desktop browser screenshot is enough.
- Start quickly: lazy-load distant scenes, prefetch the next scene and song metadata, optimize WebP/AVIF where feasible, avoid loading all 48 large illustrations at startup.
- Keep animation smooth; avoid long-running expensive effects and memory leaks as scenes change.
- Touch gestures must not conflict with embedded music controls.
- Respect reduced motion; support keyboard/screen-reader navigation where practical; correct `lang="he"` and `dir="rtl"`, and `dir="ltr"` only for English song titles.
- Responsive test profiles: 11-inch iPad landscape/portrait, a smaller iPad if available, and desktop.
- Automated tests for scene order/content integrity, song-cue mapping, RTL next/back gestures, saved progress, and fallback music links; screenshot visual checks (Playwright or equivalent).

## 10. Copyright, access, and hosting constraints

- Intended as a **private family gift**; don't claim official affiliation with the Broadway production.
- Static GitHub Pages hosting may expose the site publicly even if the repository is private, depending on account/configuration. Explain the exposure before deployment. Keep rights/asset usage in mind; request permission where needed for public distribution of protected visuals or text.
- Do not redistribute the commercial cast recording. Do not put API secrets or private keys in a static front-end bundle.
- The app should function without any paid third-party library, hosting backend, or AI-generation service.

## 11. Development plan — token-conscious and approval-gated

### Phase 0: Audit (read-only)
1. Inspect the existing project and the 60-page canonical PDF.
2. Inventory and map all **48 story pages** (and music cues), original scene artworks, characters, and scene content.
3. Identify missing source assets and any difficult animation assets.
4. Write `docs/STORY_SOURCE_MAP.md`, `docs/MUSIC_VERIFICATION.md`, and a concise implementation plan.
5. Choose implementation details and explain your assumptions.

### Phase 1: Working vertical slice (build only this, then STOP)
Build a real running iPad-oriented prototype containing:
- A **short theatrical cover/opening**.
- **Opening scene:** Shakespeare and Anne, with the original complete Hebrew text for the corresponding source story pages.
- **Ball/chandelier scene:** vibrant illustrated motion and a live **Blow** music button linked to the correct original-cast version if verified.
- **One emotional scene:** e.g. May & François or Juliet & Anne, showing quiet visual treatment and an identity tap.
- Actual RTL navigation, preferred music service setting, local progress, and accessible motion-off mode.
- Render **real screenshots and short recorded UI demo** from the running app (no fake AI-generated mockups), including an 11-inch iPad landscape viewport.
- Show working URLs where available, source mapping, verification notes, and concrete limitations.

**STOP after Phase 1 and ask for approval. DO NOT build the other story scenes until the user approves the actual prototype.**

### Phase 2: Entire canonical story
Import **all 48 canonical story pages**, grouped into comfortable digital scenes if useful, without deleting dialogue or story beats. Add full act navigation, music cues, recaps and character help. Preserve the exact canonical order. Document text changes if any.

### Phase 3: Polishing and deployment
Layered motions, optional video assets if available, real iPad QA, performance optimization, accessible quiet mode, optional PWA, GitHub Actions deployment, final README. Publish only when the user requests/approves deployment.

## 12. Explicit acceptance criteria

1. Child can start reading with one tap; Hebrew story is understandable, readable and uses natural right-to-left progression.
2. Story includes **the full long original**, not the abbreviated rewrite; both acts and major subplots survive.
3. Character and stage art clearly matches the source PDF.
4. Three fully working sample scenes demonstrate real, lightweight animation and touch interactions.
5. At least one **verified scene-specific** Spotify or Apple Music cue is working via an official embed/link, with fallback.
6. App runs without backend, paid dependencies, downloaded copyrighted recordings, login, or secrets.
7. Returning from a music app does not lose reading progress.
8. GitHub Pages build works under a repository subpath.
9. Parent can turn animations off; reduced-motion preference works; no uncontrolled autoplay.
10. Phase 1 ends with screenshots, working prototype, a concise completion report, and no unapproved full-site implementation.

**Final creative north star:** "A magical illustrated Broadway stage Ron can open on his iPad, understand in Hebrew, interact with, and use to recognize the real songs and characters at the show." Prioritize emotional storytelling and delight over tech tricks.
