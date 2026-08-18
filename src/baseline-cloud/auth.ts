import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'

export interface CloudConfig {
  server_url: string
  token: string
}

let _config: CloudConfig | null = null

function effectiveHomedir(): string {
  return homedir()
}

export function getCloudConfigPath(): string {
  return join(effectiveHomedir(), '.baseline', 'cloud.json')
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

export function loadConfig(): CloudConfig | null {
  if (_config) return _config

  const envUrl = process.env.BASELINE_CLOUD_URL
  const envToken = process.env.BASELINE_CLOUD_TOKEN
  if (envUrl && envToken) {
    _config = { server_url: stripTrailingSlash(envUrl), token: envToken }
    return _config
  }

  const path = getCloudConfigPath()
  if (existsSync(path)) {
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<CloudConfig>
      if (parsed.server_url && parsed.token) {
        _config = { server_url: stripTrailingSlash(parsed.server_url), token: parsed.token }
        return _config
      }
    } catch {
      // corrupted config — ignore
    }
  }

  return null
}

export function saveConfig(cfg: CloudConfig): void {
  const path = getCloudConfigPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(
    path,
    JSON.stringify({ server_url: cfg.server_url, token: cfg.token }, null, 2),
    { mode: 0o600 },
  )
  _config = { server_url: stripTrailingSlash(cfg.server_url), token: cfg.token }
}

export function clearConfig(): void {
  _config = null
  try {
    const path = getCloudConfigPath()
    if (existsSync(path)) unlinkSync(path)
  } catch {
    // ignore
  }
}

export function tokenPrefix(token: string): string {
  const first = token.split('.')[0] ?? token
  return `${first.slice(0, 3)}.***`
}
