import fs from 'fs'
import os from 'os'
import path from 'path'

export function findExecutable(command: string): string | null {
  const pathValue = process.env.PATH ?? ''
  const pathEntries = pathValue.split(path.delimiter).filter(Boolean)
  const extensions = process.platform === 'win32'
    ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT;.COM').split(';')
    : ['']
  const commandHasExtension = path.extname(command) !== ''

  for (const entry of pathEntries) {
    const candidates = commandHasExtension
      ? [command]
      : extensions.map(extension => `${command}${extension}`)

    for (const candidate of candidates) {
      const executablePath = path.resolve(entry, candidate)
      try {
        fs.accessSync(executablePath, process.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK)
        return executablePath
      } catch {
        // Try the next PATH entry.
      }
    }
  }

  return null
}

export function isWindows(): boolean {
  return os.platform() === 'win32'
}
