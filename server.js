'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const port = Number(process.env.PORT);
const host = process.env.HOST || '0.0.0.0';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

// Explicit routes prevent requests from exposing source files or local secrets.
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/index.js', ['index.js', 'text/javascript; charset=utf-8']]
]);
const publicRoot = fs.realpathSync(path.join(__dirname, 'public'));
if (publicRoot !== path.resolve(__dirname, 'public')) {
  throw new Error('The public directory must not be a symbolic link.');
}
const files = new Map();
for (const [route, [name, type]] of assets) {
  const filename = path.join(publicRoot, name);
  if (fs.lstatSync(filename).isSymbolicLink()) {
    throw new Error('Static files must not be symbolic links.');
  }
  files.set(route, { body: fs.readFileSync(filename), type });
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    res.writeHead(400);
    return res.end();
  }

  if (pathname === '/api/health') {
    const body = JSON.stringify({ status: 'ok' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
    return res.end(req.method === 'HEAD' ? undefined : body);
  }

  const file = files.get(pathname);
  if (!file) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': file.type, 'Content-Length': file.body.length });
  res.end(req.method === 'HEAD' ? undefined : file.body);
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;
server.maxRequestsPerSocket = 100;
server.on('error', (error) => {
  console.error('Server error:', error.code || 'UNKNOWN');
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(`FoundIt listening on port ${port}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close();
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
