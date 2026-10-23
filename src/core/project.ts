/**
 * The data model. Every other module builds on these types; a saved file is a `Project` as JSON.
 *
 * Units at rest (ADR 0002): lengths are integer millimetres, weights integer grams.
 * Axes: x runs from the nose (x = 0) toward the doors; y runs across the floor from the left wall (y = 0),
 * "left" as seen standing at the doors looking toward the nose. Height is never stored: a crate rests on
 * the floor or on the crate below, and that is derived.
 *
 * Changing this shape means bumping SCHEMA_VERSION and adding a migration with a test.
 */

export const SCHEMA_VERSION = 1;

export type QuarterTurn = 0 | 90 | 180 | 270;
export type Posture = "upright" | "flat";
export type DisplayUnits = "imperial" | "metric";

export interface Dimensions {
  /** Along the crate's own length axis, at turn 0 aligned with x. */
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

/** A straight strip of floor kept clear (GLOSSARY: Lane). */
export interface Lane {
  id: string;
  /** lengthwise: runs doors to nose, offset measured from the left wall. crosswise: runs wall to wall, offset measured from the nose. */
  direction: "lengthwise" | "crosswise";
  offsetMm: number;
  widthMm: number;
}

/** A truck's interior, payload and lanes; saved by name as a layout template. */
export interface Layout {
  name: string;
  interior: Dimensions;
  maxPayloadG: number;
  lanes: Lane[];
}

export interface Handling {
  people: 1 | 2 | 4;
  equipment: "forklift" | "pallet-jack" | null;
  fragile: boolean;
}

export interface CrateType {
  id: string;
  label: string;
  dims: Dimensions;
  weightG: number;
  stackable: boolean;
  /** null = no limit beyond `stackable`. */
  maxLoadOnTopG: number | null;
  orientation: "upright-only" | "may-lay-flat";
  handling: Handling;
}

/** Where a crate sits. (xMm, yMm) is the nose-left corner of its footprint after turning. */
export interface Placement {
  xMm: number;
  yMm: number;
  turn: QuarterTurn;
  posture: Posture;
}

export interface Crate {
  id: string;
  /** Stenciled number, e.g. "C-104"; unique within a project. */
  crateNumber: string;
  /** Free text: what is inside, possibly several works. */
  contents: string;
  crateTypeId: string;
  /** null while the crate is still in the list and not yet in the truck. */
  placement: Placement | null;
  notes: string;
}

export interface Project {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  name: string;
  origin: string;
  destination: string;
  /** ISO date, YYYY-MM-DD, or empty. */
  shipDate: string;
  units: DisplayUnits;
  layout: Layout;
  crateTypes: CrateType[];
  crates: Crate[];
  /** Crate ids in the order they come off the truck. Empty means "use the default order". */
  unloadOrder: string[];
  senderNotes: string;
}

/** A 26 ft box truck with a centre lengthwise lane: the layout a new project opens with. */
export function defaultLayout(): Layout {
  return {
    name: "26 ft box truck, centre lane",
    interior: { lengthMm: 7925, widthMm: 2438, heightMm: 2438 },
    maxPayloadG: 4_500_000,
    lanes: [{ id: "lane-centre", direction: "lengthwise", offsetMm: 914, widthMm: 610 }],
  };
}

export function emptyProject(id: string): Project {
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    name: "Untitled shipment",
    origin: "",
    destination: "",
    shipDate: "",
    units: "imperial",
    layout: defaultLayout(),
    crateTypes: [],
    crates: [],
    unloadOrder: [],
    senderNotes: "",
  };
}
