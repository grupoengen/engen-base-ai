import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from '../utils/logger'
import { CLAUDE_TEAM_MARKER as MARKER } from '../utils/checks'

const OPENCODE_DIR = path.join(os.homedir(), '.opencode')
const SKILLS_DIR = path.join(OPENCODE_DIR, 'skills')
const AGENTS_MD = path.join(OPENCODE_DIR, 'AGENTS.md')

const STRICT_TDD_BLOCK = '\nStrict TDD Mode: enabled\n'

export async function apply(assetsDir: string): Promise<void> {
  logger.title('OpenCode')

  if (!await fs.pathExists(OPENCODE_DIR)) {
    logger.warn('~/.opencode not found — skipping OpenCode configuration')
    return
  }

  await applySkills(assetsDir)
  await applyAgentsMd(assetsDir)
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

async function applyAgentsMd(assetsDir: string): Promise<void> {
  const appendSource = path.join(assetsDir, 'CLAUDE-append.md')
  if (!await fs.pathExists(appendSource)) return

  const appendContent = await fs.readFile(appendSource, 'utf-8')
  const block = `\n${MARKER}\n${STRICT_TDD_BLOCK}${appendContent}\n${MARKER}\n`

  if (await fs.pathExists(AGENTS_MD)) {
    const existing = await fs.readFile(AGENTS_MD, 'utf-8')
    if (existing.includes(MARKER)) {
      const replaced = existing.replace(new RegExp(`\n${MARKER}[\\s\\S]*?${MARKER}\n`), block)
      await fs.writeFile(AGENTS_MD, replaced, 'utf-8')
    } else {
      await fs.appendFile(AGENTS_MD, block, 'utf-8')
    }
  } else {
    await fs.writeFile(AGENTS_MD, block, 'utf-8')
  }

  logger.success('AGENTS.md updated (strict TDD mode enabled)')
}
