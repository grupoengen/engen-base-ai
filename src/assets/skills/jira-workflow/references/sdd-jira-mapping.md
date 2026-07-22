# SDD → Jira Status Mapping

| SDD Phase | Jira Status | Transition trigger |
|-----------|-------------|-------------------|
| `sdd-explore` started | In Progress | User starts exploration |
| `sdd-propose` created | In Review | Proposal doc created, awaiting approval |
| Proposal approved | To Do (Design) | Team approves proposal.md |
| `sdd-design` started | In Progress | Design phase begins |
| `sdd-tasks` created | In Progress | Tasks list ready |
| `sdd-apply` in progress | In Progress | Implementation started |
| PR opened | In Review | PR linked to ticket |
| `sdd-verify` passed | Done | Verification signed off |
| `sdd-archive` done | Closed | Change archived |

## Jira Hierarchy

```
Epic: [Feature/Migration Name]
├── Story: Explore — [scope description]
├── Story: Design — [scope description]
├── Story: Implementation — [module or area]
│   ├── Subtask: [specific task from /sdd-tasks]
│   └── Subtask: [specific task from /sdd-tasks]
└── Story: Verify & Archive
```

## Labels Convention

- `sdd` — all tickets created via baseline
- `blocker` — tickets that block another ticket
- `tech-debt` — migration or cleanup tickets
- `multi-tenancy` — tickets involving tenant isolation work
