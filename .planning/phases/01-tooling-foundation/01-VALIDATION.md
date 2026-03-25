---
phase: 1
slug: tooling-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 via jest-expo ~55.0.11 |
| **Config file** | `jest.config.js` (Wave 0 installs) |
| **Quick run command** | `bun run test` |
| **Full suite command** | `bun run test -- --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test` + `bun run lint`
- **After every plan wave:** Run `bun run test -- --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green + `biome check` clean
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | TOOL-01 | smoke | `bunx @biomejs/biome check app/ src/ convex/` | N/A (CLI) | ⬜ pending |
| 01-02-01 | 02 | 1 | TOOL-02 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | TOOL-02 | unit | `bun run test -- --coverage` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | TOOL-05 | unit | `bun run test -- src/lib/i18n` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | TOOL-05 | unit | `bun run test -- src/lib/i18n` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 1 | TOOL-05 | manual | Manual verification in app | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Jest configuration file
- [ ] `jest.setup.js` — Setup file for polyfills and global mocks
- [ ] `biome.json` — Biome configuration
- [ ] `lefthook.yml` — Pre-commit hook configuration
- [ ] Framework install: `bun add -d jest-expo jest @types/jest @testing-library/react-native @biomejs/biome`

*Wave 0 is built into Plan 01 (Biome) and Plan 02 (Jest) — no separate wave needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Language switching updates all visible text instantly | TOOL-05 | Requires visual inspection of UI re-render | 1. Open app 2. Go to settings 3. Switch language 4. Verify all visible text changed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
