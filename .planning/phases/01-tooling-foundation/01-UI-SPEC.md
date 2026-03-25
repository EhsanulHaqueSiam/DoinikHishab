---
phase: 1
slug: tooling-foundation
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-26
---

# Phase 1 -- UI Design Contract

> Visual and interaction contract for the i18n language switching experience. Phase 1 is primarily developer tooling (Biome, Jest), but the i18next migration (Plan 01-03) touches every visible string and the language toggle in Settings. This contract governs that user-facing surface.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | NativeWind v4.2.2 (Tailwind CSS for React Native) |
| Preset | nativewind/preset in tailwind.config.js |
| Component library | Custom (src/components/ui/) -- no shadcn (React Native, not web) |
| Icon library | Lucide React Native ^0.577.0 |
| Font | SpaceMono (monospace) -- loaded via expo-font |

**Source:** tailwind.config.js, CLAUDE.md, package.json

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing, Settings row icon margin |
| md | 16px | Default element spacing, section padding-x, SettingRow vertical padding (`py-4`) |
| lg | 24px | Section padding, Settings section margin-bottom |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: None. All spacing values are multiples of 4.

**Source:** tailwind.config.js default Tailwind spacing scale, existing Settings screen patterns.

---

## Typography

| Role | Size | Weight | Line Height | Tailwind Class |
|------|------|--------|-------------|----------------|
| Body | 14px | 400 (regular) | 1.5 | `text-sm` |
| Label | 10px | 600 (semibold) | 1.4 | `text-2xs font-semibold` |
| Heading | 18px | 600 (semibold) | 1.2 | `text-lg font-semibold` |
| Hero | 36px | 600 (semibold) | 1.1 | `text-hero font-semibold` |

Weights declared: 400 (regular) and 600 (semibold). Semibold at 18px and 36px is visually strong enough for heading hierarchy -- no bold (700) needed.

**Phase 1 scope:** No new typography is introduced. The i18n migration replaces string values, not visual treatment. All existing typography classes remain unchanged. If any existing component uses `font-bold`, update it to `font-semibold` to conform to the 2-weight contract.

**Bengali text note:** SpaceMono does not contain Bengali glyphs. The system will fall back to the device's default Bengali font (e.g., Noto Sans Bengali on Android, Kohinoor Bangla on iOS). This is correct behavior -- do not attempt to bundle a Bengali font. Verify that fallback rendering produces acceptable line heights for mixed Bengali/English strings.

**Source:** tailwind.config.js fontSize and fontFamily, existing component classes.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#070b16` (background) | App background, screen surfaces |
| Secondary (30%) | `#111827` (card/surface-200) | Cards, settings groups, elevated surfaces |
| Accent (10%) | `#0d9488` (primary/teal) | Active language indicator, selected state highlight, primary CTA buttons |
| Destructive | `#f87171` (danger) | Destructive action labels only (e.g., "Fresh Start") |

Accent reserved for:
- Active/selected language indicator value text (currently `text-primary-700`)
- Language toggle active state feedback
- Primary action buttons (Save, Done)

Secondary semantic colors (no change in Phase 1):
- Success `#34d399` -- positive balance indicators
- Warning `#fbbf24` -- budget warnings
- Saffron accent `#e6a444` -- amount displays and financial highlights

**Source:** tailwind.config.js colors, global.css background.

---

## Component Inventory (Phase 1 Scope)

Phase 1 does not introduce new components. The i18n migration modifies text content within existing components.

### Modified Components

| Component | File | Change |
|-----------|------|--------|
| SettingsScreen | `app/(tabs)/settings.tsx` | All hardcoded strings replaced with `t()` calls from i18next |
| SettingRow | `app/(tabs)/settings.tsx` | `label`, `value` props receive translated strings |
| SectionLabel | `app/(tabs)/settings.tsx` | `title` prop receives translated string |
| All tab screens | `app/(tabs)/*.tsx` | Any visible text wrapped in `t()` calls |
| All components using `useTranslation` | `src/components/**/*.tsx` | Import changes from custom `@lib/i18n` to `react-i18next` |

### Visual Hierarchy (Settings Screen)

The Settings screen is a flat list of grouped rows with no strong visual differentiation between items. The Language row in the General section is the only visually differentiated element -- teal accent (`text-primary-700`) on the active language value text serves as the focal cue, distinguishing it from other rows that display neutral/muted value text. This accent draws the user's eye to the interactive language toggle, reinforcing that it is the primary actionable element in the General section.

### Language Toggle Interaction (Settings Screen)

The language toggle is the only interactive UI element affected by this phase. It exists at `settings.tsx` line 67.

**Current behavior:** Pressing the Language row cycles `locale` between `"en"` and `"bn"` via Zustand `setLocale()`.

**Target behavior after i18n migration:**
1. User taps Language row in Settings
2. `i18n.changeLanguage()` is called (i18next API)
3. All visible text on the current screen re-renders instantly (no page reload, no navigation)
4. The Language row value text updates to show the newly active language name
5. Zustand `locale` state stays in sync with i18next for any non-i18next consumers

**Interaction contract:**
- Tap target: Full width of SettingRow, vertical padding `py-4` (16px) ensures minimum 48px touch target height
- State feedback: Value text shows `"English"` or `"বাংলা"` in the target language
- Transition: Instant re-render (< 16ms) -- no loading spinner, no flash of untranslated keys
- Persistence: Language preference persists across app restarts (stored in Zustand/MMKV)
- First launch: Detect device locale via `expo-localization`. If Bengali, default to `"bn"`. Otherwise, default to `"en"`.

---

## Copywriting Contract

| Element | English Copy | Bengali Copy |
|---------|-------------|-------------|
| Language row label | Language | ভাষা |
| Language row value (English active) | English | English |
| Language row value (Bengali active) | বাংলা | বাংলা |
| Settings section: General | General | সাধারণ |
| Settings section: Data | Data | তথ্য |
| Settings section: AI Features | AI Features | এআই ফিচার |
| Settings section: Account | Account | অ্যাকাউন্ট |
| Settings section: About | About | সম্পর্কে |

**Language name display rule:** Always show the language name in its own script regardless of active locale. "English" is always "English", "বাংলা" is always "বাংলা". This prevents confusion when the user cannot read the current locale.

### Empty States (existing, now translated)

| Context | English | Bengali |
|---------|---------|---------|
| No transactions | No transactions yet. Tap + to add your first one! | এখনো কোনো লেনদেন নেই। প্রথমটি যোগ করতে + চাপুন! |
| No spending data | No spending data yet | এখনো কোনো খরচের তথ্য নেই |

### Error States (Phase 1 scope)

| Context | Copy |
|---------|------|
| Translation key missing | Fall back to English string (i18next `fallbackLng: "en"` handles this automatically) |
| Locale detection failure | Default to English (`"en"`) silently -- no error shown to user |

### Destructive Actions (existing, now translated)

| Action | English | Confirmation Approach |
|--------|---------|----------------------|
| Fresh Start | Fresh Start | Not implemented in Phase 1 (placeholder row) |
| Delete Transaction | Delete Transaction | Existing confirmation flow unchanged |

**No new copywriting needed beyond translating existing ~80 strings from en.ts/bn.ts to JSON format.**

---

## States and Transitions

### Language Switch State Machine

```
[idle: current_locale]
    |
    v (user taps Language row)
[switching]
    |
    v (i18n.changeLanguage() resolves)
[idle: new_locale]
```

- `idle` -> `switching`: User taps Language SettingRow
- `switching` -> `idle`: i18next fires `languageChanged` event, React re-renders all `useTranslation()` consumers
- Duration: Synchronous (bundled JSON, no network fetch) -- effectively 0ms perceived delay
- No loading state needed
- No error state needed (bundled translations cannot fail to load)

### First Launch Locale Detection

```
[app_start]
    |
    v (expo-localization getLocales())
[detect_device_locale]
    |
    +--> [bn detected] --> set i18next lng to "bn"
    |
    +--> [en detected] --> set i18next lng to "en"
    |
    +--> [other/unknown] --> fallback to "en"
    |
    v
[app_ready: locale_set]
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Language row accessible role | `accessibilityRole="button"` on Language SettingRow Pressable |
| Language row accessible label | `accessibilityLabel={t("settings.language")}` |
| Language change announcement | `AccessibilityInfo.announceForAccessibility(t("settings.languageChanged"))` after switch |
| Text scaling | Respect system font size preferences -- NativeWind text classes scale with system |
| RTL support | Not applicable for Bengali (LTR script) or English (LTR) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| Not applicable | None | React Native project -- no shadcn registry |

Phase 1 installs only npm packages from the public registry (i18next, react-i18next, expo-localization, @formatjs/intl-pluralrules). No third-party component registries.

---

## Testing Contract (Phase 1 Specific)

The i18n migration requires verification of the visual contract:

| Test | Type | What It Validates |
|------|------|-------------------|
| Language switch updates all visible text | Manual | All `t()` calls re-render on locale change |
| Bengali pluralization renders correctly | Unit | i18next with intl-pluralrules polyfill produces correct Bengali plural forms |
| Device locale detection defaults correctly | Unit | `expo-localization` mock returns `"bn"` -> i18next initializes in Bengali |
| Fallback to English for missing keys | Unit | Missing `bn` key returns English string, not raw key |
| Settings screen language row shows correct value | Component (RNTL) | After toggle, value text shows updated language name |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
