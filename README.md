# Crate Job

Shipping art means telling the receiving institution what is coming: which crates, where they sit in the truck, what is stacked and what comes off first. Crate Job lets the sending account manager lay crates out in a model of the truck in minutes, catches obvious mistakes (collisions, crates in a lane, stacking on a crate that can't carry weight, overweight), and exports a one-click summary the receiving account manager can read as a PDF.

It runs entirely in the browser: no account, no server. Plans are saved as files and autosaved in the browser.

## Status

Scaffold. Milestones and scope are in [PLAN.md](PLAN.md); work is tracked in [GitHub Issues](https://github.com/ealemda2/crate-job/issues).

## Getting started

Requires Node 22+ and pnpm 10.

```zsh
pnpm install
pnpm dev
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm preview` | Production build / serve it locally |
| `pnpm test` | Unit tests (the domain core) |
| `pnpm typecheck` | Types |

## Source layout

```text
src/
├── core/        data model, units, snapping, rules, unload order, export content (pure TypeScript)
├── ui/          React components: crate list, floor view, inspector, warnings
├── design/      tokens.ts: every color, font and spacing value
└── main.tsx
docs/adr/        architecture decisions
```

## Deployment

Every push to `main` runs typecheck, tests and the build, then deploys to GitHub Pages: https://ealemda2.github.io/crate-job/. Changes land through PRs with green checks.

## Contributing

Branch `feat/<issue>-<slug>`, conventional commits, PR into `main` following `.github/pull_request_template.md`. Domain logic goes in `src/core/` with tests; components stay thin. Vocabulary is in [GLOSSARY.md](GLOSSARY.md). AI coding agents working here read [CLAUDE.md](CLAUDE.md); hooks in `.claude/` keep them out of CI and their own settings. `bash scripts/wt.sh <issue>` creates a git worktree per issue.

Engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
