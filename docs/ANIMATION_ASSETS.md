# Animation assets and maintenance

SVG mattes sample the RGB pixels of the scene illustrations. Separate clean plates fill the space exposed when an illustrated layer moves. The original paintings, mattes and clean plates share a **1536 × 1024** coordinate system. Romeo’s flying entrance uses its own **1086 × 724** artwork. Eighteen scenes also use supplementary drawn poses during choreography. Each has a fully illustrated resting frame for reading with motion off.

The paths below are portable repository-relative names. `source-assets/` is the source asset bundle. If delivered as a GitHub Release archive, extract it at the repository root. The application serves the smaller WebP files in `public/assets/`. The TypeScript mattes are authoritative for original-pixel animation. The pose sheets and generation prompts are archived alongside the other artwork. Runtime requires no external segmentation or image-generation service.

## Source files to retain

| Source bundle path | Runtime file | Purpose |
| --- | --- | --- |
| `source-assets/story-masters/scene-01.png` through `scene-48.png` | `public/assets/story/scene-01.webp` through `scene-48.webp` | Original story paintings. Preserve framing, registration, identity and proportions. |
| `source-assets/theatre/curtain-illustrated-v1.png` | `public/assets/theatre/curtain-illustrated-v1.webp` | Separate illustrated UI curtain, used by `TheatreCurtain.tsx` and theatre styling. |
| `source-assets/animation-plates/scene-03-clean.png` | `public/assets/premium/scene-03-clean.webp` | Hidden theatre wall/floor behind Shakespeare and Anne. |
| `source-assets/animation-plates/scene-10-clean.png` | `public/assets/premium/scene-10-clean.webp` | Hidden set/floor behind the carriage, its riders, wheels and reins. |
| `source-assets/animation-plates/scene-14-clean.png` | `public/assets/premium/scene-14-clean.webp` | Hidden ballroom behind Juliet and the chandelier/swing. |
| `source-assets/animation-plates/scene-24-clean.png` | `public/assets/premium/scene-24-clean.webp` | Archived clean plate for the previous podium entrance. |
| `source-assets/performance/scene-24-romeo-descent.png` | `public/assets/performance/scene-24-prep.webp` and `scene-24-hit.webp` | Registered clean stage and full Romeo descent artwork. [Reference and prompt](../source-assets/performance/SCENE-24-DESCENT-PROMPT.md) |
| `source-assets/animation-plates/scene-46-clean.png` | `public/assets/premium/scene-46-clean.webp` | Hidden stage behind the central balcony and Juliet. |

The curtain and the five PNGs in `animation-plates/` are 1536 × 1024. Full clean-plate prompts, method, runtime SHA-256 hashes and original generation identifiers are in `docs/PREMIUM_ASSET_PROVENANCE.json`. The curtain prompt is documented in `docs/CURTAIN_ART_DIRECTION.md` when included in the handoff. Generation used the built-in imagegen tool, editing hidden scenery for the plates and creating a separate reference-guided curtain.

## Five layered scenes

| Scene | Code dependencies | Layer behavior and limits |
| --- | --- | --- |
| 03, Shakespeare and Anne | `components/PremiumStage.tsx`; `motion/premium-opening.ts`; `motion/premium-masks.ts` types | Original quill, forearm/finger and head cutouts. Pivots/joins hide behind the original hand and cuff. Quill about 7°, forearm 5°, head 2°; return to the source pose. The turning manuscript is a code-drawn prop. |
| 10, carriage | `components/JourneyStage.tsx`; `motion/journey-masks.ts`; `styles/journey-stage.css` | Original coach/riders bob about 1.8 source pixels. Two original spoke/hub mattes rotate inside stationary elliptical rims; inverse projection makes the rotation circular before restoring perspective. The normalized SVG image **must keep `preserveAspectRatio="none"`**. Blue floor apertures are excluded from the wheel paint matte. |
| 14, chandelier | `components/PremiumStage.tsx`; `motion/premium-masks.ts`; `styles/premium-stage.css` | Juliet, seat, chains, crystals and fixture move as a pendulum around the top suspension. Keep the current swing within approximately ±1.1°; larger movement exposes imperfect hair/chain edges. Supporting audience stays fixed. |
| 24, Romeo entrance | `components/JourneyStage.tsx`; `components/RomeoDescent.tsx`; `styles/journey-stage.css` | Romeo, the platform and the ROMEO sign descend together in a traced matte over the clean stage. Suspension lines and a followspot are drawn at runtime. The complete descent illustration is the resting frame. |
| 46, Roar | `components/PremiumStage.tsx`; `styles/premium-stage.css` | The original balcony matte is archived. The current costume keyframes use a stable balcony composition with independent followspots and confetti. |

Import paths above start at `src/`. `App.tsx` selects the five layered renderers. Other scenes use `Stage.tsx`, `TheatricalEffects.tsx` and `motion/scene-motion.ts` for scene-specific stage effects around their complete original paintings.

Motion repeats automatically; deliberate replay is optional. The `motion`/`mode` props carry the app's quiet, reduced-motion, visibility and overlay/curtain gating. Preserve that contract and clean up GSAP contexts on unmount or motion changes. Journey scenes display their complete original bitmap when motion is disabled or layers are unavailable.

## How to change a layer safely

1. Change timing, travel or easing in the renderer when the art itself remains correct. Keep motions within the documented bounds.
2. Change contours/pivots in the relevant `src/motion/` file when adjusting a cutout. Preserve original source-space coordinates; moving all mattes to a new crop requires explicit remapping.
3. Keep the **base-removal matte separate from the moving matte**. A broader cleared footprint prevents a stationary copy of the old prop from showing underneath. Preserve `removalHoles` and fixed foreground rules. Reusing one broad scenic matte for everything previously produced curved blue bands below the balcony.
4. Repair only hidden scenery if a larger move exposes an area the plate cannot cover. Use the matching original scene as the edit target and retain its camera registration. Do not regenerate a visible actor to conceal a matte problem.
5. Keep the existing runtime WebP bytes when possible. The color-derived wheel and balcony mattes were derived from those encoded pixels. Re-encoding a PNG master can change edge colors even if dimensions stay identical; inspect a few moved frames before replacing it.
6. Inspect registration and the cutout edges at rest and during movement at iPad landscape size. A successful build packages the app; no additional automated test suite is required for these asset edits.

The original-pixel scenes use 2.5D cutouts. Some hand-traced edges carry tiny backdrop slivers, so travel is kept within the documented bounds.

## Portable pixel-matte authoring helper

`source-assets/tools/generate-pixel-mattes.py` regenerates the two color-derived mattes from the existing runtime WebPs. It has no local machine paths and never splices TypeScript, edits images or changes application files. It requires **Python 3.10+, Pillow and NumPy** only in the offline authoring environment; these are not website dependencies.

```sh
python -m pip install Pillow numpy
python source-assets/tools/generate-pixel-mattes.py --repo . --output work/pixel-mattes --scene all
```

`--scene` accepts `10`, `46` or `all` (the default). Inputs are `public/assets/story/scene-10.webp` and/or `scene-46.webp`; the tool rejects dimensions other than 1536 × 1024 rather than resizing them.

| Generated file, relative to `--output` | Use |
| --- | --- |
| `scene-10-wheels.json` | Original wheel centers, ellipse radii and `paintPath` strings for `carriageMatte.wheels` in `src/motion/journey-masks.ts`. |
| `scene-46-balcony.json` | Source identity, measurements and `paintPath` for `finaleBalconyPixelMatte` in `src/motion/premium-masks.ts`. |
| `scene-46-balcony.svgpath` | The same balcony path as plain SVG path data, convenient to inspect or copy. |
| `pixel-mattes-manifest.json` | Selected sources, input SHA-256 hashes, output measurements/path hashes and Pillow/NumPy versions for that authoring run. |

The square wheel dilation, circular balcony dilation and original SVG row-run serialization are preserved from the original authoring algorithms. With the original runtime pixels, they regenerate the data embedded in the final constants. Only merge the intended data: keep the hand-traced silhouettes, pivots, separate removal footprints, wheel projection, and y568 fixed foreground rule intact. Different image encodings or image-library versions can alter HSV edge classification; the manifest makes those inputs explicit.

The older `make-wheel-paths.py` and `generate-scene46-matte.py` scratch helpers are historical sources, superseded by this data-only tool. They are not required to maintain the app. The latter contained an obsolete TypeScript-splicing step; do not revive that behavior. Scratch render scripts and PNG frames are visual review aids rather than essential asset generators.

The source-asset manifest and provenance records identify the archived PNG originals and their hashes. Future maintenance should use those repository-relative bundle paths, never a previous developer's local image-generation cache.

## Choreography and stage cues

Scene 06 uses `src/components/PaintedPerformance.tsx` and `src/motion/painted-gesture.ts` to move four local regions of the original artwork. WebGL availability and the motion settings determine whether the drawn movement plays. The Hebrew production and asset brief is [LIVE_MUSICAL_DIRECTION_HE.md](LIVE_MUSICAL_DIRECTION_HE.md).

`StageCue.tsx` places a focusable touch target on the relevant part of the painting in scenes 03, 06, 10, 14, 24, 28, 38, 46 and 48. The carriage cue increases the rate of the existing wheel rotation, then eases back to its ambient pace. The chandelier cue starts a swing, and the adjacent drag area sets the swing direction. `StageMoments.tsx` draws the split-feather effect in 28 and the audience's clapping silhouettes in 48. The effects repeat after a rest and can also be triggered by touch.

These keyframes were generated with the built-in ImageGen using the original paintings as references. Each archived 2172 × 724 PNG sheet contains two 1086 × 724 cells. Each runtime WebP is one of those cells at native resolution. Use `x=0` for `prep` and `x=1086` for `hit`. The animation and official music player run independently. [Original choreography prompts](../source-assets/performance/PROMPTS.md) · [Production-reference prompts](../source-assets/performance/PRODUCTION_REFERENCE_PROMPTS.md)

| Scene | Prep and hit poses | Archived sheet |
| --- | --- | --- |
| 15, the first meeting | May and François nearly bump into each other on a busy dance floor, then exchange a smile. | [scene-15-keyframes.png](../source-assets/performance/scene-15-keyframes.png) |
| 17, Overprotected | François plays the piano alone. Juliet appears from behind and he turns to her. | [scene-17-keyframes.png](../source-assets/performance/scene-17-keyframes.png) |
| 18, Confident | Juliet and François dance on the banquet table, then the scene returns to the piano and May's reaction. | [Dance sheet](../source-assets/performance/scene-18-keyframes.png) · [Piano still source](../source-assets/performance/scene-18-piano-reference.png) |
| 20, Teenage Dream / Break Free | Angélique holds Lance's hand as he almost loses his balance. | [scene-20-keyframes.png](../source-assets/performance/scene-20-keyframes.png) |
| 21, Oops!...I Did it Again | François opens the ring box. Juliet recoils and almost spills her drink. | [scene-21-keyframes.png](../source-assets/performance/scene-21-keyframes.png) |
| 22, I Kissed A Girl | After the kiss, François remembers his promise. Their hands lower and part. | [scene-22-keyframes.png](../source-assets/performance/scene-22-keyframes.png) |
| 26, Since U Been Gone | Juliet opens up to the audience while Romeo listens and gives her space. | [scene-26-keyframes.png](../source-assets/performance/scene-26-keyframes.png) |
| 31, One More Try | Juliet and Romeo listen to one another as the moon bench rises in front of the Ferris wheel. | [scene-31-keyframes.png](../source-assets/performance/scene-31-keyframes.png) |
| 33, Problem / Can’t Feel My Face | Juliet, Romeo and the cast go from a close-arm count to an open-arm answer. | [scene-33-keyframes.png](../source-assets/performance/scene-33-keyframes.png) |
| 36, That’s the Way It Is | Anne and Juliet stand after the stairway conversation. | [scene-36-keyframes.png](../source-assets/performance/scene-36-keyframes.png) |
| 38, wedding band | A collective crouch followed by a knee lift and reach. Lance opens his arm across the other four performers' synchronized reach. | [scene-38-keyframes.png](../source-assets/performance/scene-38-keyframes.png) |
| 40, It’s Gonna Be Me | Juliet stops the ceremony and François reaches for May’s hand. | [scene-40-keyframes.png](../source-assets/performance/scene-40-keyframes.png) |
| 42, Stronger | Juliet plants her feet and raises a hand as the ensemble gives her room. | [scene-42-keyframes.png](../source-assets/performance/scene-42-keyframes.png) |
| 43, Shape of My Heart | Lance opens his arms and François accepts the apology with a hug. | [scene-43-keyframes.png](../source-assets/performance/scene-43-keyframes.png) |
| 44, track 26 | Angélique puts a hand on Juliet's shoulder. Juliet leans in for a hug. | [scene-44-keyframes.png](../source-assets/performance/scene-44-keyframes.png) |
| 46, Roar | Juliet sings and lifts the microphone in her gold, fuchsia and purple costume; François cheers empty-handed below. | [scene-46-costume-keyframes.png](../source-assets/performance/scene-46-costume-keyframes.png) |
| 47, I Want It That Way (Reprise) | Juliet and Romeo shake hands as friends. Anne and Shakespeare acknowledge each other from the wings. | [scene-47-keyframes.png](../source-assets/performance/scene-47-keyframes.png) |
| 48, curtain call | Eight cast members face the house and then bend forward together. | [scene-48-keyframes.png](../source-assets/performance/scene-48-keyframes.png) |

To recreate a runtime crop, use FFmpeg with libwebp. Put both WebPs for each scene in `public/assets/performance/`. The offline build checks for all 36 choreography frames and the separate Romeo descent pair, and records their hashes. The corrected stills in 01, 15, 17, 18, 24, 31, 33 and 46 also serve the scene picker thumbnails. Canonical masters and the previous blue Roar sheet remain archived. [Prompts for the proposal and reconciliation scenes](../source-assets/performance/CONNECTIONS_PROMPTS.md)

`StoryLighting.tsx` sequences focused light over listening characters, the wedding arch, or a group hug in seven quieter scenes. The movement is composed independently of the official music player.

```sh
ffmpeg -i source-assets/performance/scene-38-keyframes.png \
  -vf 'crop=1086:724:0:0,format=yuv420p' -frames:v 1 \
  -c:v libwebp -quality 88 -compression_level 6 \
  public/assets/performance/scene-38-prep.webp
```
