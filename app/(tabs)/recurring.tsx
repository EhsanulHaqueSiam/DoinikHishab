import type BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AddSubscriptionForm } from "../../src/components/recurring/AddSubscriptionForm";
import { BillCalendarGrid } from "../../src/components/recurring/BillCalendarGrid";
import { BillDaySheet } from "../../src/components/recurring/BillDaySheet";
import { BillListView } from "../../src/components/recurring/BillListView";
import { BillSummaryCard } from "../../src/components/recurring/BillSummaryCard";
import { CashFlowChart } from "../../src/components/recurring/CashFlowChart";
import { ForecastRangeToggle } from "../../src/components/recurring/ForecastRangeToggle";
import type {
  BillItem,
  DetectedSubscription,
  Subscription,
} from "../../src/components/recurring/recurring-types";
import { SubscriptionCard } from "../../src/components/recurring/SubscriptionCard";
import { SubscriptionHeader } from "../../src/components/recurring/SubscriptionHeader";
import { SubscriptionList } from "../../src/components/recurring/SubscriptionList";
import { ViewToggle } from "../../src/components/recurring/ViewToggle";
import { projectCashFlow, useRecurringData } from "../../src/hooks/use-recurring-data";
import {
  dismissPayee,
  removeSubscription,
  saveSubscription,
} from "../../src/services/recurring-storage";

// Mock current balance: Tk 150,000 = 15,000,000 paisa
const MOCK_CURRENT_BALANCE = 15000000;

export default function RecurringScreen() {
  const { t } = useTranslation();

  // View state
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(30);

  // Bottom sheet day detail state
  const [selectedDayBills, setSelectedDayBills] = useState<BillItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Bottom sheet refs
  const daySheetRef = useRef<BottomSheet>(null);
  const addFormSheetRef = useRef<BottomSheet>(null);

  // Data refresh key -- increment to re-render when MMKV data changes
  const [refreshKey, setRefreshKey] = useState(0);

  // Data from hook (re-evaluated when refreshKey changes via key prop or useMemo dependency)
  const { bills, subscriptions, detectedSubscriptions } = useRecurringData();

  // Project cash flow
  const forecastData = projectCashFlow(MOCK_CURRENT_BALANCE, subscriptions, forecastHorizon);

  // Computed bill summary
  const upcomingTotal = bills
    .filter((b) => b.status === "upcoming" || b.status === "overdue")
    .reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
  const billCount = bills.length;

  // Handlers
  const handleDayPress = useCallback((date: string, dayBills: BillItem[]) => {
    setSelectedDayBills(dayBills);
    setSelectedDate(date);
    daySheetRef.current?.snapToIndex(0);
  }, []);

  const handleConfirmSubscription = useCallback((sub: DetectedSubscription) => {
    saveSubscription({
      payee: sub.payee,
      amount: sub.amount,
      frequency: sub.frequency,
      categoryId: sub.categoryId || "mock_cat_1",
      nextDueDate: sub.lastDate,
      isActive: true,
      type: "expense",
    });
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDismissPayee = useCallback((payee: string) => {
    dismissPayee(payee);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleRemoveSubscription = useCallback((id: string) => {
    removeSubscription(id);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSaveNewSubscription = useCallback((sub: Omit<Subscription, "id">) => {
    saveSubscription(sub);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleOpenAddForm = useCallback(() => {
    addFormSheetRef.current?.snapToIndex(0);
  }, []);

  return (
    <View className="flex-1 bg-background" key={refreshKey}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ========== Section 1: Bills ========== */}
        <BillSummaryCard
          upcomingTotal={upcomingTotal}
          paidTotal={paidTotal}
          billCount={billCount}
        />

        <ViewToggle selected={viewMode} onChange={setViewMode} />

        {viewMode === "calendar" ? (
          <BillCalendarGrid bills={bills} onDayPress={handleDayPress} />
        ) : (
          <BillListView bills={bills} />
        )}

        {/* ========== Section 2: Subscriptions ========== */}
        <Text className="text-lg font-bold text-foreground px-4 mt-6 mb-2">
          {t("recurring.subscriptionsTitle")}
        </Text>

        <SubscriptionHeader subscriptions={subscriptions} />

        {/* Detected Subscriptions */}
        {detectedSubscriptions.length > 0 && (
          <View>
            <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest px-4 mt-4">
              {t("recurring.detectedHeader")}
            </Text>
            {detectedSubscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.payee}
                subscription={sub}
                onConfirm={handleConfirmSubscription}
                onDismiss={handleDismissPayee}
              />
            ))}
          </View>
        )}

        {/* Confirmed Subscriptions */}
        <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest px-4 mt-4">
          {t("recurring.confirmedHeader")}
        </Text>
        <SubscriptionList subscriptions={subscriptions} onRemove={handleRemoveSubscription} />

        {/* Add Subscription Button */}
        <Pressable
          className="bg-primary-500 mx-4 mt-4 mb-2 rounded-xl py-3"
          onPress={handleOpenAddForm}
          accessibilityRole="button"
        >
          <Text className="text-white font-bold text-center text-sm">
            {t("recurring.addSubscription")}
          </Text>
        </Pressable>

        {/* ========== Section 3: Cash Flow Forecast ========== */}
        <Text className="text-lg font-bold text-foreground px-4 mt-6 mb-2">
          {t("recurring.cashFlow")}
        </Text>

        <ForecastRangeToggle selected={forecastHorizon} onChange={setForecastHorizon} />

        <CashFlowChart data={forecastData} horizon={forecastHorizon} />
      </ScrollView>

      {/* Bottom Sheets (outside ScrollView) */}
      <BillDaySheet bills={selectedDayBills} date={selectedDate} sheetRef={daySheetRef} />

      <AddSubscriptionForm sheetRef={addFormSheetRef} onSave={handleSaveNewSubscription} />
    </View>
  );
}
