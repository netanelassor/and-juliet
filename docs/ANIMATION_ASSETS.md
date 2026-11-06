# Animation assets and maintenance

The animation uses the existing paintings as its visible foreground. SVG mattes sample the RGB pixels of `public/assets/story/scene-NN.webp`; no newly generated character drawing replaces those pixels. Separate clean plates fill the small spaces exposed when an original-pixel layer moves. All paintings, mattes and plates share a **1536 × 1024** coordinate system.

The paths below are portable repository-relative names. `source-assets/` is the source asset bundle; if delivered as a GitHub Release archive, extract it at the repository root. The application serves the smaller assets in `public/assets/`, not the archival PNGs. The final TypeScript mattes are authoritative; there are no separate transparent character PNGs or missing actor sprite sheets to recover. The application does not require a segmentation service, Python or an image-generation API.

## Source files to retain

| Source bundle path | Runtime file | Purpose |
| --- | --- | --- |
| `source-assets/story-masters/scene-01.png` through `scene-48.png` | `public/assets/story/scene-01.webp` through `scene-48.webp` | Original story paintings. Preserve framing, registration, identity and proportions. |
| `source-assets/theatre/curtain-illustrated-v1.png` | `public/assets/theatre/curtain-illustrated-v1.webp` | Separate illustrated UI curtain, used by `TheatreCurtain.tsx` and theatre styling. |
| `source-assets/animation-plates/scene-03-clean.png` | `public/assets/premium/scene-03-clean.webp` | Hidden theatre wall/floor behind Shakespeare and Anne. |
| `source-assets/animation-plates/scene-10-clean.png` | `public/assets/premium/scene-10-clean.webp` | Hidden set/floor behind the carriage, its riders, wheels and reins. |
| `source-assets/animation-plates/scene-14-clean.png` | `public/assets/premium/scene-14-clean.webp` | Hidden ballroom behind Juliet and the chandelier/swing. |
| `source-assets/animation-plates/scene-24-clean.png` | `public/assets/premium/scene-24-clean.webp` | Hidden LED backdrop/platform behind Romeo; Juliet and the set remain fixed. |
| `source-assets/animation-plates/scene-46-clean.png` | `public/assets/premium/scene-46-clean.webp` | Hidden stage behind the central balcony and Juliet. |

All six generated PNG originals above are 1536 × 1024. Full clean-plate prompts, method, runtime SHA-256 hashes and original generation identifiers are in `docs/PREMIUM_ASSET_PROVENANCE.json`. The curtain prompt is documented in `docs/CURTAIN_ART_DIRECTION.md` when included in the handoff. Generation used the built-in imagegen tool, editing hidden scenery for the plates and creating a separate reference-guided curtain. There is no API key to recover.

## Five layered scenes

| Scene | Code dependencies | Layer behavior and limits |
| --- | --- | --- |
| 03, Shakespeare and Anne | `components/PremiumStage.tsx`; `motion/premium-opening.ts`; `motion/premium-masks.ts` types | Original quill, forearm/finger and head cutouts. Pivots/joins hide behind the original hand and cuff. Quill about 7°, forearm 5°, head 2°; return to the source pose. The turning manuscript is a code-drawn prop. |
| 10, carriage | `components/JourneyStage.tsx`; `motion/journey-masks.ts`; `styles/journey-stage.css` | Original coach/riders bob about 1.8 source pixels. Two original spoke/hub mattes rotate inside stationary elliptical rims; inverse projection makes the rotation circular before restoring perspective. The normalized SVG image **must keep `preserveAspectRatio="none"`**. Blue floor apertures are excluded from the wheel paint matte. |
| 14, chandelier | `components/PremiumStage.tsx`; `motion/premium-masks.ts`; `styles/premium-stage.css` | Juliet, seat, chains, crystals and fixture move as a pendulum around the top suspension. Keep the current swing within approximately ±1.1°; larger movement exposes imperfect hair/chain edges. Supporting audience stays fixed. |
| 24, Romeo entrance | `components/JourneyStage.tsx`; `motion/journey-masks.ts`; `styles/journey-stage.css` | Original Romeo enters about 8 source pixels into the followspot, then remains visible through a restrained repeating pose/light loop (about 1.7px movement). Original floor/pedestal foreground from y720 down remains on top. No repeated closed curtain. |
| 46, Roar | `components/PremiumStage.tsx`; `motion/premium-masks.ts`; `styles/premium-stage.css` | Original Juliet and upper platform rise gently (currently 8 source pixels). The original foreground from **y568 down** stays fixed, preserving every front-row cast pixel and support column. This is an upper-platform lift, not translation of the whole balcony set. |

Import paths above start at `src/`. `App.tsx` selects the five layered renderers. Other scenes use `Stage.tsx`, `TheatricalEffects.tsx` and `motion/scene-motion.ts` for scene-specific stage effects around their complete original paintings.

Motion repeats automatically; deliberate replay is optional. The `motion`/`mode` props carry the app's quiet, reduced-motion, visibility and overlay/curtain gating. Preserve that contract and clean up GSAP contexts on unmount or motion changes. Journey scenes display their complete original bitmap when motion is disabled or layers are unavailable.

## How to change a layer safely

1. Change timing, travel or easing in the renderer when the art itself remains correct. Keep motions within the documented bounds.
2. Change contours/pivots in the relevant `src/motion/` file when adjusting a cutout. Preserve original source-space coordinates; moving all mattes to a new crop requires explicit remapping.
3. Keep the **base-removal matte separate from the moving matte**. A broader cleared footprint prevents a stationary copy of the old prop from showing underneath. Preserve `removalHoles` and fixed foreground rules. Reusing one broad scenic matte for everything previously produced curved blue bands below the balcony.
4. Repair only hidden scenery if a larger move exposes an area the plate cannot cover. Use the matching original scene as the edit target and retain its camera registration. Do not regenerate a visible actor to conceal a matte problem.
5. Keep the existing runtime WebP bytes when possible. The color-derived wheel and balcony mattes were derived from those encoded pixels. Re-encoding a PNG master can change edge colors even if dimensions stay identical; inspect a few moved frames before replacing it.
6. Inspect registration and the cutout edges at rest and during movement at iPad landscape size. A successful build packages the app; no additional automated test suite is required for these asset edits.

This is bounded 2.5D cutout animation. It does not provide independently rigged limbs, facial acting, lip synchronization or generated character video. Some hand-traced edges carry tiny backdrop slivers; conservative travel is intentional.

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
