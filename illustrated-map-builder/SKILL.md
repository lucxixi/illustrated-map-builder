---
name: illustrated-map-builder
description: Build or revise bespoke illustrated HTML maps whose regions can be independently selected, restored from grayscale, lifted with a soft glow, zoomed, and replaced by the complete original when all regions are selected. Use for emotion maps, knowledge maps, process maps, hand-drawn continent maps, or other non-geographic illustrated region maps; not for ordinary GIS or data maps.
---

# Illustrated Interactive Map Builder

Create a reusable interactive map without letting frontend code compensate for invalid image assets. The visual style is variable; the asset contract, state model, layout discipline, and verification gates are stable.

## Start by locking the request

Extract and preserve explicit user choices for:

- region count, order, titles, body copy, and optional center;
- artwork source, reference style, palette, typography, and aspect ratio;
- text side and split; default to text left 40%, map right 60%;
- initial, selected, deselected, all-complete, and reset behavior;
- target viewport sizes and deployment target.

The single-screen path template is optimized for 3–9 regions. For more than 9, do not silently shrink text; explicitly choose a paged/filtered path treatment or obtain approval for a denser layout.

Treat supplied artwork, copy, proportions, and style references as hard locks. Do not silently replace, redraw, restyle, renumber, or rewrite them. Use defaults only for missing values.

Before implementation, state the locked parameters and the chosen asset route. Ask only when a missing decision would materially change the result.

## Route by asset readiness

Choose exactly one route:

1. **Layer-ready** — the user provides a complete image plus one transparent image per region. Read [references/asset-contract.md](references/asset-contract.md), validate the files, then build.
2. **Complete-only** — the user provides only a complete map. Read [references/asset-production.md](references/asset-production.md). Produce or request true region layers before building; never approximate hand-drawn boundaries with arbitrary rectangles or polygons and call them extracted.
3. **Concept/style-only** — the user provides content, a style reference, or a new visual direction. Read [references/asset-production.md](references/asset-production.md). Confirm one complete mother map first, then derive all layers from that same approved composition.

Visual style is not a routing axis. Watercolor, ink, collage, 3D, pixel art, paper cut, fantasy, minimalist, and other styles all use the same layer contract and interaction framework.

## Non-negotiable asset gate

Do not start interaction work until:

- every region image has transparency;
- complete image, center image when present, and all region images share the same canvas dimensions and origin;
- each region file contains only its own pixels; all other pixels are transparent;
- compositing the center and regions reconstructs the approved complete map closely enough to pass visual comparison;
- important text is assigned to exactly one rendering layer and is not covered by another region;
- filenames and region IDs match `map.config.json`.

Run `uv run scripts/validate_map_assets.py PROJECT_DIR`. Treat errors as a production blocker. Resolve warnings deliberately rather than hiding them in CSS.

## Build from the stable framework

Create a project with:

```bash
python3 scripts/scaffold_map.py TARGET_DIR
```

Then replace the placeholder config and add validated artwork. Read [references/config-and-framework.md](references/config-and-framework.md) when editing the configuration, layout, state behavior, or template.

Preserve these default invariants unless the user explicitly changes them:

- one viewport with no page-level horizontal or vertical scrolling;
- readable text panel on the left at 40% and map on the right at 60%;
- no region selected on first load or page restore;
- click either the map or its text card to toggle the same region;
- unselected regions are a neutral grayscale rendering of the original, not a translucent wash;
- selected regions restore the original color, rise slightly, and receive restrained edge glow;
- selection never adds aggressive saturation or changes the artwork's palette;
- all selected regions crossfade to the supplied complete original and float as one map;
- wheel zoom is centered at the pointer, bounded, and isolated from page scroll;
- double-click and reset restore 100% zoom;
- visible keyboard focus and reduced-motion support remain intact.

## Verify before deployment

Read [references/qa.md](references/qa.md) and complete its gates in order:

1. asset validation;
2. static recomposition comparison;
3. empty, single-selected, deselected, and all-complete states;
4. map/card bidirectional linking;
5. zoom limits and reset;
6. viewport overflow and text readability at required sizes;
7. browser console and missing-resource checks;
8. production URL recheck after deployment.

If a failure recurs, repair the layer that owns it:

- wrong boundary, seam, or covered artwork → asset layer;
- wrong style or composition → mother-map generation layer;
- wrong selected color → visual-state CSS layer;
- wrong default selection or completion → state layer;
- clipped text or scrolling → layout layer;
- local works but production fails → deployment layer.

Do not keep adding downstream filters, coordinates, or exceptions to conceal an upstream failure.

## Deliver

Report the selected route, locked parameters, asset-gate result, tested viewport sizes, interaction results, and final URL or local files. Distinguish verified behavior from visual judgments that still require user approval.
