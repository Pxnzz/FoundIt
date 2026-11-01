# Backend Foundation Evidence - 2026-11-01

## Scope and stage

Confirmed project: room1 / std04 / p01, repository Pxnzz/FoundIt, branch main. User approved rebuilding from the actual workspace and commit/push/deploy. Node/CommonJS maps the PHP/PDO implementation to room policy; spec.md remains unchanged.

This is foundation integration, not completion of the FoundIt product. Authentication, report/claim/return flows, admin MFA and private evidence storage are NOT implemented or accepted. Register/login endpoints deliberately return 503 AUTH_NOT_READY after JSON validation. No new UI or CRUD feature is claimed.

## Code and environment

- server.js: versioned router, JSON success/error envelopes, generated request IDs, method allowlists, strict UTF-8 object JSON, 16 KiB body limit, explicit static allowlist, safe error messages, bounded lazy mysql2 pool.
- mysql2 3.24.6 pinned; installation used --ignore-scripts. A local ignored package-lock.json was generated only for dependency audit; it is not deployed.
- Local .env checks confirmed the assigned PORT, NODE_ENV and owner DB connection without printing credentials. Existing values were preserved. Environment variables take precedence over the local file.
- Managed server environment was inspected privately: production NODE_ENV, correct PORT/database/DB port and nonempty managed host/user/password. Runtime DB identity differs from learner identity and was preserved. No managed env save was necessary.
- /api/v1/health reports process only. /api/v1/health/ready performs prepared SELECT DATABASE() and validates the selected DB; it does NOT assert tables/auth/product readiness.

## Database change and provenance

Initial SHOW TABLES returned empty after SELECT DATABASE() verified db_std04_p01 using owner std04. Portal revision 0 download returned Invalid revision; no earlier migration content was available.

The first draft was rejected by the platform SQL parser. ON UPDATE CURRENT_TIMESTAMP and unary BINARY were unsupported. The accepted initial migration instead uses explicit updated_at assignments for future UPDATE queries, and a binary email column collation plus CHECK(email = LOWER(email)). Phone/student/FK/unique/default constraints remain enforced.

Portal preview accepted three CREATE TABLE statements. Upload through the authenticated Database portal API returned epoch 1, generation 1, revision 1, SHA-256 41b492537e9fee816bd39fbdf250f5832a40d4331438afdb607918e5050069a4 (3343 bytes). Initial SQL was revised only before acceptance; from revision 1 onward it is append-only.

Portal Apply was disabled. SQL was therefore executed explicitly from the learner machine using the owner connection, after rechecking SELECT DATABASE() and an empty schema. Created institutions, users, categories. No startup runner, seed, destructive SQL or existing-data mutation. This direct execution does not update or fabricate the platform applied-history ledger. migrations.sql is ignored by Git and must only be submitted via the Database page.

## Newly executed tests

| Scenario | Expected | Actual |
|---|---|---|
| Owner DB identity / empty-schema precondition | p01 only; abort on mismatch | Passed before CREATE |
| institutions/users/categories create and read | Foreign-key linked rows | Passed in transaction |
| STUDENT code 00123 | Leading zeros retained | Passed |
| New role/status | MEMBER / PENDING | Passed |
| Invalid phone, short student code, uppercase email | Constraint rejection | Passed |
| Invalid institution FK, duplicate email/category slug | Rejection | Passed |
| STAFF with NULL student code | Accepted | Passed |
| Category scoped update/read-back | Updated name | Passed |
| Transaction cleanup | Rollback; test institution absent | Passed; no existing data touched |
| HTTP contract and safety | Correct statuses and safe responses | 21 scenarios passed on local port 53142 |
| Wrong database identity in isolated child process | Generic 503 DATABASE_UNAVAILABLE | Passed; configured value not leaked |
| npm run check | Both JS syntax checks pass | Passed |
| npm audit --omit=dev --ignore-scripts | No known dependency findings | 0 vulnerabilities after local lock generation |

The 21 HTTP cases cover health/readiness, HEAD, unknown route, method mismatch, missing content type, scalar/null/array JSON, malformed JSON, invalid UTF-8, compressed body rejection, auth-not-ready without password echo, fixed-length and chunked over-limit requests, denied .env/server.js/traversal paths, legacy health, and HTML. Request IDs, nosniff and envelopes were asserted where applicable.

Browser smoke loaded the unchanged landing UI from the new backend and displayed the existing honest account-not-connected status. A cross-port probe from the old local tab was blocked by CSP as expected; tests then used same-origin navigation. Historical Phase 1 evidence remains separate in phase-1-test-results.md; the full historical UI suite was not rerun because frontend code is unchanged.

No DELETE feature exists at this stage; no deletion API or persisted account refresh test is claimed. Schema tests use rollback, not a completed frontend -> CRUD -> DB product flow. Full product integration requires the corresponding features to be built first.

## Pre-deployment review

Independent read-only review found no foundation deployment blocker. Residual low-priority risks: the five-second forced shutdown can truncate in-flight requests and reports exit 0; pool.end() rejection is not caught; readiness has no end-to-end queue acquisition deadline (the pool/queue are bounded). These are follow-ups, not claims of full runtime hardening. Editor diagnostics and git diff --check passed. All five application files are below 1 MiB; spec.md hash remains unchanged. Secret/env/migration/lockfile/node_modules paths are ignored and untracked.

## Deployment

Pending at document creation. Platform scans, job result, private runtime URL and post-deploy checks must be recorded from actual results, not inferred from local tests. MCP classroom tools are unavailable in this session; the authenticated portal is the available platform channel.
