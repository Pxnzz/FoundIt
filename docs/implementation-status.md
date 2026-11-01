# FoundIt Implementation Status and Completion Plan

Date: 2026-11-01. Scope: documentation-only repository audit for P00-02 through P00-05.

## 1. Executive status and evidence boundaries

FoundIt has a working, historically tested UI/backend foundation, not a working lost-and-found application. The current browser account forms do not send credentials or create accounts. The backend register/login routes deliberately reject valid JSON with `503 AUTH_NOT_READY`. No implemented end-user journey connects registration, administrator verification, reports, matching, claims and handover to persistent storage.

This report does not change or supersede the locked `spec.md`. It distinguishes inspected code, historical test evidence, proposals and decisions requiring the owner/school. The owner's wish to finish the application is not approval to choose the school, appoint an administrator, invent credentials or settle school/account/privacy policies. Those decisions remain open while the owner is unavailable.

Only this new document is authorized for writing. `server.js`, `task.md` and `docs/phase-2-backend-foundation.md` were already dirty at audit start; they are recognized prior work, not unexpected changes. They are preserved. No tracker checkbox, application, environment, SQL, memory, Git configuration or other document is changed by this work.

### Evidence inspected in this session

- Entire `spec.md` and `task.md`; `README.md`; `.gitignore`; `package.json`; `server.js`; frontend HTML/JS and CSS (the file reader truncated long CSS lines, so this is not an exhaustive CSS declaration audit).
- `docs/requirements-understanding.md`, `docs/phase-1-test-results.md`, `docs/phase-2-backend-foundation.md`, local `migrations.sql`, repository foundation memory and Git/file inventory.
- Read-only Git status, branch, remote, tracked files, ignore checks, application file sizes and locked-spec object identity. Target absence was checked before creation.
- No `.env` values were read or printed. Local configuration presence is not a fresh connectivity or correctness result.
- No server start, syntax/product test, browser test, real DB connection/query, SQL execution, migration upload, secret provisioning, platform status request, scan, commit, push or deployment occurred in this session.

### Historical evidence, not fresh results

`docs/phase-1-test-results.md` records responsive checks at 360/390/768/1440 px for the three starting views; theme persistence; client validation; password visibility; form-data clearing; dialog close/focus restoration; honest unavailable states; health retry; reduced motion; static safety checks. Native Escape, full keyboard/screen-reader and cross-browser accessibility were not fully accepted.

`docs/phase-2-backend-foundation.md` records 21 HTTP contract cases, wrong-DB rejection, three-table owner-DB constraint/transaction tests with rollback, syntax/dependency checks and later shutdown/readiness component tests. Its newest readiness evidence uses controlled pools, real HTTP sockets, a local non-DB TCP peer and a normal-timer run near five seconds. Those are not authenticated DB/product end-to-end tests.

Historical records report that `institutions`, `users` and `categories` were created on p01 by owner SQL after `SELECT DATABASE()` verification. Revision 1 was accepted separately through the Database portal; Apply was unavailable and direct execution did not create a platform applied-history entry. This session inspected SQL text and evidence only, not current DB tables, rows, users, indexes, migration history or connectivity. Do not infer that the school/admin/category records exist or rerun the initial CREATE statements.

Older README/foundation passages describe policy revision 2, unavailable MCP, failed scans and stopped runtime. The later `task.md` handoff and repository memory record a successful foundation release at commit `b9fe1cd`, job `eeba67b4-a24b-4d92-bbc3-f899fc2a3f05`, env revision 1, and policy revision 3 with scanners off. These later historical records supersede the older failure narrative, but are not a fresh runtime check. The current uncommitted readiness changes are not established as deployed. No deployment or full-product readiness is claimed here.

## 2. P00-02: Repository audit

### 2.1 Identity and structure

Read-only local evidence:

| Item | Observed value / qualification |
|---|---|
| Workspace | `C:/Users/Admin/Desktop/FoundIt` |
| Branch | `main` |
| HEAD | `b9fe1cd448c4decb799c67f39a9ab117a975d042` |
| Origin | `https://github.com/Pxnzz/FoundIt.git` |
| Historical confirmed project | room1 / std04 / p01; not legacy; no remote mutation in this audit |
| Historical project port / DB | 31041 / `db_std04_p01`; owner user std04; managed runtime identity may differ |
| Locked spec identity | Working file and HEAD both Git blob `e8374dd4910479f3d7e2bb3879575e5de512336a` |
| Pre-existing dirty files | `server.js`, `task.md`, `docs/phase-2-backend-foundation.md` |
| Ignored local artifacts observed | `.env`, `node_modules`, `migrations.sql`, `package-lock.json` |
| Images | `public/images/` exists and was empty when listed |

Tracked files before this report: `.gitignore`, `README.md`, `spec.md`, `task.md`, three existing documents and the five allowed application files. There is no tracked PHP backend, Python service, ERD, production privacy policy, complete API/workflow/security documentation or executable test suite.

| File | Current responsibility / limit |
|---|---|
| `package.json` (385 bytes) | CommonJS, Node >=22.13, start and JS syntax-check scripts; one pinned production dependency, mysql2 3.24.6. No product test script. |
| `server.js` (10221 bytes) | Node HTTP server; allowlisted cached assets; legacy and versioned health; DB connection readiness; strict JSON parsing; intentionally unavailable account routes; bounded DB pool; safe failures and graceful shutdown. |
| `public/index.html` (18935 bytes) | Thai landing, login, four-step registration, search preview, theme control and information dialog in a single document. |
| `public/style.css` (16063 bytes) | Existing spec-aligned purple/cyan/lime/pink direction, Anuphan, semantic theme tokens, responsive layouts, focus and reduced-motion styling. Full component/system acceptance is not established. |
| `public/index.js` (18570 bytes) | Hash navigation, theme storage, client validation/review, password visibility, data clearing, preview-only search/dialogs and process-health fetch. |
| `migrations.sql` | Local ignored initial three-table schema; not a complete product schema and not source-deployable. |
| `README.md` | Useful runtime/setup/foundation explanation; old policy/scanner/deployment passages need later reconciliation, not editing in this task. |
| `task.md` | Detailed backlog and historical handoffs; statuses do not fully capture all later foundation evidence; duplicate P03 IDs remain. |

All five inspected application files are below the 1 MiB/file room limit. This is a file-size observation, not a security scan or complete platform compliance certification. Ignore checks passed for the four named artifact paths; this is not a secret scan of all Git history.

### 2.2 What the current code actually supports

- Only `/`, `/index.html`, `/style.css` and `/index.js` are served as static assets. The root is not exposed; symlink checks protect the selected public directory/files. Images are not yet served. Assets are loaded at startup, so an already running process does not automatically reflect edits.
- `GET/HEAD /api/health` is process-only and preserves the frontend contract. `/api/v1/health` adds the response envelope; `/api/v1/health/ready` checks DB selection, not schema readiness or product completeness.
- Versioned routes enforce method allowlists, bounded UTF-8 JSON objects, content type/encoding checks, generated request IDs and generic errors. There are basic security headers and connection/request limits.
- The lazy mysql2 pool uses three connections, a bounded queue and a five-second total readiness deadline. Failed connections close their transport; late acquisitions are released. Timed-out queued acquisitions are not canceled; the driver-internal stream access is version-sensitive.
- Shutdown drains HTTP before closing the pool; repeated signals are ignored, failure/timeout events are generic, and failures exit nonzero. Historical tests do not establish every real OS-signal/runtime condition.
- The frontend only calls process health. Login/register submit handlers display unavailable notices. Registration retains required STUDENT phone/code leading zeros in the UI, suppresses student code for other member types, and never displays the password in review. The 12-character minimum is explicitly provisional UI behavior, not approved account policy.
- Actual navigation is `#/`, `#/explore`, `#/how`, `#/login`, `#/register`. Explore/how are landing anchors, not product screens. Spec clean URLs such as `/login` and `/dashboard` are not implemented; unknown paths return 404.
- Search/category chips are hardcoded preview controls, not DB-backed queries. Only theme preference is persisted in localStorage; it is not account storage. Account/contact/privacy/forgot dialogs are explanatory placeholders, not operational policies or services.

## 3. P00-03: Gap analysis

Status terms: Existing = inspected foundation; Missing = absent from current application; Conflict = spec/tracker-to-runtime mismatch; Risk = unresolved implementation or acceptance exposure. Historical schema evidence never means a fresh live DB inspection.

| Area / specification / tracker | Existing | Missing | Conflict / risk and required exit |
|---|---|---|---|---|
| Foundation/UI, Spec 3-4; P01 | Thai landing/login/register, light/dark, initial responsive behavior and feedback | Authenticated/member/admin shells; most shared components; full state and accessibility coverage; recent real public reports | Starting UI evidence does not complete all 18 P01 tasks; preserve existing design, verify new views incrementally. |
| Runtime architecture, Spec 8/11/12; P01/P02/P06 | Node CommonJS/mysql2 foundation; historical owner approval of policy mapping | Explicit mapping for remaining PHP sessions, hashing, AI service and operational delivery | No PHP/PDO/Python or extra source files under current policy; spec remains locked. Historical foundation mapping is not permission to deploy a new service or delete a required feature. |
| Schema, Spec 6; P02 | SQL text for institutions/users/categories; historical creation/constraint tests | ERD and remaining required product tables/relations, migrations and indexes; approved school/category initialization | Spec lists 26 tables including optional backups; only three have historical creation evidence. Current DB is uninspected. Global student-code uniqueness needs attention for future multi-school compatibility; do not alter accepted SQL silently. |
| Backend infrastructure, Spec 7/10; P02/P11 | Router/envelopes/parser, pool, identity guard, safe errors, security headers | Reusable field validation, authenticated principal, role/status/ownership/institution guards, transaction/query patterns, durable event logging | Basic JSON validation/headers/readiness are not authorization or product monitoring. |
| Accounts/authentication, Spec 2/4.1/7.2-3/10; P03 | Forms and two 503 stubs | Register persistence, email/password verification, logout/me, profile/preferences/change password, pending/rejected/suspended pages, administrator approval | No account creation/login session exists. No approved school assignment, account policy or operational admin identity. |
| Auth security, Spec 2/10/14; P03/P11 | No real auth state is issued | Password hashing; DB-backed hashed sessions; fixation prevention; CSRF; rate limits; remember tokens; reset delivery; MFA/recovery/re-auth; last-admin concurrency guard | Do not enable partial login and call it secure authentication; acceptance requires lifecycle and negative tests. |
| Categories, Spec 6.2.3/7.4; P02-05/P04-14 | Historical institution FK and unique institution+slug schema | Active scoped read API, authorized admin maintenance, real picker/filter integration and approved starter rows | Categories are institution-scoped. A guest endpoint without a trusted school context MUST NOT return all schools' categories or records. |
| Reports/search, Spec 4.2/5.1/7.5; P04 | Landing preview only | LOST/FOUND create/read/edit/close; public-only detail/gallery/list; filters/sort/pagination; My Reports; encrypted private details; legal state transitions | Do not serialize private relations, trust client identity/status, or turn preview text into fake persisted success. |
| Files/encryption, Spec 6/10; P04/P07/P08/P09/P11/P12 | Explicit static allowlist; empty public image directory | Authorized uploads/downloads, private storage, metadata, MIME/content checks, decode/re-encode, encryption/key version/rotation, backup and expiry handling | `public/images/` is not private evidence storage. Need a permitted durable private location/service outside web root; platform upload support does not implement app authorization. |
| Rule matching, Spec 5.3/7.6; P05 | Explanatory landing copy only | Candidate retrieval, deterministic weights, eligibility/tenant checks, unique versioned scores, triggers, member presentation and admin review | Score is not proof; concurrency/idempotency and bounded queries need tests. |
| Image AI, Spec 8; P06 | No provider/service/model integration | Embeddings, scoped similarity retrieval, model/version records, hybrid scoring, private handoff and outage fallback | Five-file/192 MiB runtime cannot be assumed to host Python/models; approved external architecture/capability required. Never substitute chat calls per pair. |
| Claims, Spec 4.2/5.2/7.7; P07 | No implemented workflow | Submit/own list/detail, safe question keys, encrypted answers, evidence, attempts/rate limits, more-info/cancel, timeline and notifications | Cancel exists in requirements/API but no CANCELLED enum in locked statuses; agree semantics rather than inventing enum or deleting feature. |
| Ownership decisions, Spec 5.4/7.8/8.3; P08 | Advisory-only copy | Protected reference/evidence viewer, evaluation, AI labels/fallback, human approve/reject/request-info, reasons/events/reviews/audit | Minimum necessary sensitive access only; provider failure cannot block human review or trigger automatic decisions. |
| Cash recovery, Spec 5.5/7.9; P09 | Privacy guidance only | Cash form/private amount-place-time storage, claim comparison, multiple-claimant review, staff custody and return | Exact amount match is not ownership proof; money must not use FLOAT or appear in public responses/logs. |
| Handover, Spec 5.6/7.10; P10 | Nothing implemented | Approved-only schedule, parties/checklist/completion and transaction linking COMPLETED claim to RETURNED report | Need race/rollback tests, no partial completion or duplicate return. |
| Member experience, Spec 4.2/7.3/7.11; P03/P04/P07/P10 | Starting public/auth UI only | Dashboard, own metrics, matches, notifications/read state, profile/preferences, sessions and every report/claim screen | Every data screen requires current-user scoping, refresh persistence and honest loading/empty/error states. |
| Admin center, Spec 4.3/7.8-14; P10 | No admin API or screen | Dashboard, users/approval/roles, reports, claims, ownership, cash, returns, matching, security, logs, notices, settings and admin profile | Optional maintenance is separate; mandatory MFA, tenant authorization, re-auth and audit apply before any admin feature. |
| Security/privacy/operations, Spec 9-10/14-16; P11/P12 | Limited safe HTTP foundation and historical targeted tests | Durable append-only activity/audit, signals/alerts/reviews, full abuse/leakage tests, privacy/consent, production HTTPS, encrypted backups/restore, retention and monitoring | Shared school IP is a weak signal, not guilt. Historical warn/no-required-scans is not a clean scan or production acceptance. |

No operational app workflow in WF-01 through WF-09 is complete. In particular, no account verification, remember restore/revoke, real report search, matching, claim review, handover, cash custody, risk review or role/MFA journey is accepted. Screens and endpoints listed in the tracker beyond the inspected foundation are backlog, not hidden existing features.

## 4. Runtime and change-control envelope

The supplied room policy revision 3 (hash `bb989ad6e209522d0b71fa4ae5ed88b4a4b46311e928b3b99ba3a97f571c48dc`) governs future work; reread effective policy/project context before changes/deployment.

- Application source is exactly `package.json`, `server.js`, `public/index.html`, `public/style.css`, `public/index.js`; CommonJS entry is `server.js`, static directory `public`. Keep logical service/validator/serializer sections within those files. No separate executable test files, routes/controllers, PHP, Python, CLI script or migration runner. Documentation and permitted sanitized project images are separate allowances, not a source-file loophole.
- Each application file <=1 MiB; production dependencies <=30; runtime RAM 192 MiB. Install without lifecycle scripts. Additional libraries and AI/image work must fit these constraints and be re-reviewed.
- Env mode is optional, not permission to leak credentials. Existing local `.env` stays ignored; application reads `process.env`. Server-managed PORT/DB values must be preserved, not replaced with learner LAN credentials. Provision secrets through protected local/managed secret fields, never chat, Git, public files or this document.
- Schema changes use append-only `migrations.sql`, downloaded/compared to accepted revision, previewed and uploaded separately through Database tooling. Upload is not Apply. No startup/Git/npm migrations, destructive workaround or replay of revision 1. Before permitted owner SQL, verify current selected project and `SELECT DATABASE()`; do not touch another DB or use root.
- Public image limits: supported PNG/JPG/JPEG/GIF/WebP, <=5 MiB/image, <=200/project, <=100 MiB total. Decode/re-encode, strip metadata and use the first animation frame before publication. Private evidence must remain private even when an image format is supported.
- Room public publication is disabled. Product 'public fields' or guest screens do not authorize an internet/public route. Production HTTPS and secure-cookie requirements still need a supported deployment route, not a relaxed cookie policy.
- Future deploy requires fresh live project confirmation, saved GitHub-link verification, source/backend review, authorized Git push or explicit upload workflow, managed env/DB preparation, completed job, gate/status/log/URL checks and changed-feature verification. A queued job, save, restart or historical URL is not completion.

## 5. P00-04: Ordered implementation plan

This is a proposed dependency plan, not authorization to perform pending school/admin decisions. Deliver in small reviewed increments; keep spec phases P01-P12 and all locked product scope. Security is implemented alongside each increment, not postponed until P11. Minimal admin approval/review capabilities are dependencies of earlier journeys even though their final consolidated UI belongs to P10.

| Order / phase | Dependencies / decision gates | Deliverable within permitted files | Test acceptance before progressing |
|---|---|---|---|
| 0 / P00 closure | This audit; owner later resolves relevant decisions | Review mapping and acceptance evidence; preserve P03 duplicate-ID history; establish school/admin/policy inputs | P00 documentation review passes independently of product readiness; no implicit approval of proposals. |
| 1 / P01 finish baseline | Existing design and historical UI evidence | Complete reusable in-file shell/components, route strategy and form states; retain Thai/spec palette, two themes and accessibility | New/changed views pass mobile/tablet/desktop, both themes, keyboard/focus, reduced motion and state checks; full starting UI rerun only if affected. |
| 2 / P02 foundation completion | Approved runtime mapping; secure school assignment design; current schema inspection on confirmed project | ERD/API contracts in docs; validation/authz primitives; parameterized query/transaction patterns; append only needed auth/audit/settings schemas | Verify DB identity before SQL, compare actual schema, prove FK/unique/check/index behavior, safe rollback/error handling and cross-school denial using own fixtures. No destructive reset or blind initial import. |
| 3 / P03 secure auth vertical slice | Actual school identity; administrator identity; password/email/status/session/MFA/bootstrap approvals; HTTPS route; secrets | Register MEMBER/PENDING, login/logout/me, account states, durable sessions, CSRF/rate limits, MFA enrollment/gate; minimal admin approve/reject and audit | Real registration -> DB read-back -> pending denial -> MFA-protected admin approval -> login -> allowed member action; generic credential errors, case duplicates, role/institution spoofing and fixation/CSRF denials. |
| 4 / P03 finish account lifecycle | Slice 3; approved SMTP/reset/session/MFA recovery rules | Remember rotation/revocation, sessions/logout-all, forgot/reset delivery, profile/password/preferences, suspension propagation and last-admin guard | Full security matrix below; fresh/revoked/expired states verified in browser/API/storage, reload persistence; actual approved mail receipt/link works. A dev adapter is not production delivery acceptance. |
| 5 / P04 categories/reports/storage | Auth/status/institution guard; approved category setup; private storage and encryption secrets | Scoped categories; public serializers; LOST/FOUND forms, APIs, own list/detail/edit/close; safe gallery/upload paths and bounded search/filter/pagination | Actual frontend -> API -> DB -> response -> refresh; ownership/tenant/invalid state denials; public/private separation; upload metadata stripping and unauthorized evidence denial. Close/deactivate rather than invent report hard-delete. |
| 6 / P05 rule matching | Eligible persisted reports/categories; settings/audit | Deterministic feature weights, same-school LOST/FOUND candidates, idempotent versioned matches, review and safe presentation | Known fixtures produce expected scores, missing-field behavior and bounds; wrong types/schools excluded; duplicate triggers safe; candidate never labeled proof. |
| 7 / P06 image matching | Approved compatible AI service/provider/store; slice 5 private media and slice 6 scoring | Authenticated private image handoff, embedding/similarity adapter, hybrid scores/versioning, timeout/fallback and review UI | Real approved service integration plus corrupt image/auth/timeout failures; tenant-safe retrieval, bounded resource use, rule-only fallback. No per-pair chat replacement or fake score. If blocked, retain P06 as blocked, not removed. |
| 8 / P07 claims | Auth/reports/private media/events/notifications; approved attempt and cancel semantics | Own submit/list/detail/questions/answers/evidence/more-info/cancel and timeline; atomic attempts/rate enforcement | Own claim persisted/read after refresh; concurrency cannot exceed limit; other users cannot view answers/evidence; invalid questions/states rejected; safe notifications generated. |
| 9 / P08 ownership review | Slice 8; encryption and audited admin access; approved AI data handling | Minimal protected reference/evidence viewer; consistency labels; AI adapter/outage handling; human decision transaction | Approve/reject/request-more-info require authorized MFA admin and reasons where required; event/review/audit persist atomically; no secret leakage; AI failure/adversarial input cannot decide claim. |
| 10 / P09 cash | Slice 9 review; designated staff/custody policy; money encryption | Private cash amount/place/time, claimant comparison, multi-claimant queue, custody/history and approved return integration | Public API/UI/logs omit amount/private fields; ciphertext in DB; exact match never auto-approves; staff custody and multiple claimants audited; money precision preserved. |
| 11 / P10 admin consolidation and returns | Auth through slice 10; approved workflow settings | Approved-only scheduling/handover; dashboard/users/reports/claims/ownership/cash/matches/security/logs/notices/settings/admin profile; member notifications/dashboard | Atomic COMPLETED + RETURNED + events/audit, duplicate/concurrent completion safe; metrics match authorized DB data; role/MFA/tenant/re-auth guards; last-admin race protection; settings validation and append-only logs. Maintenance remains optional. |
| 12 / P11 security and quality acceptance | All relevant features and approved privacy/retention | Complete targeted security/accessibility/performance regression, monitoring, privacy notice and retention/backup rules | WF-01..09 and Spec 14-15 evidence; XSS/SQLi/CSRF/IDOR/brute-force/upload/leakage tests; encrypted backup restore and retention verified within platform constraints. No auto-ban/reject on score. |
| 13 / P12 release acceptance | Completed mandatory scopes; compatible HTTPS/private storage; secrets; school acceptance and backup readiness | Reviewed current source, managed env, only missing SQL, deployment/runbook and monitoring | Confirm real project/repository/branch; complete job and effective env; gates/status/logs/actual URL; changed-flow smoke and release checklist. No public publication while policy forbids it. Report code/env/DB/runtime separately. |

### 5.1 Mandatory authentication security acceptance matrix

These capabilities are absent, not merely untested existing implementations. Implementation remains gated on applicable decisions. Node equivalents must preserve Spec 2/10 guarantees without pretending PHP functions exist in this runtime.

| Scenario | Expected acceptance and evidence |
|---|---|
| Registration validation | Required names/nickname/email/phone/password/confirmation/member type; backend length/type checks; lowercase unique email including case races; phone exactly ten digits, not login; STUDENT code exactly five digits preserving zeros; TEACHER/STAFF code NULL; confirmation never stored. No extra birth/class fields. |
| Role and school assignment | Backend sets MEMBER/PENDING and trusted institution; injected user/role/status/institution rejected or ignored safely; inactive/unconfigured school fails closed. Ordinary registration/profile cannot appoint an admin. |
| Password security | Approved adaptive salted hash and calibrated cost; no plaintext/reversible passwords; verify safely and rehash as needed; approved length/maximum/Unicode semantics consistent on client/server; never truncate silently or expose password/hash in API/logs. |
| Credential errors and abuse | Email/password only, generic wrong/unknown-account response without meaningful enumeration differences; bounded login/register/reset/MFA throttles, safe 429 handling; account and network signals do not indiscriminately punish shared school IPs. |
| Session creation and rotation | Cryptographically random opaque cookie; rotate after login/privilege/MFA changes; only hashed session references persisted; old fixation IDs fail; bounded idle/absolute expiry; user/role/status/institution checked server-side on protected operations. |
| Cookie/transport/CSRF | HttpOnly, Secure on production HTTPS, suitable SameSite/path and limited scope; explicitly trusted proxy handling only; CSRF tokens and origin checks for state changes including logout; missing/wrong token fails. No browser localStorage bearer credentials. |
| Account states | PENDING limited to account/status; REJECTED/SUSPENDED receive only permitted status/help information; core APIs deny them. Suspension/demotion invalidates effective sessions, remember restore and admin access according to approved policy. |
| Remember Me | Default 30 days unless explicitly approved otherwise; random selector/validator, hashed validator only; rotate on restore, detect replay/concurrent reuse safely, enforce expiry/revocation; password reset/change/compromise revoke all remember tokens; logout semantics documented and tested. |
| Session inventory/logout | Only own session metadata exposed; other IDs denied; current logout clears correct cookie paths and invalidates server state; revoke-one/logout-all immediately deny old credentials, including after reload/restart. |
| Forgot/reset/change password | Generic forgot response; random hashed expiring one-use token; approved trusted reset URL and SMTP delivery; no token in production UI/logs/referrers; atomic consume rejects reuse/concurrency/expiry; confirm new password; revoke required sessions and remember tokens. Password change requires current/fresh authentication. |
| Admin MFA and recovery | Approved method (TOTP only a proposal); encrypted secret outside plaintext DB, key outside DB; recovery hashes, one-time recovery usage, replay/rate-limit protection; enrollment confirmation; no admin API before MFA; recovery/disable cannot bypass mandatory MFA. |
| Re-authentication | Fresh verification for roles, MFA changes, sensitive settings and comparable high-risk operations; server-bound expiry and audit, not a client boolean or stale session flag. |
| Last administrator | Transaction/locking protects the last eligible admin from demotion/suspension/deletion, including concurrent actions; denied attempt audited. Determine school-scoped eligibility explicitly; no SUPER_ADMIN. |
| Auth audit/privacy | Register/login/failure/logout/reset/MFA/status/role events append-only and safely redacted; no cookie/raw token/password/secret answer/key; request correlation without excessive PII. Test storage, errors and logs as well as HTTP status. |

### 5.2 Proposed first-administrator bootstrap, NOT approved

A possible policy-compatible implementation is an explicit CLI mode inside `server.js`, not an extra executable file, HTTP setup endpoint or npm/startup migration. It must branch before `server.listen`, run only when intentionally invoked by an authorized owner, verify the selected DB and approved institution, and obtain the approved administrator identity and password through protected interactive input/secret handling (never command-line password arguments, Git, logs or this report).

If approved, its transaction would hash the supplied password, create only the explicitly authorized ADMIN with documented verification/MFA-enrollment state, append audit records, refuse an accidental second bootstrap or automatic promotion of an existing member, and force MFA enrollment before any admin API. It must not invent a school, seed a default password, create tables on startup, use root or grant database permissions. Concurrency/idempotency, rollback and failure paths require tests. Handling an existing account with the requested email needs a separate authorized action, not silent elevation.

The exact CLI interface, operator access and recovery mechanism are unconfirmed. No bootstrap code was added, approved, invoked or tested. School name/code and the designated administrator email are still required; the administrator's member type/contact details and secure password provisioning also need confirmation. An institutional deployment operator may be needed if the managed runtime does not permit this CLI mode.

### 5.3 Testing scope and evidence rules

This session is P00 documentation review only. UI/API/DB retests are not warranted merely to create this report, so none were run. Historical passing tests remain explicitly historical.

For future new/integrated features, prove the actual browser -> API/backend -> project storage -> response -> browser path, verify IDs/relations and values, refresh/read back after updates, and test supported Create/Read/Update/Delete actions. If a feature supports close/deactivate/cancel rather than deletion, test that behavior and mark hard-delete not applicable with the reason; do not add deletion just to complete a CRUD label. Session revoke and image removal need their specified deletion/revocation tests. Own synthetic fixtures only; do not delete or alter existing user records for tests.

For UI-only styling after a previously accepted flow, retest changed responsive/interaction states, not SQL/CRUD without a reason. Backend/query/schema/binding changes require affected storage paths and negative authorization checks. A mock, VM pool, syntax pass or HTTP 200 is never real DB/end-to-end acceptance. Record scenario, expected/actual, fixture scope and sanitized evidence; label network/credentials/browser gaps as blocked. Use transient/in-memory commands or browser tooling with results in docs; do not add executable test files outside the five-file allowance.

## 6. P00-05: Open decisions inventory

Locked rules are not proposals: only MEMBER/ADMIN; separate STUDENT/TEACHER/STAFF; email/password login; phone contact only/no phone OTP; new MEMBER/PENDING; admin MFA/re-auth and last-admin protection; private encryption/authorization; human final claim decisions; no score-only ban/rejection; Thai responsive light/dark UI. None may be weakened by a convenient default.

Every proposal below is unconfirmed unless the row explicitly identifies an existing historical implementation constraint. Lack of an answer is not consent. Continue only work independent of these gates; do not fabricate real school/account data.

| ID / decision | Proposal or known constraint | Approval/input still required | Blocked milestone |
|---|---|---|---|
| D01 Institution identity (Spec 18.8) | One configured school for MVP; trusted server assignment, no public school-ID trust. School name/code/address not inferred from account/repo/port. | Owner/school supplies actual school name and code, address if used, active status and authorized scope. | Real institution initialization, registration, categories/reports scoping. |
| D02 First admin identity (18.11) | Explicit owner-appointed person; no default admin, auto-first-signup elevation or SUPER_ADMIN. | Designated administrator email plus required member/contact identity; approval to create/elevate that specific account and its verification state. School and admin email are required answers. | First usable admin and all approval/review workflows. |
| D03 Bootstrap execution (18.11) | Explicit CLI mode inside `server.js` as described above, not approved. | Owner approves mechanism; operator/platform confirms secure invocation and recovery. | Secure first-admin creation. |
| D04 Password policy (18.2) | Current 12..128 UI bounds are provisional. Propose a documented long-password/passphrase policy with adaptive salted hashing calibrated for 192 MiB. | Approve length/maximum/Unicode/strength rules, hashing method/cost and compromised-password approach; mirror backend/UI. | Production registration/change/reset. |
| D05 Email verification (18.1) | Do not silently enable verification or treat it as equivalent to school/admin verification. | Approve whether email verification is required, its timing, expiry/resend and effect on PENDING access. | Final account lifecycle. |
| D06 Account approval/status policy | MEMBER/PENDING is locked; admin review precedes core access. | School approves identity checks, approvers, rejection/suspension reasons visible to user, appeal/contact and reinstatement handling. | Operational verification/status pages and admin users. |
| D07 Session/remember policy | Hash tokens; 30-day remember default from spec; rotation/revocation mandatory. | Approve idle/absolute session lifetimes, device/logout behavior, reset/change revocation scope and re-auth freshness. | Secure session lifecycle acceptance. |
| D08 Admin MFA/recovery (18.7) | TOTP with encrypted secret and hashed single-use recovery codes is a proposal, not selected policy. | Approve method, enrollment/mandatory-use behavior, recovery operator/process, disable/re-enroll safeguards and emergency access. | Admin bootstrap/login/actions. |
| D09 Email delivery (18.6) | SMTP/provider adapter; protected dev delivery only for development, not production acceptance. | Sender identity/domain, delivery provider, host/port/TLS, username, approved reset origin; SMTP credentials through secret fields only. Never ask for password/API key in chat/docs. | Actual reset email and optional email notifications. |
| D10 Private image/evidence storage (18.3) | Durable private filesystem outside web root or private object storage with authorized streaming; sanitized publishable derivatives only. | Platform/school confirms permitted durable path/service, access, quota, encryption, backup/retention and key management. Public images cannot substitute for private evidence. | Reports with images, evidence, cash attachments, production release. |
| D11 HTTPS/canonical routing | Secure cookies and HTTPS production are mandatory; public publication currently forbidden. Hash-vs-clean route mapping remains implementation work. | Confirm supported HTTPS/private route, trusted proxy termination and canonical allowed reset URL. No weakening Secure to accept real logins on plain production HTTP. | Production accounts, email links and release acceptance. |
| D12 Embedding store (18.4) | Choose after data volume/dimension estimates; scoped bounded retrieval, avoid unnecessary infrastructure. | Expected volume, approved service/store/capacity and deployment permission within policy. | Full P06 similarity search. |
| D13 AI provider/architecture (18.5) | Adapter with advisory output, model/version and outage fallback; classroom gateway permits class-codex/low, not evidence that image embeddings exist. | Approve provider/data transfer, capability, retention and compatible private service architecture. Python/FastAPI cannot be added to this five-file runtime. | Image AI and actual ownership AI integration. |
| D14 Retention/backups (18.9) | Room ceiling is 365 days from creation including backups; do not reinterpret it as a school-selected default. | School approves shorter/actual per-data retention, closure handling, encrypted backup schedule, restore access and expiry enforcement. | Privacy/operations/production acceptance. |
| D15 Privacy/consent (18.10) | Data minimization, private contact/evidence, restricted audit; current modal is not a production privacy notice. | School/data owner approves notice, applicable consent/legal handling, minor/student data practices, contact, access/export/deletion handling within obligations. | Real production data collection. |
| D16 Exact locations (18.12) | Text locations for MVP; no coordinates/maps added. | Any map/location feature and any precise sensitive location exposure require explicit approval. | Map enhancement only; retain safe text flow. |
| D17 Claim settings/cancel semantics | Three attempts is an example, not approved universal policy. Cancel route exists but locked claim enum lacks cancellation. | Approve limit/window/reset/escalation, cancellation representation and valid states, safe question policy and matching weights/thresholds where user-visible. | Claims/state machine/settings finalization. |
| D18 Custody/handover operations | Human review and approved-only return locked; no first-come-first-served cash award. | School names authorized staff/custodians, pickup/contact process, necessary proof/record fields and escalation. | Cash custody and real handover acceptance. |
| D19 Runtime/schema mapping | Historical foundation approval maps PHP/PDO to Node/mysql2 and MariaDB; spec unchanged. No automatic migrations allowed. | Confirm remaining policy-compatible equivalents and any external service/resource needs; preserve accepted SQL; do not claim every locked stack requirement literally met. | Remaining infrastructure/AI compatibility decisions. |
| D20 Tracker canonical IDs | P03-01 occurs three times; P03-02..13 twice; P03-14 once; headings are duplicated. | Owner approval of any future canonical mapping/renumbering and preservation of historical references. Use ID + task title + occurrence for now. | Tracker cleanup only, not independent secure implementation. |

### 6.1 Minimal owner return checklist

1. Supply actual school name/code and designated first-admin email/required identity; approve trusted institution assignment and the bootstrap mechanism. No guessed school/admin records will be inserted.
2. Approve account policies: password, email verification, approval/status handling, session/remember lifetimes, MFA/recovery/re-auth and sensitive-role controls. The current UI minimum is not an approval.
3. Provide SMTP/provider setup and sender/canonical reset origin; enter credentials only in approved secret fields, not chat. Secure bootstrap password/key provisioning follows the same rule.
4. Confirm policy-compatible durable private storage and an HTTPS route/trusted-proxy configuration. Resolve image-AI service/data handling, privacy/retention and custody choices before their dependent milestones.

The owner is unavailable now, so this is an inventory for later decisions, not a request that blocks writing the audit or an excuse to invent answers. Design-only and independent foundation work can be planned without enabling unsafe real-account workflows.

## 7. Documentation acceptance and handoff

| Task | Tracker acceptance wording, paraphrased | Result of this document |
|---|---|---|
| P00-02 | Report existing structure and important files | Documentation acceptance can pass: Section 2 records current file/Git/code inventory and evidence boundaries. |
| P00-03 | Show existing/missing/conflict/risk without guesses | Documentation acceptance can pass: Section 3 covers foundation versus absent workflows with spec/task references. |
| P00-04 | Phased dependencies/deliverables/tests aligned to P01-P12 | Documentation acceptance can pass: Section 5 gives ordered gated milestones and test acceptance, not a one-pass build promise. |
| P00-05 | Inventory open points without deciding policy for owner | Documentation acceptance can pass: Section 6 covers all twelve Spec 18 open points and additional blockers; proposals remain unconfirmed. |

These are documentation-level acceptance conclusions, not checked tracker statuses, approval of proposals or completion of P01-P12. `task.md` remains unchanged by instruction; no revised progress percentage or silent P03 renumbering is asserted. Its historical count is 185 task-heading occurrences, not 185 distinct deliverables because of duplicates.

Next implementation should select the earliest independent small milestone, recheck actual repository/project context, resolve only its applicable owner gates and retain all prior dirty work. Before DB/schema or deployment actions, use fresh authorized project information rather than this historical report. Do not rerun accepted migrations or historical product tests simply to make the checklist look fuller.

Current final boundary: one new documentation file; locked baseline intact; all pre-existing source/tracker/evidence changes preserved; no new DB/product tests or deployment; FoundIt remains unfinished.
