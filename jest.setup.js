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
