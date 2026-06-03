# Production Readiness Plan

## Status: MVP Foundation Complete ✅

The following have been implemented:
- ✅ Persistent JSONL storage in collector
- ✅ Trace query API endpoints (`GET /v1/traces`, `GET /v1/traces/:traceId`)
- ✅ Event filtering by traceId (`GET /v1/events?traceId=<id>`)
- ✅ Collector-side payload normalization and redaction
- ✅ Test coverage for storage, server, and trace endpoints
- ✅ API documentation in README
- ✅ Architecture docs updated

## Remaining Work for Public Production Readiness

### 1. CONTRIBUTING.md
**Why:** Helps external contributors understand how to contribute, test, and follow conventions.

**Contents:**
- How to set up the dev environment
- How to run tests (`pnpm check`, `pnpm test`)
- Commit message conventions
- PR process
- Code style guidelines
- Where to ask questions

**File:** `/CONTRIBUTING.md`

**Estimated lines:** ~120 lines

---

### 2. GitHub Actions CI/CD
**Why:** Automated testing prevents broken commits from landing in main.

**What to add:**
- Workflow file: `.github/workflows/ci.yml`
- Jobs:
  - `pnpm install`
  - `pnpm check` (typecheck all packages)
  - `pnpm test` (run all tests)
  - matrix strategy: test on multiple Node versions (18, 20, 22)
- Run on: push to main, pull requests

**File:** `/.github/workflows/ci.yml`

**Estimated lines:** ~40 lines

---

### 3. Issue Templates
**Why:** Standardizes bug reports and feature requests from community.

**Templates to add:**
- Bug report: `.github/ISSUE_TEMPLATE/bug_report.md`
- Feature request: `.github/ISSUE_TEMPLATE/feature_request.md`
- Question: `.github/ISSUE_TEMPLATE/question.md`

**Files:**
- `/.github/ISSUE_TEMPLATE/bug_report.md` (~35 lines)
- `/.github/ISSUE_TEMPLATE/feature_request.md` (~30 lines)
- `/.github/ISSUE_TEMPLATE/question.md` (~20 lines)

**Total estimated lines:** ~85 lines across 3 files

---

### 4. Pull Request Template
**Why:** Ensures PRs include necessary context and checklist.

**File:** `/.github/pull_request_template.md`

**Estimated lines:** ~30 lines

---

### 5. Enhanced Example: Query Traces
**Why:** Shows users how to interact with the trace API programmatically.

**What to add:**
- New example: `examples/query-traces`
- Demonstrates:
  - Listing all traces
  - Fetching one trace by ID
  - Filtering events by traceId
  - Inspecting trace summary metadata

**Files:**
- `/examples/query-traces/package.json` (~15 lines)
- `/examples/query-traces/tsconfig.json` (~10 lines)
- `/examples/query-traces/src/index.ts` (~60 lines)

**Total estimated lines:** ~85 lines across 3 files

---

### 6. Enhanced Example: Inspect JSONL
**Why:** Teaches users how to manually inspect persisted storage.

**What to add:**
- New example: `examples/inspect-jsonl`
- Demonstrates:
  - Reading `./data/events.jsonl` directly
  - Parsing line-by-line
  - Grouping events by traceId
  - Showing how redaction appears in persisted format

**Files:**
- `/examples/inspect-jsonl/package.json` (~15 lines)
- `/examples/inspect-jsonl/tsconfig.json` (~10 lines)
- `/examples/inspect-jsonl/src/index.ts` (~80 lines)

**Total estimated lines:** ~105 lines across 3 files

---

### 7. Package Publish Setup
**Why:** Makes packages installable from npm for public consumption.

**What to change:**
- Update `package.json` in each publishable package:
  - Set `"private": false` for `@open-agent-recorder/core` and `@open-agent-recorder/node`
  - Add `"publishConfig"` with public access
  - Add keywords for discoverability
  - Ensure `files` field lists what to publish
  - Add repository, bugs, homepage URLs

**Files to update:**
- `/packages/core/package.json`
- `/packages/node/package.json`
- `/apps/collector/package.json` (stays private, deployed not published)

**Changes per file:** ~10 lines added/modified

---

### 8. Package-Level READMEs
**Why:** npm package pages need their own focused documentation.

**What to add:**
- `packages/core/README.md`: explains event schema, recorder, redaction
- `packages/node/README.md`: explains Node.js collector sink usage

**Files:**
- `/packages/core/README.md` (~80 lines)
- `/packages/node/README.md` (~70 lines)

**Total estimated lines:** ~150 lines across 2 files

---

### 9. Retention/Rotation Policy (Optional MVP+)
**Why:** Prevents unbounded JSONL file growth in production.

**What to add:**
- Env var: `COLLECTOR_MAX_EVENTS`
- Logic in storage to rotate or trim old events when limit reached
- Document in README

**Files to modify:**
- `/apps/collector/src/storage.ts` (~50 lines added)
- `/README.md` (document new env var, ~10 lines)

**Status:** OPTIONAL for initial public release, recommended for production use

---

### 10. Code of Conduct
**Why:** Sets community expectations for respectful collaboration.

**File:** `/CODE_OF_CONDUCT.md`

**Estimated lines:** ~80 lines (standard Contributor Covenant)

---

### 11. Security Policy
**Why:** Tells users how to report security issues responsibly.

**File:** `/SECURITY.md`

**Estimated lines:** ~30 lines

---

## Execution Order

To maximize readiness with minimal risk:

1. **Phase 1: Community Docs** (low risk, high value)
   - CONTRIBUTING.md
   - CODE_OF_CONDUCT.md
   - SECURITY.md
   - GitHub issue templates
   - PR template

2. **Phase 2: CI/CD** (automation)
   - GitHub Actions workflow

3. **Phase 3: Examples** (educational)
   - query-traces example
   - inspect-jsonl example

4. **Phase 4: Package Prep** (npm publishing)
   - Package-level READMEs
   - package.json updates for publish

5. **Phase 5: Optional Enhancements** (post-launch)
   - Retention/rotation policy

---

## File Creation Strategy (Respecting Chunking Limits)

All files listed are <350 lines, so:
- Each file can be written in **one operation**
- No chunking needed
- Safe and reliable writes

---

## Verification Steps After Implementation

1. Run `pnpm check` — must pass
2. Run `pnpm test` — must pass
3. Run `pnpm build` — must pass
4. Run `pnpm example:node` — must work
5. Start collector, POST event, query via new examples — must work
6. Check GitHub renders issue templates correctly
7. Verify CI runs on a test branch

---

## Ready to Execute?

This plan is complete and chunking-safe. All operations respect the 350-line limit.

Awaiting confirmation to proceed with Phase 1.
