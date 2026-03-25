# Phase 2: 3-Tap Transaction Entry - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 02-3-tap-transaction-entry
**Areas discussed:** Flow redesign, Category sorting & frequency, Optional fields expansion, Smart defaults & entry point

---

## Flow Redesign

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-save immediately | Tapping a category saves instantly with haptic + flash. True 3-tap. | ✓ |
| Auto-save with undo toast | Saves immediately but shows 3-second undo toast. Safety net. | |
| Keep confirm step | Current 4-tap flow stays. Safer but slower. | |

**User's choice:** Auto-save immediately
**Notes:** User selected the true 3-tap flow without hesitation.

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom sheet | Keep existing @gorhom/bottom-sheet. Native feel, swipe to dismiss. | ✓ |
| Full-screen modal | Dedicated screen via Expo Router. More space but loses "quick" feel. | |
| Inline on dashboard | Amount pad directly on home tab. Radical but takes dashboard space. | |

**User's choice:** Bottom sheet

| Option | Description | Selected |
|--------|-------------|----------|
| Disable Next button | Button grayed out until amount > 0. Current behavior. | ✓ |
| Allow ৳0 transactions | Some users track zero-cost events. | |

**User's choice:** Disable Next button

| Option | Description | Selected |
|--------|-------------|----------|
| Close sheet | Sheet dismisses after save. One transaction per open. | |
| Reset for rapid entry | Sheet stays open, resets to amount step with success flash. | ✓ |
| Ask user each time | "Add another?" prompt after save. Flexible but friction. | |

**User's choice:** Reset for rapid entry
**Notes:** Perfect for market day batching scenario.

| Option | Description | Selected |
|--------|-------------|----------|
| Haptic + brief flash | Strong haptic + category tile flashes green 300ms, then reset. | ✓ |
| Full-screen success overlay | Animated checkmark for 1 second. More dramatic but slower. | |
| Toast notification only | Sonner toast "৳450 → Food saved". Minimal but easy to miss. | |

**User's choice:** Haptic + brief flash

| Option | Description | Selected |
|--------|-------------|----------|
| Keep type toggle at top | Current design — expense/income/transfer tabs visible. | ✓ |
| Default to expense, hide toggle | Hide toggle behind long-press. Cleaner but harder for income. | |
| Swipe to change type | Gesture-based cycling. Discoverable via arrow hints. | |

**User's choice:** Keep type toggle at top

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current behavior | Decimal point key, max 2 decimal places. Already in AmountPad. | ✓ |
| Integer-only | Remove dot key. Whole taka only. Simpler. | |
| Auto-decimal (ATM style) | Last 2 digits always paisa. Common in banking apps. | |

**User's choice:** Keep current behavior

---

## Category Sorting & Frequency

| Option | Description | Selected |
|--------|-------------|----------|
| Frequency + grouped | Top strip: frequent categories. Below: full grouped grid. | ✓ |
| Flat frequency-only | No groups — entire grid by frequency. Simplest. | |
| Groups sorted by frequency | Keep groups but sort by total group usage. | |

**User's choice:** Frequency section + grouped section

| Option | Description | Selected |
|--------|-------------|----------|
| Local MMKV counter | Track tap counts locally. Works offline. | |
| Hardcoded default order | Ship sensible Bangladesh defaults. No dynamic sorting. | |
| Both — local + smart defaults | Start with defaults, override with local counts. | ✓ |

**User's choice:** Both — local counter with smart defaults

| Option | Description | Selected |
|--------|-------------|----------|
| 6 categories (2x3) | Compact. Leaves room for grouped grid. | |
| 8 categories (2x4) | Good balance for standard phones. | |
| Dynamic based on screen | Calculate how many fit based on device width. | ✓ |

**User's choice:** Dynamic based on screen

---

## Optional Fields Expansion

| Option | Description | Selected |
|--------|-------------|----------|
| Before save — expandable row | "+ Details" link below keypad reveals fields inline. | ✓ |
| After save — edit from list | Add details by editing saved transaction. Ultra-minimal. | |
| Swipe-up to expand | Bottom sheet starts at 60%, swipe up reveals fields. | |

**User's choice:** Before save — expandable row on amount step

**Fields selected (multi-select):**
- ✓ Payee / merchant name
- ✓ Memo / note
- ✓ Flag (star/pin)
- ✓ Account override

---

## Smart Defaults & Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| FAB on dashboard | Floating action button on home tab. Existing FAB.tsx. | ✓ |
| Center tab bar button | Replace middle tab with "+" button. Always visible. | |
| Both FAB and tab bar | Maximum accessibility. Potentially redundant. | |

**User's choice:** FAB on dashboard

**Defaults selected (multi-select):**
- ✓ Last-used account
- ✓ Today's date
- ✓ Expense type
- ✓ Date override in optional fields

| Option | Description | Selected |
|--------|-------------|----------|
| Full mock data flow | Hardcoded mock categories/accounts. Works end-to-end with MMKV. | ✓ |
| UI-only with disabled save | Full UI but save disabled. "Backend offline" badge. | |
| Queue locally, sync later | Save to local queue, batch-sync on reconnect. | |

**User's choice:** Full mock data flow

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both flows | QuickAdd for fast entry, full editor for complex. | ✓ |
| Replace with quick add only | Remove full editor. Quick add covers all cases. | |
| Quick add opens full editor | "+ Details" navigates to add.tsx with pre-filled amount. | |

**User's choice:** Keep both flows

| Option | Description | Selected |
|--------|-------------|----------|
| Always Arabic numerals (0-9) | Keypad shows 0-9 regardless of language. Display uses Bengali. | ✓ |
| Bengali numerals on keypad | Show ০১২৩৪৫৬৭৮৯ when in Bengali. Fully localized. | |
| User preference toggle | Let user choose numeral style in settings. | |

**User's choice:** Always Arabic numerals (0-9)

---

## Claude's Discretion

- Animation implementation details (Reanimated vs CSS transitions)
- MMKV storage schema for frequency counters and offline transactions
- Mock data structure for categories and accounts
- CategoryGrid refactoring approach
- Test strategy for new components

## Deferred Ideas

None — discussion stayed within phase scope
