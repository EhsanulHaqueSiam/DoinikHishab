# Phase 4: Mobile Reports & Sankey - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver fully functional mobile-optimized financial reports with touch interactions (swipe navigation, tap-to-filter, time range selection), an Age of Money trend chart in a new Financial Health tab, and a Sankey cash flow visualization with responsive layout (vertical on mobile, horizontal on web) and privacy mode.

</domain>

<decisions>
## Implementation Decisions

### Chart Library & Rendering
- **D-01:** Use react-native-gifted-charts for line/bar/area charts — uses react-native-svg (already installed), supports web/iOS/Android, has onPress/focusBarOnPress/renderTooltip/areaChart/reference lines/gradient fills. [Research override: victory-native requires @shopify/react-native-skia and does NOT support web rendering — incompatible with project's web target]
- **D-02:** Use d3-sankey for layout computation + custom react-native-svg rendering for Sankey diagram — d3-sankey computes node/link positions, we render with SVG Path/Rect components
- **D-03:** Extend existing mock data hooks pattern — add useReportData() hook returning mock monthly data, matching Phase 2/3 pattern (mock_ prefix, hook-level fallback while Convex is offline)
- **D-04:** Chart entrance animations via react-native-gifted-charts `isAnimated` prop (which uses reanimated internally) + react-native-reanimated for custom SwipeableChart transitions — already installed, consistent with codebase patterns

### Mobile Touch Interactions
- **D-05:** Swipe left/right with react-native-gesture-handler PanGesture to navigate between months — shows current period label with animated transition
- **D-06:** Tap a bar/segment to highlight and show detail tooltip — pressing a spending category bar filters the view to show transactions in that category
- **D-07:** Pill toggle strip for time ranges: 1M / 3M / 6M / 1Y / All — consistent with financial app conventions, defaults to current month
- **D-08:** No pull-to-refresh — Convex live queries auto-update data in real-time, consistent with rest of app

### Sankey Cash Flow Visualization
- **D-09:** Mobile Sankey uses vertical top-to-bottom layout — income sources at top, expense categories at bottom, curved links between. Simplified to top 5-8 categories with "Other" bucket for readability
- **D-10:** Web Sankey uses full horizontal left-to-right layout — classic Sankey with all categories visible, leveraging wider screen
- **D-11:** Privacy mode toggle via eye icon button in Sankey header — toggles between absolute amounts (৳5,000) and proportions only (25%). Links keep width proportions but labels switch. Persisted to MMKV
- **D-12:** Sankey link colors: income links teal, expense links use gradient from category color palette (matching spending chart colors). Links use 20% opacity fill with full-opacity borders

### Age of Money Trend Chart
- **D-13:** Smooth line chart with filled area below (area chart) — shows AoM value over time with gradient fill from teal to transparent. Daily data points, displayed by month
- **D-14:** Default data range is last 6 months — follows time range selector (1M/3M/6M/1Y/All). Shows daily AoM values within selected range
- **D-15:** New "Financial Health" report tab alongside Spending, Income/Expense, Net Worth — contains AoM trend and Days of Buffering trend charts
- **D-16:** 30-day dotted reference line on AoM chart — shows the "healthy" threshold (30 days AoM = one month ahead). Subtle gray dashed line with label

### Claude's Discretion
- Chart tooltip design and positioning
- Sankey node sizing and spacing algorithms
- Animation timing and easing curves
- Empty state designs for reports with no data
- Exact color palette for expense category links
- Touch feedback visual effects (highlight, ripple)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/reports/SpendingChart.tsx` — Horizontal bar chart component with color palette array (DEFAULT_COLORS). Currently uses View-based bars, will be replaced with victory-native charts
- `src/components/reports/IncomeExpenseChart.tsx` — Monthly bar chart with income/expense comparison. View-based, 6-month display. Pattern for monthly data handling
- `src/components/reports/NetWorthChart.tsx` — Bar chart with trend calculation (up/down). Normalization logic reusable
- `app/(tabs)/reports.tsx` — Reports screen with tab navigation (spending/income_expense/net_worth). Calculates spendingByCategory, incomeVsExpense, netWorth from Convex queries. Will add "financial_health" tab
- `react-native-svg` 15.15.3 already installed — base dependency for victory-native and custom Sankey rendering
- `react-native-reanimated` 4.2.1 and `react-native-gesture-handler` 2.30.0 already installed — used for swipe gestures and animations
- `src/services/budget-engine/index.ts` — Has calculateAgeOfMoney() already. Provides AoM data for trend chart
- `src/lib/currency.ts` — formatCurrency() for displaying amounts in BDT
- `src/lib/platform.ts` — shadow() helper and usePlatform() for platform detection (mobile vs web Sankey layout)

### Established Patterns
- Mock data at hook level with Convex fallback (useQuickAdd pattern from Phase 2)
- NativeWind className for styling with Tailwind utility classes
- Card component for wrapping report sections
- Tab-based report navigation in reports screen
- useAppStore() for userId and currentMonth access
- useTranslation() (i18next) for all user-facing strings

### Integration Points
- `app/(tabs)/reports.tsx` — Add "Financial Health" tab, integrate new chart components
- Report type enum needs "financial_health" | "sankey" additions
- New packages needed: victory-native, d3-sankey, @types/d3-sankey
- i18n keys needed for new report labels, time range labels, privacy mode labels

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
