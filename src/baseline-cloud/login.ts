import { intro, outro, text, password, isCancel, cancel } from '@clack/prompts'
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

  intro('baseline-cloud — login')

  const defUrl = opts.serverUrl ?? process.env.BASELINE_CLOUD_URL ?? ''

  const serverUrl = await text({
    message: 'Server URL',
    placeholder: 'https://your-baseline-cloud.com',
    initialValue: defUrl,
    validate: (value) => {
      const url = (value || '').replace(/\/+$/, '')
      if (!url) return 'Server URL is required'
      if (!validServerUrl(url)) return 'Must be a valid http(s) URL'
    },
  })

  if (isCancel(serverUrl)) {
    cancel('Login cancelled.')
    process.exit(0)
  }

  const token = await password({
    message: 'API token',
    validate: (value) => {
      if (!value) return 'Token is required'
    },
  })

  if (isCancel(token)) {
    cancel('Login cancelled.')
    process.exit(0)
  }

  const cleanUrl = (serverUrl as string).replace(/\/+$/, '')
  saveConfig({ server_url: cleanUrl, token: token as string })

  outro(`Connected to ${cleanUrl}  (token: ${tokenPrefix(token as string)})`)
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
