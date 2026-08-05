import { execFileSync, execSync } from 'child_process'
import fs from 'fs'
import https from 'https'
import os from 'os'
import path from 'path'
import { logger } from './logger'
import { findExecutable, isWindows } from './executable'
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
  const executable = findExecutable('gentle-ai')
  if (!executable) return false

  try {
    execFileSync(executable, ['--version'], { stdio: 'ignore', shell: isWindows() })
    return true
  } catch {
    return false
  }
}

export async function installCli(): Promise<void> {
  logger.info('Gentle-AI not found — running official installer')
  const installer = await downloadInstaller(INSTALL_URL)
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'engen-base-ai-'))
  const scriptPath = path.join(tempDir, 'install.sh')

  try {
    fs.writeFileSync(scriptPath, installer, { mode: 0o700 })
    const env = { ...process.env, GENTLE_AI_YES: '1' }
    const bash = findExecutable('bash')
    const wsl = isWindows() ? (findExecutable('wsl.exe') ?? findExecutable('wsl')) : null

    if (bash) {
      execFileSync(bash, [scriptPath], { stdio: 'inherit', env, shell: isWindows() })
      return
    }

    if (wsl) {
      execFileSync(wsl, ['bash'], { input: installer, stdio: ['pipe', 'inherit', 'inherit'], env })
      return
    }

    if (isWindows()) {
      const powershell = findExecutable('pwsh.exe') ?? findExecutable('powershell.exe')
      const runtimeHint = powershell
        ? 'PowerShell is available, but this official installer requires Bash or WSL to run.'
        : 'PowerShell was not found either.'
      throw new Error(
        `Gentle-AI installation requires Bash or WSL on Windows. ${runtimeHint} ` +
        'Install Git for Windows (Git Bash) or enable WSL, then run baseline install again.'
      )
    }

    throw new Error('Gentle-AI installation requires Bash, but no Bash executable was found on PATH.')
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

function downloadInstaller(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, response => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        downloadInstaller(new URL(response.headers.location, url).toString()).then(resolve, reject)
        return
      }

      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Failed to download Gentle-AI installer (HTTP ${response.statusCode ?? 'unknown'})`))
        return
      }

      const chunks: Buffer[] = []
      response.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    })
    request.on('error', reject)
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
  const executable = findExecutable('gentle-ai')
  if (!executable) throw new Error('gentle-ai executable was not found on PATH')

  const args = ['install', '--agent', agentId, '--preset', preset, '--persona', PERSONA]
  if (sddMode) args.push('--sdd-mode', sddMode)
  execFileSync(executable, args, {
    stdio: 'inherit',
    env: { ...process.env, GENTLE_AI_YES: '1' },
    shell: isWindows(),
  })
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
