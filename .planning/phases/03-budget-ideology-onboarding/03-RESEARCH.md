# Phase 3: Budget Ideology & Onboarding - Research

**Researched:** 2026-03-26
**Domain:** YNAB envelope budgeting ideology, financial health metrics, guided onboarding UX
**Confidence:** HIGH

## Summary

Phase 3 builds the philosophical core of DoinikHishab -- the YNAB envelope budgeting ideology adapted for Bangladesh. This phase has three pillars: (1) sinking fund templates with Bengali cultural defaults and progress visualization, (2) financial health metrics (Ready to Assign hero, Age of Money, Days of Buffering) on dashboard and budget screens, and (3) a guided first-time onboarding flow that teaches YNAB's 4 Rules and walks users through initial setup.

The codebase is well-prepared for this phase. The budget engine (`src/services/budget-engine/index.ts`) already implements `calculateReadyToAssign()`, `calculateAvailable()`, `calculateAgeOfMoney()`, and `calculateTargetProgress()`. The GoalProgress component provides a reusable progress bar pattern. The MMKV storage service supports JSON persistence for onboarding state and tip dismissals. The i18next setup (Phase 1) handles Bengali/English translation with bundled JSON. The app store already has `hasCompletedOnboarding` state and `setOnboardingComplete` action.

**Primary recommendation:** Extend existing budget-engine with `calculateDaysOfBuffering()` and `calculateSinkingFundSuggest()`, build the onboarding as a dedicated route group (`app/onboarding/`) with a gate in the root layout, and add sinking funds as a visually distinct section atop the budget screen grid. No new npm dependencies are needed -- all animation work uses the already-installed Reanimated 4.2.1 and existing ScrollView/FlatList patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Pre-populated sinking fund templates during onboarding with checkboxes -- Eid Fund, School Fees, Wedding Gifts, Medical Reserve, Custom. Bangladeshi defaults pre-selected, user unchecks unwanted ones.
- **D-02:** Horizontal progress bar with percentage + "X of Y" text. Teal fill when on track, saffron when behind schedule. Reuse/extend existing GoalProgress component pattern.
- **D-03:** Monthly auto-suggest: simple (target - accumulated) / months remaining. Displayed as "Suggested: X/month" below the progress bar. Editable by user.
- **D-04:** Sinking funds live in a dedicated section at top of Budget tab, above regular category groups. Visually distinct with a "True Expenses" header.
- **D-05:** Age of Money displayed on dashboard card alongside balance. Shows "Age: X days" with trend arrow (up green = improving, down red = declining). Trend based on 30-day rolling average. Uses existing BalanceCard layout pattern.
- **D-06:** Days of Buffering = total balance / average daily expense over configurable lookback (default 90 days). Displayed as "Buffer: X days" next to Age of Money. Settings gear to change lookback period.
- **D-07:** Ready to Assign as hero banner at top of budget screen -- large teal number when positive, red when over-assigned. "Give every taka a job" subtitle in current language. Tapping navigates to assignment view.
- **D-08:** YNAB rule tips as inline contextual cards below the relevant action -- e.g., Rule 3 tip appears below overspent category row. Dismissible, persisted to MMKV so they don't repeat.
- **D-09:** YNAB 4 Rules education as horizontal carousel with 4 illustrated cards (one per rule). Bengali/English toggle at top. Each card: rule name, one-sentence explanation, culturally relevant example. "Skip" always visible.
- **D-10:** Onboarding progress tracked via horizontal stepper/dots showing 5 steps: Learn Rules -> Add Account -> Choose Categories -> Assign Money -> Enter Transaction. Steps skippable. Progress persisted to MMKV.
- **D-11:** 4 Bangladeshi category template sets: "Student", "Professional", "Freelancer", "Family". Each pre-selects relevant categories from existing mock categories. User picks one, then customizes.
- **D-12:** Onboarding triggers on first app launch (no userId in MMKV). Ends when user completes all 5 steps OR taps "Skip setup". After onboarding, normal dashboard loads. Re-accessible via Settings -> "Redo Setup".

### Claude's Discretion
- Animation details for carousel transitions and progress bars
- FIFO algorithm implementation for Age of Money (budget-engine already has calculateAgeOfMoney)
- Onboarding screen routing approach (modal stack vs. dedicated route group)
- Rule tip content and culturally relevant examples
- Dashboard card layout for metrics (extend BalanceCard or new MetricsCard)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUDG-01 | True Expenses / Sinking Funds with Bengali templates | D-01, D-04: mock-data extension with sinking fund templates, "True Expenses" section in budget screen |
| BUDG-02 | Sinking fund progress bars with monthly auto-suggest | D-02, D-03: GoalProgress extension, calculateSinkingFundSuggest() in budget-engine |
| BUDG-03 | "Give every taka a job" language, Ready to Assign prominence | D-07: Hero banner upgrade to existing budget screen Ready to Assign card |
| BUDG-04 | Age of Money metric with FIFO and trend arrow | D-05: calculateAgeOfMoney() already exists, add trend calculation and MetricsCard |
| BUDG-05 | Days of Buffering with configurable lookback | D-06: new calculateDaysOfBuffering() function, lookback setting in MMKV |
| ONBD-01 | YNAB 4 Rules education carousel | D-09: ScrollView + pagingEnabled carousel, 4 rule cards with illustrations |
| ONBD-02 | Guided first-time flow (account, categories, assign, transaction) | D-10, D-11, D-12: 5-step onboarding route group with stepper dots |
| ONBD-03 | Contextual rule tips at relevant moments | D-08: RuleTip component, MMKV-persisted dismissal state |
| ONBD-04 | Progress indicator showing onboarding completion | D-10: Horizontal stepper dots, MMKV-persisted step progress |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun exclusively (not npm/yarn)
- **Styling:** NativeWind v4 with static class strings only (no dynamic string construction)
- **Amounts:** Stored in paisa (integer), displayed as BDT via formatCurrency()
- **Convex offline:** Backend disabled until next month -- all features must use mock data at hook level
- **Shadows:** Use shadow() from src/lib/platform, not raw shadow props
- **Path aliases:** @components/*, @lib/*, @stores/*, @hooks/* for imports
- **State:** Zustand stores, not Context API
- **Navigation:** Expo Router file-based routing
- **Web container:** 480px max-width centered (app/_layout.tsx WebContainer)
- **No Co-Authored-By:** Do not add Claude attribution to git commits

## Standard Stack

### Core (Already Installed -- No New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | 4.2.1 | Carousel animations, progress bar transitions | Already installed, worklet-based animations |
| react-native-gesture-handler | ^2.30.0 | Swipe gestures for carousel | Already installed |
| @gorhom/bottom-sheet | ^5.2.8 | Assign money modal, lookback period picker | Already installed |
| react-native-mmkv | ^4.2.0 | Onboarding progress, tip dismissals, lookback setting | Already installed, MMKV adapter in storage service |
| i18next / react-i18next | ^25.10.9 / ^16.6.6 | Bengali/English translations for all new strings | Already installed (Phase 1) |
| zustand | ^5.0.11 | App state (onboarding complete flag), UI state | Already installed |
| lucide-react-native | ^0.577.0 | Icons for onboarding steps, rule cards, metrics | Already installed |
| expo-haptics | ~55.0.8 | Haptic feedback on onboarding step completion | Already installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-built ScrollView carousel | react-native-reanimated-carousel (npm) | Third-party dep for simple 4-card carousel is overkill; ScrollView + pagingEnabled sufficient |
| expo-router modal for onboarding | Dedicated route group app/onboarding/ | Modal stack is harder to deep-link; route group gives better URL structure and testability |
| New MetricsCard component | Extending BalanceCard props | BalanceCard has fixed 3-section layout; new MetricsCard is cleaner separation of concerns |

**No new packages needed.** Zero `bun add` commands for this phase.

## Architecture Patterns

### Recommended Project Structure (New/Modified Files)

```
app/
  onboarding/
    _layout.tsx          # Onboarding stack layout with progress stepper
    rules.tsx            # YNAB 4 Rules carousel (Step 1)
    account.tsx          # Add first account (Step 2)
    categories.tsx       # Choose category template (Step 3)
    assign.tsx           # Assign first money (Step 4)
    transaction.tsx      # Enter first transaction (Step 5)
  (tabs)/
    budget.tsx           # MODIFIED: Ready to Assign hero upgrade, sinking funds section
    index.tsx            # MODIFIED: Age of Money + Days of Buffering metrics
    settings.tsx         # MODIFIED: "Redo Setup" row, lookback period setting
  _layout.tsx            # MODIFIED: Onboarding gate check
src/
  components/
    budget/
      SinkingFundSection.tsx    # True Expenses section with progress bars
      SinkingFundRow.tsx        # Individual sinking fund with progress + auto-suggest
      ReadyToAssignHero.tsx     # Hero banner extracted from budget.tsx
      RuleTip.tsx               # Contextual YNAB rule tip card (dismissible)
    dashboard/
      MetricsCard.tsx           # Age of Money + Days of Buffering card
    onboarding/
      RuleCarousel.tsx          # YNAB 4 Rules horizontal carousel
      RuleCard.tsx              # Single rule card (illustration + text)
      StepIndicator.tsx         # Horizontal stepper dots
      CategoryTemplateSelector.tsx  # Template set picker (Student/Professional/etc.)
  services/
    budget-engine/
      index.ts           # MODIFIED: add calculateDaysOfBuffering(), calculateSinkingFundSuggest()
    mock-data/
      index.ts           # MODIFIED: add sinking fund templates, category template sets
    onboarding/
      index.ts           # NEW: onboarding state machine, MMKV persistence, step tracking
  hooks/
    use-onboarding.ts    # NEW: onboarding state hook (current step, completion, skip)
    use-metrics.ts       # NEW: Age of Money + Days of Buffering calculation hook
    use-budget.ts        # MODIFIED: include sinking fund categories in summary
  lib/
    i18n/
      en.json            # MODIFIED: ~80 new translation keys
      bn.json            # MODIFIED: ~80 new Bengali translation keys
```

### Pattern 1: Onboarding Gate in Root Layout

**What:** Root layout checks MMKV for onboarding completion before rendering tabs. If not completed, redirect to onboarding route group.
**When to use:** First-time app launch detection.

```typescript
// app/_layout.tsx -- onboarding gate pattern
import { Redirect } from "expo-router";
import { getJSON } from "../src/services/storage";

export default function RootLayout() {
  // ... existing font loading, convex provider ...

  const onboardingComplete = getJSON<boolean>("onboarding_complete");

  return (
    <ConvexProvider client={convex}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#070b16" }}>
        <WebContainer>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#070b16" } }}>
            {!onboardingComplete && <Stack.Screen name="onboarding" />}
            <Stack.Screen name="(tabs)" />
            {/* ... existing screens ... */}
          </Stack>
        </WebContainer>
      </GestureHandlerRootView>
    </ConvexProvider>
  );
}
```

### Pattern 2: MMKV-Persisted Onboarding State

**What:** Onboarding progress tracked via MMKV JSON, with a Zustand-compatible hook.
**When to use:** Tracking which onboarding steps are complete, persisting across restarts.

```typescript
// src/services/onboarding/index.ts
import { getJSON, setJSON } from "../storage";

export interface OnboardingState {
  currentStep: number; // 0-4
  completedSteps: boolean[]; // [rules, account, categories, assign, transaction]
  isComplete: boolean;
  skipped: boolean;
}

const ONBOARDING_KEY = "onboarding_state";

export function getOnboardingState(): OnboardingState {
  return getJSON<OnboardingState>(ONBOARDING_KEY) ?? {
    currentStep: 0,
    completedSteps: [false, false, false, false, false],
    isComplete: false,
    skipped: false,
  };
}

export function completeStep(step: number): OnboardingState {
  const state = getOnboardingState();
  state.completedSteps[step] = true;
  state.currentStep = Math.min(step + 1, 4);
  setJSON(ONBOARDING_KEY, state);
  return state;
}

export function skipOnboarding(): void {
  setJSON(ONBOARDING_KEY, {
    currentStep: 4,
    completedSteps: [true, true, true, true, true],
    isComplete: true,
    skipped: true,
  });
}

export function completeOnboarding(): void {
  const state = getOnboardingState();
  state.isComplete = true;
  setJSON(ONBOARDING_KEY, state);
}
```

### Pattern 3: ScrollView Carousel with Pagination Dots (No Extra Deps)

**What:** Simple horizontal carousel using ScrollView + pagingEnabled with animated dot indicators via Reanimated.
**When to use:** YNAB 4 Rules education carousel.

```typescript
// src/components/onboarding/RuleCarousel.tsx -- simplified pattern
import { useCallback, useRef } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 448); // respect WebContainer 480px

export function RuleCarousel({ rules }: { rules: RuleData[] }) {
  const scrollRef = useRef<ScrollView>(null);
  const activeIndex = useSharedValue(0);

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    activeIndex.value = Math.round(offsetX / CARD_WIDTH);
  }, []);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
      >
        {rules.map((rule, index) => (
          <RuleCard key={index} rule={rule} width={CARD_WIDTH} />
        ))}
      </ScrollView>
      <PaginationDots count={rules.length} activeIndex={activeIndex} />
    </View>
  );
}
```

### Pattern 4: Contextual Rule Tips with MMKV Persistence

**What:** Inline tip cards that appear at contextually relevant moments and can be dismissed permanently.
**When to use:** YNAB rule education embedded in budget/transaction screens.

```typescript
// src/components/budget/RuleTip.tsx
import { getSetting, setSetting } from "../../services/storage";

interface RuleTipProps {
  ruleId: string; // "rule_1" | "rule_2" | "rule_3" | "rule_4"
  title: string;
  description: string;
}

export function RuleTip({ ruleId, title, description }: RuleTipProps) {
  const dismissKey = `tip_dismissed_${ruleId}`;
  const isDismissed = getSetting(dismissKey) === "true";
  if (isDismissed) return null;

  const handleDismiss = () => {
    setSetting(dismissKey, "true");
    // trigger re-render via local state or parent callback
  };

  return (
    <View className="mx-4 my-2 p-3 bg-primary-50 border border-primary-400/20 rounded-xl">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs font-bold text-primary-700">{title}</Text>
        <Pressable onPress={handleDismiss} hitSlop={8}>
          <Text className="text-2xs text-surface-800">Dismiss</Text>
        </Pressable>
      </View>
      <Text className="text-2xs text-surface-900 leading-4">{description}</Text>
    </View>
  );
}
```

### Pattern 5: Days of Buffering Calculation

**What:** Pure function for computing financial buffer metric.
**When to use:** Dashboard MetricsCard display.

```typescript
// src/services/budget-engine/index.ts -- new export
export function calculateDaysOfBuffering(
  totalBalance: number, // paisa
  outflows: { date: string; amount: number }[],
  lookbackDays: number = 90
): number | null {
  if (totalBalance <= 0 || outflows.length === 0) return null;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const periodOutflows = outflows.filter(
    (o) => o.date >= cutoffStr && o.amount < 0
  );

  if (periodOutflows.length === 0) return null;

  const totalOutflow = periodOutflows.reduce(
    (sum, o) => sum + Math.abs(o.amount), 0
  );
  const avgDailyOutflow = totalOutflow / lookbackDays;

  if (avgDailyOutflow === 0) return null;
  return Math.floor(totalBalance / avgDailyOutflow);
}
```

### Anti-Patterns to Avoid

- **Dynamic NativeWind classes:** Never construct class strings dynamically (`className={`text-${color}`}`). NativeWind requires static analysis. Use ternary with complete static strings instead.
- **Convex queries in onboarding:** Backend is offline. All onboarding data (templates, categories) must come from mock-data or local constants. Do not attempt Convex mutations during onboarding.
- **Blocking onboarding:** Never force all 5 steps. Skip must always be visible and functional. Respect that users want to start using the app immediately (under 3 minutes total).
- **FIFO mutation:** The existing calculateAgeOfMoney() is a pure function. Do not modify it to maintain stateful FIFO queues -- recalculate from transaction history each time.
- **Floating point for money:** All calculations must use integer paisa. The auto-suggest formula `(target - accumulated) / monthsRemaining` must round to integer paisa before display.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Carousel component | Custom gesture handler + pan animations | ScrollView + pagingEnabled + snapToInterval | Built-in RN behavior handles pagination, snap, deceleration correctly |
| Pagination dots | Custom animated View array | Reanimated useAnimatedStyle + interpolate on scrollX | Smooth native-thread animation without custom gesture math |
| FIFO Age of Money | New calculation engine | Existing calculateAgeOfMoney() in budget-engine | Already implements the FIFO algorithm correctly |
| Progress bar | Custom View + width animation | Extend GoalProgress with teal/saffron color props | Component already handles progress display, just needs color variants |
| Local persistence | Custom AsyncStorage wrapper | Existing MMKV storage service (getJSON/setJSON) | Already handles native/web fallback, JSON serialization |
| Translation loading | Custom locale detection | Existing i18next setup (Phase 1) with bundled JSON | Synchronous init, fallback handling, pluralization all done |

**Key insight:** This phase is primarily UI composition and business logic extension, not infrastructure. Every dependency is already installed and every foundational pattern (MMKV, i18n, budget-engine, mock data) is already in place.

## Common Pitfalls

### Pitfall 1: Onboarding Not Re-Entrant
**What goes wrong:** User completes onboarding, then wants to redo it from Settings, but the gate logic permanently blocks the onboarding routes.
**Why it happens:** Checking `onboarding_complete === true` in root layout prevents navigation to onboarding routes.
**How to avoid:** The "Redo Setup" in Settings should set MMKV `onboarding_complete` to false and then navigate to the onboarding route group via `router.replace("/onboarding/rules")`.
**Warning signs:** Settings "Redo Setup" button does nothing or crashes.

### Pitfall 2: Sinking Fund Auto-Suggest Division by Zero
**What goes wrong:** If target date is this month or past, months remaining = 0, division by zero.
**Why it happens:** Simple `(target - accumulated) / monthsRemaining` without guard.
**How to avoid:** Guard: if monthsRemaining <= 0, suggest the full remaining amount. If accumulated >= target, suggest 0.
**Warning signs:** NaN or Infinity displayed in suggested amount.

### Pitfall 3: Age of Money Returns null for New Users
**What goes wrong:** New user has no transactions, calculateAgeOfMoney returns null, dashboard shows "null" or crashes.
**Why it happens:** The function returns null when inflows or outflows are empty.
**How to avoid:** MetricsCard must handle null case gracefully -- show a placeholder like "-- days" with a tooltip explaining "Add transactions to see your Age of Money".
**Warning signs:** "null" text rendered on dashboard, or blank space where metric should be.

### Pitfall 4: MMKV Not Available on Web
**What goes wrong:** Onboarding state not persisted on web platform; user re-sees onboarding on every page reload.
**Why it happens:** MMKV falls back to in-memory MemoryStorage on web, which resets on reload.
**How to avoid:** The existing storage service's MemoryStorage fallback is acceptable for development but should be noted as a known limitation. For web, could enhance MemoryStorage to use localStorage, but this is out of scope for this phase.
**Warning signs:** Web users see onboarding every time they refresh.

### Pitfall 5: Carousel Card Width Mismatch on Web
**What goes wrong:** Carousel cards overflow or misalign because Dimensions.get("window").width returns the full browser width, not the 480px WebContainer.
**Why it happens:** WebContainer constrains layout but not the window dimension measurement.
**How to avoid:** Use onLayout callback or cap CARD_WIDTH at `Math.min(screenWidth - 32, 448)` to stay within the 480px web constraint.
**Warning signs:** Cards extend beyond visible area on web, horizontal scrollbar appears.

### Pitfall 6: Bengali Text Overflows Progress Bar Labels
**What goes wrong:** Bengali translations are ~1.3x longer than English equivalents, causing text truncation or layout overflow.
**Why it happens:** Fixed-width containers sized for English text.
**How to avoid:** Use `numberOfLines={1}` with `ellipsizeMode="tail"` for constrained text, and test with Bengali locale during development. Prefer flex layouts over fixed widths for text containers.
**Warning signs:** Truncated Bengali text in sinking fund names, rule card descriptions cut off.

### Pitfall 7: Onboarding State Conflicts with App Store
**What goes wrong:** App store has `hasCompletedOnboarding: false` but MMKV has `onboarding_complete: true`, or vice versa.
**Why it happens:** Two sources of truth -- Zustand store and MMKV.
**How to avoid:** MMKV is the source of truth for onboarding. The Zustand `hasCompletedOnboarding` should read from MMKV on init and sync when changed. Do not maintain separate state.
**Warning signs:** Onboarding gate inconsistently blocks/allows based on hot reload vs cold start.

## Code Examples

### YNAB 4 Rules Content (Culturally Adapted for Bangladesh)

```typescript
// src/services/onboarding/rules.ts
export interface YnabRule {
  id: number;
  titleKey: string;    // i18n key for rule title
  descKey: string;     // i18n key for rule description
  exampleKey: string;  // i18n key for culturally relevant example
  icon: string;        // lucide icon name
  color: string;       // theme color
}

export const YNAB_RULES: YnabRule[] = [
  {
    id: 1,
    titleKey: "onboarding.rule1.title",       // "Give Every Taka a Job"
    descKey: "onboarding.rule1.description",   // "Assign every taka to a category..."
    exampleKey: "onboarding.rule1.example",    // "Your salary of 30,000 comes in..."
    icon: "briefcase",
    color: "#0d9488", // primary teal
  },
  {
    id: 2,
    titleKey: "onboarding.rule2.title",       // "Embrace True Expenses"
    descKey: "onboarding.rule2.description",   // "Big expenses aren't surprises..."
    exampleKey: "onboarding.rule2.example",    // "Eid is in 4 months. Set aside 2,500/month..."
    icon: "calendar",
    color: "#e6a444", // saffron accent
  },
  {
    id: 3,
    titleKey: "onboarding.rule3.title",       // "Roll with the Punches"
    descKey: "onboarding.rule3.description",   // "Overspent on groceries? Move money..."
    exampleKey: "onboarding.rule3.example",    // "Medical emergency costs 5,000 extra..."
    icon: "refresh-cw",
    color: "#34d399", // success green
  },
  {
    id: 4,
    titleKey: "onboarding.rule4.title",       // "Age Your Money"
    descKey: "onboarding.rule4.description",   // "Spend money earned 30+ days ago..."
    exampleKey: "onboarding.rule4.example",    // "February salary pays March bills..."
    icon: "clock",
    color: "#8b5cf6", // purple
  },
];
```

### Sinking Fund Templates (Mock Data Extension)

```typescript
// src/services/mock-data/sinking-funds.ts
export interface SinkingFundTemplate {
  id: string;
  nameKey: string;       // i18n key
  nameBnKey: string;     // Bengali name key
  icon: string;
  color: string;
  defaultTarget: number; // paisa -- typical target for Bangladesh context
  defaultMonths: number; // months to save
  isDefault: boolean;    // pre-selected in onboarding
}

export const SINKING_FUND_TEMPLATES: SinkingFundTemplate[] = [
  {
    id: "sf_eid",
    nameKey: "sinkingFunds.eid",           // "Eid Fund"
    nameBnKey: "sinkingFunds.eidBn",       // "ঈদ তহবিল"
    icon: "moon",
    color: "#eab308",
    defaultTarget: 1500000, // 15,000 taka
    defaultMonths: 4,
    isDefault: true,
  },
  {
    id: "sf_school",
    nameKey: "sinkingFunds.school",        // "School Fees"
    nameBnKey: "sinkingFunds.schoolBn",    // "স্কুল ফি"
    icon: "graduation-cap",
    color: "#2563eb",
    defaultTarget: 2000000, // 20,000 taka
    defaultMonths: 6,
    isDefault: true,
  },
  {
    id: "sf_wedding",
    nameKey: "sinkingFunds.wedding",       // "Wedding Gifts"
    nameBnKey: "sinkingFunds.weddingBn",   // "বিবাহের উপহার"
    icon: "heart",
    color: "#f43f5e",
    defaultTarget: 1000000, // 10,000 taka
    defaultMonths: 3,
    isDefault: true,
  },
  {
    id: "sf_medical",
    nameKey: "sinkingFunds.medical",       // "Medical Reserve"
    nameBnKey: "sinkingFunds.medicalBn",   // "চিকিৎসা সঞ্চয়"
    icon: "shield-plus",
    color: "#ef4444",
    defaultTarget: 2500000, // 25,000 taka
    defaultMonths: 12,
    isDefault: true,
  },
];
```

### Category Template Sets

```typescript
// src/services/mock-data/category-templates.ts
export interface CategoryTemplateSet {
  id: string;
  nameKey: string;
  nameBnKey: string;
  icon: string;
  description: string;
  categoryIds: string[]; // mock category IDs to pre-select
}

export const CATEGORY_TEMPLATE_SETS: CategoryTemplateSet[] = [
  {
    id: "student",
    nameKey: "templates.student",
    nameBnKey: "templates.studentBn",        // "ছাত্র"
    icon: "graduation-cap",
    description: "For students managing limited budgets",
    categoryIds: [
      "mock_cat_food_groceries", "mock_cat_transport", "mock_cat_rickshaw",
      "mock_cat_mobile_recharge", "mock_cat_education", "mock_cat_eating_out",
    ],
  },
  {
    id: "professional",
    nameKey: "templates.professional",
    nameBnKey: "templates.professionalBn",   // "পেশাদার"
    icon: "briefcase",
    description: "For salaried professionals",
    categoryIds: [
      "mock_cat_food_groceries", "mock_cat_rent", "mock_cat_utilities",
      "mock_cat_transport", "mock_cat_mobile_recharge", "mock_cat_medical",
      "mock_cat_eating_out", "mock_cat_shopping", "mock_cat_entertainment",
    ],
  },
  {
    id: "freelancer",
    nameKey: "templates.freelancer",
    nameBnKey: "templates.freelancerBn",     // "ফ্রিল্যান্সার"
    icon: "laptop",
    description: "For freelancers with variable income",
    categoryIds: [
      "mock_cat_food_groceries", "mock_cat_rent", "mock_cat_utilities",
      "mock_cat_mobile_recharge", "mock_cat_education", "mock_cat_entertainment",
    ],
  },
  {
    id: "family",
    nameKey: "templates.family",
    nameBnKey: "templates.familyBn",         // "পরিবার"
    icon: "users",
    description: "For family budget management",
    categoryIds: [
      "mock_cat_food_groceries", "mock_cat_rent", "mock_cat_utilities",
      "mock_cat_transport", "mock_cat_medical", "mock_cat_education",
      "mock_cat_clothing", "mock_cat_eating_out", "mock_cat_shopping",
    ],
  },
];
```

### MetricsCard for Dashboard (Age of Money + Days of Buffering)

```typescript
// src/components/dashboard/MetricsCard.tsx -- structural pattern
interface MetricsCardProps {
  ageOfMoney: number | null;
  ageOfMoneyTrend: "up" | "down" | "flat";
  daysOfBuffering: number | null;
  lookbackDays: number;
  onSettingsPress?: () => void;
}

export function MetricsCard({
  ageOfMoney,
  ageOfMoneyTrend,
  daysOfBuffering,
  lookbackDays,
  onSettingsPress,
}: MetricsCardProps) {
  const { t } = useTranslation();

  const trendColor = ageOfMoneyTrend === "up" ? "text-success" :
                     ageOfMoneyTrend === "down" ? "text-danger" : "text-surface-800";
  const trendArrow = ageOfMoneyTrend === "up" ? "trending-up" :
                     ageOfMoneyTrend === "down" ? "trending-down" : "minus";

  return (
    <View className="mx-4 mt-4 rounded-2xl p-4 bg-surface-200 border border-primary-400/15"
          style={shadow("#0d9488", 0, 4, 0.08, 16, 4)}>
      <View className="flex-row gap-4">
        {/* Age of Money */}
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("metrics.ageOfMoney")}
          </Text>
          <View className="flex-row items-center mt-1 gap-1.5">
            <Text className="text-lg font-bold text-foreground">
              {ageOfMoney !== null ? `${ageOfMoney}` : "--"}
            </Text>
            <Text className="text-xs text-surface-800">{t("metrics.days")}</Text>
            <LucideIcon name={trendArrow} size={14} className={trendColor} />
          </View>
        </View>

        <View className="w-px bg-border/30" />

        {/* Days of Buffering */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
              {t("metrics.buffer")}
            </Text>
            {onSettingsPress && (
              <Pressable onPress={onSettingsPress} hitSlop={8}>
                <LucideIcon name="settings" size={12} className="text-surface-700" />
              </Pressable>
            )}
          </View>
          <View className="flex-row items-center mt-1 gap-1.5">
            <Text className="text-lg font-bold text-foreground">
              {daysOfBuffering !== null ? `${daysOfBuffering}` : "--"}
            </Text>
            <Text className="text-xs text-surface-800">{t("metrics.days")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
```

### Sinking Fund Auto-Suggest Calculation

```typescript
// src/services/budget-engine/index.ts -- new export
export function calculateSinkingFundSuggest(
  targetAmount: number,    // paisa
  accumulated: number,     // paisa -- current available balance
  monthsRemaining: number  // integer, months until target date
): number {
  if (accumulated >= targetAmount) return 0;
  if (monthsRemaining <= 0) return targetAmount - accumulated;

  const remaining = targetAmount - accumulated;
  return Math.ceil(remaining / monthsRemaining); // round up to integer paisa
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-native-snap-carousel | ScrollView + pagingEnabled or reanimated-carousel | 2023+ (snap-carousel deprecated) | Do not install snap-carousel; use native ScrollView |
| AsyncStorage for persistence | MMKV | 2022+ | Already using MMKV; 100x faster reads |
| Custom onboarding libraries (react-native-app-intro) | File-based routes with Expo Router | 2024+ | Build onboarding as routes, not a third-party widget |
| Context API for state | Zustand stores | 2023+ | Already using Zustand; continue pattern |

**Deprecated/outdated:**
- `react-native-snap-carousel`: Unmaintained since 2022, does not support Reanimated 3+. Do not use.
- `react-native-app-intro-slider`: Last updated 2021, incompatible with Expo SDK 55.
- `@react-native-async-storage/async-storage`: Functional but ~100x slower than MMKV for JSON reads.

## Open Questions

1. **Sinking fund storage when Convex comes back online**
   - What we know: Currently all sinking fund data will be mock data. The Convex schema has `targets` and `budgets` tables that can represent sinking funds as `spending_by_date` targets.
   - What's unclear: Whether sinking fund templates should pre-create mock target records or just pre-configure categories.
   - Recommendation: Store selected sinking funds as mock targets in the budget-engine. When Convex reconnects, migrate mock data to real targets.

2. **Age of Money trend calculation period**
   - What we know: D-05 specifies "30-day rolling average" for trend.
   - What's unclear: Whether trend compares current AoM to 30-day-ago AoM, or uses a rolling average of the AoM value.
   - Recommendation: Compare current AoM to the AoM calculated 30 days ago. If current > past, trend is "up" (improving). Simple and meaningful.

3. **Mock transaction data for metrics**
   - What we know: Age of Money and Days of Buffering need transaction history. Convex is offline.
   - What's unclear: Whether we need mock transaction history for these calculations.
   - Recommendation: Generate mock transaction history in use-metrics.ts (similar to how use-transactions.ts falls back to mock data), with realistic dates spanning 90+ days to demonstrate both metrics.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo 55 |
| Config file | `jest.config.js` |
| Quick run command | `bun run test -- --testPathPattern=<pattern> --passWithNoTests` |
| Full suite command | `bun run test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUDG-01 | Sinking fund templates contain Bengali names and correct defaults | unit | `bun run test -- --testPathPattern=sinking-fund --passWithNoTests` | Wave 0 |
| BUDG-02 | calculateSinkingFundSuggest returns correct monthly amount | unit | `bun run test -- --testPathPattern=budget-engine --passWithNoTests` | Wave 0 |
| BUDG-02 | GoalProgress renders teal for on_track, saffron for behind | component | `bun run test -- --testPathPattern=GoalProgress --passWithNoTests` | Wave 0 |
| BUDG-03 | ReadyToAssignHero shows teal positive, red negative, subtitle text | component | `bun run test -- --testPathPattern=ReadyToAssign --passWithNoTests` | Wave 0 |
| BUDG-04 | calculateAgeOfMoney returns correct days for sample data | unit | `bun run test -- --testPathPattern=budget-engine --passWithNoTests` | Exists (extend) |
| BUDG-05 | calculateDaysOfBuffering returns correct buffer days | unit | `bun run test -- --testPathPattern=budget-engine --passWithNoTests` | Wave 0 |
| BUDG-05 | calculateDaysOfBuffering with zero outflows returns null | unit | `bun run test -- --testPathPattern=budget-engine --passWithNoTests` | Wave 0 |
| ONBD-01 | YNAB_RULES array has 4 entries with valid i18n keys | unit | `bun run test -- --testPathPattern=onboarding --passWithNoTests` | Wave 0 |
| ONBD-02 | Onboarding state machine tracks 5 steps, persists to MMKV | unit | `bun run test -- --testPathPattern=onboarding --passWithNoTests` | Wave 0 |
| ONBD-03 | RuleTip renders when not dismissed, hides after dismiss | component | `bun run test -- --testPathPattern=RuleTip --passWithNoTests` | Wave 0 |
| ONBD-04 | StepIndicator renders correct active/inactive dots | component | `bun run test -- --testPathPattern=StepIndicator --passWithNoTests` | Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test -- --testPathPattern=<changed-module> --passWithNoTests`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/budget-engine/index.test.ts` -- extend existing tests for calculateDaysOfBuffering, calculateSinkingFundSuggest
- [ ] `src/services/onboarding/index.test.ts` -- onboarding state machine tests
- [ ] `src/components/budget/RuleTip.test.tsx` -- dismissal persistence tests
- [ ] `src/components/onboarding/StepIndicator.test.tsx` -- dot rendering tests

*(Existing test infrastructure from Phase 1 covers Jest config, MMKV mocks, Convex mocks, and i18n mocks.)*

## MMKV Key Registry

New MMKV keys introduced in this phase (namespace isolated by prefix):

| Key | Type | Purpose |
|-----|------|---------|
| `onboarding_state` | JSON (OnboardingState) | Tracks 5-step onboarding progress |
| `onboarding_complete` | boolean (as string) | Gate check in root layout |
| `tip_dismissed_rule_1` | "true" | Rule 1 contextual tip dismissed |
| `tip_dismissed_rule_2` | "true" | Rule 2 contextual tip dismissed |
| `tip_dismissed_rule_3` | "true" | Rule 3 contextual tip dismissed |
| `tip_dismissed_rule_4` | "true" | Rule 4 contextual tip dismissed |
| `metrics_lookback_days` | string (number) | Days of Buffering lookback period (default "90") |
| `selected_sinking_funds` | JSON (string[]) | IDs of sinking funds user selected in onboarding |
| `selected_category_template` | string | Template set ID chosen during onboarding |

## Translation Key Structure

New i18n keys organized by namespace:

```
onboarding.
  welcome          - "Welcome to DoinikHishab"
  skip             - "Skip Setup"
  letsGo           - "Let's Go"
  step1            - "Learn the Rules"
  step2            - "Add Account"
  step3            - "Choose Categories"
  step4            - "Assign Money"
  step5            - "Enter Transaction"
  rule1.title      - "Give Every Taka a Job"
  rule1.description - "When money comes in, assign every taka..."
  rule1.example    - "Your salary of 30,000 comes in..."
  rule2.title      - "Embrace True Expenses"
  rule2.description - "Big, predictable expenses aren't surprises..."
  rule2.example    - "Eid is in 4 months..."
  rule3.title      - "Roll with the Punches"
  rule3.description - "When you overspend, move money from..."
  rule3.example    - "Medical emergency costs 5,000 extra..."
  rule4.title      - "Age Your Money"
  rule4.description - "Spend money that's at least 30 days old..."
  rule4.example    - "February salary pays March bills..."

sinkingFunds.
  title            - "True Expenses"
  eid              - "Eid Fund"
  school           - "School Fees"
  wedding          - "Wedding Gifts"
  medical          - "Medical Reserve"
  custom           - "Custom Fund"
  suggested        - "Suggested: {{amount}}/month"
  ofTarget         - "{{current}} of {{target}}"
  onTrack          - "On Track"
  behind           - "Behind"
  funded           - "Funded"

metrics.
  ageOfMoney       - "Age of Money"
  buffer           - "Buffer"
  days             - "days"
  trend            - "30d trend"
  noData           - "Add transactions to see metrics"

budget.
  giveEveryTakaAJob - "Give every taka a job"
  overAssigned     - "You've assigned more than you have!"
  distributeBelow  - "Distribute to categories below"

templates.
  chooseTemplate   - "Choose a starting template"
  student          - "Student"
  professional     - "Professional"
  freelancer       - "Freelancer"
  family           - "Family"
  customize        - "Customize categories"

settings.
  redoSetup        - "Redo Setup"
  lookbackPeriod   - "Buffer Lookback"
  lookbackDays     - "{{count}} days"

tips.
  rule1Context     - "Remember: give every taka a job..."
  rule2Context     - "This is a True Expense..."
  rule3Context     - "Overspent? Move money from another category..."
  rule4Context     - "Your money is getting older..."
  dismiss          - "Got it"
```

Estimated total new keys: ~60 English + ~60 Bengali = ~120 translation strings.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/services/budget-engine/index.ts`, `src/services/storage/index.ts`, `src/components/budget/GoalProgress.tsx`, `src/components/dashboard/BalanceCard.tsx`, `src/stores/app-store.ts`
- Convex schema: `convex/schema.ts` -- targets table supports `spending_by_date` type for sinking funds
- i18n setup: `src/lib/i18n/index.ts` with `en.json` / `bn.json` bundled translations
- [YNAB Official -- The Four Rules](https://www.ynab.com/the-four-rules)
- [Expo Router -- Stack Navigation](https://docs.expo.dev/router/advanced/stack/)
- [Expo Router -- Modals](https://docs.expo.dev/router/advanced/modals/)

### Secondary (MEDIUM confidence)
- [React Native ScrollView docs](https://reactnative.dev/docs/scrollview) -- pagingEnabled, snapToInterval behavior
- [YNAB Toolkit -- Days of Buffering Metric](https://www.eshmoneycoach.com/ynab-toolkit/days-of-buffering-metric/) -- DoB calculation: total balance / average daily outflow
- [Expo Router 2026 Navigation Guide](https://www.codesofphoenix.com/articles/expo/expo-router-nav) -- route group patterns

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all libraries already in package.json and verified
- Architecture: HIGH -- patterns extend existing code (budget-engine, GoalProgress, MMKV storage)
- Pitfalls: HIGH -- identified from direct code analysis (null handling, division by zero, web MMKV fallback)
- Onboarding routing: MEDIUM -- Expo Router route groups are well-documented but onboarding gate pattern needs careful implementation
- Bengali translations: MEDIUM -- translation keys defined but actual Bengali text needs native speaker review

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days -- stable ecosystem, no version changes expected)
