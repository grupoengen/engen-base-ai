import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from './logger'
import type { AITool } from '../detector'

// Agent IDs that engram setup recognizes
const AGENT_IDS: Partial<Record<AITool, string>> = {
  'claude-code': 'claude-code',
  'opencode':    'opencode',
  'kiro-ide':    'kiro',
  'kiro-cli':    'kiro',
}

// Settings files where engram setup writes mcpServers.engram
const SETTINGS_FILES: Partial<Record<AITool, string>> = {
  'claude-code': path.join(os.homedir(), '.claude', 'settings.json'),
  'kiro-ide':    path.join(os.homedir(), '.kiro', 'settings', 'mcp.json'),
  'kiro-cli':    path.join(os.homedir(), '.kiro', 'settings', 'mcp.json'),
}

export type EngramMode = 'local' | 'cloud' | 'both' | 'none'

export function isInstalled(): boolean {
  try {
    execSync('engram --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function getVersion(): string {
  try {
    return execSync('engram --version', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

export function detectMode(): EngramMode {
  if (!isInstalled()) return 'none'
  const cloudConfigured = !!process.env.ENGRAM_CLOUD_TOKEN || !!process.env.ENGRAM_CLOUD_SERVER
  return cloudConfigured ? 'both' : 'local'
}

export async function isWiredForTool(tool: AITool): Promise<boolean> {
  const settingsPath = SETTINGS_FILES[tool]
  if (!settingsPath || !await fs.pathExists(settingsPath)) return false
  try {
    const settings = await fs.readJson(settingsPath)
    return !!(settings?.mcpServers?.engram)
  } catch {
    return false
  }
}

export async function setup(tools: AITool[]): Promise<void> {
  logger.title('Engram')

  if (!isInstalled()) {
    logger.warn('Engram not installed — skipping MCP wiring')
    logger.dim('Install: brew install gentleman-programming/tap/engram')
    logger.dim('More options: https://github.com/Gentleman-Programming/engram')
    return
  }

  const mode = detectMode()
  logger.info(`Mode: ${mode}`)

  const seen = new Set<string>()
  for (const tool of tools) {
    const agentId = AGENT_IDS[tool]
    if (!agentId || seen.has(agentId)) continue
    seen.add(agentId)

    try {
      execSync(`engram setup ${agentId}`, { stdio: 'pipe' })
      logger.success(`engram setup ${agentId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.warn(`engram setup ${agentId} failed: ${message}`)
    }
  }
}
