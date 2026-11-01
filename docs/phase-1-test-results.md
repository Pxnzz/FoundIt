# FoundIt p01 - Phase 1 Verification

Date: 2026-11-01. Project confirmed by owner: p01.

## Scope and stage

Phase 1 UI integration and limited static-backend safety verification. Tested the current Landing, Login, four-step Register, search preview, theme, informational dialog, and process-health UI. This is not authentication/report integration or production acceptance.

The current HTML and JS used incompatible selectors. Repairs preserve the current design while reconnecting form controls, progress, review, search categories, dialogs, and health retry. Corrected Thai spelling and contained decorative artwork that caused horizontal overflow.

No business API or storage exists in this phase. Create/Read/Update/Delete of accounts/reports is not applicable: those workflows are intentionally unavailable, not simulated as successful. No SQL, schema change, database connection, or migration was executed. Database testing would not validate these UI-only changes.

## Environment and previous evidence

- Local Node v24.22.1; CommonJS server.js and the five allowed application files remain the application structure.
- Existing .env is present; required application configuration keys are present; PORT matches p01 (31041). Values were not printed, changed, or committed. Presence does not establish DB connectivity.
- Existing .gitignore ignores .env and node_modules/. git check-ignore .env succeeds; git ls-files .env is empty.
- Previous P00 evidence in requirements-understanding.md records syntax and document checks only. It is not reused as browser or E2E evidence.
- Port 31041 initially served the old starter page from an existing process. That process was not stopped. Tests used a separate loopback-only process at 127.0.0.1:53141, overriding environment only for that process and not changing .env. Restart the normal p01 app to load current files; static assets are cached in memory at server startup.

## Fresh browser results

Executed using the integrated browser and Playwright against the real local Node server.

| Scenario | Expected | Actual |
| --- | --- | --- |
| Home/Login/Register at 360, 390, 768, 1440 px | No horizontal document overflow | All 12 combinations passed after artwork clipping fix |
| Initial responsive check | Detect regressions | Found overflow at home 360 and 768 px; repaired and retested |
| Theme toggle and reload | Persist selected theme | Dark persisted across reload; Light also rendered; only foundit-theme stored in localStorage |
| Empty Login | Inline required-field feedback | Email aria-invalid=true |
| Password visibility | Toggle password display | Login input changed to text |
| Valid Login submit | Clearly state unavailable, no real login | Notice visible, no POST requests, no session claimed |
| Leave Login | Clear transient password | Password value empty after navigation |
| Forgot-password dialog | Open, close, restore focus | Close button closed dialog and restored focus to trigger |
| Empty registration step | Do not advance | First-name aria-invalid=true |
| Student registration steps | Validate and retain leading zeros | Review retained phone 0123456789 and student code 00123 |
| Email normalization | Lowercase before review | TEST@EXAMPLE.COM became test@example.com |
| Mismatched confirmation | Remain on password step | Confirmation aria-invalid=true |
| Valid registration review | Show entered data without plaintext password | Review correct; password replaced by explanatory text |
| Final registration submit | No false account creation | Explicit unavailable notice shown |
| Teacher member type | Exclude student-code input | Student-code input disabled |
| Invalid phone length | Reject short phone | Phone aria-invalid=true for 123 |
| Search category and query | Honest unavailable state | Category and query displayed without claiming real search results |
| HTML-like search input | Render as text, not HTML | No injected img element; input shown as text |
| Health success | Report process health, not account readiness | Correct server-responding/account-unavailable message |
| Health failure and retry | Error feedback and recovery | Browser request abort induced error; unblocked retry reached real health endpoint and recovered |
| Reduced motion | Disable decorative animation | Computed hero animation-name was none |
| Runtime errors in final responsive/search/health run | No JS page errors | Empty pageerror list |

The health failure was deliberately simulated with browser request interception; it is not evidence of an actual server outage. The dialog Escape-key attempt did not close the dialog in this browser automation session; native Escape behavior is not accepted as verified. Button close/focus restoration passed. Full keyboard/screen-reader and cross-browser accessibility audits remain outstanding.

## Fresh backend and source checks

Executed direct Node HTTP requests without a DB or authentication mock.

| Scenario | Expected | Actual |
| --- | --- | --- |
| GET /, /style.css, /index.js, /api/health | 200, security headers | Passed |
| GET /.env, /server.js, /package.json, /.git/config | 404 | Passed |
| GET /../.env, /%2e%2e/.env, /public/%2e%2e/.env | 404 | Passed |
| GET /unknown | 404 | Passed |
| HEAD / and /api/health | 200, zero body bytes | Passed |
| POST /, OPTIONS /api/health | 405 | Passed |
| npm.cmd run check | Both JS syntax checks pass | Passed |

Route checks confirmed Content-Security-Policy and X-Content-Type-Options: nosniff on tested GET responses. This is limited route/header verification, not a penetration test, proof of tenant isolation, or scanner approval.

## Remaining blockers

- Authentication, registration persistence, report CRUD, authorization, sessions, MFA, and all DB-backed features are not implemented or E2E verified.
- Locked spec requires PHP/PDO/MySQL while the room mandates Node CommonJS/five application files and MariaDB. Backend implementation needs an agreed policy-compliant mapping; spec.md remains unchanged.
- Semgrep, OSV scanner, and Gitleaks were not available on PATH; no fresh scanner result is claimed. Room requires blocking scans before deployment/publication; platform scan validity must satisfy the 24-hour freshness rule.
- Public publication is disabled by room policy. No upload, Git push, deployment, or public route change was performed.
- The existing p01 process needs a controlled restart before port 31041 reflects current files. Do not mistake the separate test port for p01's managed runtime port.
- Full keyboard/Escape verification, screen-reader testing, broader browser coverage, production resource limits/isolation, and retention enforcement remain unverified.

## Run locally

Use Node >=22.13.0, keep the existing private .env, and run npm.cmd start in PowerShell. npm.ps1 is blocked by this machine's execution policy; npm.cmd works without changing that policy. Application configuration is read through process.env. Do not commit .env or expose DB credentials to public/.
