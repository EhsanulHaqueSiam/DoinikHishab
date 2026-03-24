import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { formatCurrency } from "../../src/lib/currency";
import { formatDate } from "../../src/lib/date";
import type { Id } from "../../convex/_generated/dataModel";

const RESOLUTION_LABELS: Record<string, string> = {
  adjustment: "Adjustment created",
  untracked: "Tagged as untracked",
  accepted: "Accepted as-is",
};

const RESOLUTION_COLORS: Record<string, string> = {
  adjustment: "text-primary-600",
  untracked: "text-warning",
  accepted: "text-muted-foreground",
};

export default function ReconcileReviewScreen() {
  const router = useRouter();
  const { userId } = useAppStore();

  const [selectedAccountId, setSelectedAccountId] = useState<Id<"accounts"> | null>(null);

  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");
  const reconciliations = useQuery(
    api.reconciliation.listByAccount,
    selectedAccountId ? { accountId: selectedAccountId } : "skip"
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-surface-100 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-600 font-medium">Back</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          Reconciliation History
        </Text>
        <View className="w-14" />
      </View>

      {/* Account selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 bg-surface-100 border-b border-border"
      >
        <View className="flex-row gap-2">
          {accounts
            ?.filter((a) => !a.isClosed)
            .map((account) => (
              <Pressable
                key={account._id}
                onPress={() => setSelectedAccountId(account._id)}
              >
                <View
                  className={`px-4 py-2 rounded-full border ${
                    selectedAccountId === account._id
                      ? "bg-primary-600 border-primary-600"
                      : "bg-surface-200 border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedAccountId === account._id
                        ? "text-white"
                        : "text-foreground"
                    }`}
                  >
                    {account.name}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>
      </ScrollView>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {!selectedAccountId && (
          <View className="items-center py-12">
            <Text className="text-muted-foreground text-base">
              Select an account to view history
            </Text>
          </View>
        )}

        {selectedAccountId && !reconciliations?.length && (
          <View className="items-center py-12">
            <Text className="text-muted-foreground text-base">
              No reconciliations yet
            </Text>
          </View>
        )}

        {selectedAccountId && reconciliations && reconciliations.length > 0 && (
          <FlatList
            data={reconciliations}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 pb-8"
            renderItem={({ item }) => (
              <Card>
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-sm font-medium text-foreground">
                    {formatDate(item.date)}
                  </Text>
                  {item.resolution && (
                    <Text
                      className={`text-xs font-medium ${
                        RESOLUTION_COLORS[item.resolution] ?? "text-muted-foreground"
                      }`}
                    >
                      {RESOLUTION_LABELS[item.resolution] ?? item.resolution}
                    </Text>
                  )}
                </View>

                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-muted-foreground">Expected</Text>
                  <Text className="text-sm text-foreground">
                    {formatCurrency(item.expectedBalance)}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-muted-foreground">Actual</Text>
                  <Text className="text-sm text-foreground">
                    {formatCurrency(item.endingBalance)}
                  </Text>
                </View>

                <View className="flex-row justify-between pt-2 border-t border-border/50 mt-1">
                  <Text className="text-sm font-medium text-foreground">Gap</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      item.gap === 0
                        ? "text-success"
                        : item.gap > 0
                          ? "text-primary-600"
                          : "text-danger"
                    }`}
                  >
                    {item.gap === 0
                      ? "No gap"
                      : `${item.gap > 0 ? "+" : ""}${formatCurrency(item.gap)}`}
                  </Text>
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </View>
  );
}
