import { describe, expect, it } from "vitest";
import { formatLength, formatLengthAs, formatWeight, formatWeightAs } from "./units";

describe("formatLengthAs", () => {
  it("shows inches to the nearest half inch", () => {
    expect(formatLengthAs(610, "in")).toBe('24"');
    expect(formatLengthAs(318, "in")).toBe('12½"');
    expect(formatLengthAs(0, "in")).toBe('0"');
  });

  it("shows feet and inches, carrying a rounded 12 inches into the feet", () => {
    expect(formatLengthAs(7925, "ft-in")).toBe("26' 0\"");
    expect(formatLengthAs(2438, "ft-in")).toBe("8' 0\"");
    expect(formatLengthAs(914, "ft-in")).toBe("3' 0\"");
    expect(formatLengthAs(1537, "ft-in")).toBe("5' 0½\"");
    expect(formatLengthAs(300, "ft-in")).toBe("1' 0\"");
  });

  it("shows whole millimetres", () => {
    expect(formatLengthAs(7925, "mm")).toBe("7925 mm");
  });

  it("shows centimetres to one decimal, dropping a trailing .0", () => {
    expect(formatLengthAs(7925, "cm")).toBe("792.5 cm");
    expect(formatLengthAs(610, "cm")).toBe("61 cm");
  });
});

describe("formatWeightAs", () => {
  it("shows whole pounds with thousands separators, one decimal under 10 lb", () => {
    expect(formatWeightAs(4_500_000, "lb")).toBe("9,921 lb");
    expect(formatWeightAs(45_359, "lb")).toBe("100 lb");
    expect(formatWeightAs(2_000, "lb")).toBe("4.4 lb");
  });

  it("shows whole kilograms with thousands separators, one decimal under 10 kg", () => {
    expect(formatWeightAs(4_500_000, "kg")).toBe("4,500 kg");
    expect(formatWeightAs(12_400, "kg")).toBe("12 kg");
    expect(formatWeightAs(4_500, "kg")).toBe("4.5 kg");
  });
});

describe("formatLength and formatWeight", () => {
  it("use feet-and-inches and pounds for imperial", () => {
    expect(formatLength(7925, "imperial")).toBe("26' 0\"");
    expect(formatWeight(4_500_000, "imperial")).toBe("9,921 lb");
  });

  it("use millimetres and kilograms for metric", () => {
    expect(formatLength(7925, "metric")).toBe("7925 mm");
    expect(formatWeight(4_500_000, "metric")).toBe("4,500 kg");
  });
});
