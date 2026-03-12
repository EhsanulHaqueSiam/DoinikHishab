import React from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { APP_NAME, APP_NAME_BN } from "../../src/lib/constants";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, rightElement }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 active:bg-muted/30"
    >
      <Text className="text-lg mr-3">{icon}</Text>
      <Text className="flex-1 text-base text-foreground">{label}</Text>
      {value && (
        <Text className="text-sm text-muted-foreground mr-2">{value}</Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Text className="text-muted-foreground">›</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { locale, setLocale, theme, setTheme } = useAppStore();

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View className="items-center py-6">
          <Text className="text-4xl mb-2">💰</Text>
          <Text className="text-xl font-bold text-foreground">{APP_NAME}</Text>
          <Text className="text-sm text-muted-foreground">{APP_NAME_BN}</Text>
          <Text className="text-xs text-muted-foreground mt-1">Version 1.0.0</Text>
        </View>

        {/* General */}
        <View className="px-4 mb-6">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            General
          </Text>
          <Card className="p-0 px-4">
            <SettingRow
              icon="🌐"
              label="Language"
              value={locale === "en" ? "English" : "বাংলা"}
              onPress={() => setLocale(locale === "en" ? "bn" : "en")}
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="🎨"
              label="Theme"
              value={theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
              onPress={() =>
                setTheme(
                  theme === "light"
                    ? "dark"
                    : theme === "dark"
                      ? "system"
                      : "light"
                )
              }
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="💱"
              label="Currency"
              value="৳ BDT"
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="📅"
              label="Date Format"
              value="DD/MM/YYYY"
            />
          </Card>
        </View>

        {/* Data */}
        <View className="px-4 mb-6">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Data
          </Text>
          <Card className="p-0 px-4">
            <SettingRow
              icon="📤"
              label="Export Data"
              onPress={() => {}}
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="📥"
              label="Import Transactions"
              onPress={() => {}}
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="🔄"
              label="Fresh Start"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* AI (Phase 6 placeholder) */}
        <View className="px-4 mb-6">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            AI Features
          </Text>
          <Card className="p-0 px-4">
            <SettingRow
              icon="🤖"
              label="AI Settings"
              value="Not configured"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Account */}
        <View className="px-4 mb-6">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Account
          </Text>
          <Card className="p-0 px-4">
            <SettingRow
              icon="👤"
              label="Sign In"
              value="Local only"
              onPress={() => {}}
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="👨‍👩‍👧‍👦"
              label="Family Sharing"
              value="Not set up"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* About */}
        <View className="px-4 mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            About
          </Text>
          <Card className="p-0 px-4">
            <SettingRow
              icon="📝"
              label="Feedback"
              onPress={() => {}}
            />
            <View className="h-px bg-border/30" />
            <SettingRow
              icon="📜"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </Card>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
