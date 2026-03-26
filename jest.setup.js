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
  useTranslation: () => ({ t: (key) => key, locale: "en" }),
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
  Easing: { inOut: jest.fn(), bezier: jest.fn(), out: jest.fn(() => jest.fn()), cubic: jest.fn() },
  runOnJS: jest.fn((fn) => fn),
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

// Mock react-native-gifted-charts (SVG-based charts)
jest.mock("react-native-gifted-charts", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    BarChart: (props) => React.createElement(View, { testID: props.testID || "bar-chart" }),
    LineChart: (props) => React.createElement(View, { testID: props.testID || "line-chart" }),
    LineChartBicolor: (props) => React.createElement(View, { testID: props.testID || "line-chart-bicolor" }),
  };
});

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

// Mock d3-sankey
jest.mock("d3-sankey", () => ({
  sankey: jest.fn(() => {
    const gen = (data) => ({
      nodes: (data?.nodes || []).map((n, i) => ({ ...n, x0: 0, x1: 20, y0: i * 30, y1: i * 30 + 20, value: 100 })),
      links: (data?.links || []).map((l) => ({ ...l, width: 10, y0: 0, y1: 30 })),
    });
    gen.nodeWidth = () => gen;
    gen.nodePadding = () => gen;
    gen.extent = () => gen;
    gen.iterations = () => gen;
    gen.nodeAlign = () => gen;
    return gen;
  }),
  sankeyLinkHorizontal: jest.fn(() => () => "M0,0 C10,10 20,20 30,30"),
  sankeyLeft: "left",
  sankeyRight: "right",
  sankeyCenter: "center",
  sankeyJustify: "justify",
}));

// Mock react-native-gesture-handler/ReanimatedSwipeable
jest.mock("react-native-gesture-handler/ReanimatedSwipeable", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }) => React.createElement(View, { testID: "swipeable" }, children),
  };
});

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: React.forwardRef(({ children }, ref) => React.createElement(View, { testID: "bottom-sheet", ref }, children)),
    BottomSheetView: ({ children }) => React.createElement(View, null, children),
    BottomSheetBackdrop: () => null,
  };
});

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Pan: jest.fn(() => ({
      activeOffsetX: jest.fn().mockReturnThis(),
      failOffsetY: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
    })),
  },
  GestureDetector: ({ children }) => children,
  GestureHandlerRootView: ({ children }) => children,
}));

// Mock @shopify/flash-list (native RecyclerView not available in test)
jest.mock("@shopify/flash-list", () => {
  const React = require("react");
  const { FlatList } = require("react-native");
  return {
    FlashList: React.forwardRef((props, ref) =>
      React.createElement(FlatList, { ...props, ref })
    ),
  };
});

// Silence console.warn for act() warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("act(")) return;
  originalWarn(...args);
};
