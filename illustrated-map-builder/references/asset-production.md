# Asset Production Routes

Read this only when validated same-canvas region layers do not yet exist.

## Complete-only route

First determine whether the source actually contains recoverable layers.

- If a layered source file exists, export each named region from it on the full mother canvas.
- If only a flat raster exists, image editing or manual masking is required. Preserve the original; produce masks non-destructively and compare the recomposition.
- If boundaries cannot be recovered without inventing hidden pixels, tell the user. Offer either a deliberate redraw of the whole set or a non-separating interaction treatment. Do not present approximate code polygons as accurate extraction.

When the user supplies hand-cut regions, validate them instead of replacing them with regenerated imitations.

## Concept/style-only route

Lock content and visual parameters before generation:

- region count and adjacency;
- exact copy and language;
- outer silhouette and center role;
- aspect ratio and target viewport;
- reference style, palette, texture, illustration density, and typography;
- whether text is baked into artwork.

Generate one complete mother map first. Review it for correct count, exact text, readable hierarchy, distinct boundaries, and sufficient empty seam space. Do not generate every region independently: separately generated pieces will drift in silhouette, scale, lighting, texture, and typography and will not reassemble.

After approval, derive region layers from the approved mother composition. If the image tool cannot reliably preserve exact geometry while separating layers, use image editing/masking or request layered source assets. Reliability takes precedence over pretending the split succeeded.

## Style changes

A style change replaces the visual parameter set and may require regenerating the full asset family. It must not alter the interaction state machine or layout contract unless requested.

Keep these independent:

```text
content model ≠ visual style ≠ region geometry ≠ interaction behavior
```

This separation allows watercolor today and 3D collage tomorrow without rewriting the application.

## Generation checks

Before approving a mother map, verify observable properties rather than adjectives:

- exact region count;
- every required title appears once and is spelled correctly;
- no title crosses a seam;
- illustrations stay within their region unless overlap is intentional;
- region boundaries remain distinguishable at the smallest target viewport;
- tonal contrast is sufficient after grayscale conversion;
- the original palette survives selected-state restoration without extra saturation.
