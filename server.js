'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID, randomBytes, createHash, createHmac, timingSafeEqual, scrypt, createCipheriv, createDecipheriv } = require('node:crypto');
const { promisify, TextDecoder } = require('node:util');
const mysql = require('mysql2/promise');

try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const port = Number(process.env.PORT);
const host = process.env.HOST || '0.0.0.0';
const bootstrapRequested = process.argv.slice(2).some((arg) => arg.startsWith('--bootstrap-admin'));
if (!bootstrapRequested && (!Number.isInteger(port) || port < 1 || port > 65535)) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

// Explicit routes prevent requests from exposing source files or local secrets.
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ...['/login', '/register', '/account', '/admin'].map((route) => [route, ['index.html', 'text/html; charset=utf-8']]),
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
  constructor(status, code, message, errors = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

function json(req, res, status, payload) {
  if (res.destroyed || res.writableEnded) return;
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length });
  res.end(req.method === 'HEAD' ? undefined : body);
}

function fail(req, res, status, code, message, errors = {}) {
  json(req, res, status, { success: false, message, errors, code });
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
    let oversized = false;
    req.on('data', (chunk) => {
      if (oversized) return;
      size += chunk.length;
      if (size > limit) {
        oversized = true;
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

async function checkDatabaseConnection() {
  const dbPool = databasePool();
  await new Promise((resolve, reject) => {
    let settled = false;
    let connection;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      if (connection) {
        if (error) {
          // mysql2 destroy() ends the stream gracefully; also close a stalled transport.
          const transport = connection.connection.stream;
          connection.destroy();
          transport.destroy();
        } else connection.release();
      }
      if (error) reject(error);
      else resolve();
    };
    // One deadline covers both pool acquisition and execution; do not race pool.execute().
    const deadline = setTimeout(() => finish(new Error('Readiness deadline exceeded')), 5000);
    Promise.resolve().then(() => dbPool.getConnection()).then(async (acquired) => {
      // A timed-out queue entry may still receive a connection; return it without querying.
      if (settled) {
        acquired.release();
        return;
      }
      connection = acquired;
      const [rows] = await connection.execute({ sql: 'SELECT DATABASE() AS db', timeout: 5000 });
      if (rows[0]?.db !== 'db_std04_p01') throw new Error('Database mismatch');
      finish();
    }).catch(finish);
  });
}

const SCHOOL_NAME = '\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e15\u0e32\u0e01\u0e1e\u0e34\u0e17\u0e22\u0e32\u0e04\u0e21';
const FIRST_ADMIN_EMAIL = 'lilin742580@gmail.com';
const SESSION_SECONDS = 8 * 60 * 60;
const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
const USER_FIELDS = ['user_id', 'first_name', 'last_name', 'nickname', 'email', 'phone', 'member_type', 'student_code', 'permission_role', 'verification_status', 'rejection_reason'];
const USER_COLUMNS = USER_FIELDS.join(', ');
const STATUSES = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];
const csrfKey = randomBytes(32);
const scryptAsync = promisify(scrypt);
const HASH_N = 32768;
let hashWork = 0;
const dummyHash = `scrypt$${HASH_N}$8$1$${randomBytes(16).toString('hex')}$${randomBytes(32).toString('hex')}`;

function unavailable() {
  return new ApiError(503, 'ACCOUNT_UNAVAILABLE', 'Account services are unavailable.');
}

function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function digest(value) { return createHash('sha256').update(value).digest('hex'); }
function randomToken() { return randomBytes(32).toString('hex'); }
function validToken(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value); }
function redact(user) { return Object.fromEntries(USER_FIELDS.map((key) => [key, user[key]])); }
function isAdmin(user) { return user.permission_role === 'ADMIN'; }
function truth(value) { return value === true || value === 1 || value === '1'; }

function invalid(field, message = 'Invalid field value.') {
  throw new ApiError(422, 'VALIDATION_ERROR', 'Please check the submitted fields.', { [field]: message });
}

function fields(body, allowed, required = allowed) {
  if (Object.keys(body).some((key) => !allowed.includes(key))) invalid('form', 'Unexpected fields are not accepted.');
  for (const field of required) if (!Object.hasOwn(body, field)) invalid(field, 'This field is required.');
}

function text(value, field, max) {
  if (typeof value !== 'string' || !value || value !== value.trim() || [...value].length > max || /[\u0000-\u001f\u007f-\u009f]/u.test(value) || /[\ud800-\udfff]/u.test(value)) invalid(field);
  return value;
}

function emailValue(value) {
  text(value, 'email', 255);
  const email = value.toLowerCase();
  text(email, 'email', 255);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) invalid('email');
  return email;
}

function passwordValue(value, field = 'password', policy = true) {
  if (typeof value !== 'string' || /[\ud800-\udfff]/u.test(value) || [...value].length > 128 || [...value].length < (policy ? 12 : 1)) invalid(field, 'Use 12 to 128 Unicode code points for a new password.');
  return value;
}

function newPassword(body) {
  const password = passwordValue(body.password);
  if (body.password_confirmation !== password) invalid('password_confirmation', 'Passwords must match.');
  return password;
}

async function derive(password, salt, n) {
  // Reject instead of building an unbounded libuv work queue (about 32 MiB per job).
  if (hashWork >= 2) throw new ApiError(503, 'AUTH_BUSY', 'Please try again shortly.');
  hashWork += 1;
  try {
    return await scryptAsync(password, Buffer.from(salt, 'hex'), 32, { N: n, r: 8, p: 1, maxmem: 40 * 1024 * 1024 });
  } finally { hashWork -= 1; }
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, HASH_N);
  return `scrypt$${HASH_N}$8$1$${salt}$${key.toString('hex')}`;
}

async function verifyPassword(password, encoded) {
  const match = typeof encoded === 'string' && /^scrypt\$(16384|32768)\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(encoded);
  const parts = match || /^scrypt\$(\d+)\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(dummyHash);
  const actual = await derive(password, parts[2], Number(parts[1]));
  const matches = timingSafeEqual(actual, Buffer.from(parts[3], 'hex'));
  return !!match && matches;
}

const rateBuckets = new Map();
function rate(req, scope, identity = '') {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  // Trusted proxy support is not implemented; never trust forwarded headers.
  const ip = req.socket.remoteAddress || 'unknown';
  const keys = [[`${scope}:ip:${digest(ip)}`, scope === 'session' ? 6000 : 60]];
  if (identity) {
    if (scope === 'session') keys.push([`${scope}:identity:${digest(identity)}`, 120]);
    else {
      keys.push([`${scope}:pair:${digest(`${ip}\n${identity}`)}`, 10]);
      keys.push([`${scope}:identity:${digest(identity)}`, 30]);
    }
  }
  for (const [key, limit] of keys) {
    let bucket = rateBuckets.get(key);
    if (bucket && bucket.until <= now) { rateBuckets.delete(key); bucket = null; }
    if (!bucket) {
      if (rateBuckets.size >= 10000) {
        for (const [oldKey, old] of rateBuckets) if (old.until <= now) rateBuckets.delete(oldKey);
        if (rateBuckets.size >= 10000) throw new ApiError(429, 'RATE_LIMITED', 'Please try again later.');
      }
      bucket = { count: 0, until: now + windowMs };
      rateBuckets.set(key, bucket);
    }
    if (++bucket.count > limit) throw new ApiError(429, 'RATE_LIMITED', 'Please try again later.');
  }
}

function configuredOrigin() {
  if (!process.env.PUBLIC_ORIGIN) return null;
  try {
    const url = new URL(process.env.PUBLIC_ORIGIN);
    if (url.protocol !== 'https:' || url.origin !== process.env.PUBLIC_ORIGIN || url.username || url.password) return null;
    return url;
  } catch { return null; }
}

function requestSecurity(req, mutation = false) {
  const configured = configuredOrigin();
  let origin;
  let secure = false;
  if (configured) {
    origin = configured.origin;
    secure = true;
    if (req.headers.host !== configured.host) throw new ApiError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed.');
  } else {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') return null;
    if (process.env.PUBLIC_ORIGIN) return null;
    const hostHeader = req.headers.host;
    const peer = req.socket.remoteAddress;
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer)) return null;
    if (typeof hostHeader !== 'string' || !/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/i.test(hostHeader)) return null;
    origin = `http://${hostHeader}`;
  }
  if (req.headers['sec-fetch-site'] === 'cross-site' || (req.headers.origin !== undefined && req.headers.origin !== origin) || (mutation && req.headers.origin !== origin)) {
    throw new ApiError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed.');
  }
  return { origin, secure, prefix: secure ? '__Host-foundit-' : 'foundit-' };
}

function cookies(req) {
  const result = Object.create(null);
  for (const part of (req.headers.cookie || '').split(';')) {
    const at = part.indexOf('=');
    if (at < 0) continue;
    const key = part.slice(0, at).trim();
    if (Object.hasOwn(result, key)) throw new ApiError(400, 'INVALID_COOKIE', 'Invalid cookies.');
    result[key] = part.slice(at + 1).trim();
  }
  return result;
}

function setCookie(res, security, name, value, seconds) {
  const cookie = `${security.prefix}${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${security.secure ? '; Secure' : ''}`;
  const current = res.getHeader('Set-Cookie') || [];
  res.setHeader('Set-Cookie', [...current, cookie]);
}

function clearCookies(res, security) {
  for (const name of ['session', 'remember', 'csrf']) setCookie(res, security, name, '', 0);
}

function csrfSignature(nonce, sessionToken) {
  return createHmac('sha256', csrfKey).update(`${sessionToken || 'anonymous'}:${nonce}`).digest('hex');
}

function validCsrf(token, sessionToken) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return false;
  const [nonce, signature] = token.split('.');
  return equal(signature, csrfSignature(nonce, sessionToken));
}

function issueCsrf(res, security, sessionToken) {
  const nonce = randomToken();
  const token = `${nonce}.${csrfSignature(nonce, sessionToken)}`;
  setCookie(res, security, 'csrf', token, SESSION_SECONDS);
  return token;
}

function requireCsrf(req, security, jar) {
  const stored = jar[`${security.prefix}csrf`];
  const sessionToken = jar[`${security.prefix}session`];
  if (!validCsrf(stored, sessionToken) || !equal(stored, req.headers['x-csrf-token'])) {
    throw new ApiError(403, 'CSRF_REJECTED', 'Refresh the session before submitting this request.');
  }
}

async function acquireConnection() {
  const dbPool = databasePool();
  // Return late acquisitions even when the queue deadline has already expired.
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => { done = true; reject(unavailable()); }, 5000);
    dbPool.getConnection().then((connection) => {
      if (done) { connection.release(); return; }
      done = true;
      clearTimeout(timer);
      resolve(connection);
    }, () => { clearTimeout(timer); if (!done) { done = true; reject(unavailable()); } });
  });
}

async function query(db, sql, values = []) {
  const [rows] = await db.execute({ sql, timeout: 5000 }, values);
  return rows;
}

async function school(db, lock = false) {
  const id = process.env.INSTITUTION_ID;
  if (!id || !/^[1-9][0-9]{0,19}$/.test(id)) throw unavailable();
  const rows = await query(db, `SELECT institution_id FROM institutions WHERE institution_id = ? AND name = ? AND is_active = 1 LIMIT 1${lock ? ' FOR UPDATE' : ''}`, [id, SCHOOL_NAME]);
  if (!rows.length) throw unavailable();
  return String(rows[0].institution_id);
}

async function transaction(work, lockSchool = false) {
  let db;
  try {
    db = await acquireConnection();
    const rows = await query(db, 'SELECT DATABASE() AS db');
    if (rows[0]?.db !== 'db_std04_p01') throw unavailable();
    await query(db, 'START TRANSACTION');
    const institutionId = await school(db, lockSchool);
    const result = await work(db, institutionId);
    await query(db, 'COMMIT');
    return result;
  } catch (error) {
    if (db) {
      if (!error.fatal && error.code !== 'PROTOCOL_SEQUENCE_TIMEOUT') {
        try { await query(db, 'ROLLBACK'); } catch { /* Close the transport regardless. */ }
      }
      const transport = db.connection?.stream;
      db.destroy();
      if (transport && !transport.destroyed) transport.destroy();
      db = null;
    }
    if (error instanceof ApiError) throw error;
    if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'REGISTRATION_CONFLICT', 'Unable to register with these details.');
    throw unavailable();
  } finally { if (db) db.release(); }
}

async function audit(db, userId, action) {
  await query(db, 'INSERT INTO activity_logs (user_id, action, created_at) VALUES (?, ?, UTC_TIMESTAMP())', [userId, action]);
}

async function loadAuth(db, institutionId, jar, security, required = true) {
  const raw = jar[`${security.prefix}session`];
  let auth;
  if (validToken(raw)) {
    const rows = await query(db, 'SELECT session_id, user_id, mfa_verified, created_at FROM user_sessions WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1 FOR UPDATE', [digest(raw)]);
    if (rows.length) {
      const users = await query(db, `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE user_id = ? AND institution_id = ? LIMIT 1 FOR UPDATE`, [rows[0].user_id, institutionId]);
      if (users.length) {
        auth = { session: rows[0], user: users[0], raw };
        await query(db, 'UPDATE user_sessions SET last_seen_at = UTC_TIMESTAMP() WHERE session_id = ?', [rows[0].session_id]);
      }
    }
  }
  if (!auth && required) throw new ApiError(401, 'AUTH_REQUIRED', 'Please log in.');
  return auth;
}

async function flags(db, auth) {
  if (!isAdmin(auth.user)) return { mfa_required: false, mfa_enrolled: false };
  const rows = await query(db, 'SELECT confirmed FROM admin_mfa WHERE user_id = ? LIMIT 1', [auth.user.user_id]);
  const enrolled = !!rows.length && truth(rows[0].confirmed);
  return { mfa_required: !enrolled || !truth(auth.session.mfa_verified), mfa_enrolled: enrolled };
}

async function sessionData(db, auth) {
  return { authenticated: true, user: redact(auth.user), ...await flags(db, auth), auth_available: true };
}

async function newSession(db, userId, restored = false) {
  // The authenticated token hash binds this purpose byte: remember-restored sessions
  // may use TOTP, but recovery codes require a fresh password login (248 random bits).
  const raw = `${restored ? 'b1' : 'a1'}${randomBytes(31).toString('hex')}`;
  await query(db, 'INSERT INTO user_sessions (user_id, token_hash, expires_at, mfa_verified, created_at, last_seen_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR), 0, UTC_TIMESTAMP(), UTC_TIMESTAMP())', [userId, digest(raw)]);
  return raw;
}

async function revokePresented(db, jar, security) {
  for (const [name, table] of [['session', 'user_sessions'], ['remember', 'remember_tokens']]) {
    const raw = jar[`${security.prefix}${name}`];
    if (validToken(raw)) await query(db, `DELETE FROM ${table} WHERE token_hash = ?`, [digest(raw)]);
  }
}

async function revokeUser(db, userId) {
  await query(db, 'DELETE FROM user_sessions WHERE user_id = ?', [userId]);
  await query(db, 'DELETE FROM remember_tokens WHERE user_id = ?', [userId]);
}

async function newRemember(db, userId) {
  const raw = randomToken();
  await query(db, 'INSERT INTO remember_tokens (user_id, token_hash, expires_at, created_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY), UTC_TIMESTAMP())', [userId, digest(raw)]);
  return raw;
}

async function restoreSession(db, institutionId, jar, security) {
  const raw = jar[`${security.prefix}remember`];
  if (!validToken(raw)) return null;
  const rows = await query(db, 'SELECT remember_id, user_id, expires_at FROM remember_tokens WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1 FOR UPDATE', [digest(raw)]);
  if (!rows.length) return null;
  const users = await query(db, `SELECT ${USER_COLUMNS} FROM users WHERE user_id = ? AND institution_id = ? LIMIT 1 FOR UPDATE`, [rows[0].user_id, institutionId]);
  if (!users.length) return null;
  const user = users[0];
  await query(db, 'DELETE FROM remember_tokens WHERE remember_id = ?', [rows[0].remember_id]);
  const remember = randomToken();
  // Preserve the original absolute 30-day deadline during rotation.
  await query(db, 'INSERT INTO remember_tokens (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, UTC_TIMESTAMP())', [user.user_id, digest(remember), rows[0].expires_at]);
  const session = await newSession(db, user.user_id, true);
  await audit(db, user.user_id, 'REMEMBER_RESTORED');
  return { auth: { user, session: { mfa_verified: 0 }, raw: session }, remember, rememberExpires: rows[0].expires_at };
}

function mfaKey() {
  const key = process.env.MFA_ENCRYPTION_KEY;
  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) throw new ApiError(503, 'MFA_UNAVAILABLE', 'Administrator authentication is unavailable.');
  return Buffer.from(key, 'hex');
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32(bytes) {
  let bits = 0;
  let value = 0;
  let result = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { result += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits) result += BASE32[(value << (5 - bits)) & 31];
  return result;
}

function decode32(secret) {
  if (!/^[A-Z2-7]{32}$/.test(secret)) throw unavailable();
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of secret) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(bytes);
}

function encryptSecret(secret, userId, sessionToken) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', mfaKey(), iv);
  cipher.setAAD(Buffer.from(`foundit:p01:admin-mfa:v1:${userId}${sessionToken === undefined ? '' : `:enrollment:${sessionToken}`}`));
  const ciphertext = Buffer.concat([cipher.update(secret, 'ascii'), cipher.final()]);
  return `v1:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${ciphertext.toString('hex')}`;
}

function decryptSecret(encoded, userId, sessionToken) {
  const key = mfaKey();
  const failure = () => sessionToken === undefined ? unavailable() : new ApiError(409, 'MFA_SETUP_REQUIRED', 'Start an unconfirmed MFA enrollment first.');
  if (typeof encoded !== 'string' || !/^v1:[a-f0-9]{24}:[a-f0-9]{32}:[a-f0-9]{64}$/.test(encoded)) throw failure();
  try {
    const [, iv, tag, ciphertext] = encoded.split(':');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAAD(Buffer.from(`foundit:p01:admin-mfa:v1:${userId}${sessionToken === undefined ? '' : `:enrollment:${sessionToken}`}`));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]).toString('ascii');
  } catch { throw failure(); }
}

function totp(secret, counter) {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac('sha1', decode32(secret)).update(bytes).digest();
  const offset = mac[mac.length - 1] & 15;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
}

function totpCounter(secret, code, lastCounter, now = Date.now()) {
  if (typeof code !== 'string' || !/^[0-9]{6}$/.test(code)) return null;
  const current = Math.floor(now / 30000);
  let accepted = null;
  for (let offset = -1; offset <= 1; offset += 1) {
    const counter = current + offset;
    if (counter >= 0 && equal(totp(secret, counter), code) && BigInt(counter) > BigInt(lastCounter)) accepted = counter;
  }
  return accepted;
}

function recoveryHash(userId, code) { return digest(`foundit:p01:recovery:${userId}:${code}`); }
function recoveryCodes() { return Array.from({ length: 10 }, () => randomBytes(16).toString('hex')); }

function adminIdentity(auth) {
  if (!isAdmin(auth.user) || auth.user.verification_status !== 'VERIFIED') throw new ApiError(403, 'ADMIN_REQUIRED', 'Verified administrator access is required.');
  mfaKey();
}

async function adminAccess(db, auth) {
  adminIdentity(auth);
  const state = await flags(db, auth);
  if (state.mfa_required) throw new ApiError(403, 'MFA_REQUIRED', 'Complete administrator authentication.');
}

function requireFreshPasswordSession(auth) {
  const created = auth.session.created_at;
  const age = Date.now() - (created == null ? NaN : new Date(created).getTime());
  if (!auth.raw.startsWith('a1') || !Number.isFinite(age) || age < 0 || age > 10 * 60 * 1000) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Please log in again with your password before enrolling MFA.');
  }
}

async function consumeMfa(db, userId, code, passwordSession) {
  mfaKey();
  const rows = await query(db, 'SELECT secret_encrypted, confirmed, last_counter, recovery_hashes FROM admin_mfa WHERE user_id = ? LIMIT 1 FOR UPDATE', [userId]);
  if (!rows.length || !truth(rows[0].confirmed)) throw new ApiError(403, 'MFA_REQUIRED', 'Complete administrator authentication.');
  const row = rows[0];
  const counter = totpCounter(decryptSecret(row.secret_encrypted, userId), code, row.last_counter);
  if (counter !== null) {
    await query(db, 'UPDATE admin_mfa SET last_counter = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ?', [counter, userId]);
    return;
  }
  if (!passwordSession) throw new ApiError(401, 'MFA_INVALID', 'Use a fresh password login before using a recovery code.');
  let hashes;
  try { hashes = typeof row.recovery_hashes === 'string' ? JSON.parse(row.recovery_hashes) : row.recovery_hashes; } catch { throw unavailable(); }
  if (!Array.isArray(hashes) || hashes.length > 10 || hashes.some((hash) => !validToken(hash))) throw unavailable();
  const candidate = typeof code === 'string' && /^[a-f0-9]{32}$/.test(code) ? recoveryHash(userId, code) : digest('invalid recovery');
  let index = -1;
  hashes.forEach((hash, at) => { if (equal(hash, candidate)) index = at; });
  if (index < 0) throw new ApiError(401, 'MFA_INVALID', 'Authentication code is invalid or already used.');
  hashes.splice(index, 1);
  await query(db, 'UPDATE admin_mfa SET recovery_hashes = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ?', [JSON.stringify(hashes), userId]);
}

async function getSession(req, res, security, jar) {
  const session = jar[`${security.prefix}session`];
  const remember = jar[`${security.prefix}remember`];
  const csrf = jar[`${security.prefix}csrf`];
  const identity = validToken(session) ? `session:${session}` : validToken(remember) ? `remember:${remember}` : validCsrf(csrf) ? `anonymous:${csrf}` : '';
  rate(req, 'session', identity);
  const result = await transaction(async (db, institutionId) => {
    let auth = await loadAuth(db, institutionId, jar, security, false);
    let restored;
    if (!auth) { restored = await restoreSession(db, institutionId, jar, security); auth = restored?.auth; }
    return { data: auth ? await sessionData(db, auth) : { authenticated: false, auth_available: true }, raw: auth?.raw, restored };
  });
  if (result.restored) {
    setCookie(res, security, 'session', result.raw, SESSION_SECONDS);
    const remaining = Math.max(0, Math.floor((new Date(result.restored.rememberExpires).getTime() - Date.now()) / 1000));
    setCookie(res, security, 'remember', result.restored.remember, Math.min(REMEMBER_SECONDS, remaining));
  } else if (!result.raw && jar[`${security.prefix}session`]) setCookie(res, security, 'session', '', 0);
  const previous = jar[`${security.prefix}csrf`];
  result.data.csrf_token = !result.restored && validCsrf(previous, result.raw) ? previous : issueCsrf(res, security, result.raw);
  return result.data;
}

async function register(req, res, security, jar, body) {
  fields(body, ['first_name', 'last_name', 'nickname', 'email', 'phone', 'student_code', 'member_type', 'password', 'password_confirmation'], ['first_name', 'last_name', 'nickname', 'email', 'phone', 'member_type', 'password', 'password_confirmation']);
  const email = emailValue(body.email);
  rate(req, 'register', email);
  const first = text(body.first_name, 'first_name', 100);
  const last = text(body.last_name, 'last_name', 100);
  const nickname = text(body.nickname, 'nickname', 50);
  if (typeof body.phone !== 'string' || !/^[0-9]{10}$/.test(body.phone)) invalid('phone');
  if (!['STUDENT', 'TEACHER', 'STAFF'].includes(body.member_type)) invalid('member_type');
  const student = body.student_code ?? null;
  if (body.member_type === 'STUDENT' ? typeof student !== 'string' || !/^[0-9]{5}$/.test(student) : student !== null) invalid('student_code');
  const password = newPassword(body);
  const passwordHash = await hashPassword(password);
  const result = await transaction(async (db, institutionId) => {
    const inserted = await query(db, "INSERT INTO users (institution_id, first_name, last_name, nickname, email, student_code, phone, member_type, permission_role, password_hash, verification_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MEMBER', ?, 'PENDING', UTC_TIMESTAMP(), UTC_TIMESTAMP())", [institutionId, first, last, nickname, email, student, body.phone, body.member_type, passwordHash]);
    const id = String(inserted.insertId);
    await revokePresented(db, jar, security);
    const raw = await newSession(db, id);
    await audit(db, id, 'REGISTER');
    const users = await query(db, `SELECT ${USER_COLUMNS} FROM users WHERE user_id = ? AND institution_id = ? LIMIT 1`, [id, institutionId]);
    return { raw, data: { user: redact(users[0]), mfa_required: false, mfa_enrolled: false } };
  });
  setCookie(res, security, 'session', result.raw, SESSION_SECONDS);
  setCookie(res, security, 'remember', '', 0);
  result.data.csrf_token = issueCsrf(res, security, result.raw);
  return result.data;
}

async function login(req, res, security, jar, body) {
  fields(body, ['email', 'password', 'remember_me']);
  const email = emailValue(body.email);
  if (typeof body.remember_me !== 'boolean') invalid('remember_me');
  rate(req, 'login', email);
  const password = passwordValue(body.password, 'password', false);
  // Hash outside row locks; recheck the exact hash after acquiring the user lock.
  const candidate = await transaction(async (db, institutionId) => {
    const rows = await query(db, 'SELECT user_id, password_hash FROM users WHERE email = ? AND institution_id = ? LIMIT 1', [email, institutionId]);
    return rows[0];
  });
  const matched = await verifyPassword(password, candidate?.password_hash);
  if (!matched || !candidate) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  const result = await transaction(async (db, institutionId) => {
    const rows = await query(db, `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE user_id = ? AND institution_id = ? LIMIT 1 FOR UPDATE`, [candidate.user_id, institutionId]);
    const user = rows[0];
    if (!user || !equal(user.password_hash, candidate.password_hash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    if (isAdmin(user)) mfaKey();
    await revokePresented(db, jar, security);
    const raw = await newSession(db, user.user_id);
    const remember = body.remember_me ? await newRemember(db, user.user_id) : null;
    await query(db, 'UPDATE users SET last_login_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP() WHERE user_id = ?', [user.user_id]);
    await audit(db, user.user_id, 'LOGIN');
    return { raw, remember, data: await sessionData(db, { user, session: { mfa_verified: 0 } }) };
  });
  setCookie(res, security, 'session', result.raw, SESSION_SECONDS);
  setCookie(res, security, 'remember', result.remember || '', result.remember ? REMEMBER_SECONDS : 0);
  result.data.csrf_token = issueCsrf(res, security, result.raw);
  return result.data;
}

async function logout(req, res, security, jar, body) {
  fields(body, []);
  await transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security, false);
    await revokePresented(db, jar, security);
    if (auth) await audit(db, auth.user.user_id, 'LOGOUT');
  });
  clearCookies(res, security);
  return { authenticated: false, csrf_token: issueCsrf(res, security) };
}

async function profile(req, res, security, jar, body) {
  if (req.method === 'PATCH') {
    fields(body, ['first_name', 'last_name', 'nickname', 'phone']);
    text(body.first_name, 'first_name', 100);
    text(body.last_name, 'last_name', 100);
    text(body.nickname, 'nickname', 50);
    if (typeof body.phone !== 'string' || !/^[0-9]{10}$/.test(body.phone)) invalid('phone');
  }
  return transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    if (req.method === 'PATCH') {
      await query(db, 'UPDATE users SET first_name = ?, last_name = ?, nickname = ?, phone = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ? AND institution_id = ?', [body.first_name, body.last_name, body.nickname, body.phone, auth.user.user_id, institutionId]);
      Object.assign(auth.user, body);
      await audit(db, auth.user.user_id, 'PROFILE_UPDATED');
    }
    return redact(auth.user);
  });
}

async function changePassword(req, res, security, jar, body) {
  const required = ['current_password', 'password', 'password_confirmation'];
  fields(body, [...required, 'code'], required);
  rate(req, 'password');
  const current = passwordValue(body.current_password, 'current_password', false);
  const password = newPassword(body);
  const snapshot = await transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    if (isAdmin(auth.user)) {
      await adminAccess(db, auth);
      text(body.code, 'code', 64);
    } else fields(body, required);
    return auth.user;
  });
  rate(req, 'password-user', String(snapshot.user_id));
  if (!await verifyPassword(current, snapshot.password_hash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect.');
  const passwordHash = await hashPassword(password);
  await transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    if (isAdmin(auth.user)) await adminAccess(db, auth);
    if (String(snapshot.user_id) !== String(auth.user.user_id) || !equal(snapshot.password_hash, auth.user.password_hash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect.');
    if (isAdmin(auth.user)) {
      text(body.code, 'code', 64);
      rate(req, 'mfa-user', String(auth.user.user_id));
      await consumeMfa(db, auth.user.user_id, body.code, auth.raw.startsWith('a1'));
    } else fields(body, required);
    await query(db, 'UPDATE users SET password_hash = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ? AND institution_id = ?', [passwordHash, auth.user.user_id, institutionId]);
    await revokeUser(db, auth.user.user_id);
    await audit(db, auth.user.user_id, 'PASSWORD_CHANGED');
  });
  clearCookies(res, security);
  return { authenticated: false, csrf_token: issueCsrf(res, security) };
}

async function mfaSetup(req, res, security, jar, body) {
  fields(body, []);
  rate(req, 'mfa-setup');
  mfaKey();
  return transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    adminIdentity(auth);
    requireFreshPasswordSession(auth);
    rate(req, 'mfa-setup-user', String(auth.user.user_id));
    if (truth(auth.session.mfa_verified)) throw new ApiError(409, 'MFA_ALREADY_VERIFIED', 'Administrator authentication is already complete.');
    const rows = await query(db, 'SELECT confirmed FROM admin_mfa WHERE user_id = ? LIMIT 1 FOR UPDATE', [auth.user.user_id]);
    if (rows.length && truth(rows[0].confirmed)) throw new ApiError(409, 'MFA_ALREADY_ENROLLED', 'Multi-factor authentication is already enrolled.');
    const secret = base32(randomBytes(20));
    const encrypted = encryptSecret(secret, auth.user.user_id, auth.raw);
    if (rows.length) {
      await query(db, 'UPDATE admin_mfa SET secret_encrypted = ?, confirmed = 0, last_counter = -1, recovery_hashes = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ?', [encrypted, '[]', auth.user.user_id]);
    } else {
      await query(db, 'INSERT INTO admin_mfa (user_id, secret_encrypted, confirmed, last_counter, recovery_hashes, created_at, updated_at) VALUES (?, ?, 0, -1, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())', [auth.user.user_id, encrypted, '[]']);
    }
    await audit(db, auth.user.user_id, 'MFA_SETUP');
    return { secret, otpauth_uri: `otpauth://totp/${encodeURIComponent(`FoundIt:${auth.user.email}`)}?secret=${secret}&issuer=FoundIt&algorithm=SHA1&digits=6&period=30` };
  });
}

async function mfaConfirm(req, res, security, jar, body) {
  fields(body, ['code']);
  if (typeof body.code !== 'string' || !/^[0-9]{6}$/.test(body.code)) invalid('code');
  rate(req, 'mfa');
  mfaKey();
  return transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    adminIdentity(auth);
    requireFreshPasswordSession(auth);
    rate(req, 'mfa-user', String(auth.user.user_id));
    const rows = await query(db, 'SELECT secret_encrypted, confirmed, last_counter FROM admin_mfa WHERE user_id = ? LIMIT 1 FOR UPDATE', [auth.user.user_id]);
    if (!rows.length || truth(rows[0].confirmed) || truth(auth.session.mfa_verified)) throw new ApiError(409, 'MFA_SETUP_REQUIRED', 'Start an unconfirmed MFA enrollment first.');
    const secret = decryptSecret(rows[0].secret_encrypted, auth.user.user_id, auth.raw);
    const counter = totpCounter(secret, body.code, rows[0].last_counter);
    if (counter === null) throw new ApiError(401, 'MFA_INVALID', 'Authentication code is invalid or already used.');
    const codes = recoveryCodes();
    await query(db, 'UPDATE admin_mfa SET secret_encrypted = ?, confirmed = 1, last_counter = ?, recovery_hashes = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ?', [encryptSecret(secret, auth.user.user_id), counter, JSON.stringify(codes.map((code) => recoveryHash(auth.user.user_id, code))), auth.user.user_id]);
    await query(db, 'UPDATE user_sessions SET mfa_verified = 1 WHERE session_id = ?', [auth.session.session_id]);
    await audit(db, auth.user.user_id, 'MFA_CONFIRMED');
    return { recovery_codes: codes, mfa_required: false, mfa_enrolled: true };
  });
}

async function mfaVerify(req, res, security, jar, body) {
  fields(body, ['code']);
  text(body.code, 'code', 64);
  rate(req, 'mfa');
  mfaKey();
  return transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    adminIdentity(auth);
    rate(req, 'mfa-user', String(auth.user.user_id));
    await consumeMfa(db, auth.user.user_id, body.code, auth.raw.startsWith('a1'));
    await query(db, 'UPDATE user_sessions SET mfa_verified = 1 WHERE session_id = ?', [auth.session.session_id]);
    await audit(db, auth.user.user_id, 'MFA_VERIFIED');
    return { mfa_required: false, mfa_enrolled: true };
  });
}

async function adminUsers(req, res, security, jar) {
  rate(req, 'admin-read');
  const params = new URL(req.url, 'http://localhost').searchParams;
  if ([...params.keys()].some((key) => key !== 'status') || params.getAll('status').length > 1) invalid('status');
  const status = params.get('status');
  if (status !== null && !STATUSES.includes(status)) invalid('status');
  return transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    await adminAccess(db, auth);
    const clause = status ? ' AND verification_status = ?' : '';
    const values = status ? [institutionId, status] : [institutionId];
    const users = await query(db, `SELECT ${USER_COLUMNS} FROM users WHERE institution_id = ?${clause} ORDER BY user_id LIMIT 100`, values);
    const counts = await query(db, `SELECT COUNT(*) AS total FROM users WHERE institution_id = ?${clause}`, values);
    return { users: users.map(redact), total: Number(counts[0].total) };
  });
}

async function adminStatus(req, res, security, jar, body, targetId) {
  fields(body, ['verification_status', 'reason', 'current_password', 'code'], ['verification_status', 'current_password', 'code']);
  if (!['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(body.verification_status)) invalid('verification_status');
  let reason = body.reason ?? null;
  if (body.verification_status !== 'VERIFIED') reason = text(reason, 'reason', 1000);
  else if (reason !== null && reason !== '') text(reason, 'reason', 1000);
  const current = passwordValue(body.current_password, 'current_password', false);
  text(body.code, 'code', 64);
  rate(req, 'admin-change');
  const snapshot = await transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    await adminAccess(db, auth);
    rate(req, 'admin-change-user', String(auth.user.user_id));
    return auth.user;
  });
  if (!await verifyPassword(current, snapshot.password_hash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Administrator authentication failed.');
  // Lock the school BEFORE actor/target rows to serialize last-admin decisions.
  return transaction(async (db, institutionId) => {
    const auth = await loadAuth(db, institutionId, jar, security);
    await adminAccess(db, auth);
    if (String(snapshot.user_id) !== String(auth.user.user_id) || !equal(snapshot.password_hash, auth.user.password_hash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Administrator authentication failed.');
    const targets = await query(db, `SELECT ${USER_COLUMNS} FROM users WHERE user_id = ? AND institution_id = ? LIMIT 1 FOR UPDATE`, [targetId, institutionId]);
    if (!targets.length) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
    const target = targets[0];
    if (isAdmin(target) && target.verification_status === 'VERIFIED' && body.verification_status !== 'VERIFIED') {
      const admins = await query(db, "SELECT user_id FROM users WHERE institution_id = ? AND permission_role = 'ADMIN' AND verification_status = 'VERIFIED' ORDER BY user_id LIMIT 2 FOR UPDATE", [institutionId]);
      if (admins.length < 2) throw new ApiError(409, 'LAST_ADMIN', 'The last verified administrator cannot be disabled.');
    }
    await consumeMfa(db, auth.user.user_id, body.code, auth.raw.startsWith('a1'));
    const rejectionReason = body.verification_status === 'VERIFIED' ? null : reason;
    await query(db, 'UPDATE users SET verification_status = ?, rejection_reason = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ? AND institution_id = ?', [body.verification_status, rejectionReason, targetId, institutionId]);
    if (body.verification_status !== 'VERIFIED') await revokeUser(db, targetId);
    await audit(db, auth.user.user_id, `ADMIN_STATUS_${body.verification_status}:USER_${targetId}`);
    target.verification_status = body.verification_status;
    target.rejection_reason = rejectionReason;
    return redact(target);
  }, true);
}

async function bootstrapAdmin() {
  if (process.argv.length !== 3 || process.argv[2] !== '--bootstrap-admin' || process.env.FIRST_ADMIN_EMAIL !== FIRST_ADMIN_EMAIL) throw unavailable();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
  passwordValue(password);
  mfaKey();
  const passwordHash = await hashPassword(password);
  await transaction(async (db, institutionId) => {
    const admins = await query(db, "SELECT user_id FROM users WHERE permission_role = 'ADMIN' LIMIT 1 FOR UPDATE");
    if (admins.length) throw new ApiError(409, 'BOOTSTRAP_REFUSED', 'Administrator bootstrap refused.');
    const existing = await query(db, 'SELECT user_id FROM users WHERE email = ? LIMIT 1 FOR UPDATE', [FIRST_ADMIN_EMAIL]);
    if (existing.length) throw new ApiError(409, 'BOOTSTRAP_REFUSED', 'Administrator bootstrap refused.');
    // Schema requires these fields; owner must deliberately supply actual account details.
    const first = text(process.env.BOOTSTRAP_ADMIN_FIRST_NAME, 'first_name', 100);
    const last = text(process.env.BOOTSTRAP_ADMIN_LAST_NAME, 'last_name', 100);
    const nickname = text(process.env.BOOTSTRAP_ADMIN_NICKNAME, 'nickname', 50);
    const phone = process.env.BOOTSTRAP_ADMIN_PHONE;
    if (typeof phone !== 'string' || !/^[0-9]{10}$/.test(phone)) invalid('phone');
    const inserted = await query(db, "INSERT INTO users (institution_id, first_name, last_name, nickname, email, student_code, phone, member_type, permission_role, password_hash, verification_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, ?, 'STAFF', 'ADMIN', ?, 'VERIFIED', UTC_TIMESTAMP(), UTC_TIMESTAMP())", [institutionId, first, last, nickname, FIRST_ADMIN_EMAIL, phone, passwordHash]);
    await audit(db, String(inserted.insertId), 'ADMIN_BOOTSTRAPPED');
  }, true);
}

const apiRoutes = new Map([
  ['/api/v1/health', { methods: ['GET', 'HEAD'], public: true, handler: async () => ({ status: 'ok', scope: 'process' }) }],
  ['/api/v1/health/ready', { methods: ['GET', 'HEAD'], public: true, handler: async () => {
    try {
      await checkDatabaseConnection();
      return { status: 'ok', scope: 'database-connection' };
    } catch {
      throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'Database is not ready.');
    }
  } }],
  ['/api/v1/auth/session', { methods: ['GET'], handler: getSession }],
  ['/api/v1/auth/register', { methods: ['POST'], handler: register }],
  ['/api/v1/auth/login', { methods: ['POST'], handler: login }],
  ['/api/v1/auth/logout', { methods: ['POST'], handler: logout }],
  ['/api/v1/profile', { methods: ['GET', 'PATCH'], handler: profile }],
  ['/api/v1/auth/change-password', { methods: ['POST'], handler: changePassword }],
  ['/api/v1/auth/mfa/setup', { methods: ['POST'], handler: mfaSetup }],
  ['/api/v1/auth/mfa/confirm', { methods: ['POST'], handler: mfaConfirm }],
  ['/api/v1/auth/mfa/verify', { methods: ['POST'], handler: mfaVerify }],
  ['/api/v1/admin/users', { methods: ['GET'], handler: adminUsers }],
  ...['forgot-password', 'reset-password'].map((route) => [`/api/v1/auth/${route}`, { methods: ['POST'], emailDisabled: true }])
]);

async function handleApi(req, res, pathname) {
  const target = /^\/api\/v1\/admin\/users\/([1-9][0-9]{0,19})\/status$/.exec(pathname);
  const route = target ? { methods: ['PATCH'], handler: adminStatus } : apiRoutes.get(pathname);
  if (!route) { req.resume(); return fail(req, res, 404, 'NOT_FOUND', 'API route not found.'); }
  if (!route.methods.includes(req.method)) {
    req.resume();
    res.setHeader('Allow', route.methods.join(', '));
    return fail(req, res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
  }
  try {
    let data;
    if (route.public) data = await route.handler(req);
    else {
      const mutation = req.method === 'POST' || req.method === 'PATCH';
      const security = requestSecurity(req, mutation);
      if (!security) {
        if (route.emailDisabled) throw new ApiError(503, 'EMAIL_NOT_CONFIGURED', 'Email-based password recovery is not configured.');
        if (pathname !== '/api/v1/auth/session') throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Authentication requires a configured HTTPS PUBLIC_ORIGIN.');
        data = { authenticated: false, csrf_token: null, auth_available: false, setup_message: 'Configure PUBLIC_ORIGIN as an HTTPS origin before enabling authentication.' };
      } else {
        const jar = cookies(req);
        // Reject transport/origin/CSRF before parsing a credential-bearing body or hashing.
        if (mutation) requireCsrf(req, security, jar);
        if (route.emailDisabled) throw new ApiError(503, 'EMAIL_NOT_CONFIGURED', 'Email-based password recovery is not configured.');
        if (mutation) rate(req, 'mutation');
        const body = mutation ? await readJson(req) : undefined;
        data = await route.handler(req, res, security, jar, body, target?.[1]);
      }
    }
    json(req, res, 200, { success: true, message: 'OK', data, meta: { request_id: res.getHeader('X-Request-Id') } });
  } catch (error) {
    if (!req.complete) res.setHeader('Connection', 'close');
    req.resume();
    if (error instanceof ApiError) return fail(req, res, error.status, error.code, error.message, error.errors);
    console.error(JSON.stringify({ event: 'api_error', request_id: res.getHeader('X-Request-Id') }));
    fail(req, res, 503, 'ACCOUNT_UNAVAILABLE', 'Account services are unavailable.');
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
server.on('error', () => {
  console.error(JSON.stringify({ event: 'server_error' }));
  process.exitCode = 1;
});
if (bootstrapRequested) {
  // CLI is deliberately separate: no HTTP listener, migrations, or public promotion.
  void (async () => {
    try {
      await bootstrapAdmin();
      console.log(JSON.stringify({ event: 'admin_bootstrap_complete', mfa_required: true }));
    } catch {
      console.error(JSON.stringify({ event: 'admin_bootstrap_refused' }));
      process.exitCode = 1;
    } finally {
      if (pool) {
        try { await pool.end(); } catch { process.exitCode = 1; }
      }
    }
  })();
} else {
  server.listen(port, host, () => {
    console.log(`FoundIt listening on port ${port}`);
  });
}

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
