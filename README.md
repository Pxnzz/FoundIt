# FoundIt

Starter for confirmed project `p01`, room `r0001`, account `std04`.

## Runtime

- Node.js 22.13 or later, CommonJS, entry point `server.js`.
- Pinned production dependency: mysql2 3.24.6. Install with lifecycle scripts disabled.
- Run `npm start`; run syntax checks with `npm run check`.
- Local address: http://localhost:31041. The platform can override PORT through its managed environment.
- Local `.env` is loaded with Node's built-in loader; existing process environment values take precedence.

## Files

Application source is limited to `package.json`, `server.js`, `public/index.html`, `public/style.css`, and `public/index.js`.
`.env` is local/managed configuration and must never be committed or uploaded as source. `.gitignore` excludes it and `node_modules`.

`GET /api/health` retains the frontend's process-only health contract. `/api/v1/health` adds the standard envelope; `/api/v1/health/ready` verifies the configured p01 database connection, not schema or feature completeness. Static serving uses an explicit allowlist; the project root is never served.

Versioned APIs return generated request IDs and consistent success/error envelopes. JSON inputs must be UTF-8 objects, at most 16 KiB. Register/login routes intentionally return `503 AUTH_NOT_READY`; real authentication and product workflows are not implemented.

## Database

The confirmed project database is `db_std04_p01`, learner owner `std04`, MariaDB port `3306`. The server runtime uses the platform-provisioned managed credentials, which can differ from the learner connection.

The existing local `.env` has been validated without exposing values. Required settings are `PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Use only this project's confirmed LAN/Tailscale connection locally; do not substitute localhost or overwrite server-managed credentials with learner values.

Foundation tables `institutions`, `users`, `categories` were created explicitly using the owner account after verifying `SELECT DATABASE()`. Migration revision 1 was submitted separately through the Database portal; Apply there was disabled, so the direct owner execution is not a platform applied-history entry. No migrations run on application startup. Keep `migrations.sql` out of Git and preserve its accepted content append-only. Future UPDATE queries must explicitly set `updated_at = CURRENT_TIMESTAMP`.

See `docs/phase-2-backend-foundation.md` for test evidence, policy mapping and remaining limitations.

## Images

`public/images/` is reserved for project images. Image upload and serving are not implemented yet. Before enabling them, decode and re-encode uploaded images, strip metadata, and convert animations to their first frame. Do not add raw image upload endpoints.

## Before Deployment

Policy revision 2: `bef855c538ab3b91967a18c7dcc5cbb73a3cb55c7c0119187c17816d769529a7`.

- Recheck backend and all five required application files; each code file must be at most 1 MiB.
- Configure the required managed environment without including `.env` in Git/source artifacts.
- Run platform Semgrep, OSV, and Gitleaks scans; high severity findings block deployment. Results expire after 24 hours.
- Runtime isolation, non-root execution, resource limits (192 MiB), and ownership separation are platform responsibilities and must be verified there.
- Public publication is disabled for this room. This starter does not deploy or enable a public route.
