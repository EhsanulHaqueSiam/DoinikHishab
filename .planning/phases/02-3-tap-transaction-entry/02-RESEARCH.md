# Phase 2: 3-Tap Transaction Entry - Research

**Researched:** 2026-03-26
**Domain:** React Native transaction entry UX (bottom sheet flow, custom keypad, category grid, haptic feedback, local storage)
**Confidence:** HIGH

## Summary

Phase 2 rebuilds the existing QuickAdd bottom sheet from a 3-step flow (amount, category, confirm) into a true 2-step auto-save flow (amount, category tap = saved). The codebase already has all core components: `AmountPad.tsx` (custom keypad with BDT formatting), `CategoryGrid.tsx` (grouped category display), `QuickAdd.tsx` (bottom sheet orchestrator), and `FAB.tsx` (entry point). The primary work is refactoring QuickAdd to remove the confirm step, adding a frequency-sorted category strip, implementing a success flash animation via Reanimated, adding an expandable optional fields section, and building a complete mock data layer since Convex is offline.

No new heavy dependencies are required. The project already has `react-native-reanimated` (4.2.1), `@gorhom/bottom-sheet` (5.2.8), `expo-haptics`, `react-native-mmkv` (4.2.0), and `zustand` (5.0.11). The only potential new dependency is `@react-native-community/datetimepicker` for the date picker in optional fields, but a simple text-based date input is sufficient for the MVP since the date picker is in an "optional" expansion area that most users will never open.

**Primary recommendation:** Refactor existing components in-place. The code delta is moderate (QuickAdd.tsx heavy refactor, CategoryGrid.tsx extension, AmountPad.tsx minor extension, new hook for frequency tracking, new mock data module). Do not rewrite from scratch -- extend what exists.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Auto-save on category tap -- tapping a category immediately saves the transaction with haptic feedback + category tile flash (300ms green). No confirm step. True 3-tap: amount entry, Next, category tap = done.
- **D-02:** Bottom sheet remains the entry surface -- keep @gorhom/bottom-sheet. No full-screen modal or inline dashboard entry.
- **D-03:** After save, sheet resets to amount step for rapid entry (batch mode). User swipes down to close when done. Brief success flash animation before reset.
- **D-04:** Next button disabled when amount is 0 -- prevents accidental zero transactions. Current AmountPad behavior preserved.
- **D-05:** Haptic pulse + category tile green flash (300ms) as success feedback. No full-screen overlay, no toast. Subtle but unmistakable.
- **D-06:** Type toggle (expense/income/transfer) stays at top of sheet -- current design preserved. Expense is default but user can switch with one tap.
- **D-07:** Keep existing decimal point behavior in AmountPad -- dot key, max 2 decimal places, paisa conversion via Math.round(num * 100).
- **D-08:** Keep both flows -- QuickAdd (3-tap bottom sheet) for fast entry, full editor (app/transaction/add.tsx) for complex transactions. Quick add is the default entry point.
- **D-09:** Frequency section at top + grouped section below. Top strip shows dynamically-sized "Frequent" categories (2 rows, count based on screen width). Below: full grid grouped by category groups (current CategoryGrid layout).
- **D-10:** Frequency calculated with hybrid approach -- hardcoded Bangladesh-relevant defaults (Food, Transport, Utilities first), then overridden by local MMKV tap counts as user enters transactions. When Convex re-enables, sync with server-side transaction history.
- **D-11:** Frequent strip size is dynamic based on device width -- calculate how many category tiles fit in 2 rows at ~80dp per tile. More on tablets, fewer on small phones.
- **D-12:** "+ Details" expandable row on the amount step, below the keypad and above the Next button. Tapping reveals inline fields. Does not break 3-tap flow when ignored.
- **D-13:** Four optional fields in expansion: payee/merchant name (text input), memo/note (text input), flag/star (boolean toggle), account override (dropdown of user's accounts).
- **D-14:** Date picker included in optional fields expansion -- allows backdating transactions without leaving the quick flow. Default is today.
- **D-15:** FAB (floating action button) on dashboard as entry point. Existing FAB.tsx component. Tapping opens the quick add bottom sheet.
- **D-16:** Smart defaults: last-used account (fallback to isDefault, then first account), today's date, expense type. All pre-filled, no user action needed for defaults.
- **D-17:** Full mock data flow when Convex is offline -- hardcoded mock categories and accounts at hook level. Quick add works end-to-end with mock data, transactions save locally via MMKV. Matches project constraint.
- **D-18:** Keypad always shows Arabic numerals (0-9) regardless of language setting. BDT amount display uses Bengali numerals (toBengaliNumerals) when app is in Bengali mode. Consistent with Bangladesh banking apps.

### Claude's Discretion
- Animation implementation details (Reanimated vs CSS transitions for success flash)
- MMKV storage schema for frequency counters and offline transactions
- Mock data structure for categories and accounts (shape, count, names)
- CategoryGrid refactoring approach (extend existing or rewrite)
- Test strategy for the new components

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRAN-01 | User can enter a transaction in 3 taps: amount via custom keypad, category from recent/frequent grid, auto-save | Existing QuickAdd.tsx has 3-step flow; refactor to remove confirm step, add auto-save on category tap (D-01). AmountPad and CategoryGrid already exist. |
| TRAN-02 | Custom numeric keypad displays BDT formatting live (paisa to taka conversion) without system keyboard | AmountPad.tsx already implements this completely (KEYS array, decimal handling, formatCurrency display). Only addition: Bengali numeral display when locale is "bn" (D-18). |
| TRAN-03 | Category grid shows recent/frequent categories first, sorted by usage frequency | New frequency tracking service using MMKV storage with hardcoded BD defaults as initial values (D-09, D-10, D-11). CategoryGrid extended with "Frequent" strip. |
| TRAN-04 | Smart defaults auto-select last-used account, today's date, and expense type | QuickAdd already defaults to expense type and today's date. Need: MMKV-persisted last-used account ID (D-16) with fallback chain. |
| TRAN-05 | Optional fields (payee, memo, flag) are collapsed by default, expandable inline | New expandable section on amount step (D-12, D-13, D-14). Uses BottomSheetTextInput for keyboard handling within bottom sheet. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun only (not npm/yarn). Use `bun add`, `bun install`.
- **Styling:** NativeWind v4 with `className` props. No dynamic class strings.
- **Amounts:** Stored in paisa (integer cents). Display as BDT via `formatCurrency()`.
- **Shadows:** Use `shadow()` from `@lib/platform`, not raw shadow props.
- **State:** Zustand stores, not Context API.
- **Convex offline:** Backend disabled. Must use mock data at hook level.
- **Path aliases:** `@components/*`, `@lib/*`, `@stores/*`, `@hooks/*`, `@src/*`.
- **Naming:** PascalCase components, camelCase hooks/utils, `handle` prefix for handlers.
- **No linter/formatter bypasses:** Biome is configured (Phase 1 completed).
- **Tests:** Jest + jest-expo with co-located `*.test.ts` files.

## Standard Stack

### Core (Already Installed -- No New Packages Required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@gorhom/bottom-sheet` | ^5.2.8 | Bottom sheet container for QuickAdd | Already in use. v5 with Reanimated 3 + Gesture Handler 2 support. |
| `react-native-reanimated` | 4.2.1 | Success flash animation (interpolateColor + withTiming) | Already installed. Provides worklet-based animations for the 300ms category flash. |
| `react-native-mmkv` | ^4.2.0 | Frequency counters, last-used account, offline transaction storage | Already installed. MMKV adapter in `src/services/storage/index.ts`. |
| `expo-haptics` | ~55.0.8 | Haptic feedback on save | Already installed. Pattern established in QuickAdd and add.tsx. |
| `zustand` | ^5.0.11 | UI state (isQuickAddOpen, quickAddType) | Already in use for UIStore and AppStore. |
| `react-native-gesture-handler` | ^2.30.0 | Gesture detection for bottom sheet drag | Already installed, used by bottom-sheet. |
| `lucide-react-native` | ^0.577.0 | Icons for optional field UI (ChevronDown, Calendar, Flag) | Already installed. |

### Date Picker (Claude's Discretion Decision)

| Library | Version | Purpose | Decision |
|---------|---------|---------|----------|
| None (text input) | N/A | Date backdating in optional fields | Use a simple text-based date display (showing today()) that opens a basic date selector. Since date is deeply optional (hidden in expansion, defaults to today), avoid adding a native date picker dependency for now. Use a simple Pressable with formatted date and a custom minimal date selector or just a TextInput with YYYY-MM-DD format. |

**Rationale:** The date field is inside an optional expansion that most users never open, and when they do, they usually just want "yesterday." Adding `@react-native-community/datetimepicker` (requires native module rebuild) for a deeply optional field is overkill at this stage. A "Today / Yesterday / Pick date" chip set is faster UX anyway. If full date picker is needed later, add it in a future phase.

### Supporting (No Changes)

All supporting libraries (`i18next`, `react-i18next`, `expo-router`, NativeWind, etc.) are already installed and configured. No additions needed.

## Architecture Patterns

### Component Structure After Refactoring

```
src/components/transaction/
  QuickAdd.tsx           # Refactored: 2-step flow (amount -> category auto-save), batch mode
  AmountPad.tsx          # Extended: + Details expandable section, Bengali numeral display
  CategoryGrid.tsx       # Extended: Frequent strip at top + existing grouped grid
  ExpandableDetails.tsx  # NEW: Optional fields (payee, memo, flag, account, date)
  CategoryFrequent.tsx   # NEW: Top 2-row frequency-sorted category strip (extracted component)
  SuccessFlash.tsx       # NEW: Reanimated animated overlay for category tile flash

src/services/
  frequency/             # NEW: Frequency tracking service
    index.ts             # MMKV-backed category usage counter
  mock-data/             # NEW: Mock data for offline development
    index.ts             # Mock categories, groups, accounts

src/hooks/
  use-quick-add.ts       # NEW: Hook encapsulating quick add logic (mock data, frequency, save)
  use-category-frequency.ts  # NEW: Hook for reading/writing frequency data
```

### Pattern 1: Auto-Save on Category Tap (TRAN-01)

**What:** Tapping a category in the grid immediately saves the transaction and resets for next entry.
**When to use:** QuickAdd flow only (not full editor).
**Implementation:**

```typescript
// In refactored QuickAdd.tsx
const handleCategorySelect = useCallback(async (categoryId: Id<"categories">) => {
  // 1. Trigger haptic feedback
  triggerHaptic();

  // 2. Trigger success flash animation on the tile (300ms)
  flashSharedValue.value = withSequence(
    withTiming(1, { duration: 150 }),
    withTiming(0, { duration: 150 })
  );

  // 3. Increment frequency counter in MMKV
  incrementCategoryFrequency(categoryId);

  // 4. Save transaction (mock or Convex)
  await saveTransaction({
    amount,
    categoryId,
    accountId: selectedAccountId,
    type: quickAddType,
    date: selectedDate,
    description: payee,
    memo,
    flag: selectedFlag,
  });

  // 5. After flash completes (~300ms), reset for next entry
  setTimeout(() => {
    resetForm();  // Resets amount, clears optional fields, keeps type
  }, 350);
}, [amount, quickAddType, selectedAccountId, ...]);
```

### Pattern 2: Frequency Tracking with MMKV (TRAN-03)

**What:** Track category usage counts locally, with Bangladesh-relevant defaults for new users.
**Storage schema:**

```typescript
// MMKV keys for frequency service
// Key: "freq:{categoryId}" -> Value: JSON string of { count: number, lastUsed: string }
// Key: "freq:defaults_initialized" -> "true" once defaults are set
// Key: "last_account_id" -> last used account ID string
// Key: "offline_txns" -> JSON array of pending transactions

interface FrequencyEntry {
  count: number;
  lastUsed: string; // ISO date
}

// Default frequencies for Bangladesh market (new users)
const BD_DEFAULT_FREQUENCIES: Record<string, number> = {
  "Food & Groceries": 30,  // Most frequent
  "Transport": 25,
  "Rickshaw": 20,
  "Mobile Recharge": 15,
  "Eating Out": 12,
  "Utilities": 10,
  // ... other defaults at lower counts
};
```

### Pattern 3: Mock Data Layer (D-17, Convex Offline)

**What:** Since Convex is offline, all data operations go through a mock layer.
**Key design:**

```typescript
// src/services/mock-data/index.ts
// Provides the same shape as Convex queries return

export const MOCK_CATEGORIES: MockCategory[] = [
  // Uses DEFAULT_CATEGORY_GROUPS from src/lib/constants.ts as source
  // Each has a stable fake _id (e.g., "cat_food_groceries") for MMKV keying
];

export const MOCK_GROUPS: MockCategoryGroup[] = [
  // Mirrors convex categoryGroups shape
];

export const MOCK_ACCOUNTS: MockAccount[] = [
  { _id: "acct_cash", name: "Cash", type: "cash", balance: 500000, isDefault: true, ... },
  { _id: "acct_bkash", name: "bKash", type: "checking", balance: 200000, isDefault: false, ... },
];
```

```typescript
// src/hooks/use-quick-add.ts
// Central hook for QuickAdd component
export function useQuickAdd() {
  const { userId } = useAppStore();

  // Try Convex first, fall back to mock data
  const convexCategories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");
  const categories = convexCategories ?? MOCK_CATEGORIES;

  // ... similar pattern for groups, accounts

  // Save: try Convex mutation, fall back to MMKV storage
  const saveTransaction = useCallback(async (data: TransactionInput) => {
    try {
      if (userId) {
        await createTransaction({ userId, ...data });
      } else {
        saveOfflineTransaction(data); // MMKV
      }
    } catch {
      saveOfflineTransaction(data); // Fallback on network error
    }
  }, [userId, createTransaction]);

  return { categories, groups, accounts, saveTransaction, ... };
}
```

### Pattern 4: Success Flash Animation (D-05)

**What:** Green flash on the selected category tile lasting 300ms.
**Recommendation:** Use Reanimated (already installed, project has the babel plugin configured).

```typescript
// Reanimated pattern for category tile flash
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

function AnimatedCategoryTile({ onSelect, ...props }) {
  const flash = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      ["transparent", "rgba(52, 211, 153, 0.4)"]  // success green glow
    ),
  }));

  const handlePress = () => {
    flash.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 150 })
    );
    onSelect(props.categoryId);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress}>
        {/* tile content */}
      </Pressable>
    </Animated.View>
  );
}
```

### Pattern 5: Expandable Details Section (TRAN-05, D-12)

**What:** "+ Details" row below keypad, expanding to show optional fields inline.
**Key consideration:** Must use `BottomSheetTextInput` (from `@gorhom/bottom-sheet`) instead of regular `TextInput` for keyboard handling inside the bottom sheet.

```typescript
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

function ExpandableDetails({ isExpanded, onToggle, values, onChange }) {
  return (
    <View>
      <Pressable onPress={onToggle} className="flex-row items-center justify-center py-3">
        <Text className="text-xs text-surface-800 font-medium">
          {isExpanded ? "- Hide Details" : "+ Details"}
        </Text>
      </Pressable>

      {isExpanded && (
        <View className="gap-3 px-4">
          <BottomSheetTextInput
            placeholder="Payee / Merchant"
            value={values.payee}
            onChangeText={(text) => onChange("payee", text)}
            // ... NativeWind styling
          />
          <BottomSheetTextInput
            placeholder="Note / Memo"
            value={values.memo}
            onChangeText={(text) => onChange("memo", text)}
          />
          {/* Flag toggle, Account picker, Date selector */}
        </View>
      )}
    </View>
  );
}
```

### Pattern 6: Dynamic Frequent Strip Sizing (D-11)

**What:** Calculate tile count based on screen width.

```typescript
import { Dimensions } from "react-native";

const TILE_WIDTH = 80; // dp per tile
const TILE_GAP = 8;
const PADDING = 16; // horizontal padding

function getFrequentTileCount(): number {
  const screenWidth = Dimensions.get("window").width;
  const usableWidth = screenWidth - (PADDING * 2);
  const tilesPerRow = Math.floor((usableWidth + TILE_GAP) / (TILE_WIDTH + TILE_GAP));
  return tilesPerRow * 2; // 2 rows
}
```

### Anti-Patterns to Avoid

- **Do NOT use `useState` for the flash animation:** SharedValues live on the UI thread. Using React state for a 300ms animation causes unnecessary re-renders and visible jank.
- **Do NOT call `closeQuickAdd()` after save in batch mode:** The sheet stays open for rapid entry (D-03). Only `resetForm()` is called.
- **Do NOT use dynamic NativeWind class strings:** `className={\`bg-${color}\`}` will not work. Use `style` prop for dynamic colors (e.g., the flash animation uses Reanimated `useAnimatedStyle`).
- **Do NOT persist frequency data in Zustand:** Frequency counters are persisted in MMKV, not in-memory Zustand stores. MMKV survives app restarts; Zustand does not.
- **Do NOT use regular `TextInput` inside the bottom sheet:** Always use `BottomSheetTextInput` from `@gorhom/bottom-sheet` to avoid keyboard handling issues (double-avoiding on Android, keyboard not pushing sheet on iOS).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet behavior | Custom modal with PanResponder | @gorhom/bottom-sheet (already used) | Pan-to-dismiss, snap points, keyboard avoidance, gesture interop with ScrollView -- all solved |
| Haptic feedback | Custom vibration pattern | expo-haptics (already used) | Platform differences between iOS Taptic and Android vibration are handled |
| Key-value local storage | AsyncStorage or custom file system | react-native-mmkv (already used) | 30x faster than AsyncStorage, synchronous reads, survives restarts |
| Color interpolation animation | setTimeout + state toggle | Reanimated interpolateColor + withTiming | Runs on UI thread, no bridge crossing, smooth 60fps |
| Currency formatting | Manual string manipulation | formatCurrency() from @lib/currency (already exists) | Handles paisa conversion, BDT symbol, Bengali numerals, negative amounts |
| Bengali numeral conversion | regex replacement | toBengaliNumerals() from @lib/currency (already exists) | Already tested and handles all digit positions |

## Common Pitfalls

### Pitfall 1: Bottom Sheet Keyboard Issues on Android
**What goes wrong:** TextInput inside @gorhom/bottom-sheet causes keyboard to "double-avoid" on Android, pushing content way too high or closing the sheet entirely.
**Why it happens:** Android's `windowSoftInputMode` interacts with the bottom sheet's own keyboard avoidance.
**How to avoid:** Use `BottomSheetTextInput` (not regular TextInput). Set `android_keyboardInputMode="adjustResize"` on the BottomSheet. Set `keyboardBehavior="interactive"` or `"extend"` prop.
**Warning signs:** Content jumps when tapping a text field; sheet closes on keyboard open.

### Pitfall 2: Flash Animation Invisible Due to z-index
**What goes wrong:** The Reanimated animated background color change is invisible because the Pressable or parent View overlays it.
**Why it happens:** NativeWind `bg-surface-*` classes set a background color that overrides the animated style.
**How to avoid:** Apply `useAnimatedStyle` to the outermost `Animated.View` wrapper, and ensure child Views use `bg-transparent` or no background class. Alternatively, use an absolute-positioned overlay Animated.View.
**Warning signs:** Console shows shared value changing but no visual feedback.

### Pitfall 3: MMKV Frequency Counters Not Available on Web
**What goes wrong:** MMKV is native-only. On web, the MemoryStorage fallback loses frequency data on refresh.
**Why it happens:** The storage adapter falls back to MemoryStorage on web (see `src/services/storage/index.ts`).
**How to avoid:** Accept this limitation for web (secondary platform per CLAUDE.md). For web persistence, could extend MemoryStorage to use localStorage, but this is not a priority.
**Warning signs:** Frequency counts reset on web page reload.

### Pitfall 4: Mock Category IDs Don't Match Convex ID Format
**What goes wrong:** Mock IDs like `"cat_food"` crash when passed to Convex mutations expecting `Id<"categories">`.
**Why it happens:** Convex IDs have a specific internal format; string literals fail type checking.
**How to avoid:** When Convex is offline and no userId exists, skip the Convex mutation entirely and save to MMKV. The mock data hook layer handles the routing. Never pass mock IDs to Convex APIs.
**Warning signs:** Type errors at compile time (good -- catch them early) or runtime errors on mutation calls.

### Pitfall 5: AmountPad Display State Desync After Reset
**What goes wrong:** After auto-save resets the form, AmountPad shows stale display text while `value` prop is 0.
**Why it happens:** AmountPad has internal `display` state (useState) that doesn't sync with the `value` prop after external reset.
**How to avoid:** Add a `useEffect` in AmountPad that resets `display` when `value` changes to 0 externally. Or lift display state to the parent and pass it down.
**Warning signs:** After saving, the keypad shows the previous amount text but the formatted display shows "0".

### Pitfall 6: Rapid Taps Cause Double Save
**What goes wrong:** Fast double-tap on a category tile triggers two saves.
**Why it happens:** The onSelect callback fires twice before the first save completes and resets the form.
**How to avoid:** Add a `saving` ref (useRef<boolean>) that gates the save callback. Set `true` before save, reset after form clears. Or disable the category grid during the 300ms flash animation.
**Warning signs:** Duplicate transactions appearing.

### Pitfall 7: Bengali Numeral Display in AmountPad
**What goes wrong:** When app locale is "bn", the keypad buttons show Bengali numerals but the amount display still shows Arabic numerals (or vice versa).
**Why it happens:** D-18 specifies: keypad always Arabic, display uses Bengali when locale is "bn".
**How to avoid:** Keypad KEYS array stays as `["1", "2", "3", ...]` always. The amount display calls `formatCurrency(amount, useBengali)` where `useBengali = locale === "bn"`. These are separate concerns.
**Warning signs:** Inconsistent numeral systems between keypad and display.

## Code Examples

### Existing QuickAdd Flow (Current -- To Be Refactored)

```typescript
// Current: QuickAdd.tsx lines 16, 29-31, 82-85, 173-207
// Step type includes "confirm" -- this step is removed in Phase 2
type Step = "amount" | "category" | "confirm";

// Category selection leads to confirm step -- Phase 2 makes this auto-save
const handleCategorySelect = useCallback((id: Id<"categories">) => {
  setSelectedCategory(id);
  setStep("confirm");  // REMOVE: Replace with direct save
}, []);
```

### Existing Storage Adapter (Reuse For Frequency)

```typescript
// src/services/storage/index.ts -- existing MMKV adapter
// Can be extended with JSON helpers:
export function getJSON<T>(key: string): T | undefined {
  const raw = getStorage().getString(key);
  if (!raw) return undefined;
  try { return JSON.parse(raw) as T; }
  catch { return undefined; }
}

export function setJSON<T>(key: string, value: T): void {
  getStorage().set(key, JSON.stringify(value));
}
```

### Existing Haptic Pattern (Reuse)

```typescript
// Established pattern from QuickAdd.tsx and add.tsx:
if (Platform.OS !== "web") {
  try {
    const Haptics = require("expo-haptics");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}
```

### Existing Smart Defaults Pattern (Extend)

```typescript
// Current: QuickAdd.tsx line 41
const defaultAccount = accounts?.find((a) => a.isDefault) ?? accounts?.[0];

// Phase 2 extension: last-used account from MMKV with fallback chain
function getDefaultAccount(accounts: Account[]): Account | undefined {
  const lastUsedId = getSetting("last_account_id");
  if (lastUsedId) {
    const lastUsed = accounts.find(a => a._id === lastUsedId && !a.isClosed);
    if (lastUsed) return lastUsed;
  }
  return accounts.find(a => a.isDefault) ?? accounts[0];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 3-step flow (amount, category, confirm) | 2-step auto-save (amount, category tap = done) | Phase 2 | Removes 1 entire screen/step from the flow |
| Alphabetical/grouped categories only | Frequency-sorted strip + grouped | Phase 2 | Most-used categories always at top |
| Convex-dependent data flow | Mock data layer with MMKV fallback | Phase 2 | App works fully offline |
| No animation feedback | Reanimated success flash + haptic | Phase 2 | Tactile confirmation without modal/toast |
| Single use (sheet closes after save) | Batch mode (sheet stays open) | Phase 2 | Rapid entry for market day shopping |

## Open Questions

1. **BottomSheetTextInput Styling with NativeWind**
   - What we know: `BottomSheetTextInput` is a custom component from @gorhom/bottom-sheet. It may or may not accept `className` prop from NativeWind.
   - What's unclear: Whether NativeWind's className interop works with BottomSheetTextInput or if we need `style` prop.
   - Recommendation: Test during implementation. If className doesn't work, use inline `style` prop matching the project's Input component styling. LOW risk since this is in an optional expansion area.

2. **Offline Transaction Sync Strategy**
   - What we know: Transactions saved to MMKV when Convex is offline need to eventually sync when backend comes back.
   - What's unclear: Exact sync mechanism (is it queued and auto-pushed, or manual?).
   - Recommendation: For Phase 2, just store in MMKV. Sync strategy is a future concern (Convex comes back "next month" per constraints). Store enough metadata (timestamp, full transaction shape) that sync is straightforward later.

3. **Date Selector UX for Backdating**
   - What we know: D-14 requires a date picker in optional fields. No date picker library is installed.
   - What's unclear: How complex the date selection needs to be.
   - Recommendation: Implement a minimal "Today / Yesterday / Custom" chip set. If "Custom" is tapped, show a simple month/day selector or plain text input with YYYY-MM-DD format. Avoid adding `@react-native-community/datetimepicker` at this stage.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo 55 |
| Config file | `jest.config.js` (root) |
| Quick run command | `bun run test -- --testPathPattern="src/components/transaction\|src/services/frequency\|src/hooks/use-quick-add\|src/hooks/use-category-frequency"` |
| Full suite command | `bun run test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRAN-01 | Category tap triggers save + resets form | unit | `bun run test -- --testPathPattern="QuickAdd.test" -t "auto-save"` | Wave 0 |
| TRAN-02 | AmountPad formats BDT live, Bengali numerals when locale=bn | unit | `bun run test -- --testPathPattern="AmountPad.test"` | Wave 0 |
| TRAN-03 | Frequency service returns sorted categories, increments counts | unit | `bun run test -- --testPathPattern="frequency"` | Wave 0 |
| TRAN-04 | Smart defaults use last-used account fallback chain | unit | `bun run test -- --testPathPattern="use-quick-add.test" -t "defaults"` | Wave 0 |
| TRAN-05 | Details section expands/collapses, fields update state | unit | `bun run test -- --testPathPattern="ExpandableDetails.test"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test -- --testPathPattern="src/components/transaction|src/services/frequency|src/hooks/use-quick-add|src/hooks/use-category-frequency" --bail`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/frequency/index.test.ts` -- covers TRAN-03 (frequency counting, sorting, BD defaults)
- [ ] `src/hooks/use-quick-add.test.ts` -- covers TRAN-01 (auto-save), TRAN-04 (smart defaults)
- [ ] `src/hooks/use-category-frequency.test.ts` -- covers TRAN-03 (hook layer)
- [ ] `src/components/transaction/AmountPad.test.tsx` -- covers TRAN-02 (Bengali numerals, reset behavior)
- [ ] `src/components/transaction/ExpandableDetails.test.tsx` -- covers TRAN-05

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | Package management | Yes | 1.3.9 | -- |
| Node.js | Metro bundler runtime | Yes | 24.14.1 | -- |
| react-native-reanimated | Success flash animation | Yes | 4.2.1 (installed) | -- |
| @gorhom/bottom-sheet | Entry surface | Yes | ^5.2.8 (installed) | -- |
| react-native-mmkv | Frequency storage, offline txns | Yes | ^4.2.0 (installed) | MemoryStorage on web |
| expo-haptics | Haptic feedback | Yes | ~55.0.8 (installed) | Silent no-op on web |
| Convex backend | Live data operations | No (disabled) | ^1.32.0 (installed) | Mock data + MMKV storage |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- Convex backend (offline until ~April 2026) -- mock data layer at hook level

## Sources

### Primary (HIGH confidence)
- Project codebase -- All existing component source files read and analyzed
- `src/components/transaction/QuickAdd.tsx` -- Current 3-step flow (211 lines)
- `src/components/transaction/AmountPad.tsx` -- Keypad implementation (86 lines)
- `src/components/transaction/CategoryGrid.tsx` -- Category display (119 lines)
- `src/services/storage/index.ts` -- MMKV adapter pattern (108 lines)
- `src/lib/currency.ts` -- BDT formatting utilities (57 lines)
- `convex/schema.ts` -- Full database schema (transactions, categories, accounts)
- `convex/transactions.ts` -- Transaction CRUD mutations
- [Reanimated withSequence docs](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/) -- Animation chaining API
- [Reanimated interpolateColor docs](https://docs.swmansion.com/react-native-reanimated/docs/utilities/interpolateColor/) -- Color interpolation API

### Secondary (MEDIUM confidence)
- [@gorhom/bottom-sheet keyboard handling](https://gorhom.dev/react-native-bottom-sheet/keyboard-handling) -- BottomSheetTextInput pattern, keyboardBehavior prop
- [react-native-mmkv GitHub](https://github.com/mrousavy/react-native-mmkv) -- JSON storage patterns, string-based key-value API
- [Expo haptics docs](https://docs.expo.dev/versions/latest/sdk/haptics/) -- notificationAsync API

### Tertiary (LOW confidence)
- Web search for keyboard double-avoiding on Android -- multiple GitHub issues report the problem, solutions vary by bottom-sheet version

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already installed and verified in package.json. No new dependencies required.
- Architecture: HIGH -- Refactoring existing components with well-understood patterns. Codebase fully read.
- Pitfalls: HIGH -- Identified from real issues in the existing code (AmountPad display state, keyboard handling) and known React Native patterns.
- Animation: MEDIUM -- Reanimated interpolateColor + withSequence is documented standard, but this project has zero existing Reanimated usage in source code. First time using these APIs in this codebase.
- Mock data: MEDIUM -- Pattern is straightforward (conditional hook return), but offline transaction storage + eventual sync has design decisions to make.

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable -- all libraries are installed, no upcoming breaking changes expected)
