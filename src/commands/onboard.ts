import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { logger } from '../utils/logger'

type Level = 'junior' | 'semi' | 'senior'

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'onboarding')

const LEVELS: Record<Level, { label: string; file: string }> = {
  junior: { label: 'Junior (4-week path)', file: 'junior.md' },
  semi: { label: 'Semi-senior (1-week path)', file: 'semi.md' },
  senior: { label: 'Senior / Lead (2-day path)', file: 'senior.md' },
}

export async function onboard(level?: string): Promise<void> {
  if (!level) {
    console.log(chalk.bold.magenta('\n  baseline — onboarding\n'))
    logger.info('Choose your level:')
    logger.dim('baseline onboard junior')
    logger.dim('baseline onboard semi')
    logger.dim('baseline onboard senior')
    console.log()
    return
  }

  if (!Object.keys(LEVELS).includes(level)) {
    logger.error(`Unknown level: ${level}`)
    logger.dim('Valid options: junior, semi, senior')
    process.exit(1)
  }

  const { label, file } = LEVELS[level as Level]
  const filePath = path.join(DOCS_DIR, file)

  if (!await fs.pathExists(filePath)) {
    logger.error(`Onboarding doc not found: ${filePath}`)
    process.exit(1)
  }

  const content = await fs.readFile(filePath, 'utf-8')
  console.log(chalk.bold.magenta(`\n  Onboarding — ${label}\n`))
  console.log(content)
}
