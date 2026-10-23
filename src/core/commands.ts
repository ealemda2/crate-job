/**
 * Every edit to a project is a named command (ADR 0001). `apply` returns a new project and never
 * mutates the old one, so undo/redo can be a stack of states.
 */
import type { DisplayUnits, Project } from "./project";

export type Command = { type: "setUnits"; units: DisplayUnits };

export function apply(project: Project, command: Command): Project {
  switch (command.type) {
    case "setUnits":
      return { ...project, units: command.units };
  }
}
