import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "../../src/hooks/use-onboarding";
import { setJSON } from "../../src/services/storage";

interface AccountOption {
  id: string;
  nameKey: string;
  emoji: string;
}

const ACCOUNT_OPTIONS: AccountOption[] = [
  { id: "cash", nameKey: "onboarding.accountCash", emoji: "\uD83D\uDCB5" },
  { id: "bkash", nameKey: "onboarding.accountBkash", emoji: "\uD83D\uDCF1" },
  { id: "bank", nameKey: "onboarding.accountBank", emoji: "\uD83C\uDFE6" },
];

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { advance, skip } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleNext = () => {
    const accountData = showCustom
      ? { type: "custom", name: customName || "My Account" }
      : { type: selected || "cash", name: selected || "cash" };
    setJSON("onboarding_account", accountData);
    advance(1);
    router.push("/onboarding/categories");
  };

  const handleSkip = () => {
    advance(1);
    router.push("/onboarding/categories");
  };

  const handleSkipSetup = () => {
    skip();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-foreground mt-4">
          {t("onboarding.step2")}
        </Text>
        <Text className="text-sm text-surface-900 mt-2 mb-6">
          {t("onboarding.step2Desc")}
        </Text>

        {/* Account Options */}
        <View className="gap-3">
          {ACCOUNT_OPTIONS.map((option) => {
            const isSelected = selected === option.id && !showCustom;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  setSelected(option.id);
                  setShowCustom(false);
                }}
                className={`flex-row items-center rounded-xl p-4 ${
                  isSelected
                    ? "border-2 border-primary-500 bg-primary-50"
                    : "border border-border/40 bg-card"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className="text-2xl mr-3">{option.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">
                    {t(option.nameKey as any)}
                  </Text>
                  <Text className="text-xs text-surface-800 mt-0.5">
                    {t("onboarding.startingBalance")}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {/* Custom Account Option */}
          <Pressable
            onPress={() => {
              setShowCustom(true);
              setSelected(null);
            }}
            className={`rounded-xl p-4 ${
              showCustom
                ? "border-2 border-primary-500 bg-primary-50"
                : "border border-border/40 bg-card"
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: showCustom }}
          >
            <Text className="text-sm font-bold text-foreground">
              {t("onboarding.accountCustom")}
            </Text>
            {showCustom && (
              <TextInput
                className="border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground mt-2 bg-background"
                placeholder={t("onboarding.accountCustomPlaceholder")}
                placeholderTextColor="#6b7280"
                value={customName}
                onChangeText={setCustomName}
                autoFocus
              />
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleNext}
          className="bg-primary-500 rounded-xl py-4 items-center"
          accessibilityRole="button"
        >
          <Text className="text-base font-bold text-white">
            {t("onboarding.nextStep")}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          className="mt-3 items-center py-2"
          accessibilityRole="button"
        >
          <Text className="text-sm text-surface-800">
            {t("onboarding.skip")}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkipSetup}
          className="mt-1 items-center py-2"
          accessibilityRole="button"
        >
          <Text className="text-xs text-surface-700">
            {t("onboarding.skip")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
