import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { formatCurrency, parseCurrencyInput } from "../../src/lib/currency";
import { shadow } from "../../src/lib/platform";
import { today } from "../../src/lib/date";
import type { Id } from "../../convex/_generated/dataModel";

type Step = "select-account" | "count" | "result";

export default function ReconcileScreen() {
  const router = useRouter();
  const { userId } = useAppStore();

  const [step, setStep] = useState<Step>("select-account");
  const [selectedAccountId, setSelectedAccountId] = useState<Id<"accounts"> | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [reconciliationId, setReconciliationId] = useState<Id<"reconciliations"> | null>(null);
  const [gap, setGap] = useState(0);
  const [saving, setSaving] = useState(false);

  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");
  const selectedAccount = accounts?.find((a) => a._id === selectedAccountId);

  const startReconciliation = useMutation(api.reconciliation.startReconciliation);
  const completeReconciliation = useMutation(api.reconciliation.completeReconciliation);

  const handleSelectAccount = useCallback(
    async (accountId: Id<"accounts">) => {
      if (!userId) return;
      setSelectedAccountId(accountId);
      const id = await startReconciliation({ userId, accountId, date: today() });
      setReconciliationId(id);
      setStep("count");
    },
    [userId, startReconciliation]
  );

  const handleSubmitCount = useCallback(() => {
    if (!selectedAccount) return;
    const actualPaisa = parseCurrencyInput(amountInput);
    setGap(actualPaisa - selectedAccount.balance);
    setStep("result");
  }, [amountInput, selectedAccount]);

  const handleResolve = useCallback(
    async (resolution: "adjustment" | "untracked" | "accepted") => {
      if (!reconciliationId) return;
      setSaving(true);
      try {
        await completeReconciliation({
          id: reconciliationId,
          actualBalance: parseCurrencyInput(amountInput),
          resolution,
        });
        router.back();
      } finally {
        setSaving(false);
      }
    },
    [reconciliationId, amountInput, completeReconciliation, router]
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-surface-100 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-700 font-semibold text-xs">Cancel</Text>
        </Pressable>
        <Text className="text-xs font-bold text-foreground uppercase tracking-widest">Reconcile</Text>
        <Pressable onPress={() => router.push("/reconcile/review")}>
          <Text className="text-primary-700 font-semibold text-xs">History</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-5" scrollEventThrottle={8} decelerationRate="fast">
        {step === "select-account" && (
          <View className="gap-3">
            <Text className="text-sm font-bold text-foreground mb-1">
              Which account to reconcile?
            </Text>
            {accounts?.filter((a) => !a.isClosed).map((account) => (
              <Pressable key={account._id} onPress={() => handleSelectAccount(account._id)}>
                <Card className="flex-row items-center justify-between active:bg-surface-400/30">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">{account.name}</Text>
                    <Text className="text-2xs text-surface-800 uppercase tracking-wider mt-0.5">
                      {account.type.replace("_", " ")}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-foreground">{formatCurrency(account.balance)}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {step === "count" && selectedAccount && (
          <View className="gap-4">
            <Card>
              <Text className="text-sm font-bold text-foreground mb-1">Count your cash</Text>
              <Text className="text-xs text-surface-800 mb-4">
                Enter the actual amount in <Text className="font-bold text-foreground">{selectedAccount.name}</Text>.
              </Text>
              <Text className="text-2xs text-surface-700 mb-2">
                App balance: {formatCurrency(selectedAccount.balance)}
              </Text>
              <Input label="Actual amount (in taka)" placeholder="0.00" keyboardType="decimal-pad" value={amountInput} onChangeText={setAmountInput} autoFocus />
            </Card>
            <Button onPress={handleSubmitCount} size="lg" disabled={!amountInput || amountInput === "0"}>
              Compare
            </Button>
          </View>
        )}

        {step === "result" && selectedAccount && (
          <View className="gap-4">
            <Card className="items-center py-8" style={gap === 0 ? shadow("#34d399", 0, 0, 0.1, 16) : shadow("#f87171", 0, 0, 0.1, 16)}>
              {gap === 0 ? (
                <>
                  <Text className="text-4xl mb-2">✓</Text>
                  <Text className="text-base font-bold text-success">Perfect match!</Text>
                  <Text className="text-2xs text-surface-800 mt-1">Your records match your actual balance.</Text>
                </>
              ) : (
                <>
                  <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-1">Difference</Text>
                  <Text className={`text-hero font-bold tracking-tight ${gap > 0 ? "text-success" : "text-danger"}`} style={{ lineHeight: 44 }}>
                    {gap > 0 ? "+" : ""}{formatCurrency(gap)}
                  </Text>
                  <Text className="text-2xs text-surface-800 mt-2 text-center px-4">
                    {gap > 0 ? "You have more than the app shows." : "You have less than the app shows."}
                  </Text>
                </>
              )}
            </Card>

            <Card className="px-4 py-0">
              <View className="flex-row justify-between py-3">
                <Text className="text-xs text-surface-800">App balance</Text>
                <Text className="text-xs font-bold text-foreground">{formatCurrency(selectedAccount.balance)}</Text>
              </View>
              <View className="h-px bg-border/15" />
              <View className="flex-row justify-between py-3">
                <Text className="text-xs text-surface-800">Actual balance</Text>
                <Text className="text-xs font-bold text-foreground">{formatCurrency(parseCurrencyInput(amountInput))}</Text>
              </View>
            </Card>

            {gap === 0 ? (
              <Button onPress={() => handleResolve("accepted")} size="lg" loading={saving}>
                Confirm Reconciliation
              </Button>
            ) : (
              <View className="gap-3">
                <Button onPress={() => handleResolve("adjustment")} size="lg" loading={saving}>
                  Create Adjustment Transaction
                </Button>
                <Button variant="secondary" onPress={() => handleResolve("untracked")} size="lg" loading={saving}>
                  Tag as Untracked Spending
                </Button>
                <Button variant="ghost" onPress={() => handleResolve("accepted")} loading={saving}>
                  Accept Difference
                </Button>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
