# Onboarding — Junior

4 weeks. Take the time. Don't rush the foundations.

---

## Week 1 — Setup & Orientation

### Step 1: Get your licenses
- [ ] Create a Claude.ai account (Max plan recommended)
- [ ] Get access to the team GitHub org (ask your lead)
- [ ] Install Gentle-AI following the instructions at https://github.com/Gentleman-Programming/gentle-ai
- [ ] Create your Engram Cloud account (follow Gentle-AI docs)

### Step 2: Install the team toolkit
```bash
# Authenticate with GitHub Packages (one time)
npm login --registry=https://npm.pkg.github.com --scope=@baseline-ia

# Install the CLI
npm install -g @baseline-ia/baseline-cli

# Apply team standards to your machine
baseline install

# Verify everything is OK
baseline doctor
```

### Step 3: Install Claude Code
Follow the official Claude Code installation guide.
After installing, open any project folder and run `claude` to start a session.

### Step 4: Understand the workspace
```
~/.claude/CLAUDE.md       ← global instructions every session reads
~/.claude/skills/         ← slash commands available in all projects
~/.claude/settings.json   ← permissions and behavior config
```

Run `baseline status` to see what's installed.

### Week 1 goal
You can open a Claude Code session, type `/sdd-new` and see a skill activate. That's it.

---

## Week 2 — Git Standards

### Conventional commits
Every commit follows this format:
```
feat: add user authentication
fix: resolve token expiry edge case
refactor: extract auth logic into hook
chore: update dependencies
docs: add API usage examples
```

No messages like `"changes"`, `"fix stuff"`, or `"wip"`. Ever.

### Branch naming
```
feat/user-authentication
fix/token-expiry
refactor/auth-hook
```

### The PR workflow
1. Create an issue first (`/issue-creation`)
2. Branch off `main`
3. Work in small, focused commits
4. Open PR with `/branch-pr`
5. Request review

### Week 2 goal
Open your first PR following the full workflow. It doesn't have to be big — a docs fix, a small cleanup. The workflow matters, not the size.

---

## Week 3 — AI Basics

### How to use Claude Code properly
Claude Code is not a search engine. It's a pair programmer. Treat it like one.

**Do:**
```
/sdd-new I need to add a password reset flow to the auth module
```

**Don't:**
```
write me a password reset component in React
```

The difference: the first uses SDD to think before coding. The second produces code you don't understand.

### The skill system
Skills are slash commands that load specialized instructions. Your most important ones:

| Skill | When to use |
|---|---|
| `/sdd-new` | Starting any task |
| `/sdd-status` | Checking where you are in a task |
| `/sdd-apply` | When you're ready to write code |
| `/judgment-day` | Before opening a PR |
| `/branch-pr` | Opening a PR |
| `/interface-design` | Building UI components |

### Engram — AI memory
Engram saves decisions and context so the AI remembers what you did last session. You don't need to manage it manually — Claude Code saves to it automatically when something important happens.

### Week 3 goal
Complete one real task using `/sdd-new` from start to PR. Ask your lead to pair with you on the SDD phases.

---

## Week 4 — First SDD Task

This week you own a real task end to end.

### The full SDD flow
```
/sdd-new describe your task here
  ↓ explore — AI reads the codebase
  ↓ propose — AI proposes the approach
  ↓ spec    — requirements and scenarios
  ↓ design  — architecture decisions
  ↓ tasks   — implementation checklist
  ↓ apply   — writes the code
  ↓ verify  — validates against spec
  ↓ archive — closes the change
```

Review each phase output before continuing. If something looks wrong, say so. You're in charge.

### Before opening your PR
Always run:
```
/judgment-day
```
This triggers an adversarial dual review. Fix what it catches before asking for human review.

### Week 4 goal
Ship one complete task: SDD → code → judgment-day → PR → merged.

---

## After week 4

You're no longer in onboarding. You work like every other dev on the team:
- Every task starts with `/sdd-new`
- Every PR goes through `/judgment-day`
- Every commit is conventional
- When you discover something non-obvious, Engram saves it

When in doubt: `baseline doctor` to check your setup, ask your lead for anything else.
