import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { floorPlan } from "../core/floorPlan";
import type { DisplayUnits, Layout } from "../core/project";
import { fitView, panBy, toPlanPoint, withAspect, zoomAt, type Viewport } from "../core/viewport";
import { tokens } from "../design/tokens";

const ZOOM_STEP = 1.25;
/** How strongly a pinch (or Ctrl + scroll) zooms per pixel of wheel delta. */
const PINCH_SENSITIVITY = 0.01;

/** Safari's trackpad pinch: not in the TypeScript DOM lib. */
type GestureEvent = Event & { scale: number; clientX: number; clientY: number };

/**
 * Top-down, true-to-scale floor view: interior outline, lanes as floor tape, nose and doors labelled.
 * Scroll or drag to pan; pinch or Ctrl/⌘ + scroll to zoom.
 */
export function FloorView({ layout, units }: { layout: Layout; units: DisplayUnits }) {
  const plan = useMemo(() => floorPlan(layout, units), [layout, units]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [view, setView] = useState<Viewport | null>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  const fit = (s: { width: number; height: number }) => setView(fitView(plan.outline, s.width / s.height, tokens.floor.marginMm));

  // Track the panel size; fit on first measure, then keep the current zoom when the panel changes shape.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setSize({ width, height });
      setView((v) => (v ? withAspect(v, width / height) : fitView(plan.outline, width / height, tokens.floor.marginMm)));
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
      setView((v) => {
        if (!v) return v;
        if (e.ctrlKey || e.metaKey) return zoomAt(v, Math.exp(-e.deltaY * PINCH_SENSITIVITY), pointAt(v, e.clientX, e.clientY));
        const mmPerPx = v.width / r.width;
        return panBy(v, e.deltaX * mmPerPx, e.deltaY * mmPerPx);
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
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    drag.current = { ...d, x: e.clientX, y: e.clientY };
    setView((v) => (v ? panBy(v, (-dx * v.width) / size.width, (-dy * v.height) / size.height) : v));
  };
  const endDrag = () => {
    drag.current = null;
  };
  const zoomCentre = (factor: number) =>
    setView((v) => (v ? zoomAt(v, factor, { x: v.x + v.width / 2, y: v.y + v.height / 2 }) : v));

  const mmPerPx = view && size ? view.width / size.width : 1;
  const font = tokens.floor.labelPx * mmPerPx;
  const gap = tokens.floor.labelGapPx * mmPerPx;
  const { width: L, height: W } = plan.outline;

  const label = {
    fontFamily: tokens.font.body,
    fontSize: font,
    fill: tokens.color.textMuted,
    textAnchor: "middle",
    dominantBaseline: "middle",
  } as const;
  const heading = { ...label, fill: tokens.color.text, fontWeight: 600, letterSpacing: "0.08em" } as const;

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
            {plan.lanes.map((lane) => (
              <g key={lane.id}>
                <rect {...lane.rect} fill={tokens.color.laneTape} fillOpacity={tokens.floor.laneFillOpacity} />
                {lane.edges.map((edge, i) => (
                  <line
                    key={i}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke={tokens.color.laneTape}
                    strokeWidth={tokens.floor.tapeMm}
                  />
                ))}
                <text
                  {...label}
                  fill={tokens.color.laneTape}
                  x={lane.rect.x + lane.rect.width / 2}
                  y={lane.rect.y + lane.rect.height / 2}
                  transform={
                    lane.direction === "crosswise"
                      ? `rotate(-90 ${lane.rect.x + lane.rect.width / 2} ${lane.rect.y + lane.rect.height / 2})`
                      : undefined
                  }
                >
                  Lane · {lane.widthLabel}
                </text>
              </g>
            ))}
            <rect
              {...plan.outline}
              fill="none"
              stroke={tokens.color.truckWall}
              strokeWidth={tokens.floor.wallStrokePx}
              vectorEffect="non-scaling-stroke"
            />
            <text {...heading} x={-gap} y={W / 2} transform={`rotate(-90 ${-gap} ${W / 2})`}>
              NOSE
            </text>
            <text {...heading} x={L + gap} y={W / 2} transform={`rotate(90 ${L + gap} ${W / 2})`}>
              DOORS
            </text>
            <text {...label} x={L + gap + 1.6 * font} y={W / 2} transform={`rotate(90 ${L + gap + 1.6 * font} ${W / 2})`}>
              {plan.widthLabel} wide
            </text>
            <text {...label} x={L / 2} y={W + gap} dominantBaseline="hanging">
              Left wall · {plan.lengthLabel} long
            </text>
            <text {...label} x={L / 2} y={-gap} dominantBaseline="auto">
              Right wall
            </text>
          </>
        )}
      </svg>
      <div style={{ position: "absolute", right: tokens.space.s, bottom: tokens.space.s, display: "flex", gap: tokens.space.xs }}>
        <ViewButton label="Zoom out" onClick={() => zoomCentre(1 / ZOOM_STEP)}>
          −
        </ViewButton>
        <ViewButton label="Zoom in" onClick={() => zoomCentre(ZOOM_STEP)}>
          +
        </ViewButton>
        <ViewButton label="Fit truck" onClick={() => size && fit(size)}>
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
        minWidth: "32px",
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
