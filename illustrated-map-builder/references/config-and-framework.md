# Configuration and Framework

## Configuration shape

`map.config.json` is the only content and behavior source of truth.

The default single-screen path is designed for 3–9 regions. For a larger count, select an explicit pagination, filtering, or compact-navigation variation instead of making all copy unreadably small.

```json
{
  "title": "重复性负面思维地图",
  "subtitle": "看见循环，理解自己，走向改变。",
  "panelTitle": "八段心理路径",
  "completeImage": "assets/map-complete.png",
  "centerImage": "assets/center.png",
  "aspectRatio": "16 / 9",
  "layout": { "textPercent": 40, "mapPercent": 60 },
  "zoom": { "min": 1, "max": 2.4, "factor": 1.12 },
  "regions": [
    {
      "id": "01",
      "title": "细节触发",
      "state": "被触发",
      "description": "很小的刺激，也会被放大。",
      "image": "assets/region-01.png",
      "color": "#46666D"
    }
  ]
}
```

Omit `centerImage` when no center layer exists. Region order controls visual stacking and hit-test priority.

## Stable rendering model

All images occupy the same map board using `position:absolute; inset:0`. This is why same-canvas exports are mandatory.

The template keeps four concerns separate:

- config: content and parameters;
- image layers: artwork and geometry;
- active set: interaction state;
- CSS: grayscale, glow, lift, layout, and motion.

Do not insert region-specific coordinates into CSS. A new art style or silhouette should require image replacement and config copy only.

## Hit testing

The template samples each region image's alpha channel at the pointer position. Transparent pixels do not intercept clicks. This is more accurate than rectangular buttons and avoids overlapping transparent canvases blocking one another.

The text cards remain semantic buttons and are the keyboard-accessible control surface.

## Completion behavior

When `active.size === regions.length`:

1. individual region layers fade out;
2. `completeImage` fades in;
3. the board receives one restrained floating shadow;
4. deselecting any card returns to independent layers.

Always use the supplied complete original for the final state. Do not assume recomposed layers are visually identical enough for presentation.

## Layout

The default is one fixed viewport:

```text
┌────────────────────────────────────────────┐
│ title                                      │
├─────────────────┬──────────────────────────┤
│ text path 40%   │ interactive map 60%      │
└─────────────────┴──────────────────────────┘
```

At narrow viewports, preserve a usable minimum text width. Do not solve overflow by shrinking all type below readable size. If the user requires mobile stacking, treat it as an explicit additional route rather than silently changing the desktop composition.
