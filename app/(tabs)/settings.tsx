import type React from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, Pressable, ScrollView, Text, View } from "react-native";
import { Card } from "../../src/components/ui/Card";
import { APP_NAME, APP_NAME_BN } from "../../src/lib/constants";
import i18n from "../../src/lib/i18n";
import { useAppStore } from "../../src/stores/app-store";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  accessibilityLabel?: string;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  danger,
  accessibilityLabel,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 active:bg-surface-400/30"
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text className="text-base mr-3">{icon}</Text>
      <Text className={`flex-1 text-sm font-medium ${danger ? "text-danger" : "text-foreground"}`}>
        {label}
      </Text>
      {value && <Text className="text-xs text-primary-700 mr-2 font-medium">{value}</Text>}
      {rightElement}
      {onPress && !rightElement && <Text className="text-surface-700 text-xs">›</Text>}
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
  const { setLocale, theme, setTheme } = useAppStore();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate="fast"
      >
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
          <SectionLabel title={t("settings.general")} />
          <Card className="p-0 px-4">
            <SettingRow
              icon="🌐"
              label={t("settings.language")}
              value={i18n.language === "en" ? "English" : "বাংলা"}
              accessibilityLabel={t("settings.language")}
              onPress={() => {
                const newLang = i18n.language === "en" ? "bn" : "en";
                i18n.changeLanguage(newLang);
                setLocale(newLang as "en" | "bn");
                AccessibilityInfo.announceForAccessibility(t("settings.languageChanged"));
              }}
            />
            <Divider />
            <SettingRow
              icon="🎨"
              label={t("settings.theme")}
              value={theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
              onPress={() =>
                setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")
              }
            />
            <Divider />
            <SettingRow icon="💱" label={t("settings.currency")} value="৳ BDT" />
            <Divider />
            <SettingRow icon="📅" label={t("settings.dateFormat")} value="DD/MM/YYYY" />
          </Card>
        </View>

        {/* Data */}
        <View className="px-4 mb-6">
          <SectionLabel title={t("settings.data")} />
          <Card className="p-0 px-4">
            <SettingRow icon="📤" label={t("settings.exportData")} onPress={() => {}} />
            <Divider />
            <SettingRow icon="📥" label={t("settings.importTransactions")} onPress={() => {}} />
            <Divider />
            <SettingRow icon="🔄" label={t("settings.freshStart")} onPress={() => {}} />
          </Card>
        </View>

        {/* AI */}
        <View className="px-4 mb-6">
          <SectionLabel title={t("settings.ai")} />
          <Card className="p-0 px-4">
            <SettingRow
              icon="🤖"
              label={t("settings.aiSettings")}
              value="Not configured"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Account */}
        <View className="px-4 mb-6">
          <SectionLabel title={t("settings.account")} />
          <Card className="p-0 px-4">
            <SettingRow
              icon="👤"
              label={t("settings.signIn")}
              value="Local only"
              onPress={() => {}}
            />
            <Divider />
            <SettingRow
              icon="👨‍👩‍👧‍👦"
              label={t("settings.familySharing")}
              value="Not set up"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* About */}
        <View className="px-4 mb-8">
          <SectionLabel title={t("settings.about")} />
          <Card className="p-0 px-4">
            <SettingRow icon="📝" label={t("settings.feedback")} onPress={() => {}} />
            <Divider />
            <SettingRow icon="📜" label={t("settings.privacy")} onPress={() => {}} />
          </Card>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
