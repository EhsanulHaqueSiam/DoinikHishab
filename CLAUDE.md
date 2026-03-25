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
