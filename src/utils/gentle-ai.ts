import { execSync } from 'child_process'
import { logger } from './logger'
import type { AITool } from '../detector'

const INSTALL_URL = 'https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.sh'
const PERSONA = 'neutral'

// Maps our tool names to gentle-ai agent IDs and install config.
// Codex is excluded: gentle-ai injects engram into Codex which requires >=0.144.0
// and fails when the binary is missing or outdated.
const AGENT_CONFIG: Record<string, { agentId: string; preset: string; sddMode?: string }> = {
  'claude-code':  { agentId: 'claude-code', preset: 'full-gentleman', sddMode: 'multi' },
  'opencode':     { agentId: 'opencode',    preset: 'full-gentleman', sddMode: 'multi' },
  'kiro-ide':     { agentId: 'kiro-ide',    preset: 'performance',    sddMode: 'multi' },
  'kiro-cli':     { agentId: 'kiro-ide',    preset: 'performance',    sddMode: 'multi' },
  'antigravity':  { agentId: 'antigravity', preset: 'full-gentleman' },
}

export function isInstalled(): boolean {
  try {
    execSync('command -v gentle-ai', { stdio: 'ignore' })
    execSync('gentle-ai --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export async function installCli(): Promise<void> {
  logger.info('Gentle-AI not found — running official installer')
  execSync(`curl -fsSL ${INSTALL_URL} | bash`, {
    stdio: 'inherit',
    env: { ...process.env, GENTLE_AI_YES: '1' },
  })
}

function trustBrewTap(): void {
  try {
    execSync('brew trust gentleman-programming/tap', { stdio: 'ignore' })
  } catch {
    // brew not available or tap already trusted — ignore
  }
}

function gentleAiInstall(agentId: string, preset: string, sddMode?: string): void {
  const sddFlag = sddMode ? ` --sdd-mode ${sddMode}` : ''
  execSync(
    `gentle-ai install --agent ${agentId} --preset ${preset} --persona ${PERSONA}${sddFlag}`,
    { stdio: 'inherit', env: { ...process.env, GENTLE_AI_YES: '1' } }
  )
}

export async function runInstall(tools: AITool[]): Promise<void> {
  if (tools.length === 0) return

  trustBrewTap()

  // Group tools by (preset, sddMode) to minimize install calls
  type ConfigKey = string
  const groups = new Map<ConfigKey, { agentIds: string[]; preset: string; sddMode?: string }>()

  for (const tool of tools) {
    const cfg = AGENT_CONFIG[tool]
    if (!cfg) continue
    const key: ConfigKey = `${cfg.preset}::${cfg.sddMode ?? ''}`
    if (!groups.has(key)) {
      groups.set(key, { agentIds: [], preset: cfg.preset, sddMode: cfg.sddMode })
    }
    const group = groups.get(key)!
    if (!group.agentIds.includes(cfg.agentId)) {
      group.agentIds.push(cfg.agentId)
    }
  }

  for (const { agentIds, preset, sddMode } of groups.values()) {
    logger.info(`Running gentle-ai install --agent ${agentIds.join(',')} --preset ${preset}`)
    gentleAiInstall(agentIds.join(','), preset, sddMode)
  }
}
