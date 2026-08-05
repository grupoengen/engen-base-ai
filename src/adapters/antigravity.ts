import { logger } from '../utils/logger'
import { findExecutable } from '../utils/executable'

export async function apply(_assetsDir: string): Promise<void> {
  logger.title('Antigravity')

  if (!findExecutable('antigravity')) {
    logger.warn('Antigravity not installed — skipping')
    return
  }

  logger.warn('Antigravity adapter not yet implemented')
  logger.dim('Contribute the adapter at: src/adapters/antigravity.ts')
}
