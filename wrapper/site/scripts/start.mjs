// One command for the whole experience: install what is missing, build everything, serve dist/.
//   npm start            → http://localhost:4173/
//   PORT=8080 npm start
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setup } from './setup.mjs';
import { startServer } from './serve-dist.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
setup();
const build = spawnSync(process.execPath, [join(root, 'scripts/build-integration.mjs'), ...process.argv.slice(2)], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);
await startServer();
console.log('Press Ctrl+C to stop.');
