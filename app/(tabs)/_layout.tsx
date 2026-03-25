import React from "react";
import { Tabs } from "expo-router";
import { Platform, View, Text } from "react-native";
import { shadow } from "../../src/lib/platform";

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
          backgroundColor: "#0a0f1c",
          elevation: 0,
          ...(Platform.OS === "web"
            ? { boxShadow: "none" }
            : { shadowOpacity: 0 }),
          borderBottomWidth: 1,
          borderBottomColor: "#1a2744",
        },
        headerTitleStyle: {
          fontWeight: "700" as const,
          fontSize: 18,
          color: "#e8edf5",
          fontFamily: "SpaceMono",
        },
        tabBarStyle: {
          backgroundColor: "#0a0f1c",
          borderTopColor: "#1a2744",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarActiveTintColor: "#2dd4bf",
        tabBarInactiveTintColor: "#3a5280",
        tabBarShowLabel: true,
        tabBarIcon: ({ focused }) => (
          <View style={focused ? shadow("#0d9488", 0, 0, 0.6, 8, 4) : undefined}>
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>
              {TAB_ICONS[route.name] || "📌"}
            </Text>
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600" as const,
          fontFamily: "SpaceMono",
          letterSpacing: 0.5,
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
