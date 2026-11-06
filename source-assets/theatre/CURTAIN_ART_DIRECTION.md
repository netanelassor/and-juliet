# Illustrated curtain asset

Created for the v0.3 product refinement on 6 November 2026. This is a separate UI animation layer. All 48 original story illustrations and the approved cover remain unchanged.

- Method: built-in `image_gen` tool, reference-guided generation. No fallback CLI or API key was used.
- Style reference: `public/assets/story/scene-14.webp`, inspected before generation. Only its illustrated magenta velvet, drawn contours and gold trim informed the new asset.
- Final saved asset: `/Users/natiassor/Documents/Codex/2026-11-04/hh/outputs/and-juliet-interactive-full-story/public/assets/theatre/curtain-illustrated-v1.webp`
- Dimensions: 1536 × 1024 pixels, opaque WebP, approximately 435 KiB.
- SHA-256: `ba4b948b9a14f3f8707c891166bbf6bac085d0f979673df3c1353305a160d26d`.
- Implementation: `TheatreCurtain.tsx` clips the same image into two wings and GSAP pulls them outward. The opening waits for the story illustration and curtain asset, has a bounded loading fallback, locks navigation until completion and respects reduced motion. The same cloth language is used at the cover edges, the intermission and finite reveal effects.
- Actual app captures: `screenshots/curtain-closed.jpg` and `screenshots/curtain-opening.jpg`.

## Final generation prompt

```text
Use case: style-transfer / illustration-story. Create a SEPARATE theatre front-curtain asset derived from the illustrated magenta velvet curtains in this reference. This is a new UI animation layer for a Hebrew children's Broadway storybook; do not create a scene or a mockup. Use the input only for exact art-direction: hand-painted 2D storybook comic illustration, inked dark contour lines, expressive curved fuchsia/magenta folds, deep violet shaded recesses, golden edge piping and small elegant fringe, warm golden rim lighting, a restrained cyan stage-light reflection. Front elevation, wide landscape 3:2 composition, perfectly CLOSED pair of heavy plush curtains meeting along a straight vertical seam at EXACT horizontal center. Left and right fabric panels each fill their entire half of the canvas from top to bottom, no open gap, no perspective angle. The two halves must be independently usable as wings that pull outward. Cloth texture should have drawn highlights and nuanced curved folds, NOT regular vertical gradient bars or photorealistic material. Keep any gold decoration attached to each fabric half; NO rigid arch, no horizontal gold rod across the seam, no stage scenery, no people or characters, no masks, no hearts, no musical symbols, no text, no logo, no UI, no lettering, no watermark. Full-bleed opaque fabric all the way to the outside edges; lower fabric hem subtly scalloped with very fine gold fringe, framed at the bottom edge rather than exposing floor. Premium professionally art-directed illustrated theatre curtain with the same vivid Renaissance-meets-Broadway palette as the reference. It must feel like it was painted by the same illustrator, with enough contrast and texture to look beautiful on a full-screen 11-inch iPad.
```
