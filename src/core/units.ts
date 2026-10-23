/**
 * Display formatting at the edge (ADR 0002): stored values are integer millimetres and grams,
 * and these turn them into the strings the planner and reader see.
 */

import type { DisplayUnits } from "./project";

export type LengthUnit = "in" | "ft-in" | "mm" | "cm";

const MM_PER_INCH = 25.4;

/** Whole half inches, so formatting works in integers and never shows float noise. */
function halfInches(mm: number): number {
  return Math.round((mm / MM_PER_INCH) * 2);
}

function inchText(halves: number): string {
  const whole = Math.floor(halves / 2);
  return `${whole}${halves % 2 === 1 ? "½" : ""}"`;
}

export function formatLengthAs(mm: number, unit: LengthUnit): string {
  switch (unit) {
    case "in":
      return inchText(halfInches(mm));
    case "ft-in": {
      const halves = halfInches(mm);
      return `${Math.floor(halves / 24)}' ${inchText(halves % 24)}`;
    }
    case "mm":
      return `${Math.round(mm)} mm`;
    case "cm":
      return `${Math.round(mm) / 10} cm`;
  }
}

export type WeightUnit = "lb" | "kg";

const G_PER_LB = 453.59237;

/** Whole units with thousands separators; one decimal below 10 so light crates do not read as 0 or 1. */
function amount(value: number): string {
  const digits = value < 10 ? 1 : 0;
  return value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function formatWeightAs(g: number, unit: WeightUnit): string {
  return unit === "lb" ? `${amount(g / G_PER_LB)} lb` : `${amount(g / 1000)} kg`;
}

/** The planner's chosen unit system: feet-and-inches and pounds, or millimetres and kilograms. */
export function formatLength(mm: number, units: DisplayUnits): string {
  return formatLengthAs(mm, units === "imperial" ? "ft-in" : "mm");
}

export function formatWeight(g: number, units: DisplayUnits): string {
  return formatWeightAs(g, units === "imperial" ? "lb" : "kg");
}
