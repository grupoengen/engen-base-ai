import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PKG_NAME: string = (require('../../package.json') as { name: string }).name
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BIN_NAME: string = Object.keys((require('../../package.json') as { bin?: Record<string, string> }).bin ?? {})[0] ?? 'baseline'

const LABEL = `ia.baseline.${BIN_NAME}-kiro-scan`
const PLIST_PATH = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`)
const CRON_MARKER = `# ${PKG_NAME} kiro-scan`
const SCAN_INTERVAL = 300

function findBinary(): string | null {
  const result = spawnSync('which', [BIN_NAME], { encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : null
}

function buildPlist(binaryPath: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${binaryPath}</string>
    <string>cloud</string>
    <string>kiro-scan</string>
  </array>
  <key>StartInterval</key>
  <integer>${SCAN_INTERVAL}</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/${BIN_NAME}-kiro.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/${BIN_NAME}-kiro-error.log</string>
</dict>
</plist>
`
}

function installMacos(binaryPath: string): boolean {
  mkdirSync(join(homedir(), 'Library', 'LaunchAgents'), { recursive: true })
  spawnSync('launchctl', ['unload', PLIST_PATH], { stdio: 'ignore' })
  writeFileSync(PLIST_PATH, buildPlist(binaryPath), 'utf8')
  const r = spawnSync('launchctl', ['load', PLIST_PATH], { encoding: 'utf8' })
  return r.status === 0
}

function uninstallMacos(): boolean {
  if (!existsSync(PLIST_PATH)) return true
  spawnSync('launchctl', ['unload', PLIST_PATH], { stdio: 'ignore' })
  try { unlinkSync(PLIST_PATH); return true } catch { return false }
}

function readCrontab(): string {
  const r = spawnSync('crontab', ['-l'], { encoding: 'utf8' })
  return r.status === 0 ? r.stdout : ''
}

function writeCrontab(content: string): boolean {
  const r = spawnSync('crontab', ['-'], { input: content, encoding: 'utf8' })
  return r.status === 0
}

function installCron(binaryPath: string): boolean {
  const current = readCrontab()
  if (current.includes(CRON_MARKER)) return true
  const entry = `${CRON_MARKER}\n*/5 * * * * ${binaryPath} cloud kiro-scan >> /tmp/${BIN_NAME}-kiro.log 2>&1\n`
  return writeCrontab((current.trimEnd() ? current.trimEnd() + '\n' : '') + entry)
}

function uninstallCron(): boolean {
  const current = readCrontab()
  if (!current.includes(CRON_MARKER)) return true
  const filtered = current
    .split('\n')
    .filter((line, i, arr) => !line.includes(CRON_MARKER) && !arr[i - 1]?.includes(CRON_MARKER))
    .join('\n')
  return writeCrontab(filtered)
}

export function installKiroWatcher(): boolean {
  const binary = findBinary()
  if (!binary) return false

  const os = platform()
  if (os === 'darwin') return installMacos(binary)
  if (os === 'linux') return installCron(binary)
  return false
}

export function uninstallKiroWatcher(): boolean {
  const os = platform()
  if (os === 'darwin') return uninstallMacos()
  if (os === 'linux') return uninstallCron()
  return false
}

export function watcherStatus(): { installed: boolean; method: 'launchd' | 'cron' | null } {
  const os = platform()
  if (os === 'darwin') {
    const installed = existsSync(PLIST_PATH)
    return { installed, method: installed ? 'launchd' : null }
  }
  if (os === 'linux') {
    const installed = readCrontab().includes(CRON_MARKER)
    return { installed, method: installed ? 'cron' : null }
  }
  return { installed: false, method: null }
}
