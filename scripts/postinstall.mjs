import { spawnSync } from 'node:child_process'

if (process.platform === 'darwin') {
  spawnSync('xattr', ['-cr', './node_modules'], { stdio: 'inherit' })
}
