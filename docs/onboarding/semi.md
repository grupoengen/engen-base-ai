# Onboarding — Semi-senior

1 week. You already know how to code — this is about adopting the AI workflow.

---

## Day 1-2 — Setup

### Licenses
- [ ] Claude.ai Max plan ($100/month) — the Pro plan throttles too much for daily use
- [ ] Gentle-AI — https://github.com/Gentleman-Programming/gentle-ai
- [ ] Engram Cloud — follow Gentle-AI docs
- [ ] Team GitHub org access (ask your lead)

### Install everything
```bash
# Install Gentle-AI first (follow their README)

# Then the team toolkit
npm login --registry=https://npm.pkg.github.com --scope=@baseline-ia
npm install -g @baseline-ia/baseline-cli
baseline install
baseline doctor
```

### Verify your setup
```bash
baseline status
```
You should see Claude Code detected and 25 skills listed.

---

## Day 3 — SDD Walkthrough

Open any project you'll be working on. Start a Claude Code session.

### The workflow you'll use for everything
```
/sdd-new <describe what you need to build or change>
```

SDD runs through 8 phases: explore → propose → spec → design → tasks → apply → verify → archive.

You review and approve each phase. The AI does the heavy lifting, you make the decisions.

**Important:** don't skip phases to go faster. The spec and design phases are where you catch problems before they become code.

### Try it now
Pick a small real task from the backlog. Run `/sdd-new` on it. Go through at least the first 3 phases (explore, propose, spec). You don't need to ship it today — just understand the flow.

---

## Day 4 — Complete a Real Task

Take yesterday's SDD and finish it:
- Complete all phases through apply
- Run `/judgment-day` before opening PR
- Open PR with `/branch-pr`

### Git standards (non-negotiable)
```
feat: add X
fix: resolve Y
refactor: extract Z
chore: update deps
```

No free-form messages. If you're not sure which prefix, use `chore:`.

### Skills you'll use most
| Skill | When |
|---|---|
| `/sdd-new` | Every task |
| `/judgment-day` | Before every PR |
| `/branch-pr` | Opening PRs |
| `/chained-pr` | When your diff is 400+ lines |
| `/interface-design` | UI components |
| `/frontend-design` | Frontend architecture |
| `/cognitive-doc-design` | Writing docs or RFCs |

---

## Day 5 — PR Review & Standards

### The 4R review (what `/judgment-day` checks)
- **Risk** — security vulnerabilities, data exposure
- **Readability** — naming, complexity, intention
- **Reliability** — tests, edge cases, contracts
- **Resilience** — fallbacks, error handling, observability

Read what it catches on your PR. Understand why each issue matters.

### Engram
You don't manage it manually. When you make architectural decisions or fix non-obvious bugs, Claude Code saves them automatically. In future sessions, the AI picks up from where you left off.

If you want to manually check what was saved: ask Claude `"what do you remember about this project?"` and it will search Engram.

---

## You're done

From day 6 you work independently. When in doubt:
- `baseline doctor` — checks your setup
- `/sdd-status` — shows where a task stands
- Ask your lead — no question is too small in the first month
