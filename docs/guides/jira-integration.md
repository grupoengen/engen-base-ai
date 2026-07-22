# Jira Integration — Step-by-step guide

This guide connects your AI tools to Jira via the official Atlassian MCP server so the
`/jira-workflow` skill can create and update tickets directly from your conversations.

---

## Supported AI tools

| Tool | MCP support | Config written by `baseline mcp jira` |
|------|------------|---------------------------------------|
| Claude Code | ✅ | `~/.claude/settings.json` |
| Kiro IDE | ✅ | `~/.kiro/settings/mcp.json` |
| Kiro CLI | ✅ | `~/.kiro/settings/mcp.json` |
| OpenCode | ⚠ coming soon | — |
| Codex | — | — |

`baseline mcp jira` auto-detects which tools are installed and writes the config only
where supported. If you have multiple tools installed, it configures all of them in one run.

---

## Prerequisites

- `baseline` CLI installed (`npm install -g @baseline-ia/baseline-cli`)
- At least one supported AI tool installed and working
- An Atlassian account with access to your team's Jira project
- Node.js >= 18

---

## Step 1 — Generate an Atlassian API token

1. Go to **https://id.atlassian.com/manage-profile/security/api-tokens**
2. Click **Create API token**
3. Give it a label (e.g. `baseline-cli`) and click **Create**
4. **Copy the token** — you won't be able to see it again

> Your Atlassian API token is a personal secret. Never commit it to a repository or share it in Slack.

---

## Step 2 — Find your Jira site URL

Your site URL is the base domain of your Jira instance:

```
https://your-org.atlassian.net
```

You can find it in the browser address bar when you open any Jira project.

---

## Step 3 — Set environment variables

Add these three variables to your shell profile (`~/.zshrc`, `~/.bashrc`, or equivalent):

```bash
export ATLASSIAN_SITE_URL=https://your-org.atlassian.net
export ATLASSIAN_USER_EMAIL=your@email.com
export ATLASSIAN_API_TOKEN=your-token-from-step-1
```

Then reload your shell:

```bash
source ~/.zshrc   # or source ~/.bashrc
```

Verify the variables are set:

```bash
echo $ATLASSIAN_SITE_URL    # should print your Jira URL
echo $ATLASSIAN_USER_EMAIL  # should print your email
```

---

## Step 4 — Configure the MCP server

Run:

```bash
baseline mcp jira
```

The command detects your installed AI tools and writes the Atlassian MCP server config
for each one automatically.

**Example output with two tools installed:**

```
✔ Atlassian MCP configured for Claude Code → ~/.claude/settings.json
✔ Atlassian MCP configured for Kiro        → ~/.kiro/settings.json
✔ Credentials written from environment variables
```

**What gets written — Claude Code** (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@atlassian/mcp", "--transport", "stdio"],
      "env": {
        "ATLASSIAN_SITE_URL": "https://your-org.atlassian.net",
        "ATLASSIAN_USER_EMAIL": "your@email.com",
        "ATLASSIAN_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**What gets written — Kiro IDE / CLI** (`~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@atlassian/mcp", "--transport", "stdio"],
      "env": {
        "ATLASSIAN_SITE_URL": "${ATLASSIAN_SITE_URL}",
        "ATLASSIAN_USER_EMAIL": "${ATLASSIAN_USER_EMAIL}",
        "ATLASSIAN_API_TOKEN": "${ATLASSIAN_API_TOKEN}"
      }
    }
  }
}
```

Kiro supports `${VAR}` expansion — credentials are read from your shell environment at runtime
and are never hardcoded in the config file.

> Both commands merge the Atlassian entry into the existing config without touching other settings.

---

## Step 5 — Restart your AI tool

Fully close and reopen your AI tool (Claude Code, Kiro IDE, Kiro CLI) so it picks up
the new MCP server configuration.

- **Claude Code (terminal):** exit the session and run `claude` again
- **Kiro IDE:** close and reopen the IDE
- **Kiro CLI:** exit the session and run `kiro` again

---

## Step 6 — Verify the connection

Inside your AI tool, ask:

```
/jira-workflow busca el proyecto PROJ en Jira y muéstrame los tickets abiertos
```

If the MCP is working, the AI will query Jira and return real data. If you see an error:

| Error | Likely cause | Fix |
|-------|-------------|-----|
| `ENOENT npx` | Node.js not on PATH | Add Node.js to PATH and restart your AI tool |
| `401 Unauthorized` | Wrong credentials | Check `ATLASSIAN_API_TOKEN` in the config file |
| `404 Not Found` | Wrong site URL | Check `ATLASSIAN_SITE_URL` — must include `https://` |
| MCP not listed | Server not loaded | Fully quit and reopen your AI tool |

---

## Step 7 — Set up your Jira project

For `/jira-workflow` to work well with the team's SDD flow, create these labels in your Jira project:

| Label | Used for |
|-------|---------|
| `sdd` | All tickets created via baseline |
| `blocker` | Tickets that block another ticket |
| `tech-debt` | Migrations, refactors, cleanup |
| `multi-tenancy` | Work involving tenant isolation |

Verify your project has these workflow statuses (standard Jira defaults work):

- **To Do** — work not started
- **In Progress** — active development
- **In Review** — PR open or proposal awaiting approval
- **Done** — verified and merged

---

## Step 8 — First use

Now you can use `/jira-workflow` from any conversation in your AI tool:

```
/jira-workflow crea los tickets para la feature de autenticación JWT
```

The skill will:
1. Check if an Epic already exists for the same scope
2. Create the Epic with `sdd` label
3. Create Stories for each SDD phase: Explore, Design, Apply, Verify
4. Return the ticket keys and direct links

Other examples:

```
/jira-workflow vincula el PR #47 al ticket PROJ-23
```

```
/jira-workflow mueve PROJ-23 a In Review
```

---

## Updating credentials

If you rotate your API token, re-run with updated env vars:

```bash
export ATLASSIAN_API_TOKEN=your-new-token
baseline mcp jira
```

Or edit the config file for your AI tool directly and update `ATLASSIAN_API_TOKEN`.

---

## Sharing the setup with the team

Each team member follows Steps 1–6 with their **own personal API token**. Never share tokens.

For onboarding new devs, point them to this guide and provide:
- The Jira site URL (`ATLASSIAN_SITE_URL`)
- The Jira project key (e.g. `PROJ`) to test the connection in Step 6
