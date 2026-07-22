import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { detectTools } from '../detector'
import { getState as getOpenSpecState } from '../utils/openspec'
import { logger } from '../utils/logger'
import { hasClaudeTeamBlock } from '../utils/checks'
import { isInstalled as isEngramInstalled, getVersion as getEngramVersion, detectMode as detectEngramMode, isWiredForTool } from '../utils/engram'
import { isInstalled as areHooksInstalled } from '../utils/git-hooks'

const CLAUDE_DIR = path.join(os.homedir(), '.claude')

interface Check {
  name: string
  pass: boolean
  fix?: string
}

export async function doctor(): Promise<void> {
  console.log(chalk.bold.magenta('\n  baseline — doctor\n'))

  const detected = detectTools()
  const checks: Check[] = []

  // Node version
  const nodeVersion = process.version.replace('v', '').split('.').map(Number)
  checks.push({
    name: `Node.js >= 18 (current: ${process.version})`,
    pass: nodeVersion[0] >= 18,
    fix: 'Install Node.js 18+ via nvm or https://nodejs.org',
  })

  // AI tools
  checks.push({
    name: 'At least one AI tool installed (claude / opencode / antigravity)',
    pass: detected.tools.length > 0,
    fix: 'Install Claude Code: https://claude.ai/code',
  })

  if (detected.claudeCode) {
    // CLAUDE.md team block
    const hasTeamBlock = await hasClaudeTeamBlock()
    checks.push({
      name: 'Team standards block in CLAUDE.md',
      pass: hasTeamBlock,
      fix: 'Run: baseline install',
    })

    // Skills directory
    const skillsDir = path.join(CLAUDE_DIR, 'skills')
    checks.push({
      name: 'Skills directory exists',
      pass: await fs.pathExists(skillsDir),
      fix: 'Run: baseline install',
    })

    // Git hooks
    checks.push({
      name: 'Git hooks installed (pre-push blocks protected branches)',
      pass: areHooksInstalled(),
      fix: 'Run: baseline install',
    })

    // Gentle-AI
    let gentleAiInstalled = false
    try {
      execSync('gentle-ai --version', { stdio: 'ignore' })
      gentleAiInstalled = true
    } catch { /* not installed */ }
    checks.push({
      name: 'Gentle-AI installed',
      pass: gentleAiInstalled,
      fix: 'Install Gentle-AI: https://github.com/Gentleman-Programming/gentle-ai',
    })
  }

  // Print results
  let allPass = true
  for (const check of checks) {
    if (check.pass) {
      logger.success(check.name)
    } else {
      logger.error(check.name)
      if (check.fix) logger.dim(`Fix: ${check.fix}`)
      allPass = false
    }
  }

  // Engram (advisory — not blocking, but required for persistent memory)
  logger.title('Engram (persistent memory)')
  const engramInstalled = isEngramInstalled()
  if (!engramInstalled) {
    logger.warn('Engram not installed')
    logger.dim('Fix: brew install gentleman-programming/tap/engram')
    logger.dim('     or see: https://github.com/Gentleman-Programming/engram')
  } else {
    const version = getEngramVersion()
    const mode = detectEngramMode()
    logger.success(`Engram installed (${version})`)
    logger.success(`Mode: ${mode}`)

    if (mode === 'local') {
      logger.dim('Tip: set ENGRAM_CLOUD_TOKEN to enable cloud sync across machines')
    }

    // Check MCP wiring per detected tool
    for (const tool of detected.tools) {
      const wired = await isWiredForTool(tool)
      if (wired) {
        logger.success(`MCP wired for ${tool}`)
      } else {
        logger.warn(`MCP not wired for ${tool}`)
        logger.dim(`Fix: Run: baseline install${tool !== 'claude-code' ? ` ${tool}` : ''}`)
      }
    }
  }

  // Project OpenSpec (advisory, does not affect exit code)
  const openSpec = await getOpenSpecState()
  logger.title('Project OpenSpec (current directory)')
  if (!openSpec.present) {
    logger.warn('openspec/ structure missing')
    logger.dim('Fix: Run: baseline install')
  } else {
    if (openSpec.specsDir) logger.success('openspec/specs/')
    else logger.warn('openspec/specs/ missing')
    if (openSpec.changesDir) logger.success(`openspec/changes/ (${openSpec.changeCount} change${openSpec.changeCount === 1 ? '' : 's'})`)
    else logger.warn('openspec/changes/ missing')
    if (openSpec.readme) logger.success('openspec/README.md')
    else logger.dim('openspec/README.md missing (optional)')
  }

  console.log()
  if (allPass) {
    console.log(chalk.bold.green('  Everything looks good!\n'))
  } else {
    console.log(chalk.bold.yellow('  Some checks failed. Fix the issues above and re-run.\n'))
    process.exit(1)
  }
}
