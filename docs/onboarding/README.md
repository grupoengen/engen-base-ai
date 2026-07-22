# Team Onboarding

Welcome. This is how we work. Read this before writing a single line of code.

## What we use and why

| Tool | Role | Required |
|---|---|---|
| **Claude Code** | Primary AI coding assistant | Yes |
| **Gentle-AI** | Orchestration layer on top of Claude Code | Yes |
| **Engram Cloud** | AI memory that persists across sessions | Yes |
| **baseline** | Installs all team standards and skills | Yes |
| **OpenCode** | Alternative AI coding assistant | Optional |
| **Cursor** | IDE with AI integration | Optional |

## Licenses you need

1. **Claude.ai account** — Pro ($20/month) or Max ($100/month, recommended for heavy use)
2. **Gentle-AI** — https://github.com/Gentleman-Programming/gentle-ai
3. **Engram Cloud** — check current pricing at the Gentle-AI repo
4. **GitHub account** — needed for team packages

Ask your lead for the team's GitHub org access.

## Choose your path

- [Junior](./junior.md) — new to the team's workflow, learning AI-assisted development
- [Semi-senior](./semi.md) — experienced dev adopting our AI workflow
- [Senior / Lead](./senior.md) — autonomous, onboards in 2 days

## The non-negotiables

Before you start any task, understand these three things:

**1. Every change follows SDD**
No task starts with code. It starts with `/sdd-new`. Always.

**2. AI is a tool, not the decision maker**
You direct. Claude executes. If you don't understand what it produced, stop and learn before shipping.

**3. Commits are conventional**
`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`. No exceptions. No AI attribution.
