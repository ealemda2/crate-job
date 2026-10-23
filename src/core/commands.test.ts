import { describe, expect, it } from "vitest";
import { apply } from "./commands";
import { emptyProject } from "./project";

describe("apply setUnits", () => {
  it("switches the display units and leaves stored millimetres untouched", () => {
    const before = emptyProject("p1");
    const after = apply(before, { type: "setUnits", units: "metric" });
    expect(after.units).toBe("metric");
    expect(after.layout).toEqual(before.layout);
    expect(before.units).toBe("imperial");
  });
});
