import React from "react";
import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";

const TAB_ICONS: Record<string, string> = {
  index: "🏠",
  transactions: "💰",
  budget: "📊",
  accounts: "🏦",
  reports: "📈",
  settings: "⚙️",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        },
        headerTitleStyle: {
          fontWeight: "700" as const,
          fontSize: 18,
          color: "#0f172a",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarActiveTintColor: "#0891b2",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name] || "📌"}
          </Text>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerTitle: "দৈনিক হিসাব",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{ title: "Transactions" }}
      />
      <Tabs.Screen
        name="budget"
        options={{ title: "Budget" }}
      />
      <Tabs.Screen
        name="accounts"
        options={{ title: "Accounts" }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: "Reports" }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings" }}
      />
    </Tabs>
  );
}
