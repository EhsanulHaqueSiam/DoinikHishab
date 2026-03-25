# DoinikHishab (দৈনিক হিসাব)

## What This Is

A personal money tracking app for Bangladeshis that mashes YNAB's envelope budgeting ideology with Monarch Money's feature completeness. Designed for solo users who manually enter transactions (no bank sync in Bangladesh). The primary differentiator is a 3-tap transaction entry flow and YNAB's "give every taka a job" philosophy adapted for the Bangladesh market — Eid funds, school fees, wedding gifts, medical reserves.

## Core Value

**3-tap manual transaction entry with envelope budgeting that changes how Bangladeshi users think about money.** If the input is fast and the budget view makes users feel in control, everything else is secondary.

## Requirements

### Validated

- ✓ Dashboard with total balance, budget/tracking split — existing
- ✓ Transaction CRUD with categories and flags — existing
- ✓ YNAB-style envelope budgeting with monthly assignment — existing
- ✓ Account management (cash, bank, credit card, loans, assets) — existing
- ✓ Reports: spending by category, income vs expense, net worth — existing
- ✓ AI features with configurable provider (BYOK) — existing
- ✓ Reconciliation flow — existing
- ✓ Bengali/English language support (basic) — existing
- ✓ BDT currency in paisa (integer cents) — existing
- ✓ Dark theme (Obsidian Finance aesthetic) — existing
- ✓ Cross-platform: Android, iOS, Web — existing
- ✓ GitHub Actions CI/CD (free, unlimited builds) — existing

### Active

**Tooling & DX:**
- [ ] Biome for linting/formatting (replace manual style enforcement)
- [ ] Vitest + React Native Testing Library for unit/integration tests
- [ ] expo-updates for OTA updates
- [ ] Maestro for E2E tests
- [ ] expo-localization + i18next for proper BN/EN internationalization
- [ ] Upgrade to Tailwind v4 + NativeWind v5

**YNAB Ideology Features:**
- [ ] YNAB 4 rules education in onboarding flow
- [ ] True Expenses / Sinking Funds (Eid, school, wedding, medical)
- [ ] Age of Money metric
- [ ] Days of Buffering metric
- [ ] "Give every taka a job" language throughout UI

**Monarch Money Features:**
- [ ] Sankey cash flow diagram
- [ ] Recurring transaction calendar view
- [ ] Goals 3.0 debt payoff system
- [ ] Subscription tracking and detection
- [ ] Cash flow forecasting

**UX Improvements:**
- [ ] 3-tap transaction entry (Amount → Category → Save)
- [ ] Mobile-first reports and analytics
- [ ] bKash/Nagad CSV import
- [ ] Improved onboarding flow

### Out of Scope

- Bank sync / Plaid integration — no bank API support in Bangladesh
- Investment portfolio tracking — too complex for v1, defer to v2
- Multi-user / family sharing — Clerk auth comes later, solo focus for now
- Authentication (Clerk) — deferred, local-only for now
- Desktop-only features — mobile-first always
- Cryptocurrency tracking — out of scope

## Context

- **Market:** Bangladesh — no bank sync APIs exist, every transaction is manual entry. bKash/Nagad mobile wallets dominate payments. Users think in BDT taka.
- **Competitor research:** Comprehensive 880-line analysis of YNAB and Monarch Money at `.planning/research/MONARCH-YNAB-RESEARCH.md`
- **Codebase:** Brownfield — Expo 55, React Native 0.83, Convex backend, NativeWind v4, Zustand. Codebase map at `.planning/codebase/`
- **Convex backend:** Currently disabled (free plan limit). Development continues without backend. Will re-enable next month.
- **Design system:** "Obsidian Finance" — deep layered dark surfaces, teal primary, saffron accent, SpaceMono font, precision typography
- **User persona:** Bangladeshi individual (student, professional, freelancer) tracking daily expenses on their phone

## Constraints

- **Tech stack**: Expo + React Native + Convex — locked, no switching
- **Package manager**: Bun — not npm/yarn
- **Styling**: NativeWind (Tailwind CSS for RN) — upgrading to v5
- **No bank sync**: All transactions manual — input speed is critical
- **Convex offline**: Backend disabled until next month — develop UI/UX without live data
- **Budget**: Free tier everything — no paid services
- **Device**: Mobile-first, web secondary — most users on Android phones

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| YNAB envelope budgeting as core ideology | Proven methodology, changes financial behavior | ✓ Good |
| Manual-only transactions (no bank sync) | Bangladesh has no bank APIs, bKash/Nagad domination | ✓ Good |
| NativeWind v5 + Tailwind v4 upgrade | Better perf, CSS variables, modern stack | — Pending |
| Biome over ESLint/Prettier | Faster, single tool, better DX | — Pending |
| Vitest over Jest | Faster, ESM-native, better DX | — Pending |
| No auth for now (Clerk later) | Focus on UI/UX and ideology first | — Pending |
| Solo user first, family later | Simpler scope, validate core first | — Pending |
| 3-tap transaction entry | Key differentiator vs YNAB's 5-11 step flow | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after project initialization*
