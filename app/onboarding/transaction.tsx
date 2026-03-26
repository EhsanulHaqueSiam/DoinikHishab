import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "../../src/hooks/use-onboarding";
import { CATEGORY_TEMPLATE_SETS } from "../../src/services/mock-data";
import { getJSON } from "../../src/services/storage";
import { useAppStore } from "../../src/stores/app-store";

/** Category display names */
const CATEGORY_NAMES: Record<string, string> = {
  tuition: "Tuition",
  books: "Books",
  transport: "Transport",
  food: "Food",
  entertainment: "Fun",
  rent: "Rent",
  utilities: "Utilities",
  groceries: "Groceries",
  savings: "Savings",
  dining: "Dining",
  internet: "Internet",
  software: "Software",
  taxes: "Taxes",
  equipment: "Equipment",
  education: "Education",
  medical: "Medical",
  clothing: "Clothing",
};

const CATEGORY_ICONS: Record<string, string> = {
  tuition: "\uD83C\uDF93",
  books: "\uD83D\uDCDA",
  transport: "\uD83D\uDE8C",
  food: "\uD83C\uDF5A",
  entertainment: "\uD83C\uDFAC",
  rent: "\uD83C\uDFE0",
  utilities: "\u26A1",
  groceries: "\uD83D\uDED2",
  savings: "\uD83D\uDCB0",
  dining: "\uD83C\uDF7D",
  internet: "\uD83C\uDF10",
  software: "\uD83D\uDCBB",
  taxes: "\uD83D\uDCCB",
  equipment: "\uD83D\uDD27",
  education: "\uD83D\uDCDA",
  medical: "\uD83C\uDFE5",
  clothing: "\uD83D\uDC55",
};

export default function TransactionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { advance, complete } = useOnboarding();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedTemplate = getJSON<string>("onboarding_template") ?? null;

  const categoryIds = useMemo(() => {
    if (!selectedTemplate) {
      return ["food", "transport", "groceries", "entertainment", "rent", "utilities"];
    }
    const template = CATEGORY_TEMPLATE_SETS.find((tmpl) => tmpl.id === selectedTemplate);
    return (
      template?.categoryIds?.slice(0, 6) ?? [
        "food",
        "transport",
        "groceries",
        "entertainment",
        "rent",
        "utilities",
      ]
    );
  }, [selectedTemplate]);

  const handleStartBudgeting = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    advance(4);
    complete();
    setOnboardingComplete();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-foreground mt-4">{t("onboarding.step5")}</Text>
        <Text className="text-sm text-surface-900 mt-2 mb-6">{t("onboarding.step5Desc")}</Text>

        {/* Amount Input */}
        <View className="items-center mb-6">
          <Text className="text-xs text-surface-800 mb-2 uppercase tracking-wider">
            {t("transaction.amount")}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-3xl font-bold text-surface-700 mr-1">{"\u09F3"}</Text>
            <TextInput
              className="text-3xl font-bold text-foreground text-center min-w-20"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#6b7280"
              accessibilityLabel="Transaction amount"
            />
          </View>
        </View>

        {/* Category Grid (3x2) */}
        <Text className="text-xs text-surface-800 mb-3 uppercase tracking-wider">
          {t("transaction.category")}
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {categoryIds.map((catId) => {
            const isSelected = selectedCategory === catId;
            return (
              <Pressable
                key={catId}
                onPress={() => setSelectedCategory(catId)}
                className={`rounded-xl p-3 items-center ${
                  isSelected
                    ? "border-2 border-primary-500 bg-primary-50"
                    : "border border-border/40 bg-card"
                }`}
                style={{ width: "30%" }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className="text-xl mb-1">{CATEGORY_ICONS[catId] || "\uD83D\uDCCC"}</Text>
                <Text
                  className={`text-xs text-center ${
                    isSelected ? "text-primary-400 font-bold" : "text-surface-800"
                  }`}
                  numberOfLines={1}
                >
                  {CATEGORY_NAMES[catId] || catId}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleStartBudgeting}
          className="bg-primary-500 rounded-xl py-4 items-center"
          accessibilityRole="button"
        >
          <Text className="text-base font-bold text-white">{t("onboarding.startBudgeting")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
