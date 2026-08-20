import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { loadConfig } from '../baseline-cloud/auth'
import { logger } from '../utils/logger'

interface SkillFrontmatter {
  name?: string
  description?: string
  tool?: string
}

function parseFrontmatter(content: string): SkillFrontmatter {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content)
  if (!match) return {}
  const block = match[1]
  const result: SkillFrontmatter = {}

  const nameMatch = /^name:\s*(.+)$/m.exec(block)
  if (nameMatch) result.name = nameMatch[1].trim().replace(/^["']|["']$/g, '')

  const descMatch = /^description:\s*(.+)$/m.exec(block)
  if (descMatch) result.description = descMatch[1].trim().replace(/^["']|["']$/g, '')

  const toolMatch = /^tool:\s*(.+)$/m.exec(block)
  if (toolMatch) result.tool = toolMatch[1].trim().replace(/^["']|["']$/g, '')

  return result
}

interface SkillPayload {
  slug: string
  name: string
  description?: string
  tool?: string
  content: string
}

function collectSkills(assetsDir: string): SkillPayload[] {
  if (!existsSync(assetsDir)) return []

  const skills: SkillPayload[] = []
  const entries = readdirSync(assetsDir).filter((f) =>
    statSync(join(assetsDir, f)).isDirectory(),
  )

  for (const slug of entries) {
    const skillPath = join(assetsDir, slug, 'SKILL.md')
    if (!existsSync(skillPath)) continue
    const content = readFileSync(skillPath, 'utf8')
    const fm = parseFrontmatter(content)
    if (!fm.name) continue
    skills.push({
      slug,
      name: fm.name,
      description: fm.description,
      tool: fm.tool,
      content,
    })
  }

  return skills
}

export async function skillsPush(): Promise<void> {
  const cfg = loadConfig()
  if (!cfg) {
    logger.error('baseline-cloud not configured — run: baseline cloud login')
    process.exit(1)
  }

  const assetsDir = join(__dirname, '..', 'src', 'assets', 'skills')
  const skills = collectSkills(assetsDir)

  if (skills.length === 0) {
    logger.warn('No SKILL.md files found in assets — nothing to push')
    return
  }

  logger.info(`Pushing ${skills.length} skills to baseline-cloud…`)

  let res: Response
  try {
    res = await fetch(`${cfg.server_url}/api/v1/skills/push`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch (err) {
    logger.error(`Network error: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }

  if (res.status === 403) {
    logger.error('Admin token required — only admin users can push skills')
    process.exit(1)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    logger.error(`Server returned ${res.status}: ${JSON.stringify(body)}`)
    process.exit(1)
  }

  const data = await res.json() as {
    ok: boolean
    summary: { created: number; updated: number; skipped: number }
    results: Array<{ slug: string; action: string; version?: number; error?: string }>
  }

  const { created, updated, skipped } = data.summary
  logger.success(`Done — ${created} created, ${updated} updated, ${skipped} skipped`)

  for (const r of data.results) {
    if (r.action === 'error') {
      logger.warn(`  ✗ ${r.slug}: ${r.error}`)
    } else if (r.action === 'created') {
      logger.dim(`  + ${r.slug} (v${r.version})`)
    } else if (r.action === 'updated') {
      logger.dim(`  ↑ ${r.slug} (v${r.version})`)
    }
  }
}
