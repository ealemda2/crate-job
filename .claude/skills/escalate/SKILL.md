---
name: escalate
description: Stop and hand a decision to the human. Use when a guard hook blocks a write you think is needed, /code-review returns the same correctness finding twice, you have been corrected twice on the same thing, or a requirement is ambiguous in a way that would change the data model or what the export tells the reader.
---

# Escalate

Escalation lands on the human, never on another agent. Its job is to make the human's decision fast.

1. Stop editing files.
2. Write `escalation.md` in the scratchpad (not the repo) with exactly these sections, each short:
   - **Trigger**: which rule fired (hook message, repeated finding, the ambiguity).
   - **Evidence**: the failing output or the conflicting requirements, quoted with `file:line` or issue links.
   - **Options**: two or three ways forward, one line each, with what each costs.
   - **Recommendation**: the option you would pick and why, in one sentence.
   - **Decision needed**: one yes/no question for the human.
3. Get it onto the PR:
   - `gh pr view --json number` to find the PR for this branch. If none, push the branch (`git push -u origin HEAD`) and open a draft: `gh pr create --draft --fill`.
   - `gh pr edit --add-label needs-human`
   - `gh pr comment --body-file <path to escalation.md>`
4. Tell the user in three lines: the trigger, the decision needed, and the PR link. Then stop and wait.

Never remove the `needs-human` label or merge. CI keeps a `needs-human` PR red until the human removes the label.
