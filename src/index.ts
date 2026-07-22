import { Command } from 'commander'
import { install } from './commands/install'
import { update } from './commands/update'
import { status } from './commands/status'
import { doctor } from './commands/doctor'
import { onboard } from './commands/onboard'
import { mcp } from './commands/mcp'
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
  .description('Install team standards, skills and AI config (optionally for a specific tool: claude, opencode, kiro, antigravity)')
  .action(async (tool?: string) => {
    try {
      await install(tool)
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

program
  .command('mcp <provider>')
  .description('Configure an MCP server for your AI tools (e.g. baseline mcp jira)')
  .action(async (provider: string) => {
    try {
      await mcp(provider)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(message)
      process.exit(1)
    }
  })

program.parse(process.argv)
