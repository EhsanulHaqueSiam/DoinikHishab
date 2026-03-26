# Phase 7: Deployment & E2E Testing - Research

**Researched:** 2026-03-26
**Domain:** OTA Updates (expo-updates + EAS Update) and E2E Testing (Maestro)
**Confidence:** HIGH

## Summary

This phase configures two distinct systems: (1) OTA JavaScript updates via expo-updates with EAS Update, and (2) Maestro YAML-based E2E testing with GitHub Actions CI. Both are well-documented, mature Expo ecosystem tools with clear configuration paths.

expo-updates ~55.0.15 is the SDK 55-compatible version. It requires adding the package, configuring `app.json` with `updates.url` and `runtimeVersion` fingerprint policy, adding `channel` properties to `eas.json` build profiles, and wiring an update check into `_layout.tsx` using `AppState` foreground detection with `sonner-native` toast notifications.

Maestro is a YAML-based mobile E2E testing framework that maps React Native `testID` props to `id:` selectors. The project currently has zero `testID` props on screens/tab-level components (only a few in chart subcomponents), so adding testIDs to critical flow elements is a prerequisite. CI runs on `ubuntu-latest` with KVM-accelerated Android emulators via `reactivecircus/android-emulator-runner`.

**Primary recommendation:** Install expo-updates, configure fingerprint runtime versioning + 3 channels in eas.json, add foreground update check hook to root layout, then create `.maestro/` flows for 3 critical paths with testIDs added to target components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Three update channels: production, preview, development -- channel assignment in eas.json profiles
- **D-02:** Check on app foreground via `Updates.checkForUpdateAsync()` in `_layout.tsx` -- subtle toast via sonner-native when update available, auto-applies on next launch
- **D-03:** Fingerprint safety via `"runtimeVersion": { "policy": "fingerprint" }` -- expo-updates built-in fingerprint check. Native code changes bump runtime version automatically, preventing OTA mismatch
- **D-04:** Automatic rollback via expo-updates built-in -- if an OTA update crashes on launch, rolls back to previous working version. No custom logic needed
- **D-05:** Maestro YAML-based E2E testing -- no code needed for flows, built-in testID matching, works with Expo development builds
- **D-06:** Three critical flows: (1) Add transaction via QuickAdd 3-tap, (2) View budget -- navigate + check categories visible, (3) Navigate reports -- tab between charts
- **D-07:** GitHub Actions CI workflow -- runs Maestro tests against Android emulator on push to master
- **D-08:** Use existing mock data -- tests run against mock data hooks since Convex is offline. No test database seeding needed

### Claude's Discretion
- Update toast notification design and timing
- Maestro flow YAML structure and assertions
- CI workflow caching and optimization
- Emulator configuration for CI

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOOL-03 | expo-updates configured with EAS Update free tier for OTA JavaScript updates without app store review | expo-updates ~55.0.15 compatible with SDK 55; fingerprint policy for runtime versioning; EAS Update free tier supports 1,000 MAU + 100 GiB bandwidth; 3-channel architecture (production/preview/development) |
| TOOL-04 | Maestro E2E test framework configured with YAML-based flows for critical user paths | Maestro CLI with YAML flows; testID-to-id selector mapping for React Native; GitHub Actions CI with KVM-accelerated Android emulator; 3 critical flows mapped to existing screens |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun only -- `bun add`, not npm/yarn
- **Styling:** NativeWind v4 with `className` props
- **No paid services:** Free tier everything -- EAS Update free tier (1,000 MAU) is sufficient
- **Convex offline:** Backend disabled -- Maestro tests run against mock data
- **Android-first:** Most users on Android phones -- E2E tests target Android emulator
- **Git commits:** No Co-Authored-By Claude attribution line
- **CI/CD:** GitHub Actions only, no EAS Build for releases

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-updates | ~55.0.15 | OTA update runtime client | Official Expo SDK 55 package; handles update fetching, applying, rollback |
| Maestro CLI | latest | E2E test runner | De facto standard for React Native E2E; YAML-based, no code required |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner-native | ^0.23.1 (already installed) | Toast notification for update availability | Show subtle toast when OTA update downloaded |
| reactivecircus/android-emulator-runner | v2 | GitHub Actions Android emulator | CI workflow for Maestro tests |
| dniHze/maestro-test-action | v1 | GitHub Actions Maestro installer | Installs and caches Maestro CLI in CI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Maestro | Detox | Detox requires Jest + native build integration, much heavier setup; Maestro is YAML-only |
| EAS Update | CodePush | CodePush is deprecated by Microsoft; EAS Update is the Expo-native solution |
| ubuntu-latest runner | macOS runner | macOS is 10x more expensive on GitHub Actions; ubuntu with KVM is now recommended and faster |

**Installation:**
```bash
bun add expo-updates@~55.0.15
```

Maestro is not an npm dependency -- it is installed via CLI in CI and optionally locally:
```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

## Architecture Patterns

### Recommended Project Structure
```
.maestro/                    # Maestro E2E test flows
  config.yaml               # Global Maestro config (appId)
  add-transaction.yaml       # Flow 1: QuickAdd 3-tap
  view-budget.yaml           # Flow 2: Navigate to budget, check categories
  navigate-reports.yaml      # Flow 3: Navigate reports, tab between views
app/
  _layout.tsx                # Add useUpdateCheck() hook here
src/
  hooks/
    use-update-check.ts      # OTA update check hook (foreground detection)
```

### Pattern 1: Foreground Update Check Hook
**What:** A custom hook that checks for OTA updates when the app comes to foreground, shows a toast if available, and auto-applies on next launch.
**When to use:** In `_layout.tsx` root component, always active in production builds.
**Example:**
```typescript
// src/hooks/use-update-check.ts
// Source: https://docs.expo.dev/versions/latest/sdk/updates/
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { AppState } from "react-native";
import { toast } from "sonner-native";

export function useUpdateCheck() {
  useEffect(() => {
    // Only check in production builds, not in dev
    if (__DEV__) return;

    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "active") {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            toast.success("Update downloaded. Restart to apply.", {
              duration: 4000,
            });
            // Update auto-applies on next app launch (no forced reload)
          }
        } catch (error) {
          // Silent failure -- update checks are non-critical
          console.error("Update check failed:", error);
        }
      }
    });

    return () => subscription.remove();
  }, []);
}
```

### Pattern 2: app.json Updates Configuration
**What:** Configure expo-updates in app.json with EAS Update URL and fingerprint runtime versioning.
**When to use:** One-time setup before first OTA update.
**Example:**
```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "fingerprint"
    },
    "updates": {
      "url": "https://u.expo.dev/[PROJECT_ID]",
      "enabled": true,
      "checkAutomatically": "ON_ERROR_RECOVERY"
    },
    "extra": {
      "eas": {
        "projectId": "[PROJECT_ID]"
      }
    }
  }
}
```
Note: `checkAutomatically` is set to `ON_ERROR_RECOVERY` because the custom hook handles foreground checking. The built-in `ON_LOAD` check would be redundant.

### Pattern 3: eas.json Channel Configuration
**What:** Add `channel` property to each build profile in eas.json.
**When to use:** One-time setup for update channel routing.
**Example:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### Pattern 4: Maestro YAML Flow with testID Selectors
**What:** Maestro flows use `id:` selector which maps to React Native `testID` props.
**When to use:** All E2E test flows.
**Example:**
```yaml
# .maestro/add-transaction.yaml
appId: com.doinikhishab.app
---
- launchApp
- tapOn:
    id: "tab-dashboard"
- assertVisible:
    id: "quick-add-fab"
- tapOn:
    id: "quick-add-fab"
- assertVisible:
    id: "amount-pad"
- tapOn:
    id: "keypad-5"
- tapOn:
    id: "keypad-0"
- tapOn:
    id: "keypad-0"
- tapOn:
    id: "amount-next"
- assertVisible:
    id: "category-grid"
- tapOn:
    id: "category-item-0"
# Transaction auto-saves on category select (3-tap flow)
- assertVisible:
    id: "quick-add-fab"
```

### Pattern 5: GitHub Actions Maestro CI Workflow
**What:** CI workflow builds Android APK, starts emulator with KVM, installs APK, runs Maestro flows.
**When to use:** Separate workflow file `.github/workflows/e2e.yml`.
**Example:**
```yaml
name: E2E Tests
on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: temurin
      - name: Enable KVM
        run: |
          echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666", OPTIONS+="static_node=kvm"' | sudo tee /etc/udev/rules.d/99-kvm4all.rules
          sudo udevadm control --reload-rules
          sudo udevadm trigger --name-match=kvm
      - uses: dniHze/maestro-test-action@v1
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile || bun install
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: bunx expo prebuild --platform android --clean --no-install
      - run: cd android && ./gradlew app:assembleDebug --no-daemon
      - uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 30
          arch: x86_64
          target: default
          script: |
            adb install android/app/build/outputs/apk/debug/*.apk
            maestro test .maestro/ --format junit --output maestro-report.xml
```

### Anti-Patterns to Avoid
- **Forcing reload on update download:** Do NOT call `Updates.reloadAsync()` immediately after fetch. This interrupts the user mid-task. Let the update apply on next natural app launch.
- **Polling for updates in a loop:** Check on foreground only, never in a setInterval. Rate limiting by Expo will reject frequent calls.
- **Using text selectors in Maestro over testID:** Text changes with i18n locale. Always use `id:` selector mapped to `testID` props.
- **Running emulator on macOS runner:** macOS runners are 10x more expensive. Ubuntu with KVM is now recommended by GitHub and is faster.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OTA update delivery | Custom update server | EAS Update free tier | Handles binary compatibility, CDN distribution, rollback, channel routing |
| Runtime version calculation | Manual version bumping | Fingerprint policy | Automatically detects native code changes; prevents JS/native mismatch |
| Rollback on crash | Custom crash detection + rollback logic | expo-updates built-in anti-bricking | Automatic -- if OTA update crashes on launch, falls back to last known good |
| E2E test framework | Custom test scripts | Maestro YAML flows | Cross-platform, no code, built-in retry, recording, screenshots |
| Android emulator in CI | Docker Android containers | reactivecircus/android-emulator-runner | Battle-tested, KVM-accelerated, handles SDK installation |

**Key insight:** Both expo-updates and Maestro are designed to be zero-code configuration tools. The work is in wiring config files correctly, not writing logic.

## Common Pitfalls

### Pitfall 1: Missing EAS Project ID
**What goes wrong:** expo-updates requires `extra.eas.projectId` in app.json. Without it, update URL resolution fails silently.
**Why it happens:** The project does not currently have a projectId configured. Running `eas update:configure` would set it, but EAS CLI is not installed locally.
**How to avoid:** Manually add the projectId from the Expo dashboard, or install EAS CLI globally (`npm install -g eas-cli`) and run `eas update:configure`.
**Warning signs:** `Updates.checkForUpdateAsync()` throws with "No update URL configured".

### Pitfall 2: Fingerprint Policy + CNG Interaction
**What goes wrong:** Fingerprint policy hashes all native project files. With Continuous Native Generation (expo prebuild), the fingerprint can change between machines if prebuild output differs.
**Why it happens:** Different Node versions, OS, or Expo CLI versions produce slightly different native projects.
**How to avoid:** Always publish updates from CI (consistent environment), never from local dev machine. The fingerprint is calculated at build time and at update publish time -- they must match.
**Warning signs:** Update published but device reports "No compatible update available".

### Pitfall 3: No testID Props on Components
**What goes wrong:** Maestro cannot find elements to interact with. Flows fail with "element not found" timeouts.
**Why it happens:** The project currently has ZERO testID props on screen-level components, tab navigation, QuickAdd FAB, or budget categories. Only a few chart subcomponents have testIDs.
**How to avoid:** Add testID props to all elements that Maestro flows will interact with BEFORE writing flow files.
**Warning signs:** Maestro Studio shows no selectable elements.

### Pitfall 4: Android Emulator Boot Timeout in CI
**What goes wrong:** Emulator fails to boot within the default timeout, causing workflow failure.
**Why it happens:** Ubuntu runners without KVM are too slow. Even with KVM, high API levels (34+) take longer to boot.
**How to avoid:** Always enable KVM with the udev rule. Use API level 30 (stable, fast boot). Set emulator-boot-timeout to 600 seconds.
**Warning signs:** "Timed out waiting for emulator to boot" in CI logs.

### Pitfall 5: Updates Not Working in Development Builds
**What goes wrong:** `checkForUpdateAsync()` throws in development mode and Expo Go.
**Why it happens:** OTA updates only work in production/preview builds (standalone APK/AAB).
**How to avoid:** Guard with `if (__DEV__) return;` in the update check hook. Never test OTA flow in Expo Go.
**Warning signs:** "Updates.checkForUpdateAsync() is not supported in development" error.

### Pitfall 6: Onboarding Redirect Blocks E2E Tests
**What goes wrong:** App redirects to onboarding flow on fresh install, preventing Maestro from reaching the main tabs.
**Why it happens:** The root layout checks `isOnboardingComplete()` from MMKV. Fresh emulator = no MMKV data = forced onboarding.
**How to avoid:** Either (a) create a Maestro sub-flow that completes onboarding first, or (b) pre-seed MMKV state before tests. Option (a) is simpler and tests onboarding too.
**Warning signs:** Maestro flows time out waiting for dashboard elements that never appear.

### Pitfall 7: EAS Update Free Tier Limits
**What goes wrong:** Updates stop being served after hitting the 1,000 MAU or 100 GiB bandwidth limit.
**Why it happens:** Free tier has monthly limits that reset each calendar month.
**How to avoid:** For a personal/small-user app this is unlikely to be hit. Monitor usage in the Expo dashboard. The Starter plan ($19/mo) raises the limit to 3,000 MAU.
**Warning signs:** Update check returns no updates when one is published.

## Code Examples

### Adding testID Props to Components (Prerequisite)

The following components need testID props added for Maestro flows:

```typescript
// app/(tabs)/_layout.tsx -- Tab bar items
// Tabs component doesn't directly support testID on tab items.
// Instead, add testID to the tab screen containers or use Maestro text matching for tab labels.

// src/components/transaction/QuickAdd.tsx -- Add to key interactive elements
<Pressable testID="quick-add-fab" onPress={openQuickAdd}>
  {/* FAB button */}
</Pressable>

// src/components/transaction/AmountPad.tsx -- Keypad buttons
<Pressable testID={`keypad-${digit}`} onPress={() => handleDigit(digit)}>
  {/* digit button */}
</Pressable>

// src/components/transaction/CategoryGrid.tsx -- Category items
<Pressable testID={`category-item-${index}`} onPress={() => handleSelect(category)}>
  {/* category card */}
</Pressable>
```

### Complete Maestro Flow: View Budget
```yaml
# .maestro/view-budget.yaml
appId: com.doinikhishab.app
---
- launchApp
- tapOn: "BUDGET"              # Tab label (UPPER_SNAKE from tabBarLabelStyle)
- assertVisible:
    id: "budget-screen"
- assertVisible:
    id: "ready-to-assign"
- scrollUntilVisible:
    element:
      id: "category-group-0"
    direction: DOWN
- assertVisible:
    id: "category-group-0"
```

### Complete Maestro Flow: Navigate Reports
```yaml
# .maestro/navigate-reports.yaml
appId: com.doinikhishab.app
---
- launchApp
- tapOn: "REPORTS"
- assertVisible:
    id: "reports-screen"
- tapOn:
    id: "report-tab-spending"
- assertVisible:
    id: "spending-chart"
- tapOn:
    id: "report-tab-income-expense"
- assertVisible:
    id: "income-expense-chart"
```

### Update Check Hook Integration in Root Layout
```typescript
// app/_layout.tsx -- Add hook call
import { useUpdateCheck } from "../src/hooks/use-update-check";

export default function RootLayout() {
  useUpdateCheck(); // Add this line after other hooks
  // ... rest of existing layout code
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CodePush (Microsoft) | EAS Update | 2023 (CodePush deprecated) | EAS Update is the only maintained OTA solution for Expo |
| macOS runners for Android CI | Ubuntu + KVM | April 2024 (GitHub Actions KVM support) | 2-3x faster, 10x cheaper than macOS runners |
| Detox for RN E2E | Maestro YAML | 2023-2024 (Maestro matured) | No code, cross-platform, easier CI setup |
| Manual runtimeVersion strings | Fingerprint policy | 2024 (expo-fingerprint stable) | Automatic native change detection, no manual bumping |
| `checkAutomatically: "ON_LOAD"` | Custom foreground hook | Current best practice | More control, toast notification, no forced reload |

**Deprecated/outdated:**
- CodePush: Deprecated by Microsoft, do not use
- Detox: Still works but Maestro is simpler for YAML-based flows
- `appVersion` runtime policy: Less protective than fingerprint; requires manual version bumps

## Open Questions

1. **EAS Project ID**
   - What we know: The project needs an `extra.eas.projectId` in app.json for expo-updates to work. This comes from the Expo dashboard after linking the project.
   - What's unclear: Whether the user has already linked this project to an Expo account. EAS CLI is not installed locally.
   - Recommendation: Include a setup step to install EAS CLI (`npm install -g eas-cli`), run `eas login`, and `eas update:configure` to auto-populate the projectId. Alternatively, manually copy the projectId from expo.dev dashboard.

2. **Maestro Test Against Debug vs Release APK**
   - What we know: Maestro can test against both debug and release APK. Debug APK is faster to build in CI.
   - What's unclear: Whether mock data hooks work the same in release builds (since `__DEV__` is false in release).
   - Recommendation: Use debug APK for E2E tests in CI. The mock data hooks use a Convex offline fallback pattern that works regardless of `__DEV__` flag (they check if Convex returns undefined/null).

3. **Onboarding Flow in E2E**
   - What we know: Fresh emulator install will trigger onboarding redirect. Tests need to either complete onboarding or bypass it.
   - What's unclear: Exact interaction sequence to complete onboarding in Maestro.
   - Recommendation: Create a reusable onboarding sub-flow (`.maestro/shared/complete-onboarding.yaml`) that each test flow includes via `runFlow`. This is more robust than MMKV pre-seeding which requires ADB commands.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Java | Maestro CLI, Gradle builds | Yes | OpenJDK 26.0.2 | -- |
| ADB | Android emulator interaction | Yes | 1.0.41 | -- |
| Bun | Package management | Yes | (system) | -- |
| EAS CLI | `eas update:configure`, publishing updates | No | -- | Manual config in app.json, or install via `npm install -g eas-cli` |
| Maestro CLI | Local E2E testing | No | -- | Install via `curl -fsSL "https://get.maestro.mobile.dev" \| bash`; CI uses dniHze/maestro-test-action |
| Android Emulator | Local Maestro testing | Yes (via ADB) | -- | CI uses reactivecircus/android-emulator-runner |
| GitHub Actions KVM | CI emulator acceleration | Yes (ubuntu-latest) | -- | -- |

**Missing dependencies with no fallback:**
- None -- all missing tools can be installed

**Missing dependencies with fallback:**
- EAS CLI: Not installed locally. Can install globally or configure app.json manually.
- Maestro CLI: Not installed locally. Install script available. CI workflow handles its own installation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo 55 (unit/integration); Maestro CLI (E2E) |
| Config file | `jest.config.js` (unit); `.maestro/` directory (E2E) |
| Quick run command | `bun run test` (unit); `maestro test .maestro/` (E2E, local only) |
| Full suite command | `bun run test && maestro test .maestro/` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOOL-03 | expo-updates configured, update check runs on foreground | unit | `bun run test -- --testPathPattern use-update-check` | No -- Wave 0 |
| TOOL-03 | Fingerprint runtime versioning in app.json | manual | Verify `runtimeVersion.policy === "fingerprint"` in app.json | N/A (config check) |
| TOOL-03 | Three channels configured in eas.json | manual | Verify `channel` property in each eas.json profile | N/A (config check) |
| TOOL-04 | Maestro add-transaction flow passes | e2e | `maestro test .maestro/add-transaction.yaml` | No -- Wave 0 |
| TOOL-04 | Maestro view-budget flow passes | e2e | `maestro test .maestro/view-budget.yaml` | No -- Wave 0 |
| TOOL-04 | Maestro navigate-reports flow passes | e2e | `maestro test .maestro/navigate-reports.yaml` | No -- Wave 0 |
| TOOL-04 | CI workflow runs Maestro tests on push | manual | Check `.github/workflows/e2e.yml` exists and runs | N/A (CI check) |

### Sampling Rate
- **Per task commit:** `bun run test` (unit tests only -- Maestro requires emulator)
- **Per wave merge:** `bun run test` + manual Maestro local run if emulator available
- **Phase gate:** All Maestro flows pass locally; CI workflow file validated by dry-run

### Wave 0 Gaps
- [ ] `src/hooks/use-update-check.ts` -- new hook for foreground update checking
- [ ] `src/hooks/use-update-check.test.ts` -- unit test for update check hook (mock expo-updates)
- [ ] `.maestro/add-transaction.yaml` -- E2E flow for 3-tap QuickAdd
- [ ] `.maestro/view-budget.yaml` -- E2E flow for budget navigation
- [ ] `.maestro/navigate-reports.yaml` -- E2E flow for reports navigation
- [ ] `.github/workflows/e2e.yml` -- CI workflow for Maestro tests
- [ ] testID props on ~15-20 interactive components (QuickAdd, AmountPad, CategoryGrid, tab screens, budget screen, reports screen)

## Sources

### Primary (HIGH confidence)
- [Expo Updates SDK docs](https://docs.expo.dev/versions/latest/sdk/updates/) - API reference, useUpdates hook, checkForUpdateAsync, configuration
- [EAS Update Getting Started](https://docs.expo.dev/eas-update/getting-started/) - Setup steps, eas update:configure, channel configuration
- [EAS Update Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/) - Fingerprint policy, appVersion policy, native version policy
- [EAS Update Deployment](https://docs.expo.dev/eas-update/deployment/) - Channel-branch mapping, eas update command, rollout
- [Expo Pricing](https://expo.dev/pricing) - Free tier: 1,000 MAU, 100 GiB bandwidth
- [GitHub Actions KVM Changelog](https://github.blog/changelog/2024-04-02-github-actions-hardware-accelerated-android-virtualization-now-available/) - KVM on ubuntu-latest
- [reactivecircus/android-emulator-runner](https://github.com/ReactiveCircus/android-emulator-runner) - CI Android emulator action
- npm registry: expo-updates@55.0.15 (verified compatible with Expo SDK 55)

### Secondary (MEDIUM confidence)
- [dniHze/maestro-test-action](https://github.com/marketplace/actions/maestro-test-action) - GitHub Action for Maestro CLI installation
- [retyui/Using-GitHub-Actions-to-run-your-Maestro-Flows](https://github.com/retyui/Using-GitHub-Actions-to-run-your-Maestro-Flows) - CI workflow patterns, runner benchmarks
- [Maestro React Native Guide](https://dev.to/b42/test-your-react-native-app-with-maestro-5bfj) - testID to id selector mapping
- [Maestro Getting Started](https://www.testdevlab.com/blog/getting-started-with-maestro-mobile-ui-testing-framework) - YAML flow syntax reference

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - expo-updates ~55.0.15 verified against npm registry, Maestro is well-documented
- Architecture: HIGH - Patterns drawn from official Expo docs and verified CI examples
- Pitfalls: HIGH - Common issues documented in Expo GitHub issues and CI workflow repos

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable ecosystem, 30-day validity)
