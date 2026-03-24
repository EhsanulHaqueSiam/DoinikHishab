module.exports = function (api) {
  // Cache based on NODE_ENV — avoids re-computing config every file
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Reanimated MUST be last
      "react-native-reanimated/plugin",
    ],
  };
};
