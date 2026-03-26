# Phase 4: Mobile Reports & Sankey - Research

**Researched:** 2026-03-26
**Domain:** React Native charting, Sankey visualization, touch interactions, mobile-first data visualization
**Confidence:** HIGH

## Summary

This phase replaces the existing View-based report charts with interactive charting components, adds a Financial Health tab with Age of Money and Days of Buffering trend charts, and delivers a Sankey cash flow visualization with responsive layout and privacy mode.

The most critical research finding is a **chart library incompatibility**: the user-decided `victory-native` (D-01) requires `@shopify/react-native-skia` as a mandatory peer dependency (not optional), and does **not support web rendering**. Since this project targets web as a secondary platform, this creates a significant gap. The recommended resolution is to use `react-native-gifted-charts` instead, which renders via `react-native-svg` (already installed), supports web/iOS/Android, has onPress/focusBarOnPress built in, supports area charts with gradient fills, and supports reference lines -- covering all phase requirements without adding heavy native dependencies. The d3-sankey decision (D-02) remains sound -- d3-sankey for layout computation plus custom react-native-svg rendering is the correct approach for the Sankey diagram.

**Primary recommendation:** Replace victory-native with react-native-gifted-charts (v1.4.76) for bar/line/area charts. Keep d3-sankey (v0.12.3) + custom react-native-svg for Sankey. This eliminates the Skia dependency, maintains web support, and covers all required chart types with touch interactions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use victory-native for line/bar/area charts -- mature RN charting lib built on react-native-svg, supports touch interactions and animations natively
- **D-02:** Use d3-sankey for layout computation + custom react-native-svg rendering for Sankey diagram -- d3-sankey computes node/link positions, we render with SVG Path/Rect components
- **D-03:** Extend existing mock data hooks pattern -- add useReportData() hook returning mock monthly data, matching Phase 2/3 pattern (mock_ prefix, hook-level fallback while Convex is offline)
- **D-04:** Use react-native-reanimated for chart entrance animations -- already installed, consistent with codebase patterns
- **D-05:** Swipe left/right with react-native-gesture-handler PanGesture to navigate between months -- shows current period label with animated transition
- **D-06:** Tap a bar/segment to highlight and show detail tooltip -- pressing a spending category bar filters the view to show transactions in that category
- **D-07:** Pill toggle strip for time ranges: 1M / 3M / 6M / 1Y / All -- consistent with financial app conventions, defaults to current month
- **D-08:** No pull-to-refresh -- Convex live queries auto-update data in real-time, consistent with rest of app
- **D-09:** Mobile Sankey uses vertical top-to-bottom layout -- income sources at top, expense categories at bottom, curved links between. Simplified to top 5-8 categories with "Other" bucket for readability
- **D-10:** Web Sankey uses full horizontal left-to-right layout -- classic Sankey with all categories visible, leveraging wider screen
- **D-11:** Privacy mode toggle via eye icon button in Sankey header -- toggles between absolute amounts and proportions only. Persisted to MMKV
- **D-12:** Sankey link colors: income links teal, expense links use gradient from category color palette. Links use 20% opacity fill with full-opacity borders
- **D-13:** Smooth line chart with filled area below (area chart) -- shows AoM value over time with gradient fill from teal to transparent. Daily data points, displayed by month
- **D-14:** Default data range is last 6 months -- follows time range selector (1M/3M/6M/1Y/All). Shows daily AoM values within selected range
- **D-15:** New "Financial Health" report tab alongside Spending, Income/Expense, Net Worth -- contains AoM trend and Days of Buffering trend charts
- **D-16:** 30-day dotted reference line on AoM chart -- shows the "healthy" threshold

### Claude's Discretion
- Chart tooltip design and positioning
- Sankey node sizing and spacing algorithms
- Animation timing and easing curves
- Empty state designs for reports with no data
- Exact color palette for expense category links
- Touch feedback visual effects (highlight, ripple)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RPRT-01 | All existing reports (spending, income vs expense, net worth) fully functional on mobile with touch interactions | react-native-gifted-charts provides BarChart with onPress, focusBarOnPress, renderTooltip; LineChart with areaChart prop; all work on mobile |
| RPRT-02 | Responsive chart components with tap-to-filter segments and swipe between time periods | focusBarOnPress + focusedBarConfig for tap-to-filter; PanGesture from react-native-gesture-handler for swipe navigation; TimeRangeSelector pill strip |
| RPRT-03 | Age of Money line chart showing AoM trend over time in reports section | react-native-gifted-charts LineChart with areaChart prop, curved lines, showReferenceLine1 for 30-day threshold, gradient fill via startFillColor/endFillColor |
| RPRT-04 | Sankey cash flow diagram using d3-sankey layout + react-native-svg rendering | d3-sankey v0.12.3 computes node/link positions; custom react-native-svg Path/Rect rendering; TypeScript types via @types/d3-sankey |
| RPRT-05 | Sankey simplified to vertical layout on mobile, full horizontal on web | usePlatform() hook for detection; d3-sankey supports configurable extent/nodeWidth for both orientations; vertical = swap x/y coordinates |
| RPRT-06 | Sankey privacy mode to hide amounts for screenshots/sharing | PrivacyToggle component using MMKV persistence (existing storage service); label swap from amounts to percentages |
</phase_requirements>

## Standard Stack

### CRITICAL: Chart Library Decision Override

**D-01 specified victory-native, but research reveals critical incompatibilities:**

1. **victory-native v41.20.2 requires `@shopify/react-native-skia` as a MANDATORY peer dependency** (not optional). This adds ~3MB of native binary to the app.
2. **victory-native does NOT support web rendering.** Official docs state web is not supported. The recommended workaround is to use the separate `victory` package for web builds, which requires module aliasing.
3. **Skia v1/v2 compatibility issues** with Expo SDK 55 (react-native-skia v2 was needed for Expo 53+, victory-native v41 originally required v1).

**Recommended replacement: `react-native-gifted-charts` v1.4.76**
- Renders via `react-native-svg` (already installed in project as v15.15.3)
- Works on iOS, Android, AND web (verified, with active web bug fixes)
- Built-in `onPress`, `focusBarOnPress`, `renderTooltip` for touch interactions
- `areaChart` prop on LineChart for area charts with gradient fills
- `showReferenceLine1` for the 30-day AoM threshold line
- `isAnimated` for chart entrance animations
- `horizontal` prop for horizontal bar charts
- Only requires `expo-linear-gradient` as additional dependency (peer dep)
- No Skia dependency, no native rebuilds, no web compatibility issues

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-gifted-charts | 1.4.76 | Bar, line, area charts with touch interactions | SVG-based, web+native, built-in onPress/focus/tooltip, no Skia needed |
| d3-sankey | 0.12.3 | Sankey diagram layout computation | Industry standard by Mike Bostock, computes node/link positions, tiny bundle |
| @types/d3-sankey | 0.12.5 | TypeScript types for d3-sankey | Type safety for sankey() API |
| expo-linear-gradient | 55.0.9 | Gradient fills for charts | Peer dep of react-native-gifted-charts, Expo-native |

### Already Installed (no action needed)
| Library | Version | Purpose |
|---------|---------|---------|
| react-native-svg | 15.15.3 | SVG rendering for charts and Sankey |
| react-native-reanimated | 4.2.1 | Swipe animations, tooltip transitions |
| react-native-gesture-handler | 2.30.0 | PanGesture for swipe navigation |
| react-native-mmkv | 4.2.0 | Privacy mode persistence |
| lucide-react-native | 0.577.0 | Eye/EyeOff icons for privacy toggle |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-gifted-charts | victory-native v41 | Requires Skia (~3MB native), no web support, peer dep conflicts with Expo 55 |
| react-native-gifted-charts | react-native-chart-kit | Less maintained, fewer touch interaction features, weaker animation |
| react-native-gifted-charts | react-native-echarts | Uses WebView for rendering (performance penalty on mobile), heavier bundle |
| d3-sankey + custom SVG | react-d3-sankey | React web only, not React Native compatible |

**Installation:**
```bash
bun add react-native-gifted-charts expo-linear-gradient d3-sankey
bun add -d @types/d3-sankey
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    reports/
      TimeRangeSelector.tsx      # Pill strip: 1M/3M/6M/1Y/All
      SwipeableChart.tsx          # PanGesture wrapper for month navigation
      SpendingBarChart.tsx        # Horizontal bars (replaces SpendingChart.tsx)
      IncomeExpenseBarChart.tsx   # Grouped vertical bars (replaces IncomeExpenseChart.tsx)
      NetWorthLineChart.tsx       # Area chart with gradient (replaces NetWorthChart.tsx)
      AoMTrendChart.tsx           # Area chart with 30-day reference line
      DoBTrendChart.tsx           # Area chart with saffron accent
      SankeyDiagram.tsx           # Platform-detecting wrapper
      SankeyVertical.tsx          # Top-to-bottom SVG Sankey (mobile)
      SankeyHorizontal.tsx        # Left-to-right SVG Sankey (web)
      ChartTooltip.tsx            # Floating tooltip on chart tap
      PrivacyToggle.tsx           # Eye/EyeOff icon button
      ReportEmptyState.tsx        # Shared empty state component
  hooks/
    use-report-data.ts           # Mock report data hook (monthly aggregation)
app/
  (tabs)/
    reports.tsx                  # Updated: 5 tabs, TimeRangeSelector, SwipeableChart
```

### Pattern 1: Mock Data Hook (Established Pattern)
**What:** Report data hook with mock data fallback
**When to use:** All chart data access
**Example:**
```typescript
// Source: Matches useMetrics() pattern from src/hooks/use-metrics.ts
// and useQuickAdd() Convex-fallback pattern from src/hooks/use-quick-add.ts

export interface MonthlyReportData {
  month: string; // YYYY-MM
  income: number; // paisa
  expense: number; // paisa
  net: number;
  spendingByCategory: Array<{
    categoryId: string;
    name: string;
    color: string;
    total: number;
    percentage: number;
  }>;
  netWorth: number;
  ageOfMoney: number | null;
  daysOfBuffering: number | null;
}

export function useReportData(
  timeRange: TimeRange,
  currentPeriod: string
): { data: MonthlyReportData[]; isLoading: boolean } {
  // Try Convex query first, fallback to mock data
  // Pattern: useQuery(api.reports.monthly, userId ? { userId, range } : "skip")
  // Fallback: MOCK_MONTHLY_DATA constant
}
```

### Pattern 2: d3-sankey Layout Computation
**What:** Pure function computing Sankey node/link positions from transaction data
**When to use:** Sankey diagram rendering
**Example:**
```typescript
// Source: d3-sankey API docs (https://github.com/d3/d3-sankey)
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import type { SankeyGraph, SankeyNode, SankeyLink } from "d3-sankey";

interface CashFlowNode {
  name: string;
  type: "income" | "expense" | "other";
  color: string;
}

interface CashFlowLink {
  source: number;
  target: number;
  value: number;
}

function computeSankeyLayout(
  data: { income: CashFlowNode[]; expenses: CashFlowNode[] },
  width: number,
  height: number,
  isVertical: boolean
): SankeyGraph<CashFlowNode, CashFlowLink> {
  const sankeyGenerator = sankey<CashFlowNode, CashFlowLink>()
    .nodeWidth(isVertical ? 20 : 12)
    .nodePadding(isVertical ? 16 : 8)
    .extent([[0, 0], [width, height]])
    .iterations(6);

  // For vertical layout: swap x/y in extent and transform output
  return sankeyGenerator({
    nodes: [...data.income, ...data.expenses],
    links: buildLinks(data),
  });
}
```

### Pattern 3: SwipeableChart with PanGesture
**What:** Month-to-month swipe navigation wrapper
**When to use:** All chart tabs
**Example:**
```typescript
// Source: react-native-gesture-handler docs + project pattern
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, withTiming, Easing } from "react-native-reanimated";

const SWIPE_THRESHOLD = 50; // px
const VELOCITY_THRESHOLD = 500; // px/s

function SwipeableChart({ children, onNext, onPrev }: SwipeableChartProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -VELOCITY_THRESHOLD) {
        onNext();
      } else if (event.translationX > SWIPE_THRESHOLD || event.velocityX > VELOCITY_THRESHOLD) {
        onPrev();
      }
      translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

### Pattern 4: react-native-gifted-charts Area Chart with Reference Line
**What:** AoM trend chart with 30-day threshold line
**When to use:** Financial Health tab
**Example:**
```typescript
// Source: react-native-gifted-charts LineChart docs
import { LineChart } from "react-native-gifted-charts";

<LineChart
  data={aomDataPoints}
  areaChart
  curved
  isAnimated
  color="#14b8a6"
  thickness={2}
  startFillColor="#0d9488"
  startOpacity={0.3}
  endFillColor="transparent"
  endOpacity={0}
  showReferenceLine1
  referenceLine1Position={30}
  referenceLine1Config={{
    color: "#4e6381",
    dashWidth: 4,
    dashGap: 4,
    labelText: t("reports.thirtyDays"),
    labelTextStyle: { color: "#4e6381", fontSize: 10 },
  }}
  onPress={(item: { value: number }, index: number) => {
    // Show tooltip with AoM value
  }}
/>
```

### Pattern 5: Sankey Vertical SVG Rendering
**What:** Custom SVG rendering from d3-sankey computed positions
**When to use:** Mobile Sankey diagram
**Example:**
```typescript
// Source: d3-sankey output + react-native-svg
import Svg, { Rect, Path, Text as SvgText } from "react-native-svg";

// d3-sankey outputs: node.x0, node.x1, node.y0, node.y1
// For vertical layout, swap x and y coordinates from d3-sankey output

function SankeyVertical({ graph, isPrivacy }: SankeyVerticalProps) {
  return (
    <Svg width={width} height={height}>
      {/* Links: cubic bezier paths */}
      {graph.links.map((link, i) => (
        <Path
          key={i}
          d={generateLinkPath(link)} // cubic bezier from source to target
          fill={getLinkColor(link, 0.2)} // 20% opacity
          stroke={getLinkColor(link, 1.0)} // full opacity border
          strokeWidth={1}
        />
      ))}
      {/* Nodes: rounded rectangles */}
      {graph.nodes.map((node, i) => (
        <Rect
          key={i}
          x={node.x0} y={node.y0}
          width={node.x1 - node.x0}
          height={node.y1 - node.y0}
          rx={4}
          fill={node.color}
        />
      ))}
      {/* Labels */}
      {graph.nodes.map((node, i) => (
        <SvgText key={`label-${i}`} /* positioned next to node */>
          {isPrivacy ? `${node.percentage}%` : formatCurrency(node.value)}
        </SvgText>
      ))}
    </Svg>
  );
}
```

### Anti-Patterns to Avoid
- **Building charts with raw View/Animated.View:** The existing reports do this -- it produces poor touch targets, no accessibility, and no animation. Use a charting library.
- **Using Platform.select for Sankey layout:** Use `usePlatform()` hook for consistency with codebase, not inline Platform.select.
- **Storing privacy mode in Zustand:** MMKV is the correct persistence layer (D-11). Zustand is for in-memory app state, not persisted settings.
- **Dynamic NativeWind class strings in charts:** NativeWind requires static analysis. Chart colors and dynamic styles must use the `style` prop, not computed className strings.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar/Line/Area charts | Custom SVG chart primitives | react-native-gifted-charts | Handles axes, labels, animations, touch, tooltips, accessibility out of the box |
| Sankey node positioning | Custom force-directed layout | d3-sankey | Handles iterative relaxation algorithm, node alignment, link width calculation |
| Gradient fills on charts | Custom LinearGradient components | expo-linear-gradient (via gifted-charts) | Library handles platform differences |
| Month formatting | Custom date parsing | Existing formatMonth pattern (in IncomeExpenseChart.tsx) | Already established, extract to shared utility |
| MMKV persistence | Raw MMKV calls | getSetting/setSetting from storage service | Established pattern, handles web fallback |
| SVG cubic bezier paths | Manual control point math | d3-shape (bundled with d3-sankey) for path generation | Correct Bezier curve computation with proper curvature |

**Key insight:** Charts are deceptively complex -- touch hit testing, axis scaling, label positioning, animation interpolation all have edge cases. Use react-native-gifted-charts for standard charts, only hand-roll the Sankey SVG (which has no off-the-shelf React Native solution).

## Common Pitfalls

### Pitfall 1: victory-native Skia Dependency Trap
**What goes wrong:** Installing victory-native pulls in @shopify/react-native-skia (~3MB), requires native rebuild, and web builds break because Skia uses CanvasKit WASM.
**Why it happens:** victory-native v40+ migrated from react-native-svg to Skia for performance. The peer dependency is mandatory.
**How to avoid:** Use react-native-gifted-charts instead -- SVG-based, works everywhere.
**Warning signs:** `ERESOLVE` errors during install, blank white screen on web, "CanvasKit not loaded" errors.

### Pitfall 2: Sankey Vertical Layout Coordinate Swap
**What goes wrong:** d3-sankey computes left-to-right (horizontal) layouts by default. Simply rotating the SVG container produces wrong text orientation and touch targets.
**Why it happens:** d3-sankey's `extent([[x0,y0],[x1,y1]])` and `nodeWidth` are designed for horizontal flow.
**How to avoid:** For vertical layout, swap width/height in extent, then transform node coordinates: `verticalX = node.y0, verticalY = node.x0` in the rendering layer. Generate vertical bezier paths manually instead of using sankeyLinkHorizontal().
**Warning signs:** Text renders sideways, links curve in wrong direction, touch targets misaligned.

### Pitfall 3: NativeWind Dynamic Class Strings
**What goes wrong:** Chart colors passed as `className={`bg-[${color}]`}` produce no styling because NativeWind's static analysis cannot resolve runtime values.
**Why it happens:** NativeWind uses a Babel/PostCSS pipeline that extracts classes at build time. Dynamic interpolation is invisible to the parser.
**How to avoid:** Use `style={{ backgroundColor: color }}` for all dynamic colors. Only use className for static layout classes.
**Warning signs:** Elements render with default/no background color despite className being set.

### Pitfall 4: GestureHandler and ScrollView Conflict
**What goes wrong:** PanGesture for swipe navigation conflicts with the parent ScrollView's vertical scroll, causing gestures to be swallowed or janky.
**Why it happens:** Both gesture recognizers compete for the same touch events.
**How to avoid:** Configure `activeOffsetX` on the PanGesture to only activate after significant horizontal movement (e.g., `[-15, 15]`), allowing vertical scrolls to pass through. Use `failOffsetY` to reject vertical pans.
**Warning signs:** Vertical scroll doesn't work inside chart area, or horizontal swipe requires multiple attempts.

### Pitfall 5: SVG Text Truncation on Mobile
**What goes wrong:** Sankey node labels overflow their container width, overlapping other nodes or getting clipped.
**Why it happens:** Bengali text is ~1.3x longer than English equivalent. SVG `<Text>` has no built-in truncation.
**How to avoid:** Calculate available label width from node dimensions. Truncate text with ellipsis in JavaScript before passing to `<SvgText>`. Test with both locales.
**Warning signs:** Labels overlap in Bengali locale, text extends outside SVG viewBox.

### Pitfall 6: Mock Data Shape Mismatch
**What goes wrong:** Mock data for reports doesn't match the shape that Convex queries will eventually return, causing runtime errors when backend comes online.
**Why it happens:** Mock data is hand-crafted without referencing the schema.
**How to avoid:** Define TypeScript interfaces first (in use-report-data.ts), then build mock data conforming to those interfaces. Use the same interfaces for future Convex query results.
**Warning signs:** TypeScript any casts proliferate, data transformation functions needed between mock and display.

### Pitfall 7: expo-linear-gradient Not Installed
**What goes wrong:** react-native-gifted-charts renders bars/lines but gradient fills fail silently or crash.
**Why it happens:** expo-linear-gradient is a peer dependency, not auto-installed.
**How to avoid:** Install explicitly: `bun add expo-linear-gradient`. It's the Expo-compatible version of react-native-linear-gradient.
**Warning signs:** Area chart fills render as solid color or transparent, gradient bars show no gradient.

### Pitfall 8: d3-sankey CommonJS Import in Metro
**What goes wrong:** `import { sankey } from "d3-sankey"` throws or returns undefined because d3-sankey ships as ESM but Metro may not resolve it correctly.
**Why it happens:** d3-sankey v0.12 uses mixed module formats.
**How to avoid:** If ESM import fails, use `const { sankey, sankeyLinkHorizontal } = require("d3-sankey")`. Add d3-sankey to `transformIgnorePatterns` exclusion in jest.config.js.
**Warning signs:** "sankey is not a function" at runtime, undefined imports, Jest test failures.

## Code Examples

### react-native-gifted-charts BarChart with Focus and Tooltip

```typescript
// Source: react-native-gifted-charts BarChart docs
// https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/BarChart/BarChartProps.md
import { BarChart } from "react-native-gifted-charts";

const barData = categories.map((cat, index) => ({
  value: cat.total / 100, // paisa to taka
  label: cat.name,
  frontColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  onPress: () => handleCategoryTap(cat),
}));

<BarChart
  data={barData}
  horizontal
  isAnimated
  barWidth={24}
  barBorderRadius={4}
  spacing={8}
  focusBarOnPress
  focusedBarConfig={{ color: undefined, opacity: 1 }}
  // Unfocused bars dim to 40% opacity via focusedBarIndex state
  renderTooltip={(item: { value: number; label: string }) => (
    <ChartTooltip label={item.label} amount={item.value * 100} />
  )}
  yAxisTextStyle={{ color: "#6b83a3", fontSize: 10 }}
  xAxisColor="#1e2a3a"
  yAxisColor="#1e2a3a"
  backgroundColor="transparent"
/>
```

### d3-sankey Vertical Link Path Generation

```typescript
// Source: d3-sankey API + custom vertical path transformation
// d3-sankey computes horizontal links; for vertical, we manually build vertical cubic beziers

function generateVerticalLinkPath(link: SankeyLink<CashFlowNode, CashFlowLink>): string {
  const sourceX = (link.source.x0 + link.source.x1) / 2;
  const sourceY = link.source.y1; // bottom of source node
  const targetX = (link.target.x0 + link.target.x1) / 2;
  const targetY = link.target.y0; // top of target node
  const midY = (sourceY + targetY) / 2;

  // Cubic bezier: straight down from source, curve to target
  return `M ${sourceX} ${sourceY}
          C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
}
```

### Privacy Mode MMKV Persistence

```typescript
// Source: Established storage pattern from src/services/storage/index.ts
import { getSetting, setSetting } from "../services/storage";

const PRIVACY_KEY = "reports_privacy_mode";

function usePrivacyMode(): [boolean, () => void] {
  const [isPrivacy, setIsPrivacy] = useState(() => getSetting(PRIVACY_KEY) === "true");

  const toggle = useCallback(() => {
    const next = !isPrivacy;
    setSetting(PRIVACY_KEY, String(next));
    setIsPrivacy(next);
  }, [isPrivacy]);

  return [isPrivacy, toggle];
}
```

### SwipeableChart with GestureHandler

```typescript
// Source: react-native-gesture-handler Gesture API
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

interface SwipeableChartProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
}

export function SwipeableChart({ children, onNext, onPrev }: SwipeableChartProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15]) // Only activate after 15px horizontal movement
    .failOffsetY([-10, 10])   // Reject vertical pans early
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.3; // Damped follow
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -VELOCITY_THRESHOLD) {
        runOnJS(onNext)();
      } else if (event.translationX > SWIPE_THRESHOLD || event.velocityX > VELOCITY_THRESHOLD) {
        runOnJS(onPrev)();
      }
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| victory-native via react-native-svg | victory-native via @shopify/react-native-skia | v40 (2024) | Breaks web support, adds heavy native dep |
| Custom View-based bar charts | react-native-gifted-charts | Ongoing | Built-in touch, animation, accessibility |
| Manual Sankey layout | d3-sankey | Stable since v0.12 (2020) | Industry-standard algorithm, well-typed |
| react-native-linear-gradient | expo-linear-gradient | Expo SDK 50+ | Native gradient support for Expo managed |

**Deprecated/outdated:**
- **victory-native v37 (legacy tag):** Was SVG-based, now superseded by Skia-based v41. Cannot be used as it's unmaintained.
- **react-native-svg-charts:** Unmaintained since 2022, no longer recommended.
- **react-native-chart-kit:** Minimal updates, limited touch interaction support.

## Open Questions

1. **react-native-gifted-charts animation with Reanimated**
   - What we know: gifted-charts has its own `isAnimated` prop using React Native's Animated API
   - What's unclear: Whether it conflicts with Reanimated-based entrance animations (D-04)
   - Recommendation: Use gifted-charts' built-in `isAnimated` for chart entrance. Use Reanimated only for the SwipeableChart wrapper and tooltip animations. Do not mix animation systems on the same component.

2. **d3-sankey ESM/CJS compatibility with Metro**
   - What we know: d3-sankey v0.12.3 ships as ESM
   - What's unclear: Whether Metro bundler handles the import correctly in all environments
   - Recommendation: Test import during plan execution. If ESM import fails, use require(). Add to jest.config.js transformIgnorePatterns.

3. **react-native-gifted-charts focusBarOnPress dimming behavior**
   - What we know: `focusBarOnPress` highlights the pressed bar
   - What's unclear: Whether non-focused bars auto-dim or if custom opacity logic is needed
   - Recommendation: Test with focusBarOnPress + focusedBarConfig. If auto-dimming isn't available, manage selected index in state and pass per-bar opacity.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | Package installation | Yes | 1.3.9 | -- |
| Node.js | Metro bundler, dev server | Yes | v24.14.1 | -- |
| react-native-svg | Chart rendering, Sankey SVG | Yes (installed) | 15.15.3 | -- |
| react-native-reanimated | Swipe animations | Yes (installed) | 4.2.1 | -- |
| react-native-gesture-handler | PanGesture swipe | Yes (installed) | 2.30.0 | -- |
| react-native-mmkv | Privacy mode persistence | Yes (installed) | 4.2.0 | MemoryStorage fallback on web |
| expo-linear-gradient | Chart gradient fills | No (not installed) | -- | Must install: `bun add expo-linear-gradient` |

**Missing dependencies with no fallback:**
- `expo-linear-gradient` -- required peer dep of react-native-gifted-charts (install during plan execution)

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo 55 |
| Config file | `jest.config.js` |
| Quick run command | `bun run test -- --testPathPattern="reports\|sankey\|report-data" --no-coverage` |
| Full suite command | `bun run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RPRT-01 | SpendingBarChart renders with mock data and responds to onPress | unit | `bun run test -- --testPathPattern="SpendingBarChart" -x` | Wave 0 |
| RPRT-01 | IncomeExpenseBarChart renders grouped bars | unit | `bun run test -- --testPathPattern="IncomeExpenseBarChart" -x` | Wave 0 |
| RPRT-01 | NetWorthLineChart renders area chart | unit | `bun run test -- --testPathPattern="NetWorthLineChart" -x` | Wave 0 |
| RPRT-02 | TimeRangeSelector renders pills and fires onChange | unit | `bun run test -- --testPathPattern="TimeRangeSelector" -x` | Wave 0 |
| RPRT-02 | SwipeableChart calls onNext/onPrev on gesture | unit | `bun run test -- --testPathPattern="SwipeableChart" -x` | Wave 0 |
| RPRT-03 | AoMTrendChart renders with reference line at 30 | unit | `bun run test -- --testPathPattern="AoMTrendChart" -x` | Wave 0 |
| RPRT-04 | SankeyDiagram selects vertical/horizontal by platform | unit | `bun run test -- --testPathPattern="SankeyDiagram" -x` | Wave 0 |
| RPRT-04 | computeSankeyLayout returns valid node/link positions | unit | `bun run test -- --testPathPattern="sankey-layout" -x` | Wave 0 |
| RPRT-05 | SankeyVertical renders top-to-bottom SVG | unit | `bun run test -- --testPathPattern="SankeyVertical" -x` | Wave 0 |
| RPRT-06 | PrivacyToggle persists state to MMKV | unit | `bun run test -- --testPathPattern="PrivacyToggle" -x` | Wave 0 |
| RPRT-06 | Sankey labels switch between amount and percentage | unit | `bun run test -- --testPathPattern="Sankey" -x` | Wave 0 |
| DATA | useReportData returns correctly shaped mock data | unit | `bun run test -- --testPathPattern="use-report-data" -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test -- --testPathPattern="reports\|sankey\|report-data" --no-coverage`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/use-report-data.test.ts` -- covers DATA (mock data shape validation)
- [ ] `src/components/reports/SpendingBarChart.test.tsx` -- covers RPRT-01
- [ ] `src/components/reports/TimeRangeSelector.test.tsx` -- covers RPRT-02
- [ ] `src/components/reports/AoMTrendChart.test.tsx` -- covers RPRT-03
- [ ] `src/components/reports/SankeyDiagram.test.tsx` -- covers RPRT-04, RPRT-05
- [ ] `src/components/reports/PrivacyToggle.test.tsx` -- covers RPRT-06
- [ ] Jest mock for `react-native-gifted-charts` in jest.setup.js -- chart components use native SVG
- [ ] Jest mock for `d3-sankey` in jest.setup.js or inline -- layout computation
- [ ] Add `d3-sankey|react-native-gifted-charts|expo-linear-gradient` to `transformIgnorePatterns` in jest.config.js

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun only -- `bun add`, not npm/yarn
- **Styling:** NativeWind v4 with className -- no dynamic class strings
- **Amounts:** Stored in paisa (integer cents), displayed as BDT via formatCurrency()
- **Convex offline:** All features use mock data at hook level until backend re-enabled
- **Mock data:** Use mock_ prefix IDs, hook-level fallback pattern
- **Shadows:** Use shadow() from @lib/platform, not raw shadow* props
- **No Co-Authored-By:** Git commits must not include Claude attribution line
- **Web layout:** 480px max-width centered (WebContainer in _layout.tsx)
- **i18n:** All user-facing strings through useTranslation() / t() function
- **Path aliases:** Use @components/*, @lib/*, @hooks/*, @stores/* for imports

## Sources

### Primary (HIGH confidence)
- npm registry: victory-native v41.20.2 -- verified peer deps require @shopify/react-native-skia (mandatory)
- npm registry: react-native-gifted-charts v1.4.76 -- verified peer deps (react-native-svg, expo-linear-gradient)
- npm registry: d3-sankey v0.12.3, @types/d3-sankey v0.12.5 -- verified versions
- [Victory Native official docs](https://nearform.com/open-source/victory-native/docs/getting-started/) -- confirmed Skia is required, not optional
- [d3-sankey GitHub](https://github.com/d3/d3-sankey) -- API docs for sankey(), nodeWidth, extent, iterations
- [react-native-gifted-charts GitHub](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) -- feature confirmation
- [react-native-gifted-charts BarChart props](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/BarChart/BarChartProps.md) -- onPress, focusBarOnPress, renderTooltip verified
- [react-native-gifted-charts LineChart props](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/LineChart/LineChartProps.md) -- areaChart, reference lines, gradient fills verified
- Existing codebase: src/hooks/use-metrics.ts, src/hooks/use-quick-add.ts, src/services/mock-data/index.ts -- mock data patterns
- Existing codebase: src/services/budget-engine/index.ts -- calculateAgeOfMoney, calculateDaysOfBuffering functions

### Secondary (MEDIUM confidence)
- [Expo Skia docs](https://docs.expo.dev/versions/latest/sdk/skia/) -- Skia is included in Expo Go, works with managed workflow
- [victory-native-xl Skia v2 issue](https://github.com/FormidableLabs/victory-native-xl/issues/616) -- Skia v1/v2 compatibility resolved
- [react-native-gifted-charts web support](https://www.npmjs.com/package/react-native-gifted-charts) -- web fixes in recent releases

### Tertiary (LOW confidence)
- [React Native Skia web support](https://shopify.github.io/react-native-skia/docs/getting-started/web/) -- CanvasKit WASM loading for web (2.9MB gzipped) -- relevant if victory-native is still chosen despite recommendation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified via npm registry, GitHub docs, and peer dependency analysis
- Architecture: HIGH -- patterns match existing codebase (mock hooks, storage service, platform detection)
- Pitfalls: HIGH -- Skia dependency verified firsthand via npm view, NativeWind limitation documented in CLAUDE.md
- Chart library recommendation: HIGH -- react-native-gifted-charts features verified against all 6 requirements
- d3-sankey: HIGH -- stable API since v0.12, well-documented, tiny dependency tree

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (libraries are stable, 30-day window appropriate)
