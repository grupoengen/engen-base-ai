import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const FALLBACK_PROJECT = 'default'
const PROJECT_CONFIG_DIRECTORY = '.baseline'
const PROJECT_CONFIG_FILE = 'project.json'

interface ProjectConfig {
  slug: string
}

export function resolveProjectIdentity(project?: string): string {
  const value = project?.trim()
  if (!value) return resolveDirectoryIdentity(process.cwd())
  if (isSimpleProjectName(value)) return normalizeProjectSlug(value)
  return resolveDirectoryIdentity(path.resolve(value))
}

function isSimpleProjectName(value: string): boolean {
  return value !== '.' && value !== '..' && !value.includes('/') && !value.includes('\\')
}

function resolveDirectoryIdentity(directory: string): string {
  const configuredSlug = readProjectConfig(directory)
  if (configuredSlug) return configuredSlug
  const repositoryName = readRepositoryName(directory)
  return normalizeProjectSlug(repositoryName ?? path.basename(directory))
}

function readProjectConfig(directory: string): string | null {
  let current = path.resolve(directory)
  while (true) {
    const configPath = path.join(current, PROJECT_CONFIG_DIRECTORY, PROJECT_CONFIG_FILE)
    if (existsSync(configPath)) {
      try {
        const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as Partial<ProjectConfig>
        if (typeof parsed.slug !== 'string') throw new Error('slug must be a string')
        return normalizeProjectSlug(parsed.slug) || null
      } catch {
        return null
      }
    }
    const parent = path.dirname(current)
    if (parent === current) return null
    current = parent
  }
}

function readRepositoryName(directory: string): string | null {
  try {
    const origin = execFileSync('git', ['config', '--get', 'remote.origin.url'], {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return parseRepositoryName(origin)
  } catch {
    return null
  }
}

function parseRepositoryName(origin: string): string | null {
  if (!origin) return null
  const scpMatch = /^(?:[^@]+@)?(github\.com|bitbucket\.org):[^/]+\/(.+)$/i.exec(origin)
  if (scpMatch?.[2]) return stripSuffix(scpMatch[2])
  try {
    const url = new URL(origin)
    const segments = url.pathname.split('/').filter(Boolean)
    const repo = segments.at(-1)
    return repo ? stripSuffix(repo) : null
  } catch {
    return null
  }
}

function stripSuffix(value: string): string {
  return value.replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/\.git$/i, '')
}

export function normalizeProjectSlug(value: string): string {
  const ascii = value.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\x00-\x7F]/g, '')
  const slug = ascii
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .slice(0, 128)
    .replace(/^[-_.]+|[-_.]+$/g, '')
  return slug || FALLBACK_PROJECT
}
