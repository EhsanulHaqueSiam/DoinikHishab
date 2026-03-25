# Phase 1: Tooling Foundation - Research

**Researched:** 2026-03-26
**Domain:** Developer tooling (linting, testing, internationalization) for Expo React Native
**Confidence:** HIGH

## Summary

Phase 1 establishes three foundational developer tools: Biome for linting/formatting, Jest + React Native Testing Library for testing, and i18next for internationalization. All three areas are well-established in the React Native ecosystem with clear, documented setup paths.

The project currently has zero linting, zero tests, and a custom i18n system that is defined but not consumed by any component. This is actually advantageous -- there are no conflicting tools to remove (no ESLint/Prettier), no existing tests to migrate, and the i18n system has no consumers to update beyond replacing the module itself and wiring it into the app layout.

**Primary recommendation:** Install Biome 2.x, jest-expo (SDK 55 compatible), and i18next + react-i18next + expo-localization. The three workstreams are independent and can be implemented in any order. Biome is the fastest to complete (config + fix), testing infrastructure is the most complex (needs mock patterns for Convex/NativeWind), and i18n migration is moderate (clean break, ~80 strings to convert from TS to JSON).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Strict from day one -- enable all recommended Biome rules immediately and fix every existing violation in one cleanup commit. No incremental enablement.
- **D-02:** Enforcement via both CI check AND pre-commit hook -- belt and suspenders approach. `bun run lint` in CI, lefthook for pre-commit auto-formatting.
- **D-03:** Use lefthook (Go binary, zero npm deps, YAML config) for pre-commit hooks -- not husky/lint-staged.
- **D-04:** Co-located test files -- `Button.test.tsx` next to `Button.tsx`, `currency.test.ts` next to `currency.ts`. No `__tests__/` directories.
- **D-05:** Exclude test file patterns from Metro bundler to prevent test code in production bundles.
- **D-06:** Full sample test suite covering all patterns: utility function unit tests (currency, date, budget-engine), component tests with RNTL, hook tests, Zustand store tests, and Convex function tests with mocking.
- **D-07:** Both `bun run test` (single run for CI) and `bun run test:watch` (re-runs on file changes for dev) scripts.
- **D-08:** Coverage reporting enabled with 80% threshold across src/ AND convex/ directories. No separate thresholds -- one high bar for all code.
- **D-09:** Coverage scope includes src/lib/, src/services/, src/hooks/, src/components/, src/stores/, and convex/ functions.
- **D-10:** Full migration -- replace custom `useTranslation()` hook entirely with i18next + react-i18next. Clean break, no adapter pattern, no coexistence of two systems.
- **D-11:** One JSON file per language (en.json, bn.json) with nested keys. No namespace splitting -- current ~80 strings don't warrant it.
- **D-12:** Instant language switching -- no app restart required. react-i18next's useTranslation re-renders all text on locale change.
- **D-13:** Device locale detection on first launch via expo-localization, with fallback to English if Bengali not detected.

### Claude's Discretion
- Jest configuration details (transform, moduleNameMapper, setup files)
- Convex test mocking strategy (mock useQuery/useMutation or use Convex test harness)
- Bengali pluralization polyfill approach (intl-pluralrules)
- Biome rule selection (which specific rules from recommended set)
- lefthook configuration specifics

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOOL-01 | Biome configured for linting and formatting with project-specific rules, replacing manual style enforcement | Biome 2.4.8 verified available, configuration pattern documented, lefthook integration researched, CI integration path clear |
| TOOL-02 | Jest + jest-expo + React Native Testing Library configured for unit and integration tests with Convex mock patterns | jest-expo 55.0.11 (SDK 55 compatible, Jest 29.x), RNTL 13.3.3 (built-in matchers), Convex mock patterns documented (jest.mock approach) |
| TOOL-05 | expo-localization + i18next configured for proper Bengali/English internationalization with pluralization, interpolation, and locale detection | i18next 25.10.9 + react-i18next 16.6.6, expo-localization ~55.0.9, Bengali CLDR plural rules confirmed (one/other), @formatjs/intl-pluralrules polyfill needed for Hermes |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun only (not npm/yarn) -- all install commands use `bun add`/`bun add -d`
- **Styling:** NativeWind v4.2.2 with Tailwind CSS 3.x -- tests must account for className-based styling
- **Path aliases:** `@/*`, `@src/*`, `@components/*`, `@lib/*`, `@stores/*`, `@hooks/*` -- must be mirrored in Jest moduleNameMapper
- **Indentation:** 2-space indentation throughout project
- **Code style:** TypeScript strict mode, no implicit `any`, semicolons
- **Babel config:** babel-preset-expo with react-native-reanimated/plugin (must be last)
- **Metro config:** Custom config with NativeWind, 12 workers, scoped watchFolders
- **No test framework currently configured**
- **No linting/formatting tooling currently configured**
- **Git commit messages:** Do NOT add Co-Authored-By: Claude line

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @biomejs/biome | 2.4.8 | Linting + formatting | Replaces ESLint+Prettier in one tool, 50x faster, recommended rules cover React/TS |
| jest-expo | ~55.0.11 | Jest preset for Expo | Mocks Expo native modules, handles RN transforms, SDK 55 matched |
| jest | ^29.7.0 | Test runner | Required by jest-expo 55.x (uses Jest 29.x internally) |
| @testing-library/react-native | ^13.3.3 | Component testing | Standard for RN, built-in Jest matchers (replaces deprecated @testing-library/jest-native) |
| i18next | ^25.10.9 | i18n framework | De facto standard, supports plurals, interpolation, nested keys |
| react-i18next | ^16.6.6 | React bindings for i18next | useTranslation hook, instant re-render on locale change, React 19 compatible |
| expo-localization | ~55.0.9 | Device locale detection | Expo SDK 55 matched, provides getLocales() for device language |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lefthook | 2.1.4 | Pre-commit hooks | Go binary, zero npm deps, runs Biome on staged files before commit |
| @types/jest | ^29.5.14 | Jest type definitions | TypeScript support for test files |
| @formatjs/intl-pluralrules | ^6.3.1 | Plural rules polyfill | Required for Bengali pluralization on Hermes engine (RN runtime) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Biome | ESLint + Prettier | Locked decision: Biome chosen for speed and single-tool simplicity |
| Jest | Vitest | Locked decision: RNTL has known Vitest issues, jest-expo is official Expo preset |
| lefthook | Husky + lint-staged | Locked decision: lefthook has zero npm deps, faster, YAML config |
| @formatjs/intl-pluralrules | intl-pluralrules (npm) | @formatjs version actively maintained, provides locale-specific data imports, better Hermes perf with polyfill-force |

**Installation:**
```bash
# Linting (dev dependency)
bun add -d @biomejs/biome

# Testing (dev dependencies)
bun add -d jest-expo jest @types/jest @testing-library/react-native

# i18n (runtime dependencies)
bun add i18next react-i18next expo-localization @formatjs/intl-pluralrules
```

**lefthook installation (system-level, not npm):**
```bash
# Arch Linux
sudo pacman -S lefthook
# Or via Go
go install github.com/evilmartians/lefthook@latest
# Or via npm (global, if needed)
npm i -g lefthook
```

**Version verification:** All versions above confirmed against npm registry on 2026-03-26.

## Architecture Patterns

### Recommended Project Structure (additions for this phase)
```
biome.json                    # Biome config (project root)
lefthook.yml                  # Pre-commit hook config (project root)
jest.config.js                # Jest configuration (project root)
jest.setup.js                 # Jest setup file (polyfills, global mocks)
src/
  lib/
    i18n/
      index.ts                # i18next initialization (replaces custom system)
      en.json                 # English translations (converted from en.ts)
      bn.json                 # Bengali translations (converted from bn.ts)
    currency.ts
    currency.test.ts          # Co-located test (D-04)
    date.ts
    date.test.ts              # Co-located test (D-04)
  services/
    budget-engine/
      index.ts
      index.test.ts           # Co-located test (D-04)
  stores/
    app-store.ts
    app-store.test.ts         # Co-located test (D-04)
    ui-store.ts
    ui-store.test.ts          # Co-located test (D-04)
  components/
    ui/
      Button.tsx
      Button.test.tsx          # Co-located test (D-04)
  hooks/
    use-transactions.ts
    use-transactions.test.ts   # Co-located test (D-04)
```

### Pattern 1: Biome Configuration

**What:** biome.json at project root with recommended rules, 2-space indentation, 100-char line width matching project conventions.

**Configuration:**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.8/schema.json",
  "files": {
    "includes": ["app/**", "src/**", "convex/**"],
    "ignore": ["convex/_generated/**", "node_modules/**", ".expo/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**Key decisions in this config:**
- `files.includes` scoped to app/, src/, convex/ (not whole project)
- `convex/_generated/` excluded (auto-generated, not editable)
- 2-space indentation matches existing codebase convention
- Double quotes match existing code style
- Semicolons always (matches existing code style)
- Recommended rules enabled globally -- specific overrides added only after seeing first-run results

### Pattern 2: Jest Configuration with Path Aliases

**What:** jest.config.js that mirrors tsconfig paths, handles RN module transforms, and co-locates test detection.

**Configuration:**
```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterSetup: ["./jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind|react-native-css-interop|sonner-native|lucide-react-native|@gorhom|@shopify|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-mmkv|convex|react-native-worklets)",
  ],
  testMatch: [
    "**/*.test.ts",
    "**/*.test.tsx",
  ],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/stores/**/*.{ts,tsx}",
    "convex/**/*.{ts,tsx}",
    "!**/*.test.{ts,tsx}",
    "!**/node_modules/**",
    "!convex/_generated/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Pattern 3: Convex Mock Strategy (Recommended: jest.mock approach)

**What:** Mock `convex/react` module at test level since ConvexReactClientFake is not published to npm (lives in convex-helpers repo source only). The jest.mock approach works with Jest 29 and does not require Vitest.

**Example:**
```typescript
// In test files that use Convex hooks
jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useConvex: jest.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { useQuery, useMutation } from "convex/react";

// Then in specific tests:
(useQuery as jest.Mock).mockReturnValue([/* mock data */]);
(useMutation as jest.Mock).mockReturnValue(jest.fn());
```

**Why this approach over ConvexReactClientFake:** The fake client exists only in the convex-helpers git repo source, not as an npm export. Using jest.mock is simpler, requires no extra dependency, and gives full control over return values per test.

### Pattern 4: i18next Initialization

**What:** i18next configured with expo-localization for device detection, JSON translation files, Bengali plural polyfill.

**Example (src/lib/i18n/index.ts):**
```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import "@formatjs/intl-pluralrules/polyfill-force";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-pluralrules/locale-data/bn";

import en from "./en.json";
import bn from "./bn.json";

const deviceLocale = getLocales()[0]?.languageCode ?? "en";
const defaultLanguage = deviceLocale === "bn" ? "bn" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
```

### Pattern 5: Metro Test File Exclusion

**What:** Add regex patterns to Metro blockList to prevent test files from being bundled in production.

**Example (metro.config.js addition):**
```javascript
config.resolver = {
  ...config.resolver,
  blockList: [
    /\.git\/.*/,
    /\.expo\/.*/,
    /android\/build\/.*/,
    /ios\/Pods\/.*/,
    // Exclude test files from production bundles (D-05)
    /.*\.test\.(ts|tsx|js|jsx)$/,
    /jest\.config\..*/,
    /jest\.setup\..*/,
  ],
};
```

### Anti-Patterns to Avoid

- **Do NOT use `@testing-library/jest-native`:** Deprecated. Built-in matchers in `@testing-library/react-native` v12.4+ replace it entirely.
- **Do NOT install Jest 30:** jest-expo 55.x depends on Jest 29.x internally. Installing Jest 30 causes version conflicts.
- **Do NOT use `i18n-js`:** The Expo docs show i18n-js, but i18next is the locked decision. i18n-js lacks React hooks, pluralization quality, and TypeScript support compared to i18next.
- **Do NOT use namespace splitting for i18n:** With ~80 strings, single file per language is correct. Namespaces add complexity with no benefit at this scale.
- **Do NOT use `polyfill` import for @formatjs/intl-pluralrules:** Use `polyfill-force` instead. The conditional polyfill runs extremely slowly on Hermes/Android, causing multi-second startup delays.
- **Do NOT create `__tests__/` directories:** Locked decision D-04 requires co-located test files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plural rules for Bengali | Custom plural logic | @formatjs/intl-pluralrules + i18next built-in | CLDR plural rules are complex (Bengali: "one" when i=0 or n=1, "other" otherwise). The polyfill handles all edge cases including decimal numbers |
| Staged file linting | Custom git hook scripts | lefthook + Biome `{staged_files}` | lefthook handles file staging, re-staging after fixes, and parallel execution. Shell scripts are fragile |
| RN module transforms for Jest | Custom transform config | jest-expo preset | jest-expo handles all Expo/RN module transformation, mock generation, and platform-specific transforms |
| Translation key type safety | Manual TypeScript types for keys | i18next TypeScript integration (resources.d.ts) | i18next can generate types from JSON resources automatically |
| Convex hook mocking | Custom test provider wrapper | jest.mock("convex/react") | Direct mocking gives per-test control without provider boilerplate |

**Key insight:** Every tool in this phase has a well-tested community solution. The custom i18n system being replaced is a perfect example of hand-rolling -- it works for ~80 strings with no pluralization, but i18next handles plurals, interpolation, nested keys, and instant switching out of the box.

## Common Pitfalls

### Pitfall 1: jest-expo and Jest Version Mismatch
**What goes wrong:** Installing Jest 30 alongside jest-expo 55.x causes cryptic module resolution errors because jest-expo bundles and expects Jest 29.x.
**Why it happens:** Jest 30 was released mid-2025, but jest-expo SDK 55 was built against Jest 29. The npm `expo install` command handles this, but manual `bun add jest` picks latest (30).
**How to avoid:** Use `bun add -d jest@^29.7.0` explicitly, or verify after install that `node_modules/jest/package.json` shows 29.x.
**Warning signs:** "Cannot find module" errors in Jest, unexpected API changes, test runner crashes.

### Pitfall 2: Bengali Pluralization Fails Silently
**What goes wrong:** Bengali text shows English-style plurals or all translations fall back to "other" form.
**Why it happens:** Hermes (React Native JS engine) does not include `Intl.PluralRules` for Bengali locale. Without the polyfill, i18next silently falls back to "other" for all counts.
**How to avoid:** Import `@formatjs/intl-pluralrules/polyfill-force` and `@formatjs/intl-pluralrules/locale-data/bn` BEFORE i18next initialization in the app entry point. Must use `polyfill-force` not `polyfill` (conditional detection is extremely slow on Hermes/Android).
**Warning signs:** Translations work but plurals are always the "other" form; "1 items" instead of "1 item" in Bengali.

### Pitfall 3: Metro Bundles Test Files
**What goes wrong:** Test files (`.test.tsx`) appear in production bundles, increasing bundle size and potentially exposing test utilities.
**Why it happens:** Metro crawls all files matching its resolver patterns. Co-located test files sit next to source files, so Metro includes them unless explicitly blocked.
**How to avoid:** Add `.*\.test\.(ts|tsx|js|jsx)$` to `config.resolver.blockList` in metro.config.js. Also add `jest.config.*` and `jest.setup.*`.
**Warning signs:** Bundle size increases after adding tests; test-only imports appear in production error traces.

### Pitfall 4: Path Aliases Not Working in Tests
**What goes wrong:** Tests fail with "Cannot find module '@lib/currency'" or similar path alias errors.
**Why it happens:** Jest has its own module resolution separate from TypeScript/Babel. tsconfig.json `paths` are not automatically picked up by Jest.
**How to avoid:** Mirror every tsconfig path in jest.config.js `moduleNameMapper`. The mapping format is different: tsconfig uses `["./src/*"]`, Jest uses `"<rootDir>/src/$1"`.
**Warning signs:** Import errors only in tests, not in app code.

### Pitfall 5: Biome Strict Mode Produces Hundreds of Errors
**What goes wrong:** First `biome check` run on existing codebase reports many violations, overwhelming developers.
**Why it happens:** The codebase was written without a linter. Biome's recommended rules catch legitimate issues (unused variables, missing types, style inconsistencies).
**How to avoid:** This is the locked decision (D-01). Run `biome check --write` first to auto-fix formatting issues, then manually fix remaining lint errors. Commit the auto-fixes separately from manual fixes for clean git history.
**Warning signs:** Expected behavior per D-01. Estimate 50-150 auto-fixable issues (formatting) and 10-30 manual fixes (logic/type issues).

### Pitfall 6: NativeWind className in Component Tests
**What goes wrong:** RNTL tests that check styles or className don't work as expected because NativeWind transforms className at babel compile time.
**Why it happens:** NativeWind v4 uses babel to transform className to style objects. In tests, this transformation may or may not run depending on jest transformer configuration.
**How to avoid:** Test component behavior and rendered text, not style implementation. Use RNTL queries like `getByText`, `getByRole`, `getByTestId` instead of checking className values. jest-expo with babel-preset-expo handles the NativeWind babel transform.
**Warning signs:** Tests pass but className assertions fail or return unexpected values.

### Pitfall 7: Zustand Store Isolation Between Tests
**What goes wrong:** Zustand store state leaks between tests, causing flaky test results.
**Why it happens:** Zustand stores are singletons -- `create()` returns a shared instance. State mutations in one test affect the next.
**How to avoid:** Reset stores in `beforeEach` using `useAppStore.setState(initialState)` or use `useAppStore.getState()` and `useAppStore.setState()` for test isolation.
**Warning signs:** Tests pass individually but fail when run together; test order affects results.

### Pitfall 8: i18next Initialization Race Condition
**What goes wrong:** Components render before i18next finishes loading, showing translation keys instead of translated text.
**Why it happens:** i18next `.init()` is async. If components render before initialization completes, `t("key")` returns the raw key.
**How to avoid:** Use synchronous initialization (`initImmediate: false` in i18next config) since translations are bundled JSON (not fetched remotely). Alternatively, use react-i18next's `Suspense` support, but synchronous init is simpler for bundled translations.
**Warning signs:** Flash of untranslated keys on app startup; intermittent missing translations.

## Code Examples

### Example 1: Pure Utility Unit Test (currency.test.ts)
```typescript
// Source: Verified pattern for jest-expo + co-located tests
import {
  paisaToTaka,
  takaToPaisa,
  formatCurrency,
  toBengaliNumerals,
  parseCurrencyInput,
} from "./currency";

describe("currency utilities", () => {
  describe("paisaToTaka", () => {
    it("converts paisa to taka", () => {
      expect(paisaToTaka(10000)).toBe(100);
      expect(paisaToTaka(0)).toBe(0);
      expect(paisaToTaka(50)).toBe(0.5);
    });
  });

  describe("takaToPaisa", () => {
    it("converts taka to paisa with rounding", () => {
      expect(takaToPaisa(100)).toBe(10000);
      expect(takaToPaisa(0.5)).toBe(50);
      expect(takaToPaisa(1.005)).toBe(101); // rounds
    });
  });

  describe("toBengaliNumerals", () => {
    it("converts digits to Bengali", () => {
      expect(toBengaliNumerals("123")).toBe("১২৩");
      expect(toBengaliNumerals("0")).toBe("০");
    });
  });
});
```

### Example 2: Zustand Store Test (app-store.test.ts)
```typescript
// Source: Zustand testing pattern (store.getState/setState)
import { useAppStore } from "./app-store";

describe("AppStore", () => {
  beforeEach(() => {
    // Reset to initial state between tests
    useAppStore.setState({
      userId: null,
      locale: "en",
      theme: "system",
      hasCompletedOnboarding: false,
      currentMonth: expect.any(String),
      selectedAccountId: null,
    });
  });

  it("sets locale", () => {
    useAppStore.getState().setLocale("bn");
    expect(useAppStore.getState().locale).toBe("bn");
  });

  it("sets theme", () => {
    useAppStore.getState().setTheme("dark");
    expect(useAppStore.getState().theme).toBe("dark");
  });
});
```

### Example 3: Component Test with RNTL (Button.test.tsx)
```typescript
// Source: @testing-library/react-native official pattern
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Save</Button>);
    fireEvent.press(screen.getByText("Save"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disables interaction when loading", () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} loading>Save</Button>);
    fireEvent.press(screen.getByText("Save"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Example 4: lefthook.yml Configuration
```yaml
# Source: Biome official git hooks recipe
pre-commit:
  commands:
    biome:
      glob: "*.{js,ts,cjs,mjs,jsx,tsx,json,jsonc}"
      run: bunx @biomejs/biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
      stage_fixed: true
```

### Example 5: i18n JSON Translation File Structure (en.json)
```json
{
  "app": {
    "name": "DoinikHishab",
    "tagline": "Daily Expense Tracker"
  },
  "tabs": {
    "dashboard": "Dashboard",
    "transactions": "Transactions"
  },
  "common": {
    "item": "{{count}} item",
    "item_other": "{{count}} items",
    "cancel": "Cancel",
    "save": "Save"
  }
}
```

### Example 6: Bengali Plural Translation (bn.json)
```json
{
  "common": {
    "item": "{{count}}টি আইটেম",
    "item_other": "{{count}}টি আইটেম"
  }
}
```

**Bengali plural note:** Bengali uses "one" for i=0 or n=1 and "other" for everything else. In practice, Bengali often uses the same form for both (classifier-based language), but the polyfill and i18next key structure must still be present for correct behavior.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint + Prettier | Biome 2.x | Biome 2.0: June 2025 | Single tool, 50x faster, type-aware linting |
| @testing-library/jest-native | Built-in matchers in @testing-library/react-native 12.4+ | 2024 | One fewer dependency, same API |
| react-test-renderer | @testing-library/react-native | 2024 (react-test-renderer deprecated for React 19) | RNTL is the only supported renderer for RN tests |
| i18n-js (Expo default) | i18next + react-i18next | i18next has been standard for years | Hooks support, TypeScript, pluralization, interpolation |
| intl-pluralrules (conditional) | @formatjs/intl-pluralrules/polyfill-force | Hermes performance discovery | polyfill-force avoids multi-second startup on Android |
| Jest 30 | Jest 29 (for Expo SDK 55) | jest-expo 55.x | Must use Jest 29 until jest-expo updates |

**Deprecated/outdated:**
- `@testing-library/jest-native`: Deprecated, merged into `@testing-library/react-native` v12.4+
- `react-test-renderer`: Deprecated for React 19+, does not work with current React
- Biome 1.x `biome.json` format: Biome 2.x uses updated schema, some field names changed (e.g., `assist` replaced `organize`)

## Open Questions

1. **Biome rule exceptions needed?**
   - What we know: Recommended rules are comprehensive and cover most patterns
   - What's unclear: How many existing code patterns will conflict with strict rules. The codebase uses `as const` assertions, Convex patterns, and NativeWind patterns that may trigger certain rules
   - Recommendation: Run `biome check` on the full codebase first, then document which rules need exceptions in biome.json overrides. Expect 0-5 rule overrides

2. **Convex function testing approach for convex/ directory**
   - What we know: convex-test exists for backend function testing but requires Vitest, not Jest
   - What's unclear: Whether Convex backend functions (query/mutation handlers) should be tested with Jest mocks or deferred to E2E
   - Recommendation: For Phase 1, test only the pure logic imported from convex/ (if any pure functions exist). Convex query/mutation handlers that depend on the Convex runtime context (ctx.db, ctx.auth) should be tested via integration tests in a later phase or with convex-test when Convex backend comes online

3. **Coverage 80% threshold achievability**
   - What we know: D-08 requires 80% coverage across src/ and convex/. The sample test suite (D-06) will cover key files
   - What's unclear: Whether 80% is achievable across ALL directories given that some components are UI-heavy with little testable logic
   - Recommendation: Start with 80% and adjust down only if specific directories prove difficult. Component tests with RNTL should achieve high coverage on UI components. The coverage config can use per-directory thresholds as a fallback if global 80% is too aggressive initially

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | All install commands | Yes | 1.3.9 | -- |
| Node.js | Jest, Metro, Expo | Yes | v24.14.1 | -- |
| Git | lefthook, CI | Yes | (system) | -- |
| lefthook | Pre-commit hooks | No | -- | Install via `sudo pacman -S lefthook` or `bun add -d lefthook` |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- lefthook: Not installed globally. Install via pacman (Arch Linux) or as npm devDependency via `bun add -d lefthook`. System install preferred per D-03 (zero npm deps philosophy), but npm install works as fallback.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 via jest-expo ~55.0.11 |
| Config file | `jest.config.js` (to be created -- Wave 0) |
| Quick run command | `bun run test` |
| Full suite command | `bun run test -- --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOOL-01 | Biome reports zero errors on clean code | smoke | `bunx @biomejs/biome check app/ src/ convex/` | N/A (CLI check) |
| TOOL-02 | Jest runs and at least one sample test passes | unit | `bun run test -- --passWithNoTests` | Wave 0 |
| TOOL-02 | Coverage threshold met at 80% | unit | `bun run test -- --coverage` | Wave 0 |
| TOOL-05 | Language switching updates all visible text instantly | manual | Manual verification in app | N/A (manual) |
| TOOL-05 | Device locale detection defaults to matching language | unit | Test i18n initialization with mocked expo-localization | Wave 0 |
| TOOL-05 | Bengali pluralization renders correctly | unit | Test i18next plural rules for bn locale | Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test` + `bun run lint`
- **Per wave merge:** `bun run test -- --coverage` (full suite with coverage)
- **Phase gate:** Full suite green + `biome check` clean before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `jest.config.js` -- Jest configuration file (does not exist)
- [ ] `jest.setup.js` -- Setup file for polyfills and global mocks (does not exist)
- [ ] `src/lib/currency.test.ts` -- First unit test to verify setup works
- [ ] `src/lib/i18n/en.json` -- English translations converted from en.ts
- [ ] `src/lib/i18n/bn.json` -- Bengali translations converted from bn.ts
- [ ] `biome.json` -- Biome configuration (does not exist)
- [ ] `lefthook.yml` -- Pre-commit hook configuration (does not exist)
- [ ] Framework install: `bun add -d jest-expo jest @types/jest @testing-library/react-native` and `bun add -d @biomejs/biome`

## Sources

### Primary (HIGH confidence)
- npm registry -- verified all package versions (2026-03-26) via `npm view`
- [Expo Unit Testing docs](https://docs.expo.dev/develop/unit-testing/) -- jest-expo setup, transformIgnorePatterns
- [Biome Configuration docs](https://biomejs.dev/reference/configuration/) -- biome.json structure, rule groups
- [Biome Git Hooks Recipe](https://biomejs.dev/recipes/git-hooks/) -- lefthook.yml configuration for Biome
- [Unicode CLDR Plural Rules](https://www.unicode.org/cldr/charts/48/supplemental/language_plural_rules.html) -- Bengali uses "one" (i=0 or n=1) and "other"
- [Expo Localization docs](https://docs.expo.dev/guides/localization/) -- getLocales() API, device detection
- [Convex Testing React Components](https://stack.convex.dev/testing-react-components-with-convex) -- Convex mock patterns
- jest-expo 55.0.11 dependencies -- confirmed Jest 29.x via `npm view jest-expo@55.0.11 dependencies`

### Secondary (MEDIUM confidence)
- [FormatJS intl-pluralrules](https://formatjs.github.io/docs/polyfills/intl-pluralrules/) -- polyfill-force recommendation for Hermes
- [lefthook GitHub](https://github.com/evilmartians/lefthook) -- Go binary, YAML config, stage_fixed feature
- [@testing-library/jest-native deprecation](https://www.npmjs.com/package/@testing-library/jest-native) -- merged into RNTL 12.4+
- [Biome Migration Guide 2026](https://dev.to/pockit_tools/biome-the-eslint-and-prettier-killer-complete-migration-guide-for-2026-27m) -- Biome 2.x features and setup

### Tertiary (LOW confidence)
- Convex function testing with Jest (not Vitest) -- limited community examples; convex-test is Vitest-only. jest.mock approach inferred from standard Jest patterns applied to Convex hooks

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified on npm registry with version compatibility confirmed
- Architecture: HIGH -- biome.json, jest.config.js, and i18next patterns are well-documented with official sources
- Pitfalls: HIGH -- identified from official docs (Hermes polyfill perf), community issues (jest-expo version lock), and project-specific analysis (Metro bundling test files)
- Convex mock strategy: MEDIUM -- the jest.mock approach is standard Jest but Convex-specific testing examples mostly use Vitest

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable ecosystem -- jest-expo tied to Expo SDK version, Biome 2.x is stable)
