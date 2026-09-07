# Verification Gates

Run the gates in this order. A later pass does not excuse an earlier failure.

## 1. Assets

Run:

```bash
uv run scripts/validate_map_assets.py PROJECT_DIR --preview
```

Require zero errors. Inspect `asset-recomposition-preview.png` against the approved complete image.

## 2. Core states

- Fresh load shows `0 / N` and no colored region.
- Map click selects the intended visible shape.
- Card click selects the same region.
- Second click deselects it.
- Refresh/page restore returns to zero unless persistence was explicitly requested.
- All regions selected shows the complete original.
- Deselecting one region returns to layers.
- Reset clears all regions and zoom.

## 3. Visual behavior

- Unselected state is neutral grayscale, still legible.
- Selected state restores the artwork's original color.
- No opacity wash reveals another layer beneath.
- No aggressive saturation shift.
- Lift and glow are visible but restrained.
- No HTML label covers map text or illustration.

## 4. Zoom

- Wheel zoom follows the pointer location.
- Min and max values are enforced.
- The browser page itself does not scroll while zooming over the map.
- Double-click and reset return to 100%.
- Zooming never changes selection.

## 5. Viewports

Test the user's required sizes. If unspecified, cover at least:

- 1920×1080;
- 1440×810;
- 1280×720;
- 1180×784;
- 919×782.

At each size verify `scrollWidth === innerWidth` and `scrollHeight === innerHeight`, every card remains readable, and the map is fully visible at 100%.

## 6. Runtime and production

- No JavaScript errors.
- No missing images, fonts, config, or favicon errors that affect delivery.
- Keyboard focus is visible and every card toggles with Enter/Space.
- Reduced-motion preference suppresses nonessential animation.
- After deployment, repeat a small viewport check and one all-complete interaction on the production URL.

Capture screenshots for empty, one-selected, and all-complete states. Report exact tested sizes and failures fixed.
