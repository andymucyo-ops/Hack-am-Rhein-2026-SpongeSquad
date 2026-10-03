// Installs each module's dependencies with its own lockfile (npm ci) when node_modules is missing.
//   node scripts/setup.mjs          install only what is missing
//   node scripts/setup.mjs --force  reinstall every module
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = JSON.parse(readFileSync(join(root, 'integration/routes.json'), 'utf8'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const force = process.argv.includes('--force');

export function setup() {
  for (const mod of routes.modules) {
    if (mod.build !== 'vite') continue;
    const dir = join(root, mod.source);
    if (!force && existsSync(join(dir, 'node_modules', 'vite'))) continue;
    console.log(`▸ installing ${mod.source} (npm ci)`);
    const result = spawnSync(npm, ['ci', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) setup();
