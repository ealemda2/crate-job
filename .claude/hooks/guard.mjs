#!/usr/bin/env node
// PreToolUse guard. Deterministic: CLAUDE.md asks, this enforces.
// Blocks agent writes to CI and the agent's own guardrails, and the shell commands that are human decisions
// (merging, force-pushing, pushing to main). Exit 2 = block; stderr is shown to Claude.
// Maintenance sessions: start Claude with HARNESS_UNLOCK=1.
import { relative, resolve } from "node:path";

if (process.env.HARNESS_UNLOCK === "1") process.exit(0);

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw || "{}");
const tool = input.tool_name ?? "";
const ti = input.tool_input ?? {};
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();

const PROTECTED = [
  [/^\.github\/workflows\//, "CI workflows are human-owned."],
  [/^\.claude\/(hooks\/|settings\.json$)/, "The agent may not edit its own guardrails."],
  [/(^|\/)\.env(\..*)?$/, "Secrets files are off limits."],
];

const block = (why) => {
  process.stderr.write(`BLOCKED by guard hook: ${why}\nIf this is genuinely needed, stop and use the escalate skill.\n`);
  process.exit(2);
};

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  const p = ti.file_path ?? ti.notebook_path;
  if (p) {
    const rel = relative(root, resolve(root, p)).split("\\").join("/");
    for (const [re, why] of PROTECTED) if (re.test(rel)) block(`${rel}: ${why}`);
  }
}

if (tool === "Bash") {
  const cmd = String(ti.command ?? "");
  const RULES = [
    [/gh\s+pr\s+merge/, "Merging is a human decision."],
    [/--remove-label[= ]+["']?needs-human/, "Only a human removes needs-human."],
    [/git\s+push\b.*(--force|-f\b)/, "No force pushes."],
    [/git\s+push\b[^|;&]*\s(\S+:)?main(?=\s|$|[|;&])/, "Never push to main; open a PR."],
    [/--no-verify/, "Do not skip verification."],
    [/(>|>>|\btee\b|\bsed\s+-i|\bmv\b|\bcp\b|\brm\b).*(\.claude\/hooks|\.claude\/settings\.json|\.github\/workflows)/, "Guardrails and CI are human-owned."],
  ];
  for (const [re, why] of RULES) if (re.test(cmd)) block(why);
}

process.exit(0);
