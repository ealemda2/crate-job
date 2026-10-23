import { describe, expect, it } from "vitest";
import { fitView, panBy, toPlanPoint, withAspect, zoomAt } from "./viewport";

const truck = { x: 0, y: 0, width: 8000, height: 2000 };

describe("fitView", () => {
  it("centres the whole truck with a margin, widening the view to match a tall panel", () => {
    // 8000 + 2×500 = 9000 wide; a 1:1 panel needs 9000 tall, centred on the truck's middle (y = 1000).
    expect(fitView(truck, 1, 500)).toEqual({ x: -500, y: -3500, width: 9000, height: 9000 });
  });

  it("widens horizontally when the panel is wider than the truck", () => {
    // 2000 + 2×500 = 3000 tall; a 4:1 panel needs 12000 wide, centred on x = 4000.
    expect(fitView(truck, 4, 500)).toEqual({ x: -2000, y: -500, width: 12000, height: 3000 });
  });
});

describe("zoomAt", () => {
  const view = { x: 0, y: 0, width: 10000, height: 5000 };

  it("zooms in around the pointer, keeping the point under it fixed", () => {
    // Doubling the zoom at (2000, 1000) halves the view; that point stays at the same fraction (0.2, 0.2).
    expect(zoomAt(view, 2, { x: 2000, y: 1000 })).toEqual({ x: 1000, y: 500, width: 5000, height: 2500 });
  });

  it("stops zooming in past a view 500 mm wide and out past 50 m wide", () => {
    expect(zoomAt(view, 1000, { x: 0, y: 0 }).width).toBe(500);
    expect(zoomAt(view, 0.001, { x: 0, y: 0 }).width).toBe(50_000);
  });
});

describe("panBy", () => {
  it("moves the view by a distance on the floor", () => {
    expect(panBy({ x: 0, y: 0, width: 100, height: 50 }, 30, -20)).toEqual({ x: 30, y: -20, width: 100, height: 50 });
  });
});

describe("toPlanPoint", () => {
  it("turns a pointer position in the panel into a point on the floor", () => {
    const view = { x: 1000, y: -500, width: 8000, height: 4000 };
    // A 800×400 px panel: 10 mm per pixel; pointer at (200, 100) px.
    expect(toPlanPoint(view, { x: 200, y: 100 }, { width: 800, height: 400 })).toEqual({ x: 3000, y: 500 });
  });
});

describe("withAspect", () => {
  it("keeps the view's centre and width when the panel changes shape", () => {
    expect(withAspect({ x: 0, y: 0, width: 4000, height: 2000 }, 4)).toEqual({ x: 0, y: 500, width: 4000, height: 1000 });
  });
});
