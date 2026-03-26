import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import type { BillItem, BillStatus } from "./recurring-types";

interface BillListViewProps {
  bills: BillItem[];
}

type SectionKey = "thisWeek" | "nextWeek" | "thisMonth";

interface ListItem {
  type: "header" | "bill";
  key: string;
  sectionKey?: SectionKey;
  bill?: BillItem;
}

const STATUS_STYLES: Record<BillStatus, { container: string; text: string }> = {
  paid: {
    container: "bg-primary-500/20 px-2 py-0.5 rounded-full",
    text: "text-2xs font-bold text-primary-500",
  },
  upcoming: {
    container: "bg-accent/20 px-2 py-0.5 rounded-full",
    text: "text-2xs font-bold text-accent",
  },
  overdue: {
    container: "bg-danger/20 px-2 py-0.5 rounded-full",
    text: "text-2xs font-bold text-danger",
  },
};

function getEndOfWeek(date: Date): Date {
  const end = new Date(date);
  const daysUntilSat = 6 - end.getDay();
  end.setDate(end.getDate() + daysUntilSat);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getEndOfNextWeek(date: Date): Date {
  const endOfThisWeek = getEndOfWeek(date);
  const endOfNextWeek = new Date(endOfThisWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
  return endOfNextWeek;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function groupBills(bills: BillItem[], now: Date): Record<SectionKey, BillItem[]> {
  const endOfThisWeek = getEndOfWeek(now);
  const endOfNextWeek = getEndOfNextWeek(now);

  const groups: Record<SectionKey, BillItem[]> = {
    thisWeek: [],
    nextWeek: [],
    thisMonth: [],
  };

  // Sort bills by due date ascending
  const sorted = [...bills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  for (const bill of sorted) {
    const dueDate = new Date(`${bill.dueDate}T00:00:00`);

    if (dueDate <= endOfThisWeek) {
      groups.thisWeek.push(bill);
    } else if (dueDate <= endOfNextWeek) {
      groups.nextWeek.push(bill);
    } else {
      groups.thisMonth.push(bill);
    }
  }

  return groups;
}

export function BillListView({ bills }: BillListViewProps) {
  const { t } = useTranslation();

  const listData = useMemo(() => {
    if (bills.length === 0) return [];

    const now = new Date();
    const groups = groupBills(bills, now);
    const items: ListItem[] = [];

    const sectionOrder: SectionKey[] = ["thisWeek", "nextWeek", "thisMonth"];
    const _sectionLabels: Record<SectionKey, string> = {
      thisWeek: t("recurring.thisWeek"),
      nextWeek: t("recurring.nextWeek"),
      thisMonth: t("recurring.thisMonth"),
    };

    for (const section of sectionOrder) {
      const sectionBills = groups[section];
      if (sectionBills.length > 0) {
        items.push({
          type: "header",
          key: `header_${section}`,
          sectionKey: section,
        });
        for (const bill of sectionBills) {
          items.push({
            type: "bill",
            key: bill.id,
            bill,
          });
        }
      }
    }

    return items;
  }, [bills, t]);

  if (bills.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <Text className="text-lg font-bold text-foreground text-center">
          {t("recurring.noBillsTitle")}
        </Text>
        <Text className="text-sm text-surface-800 text-center mt-2">
          {t("recurring.noBillsBody")}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return (
        <View className="px-4 py-2 mt-3">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {item.sectionKey === "thisWeek"
              ? t("recurring.thisWeek")
              : item.sectionKey === "nextWeek"
                ? t("recurring.nextWeek")
                : t("recurring.thisMonth")}
          </Text>
        </View>
      );
    }

    const bill = item.bill as BillItem;
    const statusStyle = STATUS_STYLES[bill.status];
    const statusLabel =
      bill.status === "paid"
        ? t("recurring.paid")
        : bill.status === "upcoming"
          ? t("recurring.upcoming")
          : t("recurring.overdue");

    return (
      <View className="px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-bold text-foreground">{bill.payee}</Text>
          <Text className="text-2xs text-surface-800 mt-0.5">{formatDueDate(bill.dueDate)}</Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-sm font-bold text-surface-900">{formatCurrency(bill.amount)}</Text>
          <View className={statusStyle.container} accessibilityLabel={statusLabel}>
            <Text className={statusStyle.text}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <FlashList
        data={listData}
        renderItem={renderItem}
        estimatedItemSize={60}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}
