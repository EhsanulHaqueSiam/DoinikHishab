import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { takaToPaisa } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import { Input } from "../ui/Input";
import type { RecurringFrequency, Subscription } from "./recurring-types";

interface AddSubscriptionFormProps {
  sheetRef: React.RefObject<BottomSheet>;
  onSave: (sub: Omit<Subscription, "id">) => void;
}

const FREQUENCIES: RecurringFrequency[] = ["weekly", "monthly", "yearly"];
const TYPES = ["expense", "income"] as const;

const frequencyLabelKey: Record<string, string> = {
  weekly: "recurring.weekly",
  monthly: "recurring.monthly",
  yearly: "recurring.yearly",
};

function getDefaultNextDueDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split("T")[0];
}

export function AddSubscriptionForm({ sheetRef, onSave }: AddSubscriptionFormProps) {
  const { t } = useTranslation();

  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [nextDueDate, setNextDueDate] = useState(getDefaultNextDueDate());
  const [payeeError, setPayeeError] = useState("");
  const [amountError, setAmountError] = useState("");

  const resetForm = useCallback(() => {
    setPayee("");
    setAmount("");
    setFrequency("monthly");
    setType("expense");
    setNextDueDate(getDefaultNextDueDate());
    setPayeeError("");
    setAmountError("");
  }, []);

  const handleSave = useCallback(async () => {
    let hasError = false;

    if (!payee.trim()) {
      setPayeeError(t("recurring.payee") + " required");
      hasError = true;
    } else {
      setPayeeError("");
    }

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError(t("recurring.amount") + " must be > 0");
      hasError = true;
    } else {
      setAmountError("");
    }

    if (hasError) return;

    const amountInPaisa = takaToPaisa(numericAmount);

    onSave({
      payee: payee.trim(),
      amount: amountInPaisa,
      frequency,
      categoryId: "mock_cat_1",
      nextDueDate,
      isActive: true,
      type,
    });

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }

    resetForm();
    sheetRef.current?.close();
  }, [payee, amount, frequency, type, nextDueDate, onSave, sheetRef, resetForm, t]);

  const handleCancel = useCallback(() => {
    resetForm();
    sheetRef.current?.close();
  }, [resetForm, sheetRef]);

  return (
    <BottomSheet ref={sheetRef} snapPoints={["70%"]} index={-1} enablePanDownToClose>
      <BottomSheetView>
        <View className="px-5 pb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            {t("recurring.addSubscription")}
          </Text>

          {/* Payee */}
          <View className="mb-3">
            <Input
              label={t("recurring.payee")}
              value={payee}
              onChangeText={setPayee}
              placeholder="e.g. Netflix"
              error={payeeError}
            />
          </View>

          {/* Amount */}
          <View className="mb-3">
            <Input
              label={t("recurring.amount")}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              error={amountError}
            />
          </View>

          {/* Frequency toggle */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-surface-900 uppercase tracking-wider mb-2">
              {t("recurring.frequency")}
            </Text>
            <View className="flex-row gap-2">
              {FREQUENCIES.map((f) => (
                <Pressable
                  key={f}
                  className={`flex-1 rounded-full py-2 items-center ${
                    frequency === f ? "bg-primary-500" : "bg-surface-300"
                  }`}
                  onPress={() => setFrequency(f)}
                >
                  <Text
                    className={`text-xs font-bold ${
                      frequency === f ? "text-white" : "text-surface-900"
                    }`}
                  >
                    {t(frequencyLabelKey[f])}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Type toggle */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-surface-900 uppercase tracking-wider mb-2">
              {t("transaction.expense")} / {t("transaction.income")}
            </Text>
            <View className="flex-row gap-2">
              {TYPES.map((tp) => (
                <Pressable
                  key={tp}
                  className={`flex-1 rounded-full py-2 items-center ${
                    type === tp ? "bg-primary-500" : "bg-surface-300"
                  }`}
                  onPress={() => setType(tp)}
                >
                  <Text
                    className={`text-xs font-bold ${
                      type === tp ? "text-white" : "text-surface-900"
                    }`}
                  >
                    {tp === "expense" ? t("transaction.expense") : t("transaction.income")}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Next due date */}
          <View className="mb-4">
            <Input
              label="Next Due Date"
              value={nextDueDate}
              onChangeText={setNextDueDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Save button */}
          <Pressable className="bg-primary-500 rounded-xl py-3 mt-2" onPress={handleSave}>
            <Text className="text-white font-bold text-center">{t("recurring.save")}</Text>
          </Pressable>

          {/* Cancel button */}
          <Pressable className="bg-transparent rounded-xl py-3 mt-2" onPress={handleCancel}>
            <Text className="text-surface-900 font-bold text-center">{t("recurring.cancel")}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
