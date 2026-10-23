import { useReducer } from "react";
import { apply } from "../core/commands";
import { emptyProject, type DisplayUnits } from "../core/project";
import { tokens } from "../design/tokens";
import { FloorView } from "./FloorView";

const UNIT_OPTIONS: { units: DisplayUnits; label: string }[] = [
  { units: "imperial", label: "ft · in · lb" },
  { units: "metric", label: "mm · kg" },
];

/**
 * App shell (brief §G): crate list and quick-add on the left, truck view in the middle,
 * selected crate and stats on the right, file actions along the top. Panels are placeholders until their tickets land.
 */
export function App() {
  const [project, dispatch] = useReducer(apply, "scaffold", emptyProject);

  const panel = {
    background: tokens.color.panel,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius,
    padding: tokens.space.l,
    color: tokens.color.textMuted,
  } as const;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gridTemplateColumns: "280px 1fr 300px",
        gap: tokens.space.m,
        height: "100vh",
        padding: tokens.space.m,
        boxSizing: "border-box",
        background: tokens.color.background,
        fontFamily: tokens.font.body,
        fontSize: tokens.font.size.body,
        color: tokens.color.text,
      }}
    >
      <header style={{ gridColumn: "1 / -1", display: "flex", alignItems: "baseline", gap: tokens.space.l }}>
        <strong style={{ fontSize: tokens.font.size.heading }}>Crate Job</strong>
        <span style={{ color: tokens.color.textMuted }}>
          {project.name} · {project.layout.name}
        </span>
        <div role="radiogroup" aria-label="Display units" style={{ marginLeft: "auto", display: "flex", gap: tokens.space.xs }}>
          {UNIT_OPTIONS.map(({ units, label }) => {
            const selected = project.units === units;
            return (
              <button
                key={units}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => dispatch({ type: "setUnits", units })}
                style={{
                  padding: `${tokens.space.xs} ${tokens.space.m}`,
                  border: `1px solid ${selected ? tokens.color.accent : tokens.color.border}`,
                  borderRadius: tokens.radius,
                  background: selected ? tokens.color.accent : tokens.color.panel,
                  color: selected ? tokens.color.panel : tokens.color.text,
                  fontFamily: tokens.font.body,
                  fontSize: tokens.font.size.small,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>
      <aside style={panel}>Crates</aside>
      <main style={{ ...panel, padding: 0, overflow: "hidden", minHeight: 0 }}>
        <FloorView layout={project.layout} units={project.units} />
      </main>
      <aside style={panel}>Inspector</aside>
    </div>
  );
}
