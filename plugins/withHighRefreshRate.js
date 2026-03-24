const {
  withMainActivity,
  withInfoPlist,
  createRunOncePlugin,
} = require("expo/config-plugins");

/**
 * Expo config plugin that enables the device's maximum refresh rate.
 *
 * Android: Injects code into MainActivity.onCreate() that finds the display
 *          mode with the highest refresh rate and applies it to the window.
 *          Works with 60/90/120/144/165Hz+ panels automatically.
 *
 * iOS:     Sets CADisableMinimumFramePrefersHighFrameRate = true in Info.plist
 *          to unlock ProMotion (120Hz) on iPhone 13 Pro+ and iPad Pro.
 */

function withHighRefreshRateAndroid(config) {
  return withMainActivity(config, (modConfig) => {
    const mainActivity = modConfig.modResults;

    // Add required imports if not present
    const importsToAdd = [
      "import android.view.WindowManager;",
      "import android.view.Display;",
    ];

    for (const imp of importsToAdd) {
      if (!mainActivity.contents.includes(imp)) {
        mainActivity.contents = mainActivity.contents.replace(
          /^(package .+;)/m,
          `$1\n\n${imp}`
        );
      }
    }

    // Inject high refresh rate code into onCreate
    const onCreateCode = `
    // --- High Refresh Rate ---
    // Detect and apply the highest available display refresh rate
    Display display = getWindowManager().getDefaultDisplay();
    Display.Mode[] modes = display.getSupportedModes();
    Display.Mode highestMode = display.getMode();
    for (Display.Mode mode : modes) {
      if (mode.getRefreshRate() > highestMode.getRefreshRate()) {
        highestMode = mode;
      }
    }
    WindowManager.LayoutParams params = getWindow().getAttributes();
    params.preferredDisplayModeId = highestMode.getModeId();
    getWindow().setAttributes(params);
    // --- End High Refresh Rate ---`;

    // Insert after super.onCreate() call
    if (!mainActivity.contents.includes("preferredDisplayModeId")) {
      mainActivity.contents = mainActivity.contents.replace(
        /(super\.onCreate\(.*?\);)/,
        `$1\n${onCreateCode}`
      );
    }

    return modConfig;
  });
}

function withHighRefreshRateIOS(config) {
  return withInfoPlist(config, (modConfig) => {
    modConfig.modResults.CADisableMinimumFramePrefersHighFrameRate = true;
    return modConfig;
  });
}

function withHighRefreshRate(config) {
  config = withHighRefreshRateAndroid(config);
  config = withHighRefreshRateIOS(config);
  return config;
}

module.exports = createRunOncePlugin(
  withHighRefreshRate,
  "withHighRefreshRate",
  "1.0.0"
);
