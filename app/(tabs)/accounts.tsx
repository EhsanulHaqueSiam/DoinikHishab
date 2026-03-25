import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { ACCOUNT_TYPE_LABELS } from "../../src/lib/constants";
import { formatCurrency, takaToPaisa } from "../../src/lib/currency";
import { shadow } from "../../src/lib/platform";
import { useAppStore } from "../../src/stores/app-store";

type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "credit_card"
  | "line_of_credit"
  | "mortgage"
  | "auto_loan"
  | "student_loan"
  | "other_debt"
  | "other_asset";

const ACCOUNT_ICONS: Record<string, string> = {
  checking: "🏧",
  savings: "🏦",
  cash: "💵",
  credit_card: "💳",
  line_of_credit: "💳",
  mortgage: "🏠",
  auto_loan: "🚗",
  student_loan: "🎓",
  other_debt: "📄",
  other_asset: "💎",
};

export default function AccountsScreen() {
  const { userId } = useAppStore();
  const router = useRouter();
  const { t } = useTranslation();

  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");
  const balances = useQuery(api.accounts.getTotalBalance, userId ? { userId } : "skip");
  const createAccount = useMutation(api.accounts.create);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AccountType>("cash");
  const [newBalance, setNewBalance] = useState("");

  const handleAdd = async () => {
    if (!userId || !newName.trim()) return;
    await createAccount({
      userId,
      name: newName.trim(),
      type: newType,
      balance: takaToPaisa(parseFloat(newBalance) || 0),
    });
    setNewName("");
    setNewBalance("");
    setShowAddForm(false);
  };

  const budgetAccounts = accounts?.filter((a) => a.isBudget && !a.isClosed) ?? [];
  const trackingAccounts = accounts?.filter((a) => !a.isBudget && !a.isClosed) ?? [];
  const closedAccounts = accounts?.filter((a) => a.isClosed) ?? [];

  const renderAccountGroup = (title: string, accts: typeof budgetAccounts, total: number) => {
    if (accts.length === 0) return null;
    return (
      <View className="mb-5">
        <View className="flex-row items-center justify-between px-4 mb-2">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {title}
          </Text>
          <Text className="text-xs font-bold text-accent-500">{formatCurrency(total)}</Text>
        </View>
        <Card className="mx-4 p-0 overflow-hidden">
          {accts.map((account, idx) => (
            <Pressable
              key={account._id}
              onPress={() => router.push(`/account/${account._id}` as any)}
              className="flex-row items-center px-4 py-3.5 active:bg-surface-400/40"
            >
              <View className="w-10 h-10 rounded-xl bg-surface-300 items-center justify-center mr-3">
                <Text className="text-lg">{ACCOUNT_ICONS[account.type] || "🏧"}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{account.name}</Text>
                <Text className="text-2xs text-surface-800 mt-0.5">
                  {ACCOUNT_TYPE_LABELS[account.type]}
                </Text>
              </View>
              <Text
                className={`text-sm font-bold tracking-tight ${account.balance >= 0 ? "text-foreground" : "text-danger"}`}
              >
                {formatCurrency(account.balance)}
              </Text>
              {idx < accts.length - 1 && (
                <View className="absolute bottom-0 left-16 right-0 h-px bg-border/15" />
              )}
            </Pressable>
          ))}
        </Card>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate="fast"
        removeClippedSubviews
      >
        {/* Net Worth Hero */}
        <View className="px-4 py-5">
          <Card
            className="items-center border-accent-300/10"
            style={shadow("#e6a444", 0, 4, 0.08, 20, 6)}
          >
            <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
              {t("accounts.netWorth")}
            </Text>
            <Text
              className="text-hero font-bold text-foreground mt-1 tracking-tight"
              style={{ lineHeight: 42 }}
            >
              {formatCurrency(balances?.total ?? 0)}
            </Text>
          </Card>
        </View>

        {renderAccountGroup(
          t("accounts.budgetAccounts"),
          budgetAccounts,
          balances?.budgetTotal ?? 0
        )}
        {renderAccountGroup(
          t("accounts.trackingAccounts"),
          trackingAccounts,
          balances?.trackingTotal ?? 0
        )}
        {closedAccounts.length > 0 && renderAccountGroup(t("accounts.closed"), closedAccounts, 0)}

        {/* Add Account */}
        {!showAddForm ? (
          <View className="px-4 mb-8">
            <Button variant="outline" onPress={() => setShowAddForm(true)}>
              + {t("accounts.addAccount")}
            </Button>
          </View>
        ) : (
          <View className="px-4 mb-8">
            <Card>
              <Text className="text-sm font-bold text-foreground mb-4">
                {t("accounts.addAccount")}
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder={t("accounts.accountName")}
                className="border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground mb-3 bg-surface-200"
                placeholderTextColor="#4e6381"
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(
                  ([type, label]) => (
                    <Pressable
                      key={type}
                      onPress={() => setNewType(type)}
                      className={`px-3 py-2 rounded-lg mr-2 ${newType === type ? "bg-primary-500" : "bg-surface-300"}`}
                      style={newType === type ? shadow("#0d9488", 0, 0, 0.3, 6) : undefined}
                    >
                      <Text
                        className={`text-xs font-medium ${newType === type ? "text-white" : "text-foreground"}`}
                      >
                        {ACCOUNT_ICONS[type]} {label}
                      </Text>
                    </Pressable>
                  )
                )}
              </ScrollView>

              <TextInput
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder={`${t("accounts.startingBalance")} (৳)`}
                keyboardType="numeric"
                className="border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground mb-4 bg-surface-200"
                placeholderTextColor="#4e6381"
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button variant="ghost" onPress={() => setShowAddForm(false)}>
                    {t("common.cancel")}
                  </Button>
                </View>
                <View className="flex-1">
                  <Button onPress={handleAdd} disabled={!newName.trim()}>
                    {t("common.save")}
                  </Button>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
