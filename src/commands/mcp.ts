import { logger } from '../utils/logger'
import { configureAtlassianMcp } from '../utils/mcp-atlassian'

const SUPPORTED = ['jira'] as const
type McpProvider = typeof SUPPORTED[number]

export async function mcp(provider: string): Promise<void> {
  if (!SUPPORTED.includes(provider as McpProvider)) {
    logger.error(`Unknown provider: "${provider}". Available: ${SUPPORTED.join(', ')}`)
    process.exit(1)
  }

  if (provider === 'jira') {
    logger.title('Atlassian MCP — Jira')
    await configureAtlassianMcp()
    logger.info('')
    logger.info('Restart Claude Code to activate the MCP server.')
    logger.info('Then use /jira-workflow to create and manage Jira tickets from your AI tool.')
  }
}
