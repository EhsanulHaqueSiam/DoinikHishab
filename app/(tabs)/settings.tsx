import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { APP_NAME, APP_NAME_BN } from "../../src/lib/constants";
import { useTranslation } from "../../src/lib/i18n";
import { resetOnboarding, getLookbackDays } from "../../src/services/onboarding";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, label, value, onPress, rightElement, danger }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 active:bg-surface-400/30"
    >
      <Text className="text-base mr-3">{icon}</Text>
      <Text className={`flex-1 text-sm font-medium ${danger ? "text-danger" : "text-foreground"}`}>
        {label}
      </Text>
      {value && (
        <Text className="text-xs text-primary-700 mr-2 font-medium">{value}</Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Text className="text-surface-700 text-xs">›</Text>
      )}
    </Pressable>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-2">
      {title}
    </Text>
  );
}

const Divider = () => <View className="h-px bg-border/20" />;

export default function SettingsScreen() {
  const { locale, setLocale, theme, setTheme } = useAppStore();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={8} decelerationRate="fast">
        {/* App Identity */}
        <View className="items-center py-8">
          <View className="w-16 h-16 rounded-2xl bg-surface-300 items-center justify-center mb-3">
            <Text className="text-3xl">💰</Text>
          </View>
          <Text className="text-lg font-bold text-foreground tracking-wide">{APP_NAME}</Text>
          <Text className="text-xs text-primary-700 mt-0.5">{APP_NAME_BN}</Text>
          <Text className="text-2xs text-surface-700 mt-1 tracking-wider">VERSION 1.0.0</Text>
        </View>

        {/* General */}
        <View className="px-4 mb-6">
          <SectionLabel title="General" />
          <Card className="p-0 px-4">
            <SettingRow icon="🌐" label="Language" value={locale === "en" ? "English" : "বাংলা"} onPress={() => setLocale(locale === "en" ? "bn" : "en")} />
            <Divider />
            <SettingRow icon="🎨" label="Theme" value={theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"} onPress={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")} />
            <Divider />
            <SettingRow icon="💱" label="Currency" value="৳ BDT" />
            <Divider />
            <SettingRow icon="📅" label="Date Format" value="DD/MM/YYYY" />
            <Divider />
            <SettingRow
              icon="🔄"
              label={t("settings.redoSetup")}
              onPress={() => {
                resetOnboarding();
                router.replace("/onboarding/rules" as any);
              }}
            />
            <Divider />
            <SettingRow
              icon="📊"
              label={t("settings.bufferLookback")}
              value={`${getLookbackDays()} ${t("metrics.days")}`}
            />
          </Card>
        </View>

        {/* Data */}
        <View className="px-4 mb-6">
          <SectionLabel title="Data" />
          <Card className="p-0 px-4">
            <SettingRow icon="📤" label="Export Data" onPress={() => {}} />
            <Divider />
            <SettingRow icon="📥" label="Import Transactions" onPress={() => {}} />
            <Divider />
            <SettingRow icon="🔄" label="Fresh Start" onPress={() => {}} />
          </Card>
        </View>

        {/* AI */}
        <View className="px-4 mb-6">
          <SectionLabel title="AI Features" />
          <Card className="p-0 px-4">
            <SettingRow icon="🤖" label="AI Settings" value="Not configured" onPress={() => {}} />
          </Card>
        </View>

        {/* Account */}
        <View className="px-4 mb-6">
          <SectionLabel title="Account" />
          <Card className="p-0 px-4">
            <SettingRow icon="👤" label="Sign In" value="Local only" onPress={() => {}} />
            <Divider />
            <SettingRow icon="👨‍👩‍👧‍👦" label="Family Sharing" value="Not set up" onPress={() => {}} />
          </Card>
        </View>

        {/* About */}
        <View className="px-4 mb-8">
          <SectionLabel title="About" />
          <Card className="p-0 px-4">
            <SettingRow icon="📝" label="Feedback" onPress={() => {}} />
            <Divider />
            <SettingRow icon="📜" label="Privacy Policy" onPress={() => {}} />
          </Card>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
