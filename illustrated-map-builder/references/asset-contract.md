# Asset Contract

Use this contract for the layer-ready route and as the target of the other routes.

## Required files

```text
project/
├── map.config.json
└── assets/
    ├── map-complete.png
    ├── center.png          optional
    ├── region-01.png
    ├── region-02.png
    └── ...
```

The complete image is the approved source of truth. Region thumbnails should reuse region images unless a separate thumbnail is explicitly requested.

## Canvas invariant

Every map PNG must have the same pixel dimensions and origin. If the complete map is 1920×1080, every region and center file is also 1920×1080. The pixels outside that layer are transparent; do not tightly crop each region.

This removes per-region `x`, `y`, and `width` guesses, keeps text and borders registered, and makes style changes independent from frontend geometry.

## Alpha and seams

- Region files require a real alpha channel and at least some transparent pixels.
- A region contains its own border exactly once. Avoid duplicated seam strokes unless the approved mother map contains them.
- Adjacent layers may overlap only where the mother artwork overlaps.
- Do not use a white or checkerboard-filled background as fake transparency.
- Do not erase interior paper texture to make a hit area.

## Text ownership

Choose one:

- **Artwork text:** titles and labels are baked into the map layers. HTML shows navigation copy only and never overlays duplicate map cards.
- **HTML text:** artwork contains no text; the template positions readable HTML labels using explicit coordinates.

Artwork text is the stable default for highly illustrated maps. Never mix both unintentionally.

## Recomposition gate

Composite the center, then regions in the configured order. Compare the result with `map-complete.png` at full size. Inspect:

- outer silhouette;
- internal seams;
- text edges;
- illustration continuity;
- paper texture;
- pixels near overlapping borders.

If they do not reconstruct the approved image, fix exports or layer order. Do not start CSS positioning experiments.
