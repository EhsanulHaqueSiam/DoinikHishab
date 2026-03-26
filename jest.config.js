/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind|react-native-css-interop|sonner-native|lucide-react-native|@gorhom|@shopify|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-mmkv|convex|react-native-worklets|d3-sankey|react-native-gifted-charts|expo-linear-gradient|expo-updates)",
  ],
  testMatch: [
    "**/*.test.ts",
    "**/*.test.tsx",
  ],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/stores/**/*.{ts,tsx}",
    "convex/**/*.{ts,tsx}",
    "!**/*.test.{ts,tsx}",
    "!**/node_modules/**",
    "!convex/_generated/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
