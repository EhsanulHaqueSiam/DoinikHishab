# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript ~5.9.2 - All frontend and backend code
- JavaScript (via Expo/React Native) - Runtime execution

**Secondary:**
- Kotlin 2.1.0 - Android native layer (via Gradle)
- Swift/Objective-C - iOS native layer (deployment target 15.1)
- CSS (Tailwind) - Styling via NativeWind

## Runtime

**Environment:**
- Node.js (via Bun package manager) - Development and Convex backend runtime
- Expo SDK 55.0.6 - Cross-platform mobile/web runtime
- React Native 0.83.2 - iOS/Android/Web native bridge
- React 19.2.0 - Component framework

**Package Manager:**
- Bun (not npm/yarn) - Primary package manager for this project
- Lockfile: `bun.lockb` (binary lock file)

## Frameworks

**Core:**
- Expo Router ~55.0.5 - File-based routing (app/ directory structure)
- Expo CLI - Build and development for iOS/Android/Web
- React Native - Cross-platform native components
- React Native Web ~0.21.0 - React Native components on web (Metro bundler)

**State Management:**
- Zustand ^5.0.11 - Client-side state store (`@stores/*`)
  - Stores: `src/stores/app-store.ts`, `src/stores/ui-store.ts`
  - No Context API usage

**Navigation:**
- Expo Router - Nested routing with typed routes
- React Navigation Native ^7.1.28 - Navigation primitive (used by Expo Router)
- React Native Gesture Handler ^2.30.0 - Gesture detection for navigation

**Animation & Gesture:**
- React Native Reanimated 4.2.1 - Worklet-based animations
  - **CRITICAL:** Must be last plugin in babel.config.js
- React Native Worklets 0.7.2 - Worklet execution runtime
- @Gorhom/Bottom Sheet ^5.2.8 - Animated modal sheet component
- @Shopify/Flash List ^2.3.0 - Optimized list component (RecyclerView replacement)

**UI Components:**
- Lucide React Native ^0.577.0 - Icon library
- Sonner Native ^0.23.1 - Toast notifications
- NativeWind v4.2.2 - Tailwind CSS for React Native
- Tailwind CSS ^3.4.17 - Utility-first CSS framework

**Styling & Layout:**
- React Native Safe Area Context ~5.6.2 - Safe area padding for notches
- React Native Screens ~4.23.0 - Native screen stacks
- React Native SVG 15.15.3 - SVG rendering support

**Backend:**
- Convex ^1.32.0 - Backend-as-a-service with real-time DB
  - Functions: `convex/*.ts` (queries, mutations, actions)
  - Schema: `convex/schema.ts` (22+ tables, multi-tenant via userId)
  - AI integrations: `convex/ai/*.ts`
  - Scheduled jobs via `convex/crons.ts`
  - CSV import: `convex/import/*.ts`

**Testing:**
- No test framework configured (not detected)
- No linting/formatting tooling configured (Prettier/ESLint not found)

**Build/Dev:**
- Expo Build Properties - Android SDK/Kotlin version configuration
- Babel ~7.x (via babel-preset-expo) - JSX transpilation
- TypeScript - Incremental compilation with skipLibCheck enabled
- Metro Bundler - JavaScript bundler (configured via Expo)

## Key Dependencies

**Critical:**
- `convex` ^1.32.0 - Entire backend, database, real-time sync
  - Client: `ConvexReactClient` initialized with `EXPO_PUBLIC_CONVEX_URL`
  - Authentication: Optional Clerk support (field exists in schema but not integrated)
  - Multi-tenancy: All tables indexed by `userId`

**Infrastructure:**
- `react-native-mmkv` ^4.2.0 - Fast encrypted local storage on native platforms
  - Fallback to in-memory storage on web
  - Used for API keys, settings, device ID, locale, theme preferences
  - Location: `src/services/storage/index.ts`

**Utilities:**
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

**Environment:**
- `.env.local` - Contains Convex deployment credentials (gitignored)
  - `CONVEX_DEPLOYMENT` - Convex deployment identifier
  - `EXPO_PUBLIC_CONVEX_URL` - Public Convex client URL (exposed to app)
  - `EXPO_PUBLIC_CONVEX_SITE_URL` - Optional Convex site URL

**Build:**
- `tsconfig.json` - TypeScript strict mode, path aliases (`@/*`, `@src/*`, `@components/*`, `@lib/*`, `@stores/*`, `@hooks/*`)
- `babel.config.js` - Preset: `babel-preset-expo`, Plugin: `react-native-reanimated/plugin`
- `tailwind.config.js` - NativeWind preset, dark-first theme, teal primary, saffron accent
- `app.json` - Expo config with platform-specific settings:
  - iOS: Bundle ID `com.doinikhishab.app`, deployment target 15.1, max refresh rate enabled
  - Android: Package `com.doinikhishab.app`, SDK 24-36, Kotlin 2.1.0, Proguard + shrinking enabled, New Architecture enabled
  - Web: Metro bundler, static output
- `eas.json` - EAS Build configuration for development/preview/production
  - Production: App bundle for Play Store, internal track
  - Android: Service account key for Firebase distribution

**Node/Runtime:**
- `package.json` scripts configured with `NODE_OPTIONS='--max-old-space-size=3072 --expose-gc'`
  - 3GB heap allocation tuned for Intel i7-13700H (20 threads)
  - Garbage collection exposed for manual control

## Platform Requirements

**Development:**
- Node.js (via Bun) - Not version-pinned, check Bun for Node requirement
- Bun package manager - Required for install/add/remove operations
- macOS or Linux - For iOS/Android development
- Xcode (iOS) - Minimum deployment target 15.1
- Android SDK - Min SDK 24, Target SDK 35, Compile SDK 36, Kotlin 2.1.0
- Metro CLI - Included via Expo

**Production:**
- Expo Application Services (EAS) - Build and submission
- Convex deployment - Backend hosting
- Android Play Store - apk/app-bundle via EAS
- iOS TestFlight/App Store - Via EAS (certificate/provisioning profile required)
- Google Play Services credentials - `google-services-key.json` (referenced in eas.json)

## Build Optimizations

**Metro Configuration:**
- 12 parallel workers
- Inline requires enabled
- Scoped file watching: `app/`, `src/`, `assets/` only
- Node heap: 3GB (`--max-old-space-size=3072`)

**TypeScript:**
- Incremental compilation enabled
- Build cache: `.tsbuildinfo` in `node_modules/.cache/`
- `skipLibCheck` enabled (faster builds)
- `isolatedModules` enabled (ES modules)

**Android (Gradle):**
- Parallel builds with 8 workers
- 3GB daemon heap
- Build cache enabled
- Configuration cache enabled
- Proguard + resource shrinking in release builds
- `pickFirst` conflict resolution for `libc++_shared.so`

**Babel:**
- Environment-based caching (`NODE_ENV`)

---

*Stack analysis: 2026-03-25*
