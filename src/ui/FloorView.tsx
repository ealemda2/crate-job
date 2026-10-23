import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { floorPlan } from "../core/floorPlan";
import type { DisplayUnits, Layout } from "../core/project";
import {
  centre,
  fitView,
  panByPixels,
  scrollByPixels,
  toPlanPoint,
  wheelPixels,
  wheelZoomFactor,
  withAspect,
  ZOOM_STEP,
  zoomAt,
  type PanelSize,
  type Viewport,
} from "../core/viewport";
import { tokens } from "../design/tokens";

/** Safari's trackpad pinch: not in the TypeScript DOM lib. */
type GestureEvent = Event & { scale: number; clientX: number; clientY: number };

const WHEEL_MODES = ["pixel", "line", "page"] as const;

/**
 * Top-down, true-to-scale floor view: interior outline, lanes as floor tape, nose and doors labelled.
 * Scroll or drag to pan; pinch or Ctrl/⌘ + scroll to zoom.
 */
export function FloorView({ layout, units }: { layout: Layout; units: DisplayUnits }) {
  const plan = useMemo(() => floorPlan(layout, units), [layout, units]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<PanelSize | null>(null);
  const [view, setView] = useState<Viewport | null>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  const fitted = (s: PanelSize) => fitView(plan.outline, s.width / s.height, tokens.floor.marginMm);

  // Track the panel size; fit on first measure, then keep the current zoom when the panel changes shape.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setSize({ width, height });
      setView((v) => (v ? withAspect(v, width / height) : fitted({ width, height })));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [plan.outline]);

  // Wheel and Safari gesture listeners must be non-passive to stop the page scrolling or zooming.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const pointAt = (v: Viewport, clientX: number, clientY: number) => {
      const r = svg.getBoundingClientRect();
      return toPlanPoint(v, { x: clientX - r.left, y: clientY - r.top }, r);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      const mode = WHEEL_MODES[e.deltaMode] ?? "pixel";
      const scroll = { x: wheelPixels(e.deltaX, mode, r.height), y: wheelPixels(e.deltaY, mode, r.height) };
      setView((v) => {
        if (!v) return v;
        if (e.ctrlKey || e.metaKey) return zoomAt(v, wheelZoomFactor(scroll.y), pointAt(v, e.clientX, e.clientY));
        return scrollByPixels(v, scroll, r);
      });
    };
    let lastScale = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      lastScale = 1;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as GestureEvent;
      const factor = g.scale / lastScale;
      lastScale = g.scale;
      setView((v) => (v ? zoomAt(v, factor, pointAt(v, g.clientX, g.clientY)) : v));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("gesturestart", onGestureStart);
    svg.addEventListener("gesturechange", onGestureChange);
    return () => {
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("gesturestart", onGestureStart);
      svg.removeEventListener("gesturechange", onGestureChange);
    };
  }, []);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId || !size) return;
    const dragPx = { x: e.clientX - d.x, y: e.clientY - d.y };
    drag.current = { ...d, x: e.clientX, y: e.clientY };
    setView((v) => (v ? panByPixels(v, dragPx, size) : v));
  };
  const endDrag = () => {
    drag.current = null;
  };
  const zoomCentre = (factor: number) => setView((v) => (v ? zoomAt(v, factor, centre(v)) : v));

  // Labels stay the same size on screen at any zoom, so their sizes are pixels scaled into drawing millimetres.
  const mmPerPx = view && size ? view.width / size.width : 1;
  const font = tokens.floor.labelPx * mmPerPx;
  const gap = tokens.floor.labelGapPx * mmPerPx;
  const { width: truckLength, height: truckWidth } = plan.outline;
  const nose = { x: -gap, y: truckWidth / 2 };
  const doors = { x: truckLength + gap, y: truckWidth / 2 };
  const widthLabelAt = { x: doors.x + tokens.floor.labelStack * font, y: doors.y };

  const label = {
    fontFamily: tokens.font.body,
    fontSize: font,
    fill: tokens.color.textMuted,
    textAnchor: "middle",
    dominantBaseline: "middle",
  } as const;
  const heading = {
    ...label,
    fill: tokens.color.text,
    fontWeight: tokens.font.weight.strong,
    letterSpacing: tokens.font.capsSpacing,
  } as const;

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 0 }}>
      <svg
        ref={svgRef}
        role="img"
        aria-label={`Floor view: ${plan.lengthLabel} by ${plan.widthLabel}`}
        viewBox={view ? `${view.x} ${view.y} ${view.width} ${view.height}` : undefined}
        preserveAspectRatio="none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "grab", userSelect: "none" }}
      >
        {view && (
          <>
            <rect {...plan.outline} fill={tokens.color.truckFloor} />
            {plan.lanes.map((lane) => {
              const mid = centre(lane.rect);
              const clipId = `lane-clip-${lane.id}`;
              return (
                <g key={lane.id}>
                  <clipPath id={clipId}>
                    <rect {...lane.rect} />
                  </clipPath>
                  <rect {...lane.rect} fill={tokens.color.laneTape} fillOpacity={tokens.floor.laneFillOpacity} />
                  {/* Tape is laid inside the lane, so the drawn strip is exactly the lane's width. */}
                  <g clipPath={`url(#${clipId})`}>
                    {lane.edges.map((edge, i) => (
                      <line
                        key={i}
                        x1={edge.from.x}
                        y1={edge.from.y}
                        x2={edge.to.x}
                        y2={edge.to.y}
                        stroke={tokens.color.laneTape}
                        strokeWidth={tokens.floor.tapeMm * 2}
                      />
                    ))}
                  </g>
                  <text
                    {...label}
                    fill={tokens.color.laneTape}
                    x={mid.x}
                    y={mid.y}
                    transform={lane.direction === "crosswise" ? `rotate(-90 ${mid.x} ${mid.y})` : undefined}
                  >
                    Lane · {lane.widthLabel}
                  </text>
                </g>
              );
            })}
            <rect
              {...plan.outline}
              fill="none"
              stroke={tokens.color.truckWall}
              strokeWidth={tokens.floor.wallStrokePx}
              vectorEffect="non-scaling-stroke"
            />
            <text {...heading} {...nose} transform={`rotate(-90 ${nose.x} ${nose.y})`}>
              NOSE
            </text>
            <text {...heading} {...doors} transform={`rotate(90 ${doors.x} ${doors.y})`}>
              DOORS
            </text>
            <text {...label} {...widthLabelAt} transform={`rotate(90 ${widthLabelAt.x} ${widthLabelAt.y})`}>
              {plan.widthLabel} wide
            </text>
            <text {...label} x={truckLength / 2} y={truckWidth + gap} dominantBaseline="hanging">
              Left wall · {plan.lengthLabel} long
            </text>
            <text {...label} x={truckLength / 2} y={-gap} dominantBaseline="auto">
              Right wall
            </text>
          </>
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: tokens.space.s,
          right: tokens.space.s,
          bottom: tokens.space.s,
          display: "flex",
          alignItems: "center",
          gap: tokens.space.xs,
          pointerEvents: "none",
        }}
      >
        <span style={{ marginRight: "auto", color: tokens.color.textMuted, fontSize: tokens.font.size.small }}>
          Scroll or drag to pan · pinch or Ctrl/⌘ + scroll to zoom
        </span>
        <ViewButton label="Zoom out" onClick={() => zoomCentre(1 / ZOOM_STEP)}>
          −
        </ViewButton>
        <ViewButton label="Zoom in" onClick={() => zoomCentre(ZOOM_STEP)}>
          +
        </ViewButton>
        <ViewButton label="Fit truck" onClick={() => size && setView(fitted(size))}>
          Fit
        </ViewButton>
      </div>
    </div>
  );
}

function ViewButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        pointerEvents: "auto",
        minWidth: tokens.controlMinPx,
        padding: `${tokens.space.xs} ${tokens.space.s}`,
        background: tokens.color.panel,
        color: tokens.color.text,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius,
        fontFamily: tokens.font.body,
        fontSize: tokens.font.size.body,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
