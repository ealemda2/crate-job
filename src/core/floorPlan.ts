/**
 * The top-down floor view as a derived view: what to draw, in drawing coordinates.
 *
 * Drawing coordinates are millimetres with the nose on the left and the doors on the right. Drawing x is the
 * floor x (distance from the nose). Drawing y grows downward from the right wall, so the left wall
 * (floor y = 0, as seen from the doors looking toward the nose) is at the bottom, which is how a person
 * standing at the doors would see the floor from above.
 */
import type { DisplayUnits, Lane, Layout } from "./project";
import { formatLength } from "./units";

export interface PlanRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlanPoint {
  x: number;
  y: number;
}

export interface PlanSegment {
  from: PlanPoint;
  to: PlanPoint;
}

export interface PlanLane {
  id: string;
  direction: Lane["direction"];
  rect: PlanRect;
  /** The two long edges of the strip, where the floor tape runs. */
  edges: [PlanSegment, PlanSegment];
  widthLabel: string;
}

export interface FloorPlan {
  outline: PlanRect;
  lanes: PlanLane[];
  lengthLabel: string;
  widthLabel: string;
}

export function floorPlan(layout: Layout, units: DisplayUnits): FloorPlan {
  const { lengthMm, widthMm } = layout.interior;
  return {
    outline: { x: 0, y: 0, width: lengthMm, height: widthMm },
    lanes: layout.lanes.map((lane) => {
      const rect =
        lane.direction === "lengthwise"
          ? { x: 0, y: widthMm - lane.offsetMm - lane.widthMm, width: lengthMm, height: lane.widthMm }
          : { x: lane.offsetMm, y: 0, width: lane.widthMm, height: widthMm };
      return { id: lane.id, direction: lane.direction, rect, edges: longEdges(rect, lane.direction), widthLabel: formatLength(lane.widthMm, units) };
    }),
    lengthLabel: formatLength(lengthMm, units),
    widthLabel: formatLength(widthMm, units),
  };
}

function longEdges(r: PlanRect, direction: Lane["direction"]): [PlanSegment, PlanSegment] {
  const right = r.x + r.width;
  const bottom = r.y + r.height;
  return direction === "lengthwise"
    ? [
        { from: { x: r.x, y: r.y }, to: { x: right, y: r.y } },
        { from: { x: r.x, y: bottom }, to: { x: right, y: bottom } },
      ]
    : [
        { from: { x: r.x, y: r.y }, to: { x: r.x, y: bottom } },
        { from: { x: right, y: r.y }, to: { x: right, y: bottom } },
      ];
}
