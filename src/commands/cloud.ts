import { login, logout, status } from '../baseline-cloud/login'
import { syncSkills } from '../baseline-cloud/skills-sync'
import { kiroScan } from '../baseline-cloud/scanner'
import { logger } from '../utils/logger'

export async function cloudLogin(opts: { server?: string; token?: string }): Promise<void> {
  await login({ serverUrl: opts.server, token: opts.token })
}

export async function cloudLogout(): Promise<void> {
  await logout()
}

export function cloudStatus(): void {
  status()
}

export async function cloudSync(opts: { project?: string } = {}): Promise<void> {
  logger.info('Syncing corporate skills from baseline-cloud…')
  const result = await syncSkills({ project: opts.project, verbose: true })
  if (result.error) {
    logger.warn(`  ${result.error}`)
  } else {
    logger.success(`  ${result.written} skill(s) written, ${result.removed} removed`)
  }
}

export async function cloudKiroScan(): Promise<void> {
  await kiroScan()
}
