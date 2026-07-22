import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { logger } from './logger'
import { detectTools } from '../detector'

const MCP_SERVER_NAME = 'atlassian'

interface McpServerConfig {
  command: string
  args: string[]
  env: Record<string, string>
}

interface McpSettings {
  mcpServers?: Record<string, McpServerConfig>
  [key: string]: unknown
}

const TOOL_SETTINGS: Record<string, string> = {
  'claude-code': path.join(os.homedir(), '.claude', 'settings.json'),
  'kiro-ide':    path.join(os.homedir(), '.kiro', 'settings', 'mcp.json'),
  'kiro-cli':    path.join(os.homedir(), '.kiro', 'settings', 'mcp.json'),
}

// Kiro supports ${VAR} env expansion — credentials stay in the shell, not hardcoded in the file.
// Claude Code uses literal values in the env object.
function buildServerConfig(useEnvExpansion: boolean, siteUrl: string, email: string, token: string): McpServerConfig {
  return {
    command: 'npx',
    args: ['-y', '@atlassian/mcp', '--transport', 'stdio'],
    env: useEnvExpansion
      ? {
          ATLASSIAN_SITE_URL:   '${ATLASSIAN_SITE_URL}',
          ATLASSIAN_USER_EMAIL: '${ATLASSIAN_USER_EMAIL}',
          ATLASSIAN_API_TOKEN:  '${ATLASSIAN_API_TOKEN}',
        }
      : {
          ATLASSIAN_SITE_URL:   siteUrl || 'https://your-org.atlassian.net',
          ATLASSIAN_USER_EMAIL: email   || 'your@email.com',
          ATLASSIAN_API_TOKEN:  token   || 'your-api-token',
        },
  }
}

export async function configureAtlassianMcp(): Promise<void> {
  const siteUrl = process.env.ATLASSIAN_SITE_URL ?? ''
  const email   = process.env.ATLASSIAN_USER_EMAIL ?? ''
  const token   = process.env.ATLASSIAN_API_TOKEN ?? ''

  const detected = detectTools()
  let configured = 0

  for (const [tool, settingsPath] of Object.entries(TOOL_SETTINGS)) {
    const isKiro = tool === 'kiro-ide' || tool === 'kiro-cli'
    const isInstalled =
      (tool === 'claude-code' && detected.claudeCode) ||
      (tool === 'kiro-ide'    && detected.kiroIde) ||
      (tool === 'kiro-cli'    && detected.kiroCli)

    if (!isInstalled) continue

    const serverConfig = buildServerConfig(isKiro, siteUrl, email, token)
    await writeSettings(settingsPath, serverConfig)
    const label = isKiro ? 'Kiro' : 'Claude Code'
    logger.success(`Atlassian MCP configured for ${label} → ${settingsPath.replace(os.homedir(), '~')}`)
    configured++
  }

  if (detected.opencode) {
    logger.warn('OpenCode detected — MCP server config via settings.json not yet supported for OpenCode')
  }

  if (configured === 0 && !detected.opencode) {
    logger.warn('No supported AI tool detected — nothing was configured')
    logger.info('Run after installing Claude Code or Kiro.')
    return
  }

  if (!siteUrl || !email || !token) {
    logger.warn('')
    logger.warn('Credentials not set — fill in the placeholders in the config file(s) above:')
    logger.info('  ATLASSIAN_SITE_URL   → https://your-org.atlassian.net')
    logger.info('  ATLASSIAN_USER_EMAIL → your Atlassian account email')
    logger.info('  ATLASSIAN_API_TOKEN  → https://id.atlassian.com/manage-profile/security/api-tokens')
    logger.info('')
    logger.info('Or set the env vars and re-run:')
    logger.info('  ATLASSIAN_SITE_URL=... ATLASSIAN_USER_EMAIL=... ATLASSIAN_API_TOKEN=... baseline mcp jira')
  } else {
    logger.success('Credentials written from environment variables')
  }
}

async function writeSettings(settingsPath: string, serverConfig: McpServerConfig): Promise<void> {
  await fs.ensureDir(path.dirname(settingsPath))
  const settings = await readJson(settingsPath)
  settings.mcpServers = settings.mcpServers ?? {}
  settings.mcpServers[MCP_SERVER_NAME] = serverConfig
  await fs.writeJson(settingsPath, settings, { spaces: 2 })
}

async function readJson(filePath: string): Promise<McpSettings> {
  if (await fs.pathExists(filePath)) {
    try {
      return await fs.readJson(filePath) as McpSettings
    } catch {
      return {}
    }
  }
  return {}
}
