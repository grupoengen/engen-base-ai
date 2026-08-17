import { existsSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { loadConfig } from './auth'
import { resolveProjectIdentity } from './identity'

const KIRO_STEERING_DIR = join(homedir(), '.kiro', 'steering')
const SKILL_PREFIX = 'bl-'

interface SkillRow {
  slug: string
  name: string
  version: number
  content: string
  failClosed: boolean
  tool: string | null
}

export interface SyncResult {
  written: number
  removed: number
  error?: string
}

export async function syncSkills(opts: { project?: string; verbose?: boolean } = {}): Promise<SyncResult> {
  const cfg = loadConfig()
  if (!cfg) {
    return { written: 0, removed: 0, error: 'baseline-cloud not configured — run: baseline cloud login' }
  }

  const project = resolveProjectIdentity(opts.project)

  let skills: SkillRow[]
  try {
    const res = await fetch(`${cfg.server_url}/api/v1/skills?project=${encodeURIComponent(project)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>
      const code = (body as { error_code?: unknown }).error_code ?? res.status
      return { written: 0, removed: 0, error: `Server returned ${res.status} (${code})` }
    }
    const data = await res.json() as { ok: boolean; skills: SkillRow[] }
    skills = data.skills ?? []
  } catch (err) {
    return { written: 0, removed: 0, error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
  }

  if (!existsSync(KIRO_STEERING_DIR)) {
    return { written: 0, removed: 0, error: '~/.kiro/steering not found — is Kiro installed?' }
  }

  const written: string[] = []

  for (const skill of skills) {
    const filename = `${SKILL_PREFIX}${skill.slug}.md`
    writeFileSync(join(KIRO_STEERING_DIR, filename), skill.content, 'utf8')
    written.push(filename)
  }

  const stale = readdirSync(KIRO_STEERING_DIR)
    .filter((f) => f.startsWith(SKILL_PREFIX) && !written.includes(f))

  for (const f of stale) {
    unlinkSync(join(KIRO_STEERING_DIR, f))
  }

  return { written: written.length, removed: stale.length }
}
