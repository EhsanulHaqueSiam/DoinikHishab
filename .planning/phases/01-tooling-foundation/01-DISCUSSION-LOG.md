# Phase 1: Tooling Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 01-tooling-foundation
**Areas discussed:** Biome strictness strategy, Test file organization, i18n migration approach, Initial test coverage

---

## Biome Strictness Strategy

### Q1: How should Biome handle existing code on first run?

| Option | Description | Selected |
|--------|-------------|----------|
| Incremental (Recommended) | Start with essential rules only. Add stricter rules phase-by-phase. | |
| Strict from day one | Enable all recommended rules immediately. Fix every violation in one big cleanup commit. | ✓ |
| Format-only first | Start with formatting rules only, add lint rules later. | |

**User's choice:** Strict from day one
**Notes:** User wants a clean baseline from the start, willing to do the upfront cleanup work.

### Q2: Should Biome auto-format on save or just report errors?

| Option | Description | Selected |
|--------|-------------|----------|
| CI check only (Recommended) | Biome runs in CI and via `bun run lint`. No git hooks. | |
| Pre-commit hook | Auto-format staged files on every commit via pre-commit hook. | |
| Both CI + pre-commit | Belt and suspenders — pre-commit locally, CI catches anything that slips through. | ✓ |

**User's choice:** Both CI + pre-commit
**Notes:** None

### Q3: Which pre-commit hook tool?

| Option | Description | Selected |
|--------|-------------|----------|
| lefthook (Recommended) | Fast Go binary, zero npm dependencies, simple YAML config. | ✓ |
| husky + lint-staged | Most popular in JS ecosystem. npm-based. | |

**User's choice:** lefthook
**Notes:** None

---

## Test File Organization

### Q1: Where should test files live?

| Option | Description | Selected |
|--------|-------------|----------|
| Co-located (Recommended) | Tests next to source files in the same directory. | ✓ |
| Separate __tests__/ dirs | Mirror source structure in __tests__/ directories. | |
| Top-level tests/ dir | All tests in a single top-level tests/ directory. | |

**User's choice:** Co-located
**Notes:** None

### Q2: Should test files be excluded from Metro bundler?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, exclude (Recommended) | Add test file pattern to Metro's exclusion list. | ✓ |
| No, leave as-is | Metro already ignores non-imported files. | |

**User's choice:** Yes, exclude
**Notes:** None

---

## i18n Migration Approach

### Q1: How should we migrate from custom i18n to i18next?

| Option | Description | Selected |
|--------|-------------|----------|
| Full migration (Recommended) | Replace custom hook entirely with i18next + react-i18next. Clean break. | ✓ |
| Wrap existing system | Keep en.ts/bn.ts structure, replace only hook internals. | |
| Adapter pattern | Thin adapter exposing same API but using i18next internally. | |

**User's choice:** Full migration
**Notes:** None

### Q2: Translation file structure?

| Option | Description | Selected |
|--------|-------------|----------|
| One file per language (Recommended) | en.json and bn.json as single files with nested keys. | ✓ |
| Namespace per feature | Split into dashboard.json, transaction.json, etc. per language. | |
| You decide | Let Claude pick. | |

**User's choice:** One file per language
**Notes:** None

### Q3: Locale switching UX?

| Option | Description | Selected |
|--------|-------------|----------|
| Instant switch (Recommended) | react-i18next re-renders on language change. All text updates immediately. | ✓ |
| Restart required | Set locale in storage, user restarts app. | |

**User's choice:** Instant switch
**Notes:** Required by success criteria.

---

## Initial Test Coverage

### Q1: What should initial sample tests cover?

| Option | Description | Selected |
|--------|-------------|----------|
| Utilities + one component (Recommended) | Unit tests for pure functions PLUS one RNTL component test. | |
| Utilities only | Unit tests for pure functions only. No component tests yet. | |
| Full sample suite | Utilities + component tests + hook tests + store tests. All patterns. | ✓ |

**User's choice:** Full sample suite
**Notes:** User wants complete reference examples for every test pattern the project will use.

### Q2: Test scripts?

| Option | Description | Selected |
|--------|-------------|----------|
| Both (Recommended) | `bun run test` for CI + `bun run test:watch` for dev. | ✓ |
| Single run only | Just `bun run test`. | |

**User's choice:** Both
**Notes:** None

### Q3: Coverage reporting?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, with threshold | Configure coverage with minimum threshold. Fails CI if below. | ✓ |
| Yes, no threshold | Enable reporting for visibility, no enforcement. | |
| Not yet (Recommended) | Skip coverage for now. | |

**User's choice:** Yes, with threshold
**Notes:** User chose against the recommended option — wants coverage enforcement from day one.

### Q4: Coverage threshold?

| Option | Description | Selected |
|--------|-------------|----------|
| 50% (Recommended) | Reasonable starting point for no-test project. | |
| 70% | More ambitious. | |
| 80%+ | Industry standard for mature projects. Aggressive for first setup. | ✓ |

**User's choice:** 80%+
**Notes:** User wants a high bar from the start despite it being the first test phase.

### Q5: Coverage scope?

| Option | Description | Selected |
|--------|-------------|----------|
| src/ only (Recommended) | Frontend code only. Excludes convex/ and app/. | |
| src/ + convex/ | Both frontend and Convex backend functions. | ✓ |
| Utility code only | Only src/lib/ and src/services/. | |

**User's choice:** src/ + convex/
**Notes:** None

### Q6: Keep 80% with broader scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 80% | Ambitious but sets high standard. | ✓ |
| 80% for src/, 50% for convex/ | Separate thresholds per layer. | |
| Start at 50%, ratchet up | Progressive tightening each phase. | |

**User's choice:** Keep 80%
**Notes:** User confirmed 80% across all code despite the broad scope. Intentionally ambitious.

---

## Claude's Discretion

- Jest configuration details (transform, moduleNameMapper, setup files)
- Convex test mocking strategy
- Bengali pluralization polyfill approach
- Biome rule selection specifics
- lefthook configuration

## Deferred Ideas

None — discussion stayed within phase scope
