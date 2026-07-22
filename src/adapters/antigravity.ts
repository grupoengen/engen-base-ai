import { execSync } from 'child_process'
import { logger } from '../utils/logger'

export async function apply(_assetsDir: string): Promise<void> {
  logger.title('Antigravity')

  try {
    execSync('command -v antigravity', { stdio: 'ignore' })
  } catch {
    logger.warn('Antigravity not installed — skipping')
    return
  }

  logger.warn('Antigravity adapter not yet implemented')
  logger.dim('Contribute the adapter at: src/adapters/antigravity.ts')
}
