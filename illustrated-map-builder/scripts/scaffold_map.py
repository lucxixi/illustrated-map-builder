#!/usr/bin/env python3
"""Copy the stable illustrated-map frontend into a new project directory."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", type=Path, help="New or empty project directory")
    args = parser.parse_args()

    template = Path(__file__).resolve().parents[1] / "assets" / "frontend-template"
    target = args.target.expanduser().resolve()

    if target.exists() and any(target.iterdir()):
        parser.error(f"target is not empty: {target}")

    target.mkdir(parents=True, exist_ok=True)
    shutil.copytree(template, target, dirs_exist_ok=True)
    print(f"Created illustrated map project: {target}")
    print("Next: edit map.config.json, add same-canvas PNG layers, then run validate_map_assets.py.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
