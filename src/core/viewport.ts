/**
 * Zoom and pan for the floor view. A viewport is the window onto the floor in drawing millimetres
 * (see floorPlan.ts); the SVG uses it as its viewBox.
 */
import type { PlanPoint, PlanRect } from "./floorPlan";

export type Viewport = PlanRect;

const MIN_VIEW_WIDTH_MM = 500;
const MAX_VIEW_WIDTH_MM = 50_000;

/** The view that shows all of `bounds` plus `marginMm` on every side, in a panel of the given width/height ratio. */
export function fitView(bounds: PlanRect, aspect: number, marginMm: number): Viewport {
  const needW = bounds.width + 2 * marginMm;
  const needH = bounds.height + 2 * marginMm;
  const width = Math.max(needW, needH * aspect);
  const height = width / aspect;
  return {
    x: bounds.x + bounds.width / 2 - width / 2,
    y: bounds.y + bounds.height / 2 - height / 2,
    width,
    height,
  };
}

/** Zoom by `factor` (> 1 zooms in) keeping `at` where it is on screen. */
export function zoomAt(view: Viewport, factor: number, at: PlanPoint): Viewport {
  const width = Math.min(MAX_VIEW_WIDTH_MM, Math.max(MIN_VIEW_WIDTH_MM, view.width / factor));
  const k = width / view.width;
  return {
    x: at.x - (at.x - view.x) * k,
    y: at.y - (at.y - view.y) * k,
    width,
    height: view.height * k,
  };
}

export function panBy(view: Viewport, dxMm: number, dyMm: number): Viewport {
  return { ...view, x: view.x + dxMm, y: view.y + dyMm };
}

/** The floor point under a pointer at `px` (pixels from the panel's top-left) in a panel of `size` pixels. */
export function toPlanPoint(view: Viewport, px: PlanPoint, size: { width: number; height: number }): PlanPoint {
  return { x: view.x + (px.x * view.width) / size.width, y: view.y + (px.y * view.height) / size.height };
}

/** Reshape the view to a new panel width/height ratio, keeping its centre and width. */
export function withAspect(view: Viewport, aspect: number): Viewport {
  const height = view.width / aspect;
  return { ...view, y: view.y + view.height / 2 - height / 2, height };
}
