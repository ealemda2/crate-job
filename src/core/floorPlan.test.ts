import { describe, expect, it } from "vitest";
import { floorPlan } from "./floorPlan";
import { defaultLayout, type Layout } from "./project";

describe("floorPlan", () => {
  it("draws the default truck to scale, nose on the left, with its dimensions labelled", () => {
    const plan = floorPlan(defaultLayout(), "imperial");
    expect(plan.outline).toEqual({ x: 0, y: 0, width: 7925, height: 2438 });
    expect(plan.lengthLabel).toBe("26' 0\"");
    expect(plan.widthLabel).toBe("8' 0\"");
  });

  it("draws the default centre lane as a full-length strip", () => {
    const [lane] = floorPlan(defaultLayout(), "imperial").lanes;
    expect(lane).toMatchObject({ direction: "lengthwise", rect: { x: 0, y: 914, width: 7925, height: 610 }, widthLabel: "2' 0\"" });
  });

  it("gives each lane its two long edges, where the tape goes", () => {
    const layout: Layout = {
      ...defaultLayout(),
      lanes: [
        { id: "l", direction: "lengthwise", offsetMm: 914, widthMm: 610 },
        { id: "x", direction: "crosswise", offsetMm: 3000, widthMm: 900 },
      ],
    };
    const [lengthwise, crosswise] = floorPlan(layout, "imperial").lanes;
    expect(lengthwise?.edges).toEqual([
      { from: { x: 0, y: 914 }, to: { x: 7925, y: 914 } },
      { from: { x: 0, y: 1524 }, to: { x: 7925, y: 1524 } },
    ]);
    expect(crosswise?.edges).toEqual([
      { from: { x: 3000, y: 0 }, to: { x: 3000, y: 2438 } },
      { from: { x: 3900, y: 0 }, to: { x: 3900, y: 2438 } },
    ]);
  });

  it("puts a lengthwise lane measured from the left wall on the left-wall side (bottom of the drawing)", () => {
    const layout: Layout = { ...defaultLayout(), lanes: [{ id: "l", direction: "lengthwise", offsetMm: 100, widthMm: 500 }] };
    expect(floorPlan(layout, "imperial").lanes[0]?.rect).toEqual({ x: 0, y: 1838, width: 7925, height: 500 });
  });

  it("draws a crosswise lane wall to wall at its distance from the nose", () => {
    const layout: Layout = { ...defaultLayout(), lanes: [{ id: "x", direction: "crosswise", offsetMm: 3000, widthMm: 900 }] };
    expect(floorPlan(layout, "metric").lanes[0]).toMatchObject({
      direction: "crosswise",
      rect: { x: 3000, y: 0, width: 900, height: 2438 },
      widthLabel: "900 mm",
    });
  });

  it("labels every measurement in the chosen units", () => {
    const plan = floorPlan(defaultLayout(), "metric");
    expect([plan.lengthLabel, plan.widthLabel, plan.lanes[0]?.widthLabel]).toEqual(["7925 mm", "2438 mm", "610 mm"]);
  });
});
