import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { formatCurrency, takaToPaisa } from "../../src/lib/currency";
import { ACCOUNT_TYPE_LABELS } from "../../src/lib/constants";

type AccountType = "checking" | "savings" | "cash" | "credit_card" | "line_of_credit" | "mortgage" | "auto_loan" | "student_loan" | "other_debt" | "other_asset";

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

  const accounts = useQuery(
    api.accounts.list,
    userId ? { userId } : "skip"
  );
  const balances = useQuery(
    api.accounts.getTotalBalance,
    userId ? { userId } : "skip"
  );

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

  const renderAccountGroup = (
    title: string,
    accts: typeof budgetAccounts,
    total: number
  ) => {
    if (accts.length === 0) return null;
    return (
      <View className="mb-6">
        <View className="flex-row items-center justify-between px-4 mb-2">
          <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </Text>
          <Text className="text-sm font-semibold text-foreground">
            {formatCurrency(total)}
          </Text>
        </View>
        <Card className="mx-4 p-0 overflow-hidden">
          {accts.map((account, idx) => (
            <Pressable
              key={account._id}
              onPress={() => router.push(`/account/${account._id}` as any)}
              className="flex-row items-center px-4 py-3.5 active:bg-muted/50"
            >
              <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center mr-3">
                <Text className="text-lg">
                  {ACCOUNT_ICONS[account.type] || "🏧"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">
                  {account.name}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {ACCOUNT_TYPE_LABELS[account.type]}
                </Text>
              </View>
              <Text
                className={`text-base font-semibold ${
                  account.balance >= 0 ? "text-foreground" : "text-danger"
                }`}
              >
                {formatCurrency(account.balance)}
              </Text>
              {idx < accts.length - 1 && (
                <View className="absolute bottom-0 left-16 right-0 h-px bg-border/30" />
              )}
            </Pressable>
          ))}
        </Card>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Total Balance */}
        <View className="px-4 py-4">
          <Card className="items-center">
            <Text className="text-sm text-muted-foreground">Net Worth</Text>
            <Text className="text-3xl font-bold text-foreground mt-1">
              {formatCurrency(balances?.total ?? 0)}
            </Text>
          </Card>
        </View>

        {renderAccountGroup(
          "Budget Accounts",
          budgetAccounts,
          balances?.budgetTotal ?? 0
        )}
        {renderAccountGroup(
          "Tracking Accounts",
          trackingAccounts,
          balances?.trackingTotal ?? 0
        )}
        {closedAccounts.length > 0 &&
          renderAccountGroup("Closed", closedAccounts, 0)}

        {/* Add Account */}
        {!showAddForm ? (
          <View className="px-4 mb-8">
            <Button variant="outline" onPress={() => setShowAddForm(true)}>
              + Add Account
            </Button>
          </View>
        ) : (
          <View className="px-4 mb-8">
            <Card>
              <Text className="text-base font-semibold text-foreground mb-3">
                New Account
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Account name"
                className="border border-border rounded-xl px-4 py-3 text-base mb-3"
                placeholderTextColor="#94a3b8"
              />

              {/* Type selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                {(
                  Object.entries(ACCOUNT_TYPE_LABELS) as [
                    AccountType,
                    string,
                  ][]
                ).map(([type, label]) => (
                  <Pressable
                    key={type}
                    onPress={() => setNewType(type)}
                    className={`px-3 py-2 rounded-lg mr-2 ${
                      newType === type
                        ? "bg-primary-600"
                        : "bg-muted"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        newType === type ? "text-white" : "text-foreground"
                      }`}
                    >
                      {ACCOUNT_ICONS[type]} {label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <TextInput
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder="Starting balance (৳)"
                keyboardType="numeric"
                className="border border-border rounded-xl px-4 py-3 text-base mb-4"
                placeholderTextColor="#94a3b8"
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    variant="ghost"
                    onPress={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </View>
                <View className="flex-1">
                  <Button onPress={handleAdd} disabled={!newName.trim()}>
                    Add
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
