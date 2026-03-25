const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// i7-13700H: 6 P-cores (12 threads) + 8 E-cores (8 threads) = 20 threads
// Use 12 workers — saturates P-cores fully, spills onto E-cores
// without oversubscribing and leaving room for main thread + watcher + browser
config.maxWorkers = 12;

// Transformer — parallel with caching
config.transformer = {
  ...config.transformer,
  // Enable worker parallelism for asset processing
  assetPlugins: config.transformer?.assetPlugins || [],
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    compress: {
      reduce_funcs: false,
      reduce_vars: false,
    },
  },
  // Inline requires — reduces initial parse time per module
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
      nonInlinedRequires: [
        "React",
        "react",
        "react-native",
        "react/jsx-runtime",
      ],
    },
  }),
};

// Resolver — minimize resolution attempts
config.resolver = {
  ...config.resolver,
  // Only resolve these platforms (skip windows/macos/etc.)
  platforms: ["ios", "android", "web"],
  // Skip scanning these directories entirely
  blockList: [
    /\.git\/.*/,
    /\.expo\/.*/,
    /android\/build\/.*/,
    /ios\/Pods\/.*/,
    // Exclude test files from production bundles (D-05)
    /.*\.test\.(ts|tsx|js|jsx)$/,
    /jest\.config\..*/,
    /jest\.setup\..*/,
  ],
};

// Watcher — lean file watching
config.watcher = {
  ...config.watcher,
  additionalExts: [],
};

// Watch only project source — not the entire tree
config.watchFolders = [
  path.resolve(__dirname, "app"),
  path.resolve(__dirname, "src"),
  path.resolve(__dirname, "assets"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
