import chalk from 'chalk'

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('  ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('  ✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('  ⚠'), msg),
  error: (msg: string) => console.log(chalk.red('  ✗'), msg),
  title: (msg: string) => console.log('\n' + chalk.bold.white(msg)),
  dim: (msg: string) => console.log(chalk.dim('    ' + msg)),
}
