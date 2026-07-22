# Team Standards

## Workflow

Every change — feature, migration, bugfix, refactor — follows SDD (Spec-Driven Development):

```
explore → propose → spec → design → tasks → apply → verify → archive
```

Use the matching skill:
- New feature: `/sdd-new`
- Tech migration: `/sdd-new` with migration template
- Update existing: `/sdd-new` with update template
- Bug: `/sdd-new` with bugfix template

## OpenSpec Structure

This project uses OpenSpec for spec-driven development. Specs live in the repo so anyone — a new dev, an auditor, a future you — can pick up the project without tribal knowledge.

```
openspec/
├── specs/        # canonical capabilities (the source of truth)
└── changes/      # in-progress changes
    └── <change-id>/
        ├── proposal.md   # what and why (required FIRST)
        ├── specs/        # delta specs for this change
        ├── design.md     # technical decisions
        └── tasks.md      # implementation checklist
```

**Hard rule:** No code is written before `openspec/changes/<change-id>/proposal.md` exists. If the user asks you to build something, your first output is the proposal — not the code. The proposal is the contract. Spec → design → tasks → code, in that order.

Use `/sdd-new <description>` to start a change with AI assistance through the full lifecycle.

## Git Standards

- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- No AI attribution in commits
- PRs follow `/branch-pr` — issue first, then PR
- Large PRs (400+ lines) use `/chained-pr`

## Code Review

All PRs go through the 4R review via `/judgment-day`:
- Risk (security, data exposure)
- Readability (naming, complexity)
- Reliability (tests, edge cases)
- Resilience (fallbacks, observability)

## AI Usage

- Always lead — AI executes, you direct
- Use `/sdd-*` skills for structured work
- Use Engram to persist decisions across sessions
- Run `baseline doctor` if something feels off

## Documentation

When the user asks to "document" anything — a feature, a change, a release, the project itself — the changelog comes first. It is not optional.

1. Check if `CHANGELOG.md` exists in the project root.
2. If it does NOT exist → create it from the git history using conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
3. If it exists but does not follow the project's conventions → refactor it to match.
4. Group entries by version if versions exist, otherwise by date.
5. Every documented change is mirrored in `CHANGELOG.md`. Never write a doc without updating the changelog.

If the project already follows a different changelog format (Keep a Changelog, etc.), respect it instead — do not impose conventional commits on top.

## Available Skills

Design: `/interface-design`, `/frontend-design`, `/tailwind-design-system`
Review: `/judgment-day`, `/review-risk`, `/review-readability`
Git: `/branch-pr`, `/chained-pr`, `/work-unit-commits`
Docs: `/cognitive-doc-design`, `/changelog-generator`
SDD: `/sdd-new`, `/sdd-explore`, `/sdd-status`, `/sdd-apply`, `/sdd-verify`, `/sdd-archive`
