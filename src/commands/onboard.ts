import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { intro, select, isCancel, cancel } from '@clack/prompts'
import { logger } from '../utils/logger'

type Level = 'junior' | 'semi' | 'senior'

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'onboarding')

const LEVELS: Record<Level, { label: string; file: string }> = {
  junior: { label: 'Junior (4-week path)', file: 'junior.md' },
  semi: { label: 'Semi-senior (1-week path)', file: 'semi.md' },
  senior: { label: 'Senior / Lead (2-day path)', file: 'senior.md' },
}

export async function onboard(level?: string): Promise<void> {
  intro('baseline — onboarding')

  if (!level) {
    const selected = await select({
      message: 'Select your experience level',
      options: [
        { value: 'junior', label: 'Junior', hint: '4-week path' },
        { value: 'semi', label: 'Semi-senior', hint: '1-week path' },
        { value: 'senior', label: 'Senior / Lead', hint: '2-day path' },
      ],
    })

    if (isCancel(selected)) {
      cancel('Onboarding cancelled.')
      process.exit(0)
    }

    level = selected as string
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
