# Phase 7: Deployment & E2E Testing - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure expo-updates for OTA deployment with fingerprint-based runtime versioning, three update channels (production/preview/development), foreground update checks with toast notification, and automatic rollback. Set up Maestro E2E test framework with YAML flows covering 3 critical user paths and GitHub Actions CI integration.

</domain>

<decisions>
## Implementation Decisions

### OTA Updates
- **D-01:** Three update channels: production, preview, development — channel assignment in eas.json profiles
- **D-02:** Check on app foreground via `Updates.checkForUpdateAsync()` in `_layout.tsx` — subtle toast via sonner-native when update available, auto-applies on next launch
- **D-03:** Fingerprint safety via `"runtimeVersion": { "policy": "fingerprint" }` — expo-updates built-in fingerprint check. Native code changes bump runtime version automatically, preventing OTA mismatch
- **D-04:** Automatic rollback via expo-updates built-in — if an OTA update crashes on launch, rolls back to previous working version. No custom logic needed

### E2E Testing
- **D-05:** Maestro YAML-based E2E testing — no code needed for flows, built-in testID matching, works with Expo development builds
- **D-06:** Three critical flows: (1) Add transaction via QuickAdd 3-tap, (2) View budget — navigate + check categories visible, (3) Navigate reports — tab between charts
- **D-07:** GitHub Actions CI workflow — runs Maestro tests against Android emulator on push to master
- **D-08:** Use existing mock data — tests run against mock data hooks since Convex is offline. No test database seeding needed

### Claude's Discretion
- Update toast notification design and timing
- Maestro flow YAML structure and assertions
- CI workflow caching and optimization
- Emulator configuration for CI

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app.json` — Expo config, needs expo-updates configuration
- `eas.json` — EAS Build config, needs update channel profiles
- `.github/workflows/build.yml` — Existing CI workflow to extend
- `app/_layout.tsx` — Root layout for update check hook
- `sonner-native` — Already installed for toast notifications
- `expo-updates` — Needs to be installed

### Established Patterns
- EAS Build profiles in eas.json (development, preview, production)
- GitHub Actions for CI/CD (existing build.yml workflow)
- Root layout initialization pattern in _layout.tsx
- Toast notifications via sonner-native

### Integration Points
- `app.json` — Add expo-updates config
- `eas.json` — Add update channels to profiles
- `_layout.tsx` — Add useEffect for update check
- `.github/workflows/` — New e2e.yml workflow
- `.maestro/` — New directory for test flows

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
