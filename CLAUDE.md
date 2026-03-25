# DoinikHishab (দৈনিক হিসাব)

Expo React Native money tracking app with Convex backend, NativeWind styling, and Zustand state management.

## Package Manager

This project uses **Bun** (not npm/yarn). Always use `bun` commands.

```bash
bun install              # Install dependencies
bun add <pkg>            # Add a dependency
bun add -d <pkg>         # Add a dev dependency
bun remove <pkg>         # Remove a dependency
```

## Run Commands

```bash
bun run start            # Start Expo dev server (pick platform from menu)
bun run web              # Start for web directly
bun run android          # Start for Android directly
bun run ios              # Start for iOS directly
bun run start:clear      # Start with fresh Metro cache (use after config changes)
bun run nuke             # Wipe node_modules + .expo + lockfile, reinstall everything
```

## Convex Backend

Convex functions live in `convex/`. The backend requires a running Convex dev server.

```bash
npx convex dev           # Start Convex dev server (run in separate terminal)
npx convex deploy        # Deploy to production
npx convex dashboard     # Open Convex dashboard in browser
```

Environment variables are in `.env.local` (gitignored):
- `CONVEX_DEPLOYMENT` — Convex deployment name
- `EXPO_PUBLIC_CONVEX_URL` — Convex client URL (used in app)
- `EXPO_PUBLIC_CONVEX_SITE_URL` — Convex site URL

## Project Structure

```
app/                     # Expo Router screens & layouts
  (tabs)/                # Tab navigation screens (index, accounts, budget, reports, settings, transactions)
  account/[id].tsx       # Account detail
  budget/[categoryId].tsx # Budget detail
  transaction/[id].tsx   # Transaction detail
  transaction/add.tsx    # Add transaction
  ai/                   # AI features
  reconcile/            # Reconciliation flows
src/
  components/           # React components (ui/, budget/, dashboard/, transaction/, platform/, reports/)
  hooks/                # Custom hooks
  lib/                  # Utilities (crypto, i18n)
  stores/               # Zustand stores (app-store, ui-store)
convex/                 # Backend functions & schema
  schema.ts             # Database schema (22+ tables)
  _generated/           # Auto-generated types (do not edit)
assets/
  fonts/                # SpaceMono-Regular.ttf
  images/               # App icons, splash screens
```

## Path Aliases

Configured in `tsconfig.json`, usable in imports:

- `@/*` → project root
- `@src/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@lib/*` → `./src/lib/*`
- `@stores/*` → `./src/stores/*`
- `@hooks/*` → `./src/hooks/*`

## Build Optimization

Tuned for Intel i7-13700H (20 threads) / 16GB RAM:

- **Metro**: 12 parallel workers, inline requires enabled, scoped file watching (app/, src/, assets/ only)
- **Node heap**: 3GB (`--max-old-space-size=3072`)
- **Gradle** (Android): parallel builds, 8 workers, 3GB daemon heap, build + config cache enabled
- **TypeScript**: incremental compilation, skipLibCheck, isolatedModules
- **Babel**: cached by NODE_ENV, reanimated plugin included

## Styling

Uses **NativeWind v4** (Tailwind CSS for React Native). Styles go in `className` props.

- Config: `tailwind.config.js`
- Global CSS: `global.css`
- Theme: dark-first with teal primary + saffron accent colors
- Do not use dynamic class strings (NativeWind requires static analysis)

## CI/CD — Release Builds on GitHub Actions (100% Free)

Release builds run on GitHub Actions — no EAS Build, no paid services, unlimited builds.

- **Workflow**: `.github/workflows/build.yml`
- **Android**: `expo prebuild` → Gradle build on GitHub runner (APK or AAB)
- **Web**: `expo export --platform web` → static site artifact
- **Convex**: auto-deploys backend on push to master
- **Triggers**: push to main/master, or manual dispatch (choose platform + build type)

**Required secrets** (already configured in GitHub repo):
- `EXPO_PUBLIC_CONVEX_URL` — Convex cloud URL
- `CONVEX_DEPLOY_KEY` — Convex deploy key
- `EXPO_TOKEN` — Expo robot token (for expo prebuild auth)
- `KEYSTORE_BASE64` — Android signing keystore (base64)
- `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` — Keystore credentials

```bash
# Local dev only — never run release builds locally
bun run start             # Dev server
bunx expo export --web    # Quick web export (dev/testing only)

# Release builds happen in CI via GitHub Actions:
# - Android APK/AAB: expo prebuild + Gradle (free, unlimited)
# - Web: expo export (free, unlimited)
# - Convex: auto-deploy on push
```

**Local keystore backup**: `upload.keystore` (gitignored). Keep this safe — it signs all releases.

## Cross-Platform Shadows

Use `shadow()` from `src/lib/platform` instead of raw `shadowColor`/`shadowOffset`/etc. props.
React Native Web deprecated `shadow*` style props — the utility returns `boxShadow` on web and native shadow props on iOS/Android.

```tsx
import { shadow } from "@lib/platform";
// shadow(color, offsetX, offsetY, opacity, radius, elevation?)
<View style={shadow("#0d9488", 0, 4, 0.15, 20, 8)} />
```

## Key Conventions

- Amounts stored in **paisa** (integer cents) in Convex, displayed as BDT
- All Convex tables indexed by `userId` for multi-tenancy
- State management via Zustand (not Context API)
- Navigation via Expo Router (file-based routing)
- TypeScript strict mode enabled
- Web layout constrained to 480px max-width and centered (see `WebContainer` in `app/_layout.tsx`)

<!-- GSD:project-start source:PROJECT.md -->
## Project

**DoinikHishab (দৈনিক হিসাব)**

A personal money tracking app for Bangladeshis that mashes YNAB's envelope budgeting ideology with Monarch Money's feature completeness. Designed for solo users who manually enter transactions (no bank sync in Bangladesh). The primary differentiator is a 3-tap transaction entry flow and YNAB's "give every taka a job" philosophy adapted for the Bangladesh market — Eid funds, school fees, wedding gifts, medical reserves.

**Core Value:** **3-tap manual transaction entry with envelope budgeting that changes how Bangladeshi users think about money.** If the input is fast and the budget view makes users feel in control, everything else is secondary.

### Constraints

- **Tech stack**: Expo + React Native + Convex — locked, no switching
- **Package manager**: Bun — not npm/yarn
- **Styling**: NativeWind (Tailwind CSS for RN) — upgrading to v5
- **No bank sync**: All transactions manual — input speed is critical
- **Convex offline**: Backend disabled until next month — develop UI/UX without live data
- **Budget**: Free tier everything — no paid services
- **Device**: Mobile-first, web secondary — most users on Android phones
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript ~5.9.2 - All frontend and backend code
- JavaScript (via Expo/React Native) - Runtime execution
- Kotlin 2.1.0 - Android native layer (via Gradle)
- Swift/Objective-C - iOS native layer (deployment target 15.1)
- CSS (Tailwind) - Styling via NativeWind
## Runtime
- Node.js (via Bun package manager) - Development and Convex backend runtime
- Expo SDK 55.0.6 - Cross-platform mobile/web runtime
- React Native 0.83.2 - iOS/Android/Web native bridge
- React 19.2.0 - Component framework
- Bun (not npm/yarn) - Primary package manager for this project
- Lockfile: `bun.lockb` (binary lock file)
## Frameworks
- Expo Router ~55.0.5 - File-based routing (app/ directory structure)
- Expo CLI - Build and development for iOS/Android/Web
- React Native - Cross-platform native components
- React Native Web ~0.21.0 - React Native components on web (Metro bundler)
- Zustand ^5.0.11 - Client-side state store (`@stores/*`)
- Expo Router - Nested routing with typed routes
- React Navigation Native ^7.1.28 - Navigation primitive (used by Expo Router)
- React Native Gesture Handler ^2.30.0 - Gesture detection for navigation
- React Native Reanimated 4.2.1 - Worklet-based animations
- React Native Worklets 0.7.2 - Worklet execution runtime
- @Gorhom/Bottom Sheet ^5.2.8 - Animated modal sheet component
- @Shopify/Flash List ^2.3.0 - Optimized list component (RecyclerView replacement)
- Lucide React Native ^0.577.0 - Icon library
- Sonner Native ^0.23.1 - Toast notifications
- NativeWind v4.2.2 - Tailwind CSS for React Native
- Tailwind CSS ^3.4.17 - Utility-first CSS framework
- React Native Safe Area Context ~5.6.2 - Safe area padding for notches
- React Native Screens ~4.23.0 - Native screen stacks
- React Native SVG 15.15.3 - SVG rendering support
- Convex ^1.32.0 - Backend-as-a-service with real-time DB
- No test framework configured (not detected)
- No linting/formatting tooling configured (Prettier/ESLint not found)
- Expo Build Properties - Android SDK/Kotlin version configuration
- Babel ~7.x (via babel-preset-expo) - JSX transpilation
- TypeScript - Incremental compilation with skipLibCheck enabled
- Metro Bundler - JavaScript bundler (configured via Expo)
## Key Dependencies
- `convex` ^1.32.0 - Entire backend, database, real-time sync
- `react-native-mmkv` ^4.2.0 - Fast encrypted local storage on native platforms
- `expo-constants` ~55.0.7 - Access to app constants and manifest
- `expo-linking` ~55.0.7 - Deep linking and URL handling
- `expo-document-picker` ~55.0.8 - File import dialog (for CSV/transaction imports)
- `expo-font` ~55.0.4 - Custom font loading (SpaceMono-Regular.ttf)
- `expo-splash-screen` ~55.0.10 - Splash screen lifecycle
- `expo-status-bar` ~55.0.4 - Status bar styling per platform
- `expo-symbols` ~55.0.5 - SF Symbols on iOS
- `expo-web-browser` ~55.0.9 - Open URLs in system browser
- `expo-haptics` ~55.0.8 - Haptic feedback (vibration)
## Configuration
- `.env.local` - Contains Convex deployment credentials (gitignored)
- `tsconfig.json` - TypeScript strict mode, path aliases (`@/*`, `@src/*`, `@components/*`, `@lib/*`, `@stores/*`, `@hooks/*`)
- `babel.config.js` - Preset: `babel-preset-expo`, Plugin: `react-native-reanimated/plugin`
- `tailwind.config.js` - NativeWind preset, dark-first theme, teal primary, saffron accent
- `app.json` - Expo config with platform-specific settings:
- `eas.json` - EAS Build configuration for development/preview/production
- `package.json` scripts configured with `NODE_OPTIONS='--max-old-space-size=3072 --expose-gc'`
## Platform Requirements
- Node.js (via Bun) - Not version-pinned, check Bun for Node requirement
- Bun package manager - Required for install/add/remove operations
- macOS or Linux - For iOS/Android development
- Xcode (iOS) - Minimum deployment target 15.1
- Android SDK - Min SDK 24, Target SDK 35, Compile SDK 36, Kotlin 2.1.0
- Metro CLI - Included via Expo
- Expo Application Services (EAS) - Build and submission
- Convex deployment - Backend hosting
- Android Play Store - apk/app-bundle via EAS
- iOS TestFlight/App Store - Via EAS (certificate/provisioning profile required)
- Google Play Services credentials - `google-services-key.json` (referenced in eas.json)
## Build Optimizations
- 12 parallel workers
- Inline requires enabled
- Scoped file watching: `app/`, `src/`, `assets/` only
- Node heap: 3GB (`--max-old-space-size=3072`)
- Incremental compilation enabled
- Build cache: `.tsbuildinfo` in `node_modules/.cache/`
- `skipLibCheck` enabled (faster builds)
- `isolatedModules` enabled (ES modules)
- Parallel builds with 8 workers
- 3GB daemon heap
- Build cache enabled
- Configuration cache enabled
- Proguard + resource shrinking in release builds
- `pickFirst` conflict resolution for `libc++_shared.so`
- Environment-based caching (`NODE_ENV`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- PascalCase for component files: `BalanceCard.tsx`, `QuickAdd.tsx`, `Button.tsx`
- camelCase for utility/hook/store files: `currency.ts`, `use-transactions.ts`, `app-store.ts`
- Use hyphens in file names for kebab-case modules: `use-platform.ts`, `budget-engine/index.ts`
- Index exports in directories: `src/services/budget-engine/index.ts`, `src/lib/i18n/index.ts`
- camelCase for all functions: `calculateReadyToAssign()`, `paisaToTaka()`, `getNestedValue()`
- Handler functions use `handle` prefix: `handleSave()`, `handleCategorySelect()`, `handleClose()`
- Getter functions use `get` prefix: `getCategoryInfo()`, `getAccountName()`, `getInitialMonth()`
- Custom hooks use `use` prefix: `useAppStore()`, `useBudget()`, `useFilteredTransactions()`
- camelCase for local variables: `userId`, `currentMonth`, `selectedCategory`, `defaultAccount`
- UPPER_SNAKE_CASE for constants: `ACCOUNT_ICON`, `TYPE_COLORS`, `TAKA_SYMBOL`
- Boolean variables use `is` prefix: `isQuickAddOpen`, `isClosed`, `isDefault`, `isCleared`
- Ref names use `Ref` suffix: `bottomSheetRef`, `inflowRef`
- PascalCase for interfaces and types: `AppState`, `ButtonProps`, `BudgetSummary`, `TransactionFilters`
- Suffix component props with `Props`: `ButtonProps`, `BalanceCardProps`, `InputProps`
- Use `Record<K, V>` for object maps: `Record<string, string>`, `Record<string, CategoryBudget>`
- Suffix component state types with `State`: `AppState`, `UIState`
## Code Style
- No dedicated formatter config found (ESLint/Prettier not present)
- Babylon implicit formatting observed in source
- 2-space indentation used throughout
- Lines generally under 100 characters
- Consistent semicolon usage
- No `.eslintrc` or linter configuration detected
- Project uses TypeScript strict mode for type safety
- Type annotations required on function parameters and return values
## Import Organization
- `@/*` → Project root (rarely used, relative imports preferred)
- `@src/*` → `./src/*` (for absolute imports from src)
- `@components/*` → `./src/components/*`
- `@lib/*` → `./src/lib/*`
- `@stores/*` → `./src/stores/*`
- `@hooks/*` → `./src/hooks/*`
- Relative imports are heavily preferred over aliases throughout codebase
- Multiple imports from same source on one line: `import { useQuery, useMutation } from "convex/react"`
- Separate lines for type imports: `import type { Id, Doc } from "../../convex/_generated/dataModel"`
## Error Handling
- Try-catch blocks used sparingly, only around async operations
- Location: `src/components/transaction/QuickAdd.tsx` — wraps transaction creation
- Generic catch pattern: `catch (error)` then `console.error()`
- Silent failures acceptable in secondary operations: `try { Haptics... } catch {}`
- Convex mutations auto-throw; errors caught at component level
- Error messages displayed via UI state or console only (no global error boundary detected)
- UI Component error display: `Input` component shows error text below field (`error` prop)
- Component-level error handling for user interactions
- Database errors caught after mutations
- Validation failures handled silently or via UI feedback
- No centralized error logging or monitoring
## Logging
- Minimal logging observed
- Only critical failures logged: `console.error("Failed to save transaction:", error)`
- No info/debug/warn levels used
- No structured logging (no logger utility)
- Convex backend errors caught and displayed as user-facing messages in app store state
## Comments
- Comments used for high-level context at function/module level
- JSDoc-style comments on utility functions explaining behavior
- Inline comments rare; code is expected to be self-documenting
- Used in utility modules: `src/lib/currency.ts` has block comment explaining "All amounts stored as paisa (integer)"
- Used in service modules: `src/services/budget-engine/index.ts` explains "Zero-based budgeting engine"
- Component comments rare; props self-documented through TypeScript interfaces
- Convex handlers have no JSDoc; documentation in query/mutation arg definitions via convex/values
## Function Design
- Typed parameters required: no implicit `any` types
- Destructure complex params into interfaces: `({ userId, currentMonth }: Props)`
- Optional params use `?` suffix: `accountId?: Id<"accounts">`, `filters?: TransactionFilters`
- Callbacks use arrow functions: `const handleSave = useCallback(async () => { ... }, [deps])`
- Explicit return types on exported functions: `function useFilteredTransactions(...): Txn[]`
- Hooks return objects when multiple values needed: `return { summary, budgets, categories, groups }`
- Component render returns JSX directly, no wrapper objects
## Module Design
- Named exports preferred: `export function Button() {}`, `export const useAppStore = create<AppState>()`
- Mix of default and named: `export default function DashboardScreen()` in route files
- Barrel files used in component directories: `src/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx` imported individually
- Store exports as named const: `export const useAppStore = create(...)`
- Used implicitly in `src/components/*/index.ts` pattern (not found explicitly, but structure suggests one-component-per-file)
- No central `src/index.ts` barrel observed
- Services exported via index: `src/services/budget-engine/index.ts` exports all functions
## Type Patterns
- TypeScript strict mode enabled in `tsconfig.json`
- All function parameters fully typed
- No implicit `any` type usage
- Types imported from `convex/_generated/dataModel`: `import type { Id, Doc } from "..."`
- `Id<"users">` pattern for type-safe foreign keys
- `Doc<"transactions">` pattern for full document types (rarely used, any pattern used instead)
- Validator imports from `convex/values`: `import { v } from "convex/values"`
- Used for enums: `type Step = "amount" | "category" | "confirm"`
- Used for variants: `variant?: "default" | "secondary" | "outline" | "ghost" | "danger"`
- Convex unions: `v.union(v.literal("expense"), v.literal("income"), v.literal("transfer"))`
- Interface optional fields use `?`: `categoryId?: Id<"categories">`
- Convex optional fields use `v.optional()`: `v.optional(v.id("accounts"))`
- Nullability: Fields can be `null` or undefined interchangeably, not always explicit
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **Multi-tenancy by design** - All Convex tables indexed by `userId`
- **Zero-based budgeting core** - YNAB-style budget engine with "every taka gets a job" philosophy
- **Real-time sync** - Convex provides live query subscriptions for instant UI updates
- **Offline-first storage** - MMKV (native) / memory (web) for settings and sensitive data
- **Type-safe end-to-end** - TypeScript everywhere, auto-generated Convex types
## Layers
- Purpose: Screen layouts, navigation, user interaction
- Location: `app/` (Expo Router file-based routing), `src/components/`
- Contains: Screens, bottom sheets, modals, forms, charts
- Depends on: Zustand stores, Convex hooks (`useQuery`, `useMutation`), component library (NativeWind)
- Used by: Direct user interaction, triggered by navigation
- Purpose: Client-side application state (user context, UI modals, preferences)
- Location: `src/stores/app-store.ts`, `src/stores/ui-store.ts`
- Contains: Global app state (userId, currentMonth, locale, theme) and UI state (modal open/close)
- Depends on: Nothing (pure state)
- Used by: All screens and components via `useAppStore()`, `useUIStore()`
- Purpose: Domain-specific business logic, calculations, storage adapters
- Location: `src/services/` (budget-engine, categorizer, suggestions, storage), `src/lib/` (utilities)
- Contains: Budget calculations, category auto-detection, data serialization, crypto, i18n, date/currency formatting
- Depends on: Convex types, React hooks (where applicable)
- Used by: Components, hooks, and Convex functions
- Purpose: Encapsulate complex data fetching and computation patterns
- Location: `src/hooks/`
- Contains: `useBudget()`, `useTransactions()`, `usePlatform()` - combine Convex queries with local calculation
- Depends on: Convex hooks, Zustand stores, service layer
- Used by: Components for data access
- Purpose: Database, authorization, real-time sync, server functions
- Location: `convex/`
- Contains: Schema definition, query resolvers, mutation handlers, cron jobs
- Depends on: Convex SDK, user context (implicit)
- Used by: Client via auto-generated Convex API (`api.*`)
## Data Flow
- **Global app state**: `AppStore` holds userId, currentMonth, selectedAccountId (persistent across screens)
- **Global UI state**: `UIStore` holds modal/sheet open state (transient, view-only)
- **Local component state**: Amount input, form validation, temporary selections
- **Backend state**: Transactions, budgets, accounts (source of truth)
- **Calculated state**: Budget summaries, category totals (computed in hooks via `useMemo()`)
## Key Abstractions
- Purpose: Zero-based budgeting math - assigns every dollar
- Examples: `src/services/budget-engine/index.ts`
- Pattern: Pure functions (`calculateReadyToAssign()`, `calculateAvailable()`, `calculateAgeOfMoney()`)
- Inputs: transaction history, category targets, prior month rollover
- Outputs: CategoryBudget array with assigned/activity/available per category
- Purpose: Auto-detect expense categories from payee name and memo
- Examples: `src/services/categorizer/index.ts`
- Pattern: Rule-based pattern matching + optional ML hints
- Used by: Transaction creation form, payee management
- Purpose: Platform-agnostic local storage for sensitive data (API keys, settings)
- Examples: `src/services/storage/index.ts`
- Pattern: Adapter pattern - MMKV on native, in-memory on web
- Uses: `react-native-mmkv` (native) with graceful fallback
- Purpose: Client→Server communication with automatic type generation
- Examples: `convex/users.ts`, `convex/transactions.ts`, `convex/budgets.ts`
- Pattern: Query (read, idempotent) vs Mutation (write), with index hints for performance
- Data isolation: Implicit `userId` context prevents cross-user access
## Entry Points
- Location: `app/_layout.tsx`
- Triggers: App initialization via Expo
- Responsibilities:
- Location: `app/(tabs)/index.tsx`
- Triggers: User navigates to home or app starts
- Responsibilities:
- Location: `app/(tabs)/_layout.tsx`
- Contains: 6 main tabs (Home, Accounts, Budget, Reports, Transactions, Settings)
- Navigation: File-based routing - each tab is a separate screen
- `app/transaction/add.tsx` - Full transaction editor (opened from add button)
- `app/transaction/[id].tsx` - Edit existing transaction
- `app/account/[id].tsx` - Account detail/settings
- `app/budget/[categoryId].tsx` - Category budget detail
- `app/reconcile/index.tsx` - Reconciliation flow
- `app/ai/chat.tsx` - AI assistant interface
## Error Handling
- **Network errors**: Catch in component, set local error state (e.g., `backendError` in DashboardScreen)
- **Mutation failures**: Try-catch in `handleSave()` callbacks, log to console, show toast notification
- **Validation**: Pre-validate in form before mutation (amount > 0, account selected, etc.)
- **Partial failures**: If transaction succeeds but balance update fails, revert via `optimistic update` pattern (not yet fully implemented)
- **Fallback UI**: Empty state cards when data is loading or user has no accounts/transactions
## Cross-Cutting Concerns
- Simple `console.error()` / `console.log()` throughout
- No centralized logging framework yet
- Error context: Include action name, user ID, data context
- Form validation: Inline checks before mutation (e.g., `amount === 0`)
- Backend validation: Convex types enforce shape at mutation entry
- Custom validators: Budget availability checks, account type constraints
- Device-based: `deviceId` uniquely identifies user (no Clerk auth yet, placeholder exists)
- Multi-tenancy: `userId` filter on all queries prevents data leakage
- No session/token management (Convex handles auth internally)
- Provider: Custom hook `useI18n()` in `src/lib/i18n/`
- Strings: Separated by locale (`en.ts`, `bn.ts`)
- Scope: Locale preference stored in `AppStore`
- All amounts stored in **paisa** (integer cents, smallest BDT unit) in Convex
- Display conversion: `formatCurrency()` converts paisa → BDT string with Tk prefix
- No floating point math - prevents rounding errors
- Convex `useQuery()` auto-refreshes when database changes
- No manual polling or websocket management (Convex handles it)
- Optimistic updates: Component state updated locally before server confirm (e.g., quick add animation)
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
