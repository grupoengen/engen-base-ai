# Git Workflow

`baseline install` installs a global `pre-push` git hook. It is advisory-only and never blocks a push.

---

## Branch naming

Use meaningful, traceable branch names. When working with SDD, reference the change ID:

```bash
feat/sdd-<change-id>-short-description
fix/sdd-<change-id>-bug-description
```

For general work without an SDD change:

```bash
feat/short-description
fix/short-description
refactor/short-description
```

---

## Working with SDD

Start any change with:

```
/sdd-new <description of what you're building>
```

Then follow the cycle:

```
/sdd-spec    → requirements
/sdd-design  → technical design
/sdd-tasks   → task checklist
/sdd-apply   → implementation
/sdd-verify  → validation
/sdd-archive → close the change
```

---

## Commits — required convention

```
type(scope): short description
```

| Type | When |
|------|------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Restructure without behavior change |
| `test` | Add or fix tests |
| `chore` | Deps, config, tooling |
| `docs` | Documentation only |
| `perf` | Performance improvement |

---

## Skills reference

| Skill | When to use |
|-------|-------------|
| `/sdd-new` | Start any new change |
| `/work-unit-commits` | Plan commits before pushing a large change |
| `/chained-pr` | Split a large PR into a reviewable sequence |
| `/judgment-day` | Adversarial review for auth, payments, or large PRs |
| `/sdd-archive` | Close the SDD change after merge |
