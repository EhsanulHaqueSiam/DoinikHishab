import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import type React from "react";
import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import type { BillItem, BillStatus } from "./recurring-types";

interface BillDaySheetProps {
  bills: BillItem[];
  date: string; // YYYY-MM-DD
  sheetRef: React.RefObject<BottomSheet>;
}

const STATUS_STYLES: Record<BillStatus, { container: string; text: string; label: string }> = {
  paid: {
    container: "bg-primary-500/20 px-2 py-0.5 rounded-full",
    text: "text-2xs font-bold text-primary-500",
    label: "Paid",
  },
  upcoming: {
    container: "bg-accent/20 px-2 py-0.5 rounded-full",
    text: "text-2xs font-bold text-accent",
    label: "Upcoming",
  },
  overdue: {
    container: "bg-danger/20 px-2 py-0.5 rounded-full",
    text: "text-2xs font-bold text-danger",
    label: "Overdue",
  },
};

function formatSheetDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BillDaySheet({ bills, date, sheetRef }: BillDaySheetProps) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={["40%"]}
      index={-1}
      enablePanDownToClose
      accessibilityViewIsModal
    >
      <BottomSheetView className="px-5 pt-2 pb-4">
        {/* Header */}
        <Text className="text-lg font-bold text-foreground mb-3">{formatSheetDate(date)}</Text>

        {/* Bill List */}
        {bills.map((bill) => {
          const statusStyle = STATUS_STYLES[bill.status];
          const statusLabel = t(
            `recurring.${bill.status}` as
              | "recurring.paid"
              | "recurring.upcoming"
              | "recurring.overdue"
          );

          return (
            <View
              key={bill.id}
              className="flex-row items-center justify-between py-3 border-b border-border/20"
            >
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">{bill.payee}</Text>
                <Text className="text-2xs text-surface-800 mt-0.5">
                  {formatCurrency(bill.amount)}
                </Text>
              </View>

              <View className={statusStyle.container} accessibilityLabel={statusLabel}>
                <Text className={statusStyle.text}>{statusLabel}</Text>
              </View>
            </View>
          );
        })}
      </BottomSheetView>
    </BottomSheet>
  );
}
