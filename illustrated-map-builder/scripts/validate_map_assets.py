#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10.0"]
# ///
"""Validate an illustrated map manifest and its same-canvas PNG layers."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError as exc:
    raise SystemExit("Run this validator with: uv run scripts/validate_map_assets.py PROJECT_DIR") from exc


def mean_difference(left: Image.Image, right: Image.Image) -> float:
    def normalize(image: Image.Image) -> Image.Image:
        normalized = Image.new("RGBA", image.size, (0, 0, 0, 0))
        normalized.alpha_composite(image.convert("RGBA"))
        return normalized

    diff = ImageChops.difference(normalize(left), normalize(right))
    histogram = diff.histogram()
    total = sum((index % 256) * count for index, count in enumerate(histogram))
    return total / (left.width * left.height * 4 * 255)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path)
    parser.add_argument("--preview", action="store_true", help="Write asset-recomposition-preview.png")
    parser.add_argument("--strict", action="store_true", help="Fail when recomposition mean difference exceeds 2%")
    args = parser.parse_args()

    project = args.project.expanduser().resolve()
    manifest_path = project / "map.config.json"
    errors: list[str] = []
    warnings: list[str] = []

    if not manifest_path.exists():
        print(f"ERROR missing manifest: {manifest_path}")
        return 1

    try:
        config = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR invalid manifest: {exc}")
        return 1

    regions = config.get("regions")
    if not isinstance(regions, list) or not regions:
        errors.append("regions must be a non-empty array")
        regions = []

    ids = [str(region.get("id", "")) for region in regions]
    if any(not value for value in ids):
        errors.append("every region requires an id")
    if len(ids) != len(set(ids)):
        errors.append("region ids must be unique")

    required_fields = ("title", "image")
    for index, region in enumerate(regions, start=1):
        for field in required_fields:
            if not region.get(field):
                errors.append(f"region {index} missing {field}")

    complete_rel = config.get("completeImage")
    if not complete_rel:
        errors.append("completeImage is required")
        complete_path = None
    else:
        complete_path = project / complete_rel
        if not complete_path.exists():
            errors.append(f"missing complete image: {complete_rel}")

    if errors or complete_path is None:
        for message in errors:
            print(f"ERROR {message}")
        return 1

    try:
        complete = Image.open(complete_path).convert("RGBA")
    except OSError as exc:
        print(f"ERROR cannot open complete image: {exc}")
        return 1

    canvas = complete.size
    layers: list[tuple[str, Image.Image]] = []

    center_rel = config.get("centerImage")
    if center_rel:
        center_path = project / center_rel
        if not center_path.exists():
            errors.append(f"missing center image: {center_rel}")
        else:
            layers.append(("center", Image.open(center_path).convert("RGBA")))

    for region in regions:
        image_rel = region.get("image")
        if not image_rel:
            continue
        path = project / image_rel
        if not path.exists():
            errors.append(f"missing region image: {image_rel}")
            continue
        try:
            source = Image.open(path)
            if source.format != "PNG":
                errors.append(f"region must be PNG: {image_rel}")
            if "A" not in source.getbands():
                errors.append(f"region has no alpha channel: {image_rel}")
            layer = source.convert("RGBA")
            alpha_extrema = layer.getchannel("A").getextrema()
            if alpha_extrema[0] == 255:
                errors.append(f"region has no transparent pixels: {image_rel}")
            if alpha_extrema[1] == 0:
                errors.append(f"region is fully transparent: {image_rel}")
            layers.append((str(region.get("id")), layer))
        except OSError as exc:
            errors.append(f"cannot open {image_rel}: {exc}")

    for name, layer in layers:
        if layer.size != canvas:
            errors.append(f"layer {name} is {layer.size[0]}x{layer.size[1]}, expected {canvas[0]}x{canvas[1]}")

    if errors:
        for message in errors:
            print(f"ERROR {message}")
        return 1

    recomposed = Image.new("RGBA", canvas, (0, 0, 0, 0))
    for _, layer in layers:
        recomposed.alpha_composite(layer)

    difference = mean_difference(recomposed, complete)
    if difference > 0.02:
        message = f"recomposition mean channel difference is {difference:.2%} (target <= 2.00%)"
        if args.strict:
            errors.append(message)
        else:
            warnings.append(message)

    if args.preview:
        preview_path = project / "asset-recomposition-preview.png"
        recomposed.save(preview_path)
        print(f"PREVIEW {preview_path}")

    print(f"CANVAS {canvas[0]}x{canvas[1]}")
    print(f"REGIONS {len(regions)}")
    print(f"DIFFERENCE {difference:.4%}")
    for message in warnings:
        print(f"WARNING {message}")
    for message in errors:
        print(f"ERROR {message}")
    if errors:
        return 1
    print("PASS asset structure is valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
