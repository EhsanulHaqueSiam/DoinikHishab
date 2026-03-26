// Jest setup file for DoinikHishab
// Polyfills and global mocks needed before tests run

// Mock react-native-mmkv (not available in test environment)
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn().mockReturnValue(false),
  })),
}));

// Mock expo-haptics (no native module in test)
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

// Mock Convex react hooks (per RESEARCH.md Pattern 3)
jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useConvex: jest.fn(),
  ConvexProvider: ({ children }) => children,
}));

// Mock i18n module (prevents @formatjs polyfill from failing in Jest)
jest.mock("./src/lib/i18n", () => ({
  __esModule: true,
  default: { language: "en", changeLanguage: jest.fn(), t: jest.fn((key) => key) },
}));

// Mock react-native-reanimated (no native worklets in test)
jest.mock("react-native-reanimated", () => ({
  default: { addWhitelistedNativeProps: jest.fn(), addWhitelistedUIProps: jest.fn() },
  useSharedValue: jest.fn((v) => ({ value: v })),
  useAnimatedStyle: jest.fn(() => ({})),
  useDerivedValue: jest.fn((fn) => ({ value: fn() })),
  withTiming: jest.fn((v) => v),
  withSpring: jest.fn((v) => v),
  withSequence: jest.fn((...args) => args[args.length - 1]),
  interpolateColor: jest.fn(() => "#000000"),
  Easing: { inOut: jest.fn(), bezier: jest.fn() },
  createAnimatedComponent: jest.fn((c) => c),
  View: require("react-native").View,
  Text: require("react-native").Text,
  ScrollView: require("react-native").ScrollView,
  FlatList: require("react-native").FlatList,
}));

// Mock react-native-worklets (no native worklets in test)
jest.mock("react-native-worklets", () => ({
  createSerializable: jest.fn((v) => v),
  defaultSerializer: jest.fn(),
}));

// Mock expo-localization
jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [{ languageCode: "en" }]),
}));

// Mock platform utility (shadow helper uses Platform.OS)
jest.mock("./src/lib/platform", () => ({
  shadow: jest.fn().mockReturnValue({}),
  isWeb: false,
  isIOS: false,
  isAndroid: true,
  isMobile: true,
}));

// Silence console.warn for act() warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("act(")) return;
  originalWarn(...args);
};
