import { loadConfig } from './auth'
import { resolveProjectIdentity } from './identity'

export async function enrollProject(opts: { project?: string; name?: string } = {}): Promise<void> {
  const cfg = loadConfig()
  if (!cfg) return // silent — not configured

  const project = resolveProjectIdentity(opts.project)
  const name = opts.name?.trim() || project

  try {
    const res = await fetch(`${cfg.server_url}/api/v1/projects/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.token}`,
        'Idempotency-Key': `project-enroll:${project}`,
      },
      body: JSON.stringify({ slug: project, name }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok && res.status !== 409) {
      // silently ignore enrollment failures — don't block the install flow
    }
  } catch {
    // network error — ignore
  }
}
