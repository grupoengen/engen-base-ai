import fs from 'fs-extra'
import path from 'path'
import { logger } from './logger'

const TEMPLATE_DIR = path.join(__dirname, '..', 'src', 'assets', 'openspec')
const OPENSPEC_DIR = path.join(process.cwd(), 'openspec')
const SPECS_DIR = path.join(OPENSPEC_DIR, 'specs')
const CHANGES_DIR = path.join(OPENSPEC_DIR, 'changes')
const README_PATH = path.join(OPENSPEC_DIR, 'README.md')

export async function setup(): Promise<void> {
  logger.title('OpenSpec')

  await fs.ensureDir(SPECS_DIR)
  await fs.ensureDir(CHANGES_DIR)

  if (await fs.pathExists(README_PATH)) {
    logger.dim('openspec/README.md already exists — skipped')
    return
  }

  const templatePath = path.join(TEMPLATE_DIR, 'README.md')
  if (!(await fs.pathExists(templatePath))) {
    logger.warn('OpenSpec template not found in package assets — skipping README')
    return
  }

  await fs.copy(templatePath, README_PATH)
  logger.success('openspec/README.md created')
}

export async function exists(): Promise<boolean> {
  return fs.pathExists(OPENSPEC_DIR)
}

export interface OpenSpecState {
  present: boolean
  specsDir: boolean
  changesDir: boolean
  readme: boolean
  changeCount: number
}

export async function getState(): Promise<OpenSpecState> {
  const present = await fs.pathExists(OPENSPEC_DIR)
  if (!present) {
    return { present: false, specsDir: false, changesDir: false, readme: false, changeCount: 0 }
  }

  const [specsDir, changesDir, readme] = await Promise.all([
    fs.pathExists(SPECS_DIR),
    fs.pathExists(CHANGES_DIR),
    fs.pathExists(README_PATH),
  ])

  let changeCount = 0
  if (changesDir) {
    const entries = await fs.readdir(CHANGES_DIR)
    changeCount = entries.filter(e => !e.startsWith('.')).length
  }

  return { present, specsDir, changesDir, readme, changeCount }
}
