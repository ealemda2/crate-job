# Crate Job: agent guide

A browser app for laying art crates out in a truck model and exporting a clear summary for the receiving account manager.
Static site, no server, works from files and browser storage. Vocabulary: @GLOSSARY.md

## Commands
- Install `pnpm i` · Dev server `pnpm dev` · Build `pnpm build`
- Typecheck `pnpm typecheck` · Tests `pnpm test` (one file: `pnpm exec vitest run <path>`)
- Browser tests `pnpm e2e` (Playwright, once added)

## Where things are
- `src/core/`: all domain logic, framework-free (ADR 0001). `project.ts` is the data model every other module builds on.
- `src/ui/`: React components. They render core state and dispatch commands; no rules, geometry or unit math here.
- `src/design/tokens.ts`: every color, font and spacing value, shared by panels, the floor view, 3D and the export.
- `PLAN.md`: what we are building, milestone order, and what is out of scope.

## Workflow
- Tickets are GitHub issues. Branch `feat/<issue>-<slug>`, conventional commits, never commit to main.
- Build test-first at agreed seams (`/tdd`): core functions are the main seam; the UI gets a Playwright test only for dragging and snapping.
- Before a PR: `pnpm typecheck && pnpm test && pnpm build`. PR body follows the `pr` skill.
- PR bodies open with `## Why`: 2–3 plain-language sentences on the user problem and outcome, no identifiers.

## Gotchas
- Store integer millimetres and grams only; convert at the edges (ADR 0002). Never store inches or floats.
- Rotation is a quarter turn; posture is `upright` or `flat`. There is no other orientation.
- Rules warn, never block, and always explain in one line.
- Warning yellow and error red tokens are reserved for rules; never use them for decoration.

## Escalate, don't guess
- IMPORTANT: if a hook blocks you, or a requirement is ambiguous in a way that changes the data model, stop and use the `escalate` skill.

## Compaction
- Keep: ticket number, modified files, failing test names.

## Agent skills

### Issue tracker

GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage roles, label strings unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
