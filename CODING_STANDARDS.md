# Coding standards

Read during review (`/code-review` Standards axis), not implementation. Anything mechanical belongs in a hook or test instead.

- **Domain logic lives in `src/core/`.** Snapping, rules, units, unload order and export content are pure functions with no React, DOM or three.js imports.
- **Every edit is a command.** UI changes the project only through `dispatch(command)`; that is what makes undo complete.
- **Integers at rest.** Millimetres, grams, quarter turns. Conversions happen at display and input boundaries only.
- **Rules are data in, warnings out.** A rule takes the project and returns warnings; it never changes the project.
- **One design file.** Colors, fonts and spacing come from `src/design/tokens.ts`; no literal colors in components or the scene.
- **Name things with GLOSSARY.md terms.** `crate`, `crate type`, `placement`, `lane`, `warning`, not `item`, `box`, `aisle`, `error`.
- **Old files always open.** Any change to the saved shape bumps `schemaVersion` and adds a migration with a test.
