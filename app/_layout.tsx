import "../src/lib/i18n";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import type React from "react";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud"
);

/** Web-only wrapper to constrain max-width and center the app */
function WebContainer({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View
      style={{
        flex: 1,
        maxWidth: 480,
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#070b16",
      }}
    >
      {children}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ConvexProvider client={convex}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#070b16" }}>
        <WebContainer>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#070b16" },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="transaction/add"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="transaction/[id]" />
            <Stack.Screen name="account/[id]" />
            <Stack.Screen
              name="reconcile/index"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="reconcile/review" />
            <Stack.Screen
              name="transaction/import"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="ai/chat" />
            <Stack.Screen name="ai/settings" />
          </Stack>
        </WebContainer>
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </ConvexProvider>
  );
}
