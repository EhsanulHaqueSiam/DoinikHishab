# Phase 5: Recurring & Subscriptions - Research

**Researched:** 2026-03-26
**Domain:** Recurring bill tracking, subscription detection, cash flow forecasting (React Native / Expo)
**Confidence:** HIGH

## Summary

Phase 5 adds four capabilities to DoinikHishab: (1) a calendar view for upcoming bills with color-coded status, (2) auto-detection of subscriptions from transaction history, (3) a subscriptions management page with burn rate metrics, and (4) a cash flow forecasting chart with danger zone visualization.

The project's existing stack fully supports this phase with no new dependencies needed. `react-native-gifted-charts` (already installed v1.4.76) provides `LineChart` with `areaChart` mode for the forecast chart, and `LineChartBicolor` for rendering danger zones below zero. The custom calendar grid is built from plain RN Views (decision D-01 locked -- no external calendar library). Subscription data persists in MMKV via the established `getJSON`/`setJSON` pattern. The `scheduled` table already exists in the Convex schema with `rrule` field, providing the future backend model.

The subscription detection algorithm is a pure function operating on transaction history mock data, matching 3+ occurrences of the same payee at regular intervals. This is computation-only with no external dependencies. The cash flow projection is a straightforward daily balance calculation using confirmed subscriptions as the recurring schedule.

**Primary recommendation:** Build the calendar grid and subscription detection as isolated services first, then compose into screens. Use `LineChartBicolor` for the forecast chart to get native support for red-filled danger zones below zero, avoiding custom SVG overlay complexity.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Custom calendar grid with RN Views -- 7-column grid showing days, colored dots for bills. Tap a day to see bill details in a bottom sheet. No external calendar library needed
- **D-02:** Status color coding: teal=paid, saffron=upcoming, red=overdue -- matches existing color palette (teal primary, saffron accent, red danger). Dot indicator on calendar days, full-color badge in list view
- **D-03:** List view grouped by date -- upcoming bills sorted chronologically, grouped by "This week" / "Next week" / "This month". Each row shows payee, amount, due date, status badge
- **D-04:** Summary card at top showing total upcoming bills this month + total paid. Matches BalanceCard pattern from dashboard
- **D-05:** Pattern matching: 3+ transactions with same payee at regular intervals (weekly/monthly/yearly +/-3 days) -- runs on transaction history in hook. Surfaces candidates with confidence score
- **D-06:** Inline card with "Confirm" / "Not a subscription" buttons -- detected subscriptions appear as dismissible suggestion cards on the subscriptions page. Confirmed ones become tracked subscriptions
- **D-07:** Subscriptions page: header with total monthly + annual burn rate, then list of confirmed subscriptions with category icons, amount, and frequency. Swipe left to remove. "Add manually" button at bottom
- **D-08:** MMKV for confirmed subscriptions (while Convex is offline) -- store as JSON array with payee, amount, frequency, categoryId. Same pattern as other offline-first stores
- **D-09:** Area chart with react-native-gifted-charts (LineChart with areaChart prop) -- shows projected balance over time. Solid line for historical, dashed for forecast. Red fill below zero for danger zones
- **D-10:** Pill toggle: 30 / 60 / 90 days -- reuse TimeRangeSelector component pattern from Phase 4, defaults to 30 days
- **D-11:** Red shaded area below the zero line -- when projected balance dips below zero, the area between the line and zero fills with semi-transparent red. Zero line shown as a gray dashed reference
- **D-12:** Simple projection: current balance + recurring income - recurring expenses per day -- assumes confirmed subscriptions repeat on schedule. Shows "estimated" label. No complex modeling

### Claude's Discretion
- Calendar grid animation and month navigation
- Bottom sheet design for day detail view
- Confidence score thresholds for subscription detection
- Swipe-to-delete gesture implementation
- "Add manually" form design
- Forecast chart tooltip content

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RECR-01 | Calendar view showing upcoming bills/subscriptions with status indicators (paid/upcoming/overdue) | Custom 7-column grid with RN Views. Color coding: teal (#0d9488) = paid, saffron (#e6a444) = upcoming, red (#f87171) = overdue. Day tap opens @gorhom/bottom-sheet detail. |
| RECR-02 | Calendar toggle between calendar grid and list view with monthly totals | Toggle state via useState. List view uses FlashList with date-grouped sections (This week / Next week / This month). Summary card at top. |
| RECR-03 | Subscription auto-detection from transaction history (3+ occurrences of same payee at regular intervals) | Pure function service: group transactions by payee, check intervals for weekly (7d +/-3d), monthly (30d +/-3d), yearly (365d +/-3d) patterns. Confidence scoring based on regularity. |
| RECR-04 | Subscriptions view showing monthly/annual burn rate with manual add/remove | MMKV persistence via getJSON/setJSON with `sub:` prefix. Swipeable component from react-native-gesture-handler for swipe-to-delete. Burn rate = sum of monthly-normalized amounts. |
| RECR-05 | Cash flow forecasting chart projecting account balance over 30/60/90 days based on recurring items | LineChartBicolor from react-native-gifted-charts. Pill toggle reuses TimeRangeSelector pattern. Daily balance projection from confirmed subscriptions. |
| RECR-06 | Forecast danger zones highlighted in red where projected balance dips below zero | LineChartBicolor supports colorNegative, startFillColorNegative props for native below-zero red fill. Reference line at zero via showReferenceLine1. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-gifted-charts | 1.4.76 | Forecast area chart (LineChart + LineChartBicolor) | Already installed, used by Phase 4 charts |
| @gorhom/bottom-sheet | 5.2.8 | Day detail bottom sheet on calendar tap | Already installed, used by QuickAdd |
| @shopify/flash-list | 2.3.0+ | Performant list for bill list view and subscriptions | Already installed, optimized RecyclerView |
| react-native-gesture-handler | 2.30.0 | Swipeable component for swipe-to-delete subscriptions | Already installed, Swipeable exported |
| react-native-reanimated | 4.2.1 | Calendar month transition animations | Already installed, used throughout app |
| react-native-mmkv | 4.2.0 | Offline subscription persistence | Already installed, established pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-i18next | (installed) | i18n for recurring/subscription labels | All user-facing strings |
| lucide-react-native | 0.577.0 | Category icons and status indicators | Subscription list items, calendar badges |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom calendar grid | react-native-calendars | D-01 locked: custom grid. External lib adds 150KB+ and fights NativeWind styling |
| LineChartBicolor | Custom SVG overlay for danger zones | BiColor component handles negative fills natively -- custom SVG would be fragile and complex |
| Swipeable (gesture-handler) | Custom pan gesture | Swipeable gives standard iOS/Android swipe UX out-of-box with renderRightActions |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    recurring/
      CalendarGrid.tsx          # 7-column month grid with bill dots
      CalendarGrid.test.tsx
      CalendarDaySheet.tsx      # Bottom sheet for day detail
      BillListView.tsx          # Grouped list of upcoming bills
      BillListView.test.tsx
      BillSummaryCard.tsx       # Monthly summary (total upcoming + paid)
      BillSummaryCard.test.tsx
      SubscriptionCard.tsx      # Detected subscription suggestion card
      SubscriptionCard.test.tsx
      SubscriptionList.tsx      # Confirmed subscriptions with swipe-to-delete
      SubscriptionList.test.tsx
      BurnRateHeader.tsx        # Monthly + annual burn rate display
      BurnRateHeader.test.tsx
      ForecastChart.tsx         # Cash flow projection area chart
      ForecastChart.test.tsx
      ForecastHorizonSelector.tsx  # 30/60/90 pill toggle
  hooks/
    use-recurring-data.ts       # Mock data hook for bills & subscriptions
    use-recurring-data.test.ts
  services/
    subscription-detector/
      index.ts                  # Detection algorithm (pure functions)
      index.test.ts
    recurring-storage/
      index.ts                  # MMKV persistence for subscriptions
      index.test.ts
app/
  (tabs)/
    recurring.tsx               # New tab: recurring/subscriptions screen
```

### Pattern 1: MMKV Service with Key Prefix (Established)
**What:** Subscription data stored in MMKV with `sub:` prefix for namespace isolation
**When to use:** All subscription CRUD operations
**Example:**
```typescript
// Source: established pattern from src/services/frequency/index.ts
import { getJSON, setJSON, deleteKey } from "../storage";

const SUB_PREFIX = "sub:";
const SUB_LIST_KEY = "sub:list";

export interface Subscription {
  id: string;              // unique ID (sub_timestamp_random)
  payee: string;
  amount: number;          // paisa
  frequency: "weekly" | "monthly" | "yearly";
  categoryId: string;
  nextDueDate: string;     // ISO date YYYY-MM-DD
  isActive: boolean;
}

export function getSubscriptions(): Subscription[] {
  return getJSON<Subscription[]>(SUB_LIST_KEY) ?? [];
}

export function saveSubscriptions(subs: Subscription[]): void {
  setJSON(SUB_LIST_KEY, subs);
}
```

### Pattern 2: Mock Data at Hook Level (Established)
**What:** Hook returns mock data when Convex is offline, falls back to real queries later
**When to use:** All data fetching for this phase
**Example:**
```typescript
// Source: established pattern from src/hooks/use-report-data.ts
export function useRecurringData(): {
  bills: BillItem[];
  subscriptions: Subscription[];
  detectedSubscriptions: DetectedSubscription[];
  isLoading: boolean;
} {
  // Mock bills generated from subscription schedule
  // Confirmed subscriptions from MMKV
  // Detected subscriptions from transaction history analysis
}
```

### Pattern 3: Subscription Detection Algorithm (Pure Functions)
**What:** Analyze transaction history to find recurring patterns
**When to use:** Subscription auto-detection service
**Example:**
```typescript
export interface DetectedSubscription {
  payee: string;
  amount: number;           // paisa (average)
  frequency: "weekly" | "monthly" | "yearly";
  confidence: number;       // 0-1
  occurrences: number;
  lastDate: string;
  categoryId?: string;
}

export function detectSubscriptions(
  transactions: MockTransaction[]
): DetectedSubscription[] {
  // 1. Group by payee
  // 2. For each payee with 3+ transactions:
  //    a. Sort by date
  //    b. Calculate intervals between consecutive transactions
  //    c. Check if intervals cluster around 7d, 30d, or 365d (+/-3d tolerance)
  //    d. Calculate confidence = consistent intervals / total intervals
  // 3. Return candidates with confidence > threshold
}
```

### Pattern 4: LineChartBicolor for Danger Zones
**What:** Use gifted-charts BiColor component for red fill below zero
**When to use:** Forecast chart with balance projection
**Example:**
```typescript
// Source: react-native-gifted-charts docs + installed v1.4.76
import { LineChartBicolor } from "react-native-gifted-charts";

<LineChartBicolor
  areaChart
  data={forecastData}
  color="#14b8a6"
  colorNegative="#f87171"
  startFillColor="#0d9488"
  startFillColorNegative="#f87171"
  startOpacity={0.3}
  startOpacityNegative={0.3}
  endFillColor="transparent"
  endFillColorNegative="transparent"
  showReferenceLine1
  referenceLine1Position={0}
  referenceLine1Config={{
    color: "#4e6381",
    dashWidth: 4,
    dashGap: 4,
  }}
  noOfSectionsBelowXAxis={2}
  mostNegativeValue={minProjectedBalance}
/>
```

### Pattern 5: Calendar Grid Layout (Custom RN Views)
**What:** 7-column grid using RN View/Pressable, no external library
**When to use:** Calendar view for bills
**Example:**
```typescript
// 7-column grid with day cells
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Each cell: Pressable with day number + colored dots
// Dots: teal (#0d9488) = paid, saffron (#e6a444) = upcoming, red (#f87171) = overdue
// Month navigation: chevron buttons or swipe (SwipeableChart pattern)
```

### Anti-Patterns to Avoid
- **Dynamic NativeWind class strings:** Do not concatenate class names dynamically. Use ternary with full static strings: `isActive ? "bg-primary-500" : "bg-surface-300"`
- **Floating point money math:** All amounts in paisa (integers). Burn rate calculations must use integer division then format at display time
- **Raw MMKV access in components:** Always go through service functions (getSubscriptions/saveSubscriptions), never call getJSON directly from components
- **Heavy computation in render:** Subscription detection is O(n*m) -- run in useMemo with proper deps, not on every render

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe-to-delete gesture | Custom Pan gesture with delete threshold | `Swipeable` from react-native-gesture-handler | Standard platform UX, handles momentum, bounce-back, right-actions reveal |
| Below-zero chart fill | Custom SVG path calculation for negative regions | `LineChartBicolor` from react-native-gifted-charts | Native bicolor support with Negative-suffixed props, handles fill gradients |
| Bottom sheet modal | Custom Animated.View with gesture dismiss | `@gorhom/bottom-sheet` (already used in QuickAdd) | Handles keyboard, snap points, backdrop, gesture dismiss |
| Date math (day-of-month, next occurrence) | Manual Date arithmetic | Standard `Date` API with careful edge case handling | Month-end edge cases (Jan 31 -> Feb 28) need attention but no library required |

**Key insight:** This phase is primarily custom UI (calendar grid) and business logic (detection algorithm, projection math). The infrastructure is already installed -- the challenge is computation accuracy and clean data flow, not library integration.

## Common Pitfalls

### Pitfall 1: Calendar Month Edge Cases
**What goes wrong:** Bills on day 31 disappear in months with 30 or fewer days
**Why it happens:** Naive date math assumes all months have the same number of days
**How to avoid:** When generating bill occurrences for a month, clamp the day to the last day of that month. `new Date(year, month, 0).getDate()` gives the last day.
**Warning signs:** Bills "missing" in February, April, June, September, November

### Pitfall 2: Subscription Detection False Positives
**What goes wrong:** Regular one-time expenses to the same payee (e.g., monthly grocery runs to the same store) get flagged as subscriptions
**Why it happens:** Pattern matching on payee + regular interval matches normal shopping habits
**How to avoid:** Set minimum confidence threshold (recommend 0.7). Require amount variance < 20% across occurrences. Show as suggestion cards, never auto-confirm.
**Warning signs:** Subscription suggestions that seem wrong -- "Groceries" showing as a subscription

### Pitfall 3: Forecast Projection Drift
**What goes wrong:** 90-day forecast diverges wildly from reality, showing unrealistic balance
**Why it happens:** Linear projection compounds errors -- a missed bill or unexpected income cascades
**How to avoid:** Label chart clearly as "Estimated." Keep projection simple (D-12 locked). Don't add complexity. The value is in seeing danger zones, not precise predictions.
**Warning signs:** Forecast balance at day 90 seems unreasonable

### Pitfall 4: LineChartBicolor Curve Limitation
**What goes wrong:** Setting `curved={true}` on LineChartBicolor causes rendering issues
**Why it happens:** Per official docs: "Curved lines are not yet supported in bicolor charts"
**How to avoid:** Use straight line segments only for the forecast chart. This actually suits the forecast use case (step-like daily projections).
**Warning signs:** Chart renders incorrectly or crashes when `curved` prop is passed

### Pitfall 5: MMKV Data Structure Migration
**What goes wrong:** Changing the Subscription interface later breaks existing stored data
**Why it happens:** MMKV stores raw JSON with no schema versioning
**How to avoid:** Include a `version` field in the stored data structure. Add migration logic in the storage service. Start with version 1.
**Warning signs:** App crashes on launch for users who already have subscriptions saved

### Pitfall 6: Swipeable Component Import
**What goes wrong:** Importing `Swipeable` from wrong path or using the legacy version
**Why it happens:** react-native-gesture-handler has both `Swipeable` (legacy) and `ReanimatedSwipeable` (new)
**How to avoid:** Use `import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'` for the Reanimated-based version that works with the existing Reanimated 4.x setup. Or use the standard `import { Swipeable } from 'react-native-gesture-handler'` -- both are available.
**Warning signs:** Swipe animation stutters or doesn't use Reanimated worklets

### Pitfall 7: getAllKeys Not Exported from Storage
**What goes wrong:** Importing `getAllKeys` from `../storage` fails at runtime
**Why it happens:** The frequency service imports `getAllKeys` from storage, but it's not exported from `src/services/storage/index.ts`. This works via jest mock but may fail at runtime.
**How to avoid:** Either add `export function getAllKeys()` to the storage service, or avoid depending on it in new services. For subscription storage, use a single list key (`sub:list`) instead of prefix-scanning like frequency does.
**Warning signs:** Build succeeds but runtime error on `getAllKeys is not a function`

### Pitfall 8: Tab Count Overflow
**What goes wrong:** Adding a 7th tab makes the tab bar cramped on small Android devices
**Why it happens:** Current layout has 6 tabs. A new "Recurring" tab would be the 7th.
**How to avoid:** Consider making Recurring a sub-screen of an existing tab (e.g., accessible from Dashboard or as a nested route) rather than a new top-level tab. Alternatively, the tab bar already uses icons + small labels that fit on standard screens, so 7 tabs may still work with slightly smaller tap targets.
**Warning signs:** Tab labels overlap or tap targets are too small on 360px-wide devices

## Code Examples

Verified patterns from the existing codebase:

### Calendar Grid Day Cell
```typescript
// Pattern: Pressable with colored status dot
// Source: project convention (NativeWind className, shadow helper)
interface DayCellProps {
  day: number;
  bills: BillItem[];
  onPress: () => void;
  isToday: boolean;
  isCurrentMonth: boolean;
}

function DayCell({ day, bills, onPress, isToday, isCurrentMonth }: DayCellProps) {
  const hasOverdue = bills.some((b) => b.status === "overdue");
  const hasUpcoming = bills.some((b) => b.status === "upcoming");
  const hasPaid = bills.some((b) => b.status === "paid");

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center py-2 rounded-xl ${
        isToday ? "bg-primary-400/20 border border-primary-500/30" : ""
      } ${isCurrentMonth ? "" : "opacity-30"}`}
    >
      <Text className={`text-sm ${isToday ? "text-primary-700 font-bold" : "text-foreground"}`}>
        {day}
      </Text>
      <View className="flex-row gap-0.5 mt-1">
        {hasOverdue && <View className="w-1.5 h-1.5 rounded-full bg-danger" />}
        {hasUpcoming && <View className="w-1.5 h-1.5 rounded-full bg-accent" />}
        {hasPaid && <View className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </View>
    </Pressable>
  );
}
```

### Summary Card (BalanceCard Pattern)
```typescript
// Source: src/components/dashboard/BalanceCard.tsx pattern
function BillSummaryCard({ upcomingTotal, paidTotal, billCount }: BillSummaryProps) {
  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5 bg-surface-200 border border-primary-400/15"
      style={shadow("#0d9488", 0, 8, 0.12, 24, 8)}
    >
      <Text className="text-2xs font-semibold text-surface-900 uppercase tracking-widest">
        {t("recurring.upcomingBills")}
      </Text>
      <Text className="text-hero font-bold text-foreground mt-1 tracking-tight">
        {formatCurrency(upcomingTotal)}
      </Text>
      <View className="h-px bg-border/30 my-4" />
      <View className="flex-row gap-6">
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("recurring.paid")}
          </Text>
          <Text className="text-lg font-bold text-primary-700 mt-0.5">
            {formatCurrency(paidTotal)}
          </Text>
        </View>
        <View className="w-px bg-border/30" />
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("recurring.count")}
          </Text>
          <Text className="text-lg font-bold text-surface-900 mt-0.5">
            {billCount}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

### Forecast Data Projection
```typescript
// Pure function -- no hooks dependency
export function projectCashFlow(
  currentBalance: number,    // paisa
  subscriptions: Subscription[],
  days: number               // 30, 60, or 90
): { date: string; value: number }[] {
  const today = new Date();
  const points: { date: string; value: number }[] = [];
  let balance = currentBalance;

  for (let d = 0; d <= days; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    // Apply recurring items due on this date
    for (const sub of subscriptions) {
      if (isDueOnDate(sub, date)) {
        if (sub.categoryId?.startsWith("mock_cat_salary") || sub.categoryId?.startsWith("mock_cat_freelance")) {
          balance += sub.amount; // income
        } else {
          balance -= sub.amount; // expense
        }
      }
    }

    points.push({ date: dateStr, value: balance });
  }

  return points;
}
```

### Swipeable Delete Action
```typescript
// Source: react-native-gesture-handler Swipeable API
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

function renderRightActions() {
  return (
    <View className="bg-danger justify-center px-6">
      <Text className="text-white font-bold">{t("common.delete")}</Text>
    </View>
  );
}

<Swipeable
  renderRightActions={renderRightActions}
  onSwipeableOpen={() => handleRemoveSubscription(sub.id)}
  overshootRight={false}
>
  {/* Subscription row content */}
</Swipeable>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-native-calendars | Custom calendar grids | 2024+ | More control over styling, smaller bundle, NativeWind compatible |
| Victory Native charts | react-native-gifted-charts | Phase 4 decision | SVG-based, no Skia dependency, works on all platforms |
| Swipeable (legacy RNGH) | ReanimatedSwipeable | RNGH v2.14+ | Uses Reanimated worklets for 60fps animations |
| Context API state | Zustand stores | Project convention | Simpler API, no provider nesting, selector-based re-renders |

**Deprecated/outdated:**
- `react-native-calendars`: Heavy, difficult to customize with NativeWind, not needed for this simple grid
- Legacy `Swipeable` from RNGH: Still works but `ReanimatedSwipeable` is the recommended replacement

## Open Questions

1. **Tab vs. nested route for Recurring screen**
   - What we know: Currently 6 tabs (Dashboard, Transactions, Budget, Accounts, Reports, Settings). D-01 mentions "new tab or screen."
   - What's unclear: Whether a 7th tab fits the tab bar on small devices (360px width).
   - Recommendation: Add as a 7th tab initially. If tab bar becomes too cramped, move to a nested route accessible from Dashboard. The tab bar currently uses small uppercase labels + emoji icons that should accommodate one more.

2. **Forecast chart: LineChart vs LineChartBicolor for dashed segments**
   - What we know: D-09 wants "solid line for historical, dashed for forecast." LineChartBicolor does not support `curved` but supports `areaChart`. Standard LineChart supports `strokeDashArray` and `lineSegments` for mixed solid/dashed lines.
   - What's unclear: Whether LineChartBicolor supports `strokeDashArray` or `lineSegments` for partial dashing.
   - Recommendation: Use standard `LineChart` with `lineSegments` prop to switch dash style at the today boundary. For the danger zone red fill, overlay a separate rendering approach or accept that the standard LineChart `sectionColors` prop can highlight the negative region. Alternatively, split the data into two datasets (historical solid + forecast dashed) if LineChartBicolor limitations block mixed dash styles.

3. **Detection algorithm mock data**
   - What we know: Convex is offline. Transaction history comes from mock data.
   - What's unclear: Whether existing mock data has enough recurring patterns to demonstrate detection.
   - Recommendation: Generate specific mock transaction data with deliberate recurring patterns (e.g., "Netflix" monthly, "Spotify" monthly, "Gym" monthly) in the `useRecurringData` hook. This keeps the detection algorithm honest while providing demonstrable results.

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun -- use `bun add` not npm/yarn
- **Styling:** NativeWind v4 with static className strings only
- **Amounts:** Stored in paisa (integer), displayed as BDT
- **Convex offline:** Build with mock data at hook level, Convex fallback later
- **No new paid services:** Free tier everything
- **Mobile-first:** Android primary, web secondary
- **Shadows:** Use `shadow()` from `@lib/platform`, not raw shadow props
- **Path aliases:** Use `@components/*`, `@lib/*`, `@hooks/*`, `@stores/*` or relative imports
- **i18n:** All user-facing strings via `useTranslation()` / `t()` from react-i18next
- **Test framework:** Jest 29 + jest-expo, co-located test files (*.test.ts alongside source)
- **No Co-Authored-By in commits:** Per global CLAUDE.md

## Environment Availability

No external dependencies beyond what is already installed. Phase is purely code/config changes.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| react-native-gifted-charts | Forecast chart | Yes | 1.4.76 | -- |
| @gorhom/bottom-sheet | Day detail sheet | Yes | 5.2.8 | -- |
| react-native-gesture-handler | Swipe-to-delete | Yes | 2.30.0 | -- |
| react-native-reanimated | Animations | Yes | 4.2.1 | -- |
| react-native-mmkv | Subscription persistence | Yes | 4.2.0 | MemoryStorage (web) |
| @shopify/flash-list | Bill/subscription lists | Yes | 2.3.0+ | -- |
| lucide-react-native | Icons | Yes | 0.577.0 | -- |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo |
| Config file | `jest.config.js` |
| Quick run command | `bun run test -- --testPathPattern=recurring --no-coverage` |
| Full suite command | `bun run test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RECR-01 | Calendar grid renders days with colored status dots | unit | `bun run test -- --testPathPattern=CalendarGrid.test -x` | Wave 0 |
| RECR-02 | Toggle between calendar and list view, list shows grouped bills | unit | `bun run test -- --testPathPattern=BillListView.test -x` | Wave 0 |
| RECR-03 | Detect subscriptions from 3+ same-payee transactions at regular intervals | unit | `bun run test -- --testPathPattern=subscription-detector -x` | Wave 0 |
| RECR-04 | Subscription list shows burn rate, supports add/remove | unit | `bun run test -- --testPathPattern=SubscriptionList.test -x` | Wave 0 |
| RECR-05 | Forecast chart renders projected balance over 30/60/90 days | unit | `bun run test -- --testPathPattern=ForecastChart.test -x` | Wave 0 |
| RECR-06 | Negative balance regions filled with red | unit | `bun run test -- --testPathPattern=ForecastChart.test -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test -- --testPathPattern=recurring --no-coverage`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/subscription-detector/index.test.ts` -- covers RECR-03 (detection algorithm)
- [ ] `src/services/recurring-storage/index.test.ts` -- covers RECR-04 (MMKV persistence)
- [ ] `src/components/recurring/CalendarGrid.test.tsx` -- covers RECR-01
- [ ] `src/components/recurring/BillListView.test.tsx` -- covers RECR-02
- [ ] `src/components/recurring/ForecastChart.test.tsx` -- covers RECR-05, RECR-06
- [ ] `src/components/recurring/SubscriptionList.test.tsx` -- covers RECR-04
- [ ] `src/components/recurring/BurnRateHeader.test.tsx` -- covers RECR-04
- [ ] `src/hooks/use-recurring-data.test.ts` -- covers mock data hook
- [ ] Jest mock for `LineChartBicolor` in `jest.setup.js` -- add to existing gifted-charts mock
- [ ] Jest mock for `Swipeable`/`ReanimatedSwipeable` in `jest.setup.js`

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/components/reports/`, `src/hooks/use-report-data.ts`, `src/services/storage/index.ts`, `src/services/frequency/index.ts` -- established patterns
- Codebase analysis: `convex/schema.ts` -- `scheduled` table with `rrule` field already exists
- Codebase analysis: `jest.setup.js` -- existing mock patterns for gifted-charts, gesture-handler, bottom-sheet
- Installed package: `react-native-gifted-charts` v1.4.76 -- `LineChartBicolor` export verified in `dist/index.d.ts`
- Installed package: `react-native-gesture-handler` v2.30.0 -- `Swipeable` and `ReanimatedSwipeable` exports verified

### Secondary (MEDIUM confidence)
- [react-native-gifted-charts LineChartBicolor docs](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/LineChart/LineChartBicolorProps.md) -- Negative-suffixed props for below-zero coloring
- [react-native-gifted-charts LineChart props](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/LineChart/LineChartProps.md) -- Reference lines, dash styles, negative Y-axis props

### Tertiary (LOW confidence)
- None -- all findings verified against installed packages and official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in prior phases
- Architecture: HIGH -- follows established project patterns (mock data hooks, MMKV services, NativeWind components)
- Pitfalls: HIGH -- identified from codebase analysis (getAllKeys export gap, LineChartBicolor curve limitation, tab count)
- Detection algorithm: MEDIUM -- logic is straightforward but confidence thresholds need tuning with real data

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (stable -- no library upgrades expected)
