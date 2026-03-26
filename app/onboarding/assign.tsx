import React, { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "../../src/hooks/use-onboarding";
import { formatCurrency } from "../../src/lib/currency";
import { getJSON } from "../../src/services/storage";
import { CATEGORY_TEMPLATE_SETS } from "../../src/services/mock-data";

/** Fixed mock balance: 800000 paisa = Tk 8,000 */
const MOCK_BALANCE = 800000;

/** Category display names for the assignment UI */
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

/** Default suggested splits by template (as percentages of total) */
const DEFAULT_SPLITS: Record<string, Record<string, number>> = {
  student: { tuition: 40, food: 25, transport: 15, books: 10, entertainment: 10 },
  professional: { rent: 35, groceries: 20, transport: 15, savings: 15, utilities: 10, dining: 5 },
  freelancer: { savings: 25, internet: 15, software: 15, taxes: 20, equipment: 15, groceries: 10 },
  family: { rent: 30, groceries: 20, utilities: 10, education: 15, medical: 10, transport: 10, clothing: 5 },
};

function getDefaultAssignments(
  templateId: string | null,
  categoryIds: string[]
): Record<string, number> {
  const assignments: Record<string, number> = {};
  const splits = templateId ? DEFAULT_SPLITS[templateId] : null;

  if (splits) {
    for (const catId of categoryIds) {
      const pct = splits[catId] ?? 0;
      assignments[catId] = Math.round((pct / 100) * MOCK_BALANCE);
    }
  } else {
    const perCategory = Math.floor(MOCK_BALANCE / categoryIds.length);
    for (const catId of categoryIds) {
      assignments[catId] = perCategory;
    }
  }
  return assignments;
}

export default function AssignScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { advance, skip } = useOnboarding();

  const selectedTemplate = getJSON<string>("onboarding_template") ?? null;

  const categoryIds = useMemo(() => {
    if (!selectedTemplate) {
      return ["rent", "groceries", "transport", "savings"];
    }
    const template = CATEGORY_TEMPLATE_SETS.find(
      (tmpl) => tmpl.id === selectedTemplate
    );
    return template?.categoryIds?.slice(0, 4) ?? ["rent", "groceries", "transport", "savings"];
  }, [selectedTemplate]);

  const [assignments, setAssignments] = useState<Record<string, number>>(() =>
    getDefaultAssignments(selectedTemplate, categoryIds)
  );

  const totalAssigned = useMemo(
    () => Object.values(assignments).reduce((sum, val) => sum + val, 0),
    [assignments]
  );

  const remaining = MOCK_BALANCE - totalAssigned;

  const handleAmountChange = (catId: string, text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const paisa = cleaned ? parseInt(cleaned, 10) * 100 : 0;
    setAssignments((prev) => ({ ...prev, [catId]: paisa }));
  };

  const handleNext = () => {
    advance(3);
    router.push("/onboarding/transaction");
  };

  const handleSkip = () => {
    advance(3);
    router.push("/onboarding/transaction");
  };

  const handleSkipSetup = () => {
    skip();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-foreground mt-4">
          {t("onboarding.step4")}
        </Text>
        <Text className="text-sm text-surface-900 mt-2 mb-6">
          {t("onboarding.step4Desc")}
        </Text>

        {/* Ready to Assign Hero */}
        <View className="rounded-xl bg-card border border-border/40 p-5 items-center mb-6">
          <Text className="text-xs text-surface-800 uppercase tracking-wider mb-1">
            {t("onboarding.readyToAssign")}
          </Text>
          <Text className="text-3xl font-bold text-primary-400">
            {formatCurrency(MOCK_BALANCE)}
          </Text>
        </View>

        {/* Category Assignment Rows */}
        <View className="gap-3 mb-4">
          {categoryIds.map((catId) => {
            const takaValue = Math.floor((assignments[catId] ?? 0) / 100);
            return (
              <View key={catId} className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground flex-1">
                  {CATEGORY_NAMES[catId] || catId}
                </Text>
                <TextInput
                  className="border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground text-right w-24 bg-card"
                  keyboardType="numeric"
                  value={takaValue > 0 ? String(takaValue) : ""}
                  onChangeText={(text) => handleAmountChange(catId, text)}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  accessibilityLabel={`Assign amount for ${CATEGORY_NAMES[catId] || catId}`}
                />
              </View>
            );
          })}
        </View>

        {/* Remaining Counter */}
        <View className="flex-row justify-between items-center py-3 border-t border-border/20">
          <Text className="text-sm font-bold text-foreground">
            {t("onboarding.remaining")}
          </Text>
          <Text
            className={`text-lg font-bold ${
              remaining >= 0 ? "text-primary-400" : "text-red-400"
            }`}
          >
            {formatCurrency(remaining)}
          </Text>
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
