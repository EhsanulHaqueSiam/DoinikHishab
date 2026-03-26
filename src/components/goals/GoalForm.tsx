import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { takaToPaisa, paisaToTaka } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import { Input } from "../ui/Input";
import type { SaveUpGoal } from "../../services/goal-storage/types";

interface GoalFormProps {
  sheetRef: React.RefObject<BottomSheet>;
  onSave: (goal: Omit<SaveUpGoal, "id"> | SaveUpGoal) => void;
  initialGoal?: SaveUpGoal;
}

const MOCK_ACCOUNTS = [
  { id: "mock_acc_savings", name: "Savings" },
  { id: "mock_acc_cash", name: "Cash" },
  { id: "mock_acc_bank", name: "Bank" },
];

function getDefaultTargetDate(): string {
  const now = new Date();
  const future = new Date(now.getFullYear(), now.getMonth() + 6, 1);
  return future.toISOString().split("T")[0];
}

export function GoalForm({ sheetRef, onSave, initialGoal }: GoalFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [targetDate, setTargetDate] = useState(getDefaultTargetDate());
  const [linkedAccountId, setLinkedAccountId] = useState(MOCK_ACCOUNTS[0].id);
  const [nameError, setNameError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [dateError, setDateError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setAmount(String(paisaToTaka(initialGoal.targetAmount)));
      setTargetDate(initialGoal.targetDate);
      setLinkedAccountId(initialGoal.linkedAccountId);
    }
  }, [initialGoal]);

  const resetForm = useCallback(() => {
    setName("");
    setAmount("");
    setTargetDate(getDefaultTargetDate());
    setLinkedAccountId(MOCK_ACCOUNTS[0].id);
    setNameError("");
    setAmountError("");
    setDateError("");
  }, []);

  const handleSave = useCallback(async () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError(t("goals.nameLabel" as any) + " required");
      hasError = true;
    } else {
      setNameError("");
    }

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError(t("goals.targetAmount" as any) + " must be > 0");
      hasError = true;
    } else {
      setAmountError("");
    }

    // Validate date format YYYY-MM-DD and is in the future
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      setDateError("Format: YYYY-MM-DD");
      hasError = true;
    } else {
      const dateObj = new Date(targetDate);
      if (isNaN(dateObj.getTime()) || dateObj <= new Date()) {
        setDateError("Date must be in the future");
        hasError = true;
      } else {
        setDateError("");
      }
    }

    if (hasError) return;

    const amountInPaisa = takaToPaisa(numericAmount);
    const today = new Date().toISOString().split("T")[0];

    if (initialGoal) {
      // Edit mode: pass full goal with id
      onSave({
        ...initialGoal,
        name: name.trim(),
        targetAmount: amountInPaisa,
        targetDate,
        linkedAccountId,
      });
    } else {
      // Create mode
      onSave({
        name: name.trim(),
        targetAmount: amountInPaisa,
        currentAmount: 0,
        targetDate,
        linkedAccountId,
        createdDate: today,
      });
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }

    resetForm();
    sheetRef.current?.close();
  }, [name, amount, targetDate, linkedAccountId, initialGoal, onSave, sheetRef, resetForm, t]);

  const handleCancel = useCallback(() => {
    resetForm();
    sheetRef.current?.close();
  }, [resetForm, sheetRef]);

  return (
    <BottomSheet ref={sheetRef} snapPoints={["70%"]} index={-1} enablePanDownToClose>
      <BottomSheetView>
        <View className="px-5 pb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            {initialGoal ? t("goals.editGoal" as any) : t("goals.createGoal" as any)}
          </Text>

          {/* Name */}
          <View className="mb-3">
            <Input
              label={t("goals.nameLabel" as any)}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Eid Fund"
              error={nameError}
            />
          </View>

          {/* Target Amount */}
          <View className="mb-3">
            <Input
              label={t("goals.targetAmount" as any)}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              error={amountError}
            />
          </View>

          {/* Target Date */}
          <View className="mb-3">
            <Input
              label={t("goals.targetDate" as any)}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              error={dateError}
            />
          </View>

          {/* Linked Account (pill selector) */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-surface-900 uppercase tracking-wider mb-2">
              {t("goals.linkedAccount" as any)}
            </Text>
            <View className="flex-row gap-2">
              {MOCK_ACCOUNTS.map((acc) => (
                <Pressable
                  key={acc.id}
                  className={`flex-1 rounded-full py-2 items-center ${
                    linkedAccountId === acc.id ? "bg-primary-500" : "bg-surface-300"
                  }`}
                  onPress={() => setLinkedAccountId(acc.id)}
                >
                  <Text
                    className={`text-xs font-bold ${
                      linkedAccountId === acc.id ? "text-white" : "text-surface-900"
                    }`}
                  >
                    {acc.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save button */}
          <Pressable className="bg-primary-500 rounded-xl py-3 mt-2" onPress={handleSave}>
            <Text className="text-white font-bold text-center">
              {initialGoal ? t("goals.editGoal" as any) : t("goals.createGoal" as any)}
            </Text>
          </Pressable>

          {/* Cancel button */}
          <Pressable className="bg-transparent rounded-xl py-3 mt-2" onPress={handleCancel}>
            <Text className="text-surface-900 font-bold text-center">
              {t("recurring.cancel" as any)}
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
