---
name: jira-workflow
description: "Trigger: jira, ticket, tarea jira, story, epic, sprint. Crea y actualiza tickets de Jira vinculados al flujo SDD del equipo — propuestas, fases, PRs y criterios de done."
license: Apache-2.0
metadata:
  author: "baseline-ia"
  version: "1.0"
---

## Activation Contract

Activate when the user mentions Jira, tickets, stories, epics, sprints, or asks to create/update/link work items to Jira. Requires the Atlassian MCP configured (`baseline mcp jira`).

> **Automatic commit comments**: The `post-commit` hook (installed by `baseline install`) already posts a commit comment to the linked Jira ticket on every `git commit` — no manual action needed. Use this skill for ticket creation, status transitions, and richer updates beyond the automatic comment.

## Hard Rules

- Never create a ticket without first checking if one already exists for the same change or feature.
- Every ticket must include: acceptance criteria, SDD change ID (if applicable), and assigned component.
- Epic → Story → Subtask hierarchy must match the team's Jira project structure.
- Story points are optional — do not add them unless the user asks.
- Ticket titles must be in the project's working language (same as the conversation).
- Never expose credentials, tokens, or API keys in output.

## Decision Gates

| Situation | Action |
|-----------|--------|
| User says "crea tickets para [feature]" | Create Epic + Stories per SDD phase |
| User says "actualiza el ticket" or "mueve a In Progress" | Update status of existing ticket |
| User says "vincula este PR al ticket" | Add PR link to the Jira issue |
| User has no SDD proposal yet | Remind: create the proposal first, then tickets |
| Atlassian MCP not configured | Tell user to run `baseline mcp jira` |

## Execution Steps

### Create tickets for a new SDD change

1. Search for an existing Epic with the same scope — avoid duplicates.
2. Create the Epic with: title, description (from proposal.md if available), component, and label `sdd`.
3. Under the Epic, create one Story per SDD phase that needs tracking:
   - **Explore** — research and analysis
   - **Design** — technical design and ADRs
   - **Apply** — implementation (one Story per module if large)
   - **Verify** — tests and validation
4. Add acceptance criteria to each Story matching the SDD phase output (proposal, spec, design, tasks, implementation, verification).
5. Report back: Epic key + Story keys, with direct links.

### Update ticket status

Map SDD phases to Jira statuses:
- `sdd-explore` in progress → **In Progress**
- `sdd-propose` done → **In Review** (proposal needs approval)
- `sdd-apply` done → **In Review** (PR open)
- `sdd-verify` passed → **Done**

### Link a PR to a Jira ticket

Add the PR URL to the ticket's remote links. If the branch name contains the ticket key (e.g., `feat/PROJ-123-auth-migration`), mention it in the commit and PR description.

## Output Contract

Always return:
- Ticket keys created or updated (e.g., `PROJ-42`, `PROJ-43`)
- Direct links to each ticket
- Next action for the user (e.g., "assign the story and move it to In Progress")

Never return raw API responses or JSON blobs — only human-readable summaries.

## References

- `references/sdd-jira-mapping.md` — mapping between SDD phases and Jira workflow statuses
