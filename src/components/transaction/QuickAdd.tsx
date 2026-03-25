import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { useQuickAdd } from "../../hooks/use-quick-add";
import { useCategoryFrequency } from "../../hooks/use-category-frequency";
import { shadow } from "../../lib/platform";
import { today } from "../../lib/date";
import { AmountPad } from "./AmountPad";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryFrequent } from "./CategoryFrequent";
import { ExpandableDetails } from "./ExpandableDetails";
import { Button } from "../ui/Button";
import type { DetailsValues } from "./ExpandableDetails";

type Step = "amount" | "category";

const TYPE_COLORS = {
  expense: { active: "text-danger", shadow: "#f87171" },
  income: { active: "text-success", shadow: "#34d399" },
  transfer: { active: "text-primary-700", shadow: "#0d9488" },
};

function makeDefaultDetails(): DetailsValues {
  return { payee: "", memo: "", flag: "", accountId: "", date: today() };
}

export function QuickAdd() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { isQuickAddOpen, quickAddType, closeQuickAdd } = useUIStore();
  const { locale } = useAppStore();
  const { categories, groups, accounts, defaultAccount, saveTransaction } =
    useQuickAdd();
  const { frequentIds, increment } = useCategoryFrequency();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(0);
  const [details, setDetails] = useState<DetailsValues>(makeDefaultDetails());
  const savingRef = useRef(false);

  const snapPoints = useMemo(() => ["85%"], []);

  const handleDetailsChange = useCallback(
    (field: keyof DetailsValues, value: string) => {
      setDetails((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCategorySelect = useCallback(
    async (categoryId: string) => {
      if (savingRef.current || amount === 0) return;
      savingRef.current = true;

      // 1. Haptic feedback (per D-05)
      if (Platform.OS !== "web") {
        try {
          const Haptics = require("expo-haptics");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      // 2. Increment frequency counter
      increment(categoryId);

      // 3. Save transaction
      const accountId = details.accountId || defaultAccount?._id || "";
      await saveTransaction({
        amount,
        categoryId,
        accountId,
        type: quickAddType,
        date: details.date || today(),
        description: details.payee || undefined,
        memo: details.memo || undefined,
        flag: details.flag || undefined,
      });

      // 4. After flash animation (~350ms), reset form for batch mode (per D-03)
      setTimeout(() => {
        setAmount(0);
        setDetails(makeDefaultDetails());
        setStep("amount");
        savingRef.current = false;
      }, 350);
    },
    [amount, details, defaultAccount, quickAddType, saveTransaction, increment]
  );

  const handleSkip = useCallback(async () => {
    if (savingRef.current || amount === 0) return;
    savingRef.current = true;

    const accountId = details.accountId || defaultAccount?._id || "";
    await saveTransaction({
      amount,
      accountId,
      type: quickAddType,
      date: details.date || today(),
      description: details.payee || undefined,
      memo: details.memo || undefined,
      flag: details.flag || undefined,
    });

    setTimeout(() => {
      setAmount(0);
      setDetails(makeDefaultDetails());
      setStep("amount");
      savingRef.current = false;
    }, 350);
  }, [amount, details, defaultAccount, quickAddType, saveTransaction]);

  const handleClose = useCallback(() => {
    setAmount(0);
    setDetails(makeDefaultDetails());
    setStep("amount");
    savingRef.current = false;
    closeQuickAdd();
  }, [closeQuickAdd]);

  // Map transfer type to expense for category display
  const categoryType =
    quickAddType === "transfer" ? "expense" : quickAddType;

  if (!isQuickAddOpen) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={handleClose}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: "#0c1021",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#1e2a3a",
      }}
      handleIndicatorStyle={{ backgroundColor: "#4e6381", width: 36 }}
    >
      <View className="flex-1 px-4">
        {/* Type Toggle */}
        <View className="flex-row bg-surface-200 rounded-xl p-1 mb-4 border border-border/20">
          {(["expense", "income", "transfer"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => useUIStore.getState().openQuickAdd(type)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                quickAddType === type ? "bg-surface-400" : ""
              }`}
              style={
                quickAddType === type
                  ? shadow(TYPE_COLORS[type].shadow, 0, 0, 0.25, 8)
                  : undefined
              }
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  quickAddType === type
                    ? TYPE_COLORS[type].active
                    : "text-surface-800"
                }`}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {step === "amount" && (
          <View className="flex-1">
            <AmountPad
              value={amount}
              onChange={setAmount}
              type={quickAddType}
              locale={locale}
            />
            <ExpandableDetails
              values={details}
              onChange={handleDetailsChange}
              accounts={accounts.map((a: any) => ({
                _id: a._id,
                name: a.name,
              }))}
              defaultAccountId={defaultAccount?._id || ""}
            />
            <View className="px-4 pb-4 mt-4">
              <Button
                onPress={() => setStep("category")}
                disabled={amount === 0}
                size="lg"
              >
                {t("quickAdd.nextCategory")}
              </Button>
            </View>
          </View>
        )}

        {step === "category" && (
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <Pressable onPress={() => setStep("amount")}>
                <Text className="text-primary-700 font-semibold text-xs">
                  {t("quickAdd.back")}
                </Text>
              </Pressable>
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
                {t("quickAdd.pickCategory")}
              </Text>
              <Pressable onPress={handleSkip}>
                <Text className="text-accent-500 font-semibold text-xs">
                  {t("quickAdd.skip")}
                </Text>
              </Pressable>
            </View>
            <BottomSheetScrollView>
              <CategoryFrequent
                categories={[...categories]}
                frequentIds={frequentIds}
                onSelect={handleCategorySelect}
                type={categoryType}
              />
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest px-2 mt-4 mb-2">
                All Categories
              </Text>
              <CategoryGrid
                categories={[...categories]}
                groups={[...groups]}
                selectedId={null}
                onSelect={handleCategorySelect}
                type={categoryType}
              />
            </BottomSheetScrollView>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
