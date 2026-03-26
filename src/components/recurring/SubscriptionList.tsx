import React, { useCallback } from "react";
import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Trash2 } from "lucide-react-native";
import { useTranslation } from "../../lib/i18n";
import { formatCurrency } from "../../lib/currency";
import type { Subscription } from "./recurring-types";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onRemove: (id: string) => void;
}

const frequencyLabelKey: Record<string, string> = {
  weekly: "recurring.weekly",
  monthly: "recurring.monthly",
  yearly: "recurring.yearly",
};

function DeleteAction({ t }: { t: (key: string) => string }) {
  return (
    <View className="bg-danger justify-center items-center px-6">
      <Trash2 size={20} color="#fff" />
      <Text className="text-white text-2xs mt-1">{t("recurring.delete")}</Text>
    </View>
  );
}

export function SubscriptionList({
  subscriptions,
  onRemove,
}: SubscriptionListProps) {
  const { t } = useTranslation();

  const handleAccessibilityAction = useCallback(
    (id: string, event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === "delete") {
        onRemove(id);
      }
    },
    [onRemove],
  );

  if (subscriptions.length === 0) {
    return (
      <View className="items-center justify-center py-12 px-8">
        <Text className="text-sm font-bold text-surface-900 text-center">
          {t("recurring.noSubscriptionsTitle")}
        </Text>
        <Text className="text-2xs text-surface-800 text-center mt-2">
          {t("recurring.noSubscriptionsBody")}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Subscription }) => {
    const initial = item.payee.charAt(0).toUpperCase();

    return (
      <Swipeable
        renderRightActions={() => <DeleteAction t={t} />}
        onSwipeableOpen={(direction: string) => {
          if (direction === "right") {
            onRemove(item.id);
          }
        }}
        overshootRight={false}
      >
        <View
          className="flex-row items-center px-4 py-3 bg-surface-100"
          accessibilityActions={[
            { name: "delete", label: t("recurring.delete") },
          ]}
          onAccessibilityAction={(event) =>
            handleAccessibilityAction(item.id, event)
          }
        >
          {/* Category icon placeholder */}
          <View className="w-8 h-8 rounded-full bg-surface-300 items-center justify-center">
            <Text className="text-xs font-bold text-surface-900">
              {initial}
            </Text>
          </View>

          {/* Center: payee + frequency */}
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold text-foreground">
              {item.payee}
            </Text>
            <Text className="text-2xs text-surface-800">
              {t(frequencyLabelKey[item.frequency])}
            </Text>
          </View>

          {/* Right: amount */}
          <Text className="text-sm font-bold text-surface-900">
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </Swipeable>
    );
  };

  return (
    <FlashList
      data={subscriptions}
      renderItem={renderItem}
      estimatedItemSize={56}
      keyExtractor={(item) => item.id}
    />
  );
}
