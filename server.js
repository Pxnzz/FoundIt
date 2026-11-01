'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { TextDecoder } = require('node:util');
const mysql = require('mysql2/promise');

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

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function json(req, res, status, payload) {
  if (res.destroyed || res.writableEnded) return;
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length });
  res.end(req.method === 'HEAD' ? undefined : body);
}

function fail(req, res, status, code, message) {
  json(req, res, status, { success: false, message, errors: {}, code });
}

async function readJson(req) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json with UTF-8.');
  }
  if (req.headers['content-encoding'] && req.headers['content-encoding'].toLowerCase() !== 'identity') {
    throw new ApiError(415, 'UNSUPPORTED_ENCODING', 'Compressed request bodies are not supported.');
  }
  const limit = 16 * 1024;
  if (Number(req.headers['content-length']) > limit) {
    throw new ApiError(413, 'BODY_TOO_LARGE', 'JSON body exceeds 16 KiB.');
  }
  const chunks = [];
  let size = 0;
  // Event-based reading lets us send a controlled 413 before closing the socket.
  const body = await new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        chunks.length = 0;
        reject(new ApiError(413, 'BODY_TOO_LARGE', 'JSON body exceeds 16 KiB.'));
        return;
      }
      chunks.push(chunk);
    });
    req.once('end', () => resolve(Buffer.concat(chunks)));
    req.once('error', () => reject(new ApiError(400, 'INVALID_BODY', 'Request body could not be read.')));
    req.once('aborted', () => reject(new ApiError(400, 'INVALID_BODY', 'Request was interrupted.')));
  });
  let value;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request must contain valid UTF-8 JSON.');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(422, 'INVALID_JSON_OBJECT', 'Request body must be a JSON object.');
  }
  return value;
}

let pool;
function databasePool() {
  const env = process.env;
  // The platform provisions a separate runtime DB user; never replace it with local credentials.
  if (!env.DB_HOST || !env.DB_PASSWORD || !env.DB_USER || env.DB_USER.toLowerCase() === 'root' || env.DB_NAME !== 'db_std04_p01' || env.DB_PORT !== '3306') {
    throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'Database is not ready.');
  }
  if (!pool) pool = mysql.createPool({
    host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_NAME,
    user: env.DB_USER, password: env.DB_PASSWORD, charset: 'utf8mb4',
    timezone: 'Z', supportBigNumbers: true, bigNumberStrings: true,
    connectionLimit: 3, maxIdle: 2, idleTimeout: 30000,
    connectTimeout: 5000, queueLimit: 10, multipleStatements: false
  });
  return pool;
}

const apiRoutes = new Map([
  ['/api/v1/health', { methods: ['GET', 'HEAD'], handler: async () => ({ status: 'ok', scope: 'process' }) }],
  ['/api/v1/health/ready', { methods: ['GET', 'HEAD'], handler: async () => {
    try {
      const [rows] = await databasePool().execute({ sql: 'SELECT DATABASE() AS db', timeout: 5000 });
      if (rows[0].db !== 'db_std04_p01') throw new Error('Database mismatch');
      return { status: 'ok', scope: 'database-connection' };
    } catch {
      throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'Database is not ready.');
    }
  } }],
  ...['/api/v1/auth/register', '/api/v1/auth/login'].map((route) => [route, {
    methods: ['POST'], handler: async (req) => {
      await readJson(req);
      throw new ApiError(503, 'AUTH_NOT_READY', 'Account services are not enabled yet.');
    }
  }])
]);

async function handleApi(req, res, pathname) {
  const route = apiRoutes.get(pathname);
  if (!route) return fail(req, res, 404, 'NOT_FOUND', 'API route not found.');
  if (!route.methods.includes(req.method)) {
    res.setHeader('Allow', route.methods.join(', '));
    return fail(req, res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
  }
  try {
    const data = await route.handler(req);
    json(req, res, 200, { success: true, message: 'OK', data, meta: { request_id: res.getHeader('X-Request-Id') } });
  } catch (error) {
    if (!req.complete) res.setHeader('Connection', 'close');
    req.resume();
    if (error instanceof ApiError) return fail(req, res, error.status, error.code, error.message);
    console.error(JSON.stringify({ event: 'api_error', request_id: res.getHeader('X-Request-Id') }));
    fail(req, res, 500, 'INTERNAL_ERROR', 'Unable to process request.');
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Request-Id', randomUUID());

  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    return fail(req, res, 400, 'INVALID_URL', 'Invalid request URL.');
  }

  if (pathname === '/api/v1' || pathname.startsWith('/api/v1/')) {
    void handleApi(req, res, pathname);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.resume();
    res.writeHead(405, { Allow: 'GET, HEAD' });
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

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  // Drain HTTP before closing the pool so in-flight queries can finish.
  const deadline = setTimeout(() => {
    console.error(JSON.stringify({ event: 'shutdown_timeout' }));
    process.exit(1);
  }, 10000);
  server.close(async (error) => {
    try {
      if (error) throw error;
      if (pool) await pool.end();
    } catch {
      console.error(JSON.stringify({ event: 'shutdown_error' }));
      process.exitCode = 1;
    } finally {
      clearTimeout(deadline);
    }
  });
}

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, shutdown);
}
