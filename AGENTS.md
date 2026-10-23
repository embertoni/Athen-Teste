# AGENTS.md

This is the single source of truth for any AI agent working in this repository,
regardless of the tool (Claude Code, Kiro, Cursor, or anything else). Tool-specific
entry files such as `CLAUDE.md` and `KIRO.md` exist only to redirect here — read
this file in full.

## Skills

Reusable agent skills live in `.agents/skills/`. This directory is the **canonical
and only** location for skills. Any `.claude/skills/` or `.kiro/skills/` directories
are not used; ignore them if present.

Each skill is a folder under `.agents/skills/<skill-name>/` containing:

- `SKILL.md` — the skill's entry point. It starts with YAML frontmatter holding a
  `name` and a `description`. The `description` states what the skill does and when
  to use it.
- Optional supporting files (`*.md`, an `agents/` folder, scripts, templates) that
  `SKILL.md` links to for deeper detail.

### How to use skills

1. **Discover.** At the start of a task, scan `.agents/skills/*/SKILL.md` and read
   each frontmatter `description` to see which skills are available and when they apply.
2. **Match.** If the user's request matches a skill's `description`, that skill is in
   scope. When several could apply and you are unsure which fits, the `ask-matt` skill
   is a router over the others.
3. **Activate.** Read the matching `SKILL.md` in full **before** acting on the task,
   then follow any supporting files it links to. Treat the skill's instructions as
   binding for that task.
4. **Don't guess.** Never describe or claim to follow a skill without actually reading
   its `SKILL.md` first.

### Available skills

The installed skills are discovered by reading `.agents/skills/*/SKILL.md`. The set
can change as skills are added or removed, so always read the directory rather than
relying on a hard-coded list here. As a convenience, the currently installed skills
are:

`ask-matt`, `chief-of-staff`, `claude-handoff`, `code-review`, `codebase-design`,
`diagnosing-bugs`, `domain-modeling`, `git-guardrails-claude-code`, `grill-me`,
`grill-with-docs`, `grilling`, `handoff`, `implement`, `implement-spec`,
`improve-codebase-architecture`, `loop-me`, `migrate-to-shoehorn`, `pr`, `prototype`,
`research`, `retro`, `scaffold-exercises`, `setup-matt-pocock-skills`,
`setup-pre-commit`, `setup-ts-deep-modules`, `tdd`, `teach`, `to-questionnaire`,
`to-spec`, `to-tickets`, `triage`, `wait-what`, `wayfinder`, `wizard`,
`writing-beats`, `writing-for-agents`, `writing-fragments`, `writing-shape`.

## Project working rules

The project's own engineering and AI-collaboration rules are documented in
`docs/fluxo-de-trabalho-ia.md`. Follow them. They take precedence over anything in a
skill when the two conflict.

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown under `.scratch/<feature-slug>/`
(real work is tracked externally in YouTrack). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
