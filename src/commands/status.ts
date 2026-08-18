import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { detectTools } from '../detector'
import { getState as getOpenSpecState } from '../utils/openspec'
import { logger } from '../utils/logger'

const KIRO_DIR = path.join(os.homedir(), '.kiro')

export async function status(): Promise<void> {
  console.log(chalk.bold.magenta('\n  baseline — status\n'))

  const detected = detectTools()

  logger.title('AI Tools')
  const allTools = [
    { name: 'kiro-ide', detected: detected.kiroIde },
    { name: 'kiro-cli', detected: detected.kiroCli },
  ]
  for (const tool of allTools) {
    if (tool.detected) logger.success(tool.name)
    else logger.dim(`${tool.name} — not installed`)
  }

  if (detected.kiroIde) {
    logger.title('Kiro Skills')
    const skillsDir = path.join(KIRO_DIR, 'skills')
    if (await fs.pathExists(skillsDir)) {
      const skills = await fs.readdir(skillsDir)
      for (const skill of skills) logger.success(skill)
    } else {
      logger.warn('No skills directory found — run baseline install')
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
