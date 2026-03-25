# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Client-Backend Separation with Zustand State Management + Convex Backend

The app follows a **layered, reactive architecture** with clear separation between UI (Expo Router), state management (Zustand), services, and backend (Convex backend-as-a-service).

**Key Characteristics:**
- **Multi-tenancy by design** - All Convex tables indexed by `userId`
- **Zero-based budgeting core** - YNAB-style budget engine with "every taka gets a job" philosophy
- **Real-time sync** - Convex provides live query subscriptions for instant UI updates
- **Offline-first storage** - MMKV (native) / memory (web) for settings and sensitive data
- **Type-safe end-to-end** - TypeScript everywhere, auto-generated Convex types

## Layers

**Presentation (UI Layer):**
- Purpose: Screen layouts, navigation, user interaction
- Location: `app/` (Expo Router file-based routing), `src/components/`
- Contains: Screens, bottom sheets, modals, forms, charts
- Depends on: Zustand stores, Convex hooks (`useQuery`, `useMutation`), component library (NativeWind)
- Used by: Direct user interaction, triggered by navigation

**State Management (Zustand Layer):**
- Purpose: Client-side application state (user context, UI modals, preferences)
- Location: `src/stores/app-store.ts`, `src/stores/ui-store.ts`
- Contains: Global app state (userId, currentMonth, locale, theme) and UI state (modal open/close)
- Depends on: Nothing (pure state)
- Used by: All screens and components via `useAppStore()`, `useUIStore()`

**Services & Utilities Layer:**
- Purpose: Domain-specific business logic, calculations, storage adapters
- Location: `src/services/` (budget-engine, categorizer, suggestions, storage), `src/lib/` (utilities)
- Contains: Budget calculations, category auto-detection, data serialization, crypto, i18n, date/currency formatting
- Depends on: Convex types, React hooks (where applicable)
- Used by: Components, hooks, and Convex functions

**Custom Hooks Layer:**
- Purpose: Encapsulate complex data fetching and computation patterns
- Location: `src/hooks/`
- Contains: `useBudget()`, `useTransactions()`, `usePlatform()` - combine Convex queries with local calculation
- Depends on: Convex hooks, Zustand stores, service layer
- Used by: Components for data access

**Backend (Convex):**
- Purpose: Database, authorization, real-time sync, server functions
- Location: `convex/`
- Contains: Schema definition, query resolvers, mutation handlers, cron jobs
- Depends on: Convex SDK, user context (implicit)
- Used by: Client via auto-generated Convex API (`api.*`)

## Data Flow

**User Creation & Onboarding:**

1. App initializes with device-generated `deviceId`
2. Dashboard screen calls `api.users.createOrGet(deviceId)`
3. Convex creates user if first time, stores in Zustand via `setUserId()`
4. `api.categories.seedDefaults()` populates default category system
5. UI renders dashboard with empty state

**Transaction Entry (Quick Add Flow):**

1. User taps "Expense/Income/Transfer" → `openQuickAdd()` sets UI store state
2. Bottom sheet slides up with multi-step form (amount → category → confirm)
3. On save: `api.transactions.create()` mutation sent to Convex
4. Convex inserts transaction, updates account balance in same mutation
5. `useQuery(api.transactions.list)` re-runs automatically, UI updates in real-time
6. Haptic feedback triggers on success (native platforms)

**Budget Viewing:**

1. User navigates to Budget tab
2. `useBudget()` hook fetches:
   - `api.budgets.getByMonth(userId, month)`
   - `api.categories.listCategories(userId)`
   - `api.transactions.list(userId)` to calculate activity
3. Local hook calculates `calculateReadyToAssign()`, `calculateAvailable()` using service layer
4. CategoryBudget objects composed with targets from `api.targets.list()`
5. Chart components render spending progress

**State Management:**

- **Global app state**: `AppStore` holds userId, currentMonth, selectedAccountId (persistent across screens)
- **Global UI state**: `UIStore` holds modal/sheet open state (transient, view-only)
- **Local component state**: Amount input, form validation, temporary selections
- **Backend state**: Transactions, budgets, accounts (source of truth)
- **Calculated state**: Budget summaries, category totals (computed in hooks via `useMemo()`)

## Key Abstractions

**BudgetEngine (Budget Calculation):**
- Purpose: Zero-based budgeting math - assigns every dollar
- Examples: `src/services/budget-engine/index.ts`
- Pattern: Pure functions (`calculateReadyToAssign()`, `calculateAvailable()`, `calculateAgeOfMoney()`)
- Inputs: transaction history, category targets, prior month rollover
- Outputs: CategoryBudget array with assigned/activity/available per category

**Categorizer Service:**
- Purpose: Auto-detect expense categories from payee name and memo
- Examples: `src/services/categorizer/index.ts`
- Pattern: Rule-based pattern matching + optional ML hints
- Used by: Transaction creation form, payee management

**StorageAdapter:**
- Purpose: Platform-agnostic local storage for sensitive data (API keys, settings)
- Examples: `src/services/storage/index.ts`
- Pattern: Adapter pattern - MMKV on native, in-memory on web
- Uses: `react-native-mmkv` (native) with graceful fallback

**Convex Queries & Mutations:**
- Purpose: Client→Server communication with automatic type generation
- Examples: `convex/users.ts`, `convex/transactions.ts`, `convex/budgets.ts`
- Pattern: Query (read, idempotent) vs Mutation (write), with index hints for performance
- Data isolation: Implicit `userId` context prevents cross-user access

## Entry Points

**RootLayout:**
- Location: `app/_layout.tsx`
- Triggers: App initialization via Expo
- Responsibilities:
  - Initialize Convex client with environment URL
  - Load SpaceMono font
  - Wrap app in ConvexProvider + GestureHandlerRootView
  - Show/hide splash screen on font load
  - Define Stack routes (tabs, modals, detail screens)

**DashboardScreen (Home Tab):**
- Location: `app/(tabs)/index.tsx`
- Triggers: User navigates to home or app starts
- Responsibilities:
  - Initialize user if first launch (calls `createOrGet()`)
  - Fetch account balances, recent transactions
  - Render balance cards, quick action buttons, account/transaction lists
  - Handle pull-to-refresh, error states

**Tab Navigation:**
- Location: `app/(tabs)/_layout.tsx`
- Contains: 6 main tabs (Home, Accounts, Budget, Reports, Transactions, Settings)
- Navigation: File-based routing - each tab is a separate screen

**Modal/Detail Routes:**
- `app/transaction/add.tsx` - Full transaction editor (opened from add button)
- `app/transaction/[id].tsx` - Edit existing transaction
- `app/account/[id].tsx` - Account detail/settings
- `app/budget/[categoryId].tsx` - Category budget detail
- `app/reconcile/index.tsx` - Reconciliation flow
- `app/ai/chat.tsx` - AI assistant interface

## Error Handling

**Strategy:** Reactive error states with user-facing messaging

**Patterns:**

- **Network errors**: Catch in component, set local error state (e.g., `backendError` in DashboardScreen)
- **Mutation failures**: Try-catch in `handleSave()` callbacks, log to console, show toast notification
- **Validation**: Pre-validate in form before mutation (amount > 0, account selected, etc.)
- **Partial failures**: If transaction succeeds but balance update fails, revert via `optimistic update` pattern (not yet fully implemented)
- **Fallback UI**: Empty state cards when data is loading or user has no accounts/transactions

## Cross-Cutting Concerns

**Logging:**
- Simple `console.error()` / `console.log()` throughout
- No centralized logging framework yet
- Error context: Include action name, user ID, data context

**Validation:**
- Form validation: Inline checks before mutation (e.g., `amount === 0`)
- Backend validation: Convex types enforce shape at mutation entry
- Custom validators: Budget availability checks, account type constraints

**Authentication:**
- Device-based: `deviceId` uniquely identifies user (no Clerk auth yet, placeholder exists)
- Multi-tenancy: `userId` filter on all queries prevents data leakage
- No session/token management (Convex handles auth internally)

**Internationalization (i18n):**
- Provider: Custom hook `useI18n()` in `src/lib/i18n/`
- Strings: Separated by locale (`en.ts`, `bn.ts`)
- Scope: Locale preference stored in `AppStore`

**Currency Formatting:**
- All amounts stored in **paisa** (integer cents, smallest BDT unit) in Convex
- Display conversion: `formatCurrency()` converts paisa → BDT string with Tk prefix
- No floating point math - prevents rounding errors

**Data Synchronization:**
- Convex `useQuery()` auto-refreshes when database changes
- No manual polling or websocket management (Convex handles it)
- Optimistic updates: Component state updated locally before server confirm (e.g., quick add animation)

---

*Architecture analysis: 2026-03-25*
