import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from '../utils/logger'
import { CLAUDE_TEAM_MARKER as MARKER } from '../utils/checks'

const CLAUDE_DIR = path.join(os.homedir(), '.claude')
const SKILLS_DIR = path.join(CLAUDE_DIR, 'skills')
const CLAUDE_MD = path.join(CLAUDE_DIR, 'CLAUDE.md')

export async function apply(assetsDir: string): Promise<void> {
  logger.title('Claude Code')

  await applySkills(assetsDir)
  await applyClaudeMd(assetsDir)
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

async function applyClaudeMd(assetsDir: string): Promise<void> {
  const appendSource = path.join(assetsDir, 'CLAUDE-append.md')
  if (!await fs.pathExists(appendSource)) return

  const appendContent = await fs.readFile(appendSource, 'utf-8')
  const block = `\n${MARKER}\n${STRICT_TDD_BLOCK}${appendContent}\n${MARKER}\n`

  if (await fs.pathExists(CLAUDE_MD)) {
    const existing = await fs.readFile(CLAUDE_MD, 'utf-8')
    if (existing.includes(MARKER)) {
      // replace existing block
      const replaced = existing.replace(new RegExp(`\n${MARKER}[\\s\\S]*?${MARKER}\n`), block)
      await fs.writeFile(CLAUDE_MD, replaced, 'utf-8')
    } else {
      await fs.appendFile(CLAUDE_MD, block, 'utf-8')
    }
  } else {
    await fs.writeFile(CLAUDE_MD, block, 'utf-8')
  }

  logger.success('CLAUDE.md updated (strict TDD mode enabled)')
}

export async function uninstall(): Promise<void> {
  if (await fs.pathExists(CLAUDE_MD)) {
    const content = await fs.readFile(CLAUDE_MD, 'utf-8')
    const cleaned = content.replace(new RegExp(`\n${MARKER}[\\s\\S]*?${MARKER}\n`), '')
    await fs.writeFile(CLAUDE_MD, cleaned, 'utf-8')
  }
}
