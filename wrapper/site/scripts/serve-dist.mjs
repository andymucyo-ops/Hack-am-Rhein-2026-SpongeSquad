// Serves the built website from dist/ (no dependencies).
//   PORT=4173 node scripts/serve-dist.mjs
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

export function startServer({ quiet = false } = {}) {
  const server = createServer(async (request, response) => {
    let url;
    let path;
    try {
      url = new URL(`http://localhost${request.url.startsWith('/') ? '' : '/'}${request.url}`);
      path = decodeURIComponent(url.pathname);
    } catch {
      response.writeHead(400).end('Bad request');
      return;
    }
    const file = normalize(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end('Forbidden'); return; }
    try {
      let info = await stat(file);
      let target = file;
      if (info.isDirectory()) {
        if (!url.pathname.endsWith('/')) {
          // Relative links need the trailing slash: /find → /find/
          response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
          return;
        }
        target = join(file, 'index.html');
        info = await stat(target);
      }
      response.writeHead(200, { 'Content-Type': types[extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      createReadStream(target).pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end('<!doctype html><title>Not found</title><p>Not found. <a href="/">SpongeSquad home</a></p>');
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => {
    if (!quiet) console.log(`\nSpongeSquad website: http://localhost:${port}/\n`);
    resolve(server);
  }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) startServer();
