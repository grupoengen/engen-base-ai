import { createInterface } from 'node:readline/promises'
import { stdin, stdout, exit } from 'node:process'
import { saveConfig, tokenPrefix, loadConfig, clearConfig } from './auth'

function validServerUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export interface LoginOpts {
  serverUrl?: string
  token?: string
}

export async function login(opts: LoginOpts = {}): Promise<void> {
  if (opts.token && opts.serverUrl) {
    saveConfig({ server_url: opts.serverUrl, token: opts.token })
    console.log(`✓ Token saved. Server: ${opts.serverUrl} | Prefix: ${tokenPrefix(opts.token)}`)
    return
  }

  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const defUrl = opts.serverUrl ?? process.env.BASELINE_CLOUD_URL ?? ''
    const promptUrl = defUrl ? `Server URL [${defUrl}]: ` : 'Server URL: '
    const rawUrl = (await rl.question(promptUrl)).trim() || defUrl
    const serverUrl = rawUrl.replace(/\/+$/, '')

    if (!serverUrl || !validServerUrl(serverUrl)) {
      console.error('✗ Invalid server URL')
      exit(1)
    }

    const token = (await rl.question('API token: ')).trim()
    if (!token) {
      console.error('✗ Token is required')
      exit(1)
    }

    saveConfig({ server_url: serverUrl, token })
    console.log(`✓ Config saved to ~/.baseline/cloud.json`)
    console.log(`  Server: ${serverUrl}`)
    console.log(`  Token prefix: ${tokenPrefix(token)}`)
  } finally {
    rl.close()
  }
}

export async function logout(): Promise<void> {
  const cfg = loadConfig()
  if (cfg) {
    try {
      await fetch(`${cfg.server_url}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.token}` },
        signal: AbortSignal.timeout(5_000),
      })
    } catch {
      // ignore — still clear locally
    }
  }
  clearConfig()
  console.log('✓ Logged out. baseline-cloud config removed.')
}

export function status(): void {
  const cfg = loadConfig()
  if (!cfg) {
    console.log('  Not configured — run: baseline cloud login')
    return
  }
  console.log(`✓ Connected`)
  console.log(`  Server: ${cfg.server_url}`)
  console.log(`  Token: ${tokenPrefix(cfg.token)}`)
}
