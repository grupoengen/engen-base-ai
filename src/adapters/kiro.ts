import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from '../utils/logger'

const KIRO_DIR = path.join(os.homedir(), '.kiro')
const SKILLS_DIR = path.join(KIRO_DIR, 'skills')
const STEERING_DIR = path.join(KIRO_DIR, 'steering')
const AGENTS_DIR = path.join(KIRO_DIR, 'agents')
const STEERING_FILE = path.join(STEERING_DIR, 'baseline.md')

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
  await applySubAgents()
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
