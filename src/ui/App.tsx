import { emptyProject } from "../core/project";
import { tokens } from "../design/tokens";

const project = emptyProject("scaffold");

/**
 * App shell (brief §G): crate list and quick-add on the left, truck view in the middle,
 * selected crate and stats on the right, file actions along the top. Panels are placeholders until their tickets land.
 */
export function App() {
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
      </header>
      <aside style={panel}>Crates</aside>
      <main style={panel}>Floor view</main>
      <aside style={panel}>Inspector</aside>
    </div>
  );
}
