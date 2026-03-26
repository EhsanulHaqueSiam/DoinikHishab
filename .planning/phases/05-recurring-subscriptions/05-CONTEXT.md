# Phase 5: Recurring & Subscriptions - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a recurring bills calendar (grid + list views with color-coded status), subscription auto-detection from transaction history, a subscriptions management page with burn rate metrics, and a cash flow forecasting chart with danger zone visualization.

</domain>

<decisions>
## Implementation Decisions

### Calendar & Bill View
- **D-01:** Custom calendar grid with RN Views — 7-column grid showing days, colored dots for bills. Tap a day to see bill details in a bottom sheet. No external calendar library needed
- **D-02:** Status color coding: teal=paid, saffron=upcoming, red=overdue — matches existing color palette (teal primary, saffron accent, red danger). Dot indicator on calendar days, full-color badge in list view
- **D-03:** List view grouped by date — upcoming bills sorted chronologically, grouped by "This week" / "Next week" / "This month". Each row shows payee, amount, due date, status badge
- **D-04:** Summary card at top showing total upcoming bills this month + total paid. Matches BalanceCard pattern from dashboard

### Subscription Auto-Detection & Management
- **D-05:** Pattern matching: 3+ transactions with same payee at regular intervals (weekly/monthly/yearly ±3 days) — runs on transaction history in hook. Surfaces candidates with confidence score
- **D-06:** Inline card with "Confirm" / "Not a subscription" buttons — detected subscriptions appear as dismissible suggestion cards on the subscriptions page. Confirmed ones become tracked subscriptions
- **D-07:** Subscriptions page: header with total monthly + annual burn rate, then list of confirmed subscriptions with category icons, amount, and frequency. Swipe left to remove. "Add manually" button at bottom
- **D-08:** MMKV for confirmed subscriptions (while Convex is offline) — store as JSON array with payee, amount, frequency, categoryId. Same pattern as other offline-first stores

### Cash Flow Forecasting
- **D-09:** Area chart with react-native-gifted-charts (LineChart with areaChart prop) — shows projected balance over time. Solid line for historical, dashed for forecast. Red fill below zero for danger zones
- **D-10:** Pill toggle: 30 / 60 / 90 days — reuse TimeRangeSelector component pattern from Phase 4, defaults to 30 days
- **D-11:** Red shaded area below the zero line — when projected balance dips below zero, the area between the line and zero fills with semi-transparent red. Zero line shown as a gray dashed reference
- **D-12:** Simple projection: current balance + recurring income - recurring expenses per day — assumes confirmed subscriptions repeat on schedule. Shows "estimated" label. No complex modeling

### Claude's Discretion
- Calendar grid animation and month navigation
- Bottom sheet design for day detail view
- Confidence score thresholds for subscription detection
- Swipe-to-delete gesture implementation
- "Add manually" form design
- Forecast chart tooltip content

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/reports/TimeRangeSelector.tsx` — Pill toggle component, reusable for forecast horizon
- `src/components/reports/report-types.ts` — Shared types, extend for recurring data
- `src/hooks/use-report-data.ts` — Mock data hook pattern, extend for recurring/subscription data
- `src/components/ui/Card.tsx` — Card component for summary cards
- `@gorhom/bottom-sheet` — Already installed for bottom sheet on day tap
- `react-native-gifted-charts` — Already installed for forecasting chart
- `src/services/storage/index.ts` — getSetting/setSetting for MMKV persistence
- `src/components/reports/ChartTooltip.tsx` — Floating tooltip, reusable for forecast chart

### Established Patterns
- Mock data at hook level with Convex fallback
- NativeWind className for styling
- Tab-based navigation within screens
- MMKV for offline-first data persistence
- Lucide icons for category/status indicators

### Integration Points
- New tab or screen for Recurring/Subscriptions (app/(tabs) or separate route)
- New i18n keys for recurring/subscription labels
- Extend mock data with recurring transaction patterns
- Cash flow forecast could integrate with existing reports screen or standalone

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
