#!/usr/bin/env bash
# One-time setup on GitHub: push main, labels, branch protection, Pages, Claude Code plugin.
# usage: bash scripts/bootstrap.sh            (run from the repo root, after the first commit)
set -euo pipefail
cd "$(dirname "$0")/.."
say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
warn() { printf '\033[33m! %s\033[0m\n' "$*"; }
for bin in git gh pnpm node; do command -v "$bin" >/dev/null || { echo "missing: $bin"; exit 1; }; done
gh auth status >/dev/null 2>&1 || { echo "run: gh auth login"; exit 1; }

say "1/5 push main"
git push -u origin main
REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"

say "2/5 labels"
label() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null && echo "  $1"; }
label needs-triage    ededed "Maintainer needs to evaluate this issue"
label needs-info      fbca04 "Waiting on reporter for more information"
label ready-for-agent 0e8a16 "Fully specified, ready for an AFK agent"
label ready-for-human 1d76db "Requires human implementation"
label wontfix         ffffff "Will not be actioned"
label needs-human     b60205 "Escalated by an agent: blocks merge until a human removes it"

say "3/5 GitHub Pages (source: GitHub Actions)"
gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || warn "enable Pages manually: Settings > Pages > Source: GitHub Actions"
echo "  https://$(echo "$REPO" | cut -d/ -f1).github.io/$(echo "$REPO" | cut -d/ -f2)/"

say "4/5 branch protection"
gh api -X PUT "repos/$REPO/branches/main/protection" --input - >/dev/null <<'JSON' && echo "  main: PR + green check/guardrails required" || warn "branch protection failed (private repo on a free plan?)"
{ "required_status_checks": { "strict": false, "contexts": ["check", "guardrails"] },
  "enforce_admins": true, "required_pull_request_reviews": null, "restrictions": null }
JSON

say "5/5 Claude Code plugin"
if command -v claude >/dev/null; then
  claude plugin marketplace add mattpocock/skills >/dev/null 2>&1 || true
  claude plugin install mattpocock-skills@mattpocock --scope user >/dev/null 2>&1 \
    || warn "plugin install failed: inside Claude run /plugin and install mattpocock-skills"
else
  warn "claude CLI not found"
fi

say "done: https://github.com/$REPO"
