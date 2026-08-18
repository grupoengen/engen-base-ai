import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { findExecutable } from './utils/executable'

export type AITool = 'kiro-ide' | 'kiro-cli'

export interface DetectedTools {
  tools: AITool[]
  kiroIde: boolean
  kiroCli: boolean
}

function binaryExists(command: string): boolean {
  return findExecutable(command) !== null
}

function dirExists(dirPath: string): boolean {
  return fs.pathExistsSync(dirPath)
}

export function detectTools(): DetectedTools {
  const kiroIde = dirExists(path.join(os.homedir(), '.kiro'))
  const kiroCli = binaryExists('kiro') && !kiroIde

  const tools: AITool[] = []
  if (kiroIde) tools.push('kiro-ide')
  if (kiroCli) tools.push('kiro-cli')

  return { tools, kiroIde, kiroCli }
}
