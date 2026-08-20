import { Command } from 'commander'
import { install } from './commands/install'
import { update } from './commands/update'
import { status } from './commands/status'
import { doctor } from './commands/doctor'
import { onboard } from './commands/onboard'
import { cloudLogin, cloudLogout, cloudStatus, cloudSync, cloudKiroScan } from './commands/cloud'
import { repoInit, repoSync } from './commands/repo'
import { skillsPush } from './commands/skills'
import { logger } from './utils/logger'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json')

const program = new Command()

program
  .name('baseline')
  .description('Team AI development toolkit')
  .version(pkg.version)

program
  .command('install [tool]')
  .description('Install team standards, skills and AI config (optionally for a specific tool: kiro-ide, kiro-cli)')
  .option('-y, --yes', 'Skip interactive prompts and configure all detected tools')
  .action(async (tool: string | undefined, opts: { yes?: boolean }) => {
    try {
      await install(tool, opts)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(message)
      process.exit(1)
    }
  })

program
  .command('update')
  .description('Update baseline and re-apply standards')
  .action(async () => {
    try {
      await update()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(message)
      process.exit(1)
    }
  })

program
  .command('status')
  .description('Show installed tools and team config state')
  .action(async () => {
    try {
      await status()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(message)
      process.exit(1)
    }
  })

program
  .command('doctor')
  .description('Verify that everything is correctly configured')
  .action(async () => {
    try {
      await doctor()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(message)
      process.exit(1)
    }
  })

program
  .command('onboard [level]')
  .description('Show the onboarding guide for your level (junior / semi / senior)')
  .action(async (level?: string) => {
    try {
      await onboard(level)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(message)
      process.exit(1)
    }
  })

// baseline cloud — baseline-cloud integration
const cloud = program.command('cloud').description('Connect to a self-hosted baseline-cloud instance')

cloud
  .command('login')
  .description('Authenticate with a baseline-cloud server')
  .option('--server <url>', 'Server URL')
  .option('--token <token>', 'API token')
  .action(async (opts: { server?: string; token?: string }) => {
    try { await cloudLogin(opts) } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

cloud
  .command('logout')
  .description('Remove saved baseline-cloud credentials')
  .action(async () => {
    try { await cloudLogout() } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

cloud
  .command('status')
  .description('Show baseline-cloud connection status')
  .action(() => { cloudStatus() })

cloud
  .command('sync')
  .description('Download corporate skills from baseline-cloud to ~/.kiro/steering/')
  .option('--project <slug>', 'Project slug (defaults to current directory)')
  .action(async (opts: { project?: string }) => {
    try { await cloudSync(opts) } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

cloud
  .command('kiro-scan')
  .description('Scan Kiro sessions and report credit usage to baseline-cloud')
  .action(async () => {
    try { await cloudKiroScan() } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

cloud
  .command('skills-push')
  .description('Push all bundled skills to baseline-cloud (admin token required)')
  .action(async () => {
    try { await skillsPush() } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

// baseline repo — per-repository skill policy
const repo = program.command('repo').description('Manage per-repository skill policy')

repo
  .command('init')
  .description('Configure which skills are disabled for this repository')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(async (opts: { cwd: string }) => {
    try { await repoInit(opts.cwd) } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

repo
  .command('sync')
  .description('Sync repository skill policy from baseline-cloud')
  .option('--cwd <path>', 'Project directory', process.cwd())
  .action(async (opts: { cwd: string }) => {
    try { await repoSync(opts.cwd) } catch (err) { logger.error(err instanceof Error ? err.message : String(err)); process.exit(1) }
  })

program.parse(process.argv)
