import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { detectTools } from '../detector'
import { getState as getOpenSpecState } from '../utils/openspec'
import { logger } from '../utils/logger'
import { hasClaudeTeamBlock } from '../utils/checks'

const CLAUDE_DIR = path.join(os.homedir(), '.claude')

export async function status(): Promise<void> {
  console.log(chalk.bold.magenta('\n  baseline — status\n'))

  const detected = detectTools()

  logger.title('AI Tools')
  const allTools = [
    { name: 'claude-code', detected: detected.claudeCode },
    { name: 'opencode', detected: detected.opencode },
    { name: 'antigravity', detected: detected.antigravity },
  ]
  for (const tool of allTools) {
    if (tool.detected) logger.success(tool.name)
    else logger.dim(`${tool.name} — not installed`)
  }

  if (detected.claudeCode) {
    logger.title('Claude Code Skills')
    const skillsDir = path.join(CLAUDE_DIR, 'skills')
    if (await fs.pathExists(skillsDir)) {
      const skills = await fs.readdir(skillsDir)
      for (const skill of skills) logger.success(skill)
    } else {
      logger.warn('No skills directory found — run baseline install')
    }

    logger.title('CLAUDE.md')
    if (await hasClaudeTeamBlock()) {
      logger.success('Team standards block present')
    } else {
      logger.warn('Team standards block missing — run baseline install')
    }
  }

  logger.title('Project OpenSpec (current directory)')
  const openSpec = await getOpenSpecState()
  if (!openSpec.present) {
    logger.warn('openspec/ structure missing — run baseline install')
  } else {
    if (openSpec.specsDir) logger.success('openspec/specs/')
    else logger.warn('openspec/specs/ missing')
    if (openSpec.changesDir) logger.success(`openspec/changes/ (${openSpec.changeCount} change${openSpec.changeCount === 1 ? '' : 's'})`)
    else logger.warn('openspec/changes/ missing')
    if (openSpec.readme) logger.success('openspec/README.md')
    else logger.dim('openspec/README.md missing (optional)')
  }

  console.log()
}
