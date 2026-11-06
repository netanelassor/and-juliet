#!/usr/bin/env python3
"""Generate data-only SVG mattes from the storybook's original runtime WebPs.

Offline authoring requirements: Python 3.10+, Pillow, NumPy.
Example:
  python source-assets/tools/generate-pixel-mattes.py \
      --repo . --output work/pixel-mattes --scene all

This tool never edits source images, TypeScript or application files. It writes
JSON/SVG-path data only to --output. Preserve the hand-traced silhouettes,
removal footprints, pivots and fixed-foreground rules when merging generated
constants into the application. Square wheel dilation and circular balcony
dilation intentionally match the original authoring algorithms.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

try:
    from PIL import Image, __version__ as pillow_version
    import numpy as np
except ModuleNotFoundError as exc:
    raise SystemExit(
        "This offline authoring tool needs Pillow and NumPy. Install them in "
        "your authoring environment with: python -m pip install Pillow numpy"
    ) from exc

WIDTH, HEIGHT = 1536, 1024


def dilate(mask, radius, *, circular=False):
    """Boolean dilation with the same neighborhoods as the original helpers."""
    result = np.zeros_like(mask)
    height, width = mask.shape
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if circular and dx * dx + dy * dy > radius * radius:
                continue
            source = mask[
                max(0, -dy):height - max(0, dy),
                max(0, -dx):width - max(0, dx),
            ]
            result[
                max(0, dy):height - max(0, -dy),
                max(0, dx):width - max(0, -dx),
            ] |= source
    return result


def svg_row_runs(mask, start, stop, zero_from):
    """Merge identical intervals vertically; retain original helper ordering."""
    active = {}
    rectangles = []
    for y in range(start, stop):
        row = mask[y] if y < zero_from else np.zeros(mask.shape[1], dtype=bool)
        changes = np.diff(np.r_[False, row, False].astype(np.int8))
        starts = np.flatnonzero(changes == 1)
        ends = np.flatnonzero(changes == -1)
        current = {(int(x), int(end - x)) for x, end in zip(starts, ends)}
        for key in list(active):
            if key not in current:
                first_y = active.pop(key)
                rectangles.append((key[0], first_y, key[1], y - first_y))
        for key in current:
            if key not in active:
                active[key] = y
    # Expected image regions include an explicit empty sentinel row.
    if active:
        raise ValueError("Matte row region lacks its closing empty sentinel")
    path = " ".join(
        f"M{x} {y}h{width}v{height}h-{width}Z"
        for x, y, width, height in rectangles
    )
    return path, len(rectangles)


def load_source(repo, scene):
    relative = Path("public/assets/story") / f"scene-{scene:02d}.webp"
    path = repo / relative
    raw = path.read_bytes()
    with Image.open(path) as image:
        if image.size != (WIDTH, HEIGHT):
            raise ValueError(
                f"{relative}: expected {WIDTH}x{HEIGHT}, got {image.size}; "
                "do not resize or crop source art without remapping the rig"
            )
        hsv = np.asarray(image.convert("HSV"))
    return hsv, {
        "scene": scene,
        "source": relative.as_posix(),
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "width": WIDTH,
        "height": HEIGHT,
    }


def generate_wheels(hsv):
    hue, saturation, value = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    y, x = np.mgrid[:HEIGHT, :WIDTH]
    wheels, measurements = [], []
    for cx, cy, rx, ry in [(194, 763, 88, 127), (977, 807, 136, 166)]:
        radius_squared = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
        inside = radius_squared <= 1
        pink = inside & (hue >= 214) & (saturation > 92) & (value > 42)
        selected = pink | (radius_squared <= 0.33 ** 2)
        selected |= dilate(pink, 2) & inside & ((value < 115) | (value > 175))
        selected = dilate(selected, 1) & inside
        path, count = svg_row_runs(
            selected,
            max(0, int(cy - ry) - 1),
            min(HEIGHT, int(cy + ry) + 3),
            cy + ry + 1,
        )
        wheels.append({"cx": cx, "cy": cy, "rx": rx, "ry": ry, "paintPath": path})
        measurements.append({
            "hub": [cx, cy],
            "vectorRectangles": count,
            "selectedPixels": int(selected.sum()),
            "pathBytes": len(path.encode("utf-8")),
            "pathSha256": hashlib.sha256(path.encode("utf-8")).hexdigest(),
        })
    return wheels, measurements


def generate_balcony(hsv):
    hue, saturation, value = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    roi = np.zeros(hue.shape, dtype=bool)
    roi[399:870, 423:1101] = True
    green = (hue >= 43) & (hue <= 126) & (saturation > 63) & (value > 26) & roi
    near = dilate(green, 12, circular=True)
    gold = (hue >= 15) & (hue <= 50) & (saturation > 75) & (value > 50) & near
    flowers = (
        ((hue >= 188) | (hue < 15)) & (saturation > 90) & (value > 60)
        & dilate(green, 10, circular=True)
    )
    ornament = np.zeros_like(roi)
    ornament[527:594, 728:819] = True
    gold |= ornament & (hue >= 12) & (hue <= 50) & (saturation > 65) & (value > 55)
    selected = (green | gold | flowers) & roi
    edge = dilate(selected, 2, circular=True)
    selected |= edge & (value < 116) & (saturation > 30) & roi
    selected = dilate(selected, 1, circular=True) & roi
    path, count = svg_row_runs(selected, 399, 871, 870)
    measurements = {
        "vectorRectangles": count,
        "selectedPixels": int(selected.sum()),
        "pathBytes": len(path.encode("utf-8")),
        "pathSha256": hashlib.sha256(path.encode("utf-8")).hexdigest(),
    }
    return path, measurements


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path, help="Repository root containing public/assets/story")
    parser.add_argument("--output", required=True, type=Path, help="Directory for generated data; no TypeScript is modified")
    parser.add_argument("--scene", choices=["10", "46", "all"], default="all")
    args = parser.parse_args()
    repo, output = args.repo.expanduser().resolve(), args.output.expanduser().resolve()
    scenes = [10, 46] if args.scene == "all" else [int(args.scene)]
    # Read and validate every selected source before writing any generated file.
    try:
        sources = [(scene, *load_source(repo, scene)) for scene in scenes]
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    output.mkdir(parents=True, exist_ok=True)
    manifest = {
        "tool": "generate-pixel-mattes.py",
        "dataOnly": True,
        "authoringDependencies": {"Pillow": pillow_version, "NumPy": np.__version__},
        "scenes": [],
    }
    for scene, hsv, source in sources:
        if scene == 10:
            wheels, measurements = generate_wheels(hsv)
            name = "scene-10-wheels.json"
            write_json(output / name, wheels)
            manifest["scenes"].append({**source, "output": name, "wheels": measurements})
        else:
            path, measurements = generate_balcony(hsv)
            name = "scene-46-balcony.json"
            write_json(output / name, {**source, **measurements, "paintPath": path})
            (output / "scene-46-balcony.svgpath").write_text(path + "\n", encoding="utf-8")
            manifest["scenes"].append({**source, "output": name, **measurements})
    write_json(output / "pixel-mattes-manifest.json", manifest)
    print(json.dumps({"generatedScenes": scenes, "output": str(output), "dataOnly": True}))


if __name__ == "__main__":
    main()
