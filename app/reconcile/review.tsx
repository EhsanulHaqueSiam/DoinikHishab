import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";
import { formatDate } from "../../src/lib/date";
import { useAppStore } from "../../src/stores/app-store";

const RESOLUTION_LABELS: Record<string, string> = {
  adjustment: "Adjustment created",
  untracked: "Tagged as untracked",
  accepted: "Accepted as-is",
};

const RESOLUTION_COLORS: Record<string, string> = {
  adjustment: "text-primary-700",
  untracked: "text-warning",
  accepted: "text-surface-800",
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
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-surface-100 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-700 font-semibold text-xs">Back</Text>
        </Pressable>
        <Text className="text-xs font-bold text-foreground uppercase tracking-widest">
          Reconciliation History
        </Text>
        <View className="w-10" />
      </View>

      {/* Account Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 bg-surface-100 border-b border-border"
      >
        <View className="flex-row gap-2">
          {accounts
            ?.filter((a) => !a.isClosed)
            .map((account) => (
              <Pressable key={account._id} onPress={() => setSelectedAccountId(account._id)}>
                <View
                  className={`px-4 py-2 rounded-full border ${
                    selectedAccountId === account._id
                      ? "bg-primary-500 border-primary-500"
                      : "bg-surface-200 border-border/40"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedAccountId === account._id ? "text-white" : "text-foreground"
                    }`}
                  >
                    {account.name}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>
      </ScrollView>

      <View className="flex-1 px-4 pt-4">
        {!selectedAccountId && (
          <View className="items-center py-12">
            <Text className="text-surface-800 text-xs">Select an account to view history</Text>
          </View>
        )}

        {selectedAccountId && !reconciliations?.length && (
          <View className="items-center py-12">
            <Text className="text-surface-800 text-xs">No reconciliations yet</Text>
          </View>
        )}

        {selectedAccountId && reconciliations && reconciliations.length > 0 && (
          <FlatList
            data={reconciliations}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 pb-8"
            removeClippedSubviews
            scrollEventThrottle={8}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <Card className="px-4 py-0">
                <View className="flex-row items-center justify-between py-3">
                  <Text className="text-xs font-bold text-foreground">{formatDate(item.date)}</Text>
                  {item.resolution && (
                    <Text
                      className={`text-2xs font-bold uppercase tracking-wider ${RESOLUTION_COLORS[item.resolution] ?? "text-surface-800"}`}
                    >
                      {RESOLUTION_LABELS[item.resolution] ?? item.resolution}
                    </Text>
                  )}
                </View>
                <View className="h-px bg-border/15" />
                <View className="flex-row justify-between py-2.5">
                  <Text className="text-2xs text-surface-800">Expected</Text>
                  <Text className="text-2xs font-bold text-foreground">
                    {formatCurrency(item.expectedBalance)}
                  </Text>
                </View>
                <View className="flex-row justify-between py-2.5">
                  <Text className="text-2xs text-surface-800">Actual</Text>
                  <Text className="text-2xs font-bold text-foreground">
                    {formatCurrency(item.endingBalance)}
                  </Text>
                </View>
                <View className="h-px bg-border/15" />
                <View className="flex-row justify-between py-3">
                  <Text className="text-xs font-bold text-foreground">Gap</Text>
                  <Text
                    className={`text-xs font-bold ${item.gap === 0 ? "text-success" : item.gap > 0 ? "text-primary-700" : "text-danger"}`}
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
