import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Text, View } from "react-native";
import { shadow } from "../../src/lib/platform";

const TAB_ICONS: Record<string, string> = {
  index: "🏠",
  transactions: "💰",
  budget: "📊",
  accounts: "🏦",
  reports: "📈",
  recurring: "🔄",
  settings: "⚙️",
};

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: "#0c1021",
          elevation: 0,
          ...(Platform.OS === "web" ? { boxShadow: "none" } : { shadowOpacity: 0 }),
          borderBottomWidth: 1,
          borderBottomColor: "#1e2a3a",
        },
        headerTitleStyle: {
          fontWeight: "700" as const,
          fontSize: 17,
          color: "#eaf0f9",
          fontFamily: "SpaceMono",
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: "#0c1021",
          borderTopColor: "#1e2a3a",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarActiveTintColor: "#2dd4bf",
        tabBarInactiveTintColor: "#4e6381",
        tabBarShowLabel: true,
        tabBarIcon: ({ focused }) => (
          <View style={focused ? shadow("#0d9488", 0, 0, 0.5, 8, 4) : undefined}>
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.35 }}>
              {TAB_ICONS[route.name] || "📌"}
            </Text>
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "600" as const,
          fontFamily: "SpaceMono",
          letterSpacing: 0.8,
          textTransform: "uppercase" as const,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.dashboard"),
          headerTitle: t("app.name"),
        }}
      />
      <Tabs.Screen name="transactions" options={{ title: t("tabs.transactions") }} />
      <Tabs.Screen name="budget" options={{ title: t("tabs.budget") }} />
      <Tabs.Screen name="accounts" options={{ title: t("tabs.accounts") }} />
      <Tabs.Screen name="reports" options={{ title: t("tabs.reports") }} />
      <Tabs.Screen name="recurring" options={{ title: t("tabs.recurring") }} />
      <Tabs.Screen name="settings" options={{ title: t("tabs.settings") }} />
    </Tabs>
  );
}
