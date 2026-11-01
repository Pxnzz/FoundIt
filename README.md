# FoundIt

Starter for confirmed project `p01`, room `r0001`, account `std04`.

## Runtime

- Node.js 22.13 or later, CommonJS, entry point `server.js`.
- No production dependencies or installation lifecycle scripts.
- Run `npm start`; run syntax checks with `npm run check`.
- Local address: http://localhost:31041. The platform can override PORT through its managed environment.
- Local `.env` is loaded with Node's built-in loader; existing process environment values take precedence.

## Files

Application source is limited to `package.json`, `server.js`, `public/index.html`, `public/style.css`, and `public/index.js`.
`.env` is local/managed configuration and must never be committed or uploaded as source. `.gitignore` excludes it and `node_modules`.

`GET /api/health` reports process health only, not database connectivity. Static serving uses an explicit allowlist; the project root is never served.

## Database

The confirmed project database is `db_std04_p01`, user `std04`, MariaDB port `3306`.
`DB_HOST` and `DB_PASSWORD` are intentionally blank in local `.env`. Obtain the project's confirmed LAN/Tailscale host and password from the platform; enter secrets locally or in managed environment settings only. Do not use localhost as a substitute for the remote database host.
No database connection or migration execution is implemented. Submit append-only migrations through the platform database page only.

## Images

`public/images/` is reserved for project images. Image upload and serving are not implemented yet. Before enabling them, decode and re-encode uploaded images, strip metadata, and convert animations to their first frame. Do not add raw image upload endpoints.

## Before Deployment

Policy revision 2: `bef855c538ab3b91967a18c7dcc5cbb73a3cb55c7c0119187c17816d769529a7`.

- Recheck backend and all five required application files; each code file must be at most 1 MiB.
- Configure the required managed environment without including `.env` in Git/source artifacts.
- Run platform Semgrep, OSV, and Gitleaks scans; high severity findings block deployment. Results expire after 24 hours.
- Runtime isolation, non-root execution, resource limits (192 MiB), and ownership separation are platform responsibilities and must be verified there.
- Public publication is disabled for this room. This starter does not deploy or enable a public route.
