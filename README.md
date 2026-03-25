# DoinikHishab (দৈনিক হিসাব)

A personal money tracking app for Bangladeshis. Track daily expenses, manage budgets, and monitor net worth — all in BDT.

Built with Expo, React Native, Convex, NativeWind, and Zustand. Runs on Android, iOS, and Web.

## Features

- **Dashboard** — Total balance, budget vs tracking accounts, recent transactions
- **Transactions** — Add expenses, income, and transfers with categories and flags
- **Budget** — YNAB-style envelope budgeting with monthly assignment and goal tracking
- **Accounts** — Cash, bank, credit card, loan, and asset accounts
- **Reports** — Spending by category, income vs expense, and net worth
- **Multi-language** — English and Bengali (বাংলা)
- **AI features** — AI-powered transaction insights (configurable provider)
- **Import/Export** — CSV import and data export
- **Reconciliation** — Bank statement matching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) (SDK 55) + [React Native](https://reactnative.dev) 0.83 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Backend | [Convex](https://convex.dev) (real-time sync, 22+ tables) |
| Styling | [NativeWind](https://nativewind.dev) v4 (Tailwind CSS for RN) |
| State | [Zustand](https://zustand.docs.pmnd.rs/) |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| CI/CD | GitHub Actions (100% free, unlimited builds) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (package manager)
- [Node.js](https://nodejs.org) 20+
- A [Convex](https://convex.dev) account (free tier)

### Setup

```bash
# Clone and install
git clone https://github.com/EhsanulHaqueSiam/DoinikHishab.git
cd DoinikHishab
bun install

# Create .env.local with your Convex credentials
cat > .env.local << EOF
CONVEX_DEPLOYMENT=your-deployment-name
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EOF

# Start Convex dev server (separate terminal)
npx convex dev

# Start the app
bun run start        # Choose platform from menu
bun run android      # Android directly
bun run ios          # iOS directly
bun run web          # Web directly
```

### Other Commands

```bash
bun run start:clear  # Start with fresh Metro cache
bun run nuke         # Full clean reinstall
```

## Project Structure

```
app/                     # Expo Router screens & layouts
  (tabs)/                #   Tab screens: dashboard, transactions, budget, accounts, reports, settings
  account/[id].tsx       #   Account detail
  budget/[categoryId].tsx#   Budget category detail
  transaction/           #   Add, view, import transactions
  ai/                    #   AI chat & settings
  reconcile/             #   Bank reconciliation
src/
  components/            # React components
    ui/                  #   Button, Card, Badge, Input
    dashboard/           #   BalanceCard, SpendingChart
    transaction/         #   TransactionCard, AmountPad, QuickAdd, CategoryGrid
    budget/              #   BudgetRow, AssignMoney, GoalProgress
    reports/             #   Charts
    platform/            #   FAB, TabBar
  hooks/                 # Custom hooks
  lib/                   # Utilities (currency, date, i18n, crypto, platform)
  stores/                # Zustand stores (app-store, ui-store)
convex/                  # Backend functions & schema
assets/                  # Fonts, icons, splash screens
```

## CI/CD

Builds run on GitHub Actions — **100% free**, no EAS Build, unlimited.

| Job | What it does |
|-----|-------------|
| `typecheck` | TypeScript validation |
| `convex-deploy` | Deploys Convex backend (on push) |
| `web` | Static web export → artifact |
| `android` | `expo prebuild` + Gradle → signed APK/AAB |

Trigger manually from the **Actions** tab to choose platform and build type (APK/AAB).

## Design

Dark-first theme inspired by Bangladesh:
- **Primary**: Deep teal (BD rivers at twilight)
- **Accent**: Warm saffron (BD sunset gold)
- **Surfaces**: Midnight indigo depths
- **Font**: SpaceMono

## License

This project is for personal use.
