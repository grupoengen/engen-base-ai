import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from './logger'

const HOOKS_DIR = path.join(os.homedir(), '.baseline', 'hooks')

export async function installGlobalHooks(assetsDir: string): Promise<void> {
  logger.title('Git hooks')

  const sourceHooksDir = path.join(assetsDir, 'hooks')
  if (!await fs.pathExists(sourceHooksDir)) {
    logger.warn('No hooks found in package assets — skipping')
    return
  }

  await fs.ensureDir(HOOKS_DIR)

  const hooks = await fs.readdir(sourceHooksDir)
  for (const hook of hooks) {
    const src = path.join(sourceHooksDir, hook)
    const dest = path.join(HOOKS_DIR, hook)
    await fs.copy(src, dest, { overwrite: true })
    await fs.chmod(dest, '755')
  }

  // Check if core.hooksPath is already set to something else
  let existingPath = ''
  try {
    existingPath = execSync('git config --global core.hooksPath', { encoding: 'utf-8' }).trim()
  } catch { /* not set */ }

  if (existingPath && existingPath !== HOOKS_DIR) {
    logger.warn(`core.hooksPath already set to: ${existingPath}`)
    logger.dim('Skipping override — update it manually if you want baseline hooks:')
    logger.dim(`  git config --global core.hooksPath "${HOOKS_DIR}"`)
    return
  }

  try {
    execSync(`git config --global core.hooksPath "${HOOKS_DIR}"`, { stdio: 'ignore' })
    logger.success(`Global git hooks installed → ${HOOKS_DIR.replace(os.homedir(), '~')}`)
    logger.success('Protected branches: main, master, qa, develop')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn(`Could not configure global git hooks: ${message}`)
  }
}

export function isInstalled(): boolean {
  try {
    const hooksPath = execSync('git config --global core.hooksPath', { encoding: 'utf-8' }).trim()
    return hooksPath === HOOKS_DIR
  } catch {
    return false
  }
}
