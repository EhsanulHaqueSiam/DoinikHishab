# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- PascalCase for component files: `BalanceCard.tsx`, `QuickAdd.tsx`, `Button.tsx`
- camelCase for utility/hook/store files: `currency.ts`, `use-transactions.ts`, `app-store.ts`
- Use hyphens in file names for kebab-case modules: `use-platform.ts`, `budget-engine/index.ts`
- Index exports in directories: `src/services/budget-engine/index.ts`, `src/lib/i18n/index.ts`

**Functions:**
- camelCase for all functions: `calculateReadyToAssign()`, `paisaToTaka()`, `getNestedValue()`
- Handler functions use `handle` prefix: `handleSave()`, `handleCategorySelect()`, `handleClose()`
- Getter functions use `get` prefix: `getCategoryInfo()`, `getAccountName()`, `getInitialMonth()`
- Custom hooks use `use` prefix: `useAppStore()`, `useBudget()`, `useFilteredTransactions()`

**Variables:**
- camelCase for local variables: `userId`, `currentMonth`, `selectedCategory`, `defaultAccount`
- UPPER_SNAKE_CASE for constants: `ACCOUNT_ICON`, `TYPE_COLORS`, `TAKA_SYMBOL`
- Boolean variables use `is` prefix: `isQuickAddOpen`, `isClosed`, `isDefault`, `isCleared`
- Ref names use `Ref` suffix: `bottomSheetRef`, `inflowRef`

**Types:**
- PascalCase for interfaces and types: `AppState`, `ButtonProps`, `BudgetSummary`, `TransactionFilters`
- Suffix component props with `Props`: `ButtonProps`, `BalanceCardProps`, `InputProps`
- Use `Record<K, V>` for object maps: `Record<string, string>`, `Record<string, CategoryBudget>`
- Suffix component state types with `State`: `AppState`, `UIState`

## Code Style

**Formatting:**
- No dedicated formatter config found (ESLint/Prettier not present)
- Babylon implicit formatting observed in source
- 2-space indentation used throughout
- Lines generally under 100 characters
- Consistent semicolon usage

**Linting:**
- No `.eslintrc` or linter configuration detected
- Project uses TypeScript strict mode for type safety
- Type annotations required on function parameters and return values

## Import Organization

**Order:**
1. React/React Native imports: `import React from "react"`, `import { View, Text } from "react-native"`
2. External packages: `import { useQuery, useMutation } from "convex/react"`, `import BottomSheet from "@gorhom/bottom-sheet"`
3. Convex API: `import { api } from "../../convex/_generated/api"`
4. Type imports: `import type { Id } from "../../convex/_generated/dataModel"`
5. Relative imports (stores): `import { useAppStore } from "../../src/stores/app-store"`
6. Relative imports (components): `import { Button } from "../ui/Button"`
7. Relative imports (utilities/lib): `import { formatCurrency } from "../../src/lib/currency"`

**Path Aliases:**
- `@/*` → Project root (rarely used, relative imports preferred)
- `@src/*` → `./src/*` (for absolute imports from src)
- `@components/*` → `./src/components/*`
- `@lib/*` → `./src/lib/*`
- `@stores/*` → `./src/stores/*`
- `@hooks/*` → `./src/hooks/*`
- Relative imports are heavily preferred over aliases throughout codebase

**Import consolidation:**
- Multiple imports from same source on one line: `import { useQuery, useMutation } from "convex/react"`
- Separate lines for type imports: `import type { Id, Doc } from "../../convex/_generated/dataModel"`

## Error Handling

**Patterns:**
- Try-catch blocks used sparingly, only around async operations
- Location: `src/components/transaction/QuickAdd.tsx` — wraps transaction creation
- Generic catch pattern: `catch (error)` then `console.error()`
- Silent failures acceptable in secondary operations: `try { Haptics... } catch {}`
- Convex mutations auto-throw; errors caught at component level
- Error messages displayed via UI state or console only (no global error boundary detected)
- UI Component error display: `Input` component shows error text below field (`error` prop)

**Strategy:**
- Component-level error handling for user interactions
- Database errors caught after mutations
- Validation failures handled silently or via UI feedback
- No centralized error logging or monitoring

## Logging

**Framework:** `console` object (console.error, console.log)

**Patterns:**
- Minimal logging observed
- Only critical failures logged: `console.error("Failed to save transaction:", error)`
- No info/debug/warn levels used
- No structured logging (no logger utility)
- Convex backend errors caught and displayed as user-facing messages in app store state

## Comments

**When to Comment:**
- Comments used for high-level context at function/module level
- JSDoc-style comments on utility functions explaining behavior
- Inline comments rare; code is expected to be self-documenting

**JSDoc/TSDoc:**
- Used in utility modules: `src/lib/currency.ts` has block comment explaining "All amounts stored as paisa (integer)"
- Used in service modules: `src/services/budget-engine/index.ts` explains "Zero-based budgeting engine"
- Component comments rare; props self-documented through TypeScript interfaces
- Convex handlers have no JSDoc; documentation in query/mutation arg definitions via convex/values

**Example patterns:**
```typescript
/**
 * Currency utilities for BDT (Bangladeshi Taka)
 * All amounts stored as paisa (integer) — 1 taka = 100 paisa
 */

/**
 * Calculate Ready to Assign:
 * = Total income (this month + prior)
 * - Total assigned (this month + prior)
 * - Overspending in prior months (uncovered)
 */
```

## Function Design

**Size:** Functions kept under 50 lines; largest observed is ~60 lines (`useBudget()` calculation)

**Parameters:**
- Typed parameters required: no implicit `any` types
- Destructure complex params into interfaces: `({ userId, currentMonth }: Props)`
- Optional params use `?` suffix: `accountId?: Id<"accounts">`, `filters?: TransactionFilters`
- Callbacks use arrow functions: `const handleSave = useCallback(async () => { ... }, [deps])`

**Return Values:**
- Explicit return types on exported functions: `function useFilteredTransactions(...): Txn[]`
- Hooks return objects when multiple values needed: `return { summary, budgets, categories, groups }`
- Component render returns JSX directly, no wrapper objects

## Module Design

**Exports:**
- Named exports preferred: `export function Button() {}`, `export const useAppStore = create<AppState>()`
- Mix of default and named: `export default function DashboardScreen()` in route files
- Barrel files used in component directories: `src/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx` imported individually
- Store exports as named const: `export const useAppStore = create(...)`

**Barrel Files:**
- Used implicitly in `src/components/*/index.ts` pattern (not found explicitly, but structure suggests one-component-per-file)
- No central `src/index.ts` barrel observed
- Services exported via index: `src/services/budget-engine/index.ts` exports all functions

## Type Patterns

**Strict Mode:**
- TypeScript strict mode enabled in `tsconfig.json`
- All function parameters fully typed
- No implicit `any` type usage

**Convex Types:**
- Types imported from `convex/_generated/dataModel`: `import type { Id, Doc } from "..."`
- `Id<"users">` pattern for type-safe foreign keys
- `Doc<"transactions">` pattern for full document types (rarely used, any pattern used instead)
- Validator imports from `convex/values`: `import { v } from "convex/values"`

**Union Types:**
- Used for enums: `type Step = "amount" | "category" | "confirm"`
- Used for variants: `variant?: "default" | "secondary" | "outline" | "ghost" | "danger"`
- Convex unions: `v.union(v.literal("expense"), v.literal("income"), v.literal("transfer"))`

**Optional Fields:**
- Interface optional fields use `?`: `categoryId?: Id<"categories">`
- Convex optional fields use `v.optional()`: `v.optional(v.id("accounts"))`
- Nullability: Fields can be `null` or undefined interchangeably, not always explicit

---

*Convention analysis: 2026-03-25*
