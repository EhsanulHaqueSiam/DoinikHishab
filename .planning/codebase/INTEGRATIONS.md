# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**AI Services (User-Configurable):**
- Multiple providers supported via encrypted API keys stored locally
  - Anthropic (Claude)
  - Google (Gemini)
  - OpenAI
  - xAI
  - OpenRouter
  - Implementation: `convex/ai/router.ts`, `convex/ai/categorize.ts`
  - Schema: `convex/schema.ts` → `aiConfig` table (per-user encrypted keys)
  - Status: Stub implementation returns pattern-matched responses, not actual API calls
  - API key storage: XOR-encrypted in MMKV via `src/lib/crypto.ts`
  - Test connection: `route.testConnection()` validates key format

**Transaction Categorization:**
- Pattern-based local categorization (NO external API)
  - Implementation: `convex/ai/categorize.ts` → `batchCategorize()`
  - BD-specific patterns: FoodPanda, restaurants, Agora/Shwapno, Pathao, bKash, Nagad, Daraz, utilities, etc.
  - Confidence scoring (0.0-0.95 range)
  - Falls back to heuristics for unmatched transactions

**CSV Import:**
- Local CSV parsing, no external API
  - Implementation: `convex/import/csvParser.ts`

## Data Storage

**Primary Database:**
- **Convex** (Backend-as-a-Service)
  - URL: Environment variable `EXPO_PUBLIC_CONVEX_URL`
  - Client: `convex/react` with `ConvexReactClient`
  - Real-time sync: Automatic subscription model
  - Multi-tenancy: All queries/mutations indexed by `userId`
  - Schema: 22+ tables in `convex/schema.ts`
  - Tables:
    - **Users & Settings:** users, aiConfig, flagNames
    - **Core:** accounts, categoryGroups, categories, payees
    - **Transactions:** transactions (with type, source, date, amount in paisa)
    - **Budgets & Goals:** budgets, targets
    - **Recurring:** scheduled (for scheduled transactions)
    - **Reconciliation:** reconciliation
    - **Reports:** reports (stored snapshots)
  - Indexes: All tables indexed by `userId`, some by secondary keys (e.g., `by_clerkId`, `by_groupId`)

**Local Storage (Native Platforms):**
- **MMKV** (via `react-native-mmkv` ^4.2.0)
  - Service: `src/services/storage/index.ts`
  - Platform fallback: In-memory Map on Web
  - Stored data:
    - Device ID (generated on first app launch)
    - Locale preference (en/bn)
    - Theme preference (light/dark/system)
    - Encrypted AI provider API keys per user
    - Settings and preferences
  - Instance ID: `doinikhishab-settings`

**File Storage:**
- Local filesystem only (via Expo Document Picker)
  - CSV import: User selects file via `expo-document-picker`
  - No cloud file storage integration

**Caching:**
- Convex real-time subscriptions handle query caching
- No explicit Redis/Memcached layer
- No offline persistence layer detected

## Authentication & Identity

**Auth Provider:**
- **Optional Clerk Integration** (schema-ready, not implemented)
  - Field: `users.clerkId` (optional string)
  - Index: `by_clerkId`
  - Status: Prepared but not active; app currently device-based

**Current Implementation:**
- Device-based authentication (no centralized auth)
  - Device ID: Generated on first app launch, stored in MMKV
  - Multi-user support: Via user creation in Convex on device
  - Flow: `useAppStore.setDeviceId()` → device ID persisted → used in all queries
  - Logout/user switch: Not implemented (single-user per device)

## Monitoring & Observability

**Error Tracking:**
- Expo ErrorBoundary component in `app/_layout.tsx`
- No external error tracking (Sentry, Rollbar, etc.) detected
- Custom error boundaries: `export { ErrorBoundary } from "expo-router"`

**Logs:**
- Console logging via React Native `console` (no structured logging library)
- Convex server-side logs: Available via `npx convex dashboard`
- Client logs: Not persisted or aggregated

## CI/CD & Deployment

**Hosting:**
- **Convex** - Backend functions, database, scheduled jobs
  - Deployment: `npx convex deploy` to production
  - Development: `npx convex dev` runs locally
  - Dashboard: `npx convex dashboard` for admin UI

- **Expo Application Services (EAS)** - Mobile builds and submission
  - Build profiles: development, preview, production
  - Android: `eas.json` configured for internal testing (apk) and production (app-bundle)
  - iOS: TBD (schema prepared, not explicitly configured)
  - Service account: `google-services-key.json` for Play Store submission
  - Version source: Remote (via EAS)

**CI Pipeline:**
- EAS Build - Automated builds for dev/preview/production
  - Android buildType: apk (dev/preview), app-bundle (prod)
  - iOS: Standard distribution (not explicitly configured)
  - No GitHub Actions or other CI detected

**Build Commands:**
```bash
bun run start              # Expo dev server (pick iOS/Android/web)
bun run web                # Web specifically
bun run android            # Android specifically
bun run ios                # iOS specifically
bun run start:clear        # Fresh Metro cache after config changes
bun run nuke               # Full clean reinstall (node_modules, .expo, lockb)

npx convex dev             # Convex backend dev server (separate terminal)
npx convex deploy          # Deploy backend to production
npx convex dashboard       # Open Convex admin dashboard
```

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_CONVEX_URL` - Public Convex URL for client (e.g., `https://xxxxx.convex.cloud`)
- `CONVEX_DEPLOYMENT` - Internal Convex deployment ID (for npx convex commands)

**Optional env vars:**
- `EXPO_PUBLIC_CONVEX_SITE_URL` - Alternative Convex URL (not actively used)

**Secrets location:**
- `.env.local` - Git-ignored, contains `CONVEX_DEPLOYMENT` and client URL
- API keys (AI providers): Encrypted in MMKV via `src/services/storage/index.ts`
  - Encryption method: XOR-based obfuscation (NOT production-grade)
  - Storage keys: `api_key_${provider}` (anthropic, google, openai, xai, openrouter)

## Webhooks & Callbacks

**Incoming:**
- None detected
- Convex handles real-time sync internally via WebSocket

**Outgoing:**
- None detected
- No third-party service callbacks or webhooks

## Scheduled Jobs

**Convex Crons:**
- File: `convex/crons.ts`
- Framework: Convex `cronJobs` API
- Implementation: Internal mutations for automated tasks (specific jobs not detailed in available files)
- Triggers: Server-side only, no external cron service

## Platform-Specific Integrations

**iOS:**
- Bundle ID: `com.doinikhishab.app`
- Deployment target: 15.1+
- Max refresh rate enabled via `CADisableMinimumFramePrefersHighFrameRate: true` in Info.plist
- SF Symbols support via `expo-symbols` (native iOS icon library)

**Android:**
- Package: `com.doinikhishab.app`
- Min SDK: 24, Target SDK: 35, Compile SDK: 36
- Kotlin: 2.1.0
- Build cache enabled
- ProGuard + resource shrinking in release builds
- Native New Architecture enabled (`newArchEnabled: true`)
- Gradle: 8 parallel workers, 3GB daemon heap

**Web:**
- Bundler: Metro (same as native)
- Output: Static (pre-built)
- Max-width constraint: 480px (centered)
- Platform-specific container in `app/_layout.tsx`

## Data Privacy & Encryption

**Local Data:**
- Device ID: Stored unencrypted in MMKV
- User preferences: Stored unencrypted in MMKV (locale, theme)
- AI API keys: XOR-encrypted ("basic obfuscation — NOT production-grade") in MMKV
  - Secret: Hard-coded or device-specific (implementation: `src/lib/crypto.ts`)

**In Transit:**
- Convex: HTTPS/WSS (standard cloud platform security)
- API keys (when used): Sent to external AI providers (user risk)

**At Rest:**
- Convex database: Platform-managed encryption (check Convex docs)
- MMKV: Platform-managed (Android: keystore backing)

---

*Integration audit: 2026-03-25*
