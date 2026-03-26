import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { takaToPaisa, paisaToTaka } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import { Input } from "../ui/Input";
import type { PayDownGoal } from "../../services/goal-storage/types";

interface DebtFormProps {
  sheetRef: React.RefObject<BottomSheet>;
  onSave: (debt: Omit<PayDownGoal, "id"> | PayDownGoal) => void;
  initialDebt?: PayDownGoal;
}

export function DebtForm({ sheetRef, onSave, initialDebt }: DebtFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [nameError, setNameError] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [aprError, setAprError] = useState("");
  const [minPaymentError, setMinPaymentError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (initialDebt) {
      setName(initialDebt.name);
      setBalance(String(paisaToTaka(initialDebt.balance)));
      setApr(String(initialDebt.aprPercent));
      setMinPayment(String(paisaToTaka(initialDebt.minPayment)));
    }
  }, [initialDebt]);

  const resetForm = useCallback(() => {
    setName("");
    setBalance("");
    setApr("");
    setMinPayment("");
    setNameError("");
    setBalanceError("");
    setAprError("");
    setMinPaymentError("");
  }, []);

  const handleSave = useCallback(async () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError(t("goals.nameLabel" as any) + " required");
      hasError = true;
    } else {
      setNameError("");
    }

    const numericBalance = parseFloat(balance);
    if (!balance || isNaN(numericBalance) || numericBalance <= 0) {
      setBalanceError(t("goals.currentBalance" as any) + " must be > 0");
      hasError = true;
    } else {
      setBalanceError("");
    }

    const numericApr = parseFloat(apr);
    if (apr === "" || isNaN(numericApr) || numericApr < 0 || numericApr > 100) {
      setAprError("APR must be 0-100");
      hasError = true;
    } else {
      setAprError("");
    }

    const numericMinPayment = parseFloat(minPayment);
    if (!minPayment || isNaN(numericMinPayment) || numericMinPayment <= 0) {
      setMinPaymentError(t("goals.minPayment" as any) + " must be > 0");
      hasError = true;
    } else {
      setMinPaymentError("");
    }

    if (hasError) return;

    const balanceInPaisa = takaToPaisa(numericBalance);
    const minPaymentInPaisa = takaToPaisa(numericMinPayment);
    const today = new Date().toISOString().split("T")[0];

    if (initialDebt) {
      onSave({
        ...initialDebt,
        name: name.trim(),
        balance: balanceInPaisa,
        aprPercent: numericApr,
        minPayment: minPaymentInPaisa,
      });
    } else {
      onSave({
        name: name.trim(),
        balance: balanceInPaisa,
        aprPercent: numericApr,
        minPayment: minPaymentInPaisa,
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
  }, [name, balance, apr, minPayment, initialDebt, onSave, sheetRef, resetForm, t]);

  const handleCancel = useCallback(() => {
    resetForm();
    sheetRef.current?.close();
  }, [resetForm, sheetRef]);

  return (
    <BottomSheet ref={sheetRef} snapPoints={["70%"]} index={-1} enablePanDownToClose>
      <BottomSheetView>
        <View className="px-5 pb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            {initialDebt ? "Edit Debt" : t("goals.addDebt" as any)}
          </Text>

          {/* Name */}
          <View className="mb-3">
            <Input
              label={t("goals.nameLabel" as any)}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Credit Card"
              error={nameError}
            />
          </View>

          {/* Balance */}
          <View className="mb-3">
            <Input
              label={t("goals.currentBalance" as any)}
              value={balance}
              onChangeText={setBalance}
              keyboardType="numeric"
              placeholder="0.00"
              error={balanceError}
            />
          </View>

          {/* APR */}
          <View className="mb-3">
            <Input
              label={t("goals.apr" as any)}
              value={apr}
              onChangeText={setApr}
              keyboardType="numeric"
              placeholder="12.5"
              error={aprError}
            />
          </View>

          {/* Min Payment */}
          <View className="mb-4">
            <Input
              label={t("goals.minPayment" as any)}
              value={minPayment}
              onChangeText={setMinPayment}
              keyboardType="numeric"
              placeholder="0.00"
              error={minPaymentError}
            />
          </View>

          {/* Save button */}
          <Pressable className="bg-primary-500 rounded-xl py-3 mt-2" onPress={handleSave}>
            <Text className="text-white font-bold text-center">
              {initialDebt ? "Save Changes" : t("goals.addDebt" as any)}
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
