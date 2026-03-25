# Research Summary: DoinikHishab Tooling & DX Upgrades

**Domain:** Tooling and developer experience upgrades for an existing Expo React Native personal finance app
**Researched:** 2026-03-25
**Overall confidence:** MEDIUM-HIGH

## Executive Summary

This research covers six upgrades planned for the DoinikHishab codebase: Biome (linting/formatting), Jest + RNTL (unit testing), expo-updates (OTA updates), Maestro (E2E testing), expo-localization + i18next (internationalization), and NativeWind v5 + Tailwind v4 (styling upgrade).

Five of the six upgrades are straightforward with high confidence. Biome v2.4.9 is a mature, fast linting/formatting tool that replaces the need for ESLint + Prettier. Jest with jest-expo remains the correct testing choice for React Native (Vitest is NOT ready for RN). expo-updates with EAS Update free tier provides OTA updates with zero infrastructure cost. Maestro is the de facto E2E testing tool for React Native with YAML-based flows. i18next + react-i18next is the industry standard for i18n, significantly more capable than the app's current custom solution.

The one risky upgrade is NativeWind v5 + Tailwind CSS v4. NativeWind v5 is still in pre-release (5.0.0-preview.3) and explicitly "not intended for production use." The migration involves breaking changes across config files, CSS, and component APIs. The recommendation is to defer this upgrade until NativeWind v5 reaches stable release, and do everything else first.

The existing codebase is well-positioned for these upgrades. React Native 0.83.2 and Expo SDK 55 are compatible with all recommended tools. The Convex backend does not interfere with any of these upgrades (it only needs mocking in tests). The current custom i18n system with ~100 translation keys across Bengali and English is small enough to migrate cleanly to i18next.

## Key Findings

**Stack:** Biome 2.4.9, Jest + jest-expo + @testing-library/react-native, expo-updates with EAS Update free tier, Maestro 2.3.0, i18next 25.x + react-i18next 16.x + expo-localization, NativeWind v5 deferred.

**Architecture:** No architectural changes needed. All upgrades are additive tooling that operates alongside existing code. i18next replaces a custom module but the interface shape (t function) stays the same.

**Critical pitfall:** NativeWind v5 is pre-release. Attempting to upgrade before stable release risks broken styling, build failures, and time lost debugging pre-release bugs. Defer it.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Biome Setup** -- Lowest risk, highest immediate DX impact
   - Addresses: Linting/formatting enforcement
   - Avoids: No dependencies on other upgrades
   - Effort: ~1 hour

2. **Testing Infrastructure (Jest + RNTL)** -- Foundation for quality
   - Addresses: Unit/integration test capability
   - Avoids: Vitest trap (not ready for RN)
   - Effort: ~2-3 hours setup, ongoing for writing tests

3. **Internationalization (i18next)** -- Replaces custom code
   - Addresses: Proper BN/EN i18n with interpolation, plurals
   - Avoids: Growing the custom i18n system further
   - Effort: ~3-4 hours (convert translations, update imports)

4. **OTA Updates (expo-updates)** -- Deployment improvement
   - Addresses: Ship JS changes without app store review
   - Avoids: Self-hosted OTA server complexity
   - Effort: ~1-2 hours

5. **E2E Testing (Maestro)** -- Requires working app flows to test
   - Addresses: End-to-end UI testing
   - Avoids: Detox complexity
   - Effort: ~2 hours setup, ongoing for writing flows

6. **NativeWind v5 + Tailwind v4** -- DEFER until stable
   - Addresses: Modern styling infrastructure
   - Avoids: Pre-release instability
   - Effort: ~4-6 hours (high, due to breaking changes)

**Phase ordering rationale:**
- Biome first: zero risk, immediate value, no dependencies
- Tests second: enables validation of subsequent changes
- i18n third: replaces custom code before it grows further; tests can validate the migration
- OTA fourth: deployment improvement, independent of code changes
- Maestro fifth: needs testID props in components and working flows to test
- NativeWind v5 last: highest risk, most breaking changes, defer until stable

**Research flags for phases:**
- Phase 6 (NativeWind v5): NEEDS deeper research when attempted -- check if stable release has shipped, review any new breaking changes
- Phase 3 (i18n): May need research on Bengali pluralization rules in i18next
- All others: Standard patterns, unlikely to need additional research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Biome | HIGH | Stable v2.4.9, well-documented, no RN-specific issues |
| Jest + RNTL | HIGH | Official Expo tooling, battle-tested |
| expo-updates | HIGH | Core Expo package, free tier sufficient |
| Maestro | HIGH | De facto RN E2E tool, Expo-endorsed |
| i18next | HIGH | Industry standard, well-documented RN integration |
| NativeWind v5 | LOW | Pre-release, breaking changes, no stable date announced |

## Gaps to Address

- NativeWind v5 stable release timeline unknown -- monitor GitHub releases
- Bengali-specific i18next features (number formatting, pluralization rules) not deeply investigated -- may need phase-specific research
- Convex mocking strategy for Jest not researched in depth -- need to determine mock patterns for queries/mutations
- Maestro CI integration with GitHub Actions (not EAS Workflows) needs tested -- project uses GitHub Actions, not EAS
- jest-expo exact version compatibility with Expo SDK 55 not pinpointed -- use `npx expo install` to get matched version
