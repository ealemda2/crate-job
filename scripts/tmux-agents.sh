#!/usr/bin/env bash
# Three agents side by side, one worktree each. No status pane: watch PRs and CI on GitHub.
#   bash scripts/tmux-agents.sh <issueA> <issueB> [issueC]
set -euo pipefail
[ $# -ge 2 ] || { echo "usage: tmux-agents.sh <issueA> <issueB> [issueC]"; exit 1; }
ROOT="$(git worktree list --porcelain | head -1 | cut -d' ' -f2-)"   # main checkout, even from a worktree
BASE="$(dirname "$ROOT")/$(basename "$ROOT")-wt"
dir() { ls -d "$BASE/$1"-* 2>/dev/null | head -1; }
for i in "$@"; do [ -n "$(dir "$i")" ] || bash "$ROOT/scripts/wt.sh" "$i"; done

SESSION=agents
tmux kill-session -t "$SESSION" 2>/dev/null || true
first=1
for i in "$@"; do
  d="$(dir "$i")"
  if [ "$first" = 1 ]; then
    tmux new-session -d -s "$SESSION" -n agents -c "$d"; first=0
  else
    tmux split-window -h -t "$SESSION:0" -c "$d"
  fi
  tmux select-pane -t "$SESSION:0" -T "#$i  $(basename "$d")"
  tmux send-keys -t "$SESSION:0" "claude" C-m
done
tmux set -t "$SESSION" -g mouse on
tmux set -t "$SESSION" pane-border-status top
tmux set -t "$SESSION" pane-border-format " #{pane_title} "
tmux select-layout -t "$SESSION:0" even-horizontal
tmux select-pane -t "$SESSION:0.0"
exec tmux attach -t "$SESSION"
