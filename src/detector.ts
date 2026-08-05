import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { findExecutable } from './utils/executable'

export type AITool = 'claude-code' | 'opencode' | 'antigravity' | 'kiro-ide' | 'kiro-cli' | 'codex'

export interface DetectedTools {
  tools: AITool[]
  claudeCode: boolean
  opencode: boolean
  antigravity: boolean
  kiroIde: boolean
  kiroCli: boolean
  codex: boolean
}

function binaryExists(command: string): boolean {
  return findExecutable(command) !== null
}

function dirExists(dirPath: string): boolean {
  return fs.pathExistsSync(dirPath)
}

export function detectTools(): DetectedTools {
  const claudeCode = binaryExists('claude')
  const opencode = binaryExists('opencode')
  const antigravity = binaryExists('antigravity')
  const codex = binaryExists('codex')
  const kiroIde = dirExists(path.join(os.homedir(), '.kiro'))
  const kiroCli = binaryExists('kiro') && !kiroIde

  const tools: AITool[] = []
  if (claudeCode) tools.push('claude-code')
  if (opencode) tools.push('opencode')
  if (antigravity) tools.push('antigravity')
  if (kiroIde) tools.push('kiro-ide')
  if (kiroCli) tools.push('kiro-cli')
  if (codex) tools.push('codex')

  return { tools, claudeCode, opencode, antigravity, kiroIde, kiroCli, codex }
}
