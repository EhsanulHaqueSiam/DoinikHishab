# Milestones

## v1.1 DoinikHishab Feature Complete (Shipped: 2026-03-26)

**Phases completed:** 7 phases, 24 plans, 52 tasks

**Key accomplishments:**

- Biome 2.4.9 with strict recommended rules, lefthook pre-commit auto-formatting, and CI lint gate on all builds
- Jest test harness with 77 passing tests across 8 files covering all D-06 patterns: utilities, budget-engine, hooks (renderHook), Zustand stores, RNTL components, and Convex handler mocking
- Replaced custom i18n system with i18next + react-i18next, 80+ strings in en/bn JSON, device locale detection via expo-localization, instant language switching in all tab screens
- Mock data, frequency service, storage helpers, AmountPad Bengali numerals, and ExpandableDetails for 3-tap transaction entry
- 3-tap transaction entry: amount keypad -> Next -> category tap = auto-save with haptic + Reanimated flash + batch mode reset
- Budget engine extensions (Days of Buffering, sinking fund suggest), onboarding state machine with MMKV, YNAB rules data, metrics/onboarding hooks, and ~80 Bengali/English i18n keys for the entire phase
- ReadyToAssignHero with text-hero typography and teal/red glow, SinkingFundSection with 4 Bengali sinking funds and progress bars, and 3 contextual YNAB rule tips with MMKV-persistent dismiss
- MetricsCard with Age of Money trend arrows and Days of Buffering on dashboard, plus RuleCarousel, StepIndicator, and CategoryTemplateSelector components for onboarding flow assembly in Plan 04
- 5-step guided onboarding flow with YNAB rules carousel, category templates, mock money assignment, and MMKV-based root layout gate for first-time users
- Installed chart libraries (gifted-charts, d3-sankey, expo-linear-gradient), created shared types/hook with 12-month mock data, built 4 foundational UI components (TimeRangeSelector, SwipeableChart, ChartTooltip, ReportEmptyState), and added 25+ i18n keys
- 5 interactive chart components using react-native-gifted-charts: SpendingBarChart (horizontal bars with tap-to-highlight), IncomeExpenseBarChart (grouped vertical bars), NetWorthLineChart (area chart with gradient), AoMTrendChart (30-day reference line), DoBTrendChart (saffron accent)
- d3-sankey cash flow visualization with vertical/horizontal SVG renderers, platform-detecting wrapper, and MMKV-persisted privacy mode toggle
- 5-tab reports screen with TimeRangeSelector, SwipeableChart month navigation, all chart components (Spending, Income/Expense, Net Worth, AoM, DoB, Sankey), and empty states
- Subscription detection algorithm with confidence scoring, MMKV persistence service with versioned storage, mock data hook with 7 payee patterns, and 36 bilingual i18n keys
- 5 UI components for recurring bill tracking: calendar grid with teal/saffron/red status dots, grouped list view with FlashList, summary card, view toggle, and day-detail bottom sheet
- Subscription suggestion cards with confirm/dismiss, burn rate header with BalanceCard pattern, swipe-to-delete list, and bottom sheet add form with validation and haptics
- Cash flow forecast chart with LineChartBicolor danger zones, ForecastRangeToggle, and full Recurring tab screen assembling all Phase 5 components into a 7th navigation tab
- MMKV goal-storage CRUD and goal-engine with amortization, avalanche/snowball strategy comparison, status tracking, and 45 i18n keys in English/Bengali
- On-device bKash/Nagad statement parser with text/XLS/PDF support, type mapping, duplicate detection, and 18 import i18n keys
- 8 goal components, useGoals hook, and 2 screen routes delivering save-up/pay-down goal tracking with animated progress, amortization tables, and avalanche vs snowball strategy comparison
- Complete statement import UI with useImport state machine hook, 6 components, and file-based route for bKash/Nagad statement import
- GoalDashboardCard on dashboard, Import navigation from settings and transactions, imported transaction visibility in transaction list, and goal budget categories in budget view
- expo-updates with fingerprint runtime versioning, 3 EAS channels, and foreground update check hook with sonner toast
- Maestro E2E test framework with 3 YAML flows covering QuickAdd 3-tap, budget navigation, and report tab switching, plus GitHub Actions CI with KVM-accelerated Android emulator

---
