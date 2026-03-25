# Domain Pitfalls

**Domain:** Expo React Native money tracking app -- tooling and feature upgrades
**Researched:** 2026-03-25
**Overall Confidence:** MEDIUM-HIGH (verified via official docs, GitHub issues, community reports)

---

## Critical Pitfalls

Mistakes that cause rewrites, multi-day delays, or broken production builds.

---

### Pitfall 1: NativeWind v5 Is Pre-Release -- Upgrading Too Early Breaks Production

**Severity:** CRITICAL
**Phase:** NativeWind v5 + Tailwind v4 migration
**Confidence:** HIGH (verified via npm registry and official NativeWind blog)

**What goes wrong:** NativeWind v5 (latest: 5.0.0-preview.3, March 15 2026) is explicitly a pre-release. The API, PostCSS integration, Metro configuration, and Tailwind v4 tooling are all still evolving. Migrating a production app to it now means building on shifting sand -- patch releases may introduce further breaking changes.

**Why it happens:** The v5 migration guide exists and looks complete, so developers assume the library is stable. The `@preview` npm tag is easy to miss.

**Consequences:**
- Styles silently break after a patch update
- CSS deserialization errors from LightningCSS version mismatches (most commonly reported issue in GitHub discussions)
- Dark mode stops working entirely (v5 changed to class-based dark mode, departing from v4's method)
- Time spent debugging NativeWind internals instead of building features

**Prevention:**
1. Pin NativeWind v4.2.x for now. It works with Expo 55 and React Native 0.83.
2. Create a `feature/nativewind-v5` branch for experimentation, not main development.
3. Set a calendar reminder to re-evaluate when v5 reaches stable (no `preview`/`alpha`/`beta` tag).
4. When migrating, do it as a standalone task -- not bundled with feature work.

**Detection:**
- Build warnings mentioning `nativewind@preview`
- CSS parsing errors from `lightningcss`
- Styles that render correctly on one platform but break on another

**Sources:**
- [NativeWind v5 Migration Guide](https://www.nativewind.dev/v5/guides/migrate-from-v4)
- [GitHub Discussion #1617 -- Migration troubles](https://github.com/nativewind/nativewind/discussions/1617)
- [NativeWind npm releases](https://www.npmjs.com/package/nativewind)

---

### Pitfall 2: Tailwind v3 to v4 Config Migration Destroys Custom Theme

**Severity:** CRITICAL
**Phase:** NativeWind v5 + Tailwind v4 migration
**Confidence:** HIGH (verified via Tailwind official upgrade guide)

**What goes wrong:** This project has a deeply customized `tailwind.config.js` with 60+ custom color tokens (primary, accent, surface, glow, semantic colors), custom font family, custom border radius, custom font sizes, and `important: true`. Tailwind v4 replaces `tailwind.config.js` with CSS-first configuration using `@theme` directives. The automated `npx @tailwindcss/upgrade` tool handles simple cases but will likely mangle or skip complex nested theme objects.

**Why it happens:** Tailwind v4's CSS-first paradigm is fundamentally different from v3's JavaScript config. The upgrade tool does not understand NativeWind-specific presets like `require("nativewind/preset")`. The `important: true` option has no direct v4 equivalent -- it was removed entirely.

**Consequences:**
- All custom colors (primary-50 through primary-950, surface-50 through surface-950, etc.) need manual conversion to CSS `@theme` variables
- `important: true` removal may cause specificity conflicts where Expo Router's default styles override NativeWind classes (the project already has CSS hacks for this in `global.css`)
- The NativeWind preset integration changes from a JS require to a CSS import pattern
- `glass: "rgba(...)"` and `glow` tokens with alpha values need special handling in CSS variables

**Prevention:**
1. Convert `tailwind.config.js` to `@theme` CSS manually rather than relying on the automated tool.
2. Map every color token to a `--color-*` CSS variable in `global.css`.
3. For `important: true` replacement, use `@layer` scoping in CSS.
4. Test every screen after migration -- color regressions are visual and easy to miss in code review.
5. Keep the old `tailwind.config.js` as reference until migration is verified.

**Detection:**
- Components rendering with wrong colors or default Tailwind colors
- White/light backgrounds appearing in the dark theme
- `!important` specificity conflicts in web view

**Sources:**
- [Tailwind v4 Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind v4 important option removed](https://github.com/tailwindlabs/tailwindcss/discussions/15866)

---

### Pitfall 3: NativeWind v5 Shadow Change Conflicts with Custom shadow() Utility

**Severity:** CRITICAL
**Phase:** NativeWind v5 + Tailwind v4 migration
**Confidence:** HIGH (verified via NativeWind migration docs and codebase analysis)

**What goes wrong:** NativeWind v5 changes `shadow-*` classes to use `boxShadow` instead of `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`. This project already has a custom `shadow()` utility in `src/lib/platform` that returns `boxShadow` on web and native shadow props on iOS/Android to work around React Native Web's deprecation of `shadow*` props. The v5 migration creates a double-boxShadow conflict on web and may make the custom utility redundant or conflicting.

**Why it happens:** The project proactively solved the web shadow problem before NativeWind addressed it. Now NativeWind v5 solves it at the framework level, creating overlapping solutions.

**Consequences:**
- Double shadow rendering on web (custom utility + NativeWind both outputting `boxShadow`)
- Visual shadow differences across platforms after upgrade
- The custom `shadow()` utility becomes dead code but isn't obvious without testing

**Prevention:**
1. When migrating to v5, audit every usage of `shadow()` from `@lib/platform`.
2. Test whether NativeWind v5's `shadow-*` classes produce identical visuals to the custom utility.
3. If v5 shadow classes work correctly cross-platform, remove the custom utility entirely.
4. If visual differences exist, keep the utility but update it to not conflict with v5's `boxShadow` output.

**Detection:**
- Shadows appearing doubled or with wrong opacity on web
- Platform-specific visual regressions in card components

---

### Pitfall 4: Vitest with React Native Is Unreliable -- Use Jest Instead

**Severity:** CRITICAL
**Phase:** Unit/integration testing setup
**Confidence:** HIGH (verified via GitHub discussions, community reports, official RN docs)

**What goes wrong:** Vitest does not officially support React Native. The `vitest-react-native` plugin exists but is a work-in-progress by a single Vitest team member. Developers report "an endless pit of issues" and "playing wack-a-mole" with dependency conflicts when trying to combine Vitest + React Native Testing Library + Expo. Functions like `getByTestId` and `getByText` break. Mock setup files don't work correctly.

**Why it happens:** Vitest is built on Vite, which transforms modules differently from Metro (React Native's bundler). React Native's module resolution, platform-specific files (`.ios.js`, `.android.js`), and native module mocking all assume Jest. The React Native Testing Library officially states it's "tested to work with Jest" only.

**Consequences:**
- Days or weeks lost debugging test infrastructure instead of writing tests
- Tests that pass locally but fail in CI (or vice versa)
- Inability to mock React Native modules (Reanimated, Gesture Handler, MMKV) properly
- False confidence from partially-working tests

**Prevention:**
1. Use Jest with `jest-expo` preset. It is the only officially supported test runner for React Native and Expo.
2. Use `@testing-library/react-native` which is tested against Jest.
3. Vitest can still be used for pure logic tests (budget engine, CSV parser, date utils) if you want its speed -- but keep component/hook tests on Jest.
4. If Vitest React Native support matures (check `vitest-react-native` GitHub periodically), reconsider in a future milestone.

**Detection:**
- Test setup taking more than 2 hours is a red flag
- `Cannot find module 'react-native'` errors in Vitest
- Platform-specific test files not being resolved

**Sources:**
- [RNTL Vitest Compatibility Discussion](https://github.com/callstack/react-native-testing-library/discussions/1142)
- [Vitest React Native Issue #1321](https://github.com/vitest-dev/vitest/issues/1321)
- [Expo Testing Docs](https://docs.expo.dev/guides/testing/)

---

### Pitfall 5: OTA Update Pushes Native-Incompatible Code, Crashes Production

**Severity:** CRITICAL
**Phase:** expo-updates OTA setup
**Confidence:** HIGH (verified via Expo official blog and documentation)

**What goes wrong:** Teams push OTA updates that inadvertently include changes requiring native code modifications (new native module, SDK version bump, config plugin change). The update downloads successfully but the app crashes because the JavaScript expects native APIs that don't exist in the installed binary.

**Why it happens:** The boundary between "JS-only change" and "native change" is blurry. Adding a new Expo package, updating a package with native code, or changing `app.json` config can all require a native rebuild. Without fingerprint detection, there's no automated check.

**Consequences:**
- App crashes for all users who received the update
- Rollback may not help if users' local state was migrated by the bad update
- Users uninstall the app, losing trust

**Prevention:**
1. Use `npx expo-updates fingerprint:generate` to detect native changes before publishing OTA.
2. Set up separate update channels: `preview` and `production`. Always publish to preview first.
3. Use gradual rollouts -- start at 10%, monitor for 30 minutes, then expand.
4. Document the "last known good" update group ID in release notes for fast rollback.
5. Never block app launch on update checks -- use `Updates.fetchUpdateAsync()` with error handling.
6. For self-hosted OTA (needed for free tier): implement code signing with RSA keys and set `updates.codeSigningCertificate` in app config.

**Detection:**
- App crash rate spike immediately after OTA publish
- Update adoption rate stalling (users can't open app to receive update)
- `Updates.checkForUpdateAsync()` throwing errors

**Sources:**
- [5 OTA Update Best Practices](https://expo.dev/blog/5-ota-update-best-practices-every-mobile-team-should-know)
- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Custom Updates Server](https://docs.expo.dev/distribution/custom-updates-server)

---

## Important Pitfalls

Mistakes that cause significant delays (days) or degraded quality.

---

### Pitfall 6: i18next Pluralization Silently Broken Without Intl Polyfill

**Severity:** IMPORTANT
**Phase:** i18next internationalization
**Confidence:** HIGH (verified via i18next GitHub issue #1671)

**What goes wrong:** React Native does not include the `Intl` API by default. Since i18next v21+, pluralization relies on `Intl.PluralRules`. Without it, plural forms silently fail -- `t('item', {count: 5})` returns the singular form or undefined. There is no error message. Bengali has its own pluralization rules that differ from English.

**Why it happens:** i18next's migration to Intl-based pluralization happened silently between major versions. The React Native documentation doesn't prominently warn about this. Developers test with English (which has simple plurals) and don't notice Bengali plurals are broken.

**Consequences:**
- Bengali translations show wrong plural forms (e.g., "1 items" or "5 item")
- Number formatting shows Western Arabic numerals (1, 2, 3) instead of Bengali numerals (if desired)
- Currency formatting breaks for BDT

**Prevention:**
1. Install `intl-pluralrules` polyfill as the first dependency before configuring i18next.
2. Also consider `@formatjs/intl-numberformat` for Bengali number formatting.
3. Set `compatibilityJSON: 'v3'` as a fallback if polyfills cause issues (uses suffix-based pluralization).
4. Create test cases specifically for Bengali plural forms during setup, not after.
5. Test with Bengali locale on both Android and iOS -- they handle Intl differently.

**Detection:**
- Plural translations returning `undefined` or the wrong form
- No error in console (silent failure is the default behavior)
- Bengali text showing mixed scripts (Bengali words with Western numerals)

**Sources:**
- [i18next Pluralization Broken Without Intl](https://github.com/i18next/i18next/issues/1671)
- [i18next Plurals Documentation](https://www.i18next.com/translation-function/plurals)

---

### Pitfall 7: Bengali Complex Script Rendering Breaks with Custom Fonts

**Severity:** IMPORTANT
**Phase:** i18next internationalization
**Confidence:** MEDIUM (verified via React Native issue #15342 and Microsoft Bengali OpenType docs)

**What goes wrong:** Bengali is a complex Indic script with conjuncts (juktakkhor), vowel signs that reposition around consonants, and ligatures that require OpenType shaping engine support. The project currently uses SpaceMono as the only font. SpaceMono does not support Bengali glyphs. When Bengali text encounters a font without proper glyph coverage, it falls back to the system font -- but the fallback may not handle all conjuncts correctly, especially on older Android devices.

**Why it happens:** Developers test with simple Bengali words and miss complex conjuncts. The system fallback font on Android varies by manufacturer (Samsung, Xiaomi, etc.) and may have inconsistent Bengali rendering. Unlike Latin scripts, you can't just swap in any Bengali-supporting font -- it must have proper OpenType tables for the Bengali script.

**Consequences:**
- Bengali conjuncts render as separated characters (broken text)
- Inconsistent text appearance across Android devices
- Font mixing (SpaceMono for English, system font for Bengali) looks jarring
- Line height and text measurement calculations break with mixed scripts

**Prevention:**
1. Use Google's Noto Sans Bengali as the Bengali font -- it has comprehensive glyph coverage and is well-tested.
2. Configure `fontFamily` in NativeWind/Tailwind to use a font stack: `['SpaceMono', 'NotoSansBengali']`.
3. Test Bengali rendering with complex conjuncts: `ক্ষ` (ksha), `জ্ঞ` (gya), `ঞ্চ` (ncha), `ত্র` (tra).
4. Test on at least 3 Android manufacturers (Samsung, Xiaomi, stock Android).
5. Consider using a single font that supports both Latin and Bengali (Noto Sans covers both).

**Detection:**
- Bengali text showing boxes or question marks
- Conjunct characters appearing separated
- Line height inconsistencies in mixed-language text

**Sources:**
- [React Native Unicode Rendering Issue #15342](https://github.com/facebook/react-native/issues/15342)
- [Microsoft Bengali OpenType Development](https://learn.microsoft.com/en-us/typography/script-development/bengali)

---

### Pitfall 8: Maestro E2E on GitHub Actions -- Android Emulator Is Painfully Slow

**Severity:** IMPORTANT
**Phase:** Maestro E2E testing in CI
**Confidence:** HIGH (verified via community reports and GitHub Actions documentation)

**What goes wrong:** Running Maestro E2E tests on GitHub Actions standard Ubuntu runners with Android emulators is extremely slow and unreliable. The standard runners lack KVM hardware acceleration, making emulator boot times 5-10 minutes. Tests are flaky due to slow rendering, missed taps, and timeout failures.

**Why it happens:** GitHub Actions Ubuntu runners are virtual machines that don't support nested virtualization (KVM) on standard runners. Without hardware acceleration, the Android emulator runs in software emulation mode, which is 10-50x slower than hardware-accelerated emulation.

**Consequences:**
- CI pipeline takes 20-40 minutes per E2E run
- Flaky test failures that pass locally but fail in CI
- Developer frustration leading to skipped or ignored E2E tests
- CI costs if using paid runners for macOS (which has better emulator support)

**Prevention:**
1. Use GitHub Actions `ubuntu-latest` with `-enable-kvm` (available on larger runners) or use macOS runners for Android emulator tests.
2. Alternatively, run Maestro tests only against the web build (Expo web) in CI -- this avoids emulator entirely and is fast.
3. Reserve full Android E2E for pre-release validation, not every PR.
4. Use `maestro test --retry-on-failure 3` to handle transient flakiness.
5. Consider Maestro Cloud (paid) or Genymotion SaaS for reliable device access if free options are too slow.
6. Cache the Android SDK, system images, and Gradle build between runs.

**Detection:**
- CI runs consistently exceeding 15 minutes for E2E
- Same test passing and failing on consecutive CI runs
- `adb: device not found` errors in CI logs

**Sources:**
- [Maestro E2E Without EAS](https://medium.com/@ibrhajjaj/how-to-run-end-to-end-e2e-testing-in-an-expo-react-native-app-using-maestro-without-relying-on-c9bf2051dfb4)
- [GitHub Actions Maestro Flows](https://github.com/retyui/Using-GitHub-Actions-to-run-your-Maestro-Flows)
- [AddJam Maestro Experience](https://addjam.com/blog/2026-02-18/our-experience-adding-e2e-testing-react-native-maestro/)

---

### Pitfall 9: Maestro Can't Find NativeWind-Styled Elements

**Severity:** IMPORTANT
**Phase:** Maestro E2E testing
**Confidence:** MEDIUM (verified via Maestro blog and community reports)

**What goes wrong:** Maestro relies on accessibility labels, testIDs, and visible text to find elements. NativeWind/Tailwind classes don't produce stable identifiers. Third-party components using absolute positioning or z-index (like `@gorhom/bottom-sheet`, modal overlays, FABs) confuse Maestro's element selection. The virtual keyboard blocks taps. React Native's LogBox obscures test targets.

**Why it happens:** Maestro's element detection works differently from React Native's component tree. Elements rendered via Reanimated animations, gesture handlers, or sheet overlays may not appear in the accessibility tree where Maestro expects them.

**Consequences:**
- Tests rely on fragile position-based taps instead of semantic selectors
- Bottom sheet interactions fail intermittently
- Keyboard dismissal between steps requires explicit handling
- LogBox warnings block critical UI elements during test runs

**Prevention:**
1. Add `testID` props to every interactive element before writing Maestro flows.
2. Use `react-native-launch-arguments` to disable LogBox during E2E test builds.
3. Add explicit keyboard dismissal steps between input interactions.
4. For bottom sheets and modals, use `maestro hierarchy` to inspect the actual element tree.
5. Prefer `assertVisible` with text content over `tapOn` with testID for more resilient tests.

**Detection:**
- Maestro flows failing with "Element not found" on elements that are clearly visible
- Tests passing on iOS but failing on Android (or vice versa)
- Inconsistent tap registration on animated components

**Sources:**
- [AddJam Maestro Experience](https://addjam.com/blog/2026-02-18/our-experience-adding-e2e-testing-react-native-maestro/)

---

### Pitfall 10: Biome Reports Hundreds of Errors on First Run -- Team Gives Up

**Severity:** IMPORTANT
**Phase:** Biome linter/formatter setup
**Confidence:** MEDIUM (verified via Biome migration guides and community reports)

**What goes wrong:** Running `biome check` on an existing codebase with no prior linting (this project has zero dev lint tooling) surfaces hundreds of errors and thousands of warnings. Developers see the wall of errors, feel overwhelmed, and either abandon Biome or suppress everything -- defeating the purpose.

**Why it happens:** Biome's default rule set is aggressive. It enables correctness, suspicious, security, a11y, and style rules out of the box. An un-linted codebase accumulates patterns that trigger many rules simultaneously.

**Consequences:**
- Massive initial diff that's impossible to review
- Biome gets disabled "temporarily" and never re-enabled
- Unsafe auto-fixes applied in bulk break code (e.g., changing `let` to `const` where mutation happens later)

**Prevention:**
1. Commit Biome config first with most rules disabled.
2. Enable rule groups incrementally: `correctness` first, then `suspicious`, then `security`, then `style`.
3. Use `biome check --write --only=correctness` to fix the safest category first.
4. Use `biome lint --write --suppress` with a migration reason to suppress existing violations and fix them later.
5. Never run `biome check --write` on the entire codebase without reviewing the diff.
6. Configure `.biome.json` overrides to exclude `convex/_generated/` (auto-generated, don't lint).

**Detection:**
- First `biome check` output exceeding 200 diagnostics
- Team members disabling Biome in their editors
- PRs with `// biome-ignore` comments on every other line

**Sources:**
- [Biome Migration Guide](https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html)
- [Biome Suppression Discussion](https://github.com/biomejs/biome/discussions/3949)

---

### Pitfall 11: Biome Flags `className` as Invalid React Native Prop

**Severity:** IMPORTANT
**Phase:** Biome linter/formatter setup
**Confidence:** MEDIUM (verified via Biome rule documentation)

**What goes wrong:** Biome's `noReactSpecificProps` rule flags `className` usage as a React-specific prop that shouldn't exist in non-React-DOM environments. NativeWind makes `className` valid on React Native components, but Biome doesn't know about NativeWind's JSX transform. This creates false positives on every single component in the codebase.

**Why it happens:** Biome has no NativeWind-aware plugin. Its React rules assume standard React Native where `className` is not a valid prop -- you'd use `style` instead.

**Consequences:**
- Hundreds of false positive lint errors across the entire codebase
- Developers learn to ignore Biome warnings, reducing its effectiveness

**Prevention:**
1. Disable `noReactSpecificProps` rule in `biome.json` for this project.
2. Review all React-specific Biome rules to check which ones conflict with NativeWind's patterns.
3. Also disable or configure rules that conflict with Expo Router's file-based routing conventions.

**Detection:**
- `noReactSpecificProps` errors on every component using `className`

**Sources:**
- [Biome noReactSpecificProps Rule](https://biomejs.dev/linter/rules/no-react-specific-props/)

---

### Pitfall 12: OTA Rollback Crashes App Due to State Migration Conflict

**Severity:** IMPORTANT
**Phase:** expo-updates OTA setup
**Confidence:** HIGH (verified via Expo official blog)

**What goes wrong:** An OTA update adds a new field to MMKV storage or changes Zustand store shape. Users receive the update, their local state migrates. Then a bug is found and you roll back to the previous version. The old code can't read the new state format -- app crashes or shows empty data.

**Why it happens:** OTA rollback means running older JavaScript against state that was transformed by newer JavaScript. This project uses MMKV for persistent storage and Zustand stores -- both maintain state that could be incompatible across versions.

**Consequences:**
- Rollback makes the problem worse instead of fixing it
- Users lose settings, API keys, or cached data
- No easy recovery without clearing app data

**Prevention:**
1. Make all state changes backwards-compatible. Add fields, never remove or rename them.
2. Add version numbers to MMKV storage keys and Zustand store schemas.
3. Write migration functions that can upgrade AND downgrade state.
4. Test rollback scenarios before deploying any update that touches persistent state.
5. Consider using Zustand's `persist` middleware with a `version` field and `migrate` function.

**Detection:**
- App crashes immediately after rollback
- "undefined is not an object" errors in Zustand selectors after rollback
- Settings or preferences reverting to defaults after rollback

**Sources:**
- [OTA Production Playbook](https://expo.dev/blog/the-production-playbook-for-ota-updates)

---

## Moderate Pitfalls

Mistakes that cause hours of debugging or minor quality issues.

---

### Pitfall 13: Sankey Diagram -- No Native React Native Library Exists

**Severity:** MODERATE
**Phase:** Sankey cash flow diagram feature
**Confidence:** HIGH (verified via ecosystem search -- no RN-native Sankey library found)

**What goes wrong:** There is no React Native-native Sankey diagram component. All Sankey solutions are web-focused (D3 + React, Nivo, Highcharts, MUI X). Attempting to use them directly in React Native fails because they depend on DOM APIs. The only viable path is either WebView-based rendering or custom SVG drawing with `react-native-svg`.

**Why it happens:** Sankey diagrams are niche visualizations. React Native charting libraries (Victory Native, react-native-echarts) focus on common chart types (line, bar, pie). Sankey is not a standard chart type in any RN library.

**Prevention:**
1. Use `@wuba/react-native-echarts` with Skia renderer -- Apache ECharts supports Sankey natively and this library renders without WebView. This is the most performant path.
2. Alternatively, use D3's `d3-sankey` for layout computation and render paths/rectangles with `react-native-svg` manually. More work but zero dependencies beyond what the project already has.
3. Do NOT use WebView-based charting -- it adds a loading delay, breaks gesture handling, and looks out of place in a native app.
4. Budget 3-5 days for Sankey implementation regardless of approach, as custom styling to match the Obsidian Finance theme will require significant effort.

**Detection:**
- Charting library import errors about missing DOM APIs
- WebView flash/flicker when loading chart
- Touch gestures not working on chart elements

**Sources:**
- [react-native-echarts (Skia + SVG)](https://github.com/wuba/react-native-echarts)
- [D3 Sankey + React SVG approach](https://www.react-graph-gallery.com/sankey-diagram)

---

### Pitfall 14: NativeWind v5 Metro Config Migration -- watchFolders Break

**Severity:** MODERATE
**Phase:** NativeWind v5 + Tailwind v4 migration
**Confidence:** MEDIUM (inferred from migration docs and current codebase analysis)

**What goes wrong:** The current `metro.config.js` has extensive customizations: 12 max workers, scoped `watchFolders` (app/, src/, assets/ only), custom resolver with platform filtering, and inline requires. NativeWind v5 changes `withNativeWind(config, { input: './global.css' })` to `withNativewind(config)` (note: lowercase 'w' in v5). The global CSS input is now handled differently. The existing Metro customizations may conflict with v5's expected Metro configuration.

**Why it happens:** The migration guide shows a simple Metro config but doesn't address projects with heavy Metro customization. The `watchFolders` restriction that excludes `convex/` and `node_modules/` from watching may conflict with v5's CSS processing pipeline.

**Consequences:**
- Hot reload stops working for style changes
- Metro fails to find CSS assets
- Build times regress if Metro optimizations are lost

**Prevention:**
1. Migrate Metro config incrementally -- apply v5's `withNativewind()` wrapper first, then re-add customizations one at a time.
2. Verify hot reload works for both JS changes and className changes after migration.
3. Keep the performance optimizations (maxWorkers, watchFolders, blockList) but test each one with v5.

**Detection:**
- Style changes not reflecting on hot reload
- Metro bundler errors about CSS file resolution
- Build times increasing by more than 20%

---

### Pitfall 15: Convex Offline Development -- Mock Data Drifts from Schema

**Severity:** MODERATE
**Phase:** Building features without Convex backend
**Confidence:** MEDIUM (inferred from project context -- Convex is currently disabled)

**What goes wrong:** With Convex disabled (free plan limit), development uses mock data. Over time, mock data structures diverge from the actual Convex schema (`convex/schema.ts`). New fields get added to mocks that don't exist in the schema, or schema fields get renamed without updating mocks. When Convex is re-enabled, queries return data in a different shape than the UI expects.

**Why it happens:** There's no automated validation between mock data and Convex schema types. Developers work against mock data for weeks, making assumptions about field names and types that don't match the real schema.

**Consequences:**
- UI crashes when Convex is re-enabled (field name mismatches)
- Data type mismatches (mock uses string, schema uses number/paisa)
- Missing required fields in mutations
- Days of debugging to reconcile mock assumptions with real data

**Prevention:**
1. Generate mock data types FROM `convex/schema.ts` using Convex's generated types (`convex/_generated/dataModel`).
2. Create a `src/mocks/` directory with typed mock factories that import from Convex types.
3. Write a simple TypeScript check script that validates mock data against schema types.
4. When adding a new UI feature, update the mock AND the schema simultaneously, never just one.
5. Consider running `npx convex dev` against a separate free Convex project for development (you can have multiple projects).

**Detection:**
- TypeScript errors when switching from mock data to real Convex queries
- `undefined` fields in UI components after enabling Convex
- Mutation failures due to missing required fields

---

### Pitfall 16: NativeWind v5 Removes JSX Transform -- className Stops Working on Third-Party Components

**Severity:** MODERATE
**Phase:** NativeWind v5 + Tailwind v4 migration
**Confidence:** HIGH (verified via NativeWind v5 migration docs)

**What goes wrong:** NativeWind v4 uses a JSX transform (via Babel) that automatically makes `className` work on all React Native components. NativeWind v5 removes this JSX transform and replaces it with an import rewrite system (`react-native` imports are rewritten to `react-native-css/react-native`). This means third-party components that accept `className` through the old JSX transform mechanism may stop working.

**Why it happens:** The new import rewrite only covers `react-native` core components. Third-party components (BottomSheet, FlashList, Reanimated views) need explicit `styled()` wrapping or `cssInterop` (now called `styled` in v5).

**Consequences:**
- `className` silently ignored on third-party components (no error, styles just don't apply)
- Components like `@gorhom/bottom-sheet`, `@shopify/flash-list`, `lucide-react-native` icons need manual `styled()` wrapper setup
- Gradual discovery of broken components throughout the app

**Prevention:**
1. Before migrating, create an inventory of all third-party components that use `className`.
2. Grep for `className` usage across the codebase and categorize by source (RN core vs third-party).
3. For each third-party component, add a `styled()` wrapper after migration.
4. Test each screen after migration to catch silent styling failures.

**Detection:**
- Components rendering with default/unstyled appearance
- No error or warning (className is silently ignored)

**Sources:**
- [NativeWind v5 Migration -- JSX Transform Removal](https://www.nativewind.dev/v5/guides/migrate-from-v4)

---

### Pitfall 17: expo-updates Self-Hosted Server Requires Code Signing Infrastructure

**Severity:** MODERATE
**Phase:** expo-updates OTA setup
**Confidence:** MEDIUM (verified via Expo docs and custom server repos)

**What goes wrong:** The project uses free-tier everything. EAS Update is a paid service. Self-hosting OTA requires implementing the Expo Updates protocol, setting up RSA code signing (generate keys, embed certificate in app, sign manifests on server), and hosting the update assets somewhere. This is significantly more complex than `eas update`.

**Why it happens:** Developers assume expo-updates "just works" and discover the self-hosted path requires cryptographic infrastructure only after committing to it.

**Consequences:**
- Weeks spent building update infrastructure instead of features
- Security vulnerabilities if code signing is implemented incorrectly
- No rollback UI or update dashboard (must build or use CLI)

**Prevention:**
1. Evaluate whether EAS Update's free tier (500 monthly active users) is sufficient before self-hosting.
2. If self-hosting: use the [official custom-expo-updates-server](https://github.com/expo/custom-expo-updates-server) as a reference, not from scratch.
3. Use [expo/code-signing-certificates](https://github.com/expo/code-signing-certificates) to generate signing infrastructure.
4. Consider [xavia-ota](https://github.com/xavia-io/xavia-ota) as a ready-made self-hosted solution.
5. Start without code signing in development, add it before production deployment.

**Detection:**
- Update manifest signing errors on client
- Certificate validation failures during update download
- Updates downloading but not applying (signature mismatch)

**Sources:**
- [Expo Custom Updates Server](https://docs.expo.dev/distribution/custom-updates-server)
- [Expo Code Signing](https://docs.expo.dev/eas-update/code-signing/)

---

## Minor Pitfalls

Mistakes that cause minor inconvenience or easily fixed issues.

---

### Pitfall 18: Biome Formatting Conflicts with NativeWind's Static Analysis Requirement

**Severity:** MINOR
**Phase:** Biome linter/formatter setup
**Confidence:** LOW (inferred from NativeWind docs -- not directly verified)

**What goes wrong:** NativeWind requires static analysis of `className` strings -- dynamic class construction (template literals, string concatenation) doesn't work. Biome's formatter may reformat long className strings in ways that break NativeWind's static analysis or make classes harder to read.

**Prevention:**
1. Configure Biome's `lineWidth` to be generous (120+) to avoid breaking long className strings.
2. Test that Biome formatting doesn't convert className patterns that NativeWind relies on.

**Detection:**
- Styles disappearing after `biome format` run
- Classes that worked before formatting suddenly not applying

---

### Pitfall 19: NativeWind v5 Requires Reanimated 4+ -- Verify Compatibility

**Severity:** MINOR
**Phase:** NativeWind v5 + Tailwind v4 migration
**Confidence:** HIGH (verified via NativeWind v5 requirements)

**What goes wrong:** NativeWind v5 requires React Native Reanimated v4+ for its new CSS animation system. The project currently uses `react-native-reanimated: 4.2.1`, which satisfies this requirement. However, the animation behavior may change because v5 switches from a custom animation engine to Reanimated CSS animations.

**Prevention:**
1. Verify current Reanimated version (4.2.1) is compatible with NativeWind v5 -- it should be.
2. Test any existing animations (if any) after migration for visual changes.
3. Pin `lightningcss` to `1.30.1` in package.json overrides to avoid CSS deserialization errors.

**Detection:**
- Animation timing or easing differences after migration
- CSS animation-related console warnings

---

### Pitfall 20: i18next Language Switching Requires App Restart

**Severity:** MINOR
**Phase:** i18next internationalization
**Confidence:** HIGH (verified via React Native I18nManager docs)

**What goes wrong:** Changing the app language at runtime with i18next works for text, but if the language change affects layout direction (e.g., adding Arabic support later) or font loading, it requires `Updates.reloadAsync()` or `RNRestart.Restart()`. Even for Bengali-English switching (both LTR), font changes may not apply to already-rendered screens without a reload.

**Prevention:**
1. Bengali and English are both LTR, so layout direction changes are not needed for this project.
2. Use React's key-based remounting for language-sensitive components: `<Component key={currentLanguage} />`.
3. If font switching is needed (SpaceMono for English, NotoSansBengali for Bengali), use a language-aware font hook.

**Detection:**
- Font not updating on some screens after language switch
- Stale translations in already-mounted components

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|-------------|---------------|----------|------------|
| NativeWind v5 + Tailwind v4 | v5 is pre-release, theme config migration, shadow utility conflict, JSX transform removal | CRITICAL | Stay on v4 until v5 is stable; prepare migration branch |
| Biome setup | Hundreds of initial errors, className false positives | IMPORTANT | Incremental rule enablement, disable React-specific rules |
| Testing (Vitest vs Jest) | Vitest doesn't work with React Native | CRITICAL | Use Jest with jest-expo, not Vitest |
| expo-updates OTA | Native code in JS update, rollback state conflict, self-hosted complexity | CRITICAL | Fingerprint detection, gradual rollouts, backwards-compatible state |
| Maestro E2E in CI | Slow Android emulator on GitHub Actions, element detection failures | IMPORTANT | Test on web in CI, reserve Android E2E for releases |
| i18next Bengali | Intl polyfill needed, font rendering, complex script conjuncts | IMPORTANT | Install intl-pluralrules polyfill, use Noto Sans Bengali |
| Sankey diagram | No native RN library exists | MODERATE | Use react-native-echarts with Skia renderer |
| Convex offline | Mock data drift from schema | MODERATE | Type mocks from Convex generated types |

---

## Summary: Top 5 Actions to Prevent Disasters

1. **Do NOT upgrade to NativeWind v5 yet.** It is pre-release (preview.3). Stay on v4 until stable release. Prepare a migration branch.
2. **Use Jest, not Vitest, for React Native tests.** Vitest integration with React Native is unreliable and unsupported. Use Vitest only for pure logic tests if desired.
3. **Install `intl-pluralrules` polyfill before configuring i18next.** Bengali pluralization silently fails without it.
4. **Implement OTA fingerprint detection** before first production update. One native-incompatible update can crash the app for all users.
5. **Enable Biome rules incrementally** starting with `correctness` only. Do not run full lint on day one.

---

## Sources

### Official Documentation
- [NativeWind v5 Migration Guide](https://www.nativewind.dev/v5/guides/migrate-from-v4)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme)
- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Expo Custom Updates Server](https://docs.expo.dev/distribution/custom-updates-server)
- [Expo Code Signing](https://docs.expo.dev/eas-update/code-signing/)
- [i18next Plurals Documentation](https://www.i18next.com/translation-function/plurals)
- [Biome Linter Rules](https://biomejs.dev/linter/)
- [React Native I18nManager](https://reactnative.dev/docs/i18nmanager)

### GitHub Issues and Discussions
- [NativeWind v4 to v5 Migration Troubles](https://github.com/nativewind/nativewind/discussions/1617)
- [RNTL Vitest Compatibility](https://github.com/callstack/react-native-testing-library/discussions/1142)
- [Vitest React Native Issue](https://github.com/vitest-dev/vitest/issues/1321)
- [i18next Pluralization Without Intl](https://github.com/i18next/i18next/issues/1671)
- [React Native Unicode Rendering](https://github.com/facebook/react-native/issues/15342)
- [Tailwind v4 important option removed](https://github.com/tailwindlabs/tailwindcss/discussions/15866)
- [Biome Suppression Discussion](https://github.com/biomejs/biome/discussions/3949)

### Community & Blog Posts
- [5 OTA Update Best Practices](https://expo.dev/blog/5-ota-update-best-practices-every-mobile-team-should-know)
- [Maestro E2E Without EAS](https://medium.com/@ibrhajjaj/how-to-run-end-to-end-e2e-testing-in-an-expo-react-native-app-using-maestro-without-relying-on-c9bf2051dfb4)
- [AddJam Maestro Experience](https://addjam.com/blog/2026-02-18/our-experience-adding-e2e-testing-react-native-maestro/)
- [Biome Migration Guide](https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html)
- [react-native-echarts](https://github.com/wuba/react-native-echarts)
- [Microsoft Bengali OpenType](https://learn.microsoft.com/en-us/typography/script-development/bengali)

---

*Concerns audit: 2026-03-25*
