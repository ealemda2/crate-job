import { describe, expect, it } from "vitest";
import { emptyProject, SCHEMA_VERSION } from "./project";

describe("emptyProject", () => {
  it("starts empty, versioned, imperial, with the default layout", () => {
    const p = emptyProject("p1");
    expect(p.schemaVersion).toBe(SCHEMA_VERSION);
    expect(p.units).toBe("imperial");
    expect(p.crates).toEqual([]);
    expect(p.layout.lanes).toHaveLength(1);
  });

  it("stores the layout in whole millimetres and grams (ADR 0002)", () => {
    const { interior, maxPayloadG, lanes } = emptyProject("p1").layout;
    const numbers = [interior.lengthMm, interior.widthMm, interior.heightMm, maxPayloadG, ...lanes.flatMap((l) => [l.offsetMm, l.widthMm])];
    for (const n of numbers) expect(Number.isInteger(n)).toBe(true);
  });

  it("keeps the default lane inside the truck", () => {
    const { interior, lanes } = emptyProject("p1").layout;
    for (const lane of lanes) expect(lane.offsetMm + lane.widthMm).toBeLessThanOrEqual(interior.widthMm);
  });
});
