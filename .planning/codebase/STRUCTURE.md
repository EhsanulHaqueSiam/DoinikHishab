# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
DoinikHishab/
├── app/                              # Expo Router screens (file-based routing)
│   ├── (tabs)/                       # Tabbed navigation layout
│   │   ├── _layout.tsx               # Tab bar configuration
│   │   ├── index.tsx                 # Dashboard home screen
│   │   ├── accounts.tsx              # Accounts list
│   │   ├── budget.tsx                # Budget overview
│   │   ├── reports.tsx               # Reports & analytics
│   │   ├── transactions.tsx          # Transactions list
│   │   └── settings.tsx              # User settings
│   ├── account/[id].tsx              # Account detail screen (detail route)
│   ├── budget/[categoryId].tsx       # Budget category detail
│   ├── transaction/                  # Transaction workflows
│   │   ├── add.tsx                   # Full transaction editor (modal)
│   │   ├── [id].tsx                  # Edit transaction detail
│   │   └── import.tsx                # CSV/OFX import flow (modal)
│   ├── reconcile/                    # Bank reconciliation
│   │   ├── index.tsx                 # Start reconciliation (modal)
│   │   └── review.tsx                # Review & confirm reconciliation
│   ├── ai/                           # AI assistant features
│   │   ├── chat.tsx                  # Chat interface
│   │   └── settings.tsx              # AI config/model selection
│   ├── _layout.tsx                   # Root layout (Convex + navigation setup)
│   └── +not-found.tsx                # 404 screen
│
├── src/                              # Shared application logic
│   ├── components/                   # Reusable React components
│   │   ├── ui/                       # Primitive components
│   │   │   ├── Button.tsx            # Styled button component
│   │   │   ├── Card.tsx              # Card container
│   │   │   ├── Input.tsx             # Text input field
│   │   │   └── Badge.tsx             # Status/label badge
│   │   ├── transaction/              # Transaction-specific components
│   │   │   ├── TransactionCard.tsx   # Single transaction display
│   │   │   ├── TransactionList.tsx   # Multiple transactions
│   │   │   ├── QuickAdd.tsx          # Bottom sheet quick-add form
│   │   │   ├── AmountPad.tsx         # Numeric keypad widget
│   │   │   └── CategoryGrid.tsx      # Category selection grid
│   │   ├── budget/                   # Budget display components
│   │   │   ├── BudgetRow.tsx         # Single category budget row
│   │   │   ├── AssignMoney.tsx       # Budget assignment interface
│   │   │   └── GoalProgress.tsx      # Target progress indicator
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── BalanceCard.tsx       # Net worth / balance display
│   │   │   ├── QuickChips.tsx        # Quick action buttons
│   │   │   └── SpendingChart.tsx     # Summary chart
│   │   ├── reports/                  # Report/analytics components
│   │   │   ├── IncomeExpenseChart.tsx # Spending trends
│   │   │   ├── SpendingChart.tsx     # Category breakdown
│   │   │   └── NetWorthChart.tsx     # Asset/liability trends
│   │   └── platform/                 # Platform-specific UI
│   │       ├── FAB.tsx               # Floating action button
│   │       ├── TabBar.tsx            # Custom tab bar
│   │       └── SafeArea.tsx          # Safe area wrapper (if used)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-budget.ts             # Budget data + calculations
│   │   ├── use-transactions.ts       # Transaction queries + filters
│   │   ├── use-platform.ts           # Platform detection utilities
│   │   └── use-reconciliation.ts     # Reconciliation workflow (if exists)
│   │
│   ├── stores/                       # Zustand state stores
│   │   ├── app-store.ts              # Global app state (userId, currentMonth, locale)
│   │   └── ui-store.ts               # Global UI state (modals, forms)
│   │
│   ├── services/                     # Domain-specific business logic
│   │   ├── budget-engine/            # Zero-based budgeting calculations
│   │   │   └── index.ts              # Budget math functions
│   │   ├── categorizer/              # Transaction category auto-detection
│   │   │   └── index.ts              # Pattern matching & ML hints
│   │   ├── suggestions/              # Payee/category suggestions
│   │   │   └── index.ts              # Suggestion engine
│   │   └── storage/                  # Platform-agnostic local storage
│   │       └── index.ts              # MMKV (native) / memory (web) adapter
│   │
│   └── lib/                          # Utilities & helpers
│       ├── currency.ts               # formatCurrency(), parseAmount()
│       ├── date.ts                   # today(), parseDate(), dateRange()
│       ├── constants.ts              # App-wide constants (colors, sizes)
│       ├── crypto.ts                 # Encryption for API keys
│       ├── platform.ts               # Platform detection, shadows, spacing
│       └── i18n/                     # Internationalization
│           ├── index.ts              # useI18n() hook
│           ├── en.ts                 # English strings
│           └── bn.ts                 # Bengali strings
│
├── convex/                           # Backend (Convex serverless database)
│   ├── schema.ts                     # Database schema (22+ tables)
│   ├── _generated/                   # Auto-generated types (DO NOT EDIT)
│   │   └── api.ts                    # Type-safe API client
│   ├── users.ts                      # User queries & mutations
│   ├── accounts.ts                   # Account CRUD + balance calculations
│   ├── transactions.ts               # Transaction CRUD + listing
│   ├── categories.ts                 # Category CRUD + grouping
│   ├── budgets.ts                    # Budget allocation & targets
│   ├── targets.ts                    # Savings goals
│   ├── payees.ts                     # Payee management
│   ├── scheduled.ts                  # Recurring transaction scheduling
│   ├── reconciliation.ts             # Bank reconciliation
│   ├── reports.ts                    # Analytics & reporting queries
│   ├── crons.ts                      # Scheduled jobs (process scheduled transactions)
│   └── ai/                           # AI integration (Anthropic, OpenAI, etc.)
│       └── chat.ts                   # Conversation & suggestions
│
├── assets/                           # Static assets
│   ├── images/                       # App icons, splash screens, logos
│   │   ├── icon.png                  # App icon (1024x1024)
│   │   ├── splash-icon.png           # Splash screen icon
│   │   ├── favicon.png               # Web favicon
│   │   ├── android-icon-foreground.png
│   │   ├── android-icon-background.png
│   │   └── android-icon-monochrome.png
│   └── fonts/                        # Custom fonts
│       └── SpaceMono-Regular.ttf     # Primary monospace font
│
├── plugins/                          # Expo config plugins
│   └── withHighRefreshRate.js        # Enable 120fps+ display (Android/iOS)
│
├── .github/                          # GitHub workflows & CI/CD
│   └── workflows/                    # GitHub Actions
│
├── .planning/                        # GSD planning documents
│   └── codebase/                     # Codebase analysis (ARCHITECTURE.md, STRUCTURE.md, etc.)
│
├── dist/                             # Build output (web)
│
├── .env.local                        # Environment variables (gitignored)
├── app.json                          # Expo configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts (uses Bun)
├── bun.lockb                         # Bun lock file
├── tailwind.config.js                # NativeWind (Tailwind) configuration
├── global.css                        # Global CSS (NativeWind imports)
├── metro.config.js                   # Metro bundler configuration (if exists)
└── babel.config.js                   # Babel configuration (Reanimated plugin)
```

## Directory Purposes

**`app/` - Screens & Navigation:**
- Purpose: Top-level screen definitions with Expo Router file-based routing
- Contains: Screen components, modal overlays, detail pages
- Key structure: `(tabs)/` is layout group, `[id]` are dynamic routes, uppercase folders are route segments
- Navigation: Expo Router automatically generates routes from file structure

**`src/components/` - Reusable Components:**
- Purpose: Shared UI components organized by domain (transaction, budget, dashboard, etc.)
- Contains: React components using NativeWind for styling
- `ui/` - Primitive components (Button, Card, Input, Badge) used everywhere
- Domain folders - Feature-specific components that combine primitives
- Pattern: Components are presentational, state is lifted to screens or hooks

**`src/hooks/` - Custom Hooks:**
- Purpose: Encapsulate data fetching and complex logic patterns
- Contains: Custom hooks that combine `useQuery()`, `useMutation()`, Zustand stores, and service layer
- Pattern: Each hook returns computed data + handlers (e.g., `useBudget()` returns summary + mutate functions)
- Used: By screens and complex components to avoid data-fetching boilerplate

**`src/stores/` - Global State:**
- Purpose: Zustand stores for application-level state
- `app-store.ts` - User context (userId, currentMonth, locale)
- `ui-store.ts` - UI state (modal/sheet visibility, editing state)
- Pattern: Stores are singleton, subscribe to get updated state
- Usage: Via hooks `useAppStore()`, `useUIStore()` in any component

**`src/services/` - Business Logic:**
- Purpose: Domain-specific logic isolated from UI
- `budget-engine/` - Pure functions for YNAB-style budgeting calculations
- `categorizer/` - Rule-based category auto-detection
- `storage/` - Platform-agnostic storage adapter (MMKV/memory)
- Pattern: Services are stateless, testable, reusable

**`src/lib/` - Utilities:**
- Purpose: Helper functions and constants
- `currency.ts` - Formatting amounts in paisa ↔ BDT
- `date.ts` - Date parsing, formatting, range calculations
- `i18n/` - Translation strings and locale management
- `platform.ts` - Platform detection, styling utilities
- `crypto.ts` - Encryption for storing API keys locally

**`convex/` - Backend:**
- Purpose: Database schema and server-side logic
- `schema.ts` - Defines 22+ tables (users, transactions, budgets, etc.)
- `*.ts` files - Query/mutation handlers for each domain
- `_generated/` - Auto-generated TypeScript types (never edit manually)
- Pattern: All queries/mutations indexed by `userId` for multi-tenancy

**`assets/` - Static Resources:**
- Purpose: Images, icons, fonts bundled with app
- `images/` - Icons and splash screens (multiple sizes for iOS/Android/web)
- `fonts/` - Custom typography (SpaceMono for consistency)

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout, initializes Convex client, defines Stack routes
- `app/(tabs)/_layout.tsx`: Tab navigation layout and configuration
- `app/(tabs)/index.tsx`: Dashboard home screen (main entry after onboarding)

**Configuration:**
- `app.json`: Expo app metadata, plugins, platform-specific config
- `tsconfig.json`: TypeScript strict mode, path aliases (@/*), incremental compilation
- `tailwind.config.js`: NativeWind theme (dark-first, teal primary, saffron accent)
- `.env.local`: Convex URLs (EXPO_PUBLIC_CONVEX_URL, CONVEX_DEPLOYMENT)

**Core Logic:**
- `convex/schema.ts`: Database schema - source of truth for data shape
- `src/services/budget-engine/index.ts`: Budget calculation functions (calculateReadyToAssign, etc.)
- `src/stores/app-store.ts`: Global app state (userId, currentMonth, selectedAccountId)
- `src/stores/ui-store.ts`: Global UI state (modal visibility, editing state)

**Testing:**
- No test files present in codebase (testing not yet implemented)

**Special Directories:**
- `.expo/` - Generated by Expo (gitignored, dev cache)
- `node_modules/` - Dependencies (gitignored, installed via `bun install`)
- `dist/` - Web build output (gitignored)
- `android/`, `ios/` - Native build artifacts (gitignored)
- `.planning/codebase/` - GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)

## Naming Conventions

**Files:**
- `.tsx` - React components (screens, components)
- `.ts` - Pure TypeScript (services, utilities, stores, API handlers)
- Lowercase with dash: `use-budget.ts`, `quick-add.tsx` (hooks and UI components)
- Uppercase with dash: `GSD.md` (documentation)
- Schema/config: camelCase (`app.json`, `tsconfig.json`, `tailwind.config.js`)

**Directories:**
- Lowercase with no separator: `components`, `services`, `convex` (domain folders)
- Parentheses for route groups: `(tabs)`, `(auth)` (Expo Router convention)
- Square brackets for dynamic params: `[id].tsx` (Expo Router convention)
- Feature-based: `dashboard/`, `budget/`, `transaction/` (components organized by feature)

**Functions & Exports:**
- PascalCase: `DashboardScreen()`, `QuickAdd()`, `BalanceCard()` (React components)
- camelCase: `useAppStore()`, `useBudget()`, `formatCurrency()` (hooks, utilities, functions)
- CONSTANT_CASE: `ACCOUNT_ICON = {...}`, constants in files
- Export convention: One default export per `.tsx` file (screen or component), named exports for utilities

**Types:**
- PascalCase: `AppState`, `UIState`, `BudgetSummary`, `CategoryBudget` (interfaces/types)
- Prefix with `I` for interfaces (optional, mostly prefer `interface` over `type`)
- Generic type param names: `T`, `K`, `V` (standard)

## Where to Add New Code

**New Feature (e.g., "Expense Tags"):**
- Main code: `app/tags/[id].tsx` (new route) + `src/components/transaction/TagPicker.tsx` (new component)
- Service logic: `src/services/tagger/index.ts` (if complex)
- Hook: `src/hooks/use-tags.ts` (if data fetching needed)
- Backend: `convex/tags.ts` (new table + queries/mutations)
- Schema: Add `tags` and `transactionTags` tables to `convex/schema.ts`

**New Component/Module:**
- Primitive UI component: `src/components/ui/NewComponent.tsx`
- Feature component: `src/components/{feature}/NewComponent.tsx` (e.g., `dashboard/`, `transaction/`)
- Page/screen: `app/{feature}/index.tsx` or `app/{feature}/[id].tsx` for detail page

**Utilities & Helpers:**
- Formatting/parsing: `src/lib/newutil.ts` (e.g., `phone.ts`, `validation.ts`)
- Domain services: `src/services/{domain}/index.ts`
- Custom hooks: `src/hooks/use-{feature}.ts`
- Constants: Add to `src/lib/constants.ts` or create `src/constants/{domain}.ts`

**Backend Functions:**
- Domain queries/mutations: Create or extend `convex/{domain}.ts`
- Complex logic: Extract to `convex/lib/{domain}.ts` for reuse across handlers
- Cron jobs: Add to `convex/crons.ts` or create `convex/jobs/{name}.ts`

## Special Directories

**`.expo/` - Expo Cache:**
- Generated automatically by Expo CLI
- Contains: Cached bundle, tunnel info, etc.
- Gitignored: Yes
- Committed: No
- Action on problems: Delete and let Expo rebuild

**`dist/` - Web Build:**
- Generated by Metro bundler for web
- Contains: Bundled JS, HTML, assets
- Gitignored: Yes
- Committed: No
- Regenerate: Run `bun run web`

**`.planning/codebase/` - GSD Analysis:**
- Generated by GSD orchestrator
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, etc.
- Gitignored: No (committed for team reference)
- Committed: Yes (reference documents)

**`convex/_generated/` - Auto-Generated:**
- Generated by Convex CLI after schema changes
- Contains: `api.ts` (type-safe client), types from `schema.ts`
- Gitignored: No (must commit for TS types)
- Committed: Yes
- Action: Never edit manually - regenerate via `npx convex dev`

**`node_modules/` - Dependencies:**
- Installed by `bun install`
- Gitignored: Yes
- Committed: No
- Regenerate: Run `bun install` or `bun run nuke` (full reset)

---

*Structure analysis: 2026-03-25*
