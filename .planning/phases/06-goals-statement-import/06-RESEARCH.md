# Phase 6: Goals & Statement Import - Research

**Researched:** 2026-03-26
**Domain:** Financial goal tracking, debt payoff strategies, mobile financial statement parsing (bKash/Nagad)
**Confidence:** HIGH

## Summary

Phase 6 delivers two distinct feature domains: (1) goal tracking with save-up and pay-down goals including YNAB-style budget integration, and (2) bKash/Nagad statement import with on-device parsing. Both follow established project patterns -- MMKV persistence, mock data hooks, bottom sheet forms, NativeWind styling.

The goals domain is pure computation and UI -- amortization schedules, avalanche vs snowball strategy comparison, and progress tracking are all deterministic math that can be implemented as pure functions in a new service module. The statement import domain requires file I/O with `expo-document-picker` (already installed) and `expo-file-system` (already installed), plus the `xlsx` library (new dependency) for XLS parsing and regex-based text extraction for PDF/TXT formats. Password-protected PDF handling (IMPT-01) is a significant constraint -- `expo-pdf-text-extract` does NOT support password-protected PDFs, so the approach must be: user unlocks the PDF externally first, then imports the unlocked file.

**Primary recommendation:** Build goal-storage and statement-parser as two independent service modules under `src/services/`, following the recurring-storage pattern for MMKV persistence and the budget-engine pattern for pure calculation functions. Use `xlsx` (SheetJS) for XLS parsing, regex-based line parsing for PDF text and TXT, and `expo-file-system` for reading picked files as base64/string.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Bottom sheet form for goal creation -- target amount, target date (date picker), linked account (dropdown), name. Validates required fields. Matches AddSubscriptionForm pattern
- **D-02:** Horizontal progress bar with percentage + "X of Y" text. Green when on-track, saffron when behind, teal when ahead. Reuse SinkingFundRow progress pattern from Phase 3
- **D-03:** "X/month needed" subtitle below progress bar -- calculated as (target - current) / remaining months. Updates dynamically
- **D-04:** Card-based list on dedicated Goals screen. Each card shows name, progress bar, status badge, monthly contribution
- **D-05:** Expandable amortization table -- month, payment, principal, interest, remaining balance. Collapsed by default, "Show schedule" to expand. First 6 rows visible, "Load more" for rest
- **D-06:** Side-by-side card comparison -- Avalanche vs Snowball cards each showing total interest paid, payoff date, total cost. Recommended strategy highlighted with teal border. Delta row showing savings
- **D-07:** Reuse existing Input component -- currency input for balance/payment, numeric for APR%. APR shown as "12.5%", amounts in BDT
- **D-08:** FlashList of debt cards -- each shows balance, APR, min payment, projected payoff. "Add Debt" button. Strategy comparison runs across all debts simultaneously
- **D-09:** expo-document-picker (already installed) -- filter PDF, XLS, TXT MIME types. Single file selection. Loading spinner during parse
- **D-10:** On-device regex parsing -- bKash patterns (Cash In, Cash Out, Send Money, Payment). XLS via xlsx library. No server-side processing
- **D-11:** Checklist of parsed transactions -- each row: date, description, amount, mapped type. Checkbox to include/exclude. Yellow duplicate badge when date+amount+reference matches existing. "Import Selected" button at bottom
- **D-12:** Hardcoded type mapping -- Cash Out/Send Money/Payment = expense, Cash In/Add Money = income, Cashback = income. User can override per transaction in review
- **D-13:** Goal categories auto-created -- "Goal: [name]" category in budget view. Monthly contribution target becomes category target. Activity tracked as contributions
- **D-14:** Goals screen as nested route from dashboard -- `app/goals/index.tsx` via "Goals" card on dashboard. Dashboard card shows top 2-3 goals with progress bars
- **D-15:** Import as nested route -- `app/import/index.tsx` from Settings > Import Statement + "Import" button on transactions screen
- **D-16:** MMKV storage for goals -- same pattern as recurring storage. JSON array with goal objects. Budget integration reads from this store

### Claude's Discretion
- Date picker component choice and styling
- Amortization calculation precision (rounding)
- Statement format detection heuristics
- Duplicate detection threshold tuning
- Import progress indicators
- Goal detail screen layout

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GOAL-01 | Save-up goals with target amount, target date, linked account, monthly contribution | Goal storage service (MMKV), GoalForm component, calculateMonthlyContribution pure function |
| GOAL-02 | Save-up goal status tracking: on-track, behind, or ahead with progress bars | Reuse SinkingFundRow progress pattern, GoalCard component with animated progress bar |
| GOAL-03 | Pay-down goals with loan balance, APR, minimum payment, amortization schedule | Amortization pure function in goal-engine service, DebtCard + AmortizationTable components |
| GOAL-04 | Avalanche vs snowball strategy comparison showing total interest and payoff date | Strategy comparison pure functions, StrategyComparison component |
| GOAL-05 | Goal contributions appear as budget category line items | Goal-to-budget bridge reading MMKV goals and injecting "Goal: [name]" categories into budget hook |
| IMPT-01 | bKash PDF statement parser handling password-protected PDFs | expo-pdf-text-extract for text extraction + regex parsing. Password-protected PDFs NOT directly supported -- user must unlock first (documented limitation) |
| IMPT-02 | Nagad statement parser supporting XLS, PDF, and TXT formats | xlsx (SheetJS) for XLS, same PDF text extraction for Nagad PDFs, line-by-line regex for TXT |
| IMPT-03 | Transaction type mapping (Cash Out = expense, Cash In = income, Send Money = user-decided) | Hardcoded TYPE_MAP constant, per-row override in ImportReviewRow |
| IMPT-04 | Deduplication check by date + amount + reference | Hash-based comparison against existing MMKV transaction history |
| IMPT-05 | All statement parsing happens on-device | expo-file-system reads file locally, all parsing in JS/native -- no network calls |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xlsx (SheetJS) | 0.18.5 | XLS/XLSX file parsing | Industry-standard spreadsheet parser, works in React Native via base64, pure JS |
| expo-file-system | 55.0.11 (installed) | Read picked files from cache | Already in project, needed to read DocumentPicker output as base64 for xlsx |
| expo-document-picker | ~55.0.8 (installed) | File selection dialog | Already installed, filters by MIME type, copies to cache directory |
| react-native-mmkv | ^4.2.0 (installed) | Persistent goal/debt storage | Established project pattern for offline-first MMKV storage |
| react-native-reanimated | 4.2.1 (installed) | Progress bar animations | Already used for SinkingFundRow animated progress bars |
| @gorhom/bottom-sheet | ^5.2.8 (installed) | Goal/debt creation forms | Matches AddSubscriptionForm pattern from Phase 5 |
| @shopify/flash-list | ^2.3.0 (installed) | Debt card list, import review list | Already used for performant lists throughout the app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-haptics | ~55.0.8 (installed) | Success feedback on save/import | Form submission, successful import |
| sonner-native | ^0.23.1 (installed) | Toast notifications | Import success/error messages |
| lucide-react-native | ^0.577.0 (installed) | Icons (Target, Upload, TrendingDown, etc.) | Goal cards, file picker, debt cards |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| xlsx (SheetJS) | papaparse | papaparse only handles CSV, not XLS/XLSX binary format. xlsx handles both |
| expo-pdf-text-extract | pdf.js / pdf-parse | pdf.js is slow in RN JS thread; expo-pdf-text-extract uses native PDFKit/PDFBox but requires dev build (not Expo Go). Since this project already uses dev builds (expo prebuild), this is fine |
| Manual regex parsing | Custom NLP parser | Regex is simpler, deterministic, and sufficient for bKash/Nagad's structured format |
| Text-based date input | @react-native-community/datetimepicker | Native date picker adds UX polish but increases complexity. Per D-01 pattern, use Input with YYYY-MM-DD format matching AddSubscriptionForm. Claude's discretion allows upgrading later |

**Installation:**
```bash
bun add xlsx
bun add -d expo-pdf-text-extract
```

Note: `expo-pdf-text-extract` requires a development build (not Expo Go). This project already uses `expo prebuild` for builds, so this is compatible. However, given the password-protected PDF limitation and the fact that bKash/Nagad PDFs have structured text, an alternative approach is to use `expo-file-system` to read the PDF as text directly (for non-encrypted PDFs) or have users provide TXT/XLS format instead. Decision: start with `xlsx` for XLS and regex for TXT as the primary parsers, add PDF parsing as a secondary path.

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    goal-storage/
      index.ts              # MMKV CRUD for goals and debts
      types.ts               # SaveUpGoal, PayDownGoal, GoalDataStore interfaces
    goal-engine/
      index.ts               # Pure functions: amortization, avalanche, snowball, monthly contribution
    statement-parser/
      index.ts               # Main parser entry: detectFormat -> parse -> map types
      bkash-parser.ts        # bKash-specific regex patterns and column mapping
      nagad-parser.ts        # Nagad-specific regex patterns and column mapping
      xls-parser.ts          # xlsx-based XLS/XLSX parser
      types.ts               # ParsedTransaction, ImportResult, StatementFormat interfaces
      type-mapping.ts        # Transaction type mapping constants
  hooks/
    use-goals.ts             # Hook combining MMKV goals with budget integration
    use-import.ts            # Hook managing import state machine (pick -> parse -> review -> import)
  components/
    goals/
      GoalCard.tsx           # Save-up goal card with progress
      GoalForm.tsx           # Bottom sheet creation form
      GoalDetailView.tsx     # Full detail screen content
      DebtCard.tsx           # Pay-down goal card
      DebtForm.tsx           # Bottom sheet debt creation form
      AmortizationTable.tsx  # Expandable schedule table
      StrategyComparison.tsx # Avalanche vs Snowball side-by-side
      GoalDashboardCard.tsx  # Dashboard widget
      GoalProgress.tsx       # Reusable animated progress bar
    import/
      ImportScreen.tsx       # Main import layout
      ImportReviewList.tsx   # FlashList of parsed transactions
      ImportReviewRow.tsx    # Single review row with checkbox
      FilePickerButton.tsx   # Upload card
      ImportProgress.tsx     # Parse loading state
      TypeMappingPill.tsx    # Expense/Income toggle pill
app/
  goals/
    index.tsx                # Goals list screen
    [id].tsx                 # Goal detail screen
  import/
    index.tsx                # Import screen
```

### Pattern 1: Goal Storage (MMKV Persistence)
**What:** MMKV-backed CRUD for save-up and pay-down goals, following recurring-storage pattern
**When to use:** All goal/debt data persistence
**Example:**
```typescript
// Source: Adapted from src/services/recurring-storage/index.ts
import { getJSON, setJSON } from "../storage";
import type { GoalDataStore, SaveUpGoal, PayDownGoal } from "./types";

const GOALS_KEY = "goals:data";

export function getGoals(): GoalDataStore {
  const data = getJSON<GoalDataStore>(GOALS_KEY);
  return data ?? { version: 1, saveUpGoals: [], payDownGoals: [] };
}

export function saveSaveUpGoal(goal: Omit<SaveUpGoal, "id">): SaveUpGoal {
  const id = `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newGoal: SaveUpGoal = { ...goal, id };
  const store = getGoals();
  store.saveUpGoals.push(newGoal);
  setJSON(GOALS_KEY, store);
  return newGoal;
}
```

### Pattern 2: Amortization Calculation (Pure Function)
**What:** Loan amortization schedule generator, avalanche/snowball strategy comparisons
**When to use:** Pay-down goal detail, strategy comparison
**Example:**
```typescript
// Source: Standard amortization formula
export interface AmortizationRow {
  month: number;
  payment: number;    // paisa
  principal: number;  // paisa
  interest: number;   // paisa
  balance: number;    // paisa
}

export function generateAmortization(
  balance: number,      // paisa
  aprPercent: number,   // e.g., 12.5
  minPayment: number    // paisa per month
): AmortizationRow[] {
  const monthlyRate = aprPercent / 100 / 12;
  const rows: AmortizationRow[] = [];
  let remaining = balance;
  let month = 0;

  while (remaining > 0 && month < 360) { // 30-year cap
    month++;
    const interest = Math.round(remaining * monthlyRate);
    const payment = Math.min(minPayment, remaining + interest);
    const principal = payment - interest;
    remaining = Math.max(0, remaining - principal);
    rows.push({ month, payment, principal, interest, balance: remaining });
  }

  return rows;
}
```

### Pattern 3: Statement Parser (Format Detection + Regex)
**What:** On-device parsing of bKash/Nagad statement files using regex patterns
**When to use:** Import screen after file selection
**Example:**
```typescript
// Source: bKash statement format analysis
export interface ParsedTransaction {
  date: string;          // ISO YYYY-MM-DD
  description: string;   // Transaction type + details
  amount: number;        // paisa (always positive)
  type: "expense" | "income";
  reference: string;     // TrxID
  provider: "bkash" | "nagad";
  originalType: string;  // Raw transaction type from statement
}

// bKash statement columns: SL, Trx ID, Transaction Date, Trx Type, Sender, Receiver, Reference, Amount
// bKash transaction types: Cash Out, Cash In, Send Money, Payment, Add Money, Cashback,
//   Mobile Recharge, bKash to Bank, Bank to bKash, Savings Deposit

const BKASH_TYPE_MAP: Record<string, "expense" | "income"> = {
  "Cash Out": "expense",
  "Send Money": "expense",
  "Payment": "expense",
  "Mobile Recharge": "expense",
  "bKash to Bank": "expense",
  "Cash In": "income",
  "Add Money": "income",
  "Bank to bKash": "income",
  "Cashback": "income",
  "Savings Deposit": "expense", // Moving money to savings
};
```

### Pattern 4: Duplicate Detection
**What:** Hash-based deduplication comparing parsed transactions against existing MMKV records
**When to use:** During import review, before showing the review list
**Example:**
```typescript
// Create a hash from date + amount + reference for dedup
function transactionHash(date: string, amount: number, reference: string): string {
  return `${date}|${amount}|${reference}`;
}

export function detectDuplicates(
  parsed: ParsedTransaction[],
  existing: ParsedTransaction[]
): Map<number, boolean> {
  const existingHashes = new Set(
    existing.map(t => transactionHash(t.date, t.amount, t.reference))
  );
  const duplicates = new Map<number, boolean>();
  parsed.forEach((t, idx) => {
    duplicates.set(idx, existingHashes.has(transactionHash(t.date, t.amount, t.reference)));
  });
  return duplicates;
}
```

### Pattern 5: Budget Integration for Goals
**What:** Goals appear as auto-created budget categories ("Goal: [name]")
**When to use:** Budget view reads from goal storage and injects synthetic categories
**Example:**
```typescript
// In use-goals.ts or use-budget.ts
export function getGoalBudgetCategories(goals: SaveUpGoal[]): GoalBudgetCategory[] {
  return goals.map(goal => ({
    id: `goal_cat_${goal.id}`,
    name: `Goal: ${goal.name}`,
    targetAmount: calculateMonthlyContribution(goal.targetAmount, goal.currentAmount, goal.targetDate),
    activity: goal.currentAmount, // Contributions so far
    groupId: "mock_grp_savings", // Place in Savings & Goals group
  }));
}
```

### Anti-Patterns to Avoid
- **Floating-point for money:** All amounts MUST be integer paisa. APR percentage is the only float -- display-only, converted to monthly rate for calculations
- **Server-side file processing:** All parsing happens on-device per IMPT-05. No uploading files to Convex or any server
- **Dynamic NativeWind classes:** Status colors must use static class strings, not template literals. Use the statusConfig record pattern from SinkingFundRow
- **Storing parsed file contents:** Only store the final imported transactions in MMKV, not the raw file data. Files stay in cache and get cleaned up by the OS

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XLS/XLSX file parsing | Custom binary parser | xlsx (SheetJS) | Binary format is complex, SheetJS handles all Excel versions |
| Amortization math | Ad-hoc loops with rounding errors | Pure function with Math.round at each step | Compound interest requires careful rounding to avoid paisa drift |
| File selection dialog | Custom file browser | expo-document-picker | Native file picker UI, MIME type filtering, cache management |
| File reading from picker URI | Raw fetch or XHR | expo-file-system readAsStringAsync | Handles content:// URIs on Android, file:// on iOS |
| Progress bar animation | Manual Animated.Value | react-native-reanimated withTiming | Runs on UI thread, matches existing SinkingFundRow pattern |
| Bottom sheet forms | Custom modal | @gorhom/bottom-sheet | Gesture-driven, matches AddSubscriptionForm pattern |
| Unique ID generation | UUID library | `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}` | Established project pattern in recurring-storage |

**Key insight:** The two domains (goals and import) share zero runtime state. They can be developed completely in parallel as independent service modules with independent UI components. The only shared integration point is the budget hook which reads from the goals MMKV store.

## Common Pitfalls

### Pitfall 1: Floating-Point APR in Amortization
**What goes wrong:** Using APR percentage directly in multiplication causes paisa drift over 30+ years of amortization rows
**Why it happens:** JavaScript floating-point arithmetic accumulates rounding errors
**How to avoid:** Round interest to nearest paisa (Math.round) at EACH row, not at the end. Keep balance as integer paisa throughout
**Warning signs:** Amortization schedule totals don't add up to original balance + total interest

### Pitfall 2: Password-Protected bKash PDFs
**What goes wrong:** expo-pdf-text-extract cannot open password-protected PDFs, extraction returns empty or throws
**Why it happens:** bKash statements are password-protected by default (typically account holder's DOB or last 4 digits of phone number)
**How to avoid:** Show a clear error message when PDF can't be parsed: "This PDF appears to be password-protected. Please unlock it first using your PDF viewer, then try again. Or use the TXT/XLS format instead." Do NOT attempt to crack/guess passwords
**Warning signs:** Empty extraction result from a valid-looking PDF file

### Pitfall 3: bKash/Nagad Format Variations
**What goes wrong:** Statement format changes between app versions, date ranges, or account types
**Why it happens:** bKash and Nagad update their statement templates periodically
**How to avoid:** Use loose regex patterns that match column headers first, then parse rows relative to headers. Include a graceful fallback when format is unrecognized ("Couldn't parse this file" error state per D-11). Use the format detection heuristic to determine bKash vs Nagad vs unknown
**Warning signs:** Successful file pick but zero parsed transactions

### Pitfall 4: Android content:// URI Issues
**What goes wrong:** expo-file-system can't read files from content:// URIs directly on some Android versions
**Why it happens:** Android's storage access framework returns content provider URIs, not file paths
**How to avoid:** Always use `copyToCacheDirectory: true` in DocumentPicker (this is the default). Read from the cached copy's URI. The cached URI is a regular file:// path
**Warning signs:** "File not found" errors after successful file pick on Android

### Pitfall 5: XLS vs XLSX Format Confusion
**What goes wrong:** xlsx library needs different read options for .xls (BIFF) vs .xlsx (OOXML) formats
**Why it happens:** Old .xls is a binary format, .xlsx is ZIP-compressed XML
**How to avoid:** xlsx (SheetJS) handles both transparently when using `XLSX.read(data, { type: 'base64' })`. Just pass the base64 data and let SheetJS auto-detect the format
**Warning signs:** Parse error on .xls files that work as .xlsx

### Pitfall 6: Bundle Size from xlsx
**What goes wrong:** xlsx full build is ~1MB, increases bundle significantly
**Why it happens:** SheetJS includes write capabilities, formula engine, and other features not needed for import-only
**How to avoid:** Use the mini build: `import * as XLSX from 'xlsx/dist/xlsx.mini'` which excludes write support and reduces size by ~40%. We only need read capability
**Warning signs:** Noticeable increase in app bundle size after adding xlsx

### Pitfall 7: Missing Jest Mocks for New Dependencies
**What goes wrong:** Tests fail with "Cannot find module" for xlsx, expo-file-system, expo-document-picker
**Why it happens:** New native/binary dependencies need Jest mocks like all other native modules in this project
**How to avoid:** Add mocks to jest.setup.js for: xlsx, expo-document-picker, expo-file-system. Mock xlsx.read to return predefined workbook shapes. Mock DocumentPicker.getDocumentAsync to return test URIs
**Warning signs:** Test failures in CI that don't reproduce locally

### Pitfall 8: Goal Budget Categories Not Updating
**What goes wrong:** Budget view doesn't reflect newly created/deleted goals because MMKV writes don't trigger React re-renders
**Why it happens:** MMKV is synchronous storage, not reactive. Zustand/useState don't know about external MMKV changes
**How to avoid:** Use the refreshKey state counter pattern (established in Phase 5) to trigger re-render after MMKV writes. When a goal is created/updated/deleted, increment the refreshKey
**Warning signs:** Goal appears in goals screen but not in budget view until app restart

## Code Examples

### File Picking and Reading
```typescript
// Source: expo-document-picker + expo-file-system official docs
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

async function pickAndReadFile(): Promise<{ data: string; name: string; mimeType: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const { uri, name, mimeType } = result.assets[0];

  // Read as base64 for binary files (XLS/XLSX), as string for text (TXT/PDF text)
  const isBinary = mimeType?.includes("excel") || mimeType?.includes("spreadsheet");
  const data = await FileSystem.readAsStringAsync(uri, {
    encoding: isBinary ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8,
  });

  return { data, name: name ?? "unknown", mimeType: mimeType ?? "" };
}
```

### XLS Parsing with SheetJS
```typescript
// Source: SheetJS React Native docs
import * as XLSX from "xlsx";

function parseXLS(base64Data: string): ParsedTransaction[] {
  const workbook = XLSX.read(base64Data, { type: "base64" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  return rows.map(row => ({
    date: normalizeDate(row["Date"] || row["Transaction Date"] || ""),
    description: row["Transaction Type"] || row["Type"] || "",
    amount: parseBDTAmount(row["Amount"] || row["Transacted Amount"] || "0"),
    type: mapTransactionType(row["Transaction Type"] || row["Type"] || ""),
    reference: row["Trx ID"] || row["TrxID"] || row["Reference"] || "",
    provider: detectProvider(rows),
    originalType: row["Transaction Type"] || row["Type"] || "",
  }));
}
```

### Avalanche vs Snowball Comparison
```typescript
// Source: Standard debt payoff algorithms
interface DebtInput {
  id: string;
  name: string;
  balance: number;    // paisa
  aprPercent: number;  // e.g., 12.5
  minPayment: number; // paisa per month
}

interface StrategyResult {
  strategy: "avalanche" | "snowball";
  totalInterest: number;  // paisa
  totalCost: number;      // paisa
  payoffMonths: number;
  payoffDate: string;     // YYYY-MM
}

export function compareStrategies(
  debts: DebtInput[],
  extraPayment: number = 0  // additional paisa per month beyond minimums
): { avalanche: StrategyResult; snowball: StrategyResult } {
  // Avalanche: pay highest APR first
  const avalancheSorted = [...debts].sort((a, b) => b.aprPercent - a.aprPercent);
  const avalanche = simulatePayoff(avalancheSorted, extraPayment, "avalanche");

  // Snowball: pay lowest balance first
  const snowballSorted = [...debts].sort((a, b) => a.balance - b.balance);
  const snowball = simulatePayoff(snowballSorted, extraPayment, "snowball");

  return { avalanche, snowball };
}

function simulatePayoff(
  sortedDebts: DebtInput[],
  extraPayment: number,
  strategy: "avalanche" | "snowball"
): StrategyResult {
  const balances = sortedDebts.map(d => d.balance);
  let totalInterest = 0;
  let month = 0;
  const totalMinPayments = sortedDebts.reduce((s, d) => s + d.minPayment, 0);

  while (balances.some(b => b > 0) && month < 360) {
    month++;
    let available = totalMinPayments + extraPayment;

    for (let i = 0; i < sortedDebts.length; i++) {
      if (balances[i] <= 0) continue;
      const rate = sortedDebts[i].aprPercent / 100 / 12;
      const interest = Math.round(balances[i] * rate);
      totalInterest += interest;
      balances[i] += interest;

      const payment = Math.min(available, balances[i]);
      balances[i] -= payment;
      available -= payment;
      if (balances[i] <= 0) balances[i] = 0;
    }
  }

  const now = new Date();
  const payoffDate = new Date(now.getFullYear(), now.getMonth() + month, 1);

  return {
    strategy,
    totalInterest,
    totalCost: sortedDebts.reduce((s, d) => s + d.balance, 0) + totalInterest,
    payoffMonths: month,
    payoffDate: payoffDate.toISOString().slice(0, 7),
  };
}
```

### Goal Progress Status
```typescript
// Source: Adapted from SinkingFundRow status logic
export type GoalStatus = "ahead" | "on_track" | "behind" | "funded";

export function calculateGoalStatus(
  currentAmount: number,   // paisa
  targetAmount: number,    // paisa
  targetDate: string,      // ISO date YYYY-MM-DD
  createdDate: string      // ISO date YYYY-MM-DD
): GoalStatus {
  const progress = targetAmount > 0 ? currentAmount / targetAmount : 0;
  if (progress >= 1) return "funded";

  const now = new Date();
  const target = new Date(targetDate);
  const created = new Date(createdDate);

  const totalDays = Math.max(1, (target.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = Math.min(elapsedDays / totalDays, 1);

  if (progress > expectedProgress + 0.05) return "ahead";
  if (progress >= expectedProgress - 0.05) return "on_track";
  return "behind";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pdf-parse (Node.js) | expo-pdf-text-extract (native) | Jan 2026 | Native extraction is 10x faster, but doesn't support password-protected PDFs |
| expo-file-system default import | expo-file-system/legacy import | Expo SDK 55 | New File API available but legacy readAsStringAsync still works and is better documented |
| xlsx full bundle | xlsx/dist/xlsx.mini | SheetJS 0.18+ | Mini build excludes write support, ~40% smaller |

**Deprecated/outdated:**
- `expo-file-system` default export now provides a new `File` class API. The `legacy` import provides the familiar `readAsStringAsync` / `writeAsStringAsync` functions. Both work; legacy is more established in the ecosystem

## Open Questions

1. **Password-protected PDF support**
   - What we know: bKash PDFs are password-protected by default. expo-pdf-text-extract does NOT support unlocking password-protected PDFs
   - What's unclear: Whether we should add a password input field in the UI or simply tell users to unlock the PDF first
   - Recommendation: Show clear error messaging directing users to unlock the PDF externally or use TXT/XLS format instead. Adding password input is scope creep and a security concern (storing/handling banking passwords). Most tech-savvy users who export statements can also unlock PDFs

2. **Nagad statement exact format**
   - What we know: Nagad statements exist in PDF format with transaction rows including date, type, amount, and balance. Columns include debit/credit with BDT amounts
   - What's unclear: Exact column headers and date format variations across different Nagad app versions and statement periods
   - Recommendation: Build the parser with flexible column name matching (check for multiple possible header names). Add format detection that tries multiple patterns. Start with the known format and iterate based on user feedback. Flag parse failures gracefully

3. **PDF text extraction on web platform**
   - What we know: expo-pdf-text-extract uses native APIs (PDFKit/PDFBox) -- works only on iOS/Android, not web
   - What's unclear: Whether PDF import should work on web or be mobile-only
   - Recommendation: Since the app is mobile-first (most users on Android) and bKash/Nagad are mobile services, PDF parsing can be mobile-only. Show "PDF import is only available on mobile" on web. XLS and TXT parsing (xlsx library + regex) work on all platforms

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-document-picker | IMPT-01 to IMPT-05 | Yes | ~55.0.8 | -- |
| expo-file-system | IMPT-01, IMPT-02, IMPT-05 | Yes | 55.0.11 | -- |
| react-native-mmkv | GOAL-01 to GOAL-05 | Yes | ^4.2.0 | -- |
| @gorhom/bottom-sheet | GOAL-01, GOAL-03 | Yes | ^5.2.8 | -- |
| @shopify/flash-list | GOAL-04, IMPT-04 | Yes | ^2.3.0 | -- |
| xlsx (SheetJS) | IMPT-02 | No (needs install) | 0.18.5 | -- |
| expo-pdf-text-extract | IMPT-01 (PDF path) | No (needs install) | 1.0.1 | Skip PDF, rely on TXT/XLS |
| Jest | Testing | Yes | ^29.7.0 | -- |

**Missing dependencies with no fallback:**
- `xlsx` -- required for XLS file parsing. Must install via `bun add xlsx`

**Missing dependencies with fallback:**
- `expo-pdf-text-extract` -- needed for PDF text extraction on native. Fallback: read PDF as text via expo-file-system (works for some text-based PDFs) or guide users to TXT/XLS format. Can be deferred if dev build complications arise

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + jest-expo 55.0.11 |
| Config file | jest.config.js |
| Quick run command | `npx jest --testPathPattern='src/services/goal' --no-coverage` |
| Full suite command | `npx jest` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GOAL-01 | Save-up goal CRUD in MMKV | unit | `npx jest src/services/goal-storage/index.test.ts -x` | Wave 0 |
| GOAL-02 | Goal status calculation (ahead/behind/on-track) | unit | `npx jest src/services/goal-engine/index.test.ts -x` | Wave 0 |
| GOAL-03 | Amortization schedule generation | unit | `npx jest src/services/goal-engine/index.test.ts -x` | Wave 0 |
| GOAL-04 | Avalanche vs snowball comparison | unit | `npx jest src/services/goal-engine/index.test.ts -x` | Wave 0 |
| GOAL-05 | Goal categories in budget output | unit | `npx jest src/hooks/use-goals.test.ts -x` | Wave 0 |
| IMPT-01 | bKash PDF/TXT parsing | unit | `npx jest src/services/statement-parser/bkash-parser.test.ts -x` | Wave 0 |
| IMPT-02 | Nagad XLS/PDF/TXT parsing | unit | `npx jest src/services/statement-parser/nagad-parser.test.ts -x` | Wave 0 |
| IMPT-03 | Transaction type mapping | unit | `npx jest src/services/statement-parser/type-mapping.test.ts -x` | Wave 0 |
| IMPT-04 | Duplicate detection | unit | `npx jest src/services/statement-parser/index.test.ts -x` | Wave 0 |
| IMPT-05 | On-device parsing (no network) | unit | `npx jest src/services/statement-parser/ -x` (verify no fetch mocks) | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern='src/services/(goal|statement)' --no-coverage`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/goal-storage/index.test.ts` -- CRUD operations for goals and debts
- [ ] `src/services/goal-engine/index.test.ts` -- amortization, strategy comparison, status calculation
- [ ] `src/services/statement-parser/bkash-parser.test.ts` -- bKash text parsing with sample data
- [ ] `src/services/statement-parser/nagad-parser.test.ts` -- Nagad text parsing with sample data
- [ ] `src/services/statement-parser/type-mapping.test.ts` -- type mapping constants
- [ ] `src/services/statement-parser/index.test.ts` -- format detection, duplicate detection
- [ ] `src/hooks/use-goals.test.ts` -- goal budget integration
- [ ] Jest mocks in jest.setup.js for: `xlsx`, `expo-document-picker`, `expo-file-system/legacy`

## Project Constraints (from CLAUDE.md)

- **Package manager:** Bun (not npm/yarn) -- use `bun add` for new dependencies
- **Styling:** NativeWind v4 with className props -- no dynamic class strings
- **Amounts:** Stored in paisa (integer cents), displayed as BDT
- **Convex offline:** Backend disabled -- all features use mock data at hook level
- **Mobile-first:** Most users on Android -- optimize for mobile UX
- **Cross-platform shadows:** Use `shadow()` helper from `@lib/platform`
- **File naming:** PascalCase for components, kebab-case for services/hooks
- **No Co-Authored-By in commits:** Keep commit messages clean without Claude attribution
- **Path aliases:** Use `@components/*`, `@lib/*`, `@stores/*`, `@hooks/*` for imports

## Sources

### Primary (HIGH confidence)
- expo-document-picker official docs -- file picking API, MIME type filtering, copyToCacheDirectory
- expo-file-system official docs (v55.0.11) -- readAsStringAsync with base64/UTF8 encoding
- SheetJS official docs -- React Native integration, XLSX.read with base64 type
- Existing project codebase -- recurring-storage, SinkingFundRow, AddSubscriptionForm, budget-engine patterns

### Secondary (MEDIUM confidence)
- bKash statement format -- columns: SL, Trx ID, Transaction Date, Trx Type, Sender, Receiver, Reference, Amount (from Scribd samples and gov.bd portal link title)
- Nagad statement format -- PDF with debit/credit columns, BDT amounts (from Scribd samples)
- expo-pdf-text-extract -- native PDF text extraction, does NOT support password-protected PDFs (from Medium article + npm listing)
- Standard amortization/avalanche/snowball algorithms -- well-established financial mathematics

### Tertiary (LOW confidence)
- Nagad TXT and XLS exact format structure -- could not verify exact column headers. Parser must use flexible column matching
- bKash date format in statements -- appears to be MM/DD/YYYY or DD/MM/YYYY depending on version. Parser must handle both

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all core libraries verified (xlsx via npm, expo-file-system installed, established project patterns)
- Architecture: HIGH - follows existing project patterns (recurring-storage, budget-engine, AddSubscriptionForm)
- Pitfalls: HIGH - based on documented issues (password PDF, Android content:// URIs, float arithmetic)
- bKash/Nagad parsing: MEDIUM - statement format verified from multiple sources but exact column names may vary
- PDF extraction: MEDIUM - expo-pdf-text-extract is relatively new (Jan 2026), limited adoption data

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days -- stable libraries, well-known financial algorithms)
