# baseline-cloud integration

baseline-cloud is a self-hosted server that stores corporate skills and tracks Kiro credit usage across your team. The integration is built directly into the `baseline` CLI — no separate package to install.

---

## What it does

- **Corporate skills**: organizational rules and standards (e.g. architecture decisions, coding conventions) are stored as skills on the baseline-cloud server and delivered automatically to every developer's Kiro IDE via `~/.kiro/steering/bl-*.md`.
- **Credit tracking**: the CLI watches `~/.kiro/sessions/` in the background and reports token usage to baseline-cloud, giving your team visibility into Kiro IDE and Kiro CLI consumption.

---

## Prerequisites

- A running baseline-cloud server (self-hosted by your organization)
- An API token generated from the baseline-cloud admin dashboard (`/dashboard/admin/tokens`)
- `baseline` CLI installed: `npm install -g @grupoengen/engen-base-ai`
- Kiro IDE or Kiro CLI installed (for corporate skills delivery)

---

## Setup

### 1. Authenticate

```bash
baseline cloud login --server https://your-baseline-cloud.com --token <your-token>
```

Credentials are saved to `~/.baseline/cloud.json` with permissions `0600` (owner read/write only). The file is never committed to version control.

### 2. Verify the connection

```bash
baseline cloud status
```

Output when configured:

```
  Server: https://your-baseline-cloud.com
  Token:  u3Urtw...
  Status: connected
```

### 3. Sync corporate skills

```bash
baseline cloud sync
```

This downloads all corporate skills from baseline-cloud and writes them to `~/.kiro/steering/` as `bl-<slug>.md` files. Skills that no longer exist on the server are removed automatically.

After this step, Kiro IDE will pick up the new steering files on next session start.

---

## Automatic behavior after login

Once authenticated, nothing else is required. Everything runs in the background.

### Kiro IDE — session start sync

`baseline install` writes `~/.kiro/steering/baseline-cloud.md`, which instructs the Kiro AI agent to run `baseline cloud sync` silently at the beginning of every session. The developer does not see any output for this — skills are refreshed transparently.

### Background watcher — credit tracking

`baseline install` also installs a background watcher:

- **macOS**: a launchd LaunchAgent at `~/Library/LaunchAgents/ia.baseline.kiro-scan.plist`, running every 5 minutes
- **Linux**: a cron job running every 5 minutes

The watcher scans `~/.kiro/sessions/` for new session activity (both Kiro IDE workspaces and Kiro CLI sessions), extracts credit usage from the session JSONL files, and posts events to baseline-cloud. Lifecycle events (`session.started`, `session.completed`, `session.failed`) are also reported.

Credentials are read from `~/.baseline/cloud.json` on each run.

---

## Shell permissions for Kiro IDE

`baseline install` adds the following rule to `~/.kiro/settings/permissions.yaml`:

```yaml
  - capability: shell
    effect: allow
    match:
      - baseline *
```

This allows Kiro IDE to run `baseline cloud sync` at session start without prompting the developer for permission each time.

---

## Commands reference

| Command | Description |
|---------|-------------|
| `baseline cloud login --server <url> --token <token>` | Save credentials. |
| `baseline cloud status` | Show server and token. |
| `baseline cloud sync` | Pull latest corporate skills to `~/.kiro/steering/bl-*.md`. |
| `baseline cloud logout` | Remove `~/.baseline/cloud.json`. |
| `baseline cloud kiro-scan` | Manually scan sessions and report credit usage. |

---

## Troubleshooting

### Corporate skills do not appear in Kiro

1. Run `baseline cloud status` — if it shows "not configured", run `baseline cloud login` first.
2. Run `baseline cloud sync` manually and check the output.
3. Verify `~/.kiro/steering/` contains files named `bl-*.md` after the sync.
4. Restart Kiro IDE — steering files are loaded at session start.

### The background watcher is not running (macOS)

```bash
launchctl list | grep ia.baseline.kiro-scan
```

If the entry is missing, re-run `baseline install` or:

```bash
baseline install kiro-ide
```

To check logs:

```bash
cat ~/Library/Logs/ia.baseline.kiro-scan.log
```

### Credit events are not appearing in baseline-cloud

1. Run `baseline cloud kiro-scan` manually — if it reports an error, check the server URL and token with `baseline cloud status`.
2. Confirm `~/.kiro/sessions/` exists and contains session files.
3. Check the watcher log (macOS: `~/Library/Logs/ia.baseline.kiro-scan.log`).

### Token is rejected (401)

Generate a new token from the baseline-cloud admin dashboard (`/dashboard/admin/tokens`), then re-run `baseline cloud login`.

---

## How admins add corporate skills

Skills are managed from the baseline-cloud admin dashboard:

1. Go to `/dashboard/admin/skills`
2. Click **New skill** and fill in the slug, name, and Markdown content
3. The skill is immediately available to all developers on their next `baseline cloud sync` or Kiro session start

Skills use the `kiro` tool type and follow the standard skill frontmatter format:

```markdown
---
name: skill-slug
description: "Trigger: ..."
license: Apache-2.0
metadata:
  author: your-org
  version: "1.0"
---

## Activation Contract
...
```
