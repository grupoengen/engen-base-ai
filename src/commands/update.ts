import { execSync } from 'child_process'
import chalk from 'chalk'
import { install } from './install'
import { logger } from '../utils/logger'

export async function update(): Promise<void> {
  console.log(chalk.bold.magenta('\n  baseline — update\n'))

  try {
    logger.info('Updating package...')
    execSync('npm update -g @baseline-ia/baseline-cli', { stdio: 'inherit' })
    logger.success('Package updated')
  } catch {
    logger.error('npm update failed — check your registry auth')
    process.exit(1)
  }

  logger.info('Re-applying team standards...')
  await install()
}
