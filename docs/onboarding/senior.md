# Onboarding — Senior / Lead

2 days. Read the standards, set up the tools, ship something.

---

## Day 1 — Setup & Standards

### Licenses
- [ ] Claude.ai Max plan
- [ ] Gentle-AI — https://github.com/Gentleman-Programming/gentle-ai
- [ ] Engram Cloud
- [ ] Team GitHub org access

```bash
# Install Gentle-AI (follow their README)

# Team toolkit
npm login --registry=https://npm.pkg.github.com --scope=@baseline-ia
npm install -g @baseline-ia/baseline-cli
baseline install
baseline doctor
```

### Read these — they define how the team works
- `docs/onboarding/README.md` — the non-negotiables
- `src/assets/CLAUDE-append.md` — what every AI session knows about the team

### The SDD workflow
Every task — yours and the team's — flows through SDD:
```
/sdd-new → explore → propose → spec → design → tasks → apply → verify → archive
```

As a lead you'll also review SDD artifacts from other devs. The spec and design phases are the critical ones — catch problems there, not in code review.

---

## Day 2 — First Task & Lead Responsibilities

### Ship something with SDD
Pick a real task. Run it end-to-end with `/sdd-new`. This is how you'll understand what the team experiences day to day.

### As a lead, your additional responsibilities

**SDD artifact reviews**
Juniors and semis need you to review their propose and spec phases before they proceed. A 10-minute review there saves hours of rework later.

**Onboarding new devs**
- Pair on their Week 3 SDD task (juniors)
- Review their first PR (semis)
- Point them to the right doc, don't explain what docs already cover

**Updating team standards**
When the team discovers a new pattern or convention:
1. Update `src/assets/CLAUDE-append.md` in baseline
2. Update the relevant skill in `src/assets/skills/` if applicable
3. Create a release — `baseline update` propagates to everyone

**Skills you'll use beyond the basics**
| Skill | When |
|---|---|
| `/skill-creator` | Creating new team skills |
| `/skill-improver` | Refining existing skills |
| `/cognitive-doc-design` | Writing ADRs, RFCs, onboarding docs |
| `/changelog-generator` | Release notes |
| `/judgment-day` | Pre-PR adversarial review |
| `/chained-pr` | Coordinating large changes |

### Keeping Engram useful for the team
When you make architectural decisions or establish patterns, make sure Engram captures them. In Claude Code sessions you can explicitly say: _"save this decision to memory"_ and it will persist for every future session on this project.

---

## That's it

You know how to code. You know how to lead. Now you do both with AI as a multiplier — not a crutch. The team looks to you to use it right.
