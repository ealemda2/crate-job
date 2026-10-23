/**
 * Zoom and pan for the floor view. A viewport is the window onto the floor in drawing millimetres
 * (see floorPlan.ts); the SVG uses it as its viewBox.
 */
import type { PlanPoint, PlanRect } from "./floorPlan";

export type Viewport = PlanRect;

/** The floor view panel's size on screen, in CSS pixels. */
export interface PanelSize {
  width: number;
  height: number;
}

/** One click of the zoom buttons, and the most one mouse-wheel notch zooms. */
export const ZOOM_STEP = 1.25;
/** How strongly a pinch (or Ctrl + scroll) zooms per pixel of wheel delta. */
const PINCH_PER_PX = 0.01;
const LINE_PX = 16;

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
  const scale = width / view.width;
  return {
    x: at.x - (at.x - view.x) * scale,
    y: at.y - (at.y - view.y) * scale,
    width,
    height: view.height * scale,
  };
}

export function panBy(view: Viewport, dxMm: number, dyMm: number): Viewport {
  return { ...view, x: view.x + dxMm, y: view.y + dyMm };
}

/** The floor point under a pointer at `px` (pixels from the panel's top-left) in a panel of `size` pixels. */
export function toPlanPoint(view: Viewport, px: PlanPoint, size: PanelSize): PlanPoint {
  return { x: view.x + (px.x * view.width) / size.width, y: view.y + (px.y * view.height) / size.height };
}

/** Reshape the view to a new panel width/height ratio, keeping its centre and width. */
export function withAspect(view: Viewport, aspect: number): Viewport {
  const height = view.width / aspect;
  return { ...view, y: view.y + view.height / 2 - height / 2, height };
}

/** Move the view so the floor follows a pointer dragged by `dragPx` pixels. */
export function panByPixels(view: Viewport, dragPx: PlanPoint, size: PanelSize): Viewport {
  return panBy(view, (-dragPx.x * view.width) / size.width, (-dragPx.y * view.height) / size.height);
}

/** Pan the view by a wheel or two-finger scroll of `scrollPx` pixels. */
export function scrollByPixels(view: Viewport, scrollPx: PlanPoint, size: PanelSize): Viewport {
  return panByPixels(view, { x: -scrollPx.x, y: -scrollPx.y }, size);
}

/** A wheel delta in pixels, whatever unit the browser reported it in (Firefox reports mouse wheels in lines). */
export function wheelPixels(delta: number, mode: "pixel" | "line" | "page", pageHeightPx: number): number {
  return mode === "line" ? delta * LINE_PX : mode === "page" ? delta * pageHeightPx : delta;
}

/** Zoom factor for a pinch or Ctrl + scroll of `deltaYPx`: smooth for a trackpad, one step at most for a mouse notch. */
export function wheelZoomFactor(deltaYPx: number): number {
  return Math.min(ZOOM_STEP, Math.max(1 / ZOOM_STEP, Math.exp(-deltaYPx * PINCH_PER_PX)));
}

export function centre(view: Viewport): PlanPoint {
  return { x: view.x + view.width / 2, y: view.y + view.height / 2 };
}
