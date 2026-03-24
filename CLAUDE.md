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

## Key Conventions

- Amounts stored in **paisa** (integer cents) in Convex, displayed as BDT
- All Convex tables indexed by `userId` for multi-tenancy
- State management via Zustand (not Context API)
- Navigation via Expo Router (file-based routing)
- TypeScript strict mode enabled
