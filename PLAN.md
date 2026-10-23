# Crate Job: plan

What we are building, in what order, and what is deliberately out of scope. Vocabulary is in GLOSSARY.md; decisions in docs/adr/. PROJECT_BRIEF.md is the original brief; where they disagree, this plan wins (it records the grilling of 2026-10-15 to 10-23).

## Problem

An account manager shipping art needs to tell the account manager at the receiving end what is arriving and how it sits in the truck: which crates, where, what is stacked, what comes off first. Today that is a spreadsheet and a hand sketch. Crate Job lets the sender lay the crates out in a model of the truck in minutes and send a clear, printable summary.

## Users

| | Planner (sender's account manager) | Reader (receiver's account manager) |
|---|---|---|
| Uses | The editor, on a laptop or tablet | The exported summary (PDF by email, or HTML) |
| Needs | Fast crate entry, effortless placement, obvious mistakes caught | What is coming, where it is in the truck, what comes off first, in their units |

## Priorities (break ties in this order)

1. **Creating and moving crates is effortless.** A crate is placed with a drag and turned with a key.
2. **The export tells the reader clearly what is coming and how it sits.**
3. **Rules catch obvious mistakes.** Sanity checks that warn, never block.

Fidelity is "clear and correct", not "precise enough to strap by". Cut from the bottom of this list, never the top.

## Decisions (from grilling)

- **Stack:** TypeScript, React, Vite. Floor view in SVG (the placing surface). 3D view later with three.js via `@react-three/fiber`. Vitest; Playwright for drag behaviour.
- **Pure core, thin UI** (ADR 0001): all domain logic in `src/core/`, framework-free. React renders and dispatches commands. Undo/redo is a stack of immutable project states.
- **Units** (ADR 0002): stored as whole millimetres and grams, always. Display imperial by default (in, ft, lb) with a metric toggle. The export shows both.
- **Placement:** positions are whole mm; rotation is a quarter turn (0/90/180/270). Snapping to walls, neighbours, lane edges and a grid (½ in imperial, 25 mm metric; grid positions computed from the origin, no drift). A modifier key turns snapping off. Height is never set by the mouse: a crate rests on the floor or on the crate below.
- **Lay flat:** each crate type is `upright-only` (default) or `may-lay-flat`. Flat means lying on its largest face, face up, still turning in quarter turns. One key toggles posture.
- **Contents:** one free-text `contents` field per crate (several works are fine as text).
- **Corridor lanes:** a truck layout holds a list of straight lanes, each lengthwise (full length, side offset + width) or crosswise (full width, distance from nose + width). Drawn as floor tape. No reachability analysis in v1.
- **Layout templates:** interior dimensions + max payload + lanes, saved under a name. Built-in and custom; kept in the browser and exportable as a file.
- **Rules** (one module, tested): collision, outside the truck, not stackable, max load on top, payload, crate in a lane. They warn and explain in one line; they never block.
- **Unload order:** one order, defaulting to doors-to-nose then top-before-bottom, reordered by drag in a list.
- **Selection:** single selection; group moves come after v1.
- **Export** (ADR 0003): a shipment summary. Cover (job, origin → destination, date, layout, crate count, total weight, sender notes), floor map (crates numbered, lanes, nose and doors labelled), an isometric picture once 3D exists, and the crate list in unload order with contents, dimensions and weight in both unit systems, stackable/flat and handling notes. **PDF is primary** (the browser's print dialog on the export); a self-contained HTML file is secondary.
- **Saving:** one save interface with two implementations, file download/open and browser autosave. Files carry `schemaVersion`; old files always open. Cloud saves later, through the same interface.
- **Hosting:** GitHub Pages from `main`, public repo, no server code. Works offline after first load (polish milestone).
- **Quality gate:** typecheck, unit tests on the core, build, and a Playwright smoke test for dragging. No eval/golden-set harness: this is deterministic software, tested like it.

## Milestones

1. **See the truck:** app shell, design tokens file, floor view of a truck with lanes drawn from settings, deployed to Pages.
2. **Make and move crates:** crate list, quick-add line, spreadsheet paste with preview, crate form, duplicate; drag from list into the floor view, snapping, quarter turns, lay flat, stacking by drop, nudge keys, undo/redo, selection synced between list and view.
3. **Rules:** the six rules in `src/core/rules`, warnings on crates and in a list, one-line reason on the selected crate, click a warning to select.
4. **Export:** cover, floor map, crate list in unload order, unload-order editor, PDF via print, HTML download.
5. **3D:** 3D view of the same project (stacks and heights), camera presets, and the isometric picture in the export.
6. **Save and templates:** save/open file, autosave with restore, layout templates, crate-type library, schema versioning.
7. **Stats and polish:** weight vs payload, front/back and left/right balance gauge, floor and volume used, offline install, empty states, keyboard help.

Milestones 2 and 4 carry the weight. If either slips, take time from 6 and 7.

## Out of scope (v1)

Crew step-by-step loading instructions, tick boxes, sign-off; overhang, tall-crate strapping and almost-touching rules; contact highlights, gap readouts and other lock-in verification UI; reachability through lanes; multiple trucks per job; multiple stops; automatic packing; physics; axle weights; photos; accounts, sign-in, sharing links; mobile editing; importing Excel files (pasting rows is enough); translations.
