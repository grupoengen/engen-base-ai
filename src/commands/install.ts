import path from 'path'
import chalk from 'chalk'
import { intro, outro, multiselect, isCancel, cancel } from '@clack/prompts'
import { detectTools } from '../detector'
import { apply as applyClaudeCode } from '../adapters/claude-code'
import { apply as applyOpenCode } from '../adapters/opencode'
import { apply as applyAntigravity } from '../adapters/antigravity'
import { apply as applyKiro } from '../adapters/kiro'
import { setup as setupOpenSpec } from '../utils/openspec'
import { isInstalled as isGentleAiInstalled, installCli as installGentleAi, runInstall as runGentleAiInstall } from '../utils/gentle-ai'
import { setup as setupEngram } from '../utils/engram'
import { installGlobalHooks } from '../utils/git-hooks'
import { enrollProject } from '../baseline-cloud/enrollment'
import { logger } from '../utils/logger'
import type { AITool } from '../detector'

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets')

const VALID_TOOLS = ['claude', 'claude-code', 'opencode', 'kiro-ide', 'kiro-cli', 'kiro', 'codex', 'antigravity'] as const
type ToolArg = typeof VALID_TOOLS[number]

const INTERACTIVE_TOOLS: Array<{ value: AITool; label: string }> = [
  { value: 'kiro-ide', label: 'Kiro IDE' },
  { value: 'kiro-cli', label: 'Kiro CLI' },
]

function normalizeTool(tool: string): AITool | null {
  switch (tool.toLowerCase()) {
    case 'claude':
    case 'claude-code': return 'claude-code'
    case 'opencode':    return 'opencode'
    case 'kiro':
    case 'kiro-ide':    return 'kiro-ide'
    case 'kiro-cli':    return 'kiro-cli'
    case 'codex':       return 'codex'
    case 'antigravity': return 'antigravity'
    default:            return null
  }
}

export async function install(tool?: string, opts: { yes?: boolean } = {}): Promise<void> {
  intro('baseline — install')

  if (tool && !VALID_TOOLS.includes(tool as ToolArg)) {
    logger.error(`Unknown tool: "${tool}"`)
    logger.dim(`Valid options: ${VALID_TOOLS.join(', ')}`)
    process.exit(1)
  }

  const detected = detectTools()
  const target: AITool | null = tool ? normalizeTool(tool) : null
  let selectedTools: AITool[] = detected.tools

  if (!target && !opts.yes) {
    const options = INTERACTIVE_TOOLS.map(t => ({
      value: t.value,
      label: t.label,
      hint: detected.tools.includes(t.value) ? 'detected' : '',
    }))
    const initialValues = INTERACTIVE_TOOLS
      .map(t => t.value)
      .filter(v => detected.tools.includes(v))

    if (initialValues.length === 0 && detected.tools.length === 0) {
      cancel('No supported tools detected. Install Kiro IDE or Kiro CLI first.')
      process.exit(1)
    }

    const selected = await multiselect({
      message: 'Which tools to configure?',
      options,
      initialValues,
      required: true,
    })

    if (isCancel(selected)) {
      cancel('Installation cancelled.')
      process.exit(0)
    }

    selectedTools = selected as AITool[]
  } else if (!target) {
    if (detected.tools.length === 0) {
      cancel('No AI tools detected. Install Kiro IDE or Kiro CLI first.')
      process.exit(1)
    }
    logger.info(`Detected: ${detected.tools.join(', ')}`)
    selectedTools = detected.tools
  } else {
    logger.info(`Target: ${target}`)
  }

  const shouldRun = (t: AITool): boolean =>
    target !== null ? target === t : selectedTools.includes(t)

  const agentsForGentleAi: AITool[] = target !== null ? [target] : selectedTools

  await ensureGentleAiEcosystem(agentsForGentleAi)
  await setupOpenSpec()

  if (shouldRun('claude-code'))
    await safeApply('Claude Code', () => applyClaudeCode(ASSETS_DIR))
  if (shouldRun('opencode'))
    await safeApply('OpenCode', () => applyOpenCode(ASSETS_DIR))
  if (shouldRun('kiro-ide') || shouldRun('kiro-cli'))
    await safeApply('Kiro', () => applyKiro(ASSETS_DIR))
  if (shouldRun('antigravity'))
    await safeApply('Antigravity', () => applyAntigravity(ASSETS_DIR))

  await safeApply('Engram', () => setupEngram(agentsForGentleAi))
  await safeApply('Git hooks', () => installGlobalHooks(ASSETS_DIR))
  await enrollProject()

  outro(chalk.green('Team standards installed successfully'))
}

async function ensureGentleAiEcosystem(tools: AITool[]): Promise<void> {
  logger.title('Gentle-AI ecosystem')

  if (!isGentleAiInstalled()) {
    try {
      await installGentleAi()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.warn(`Gentle-AI installer failed: ${message}`)
      logger.dim('Continuing with baseline curated subset only...')
      return
    }
  }

  if (!isGentleAiInstalled()) {
    logger.warn('Gentle-AI still unavailable — skipping full ecosystem install')
    return
  }

  try {
    await runGentleAiInstall(tools)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn(`gentle-ai install failed: ${message}`)
    logger.dim('Continuing with baseline curated subset only...')
  }
}

async function safeApply(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn(`${name} adapter failed: ${message}`)
    logger.dim('Continuing with the remaining adapters...')
  }
}
