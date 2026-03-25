# Architecture Patterns

**Domain:** Personal finance app upgrades — tooling, features, and UX improvements
**Researched:** 2026-03-25

## Recommended Architecture

The existing architecture (Expo Router + Convex + Zustand + NativeWind) is sound and does not need structural changes. The upgrades integrate as new layers within the existing boundaries, not as replacements. The system expands in three directions: developer tooling (Biome, testing, OTA), new feature modules (Sankey, calendar, sinking funds, debt payoff, subscriptions), and UX refinements (3-tap entry, mobile reports).

### System Diagram

```
+----------------------------------------------------------------------+
|  Presentation Layer (Expo Router)                                    |
|  app/(tabs)/  app/transaction/  app/budget/  app/reports/            |
|                                                                      |
|  +--- New Screens ---+                                               |
|  | reports/cashflow   | (Sankey diagram)                             |
|  | reports/calendar   | (recurring calendar view)                    |
|  | budget/sinking/[id]| (sinking fund detail)                        |
|  | goals/debt/[id]    | (debt payoff detail)                         |
|  | settings/subs      | (subscription management)                    |
|  +--------------------+                                              |
+----------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+------------------+  +------------------+  +------------------+
| Components       |  | Zustand Stores   |  | Custom Hooks     |
| src/components/  |  | app-store.ts     |  | use-budget.ts    |
|                  |  | ui-store.ts      |  | use-transactions |
| +--- New ---+    |  |                  |  |                  |
| | SankeyFlow |   |  | +--- New ---+    |  | +--- New ---+    |
| | CalendarV  |   |  | | (no new   |   |  | | useRecurring|   |
| | SinkingCard|   |  | |  stores   |   |  | | useDebtPay  |   |
| | DebtPayoff |   |  | |  needed)  |   |  | | useSankey   |   |
| | SubsCard   |   |  | +-----------+   |  | | useSinking  |   |
| +------------+   |  +------------------+  | | useSubDetect|   |
+------------------+                        | +-------------+   |
         |                                  +------------------+
         v                                           |
+------------------+                                 v
| Services Layer   |                        +------------------+
| src/services/    |                        | Convex Backend   |
|                  |                        | convex/          |
| +--- New ---+    |                        |                  |
| | debt-calc  |   |                        | +--- New ---+    |
| | sub-detect |   |                        | | sinkingFunds|  |
| | sankey-data|   |                        | | debts.ts    |  |
| +------------+   |                        | | subs.ts     |  |
+------------------+                        | +-------------+  |
                                            +------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | New/Modified |
|-----------|---------------|-------------------|--------------|
| **Sankey Flow Chart** | SVG-based cash flow visualization using d3-sankey layout + react-native-svg rendering | `useSankey` hook, which aggregates data from `api.reports.spendingByCategory` and income transactions | New component |
| **Calendar View** | Monthly grid showing recurring transactions by day with status badges | `useRecurring` hook consuming `api.scheduled.list` | New component |
| **Sinking Fund Cards** | Progress visualization for non-monthly savings goals (Eid, school, medical) | `useSinking` hook consuming existing `api.targets.list` + `api.budgets.getByMonth` | New component |
| **Debt Payoff System** | Avalanche/snowball comparison, debt-free date projection, interest calculations | `useDebtPayoff` hook consuming new `convex/debts.ts` + existing `api.accounts.list` (debt-type accounts) | New component + hook + service |
| **Subscription Detection** | Pattern matching on transaction history to surface recurring charges | `useSubscriptionDetect` hook consuming `api.transactions.list`, writes to new `convex/subscriptions.ts` | New component + hook + service |
| **3-Tap Entry Flow** | Refined QuickAdd bottom sheet: Amount -> Category -> Save with zero friction | Modification of existing `src/components/transaction/QuickAdd.tsx` | Modified component |
| **Mobile Reports** | Tab-based report screen with swipeable charts, category drilldown | Modification of existing `app/(tabs)/reports.tsx`, new sub-components | Modified screen |
| **Budget Engine** | Extended with sinking fund rollover calculations, debt payment tracking | Existing `src/services/budget-engine/index.ts` | Modified service |
| **i18n System** | Replace custom `useI18n()` with i18next + expo-localization for proper plurals, interpolation, date/number formatting | Replace `src/lib/i18n/` internals, keep same hook API | Modified service |
| **Mock Data Provider** | Wraps Convex hooks with static fixture data when backend is offline | New `src/services/mock-provider/` | New service |

### Data Flow

**Sankey Diagram Data Flow:**

```
User navigates to Reports > Cash Flow tab
  -> useSankey() hook fires
    -> Fetches: api.transactions.getByDateRange(userId, startDate, endDate)
    -> Client-side aggregation (NOT a new Convex query):
       1. Group income transactions by category -> income nodes
       2. Group expense transactions by category -> expense nodes
       3. Calculate flows: income total -> each expense category proportion
    -> d3-sankey layout engine computes node positions + link paths
    -> SankeyFlow component renders via react-native-svg:
       <Svg> <Rect> for nodes, <Path> for links </Svg>
```

Why client-side aggregation: The existing `api.transactions.getByDateRange` already returns all transactions for a period. Adding a dedicated Convex query just for Sankey data would duplicate logic. The d3-sankey layout must run client-side anyway (it computes SVG coordinates), so the aggregation step is negligible overhead. For users with thousands of transactions per month (unlikely for manual entry), a Convex query could be added later.

**Sinking Funds Data Flow:**

```
Sinking funds use EXISTING schema — no new tables needed.
They are categories with target type "spending_by_date" or "savings_balance".

User views Budget tab -> category with target
  -> useBudget() hook (already exists) fetches targets + budgets
  -> Budget engine calculates: monthly contribution needed = target / months remaining
  -> SinkingCard component renders progress bar + monthly contribution amount
  -> User can "fund" via existing budget assignment flow
```

This is a key architectural insight: sinking funds are a UI concept, not a data concept. The existing `targets` table with types `spending_by_date` and `savings_balance` already models sinking funds. What is missing is the UI that presents these as "True Expenses" with YNAB-style language and progress visualization.

**Debt Payoff Data Flow:**

```
New: convex/debts.ts (extends existing loanDetails table)
  -> Adds: payoff strategy, extra payment amount, payoff scenarios

User navigates to Goals > Debt Payoff
  -> useDebtPayoff() hook fires
    -> Fetches: api.accounts.list (filter debt-type accounts)
    -> Fetches: api.loanDetails (existing table, needs interest rate + minimum payment)
    -> Client-side: debt-calc service runs amortization schedules
       - Avalanche: highest interest first
       - Snowball: smallest balance first
       - Custom: user-defined order
    -> Outputs: monthly payment schedule, total interest, debt-free date per strategy
    -> DebtPayoff component renders comparison table + timeline chart
```

**Subscription Detection Data Flow:**

```
New: convex/subscriptions.ts table

User navigates to Settings > Subscriptions (or triggered on reports screen)
  -> useSubscriptionDetect() hook fires
    -> Fetches: api.transactions.list (last 6 months)
    -> Client-side: sub-detect service runs pattern matching:
       1. Group transactions by payee
       2. For each payee: check if amounts are similar (+/- 10%)
       3. Check if dates are roughly periodic (monthly +/- 5 days)
       4. Score confidence (0-1)
       5. Surface candidates with confidence > 0.7
    -> User confirms/dismisses candidates
    -> Confirmed subscriptions saved to new subscriptions table
    -> Calendar view integrates confirmed subscriptions as recurring items
```

**Recurring Calendar View Data Flow:**

```
User navigates to Reports > Calendar tab (or Transactions > Calendar view)
  -> useRecurring() hook fires
    -> Fetches: api.scheduled.list(userId) — existing scheduled transactions
    -> Fetches: new api.subscriptions.list(userId) — detected subscriptions
    -> Merges into unified recurring items array
    -> Calendar component renders monthly grid:
       - Each day cell shows dots/badges for scheduled items
       - Color: green (paid), yellow (upcoming), red (overdue)
       - Tap day -> expandable list of items for that date
```

**Mock Data Strategy (Critical — Convex Offline):**

```
Since Convex backend is disabled until next month, development needs mock data.

Approach: ConvexMockProvider wrapping the app during development.

Option A (recommended): Mock at the hook level
  - Create src/services/mock-data/fixtures.ts with realistic BDT data
  - Create wrapper hooks: useQueryMock(queryRef, args)
    that returns fixture data instead of calling Convex
  - Controlled via environment variable: EXPO_PUBLIC_USE_MOCKS=true
  - Hooks check the flag and return mock data or call real Convex

Option B: Mock at the Convex provider level
  - Use ConvexReactClientFake from convex-test patterns
  - Replace ConvexProvider in _layout.tsx with mock provider
  - More realistic but harder to maintain

Option A is better because:
1. Simpler — each hook can have its own fixture file
2. No dependency on convex-test in the app bundle
3. Easy to remove when backend comes back (delete mock files, flip env var)
4. Can be used for Storybook-like component development
```

Mock data fixture structure:
```typescript
// src/services/mock-data/fixtures.ts
export const MOCK_USER = { _id: "mock_user_id", deviceId: "dev_device", ... };
export const MOCK_ACCOUNTS = [
  { _id: "acc_1", name: "bKash", type: "checking", balance: 1500000, ... },
  { _id: "acc_2", name: "Cash Wallet", type: "cash", balance: 350000, ... },
  { _id: "acc_3", name: "DBBL Savings", type: "savings", balance: 8000000, ... },
  { _id: "acc_4", name: "BRAC Card", type: "credit_card", balance: -250000, ... },
];
export const MOCK_TRANSACTIONS = generateMonthlyTransactions(6); // 6 months of realistic data
export const MOCK_CATEGORIES = [ /* Bangladeshi-relevant categories */ ];
export const MOCK_BUDGETS = [ /* Monthly budget assignments */ ];
```

### Testing Architecture (Separate from Mock Data)

Testing splits into three tiers, each with different tooling:

```
Tier 1: Convex Backend Functions (Vitest + convex-test)
  - Test queries, mutations, cron jobs in isolation
  - convex-test mocks the database, runs in edge-runtime
  - Fast, no React Native dependency
  - Config: vitest.config.ts with { environment: "edge-runtime" }

Tier 2: React Components (Jest + RNTL)
  - Test UI components with React Native Testing Library
  - Jest (NOT Vitest) — RNTL has known compatibility issues with Vitest
  - jest-expo preset handles RN transforms
  - Mock Convex hooks via jest.mock("convex/react")
  - Config: jest.config.js with jest-expo preset

Tier 3: End-to-End (Maestro)
  - YAML-based test flows against running app
  - Requires built APK/IPA on emulator/simulator
  - Test critical user journeys: add transaction, view budget, navigate reports
  - Config: .maestro/*.yml flow files
```

Why Jest for components, not Vitest: React Native Testing Library does not officially support Vitest. Community reports describe it as "an endless pit of issues." The Expo team recommends jest-expo. Using Vitest for Convex backend tests (where it excels with edge-runtime) and Jest for component tests (where it is the only stable option) is the pragmatic split.

## Convex Schema Changes

### New Tables Required

```typescript
// Addition to convex/schema.ts

// Subscription tracking (detected and confirmed recurring charges)
subscriptions: defineTable({
  userId: v.id("users"),
  payeeId: v.optional(v.id("payees")),
  name: v.string(),                    // e.g. "Netflix", "Grameenphone"
  amount: v.number(),                  // expected amount in paisa
  frequency: v.union(
    v.literal("weekly"),
    v.literal("biweekly"),
    v.literal("monthly"),
    v.literal("quarterly"),
    v.literal("yearly"),
  ),
  categoryId: v.optional(v.id("categories")),
  accountId: v.optional(v.id("accounts")),
  nextExpectedDate: v.string(),        // ISO date
  lastPaidDate: v.optional(v.string()),
  lastPaidAmount: v.optional(v.number()),
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("cancelled"),
  ),
  isAutoDetected: v.boolean(),         // true if pattern-detected
  confidence: v.optional(v.number()),  // detection confidence 0-1
  notifyDaysBefore: v.optional(v.number()), // reminder: 3 days default
}).index("by_userId", ["userId"]),

// Debt payoff goals (extends existing loanDetails concept)
debtGoals: defineTable({
  userId: v.id("users"),
  name: v.string(),                    // "Become Debt Free" etc.
  strategy: v.union(
    v.literal("avalanche"),            // highest interest first
    v.literal("snowball"),             // smallest balance first
    v.literal("custom"),               // user-ordered
  ),
  accountIds: v.array(v.id("accounts")), // which debt accounts included
  extraMonthlyPayment: v.number(),     // additional paisa beyond minimums
  customOrder: v.optional(v.array(v.id("accounts"))), // for custom strategy
  startDate: v.string(),
  projectedPayoffDate: v.optional(v.string()),
  totalInterestProjected: v.optional(v.number()),
}).index("by_userId", ["userId"]),
```

### Existing Table Modifications

```typescript
// loanDetails — already exists, needs one addition:
loanDetails: defineTable({
  // ... existing fields ...
  compoundFrequency: v.optional(v.string()), // "monthly" | "daily" — needed for accurate amortization
}),

// categories — add sinking fund metadata (optional, UI-only concern):
// NO schema change needed. Sinking funds are just categories with
// target type "spending_by_date" or "savings_balance".
// The UI distinction is presentation-only.

// scheduled — already has rrule + nextDate, sufficient for calendar view.
// No changes needed.
```

### Tables That Do NOT Need Changes

| Table | Why No Change |
|-------|---------------|
| `transactions` | Already has all needed fields for aggregation |
| `budgets` | Sinking fund budgets use same assigned/activity/available model |
| `targets` | Already supports `spending_by_date` and `savings_balance` for sinking funds |
| `scheduled` | Already has rrule + nextDate for calendar rendering |
| `accounts` | Already has debt account types (credit_card, mortgage, auto_loan, etc.) |
| `categories` | Sinking funds are just categories — no special type needed |
| `payees` | Already linked to transactions for subscription detection |

## Charting and Visualization

### Recommendation: Custom d3-sankey + react-native-svg for Sankey, react-native-gifted-charts for everything else

**Sankey Diagram (custom build):**

No React Native charting library supports Sankey diagrams natively. The approach is:

1. `d3-sankey` (pure math library, ~8KB) computes node positions and link paths
2. `react-native-svg` (already installed at 15.15.3) renders the SVG elements
3. Custom `SankeyFlow` component translates d3 output to `<Rect>` and `<Path>` elements

This is the same pattern used by web Sankey implementations (d3 for layout, React for rendering) but with react-native-svg instead of DOM SVG. The project already has react-native-svg installed.

```typescript
// Pseudocode for SankeyFlow component pattern
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import Svg, { Rect, Path, Text } from "react-native-svg";

function SankeyFlow({ data, width, height }) {
  const layout = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[0, 0], [width, height]]);

  const { nodes, links } = layout(data);
  const linkPath = sankeyLinkHorizontal();

  return (
    <Svg width={width} height={height}>
      {links.map(link => (
        <Path d={linkPath(link)} strokeWidth={link.width} ... />
      ))}
      {nodes.map(node => (
        <Rect x={node.x0} y={node.y0} width={node.x1-node.x0} height={node.y1-node.y0} ... />
      ))}
    </Svg>
  );
}
```

**Other Charts (react-native-gifted-charts):**

For standard chart types needed by reports (bar charts for income/expense trends, pie/donut for category breakdown, line charts for net worth over time), use `react-native-gifted-charts`:
- Pure JS implementation (no native linking)
- Supports bar, line, area, pie, donut, stacked bar
- Simpler API than Victory Native, less setup friction
- Already compatible with Expo without ejection
- 87K+ weekly downloads, actively maintained

The existing reports screen uses hand-built bar charts with View + percentage widths. These should be replaced with gifted-charts for consistency, animation support, and interactivity.

**Why not Victory Native:** Victory Native requires more setup with Expo and has documented compatibility friction. react-native-gifted-charts has a simpler integration path and covers all needed chart types. Victory Native's performance advantage (100+ FPS animations) is unnecessary for static financial reports.

### Calendar Component: react-native-calendars

For the recurring transaction calendar view, use `react-native-calendars` by Wix:
- Pure JS, Expo-compatible without ejection
- Provides Calendar and CalendarList components
- Supports day marking with custom styles (dots, colored periods)
- Widely adopted (the standard for RN calendar UIs)

## Tooling Integration Architecture

### Biome

Biome replaces the nonexistent ESLint + Prettier setup. Integration is straightforward:

```
Install: bun add -d @biomejs/biome
Init: bunx biome init -> creates biome.json
Extend: biome-config-expo for React Hooks rules

Integration points:
- package.json scripts: "lint": "biome check .", "format": "biome format --write ."
- CI: Add biome check step before build in .github/workflows/build.yml
- Pre-commit: Optional git hook via lefthook or simple-git-hooks
- Editor: VSCode Biome extension for format-on-save
```

No conflicts with existing tooling because there IS no existing linting/formatting tooling.

### Testing Setup (Dual Framework)

```
vitest.config.ts (Convex backend function tests)
  projects:
    - name: "convex"
      environment: "edge-runtime"
      include: ["convex/**/*.test.ts"]

jest.config.js (React Native component tests)
  preset: "jest-expo"
  transformIgnorePatterns: [standard RN ignore list]
  setupFilesAfterSetup: ["./jest.setup.ts"]
  include: ["src/**/*.test.tsx", "app/**/*.test.tsx"]

.maestro/ (E2E flows)
  home.yml
  add-transaction.yml
  budget-view.yml
```

### expo-updates (OTA)

```
Install: npx expo install expo-updates
Config: app.json -> add updates configuration:
  "updates": {
    "enabled": true,
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/[project-id]"
  },
  "runtimeVersion": { "policy": "fingerprint" }

Publish: eas update --branch production --message "description"

Integration with CI:
  - Add eas update step to .github/workflows/build.yml
  - Trigger on push to master (JS-only changes)
  - Full rebuild only when native dependencies change (fingerprint detects this)
```

### i18next Migration

The existing custom `useI18n()` hook at `src/lib/i18n/` provides basic translation lookup with fallback. Migrating to i18next:

```
Current: useTranslation() -> t("key.path") -> string lookup in en.ts/bn.ts
After:   useTranslation() -> t("key.path") -> i18next lookup with:
  - Pluralization: t("items", { count: 5 }) -> "5 items" / "5ta aitem"
  - Interpolation: t("balance", { amount: "5,000" })
  - Date/number formatting: integrated with expo-localization
  - Namespace support: separate files per feature
  - Language detection: expo-localization detects device locale

Migration path:
1. Install i18next, react-i18next, expo-localization
2. Convert en.ts/bn.ts to JSON format (i18next standard)
3. Create i18n.config.ts with initReactI18next plugin
4. Update useTranslation import across components
5. Keep same t("key") API — minimal component changes
6. Add interpolation/plurals where needed (new feature, not breaking)
```

The API surface (`t("key")`) stays the same, so migration is non-breaking. The key benefit is proper pluralization rules for Bengali (which has different plural forms than English).

## Patterns to Follow

### Pattern 1: Hook-Based Data Composition

**What:** All data fetching and computation happens in custom hooks, not in components. Components receive computed data and render it.

**When:** Every new feature that needs Convex data.

**Why:** The existing codebase follows this pattern with `useBudget()` and `useTransactions()`. New features should follow the same convention for consistency.

```typescript
// Good: Hook composes data
function useSankeyData(startDate: string, endDate: string) {
  const { userId } = useAppStore();
  const transactions = useQuery(api.transactions.getByDateRange,
    userId ? { userId, startDate, endDate } : "skip"
  );

  return useMemo(() => {
    if (!transactions) return null;
    return aggregateForSankey(transactions);
  }, [transactions]);
}

// Good: Component just renders
function CashFlowReport() {
  const data = useSankeyData(startDate, endDate);
  if (!data) return <Loading />;
  return <SankeyFlow data={data} width={width} height={300} />;
}
```

### Pattern 2: Service Layer for Pure Business Logic

**What:** Computation-heavy logic (debt amortization, subscription detection, Sankey aggregation) lives in pure functions under `src/services/`, not in hooks or components.

**When:** Any calculation that does not depend on React state or lifecycle.

**Why:** Pure functions are testable with Vitest (no React dependency needed), reusable across hooks, and easy to reason about.

```typescript
// src/services/debt-calc/index.ts
export function calculateAmortization(
  balance: number,
  apr: number,
  minimumPayment: number,
  extraPayment: number
): AmortizationSchedule { /* pure math */ }

export function compareStrategies(
  debts: DebtAccount[],
  extraBudget: number
): StrategyComparison { /* pure math */ }
```

### Pattern 3: Client-Side Aggregation for Reports

**What:** Report data aggregation happens client-side in hooks/services, not via new Convex queries.

**When:** The raw data is already fetched by existing queries (transactions, budgets, accounts).

**Why this app specifically:** With manual-only transaction entry (no bank sync), users will have hundreds to low thousands of transactions per year, not millions. Client-side aggregation of this volume is instantaneous. Adding Convex report-specific queries would add complexity without meaningful performance benefit.

**Exception:** If reports need data spanning multiple years, a Convex aggregation query is warranted to avoid fetching all historical transactions to the client.

## Anti-Patterns to Avoid

### Anti-Pattern 1: One Store Per Feature

**What:** Creating a new Zustand store for each new feature (debtStore, subscriptionStore, etc.)

**Why bad:** The existing architecture uses exactly two stores (`app-store` for global state, `ui-store` for transient UI state). Feature data comes from Convex via hooks. Adding feature-specific stores would create a parallel data layer that duplicates Convex state and goes stale.

**Instead:** Keep using the hook pattern. If a feature needs client-only state (like which debt strategy is selected in the UI), add it to `ui-store` or use local component state.

### Anti-Pattern 2: Convex Queries for Computed Data

**What:** Creating Convex queries that return pre-computed report data (e.g., a `cashFlowSankey` query that returns Sankey-ready node/link arrays).

**Why bad:** Pushes presentation logic into the backend. The Sankey node positions depend on screen width and chart dimensions, which the backend does not know. Also increases Convex function count and billing.

**Instead:** Fetch raw data via existing queries, aggregate in services, compute layout in components.

### Anti-Pattern 3: WebView for Charts

**What:** Using a WebView with a web charting library (Chart.js, Highcharts) to render charts inside the RN app.

**Why bad:** Performance overhead, gesture conflicts, inconsistent theming, breaks the "native feel" of the dark-surface Obsidian design system.

**Instead:** Use react-native-svg directly (for Sankey) and react-native-gifted-charts (for standard charts). Both render native SVG elements.

### Anti-Pattern 4: Mocking at the Network Layer

**What:** Using MSW (Mock Service Worker) or a proxy to intercept Convex WebSocket connections for offline development.

**Why bad:** Convex uses a custom WebSocket protocol, not REST. MSW does not intercept WebSocket connections. The mock would be fragile and require deep knowledge of Convex internals.

**Instead:** Mock at the hook level (environment-flag-controlled fixtures) or at the Convex provider level (ConvexReactClientFake).

## Build Order (Dependency Graph)

Features have dependencies that dictate build order:

```
Phase 1: Tooling Foundation (no feature dependencies)
  Biome setup
  Testing infrastructure (Jest + Vitest + Maestro scaffolding)
  Mock data provider (enables all subsequent UI development)
  i18next migration

Phase 2: Core Feature Extensions (depend on mock data)
  3-tap entry flow refinement (modifies existing QuickAdd)
  Sinking funds UI (uses existing targets/budgets — UI only)
  Standard charts upgrade (replace hand-built bars with gifted-charts)

Phase 3: New Feature Modules (depend on charting + schema changes)
  Subscription detection (new schema + service + UI)
  Calendar view (depends on scheduled + subscriptions data)
  Sankey diagram (depends on d3-sankey + gifted-charts being proven)
  Mobile reports architecture (depends on all chart components existing)

Phase 4: Advanced Features (depend on subscription + loan data)
  Debt payoff system (new schema + service + complex UI)
  expo-updates OTA setup (depends on stable app — do last)
```

**Rationale for ordering:**

1. Tooling first because it accelerates everything after it (linting catches bugs, tests validate features, mocks enable UI-first development without Convex).
2. Sinking funds before subscriptions because sinking funds need zero schema changes (existing targets table suffices) while subscriptions need a new table.
3. Sankey after standard charts because the team needs to prove the d3-sankey + react-native-svg pattern works before committing to the complex visualization.
4. Debt payoff last because it is the most complex feature (amortization math, multiple strategies, timeline projections) and depends on accurate loan data in the existing `loanDetails` table.
5. OTA updates last because it needs a stable codebase to deploy against, and improper setup can brick deployed apps.

## Scalability Considerations

| Concern | Current (100s of transactions) | At 10K transactions | At 100K transactions |
|---------|-------------------------------|---------------------|----------------------|
| Sankey aggregation | Client-side, instant | Client-side, <100ms | Move to Convex query with pre-aggregation |
| Subscription detection | Client-side scan, <50ms | Client-side scan, <500ms | Add Convex scheduled job for detection |
| Debt amortization | Client-side, instant | N/A (debt count stays low) | N/A |
| Calendar rendering | Render all days, instant | Same (calendar is monthly) | Same |
| Transaction list | FlashList handles well | FlashList with pagination | Add cursor-based pagination to Convex query |
| Report chart rendering | Direct render | Same (aggregated data is small) | Same |

For a manual-entry app in Bangladesh, reaching 10K transactions would take approximately 5-10 years of daily use. Client-side aggregation is the correct default. Server-side aggregation is a future optimization, not a current requirement.

## Sources

- Convex testing patterns: [Testing patterns for peace of mind](https://stack.convex.dev/testing-patterns)
- convex-test library: [convex-test documentation](https://docs.convex.dev/testing/convex-test)
- Testing React components with Convex: [Testing React Components](https://stack.convex.dev/testing-react-components-with-convex)
- d3-sankey library: [d3-sankey GitHub](https://github.com/d3/d3-sankey)
- Charts in React Native with react-native-svg and D3: [cmichel.io](https://cmichel.io/charts-in-react-native-svg-and-d3-js)
- Sankey diagram with React and D3: [react-graph-gallery](https://www.react-graph-gallery.com/sankey-diagram)
- react-native-gifted-charts: [npm](https://www.npmjs.com/package/react-native-gifted-charts)
- react-native-calendars: [Wix GitHub](https://github.com/wix/react-native-calendars)
- Biome config for Expo: [biome-config-expo GitHub](https://github.com/ahmadaccino/biome-config-expo)
- expo-updates documentation: [Expo docs](https://docs.expo.dev/versions/latest/sdk/updates/)
- Expo localization guide: [Expo localization docs](https://docs.expo.dev/guides/localization/)
- i18next with Expo: [i18next + expo-localization guide](https://medium.com/@kgkrool/implementing-internationalization-in-expo-react-native-i18next-expo-localization-8ed810ad4455)
- Maestro for React Native: [Maestro docs](https://docs.maestro.dev/get-started/supported-platform/react-native)
- RNTL + Vitest compatibility issues: [GitHub Discussion #1142](https://github.com/callstack/react-native-testing-library/discussions/1142)
- RN charting comparison: [LogRocket top RN chart libraries](https://blog.logrocket.com/top-react-native-chart-libraries/)

---

*Architecture analysis: 2026-03-25*
