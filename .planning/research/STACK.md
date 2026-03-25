# Technology Stack: Tooling & DX Upgrades

**Project:** DoinikHishab (Tooling Milestone)
**Researched:** 2026-03-25
**Overall Confidence:** MEDIUM-HIGH (NativeWind v5 drags it down; everything else is well-established)

## Recommended Stack

### 1. Biome -- Linting & Formatting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @biomejs/biome | ^2.4.9 (pin exact) | Linting + formatting for TS, JSX, JSON, CSS | Single tool replaces ESLint + Prettier. 20-30x faster than ESLint. Zero config for React/RN projects -- auto-detects React dependencies and enables React rules. 97% Prettier compatibility. Supports CSS, JSON, TypeScript, JSX natively. |

**Confidence:** HIGH -- Biome v2 is stable, well-documented, and widely adopted. No React Native-specific blockers.

**Migration complexity:** LOW -- No existing ESLint/Prettier config to migrate from. Clean install.

**Configuration:**

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.4.9/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "include": [
      "app/**/*.{ts,tsx}",
      "src/**/*.{ts,tsx}",
      "convex/**/*.ts"
    ],
    "ignore": [
      "node_modules",
      ".expo",
      "android",
      "ios",
      "convex/_generated"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all"
    }
  },
  "json": {
    "formatter": {
      "enabled": true
    }
  }
}
```

**Installation:**
```bash
bun add -d -E @biomejs/biome
bunx --bun @biomejs/biome init
```

**Scripts to add to package.json:**
```json
{
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write ."
}
```

**VS Code integration:** Install the "Biome" extension. Set as default formatter for TS/TSX/JSON/CSS.

---

### 2. Jest + React Native Testing Library -- Unit/Integration Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| jest-expo | ~55.0.x | Jest preset for Expo SDK 55 | Official Expo preset. Mocks native modules. Handles platform-specific transforms. Version-locked to SDK. |
| jest | ^29.x | Test runner | Required by jest-expo. Stable, well-supported in RN ecosystem. |
| @testing-library/react-native | ^13.x | Component testing utilities | De facto standard for RN component tests. Promotes testing user behavior over implementation. |
| @types/jest | ^29.x | TypeScript types for Jest | Type safety in test files. |

**IMPORTANT: Use Jest, NOT Vitest.** Vitest does not have stable React Native support. The `vitest-react-native` package is experimental and incomplete. `@testing-library/react-native` has not been tested extensively with Vitest. The official Expo documentation and tooling are built around Jest. Switching to Vitest for a React Native project in 2026 is premature and will cause friction.

**Confidence:** HIGH -- jest-expo is the official, maintained, battle-tested solution. Expo SDK 55 ships with a matched jest-expo version.

**Migration complexity:** MEDIUM -- No existing tests, but need to set up test infrastructure, mock Convex, mock MMKV, configure transforms.

**Configuration:**

```json
// In package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@gorhom/.*|@shopify/.*|nativewind|react-native-css-interop|sonner-native|lucide-react-native|react-native-mmkv|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg|zustand|convex)"
    ],
    "setupFilesAfterSetup": ["./jest.setup.ts"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1",
      "^@src/(.*)$": "<rootDir>/src/$1",
      "^@components/(.*)$": "<rootDir>/src/components/$1",
      "^@lib/(.*)$": "<rootDir>/src/lib/$1",
      "^@stores/(.*)$": "<rootDir>/src/stores/$1",
      "^@hooks/(.*)$": "<rootDir>/src/hooks/$1"
    }
  }
}
```

**Installation:**
```bash
bun add -d jest-expo jest @testing-library/react-native @types/jest
```

---

### 3. expo-updates -- OTA Updates

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| expo-updates | ~55.0.x | Over-the-air JavaScript bundle updates | Ship JS-only changes without app store review. Free EAS Update tier covers 1,000 MAUs/month (more than enough for a personal app). Fingerprint-based runtime versioning auto-detects native changes. |

**Use EAS Update (free tier), NOT self-hosted.** Self-hosted servers (Xavia OTA, expo-open-ota) exist but add infrastructure complexity for zero benefit at this scale. The free tier gives 1,000 MAUs and 100 GiB bandwidth per month. For a personal finance app with a Bangladesh user base, this is effectively unlimited.

**Confidence:** HIGH -- expo-updates is a core Expo package, tightly integrated with SDK 55. EAS Update free tier is generous.

**Migration complexity:** LOW-MEDIUM -- Install package, configure app.json, set up EAS Update project. No code changes needed for basic setup.

**Configuration:**

```json
// In app.json, add to "expo" key:
{
  "updates": {
    "url": "https://u.expo.dev/<your-project-id>"
  },
  "runtimeVersion": {
    "policy": "fingerprint"
  }
}
```

**Installation:**
```bash
npx expo install expo-updates
# Then set up EAS Update:
npx eas update:configure
```

**Key APIs for custom update UI:**
- `Updates.checkForUpdateAsync()` -- check for new updates
- `Updates.fetchUpdateAsync()` -- download update
- `Updates.reloadAsync()` -- apply update (restart app)
- `useUpdates()` hook -- reactive update status

**GitHub Actions integration:** Add an update step to the existing CI workflow:
```yaml
- name: Publish OTA update
  run: npx eas update --branch production --message "${{ github.event.head_commit.message }}"
```

---

### 4. Maestro -- E2E Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Maestro CLI | ^2.3.0 | End-to-end UI testing | YAML-based test flows (no code). First-class React Native support. Works with Expo Go and dev builds. Expo officially supports it (EAS Workflows integration). testID-based element selection. |

**Confidence:** HIGH -- Maestro is the de facto E2E testing tool for React Native in 2026. Expo has official documentation and blog posts about it.

**Migration complexity:** LOW -- No existing E2E tests. Install CLI, create `.maestro/` directory, write YAML flows. No app code changes (just add testID props to components).

**System requirements:**
- Java 17+ (JDK, not JRE)
- Android emulator or iOS simulator
- NOT a bun/npm package -- installed via system curl

**Installation:**
```bash
# Install Maestro CLI (system-level, not project-level)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify
maestro --help
java -version  # Must be 17+
```

**Project structure:**
```
.maestro/
  flows/
    add-transaction.yml
    view-budget.yml
    switch-language.yml
  config.yml
```

**Example flow:**
```yaml
# .maestro/flows/add-transaction.yml
appId: com.doinikhishab.app
---
- launchApp
- tapOn:
    id: "add-transaction-button"
- inputText:
    id: "amount-input"
    text: "500"
- tapOn:
    id: "category-food"
- tapOn:
    id: "save-button"
- assertVisible: "500"
```

**GitHub Actions integration:**
```yaml
# Runs on Android emulator in CI
- name: Install Maestro
  run: curl -Ls "https://get.maestro.mobile.dev" | bash
- name: Run E2E tests
  run: maestro test .maestro/flows/
```

---

### 5. expo-localization + i18next -- Internationalization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| expo-localization | ~55.0.x | Device locale detection | Expo-native locale/calendar/region detection. Matched to SDK 55. |
| i18next | ^25.x | i18n core framework | Industry standard. Interpolation, pluralization, context, namespaces. Huge ecosystem. |
| react-i18next | ^16.x | React bindings for i18next | useTranslation hook, Trans component, suspense support. De facto standard. |

**Use i18next, NOT i18n-js.** Despite Expo docs showing i18n-js, i18next is the better choice because: (1) richer feature set (plurals, interpolation, namespaces, context), (2) TypeScript support is first-class, (3) much larger ecosystem (backends, plugins, tooling), (4) react-i18next provides React-specific hooks that integrate naturally.

**Confidence:** HIGH -- i18next + react-i18next is the most widely used i18n solution in the React ecosystem, with explicit React Native support.

**Migration complexity:** MEDIUM -- The app has a custom i18n system (`src/lib/i18n/`) with ~100 translation keys across `en.ts` and `bn.ts`. Need to: (1) convert TS translation objects to JSON, (2) replace custom `useTranslation` hook with react-i18next's, (3) update all ~N component imports, (4) add interpolation/pluralization where needed.

**Migration from existing custom i18n:**

The current system uses:
- `src/lib/i18n/index.ts` -- custom `useTranslation()` hook with `t(key)` function
- `src/lib/i18n/en.ts` and `bn.ts` -- TypeScript objects with nested keys
- `useAppStore((s) => s.locale)` -- Zustand-driven locale selection

The i18next migration preserves the same `t(key)` API shape, so component-level changes are minimal (import path changes). The main work is restructuring translation files and initializing i18next.

**Installation:**
```bash
npx expo install expo-localization
bun add i18next react-i18next
```

**Configuration:**
```typescript
// src/lib/i18n/index.ts (new)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import en from "./locales/en.json";
import bn from "./locales/bn.json";

const deviceLang = getLocales()[0]?.languageCode ?? "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: deviceLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
```

**Translation file format (convert from TS to JSON):**
```json
// src/lib/i18n/locales/en.json
{
  "dashboard": {
    "title": "Dashboard",
    "totalBalance": "Total Balance"
  },
  "transaction": {
    "amount": "Amount",
    "save": "Save",
    "added": "Transaction of {{amount}} added"
  }
}
```

**Zustand integration:** Keep locale in Zustand store, sync with `i18n.changeLanguage()`:
```typescript
// When user changes language in settings:
i18n.changeLanguage(newLocale);
appStore.getState().setLocale(newLocale);
```

---

### 6. NativeWind v5 + Tailwind CSS v4 -- Styling Upgrade

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| nativewind | 5.0.0-preview.3 (latest pre-release) | Tailwind CSS for React Native | CSS-first config (Tailwind v4), CSS variables, better perf, simplified Babel config. |
| tailwindcss | ^4.1.x | Utility-first CSS framework | v4 uses CSS-first config, no more JS config file. Faster. Smaller output. |
| react-native-css | latest | NativeWind v5 peer dependency | Replaces react-native-css-interop from v4. |
| @tailwindcss/postcss | latest | PostCSS plugin for Tailwind v4 | Required for CSS processing in v4. |
| postcss | latest | CSS processor | Peer dependency for @tailwindcss/postcss. |

**WARNING: NativeWind v5 is PRE-RELEASE.** The official documentation says "not intended for production use." The API is still evolving. This is the riskiest upgrade in the entire milestone.

**Confidence:** LOW -- Pre-release software. May have breaking changes before stable. Migration guide exists but the target is moving.

**Recommendation:** Defer this upgrade to the END of the milestone. Do everything else first. If NativeWind v5 reaches stable during the milestone, upgrade then. If not, stay on v4.2.3 (latest stable) and revisit next milestone.

**Migration complexity:** HIGH -- Breaking changes in CSS config, Babel config, metro config, class names, shadow utilities, dynamic styles, and the cssInterop/remapProps API.

**Requirements:**
- React Native 0.81+ (project has 0.83.2 -- OK)
- Reanimated v4+ (project has 4.2.1 -- OK)
- Tailwind CSS v4.1+ (new install)

**Breaking changes to plan for:**
1. **tailwind.config.js deleted** -- All theme config moves to CSS (`global.css`). The entire 99-line tailwind.config.js needs to be converted to CSS custom properties.
2. **global.css rewritten** -- `@tailwind base/components/utilities` replaced with new imports.
3. **babel.config.js simplified** -- Remove NativeWind preset/plugin (v5 uses import rewrites, not JSX transform).
4. **metro.config.js updated** -- `withNativewind(config)` call signature changes (remove second arg).
5. **postcss.config.mjs added** -- New file required for Tailwind v4 processing.
6. **Class name changes** -- `elevation-sm` becomes `elevation-xs`, `elevation` becomes `elevation-sm`.
7. **Shadow utilities** -- Shadow classes now use `boxShadow` (aligns with project's existing `shadow()` utility pattern).
8. **lightningcss pin** -- Must add `"overrides": { "lightningcss": "1.30.1" }` to package.json.
9. **cssInterop/remapProps deprecated** -- Replaced by `styled()` API for third-party component integration.

**Installation (when ready):**
```bash
# Remove old
bun remove tailwindcss nativewind

# Install new
npx expo install nativewind@preview react-native-css react-native-reanimated react-native-safe-area-context
npx expo install --dev tailwindcss @tailwindcss/postcss postcss

# Pin lightningcss
# Add to package.json: "overrides": { "lightningcss": "1.30.1" }
```

**New global.css:**
```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

/* Custom theme (converted from tailwind.config.js) */
@theme {
  --color-primary-50: #0a1f1d;
  --color-primary-100: #0c2b28;
  --color-primary-200: #0f3d39;
  --color-primary-300: #14564f;
  --color-primary-400: #1a7a71;
  --color-primary-500: #0d9488;
  --color-primary-600: #14b8a6;
  --color-primary-700: #2dd4bf;
  --color-primary-800: #5eead4;
  --color-primary-900: #99f6e4;
  --color-primary-950: #ccfbf1;
  /* ... rest of color tokens ... */
  --color-background: #070b16;
  --color-foreground: #eaf0f9;
  --font-sans: SpaceMono;
  --font-mono: SpaceMono;
}

/* Obsidian Finance overrides */
html, body, #root {
  background-color: var(--color-background);
  min-height: 100%;
  color: var(--color-foreground);
}
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Linting/Formatting | Biome | ESLint + Prettier | Slower (20-30x), two tools instead of one, more config files, more dependencies |
| Linting/Formatting | Biome | oxlint | Less mature, no formatter, narrower rule set |
| Unit Testing | Jest + jest-expo | Vitest | No stable React Native support. vitest-react-native is experimental. @testing-library/react-native untested with Vitest. Official Expo tooling is Jest-only. |
| E2E Testing | Maestro | Detox | More complex setup, requires native builds, less readable test syntax, harder CI setup |
| E2E Testing | Maestro | Appium | Enterprise-grade complexity overkill for a personal app |
| i18n | i18next + react-i18next | i18n-js | Smaller ecosystem, fewer features (no plurals/context/namespaces), weaker TypeScript support |
| i18n | i18next + react-i18next | expo-localization alone | expo-localization only detects locale, does not provide translation framework |
| OTA Updates | EAS Update (free) | Self-hosted (Xavia OTA) | Unnecessary infrastructure complexity for <1,000 users. Free tier is sufficient. |
| OTA Updates | EAS Update (free) | CodePush | Deprecated by Microsoft. No longer maintained. |
| Styling | NativeWind v5 (deferred) | Stay on NativeWind v4 | v4 is stable and working. v5 pre-release risk not worth taking until stable. |

---

## Installation Summary

### Phase 1: Safe upgrades (no risk)
```bash
# Biome
bun add -d -E @biomejs/biome
bunx --bun @biomejs/biome init

# Jest + Testing Library
bun add -d jest-expo jest @testing-library/react-native @types/jest

# expo-localization + i18next
npx expo install expo-localization
bun add i18next react-i18next

# expo-updates
npx expo install expo-updates
npx eas update:configure
```

### Phase 2: System-level tools
```bash
# Maestro (system install, not project)
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Phase 3: Risky upgrade (defer until stable)
```bash
# NativeWind v5 + Tailwind v4 (ONLY when v5 goes stable)
bun remove tailwindcss nativewind
npx expo install nativewind@preview react-native-css react-native-reanimated react-native-safe-area-context
npx expo install --dev tailwindcss @tailwindcss/postcss postcss
```

---

## Compatibility Matrix

| Upgrade | Expo 55 | RN 0.83 | React 19 | Convex | NativeWind v4 | NativeWind v5 | Biome |
|---------|---------|---------|----------|--------|---------------|---------------|-------|
| Biome | OK | OK | OK | OK | OK | OK | -- |
| Jest + RNTL | OK | OK | OK | Mock needed | OK | OK | OK |
| expo-updates | OK | OK | OK | OK | OK | OK | OK |
| Maestro | OK | OK | OK | OK | OK | OK | OK |
| i18next | OK | OK | OK | OK | OK | OK | OK |
| NativeWind v5 | OK (RN 0.81+) | OK | OK | OK | N/A (replaces) | -- | OK |

Key notes:
- **Biome does NOT conflict with NativeWind** -- Biome lints/formats source code, NativeWind processes styles at build time. They operate at different stages.
- **Jest needs Convex mocks** -- Convex queries/mutations must be mocked in tests since there is no test backend.
- **expo-updates works with GitHub Actions** -- Add `eas update` step to existing CI workflow.
- **Maestro is independent** -- System-level tool, no npm dependencies, no build impact.
- **i18next replaces custom code** -- The existing `src/lib/i18n/` module is replaced entirely.

---

## Sources

### Biome
- [Biome Official Site](https://biomejs.dev/) -- HIGH confidence
- [Biome v2.4 Blog Post](https://biomejs.dev/blog/biome-v2-4/) -- HIGH confidence
- [Biome Getting Started](https://biomejs.dev/guides/getting-started/) -- HIGH confidence
- [Biome Configuration Guide](https://biomejs.dev/guides/configure-biome/) -- HIGH confidence
- [Biome GitHub Releases](https://github.com/biomejs/biome/releases) -- HIGH confidence

### Testing
- [Expo Unit Testing Docs](https://docs.expo.dev/develop/unit-testing/) -- HIGH confidence
- [RNTL + Vitest Discussion](https://github.com/callstack/react-native-testing-library/discussions/1142) -- MEDIUM confidence
- [Callstack RN Testing Guide 2026](https://www.callstack.com/blog/testing-react-native-tv-apps) -- MEDIUM confidence

### expo-updates
- [Expo Updates SDK Docs](https://docs.expo.dev/versions/latest/sdk/updates/) -- HIGH confidence
- [EAS Update Pricing](https://expo.dev/pricing) -- HIGH confidence
- [OTA Best Practices Blog](https://expo.dev/blog/the-production-playbook-for-ota-updates) -- HIGH confidence

### Maestro
- [Maestro React Native Docs](https://docs.maestro.dev/platform-support/react-native) -- HIGH confidence
- [Expo + Maestro E2E Workflow](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) -- HIGH confidence
- [Maestro Install Guide](https://docs.maestro.dev/getting-started/installing-maestro) -- HIGH confidence
- [Maestro GitHub Releases](https://github.com/mobile-dev-inc/maestro/releases) -- HIGH confidence

### Internationalization
- [Expo Localization Guide](https://docs.expo.dev/guides/localization/) -- HIGH confidence
- [i18next Docs](https://www.i18next.com/) -- HIGH confidence
- [react-i18next Docs](https://react.i18next.com/) -- HIGH confidence
- [Expo + i18next Integration (Feb 2026)](https://medium.com/@kgkrool/implementing-internationalization-in-expo-react-native-i18next-expo-localization-8ed810ad4455) -- MEDIUM confidence

### NativeWind v5
- [NativeWind v5 Overview](https://www.nativewind.dev/v5) -- MEDIUM confidence (pre-release docs)
- [NativeWind v4 to v5 Migration](https://www.nativewind.dev/v5/guides/migrate-from-v4) -- MEDIUM confidence (pre-release)
- [NativeWind v5 Installation](https://www.nativewind.dev/v5/getting-started/installation) -- MEDIUM confidence (pre-release)
- [NativeWind GitHub Releases](https://github.com/nativewind/nativewind/releases) -- HIGH confidence
