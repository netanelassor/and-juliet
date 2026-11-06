# Codex task: Redesign the existing & Juliet Hebrew children's book

## Context / source of truth

This is an **existing** Hebrew, right-to-left children's storybook, intended for Ron (age 6), introducing the storyline and songs of the Broadway musical **& Juliet** before attending the show. The current book is a 30 × 30 cm square format.

Review the actual project and its assets before changing anything. Use these provided references if they have been copied into the workspace:
- `and-juliet-editorial-spreads-he.pdf` — **current book to fix** (20 PDF pages representing 40 interior book pages).
- `juliet_mockup_preview.pdf` and `juliet_mockup_contact.jpg` — **visual direction samples**, not exact templates to reproduce.
- Existing original illustrations and text in the project are the primary production assets. Prefer high-resolution original illustrations over extracting images from PDFs.

Do **not** invent paths, assume a framework, or recreate the project from scratch. Inspect the repository and continue with its existing rendering/export pipeline.

## Primary objective

Turn the book from a collection of loosely positioned images and text into a **cohesive, professionally art-directed printed children's picture book**. Keep the appealing character illustrations, modern Broadway/hip-hop/Renaissance atmosphere, story personality, Hebrew dialogues, chronological plot, and the music cues. The main work is **editorial art direction, purposeful page composition, pacing, and an original cover treatment** — not a wholesale rewrite or regeneration of illustrations.

## Non-negotiable requirements

1. **No unnecessary front matter.** No introductory page, character index, explanation of how to use the book, second title page, blank filler page, or UI-like opening. Place the dedication compactly on the inside of the front cover if the production workflow permits; otherwise keep it very small and do not allocate a full spread to it. Start the actual story immediately.
2. **Editorial storytelling instead of screen/card layout.** Each spread is one coherent narrative beat. Merge adjacent source pages where they are parts of the same scene. Do not create a separate page for every short dialogue or event; do not arbitrarily lose important plot beats.
3. **Maintain the existing illustrated characters and aesthetic.** Visual theme: Broadway pop × hip-hop × Renaissance storybook; neon magenta/purple/blue accents, golden stage lights, brick walls, trusses, checkerboard floors, sneakers with period costumes, theatrical scenery. Preserve faces/outfits/character recognition and continuity.
4. **Treat each spread as an intentionally designed illustration with narrative text integrated into it.** Avoid simply putting an image rectangle beside an unrelated paragraph on a large blank background. Use negative space, illustrated scenic extensions, soft integrated text surfaces, and consistent compositional rules.
5. **Readable RTL Hebrew.** Text remains editable selectable vector text, not embedded inside AI-generated pictures. Proper Hebrew punctuation, natural paragraphs, right alignment. Isolate English song titles in LTR runs. Never let text clip or overlap important artwork.
6. **Cover title is illustrated lettering, not a boring generic font.** Create a high-resolution/vector branded title treatment in the visual spirit of the supplied musical reference: layered brush lettering, gold/magenta glow, theatrical heart/lighting energy. Hebrew title **"ויוליה?"** and subtitle **"הסיפור עוד לא נגמר!"** must be accurately spelled and visually composed; the English show name must be **"& Juliet"** (not "JULIETE"). Use editable SVG/custom lettering or high-resolution transparent artwork for the display title. Do NOT rasterize normal story text.
7. **Songs are quiet footnotes.** Keep the correct English Broadway cast song names attached to their scenes, e.g. `♫ Confident`; no play buttons, app controls, track-number badges, or headings on every page. Put a compact ordered song index and a functioning Spotify QR at the end or back cover; don't invent track links or use the wrong original-pop recording.
8. **Book size and print safety.** Trim 300×300 mm per page, 3 mm bleed on outer edges, at least ~12–15 mm safe area, more around inner gutter; don't place faces, important details or text across the fold. Effective image resolution preferably 300 dpi at print size. Embed fonts in exported PDF. Respect Hebrew right-to-left page order and correct front cover placement. Final interior page count must suit printing in multiples of 4.

## Editorial reduction

- Current: **40 interior book pages** presented as 20 wide PDF spreads.
- Target: **about 32 interior pages (16 spreads)**, with flexibility to use 36 if essential story moments require it. Avoid arbitrary stretching to fill a page count.
- Keep the full story arc: Shakespeare's tragic ending → Anne proposes a new ending → Juliet lives → Romeo's past and her parents → escape with May, Angélique and Anne/April → trip to Paris → the ball → May/François and Juliet/François → Angélique/Lance → the proposed marriage → Romeo's return → Anne/Shakespeare's conflict → the wedding misunderstanding and resolution → Juliet's self-determination → reconciliation → Roar and ending.
- Shorten duplicated explanations and redundant reaction beats, **not** key character motivation. Keep the humorous read-aloud voice.
- Typical narrative density: roughly **65–110 Hebrew words per two-page spread**, with 20–50 for big visual climaxes. This is guidance, not a fixed limit. Natural phrasing and rhythm take priority.
- No large chapter headers or a headline on every spread. If a section title is necessary, use it sparingly.

## Consistent design system

Develop a small visual system rather than random layouts:

**A. Main narrative spread** (use most frequently): art covers about 60–70% of the total spread and text lives in a deliberately reserved, visually integrated area. Can have full bleed, but must retain reading clarity.

**B. Dialogue/emotional spread:** intimate medium/close-up illustration with broad comfortable Hebrew text block. The text is NOT a floating web card; its background is an intentional part of the illustrated scene.

**C. Big musical moment:** a strong full-bleed illustration with a short text passage and discreet song label. Use sparingly for the chandelier/ball, Romeo reveal, Juliet's declaration, and `Roar`.

Maintain a coherent **palette** as starting tokens (sample from actual assets before finalizing): dark ink `#171329`, magenta `#F526A5`, royal purple `#6736CB`, stage gold `#F9C64D`, electric turquoise `#36D8E3`, warm paper `#FFF1DF`. Keep the narrative text high-contrast (usually deep ink on warm, quiet surface); avoid dense white text against unmodified busy artwork.

Use a clean Hebrew body face such as **Varela Round** or **Rubik Regular** if licensed/available in the repo, about 20–24 pt at actual print scale, with generous line height and sensible line lengths. Test visually, don't blindly enforce one size. Cover logo and occasional display accents can be custom lettering. Do not use generic PowerPoint/website-style typography.

## Specific fixes visible in the current PDF

- **PDF page 1:** currently spends the full spread on a sparse title/dedication composition. Separate a strong cover from interior pages, remove this wasted interior spread, and start the narrative straight away.
- **PDF page 2:** Shakespeare/Anne appears as a picture on one page and an isolated paragraph on the other. Redesign as one unified stage composition and merge the entire opening dialogue.
- **PDF pages 3–4:** mismatched floating image boxes and excess blank space. Merge the Verona grief/choice/departure sequence coherently and give each scene an intentional visual hierarchy.
- **PDF page 5:** chandelier ball scene is visually important but text is squeezed into a narrow dark column. Make the chandelier illustration the hero; shorten text, use a readable integrated zone.
- **PDF page 10:** Romeo's return is visually strong but the long narrow text column is uncomfortable. Make it a reveal, with little text and large visual impact.
- **PDF page 19:** the `Roar` moment is split into narrow image strips. It should be one triumphant, cohesive double-page visual, with only minimal text.
- **PDF page 20:** music reference/index should become clean compact back matter, not another mismatched story spread. Preserve credits and correct links.

## Working method — IMPORTANT, minimize wasted tokens/effort

### Phase 1 — audit and storyboard (no full rebuild)
1. Inspect the repository structure, illustrations, text sources, current layout rules, and PDF export pipeline.
2. Produce `docs/editorial_redesign_plan.md` with a source-to-target mapping for every new spread: old PDF pages, story beat, text edits, chosen existing illustration(s), layout A/B/C, song reference, and any image gap.
3. Identify which images can be reused as-is, which need reframing/background extension, and which (if any) require new illustration. **Do not regenerate existing good character art without a specific reason.**

### Phase 2 — only 3 representative proof pages/spreads
Create a **sample PDF** with:
1. Finished **front cover** with custom graphic title treatment.
2. Finished **opening Shakespeare + Anne spread**, representing readable dialogue in a cohesive illustrated scene.
3. Finished **ball/chandelier spread**, representing a high-impact musical sequence.

Make these at the actual intended print proportions. Use real book text and real existing artwork (not placeholder images); make visually consistent. Render them to PNG previews too. Do **not** redesign the full book yet. Report file paths and explain any trade-offs or missing assets. **Stop here for review/approval.**

### Phase 3 — only after explicit approval
Implement all spreads from the approved storyboard and style system; export complete print PDF, a screen-preview PDF, and an image/contact sheet of all pages.

## Quality gates / acceptance criteria

- A reader sees a **children's picture book**, not a slide deck, scrapbook, website, app, or a set of independent cards.
- There is no full interior preface/intro and no excess filler. The story begins immediately.
- Each spread has an obvious visual focus, strong narrative flow, comfortable readable text, and coherent page-to-page design.
- 3 design families are recognizable as one coherent system; they are not random and not monotonous.
- Hebrew is correctly rendered RTL; English titles are correctly LTR; no awkward wrapping or tiny text.
- No important content in trim/bleed/gutter. No portraits severed at the spine. All pages render with correct dimensions and resolution.
- Existing illustrations are preserved and not replaced with noticeably different faces/styles.
- Scene-to-song alignment is preserved; no lyrics or translated lyrics are inserted.
- Verify PDF by **rendering every sample page to images and visually inspecting it**; fix any obvious collision, clipping, overflow, transparency, or spelling issues before returning results.
- Keep an explicit change log of merged/cut scenes; no essential story beat silently disappears.

## What I need back from you first

Return **only**: (a) a concise audit; (b) the spread mapping; (c) a 3-sample proof PDF and PNGs; (d) any specific outstanding blockers. Do not spend time/tokens on all 32 pages before I approve the samples.
