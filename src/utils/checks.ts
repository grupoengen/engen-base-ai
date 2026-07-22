import fs from 'fs-extra'
import path from 'path'
import os from 'os'

export const CLAUDE_TEAM_MARKER = '# --- baseline ---'

const CLAUDE_MD = path.join(os.homedir(), '.claude', 'CLAUDE.md')

export async function hasClaudeTeamBlock(): Promise<boolean> {
  if (!await fs.pathExists(CLAUDE_MD)) return false
  const content = await fs.readFile(CLAUDE_MD, 'utf-8')
  return content.includes(CLAUDE_TEAM_MARKER)
}
