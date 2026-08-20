import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { loadConfig } from './auth'
import { resolveProjectIdentity } from './identity'

const KIRO_SKILLS_DIR = join(homedir(), '.kiro', 'skills')
const KIRO_STEERING_DIR = join(homedir(), '.kiro', 'steering')
const LEGACY_PREFIX = 'bl-'

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
  cloudPolicy: string[]
  error?: string
}

export async function syncSkills(opts: { project?: string; verbose?: boolean } = {}): Promise<SyncResult> {
  const cfg = loadConfig()
  if (!cfg) {
    return { written: 0, removed: 0, cloudPolicy: [], error: 'baseline-cloud not configured — run: baseline cloud login' }
  }

  const project = resolveProjectIdentity(opts.project)

  let skills: SkillRow[]
  let cloudPolicy: string[] = []
  try {
    const res = await fetch(`${cfg.server_url}/api/v1/skills?project=${encodeURIComponent(project)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>
      const code = (body as { error_code?: unknown }).error_code ?? res.status
      return { written: 0, removed: 0, cloudPolicy: [], error: `Server returned ${res.status} (${code})` }
    }
    const data = await res.json() as { ok: boolean; skills: SkillRow[]; policy?: { skills?: { disabled?: string[] } } }
    skills = data.skills ?? []
    cloudPolicy = data.policy?.skills?.disabled ?? []
  } catch (err) {
    return { written: 0, removed: 0, cloudPolicy: [], error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
  }

  if (!existsSync(KIRO_SKILLS_DIR)) {
    return { written: 0, removed: 0, cloudPolicy, error: '~/.kiro/skills not found — is Kiro installed?' }
  }

  let written = 0

  for (const skill of skills) {
    const skillDir = join(KIRO_SKILLS_DIR, skill.slug)
    if (!existsSync(skillDir)) mkdirSync(skillDir, { recursive: true })
    writeFileSync(join(skillDir, 'SKILL.md'), skill.content, 'utf8')
    written++
  }

  // Remove legacy bl-*.md files from steering that are now in ~/.kiro/skills/
  if (existsSync(KIRO_STEERING_DIR)) {
    const legacy = readdirSync(KIRO_STEERING_DIR).filter((f) => f.startsWith(LEGACY_PREFIX))
    for (const f of legacy) {
      try { unlinkSync(join(KIRO_STEERING_DIR, f)) } catch { /* ignore */ }
    }
  }

  return { written, removed: 0, cloudPolicy }
}
