import * as Updates from "expo-updates";
import { useEffect } from "react";
import { AppState } from "react-native";
import { toast } from "sonner-native";

/**
 * Checks for OTA updates when the app comes to foreground.
 * Shows a sonner toast when an update is available and fetched.
 * Update auto-applies on next app launch (no forced reload).
 * Skips update checks in __DEV__ mode.
 */
export function useUpdateCheck(): void {
  useEffect(() => {
    // Only check in production builds, not in dev
    if (__DEV__) return;

    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "active") {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              toast.success("Update downloaded. Restart to apply.", {
                duration: 4000,
              });
              // Update auto-applies on next app launch (no forced reload)
            }
          } catch (error) {
            // Silent failure -- update checks are non-critical
            console.error("Update check failed:", error);
          }
        }
      },
    );

    return () => subscription.remove();
  }, []);
}
