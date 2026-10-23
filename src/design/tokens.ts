/**
 * Every color, font and spacing value in the app: panels, floor view, 3D scene and export.
 * `warning` and `error` are reserved for rules and never used for decoration.
 */
export const tokens = {
  color: {
    background: "#f6f5f2",
    panel: "#ffffff",
    border: "#d9d6cf",
    text: "#1f1d1a",
    textMuted: "#6b665d",
    accent: "#2f5d8a",
    truckFloor: "#ece9e2",
    truckWall: "#8a847a",
    laneTape: "#3a7d5c",
    crate: "#c9a46a",
    crateSelected: "#2f5d8a",
    /** Reserved for rules. */
    warning: "#e0a100",
    /** Reserved for rules. */
    error: "#c0392b",
  },
  font: {
    body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "ui-monospace, 'SF Mono', Menlo, monospace",
    size: { small: "12px", body: "14px", heading: "18px" },
  },
  space: { xs: "4px", s: "8px", m: "12px", l: "16px", xl: "24px" },
  /** Floor view drawing. Millimetre values are true to scale; pixel values stay the same size at any zoom. */
  floor: {
    /** Clear floor shown around the truck when the view is fitted. */
    marginMm: 900,
    /** Floor tape is 2 in wide, drawn along both edges of a lane. */
    tapeMm: 51,
    laneFillOpacity: 0.12,
    wallStrokePx: 2,
    labelPx: 12,
    /** Gap between the truck outline and its labels. */
    labelGapPx: 16,
  },
  radius: "6px",
} as const;
