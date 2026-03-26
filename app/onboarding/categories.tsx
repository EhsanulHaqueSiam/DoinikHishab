import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { CategoryTemplateSelector } from "../../src/components/onboarding/CategoryTemplateSelector";
import { useOnboarding } from "../../src/hooks/use-onboarding";
import {
  CATEGORY_TEMPLATE_SETS,
  SINKING_FUND_TEMPLATES,
} from "../../src/services/mock-data";
import { setJSON } from "../../src/services/storage";

/** Category display names by ID for the preview list */
const CATEGORY_NAMES: Record<string, string> = {
  tuition: "Tuition",
  books: "Books & Supplies",
  transport: "Transport",
  food: "Food",
  entertainment: "Entertainment",
  rent: "Rent",
  utilities: "Utilities",
  groceries: "Groceries",
  savings: "Savings",
  dining: "Dining Out",
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

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { advance, skip } = useOnboarding();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [enabledFunds, setEnabledFunds] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const fund of SINKING_FUND_TEMPLATES) {
        initial[fund.id] = true;
      }
      return initial;
    }
  );

  const selectedCategories = useMemo(() => {
    if (!selectedTemplate) return [];
    const template = CATEGORY_TEMPLATE_SETS.find(
      (t) => t.id === selectedTemplate
    );
    return template?.categoryIds ?? [];
  }, [selectedTemplate]);

  const toggleFund = (fundId: string) => {
    setEnabledFunds((prev) => ({ ...prev, [fundId]: !prev[fundId] }));
  };

  const handleNext = () => {
    if (selectedTemplate) {
      setJSON("onboarding_template", selectedTemplate);
    }
    const selectedFunds = Object.entries(enabledFunds)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => id);
    setJSON("onboarding_sinking_funds", selectedFunds);
    advance(2);
    router.push("/onboarding/assign");
  };

  const handleSkip = () => {
    advance(2);
    router.push("/onboarding/assign");
  };

  const handleSkipSetup = () => {
    skip();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-foreground mt-4">
          {t("onboarding.step3")}
        </Text>
        <Text className="text-sm text-surface-900 mt-2 mb-6">
          {t("onboarding.step3Desc")}
        </Text>

        {/* Template Selector */}
        <CategoryTemplateSelector
          selectedId={selectedTemplate}
          onSelect={setSelectedTemplate}
        />

        {/* Preview Categories from Selected Template */}
        {selectedCategories.length > 0 && (
          <View className="mt-6">
            <Text className="text-xs font-bold text-surface-800 mb-2 uppercase tracking-wider">
              Categories
            </Text>
            <View className="gap-1">
              {selectedCategories.map((catId) => (
                <View key={catId} className="flex-row items-center py-1.5">
                  <Text className="text-sm mr-2">
                    {CATEGORY_ICONS[catId] || "\uD83D\uDCCC"}
                  </Text>
                  <Text className="text-xs text-surface-800">
                    {CATEGORY_NAMES[catId] || catId}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sinking Fund Checkboxes */}
        <View className="mt-6 mb-4">
          <Text className="text-xs font-bold text-surface-800 mb-3 uppercase tracking-wider">
            {t("onboarding.sinkingFundsTitle")}
          </Text>
          <View className="gap-2">
            {SINKING_FUND_TEMPLATES.map((fund) => {
              const isEnabled = enabledFunds[fund.id] ?? true;
              return (
                <Pressable
                  key={fund.id}
                  onPress={() => toggleFund(fund.id)}
                  className="flex-row items-center py-2"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isEnabled }}
                >
                  <View
                    className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                      isEnabled
                        ? "bg-primary-500 border-primary-500"
                        : "border-border/60 bg-card"
                    }`}
                  >
                    {isEnabled && <Check size={12} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text className="text-sm text-foreground flex-1">
                    {t(fund.nameKey as any)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
