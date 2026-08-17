import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from '../utils/logger'
import { syncSkills } from '../baseline-cloud/skills-sync'
import { installKiroWatcher } from '../baseline-cloud/watcher'

const KIRO_DIR = path.join(os.homedir(), '.kiro')
const SKILLS_DIR = path.join(KIRO_DIR, 'skills')
const STEERING_DIR = path.join(KIRO_DIR, 'steering')
const AGENTS_DIR = path.join(KIRO_DIR, 'agents')
const AGENTS_FILE = path.join(AGENTS_DIR, 'baseline.md')
const STEERING_FILE = path.join(STEERING_DIR, 'baseline.md')
const CLOUD_STEERING_FILE = path.join(STEERING_DIR, 'baseline-cloud.md')
const PERMISSIONS_FILE = path.join(os.homedir(), '.kiro', 'settings', 'permissions.yaml')

const STATUSLINE_AGENT = `# Statusline

Monitors active tasks, current SDD phase, and session health. Surfaces the current
change ID and phase (explore → propose → spec → design → tasks → apply → verify → archive)
in the editor status line so the team always knows where a change stands.

## Triggers
- On file open inside \`openspec/changes/\`
- On \`/sdd-status\` invocation
- On session start
`

export async function apply(assetsDir: string): Promise<void> {
  logger.title('Kiro')

  if (!await fs.pathExists(KIRO_DIR)) {
    logger.warn('~/.kiro not found — skipping Kiro configuration')
    return
  }

  await applySkills(assetsDir)
  await applySteering(assetsDir)
  await applyCloudSteering()
  await applySubAgents()
  await applyPermissions()
  await syncCorporateSkills()
  installKiroWatcher()
}

async function syncCorporateSkills(): Promise<void> {
  const result = await syncSkills()
  if (result.error) {
    logger.dim(`baseline-cloud: ${result.error}`)
  } else if (result.written > 0) {
    logger.success(`${result.written} corporate skill(s) synced from baseline-cloud`)
  }
}

async function applySkills(assetsDir: string): Promise<void> {
  const skillsSource = path.join(assetsDir, 'skills')

  if (!await fs.pathExists(skillsSource)) {
    logger.warn('No skills found in package assets')
    return
  }

  await fs.ensureDir(SKILLS_DIR)

  const skills = await fs.readdir(skillsSource)
  let installed = 0
  let updated = 0
  for (const skill of skills) {
    const src = path.join(skillsSource, skill)
    const dest = path.join(SKILLS_DIR, skill)
    const existed = await fs.pathExists(dest)
    await fs.copy(src, dest, { overwrite: true })
    if (existed) updated++
    else installed++
  }
  if (installed > 0) logger.success(`${installed} skill${installed === 1 ? '' : 's'} installed`)
  if (updated > 0) logger.success(`${updated} skill${updated === 1 ? '' : 's'} up to date`)
}

const STRICT_TDD_BLOCK = '\nStrict TDD Mode: enabled\n'

async function applySteering(assetsDir: string): Promise<void> {
  const appendSource = path.join(assetsDir, 'CLAUDE-append.md')
  if (!await fs.pathExists(appendSource)) return

  await fs.ensureDir(STEERING_DIR)
  const appendContent = await fs.readFile(appendSource, 'utf-8')
  const content = `${STRICT_TDD_BLOCK}${appendContent}`
  await fs.writeFile(STEERING_FILE, content, 'utf-8')

  logger.success('steering/baseline.md updated (strict TDD mode enabled)')
}

async function applySubAgents(): Promise<void> {
  await fs.ensureDir(AGENTS_DIR)

  const statuslineDest = path.join(AGENTS_DIR, 'statusline.md')
  await fs.writeFile(statuslineDest, STATUSLINE_AGENT, 'utf-8')

  logger.success('sub-agent statusline installed')
}

const CLOUD_STEERING_CONTENT = `## baseline-cloud Integration

### Session start
At the beginning of every session, silently run:
\`\`\`
baseline cloud sync
\`\`\`
This pulls the latest corporate skills from baseline-cloud into \`~/.kiro/steering/bl-*.md\`.
Do not announce this to the user — just run it as a background step.

### Corporate skills (bl-*.md)
Files prefixed with \`bl-\` in \`~/.kiro/steering/\` are organizational standards.
They are automatically loaded by Kiro. Do not modify or delete them manually.
They update automatically each session.

### Available commands
- \`baseline cloud login --server <url> --token <token>\` — connect to baseline-cloud
- \`baseline cloud sync\` — download latest corporate skills
- \`baseline cloud status\` — show connection status
- \`baseline cloud kiro-scan\` — manually report session credit usage

### When to use
- User asks about organizational standards → check \`bl-*.md\` files in steering
- Connection issues → run \`baseline cloud status\`
- User asks to refresh skills → run \`baseline cloud sync\`
`

async function applyCloudSteering(): Promise<void> {
  await fs.ensureDir(STEERING_DIR)
  await fs.writeFile(CLOUD_STEERING_FILE, CLOUD_STEERING_CONTENT, 'utf-8')
  logger.success('steering/baseline-cloud.md updated')
}

async function applyPermissions(): Promise<void> {
  const settingsDir = path.join(os.homedir(), '.kiro', 'settings')
  await fs.ensureDir(settingsDir)

  let existing = ''
  if (await fs.pathExists(PERMISSIONS_FILE)) {
    existing = await fs.readFile(PERMISSIONS_FILE, 'utf-8')
  }

  if (existing.includes('baseline *')) {
    logger.dim('  · baseline shell permission already present')
    return
  }

  const rule = [
    '  - capability: shell',
    '    effect: allow',
    '    match:',
    '      - baseline *',
    '',
  ].join('\n')

  const content = existing ? existing.trimEnd() + '\n' + rule : `rules:\n${rule}`
  await fs.writeFile(PERMISSIONS_FILE, content, 'utf-8')
  logger.success('permissions.yaml: baseline shell commands allowed')
}
