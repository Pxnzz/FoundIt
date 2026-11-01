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

Deployment is BLOCKED, not completed. MCP classroom tools are unavailable; the authenticated portal was used. GitHub link was saved and read back as https://github.com/Pxnzz/FoundIt. User-authorized commits were pushed to main: 7a623d1 (foundation), ebcd480 (stricter ignore rules).

1. Git deploy job 8be0cb18-e2c7-4df2-9687-ebd03a150222 failed during capture with GITIGNORE. Tightened .gitignore by removing the unused .env.example exception and explicitly ignoring node_modules. No source or DB change was needed.
2. Git deploy job 2b8b1bbd-ff3b-47e1-84a4-2767aa15f100 captured the new GitHub archive with valid structure, including a passing GITIGNORE check and all five source files. It then failed at scan/blocked (WORKER_FAILED). Env revision captured by the job: 1. No release was activated.
3. Platform Semgrep 1.183.0 and OSV 2.7.0 completed with complete coverage and zero findings. Gitleaks returned status error, reason tool-diagnostics. Gate decision deny, violation tool-incomplete/gitleaks. Zero displayed findings does not mean the incomplete scanner passed. Source hash: b4aeb78f8e71f94a66e3b0cff664afb86822bc9f008332573838f7e350f1b8da; release identity sha256:3aa1cb3762e3f82b5b3632e1ab7aef4769451455ff731988193016519adf9b78.
4. The portal's manual rescan job 55636453-5885-43c6-b53f-e173387d8046 failed at capture because the project Draft is empty (Git candidate is not the Draft). It did not rerun Gitleaks and does not supersede the Git candidate scan evidence. The latest project_status structure consequently describes that empty Draft, not missing files in the Git repository. Do not use repeated manual rescans to retry this Git candidate.
5. project_status reports running false, releaseId null, legacyRuntime true. Project logs were available but empty. Actual requests to http://10.200.210.117:31041/, /api/v1/health and /api/v1/health/ready all failed with ECONNREFUSED. No deployed browser/DB integration acceptance is possible yet. Public remains unpublished.

Required continuation: the platform administrator must inspect/fix the Gitleaks worker diagnostics for the Git candidate (not disable the required scanner). After repair, deploy from the saved GitHub URL again, follow the job to completion and verify scans, effective env revision, runtime logs and the actual URL. The three DB tables already exist; do not rerun migration revision 1 or reset data. Managed env requires no known changes. Authentication/product flows remain separate unfinished work, even after foundation deployment succeeds.

## Follow-up 2026-11-01: shutdown hardening

Stage: targeted backend regression, not product integration or production acceptance. Updated server.js to drain HTTP before awaiting pool.end(), handle rejection with a generic shutdown_error event and exit code 1, ignore repeated termination signals, and enforce a 10-second deadline with shutdown_timeout and exit 1. Successful shutdown clears the deadline and exits naturally. This supersedes the shutdown-specific risks in the historical pre-deployment review; the readiness queue deadline remains unresolved.

| Newly run scenario | Expected | Actual |
|---|---|---|
| Actual child process: health and HTML, then repeated signal handlers | HTTP 200, clean exit 0, no stderr | Passed |
| Real HTTP with controlled DB pool: active request during shutdown | Response finishes before pool closure; closure awaited once | Passed |
| Controlled pool.end rejection | Generic shutdown_error, exitCode 1, no driver detail | Passed |
| Controlled hanging pool.end | Deadline invokes exit 1 with shutdown_timeout | Passed |
| Syntax and whitespace | npm run check and git diff --check pass | Passed |
| User MCP configuration | Valid JSON, HTTP server, password prompt marked secret | Passed configuration checks only; tools not attached |

Failure-path tests ran the current server source in a VM with real HTTP sockets and controlled pool/process/timers (the 10-second deadline accelerated to 200 ms). These are component tests, NOT real DB or OS-signal end-to-end results. The separate unmodified-runtime child smoke invoked the registered signal handlers via process.emit because Windows termination does not reliably deliver POSIX signals. Harness setup failures (PowerShell argument quoting, missing VM URL global, keep-alive client timing) were corrected before the passing runs; no application behavior was changed to bypass assertions. Tests ran in memory without adding executable test files.

No frontend, payload, query or schema change, so historical DB/CRUD/responsive tests were not repeated. No managed env change, migration or deploy attempted in this follow-up. Portal Security still showed Gitleaks tool-diagnostics and deny when inspected; this is not a new scan.

Created VS Code user-level MCP configuration outside the repository at C:/Users/Admin/AppData/Roaming/Code/User/mcp.json, using the confirmed room1/std04 identity and a secret password input, with no stored password. User must start/trust classroom-student and enter their website password in VS Code's secret prompt. JSON validity does not establish tool attachment: classroom_list_projects must become visible and be called before any new deployment. No successful deployment or MCP connection is claimed.

## Follow-up 2026-11-01: total readiness deadline verified

Stage: targeted backend regression for P11-13, not product integration or deployment acceptance. Owner reconfirmed p01. Live classroom_list_projects and get_github_link verified the project and Pxnzz/FoundIt repository. Earlier MCP-unavailable statements are historical. No new deployment was requested or attempted in this follow-up.

Preserved the unfinished checkDatabaseConnection implementation and validated a single 5000 ms deadline covering pool acquisition plus SELECT DATABASE(). Timely success releases the connection; errors remove it from the pool. Acquisitions delivered after timeout are released without querying. Late query outcomes are consumed without duplicate settlement or cleanup.

Read-only review found that pinned mysql2 3.24.6 destroy() uses stream.end(), which can leave a stalled transport open. The error path now captures the underlying PromisePoolConnection.connection.stream, invokes connection.destroy() to remove it from the pool, then stream.destroy() to close the transport. This depends on the pinned driver's structure and must be rechecked on dependency upgrades.

### Newly executed final-code evidence

| Scenario | Expected | Actual |
|---|---|---|
| Timely success | Release once; clear timer | Passed |
| Synchronous acquisition throw / asynchronous rejection | Controlled rejection; timer cleared | Both passed |
| Query rejection | Connection and transport destroyed, no release | Passed |
| Selected DB mismatch | Reject and close transport | Passed |
| Acquisition timeout, then late success | Release without querying | Passed |
| Acquisition timeout, then late rejection | Rejection consumed | Passed |
| Query timeout, then late success / rejection | Destroy once; no release or unhandled rejection | Both passed |
| Real HTTP stalled readiness and concurrent liveness | Generic 503 DATABASE_UNAVAILABLE, request ID; liveness 200 | Passed |
| Real HTTP readiness success GET / HEAD | 200, database-connection scope; empty HEAD body | Passed |
| Actual mysql2 PromiseConnection over stalled local TCP peer | Deadline destroys underlying socket | Passed; socket.destroyed true |
| Unaccelerated final-code total deadline with 1000 ms acquisition | Fail near 5000 ms total, not 6000 ms; cleanup once | Passed in 5007 ms |

The first twelve scenarios ran the complete current server source in a VM with real HTTP sockets; the deadline was accelerated from 5000 ms to 80 ms. The local TCP test used the installed mysql2 wrapper and a local non-DB peer that did not send a handshake. This validates transport destruction, NOT real database integration or an authenticated database session. No unhandled rejections occurred. The separate real-time test evaluated the current readiness helper with controlled acquisition/query promises and normal timers.

Before transport hardening, eleven component/HTTP scenarios and an unaccelerated 5011 ms run passed; those are preliminary evidence, superseded by the final-code runs above. Terminal PSReadLine produced an input/display exception on the first long command; recovered output confirmed completion. Disabling the session input module and terminating subsequent multiline input correctly restored reliable execution; no assertions were bypassed. Harnesses ran in memory, with no new executable project files.

Local .env completeness and p01 identity were checked without printing credentials or modifying the file. No managed env writes, DB requests, SQL, migrations, seed, frontend/spec changes, commit/push or deployment. Historical real-DB/schema/UI results remain separate and were not rerun because query semantics, schema and frontend behavior are unchanged. This follow-up does not establish real DB E2E, OS-signal behavior, or deployed readiness for the new code.

Residual limitation: timing out does not cancel mysql2's pending acquisition entry. It remains until serviced or pool shutdown; queueLimit 10 bounds queued entries. Late delivered connections are released. The five-second response deadline is subject to normal Node event-loop scheduling. P11-13 stays [/] for wider monitoring and product acceptance.
