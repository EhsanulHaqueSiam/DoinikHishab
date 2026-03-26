import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AoMTrendChart } from "../../src/components/reports/AoMTrendChart";
import { DoBTrendChart } from "../../src/components/reports/DoBTrendChart";
import { IncomeExpenseBarChart } from "../../src/components/reports/IncomeExpenseBarChart";
import { NetWorthLineChart } from "../../src/components/reports/NetWorthLineChart";
import { ReportEmptyState } from "../../src/components/reports/ReportEmptyState";
// Plan 01 components
import type { ReportType, TimeRange } from "../../src/components/reports/report-types";
// Plan 03 components
import { SankeyDiagram } from "../../src/components/reports/SankeyDiagram";
// Plan 02 components
import { SpendingBarChart } from "../../src/components/reports/SpendingBarChart";
import { SwipeableChart } from "../../src/components/reports/SwipeableChart";
import { TimeRangeSelector } from "../../src/components/reports/TimeRangeSelector";
import { Card } from "../../src/components/ui/Card";
import { useReportData } from "../../src/hooks/use-report-data";

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState<ReportType>("spending");
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [currentPeriod, setCurrentPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data, currentMonth } = useReportData(timeRange, currentPeriod);

  // Month navigation via swipe
  const navigateMonth = useCallback((direction: 1 | -1) => {
    setCurrentPeriod((prev) => {
      const [year, month] = prev.split("-").map(Number);
      const date = new Date(year, month - 1 + direction, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
  }, []);

  const handleNext = useCallback(() => navigateMonth(1), [navigateMonth]);
  const handlePrev = useCallback(() => navigateMonth(-1), [navigateMonth]);

  // Format period label (e.g., "March 2026")
  const periodLabel = formatPeriodLabel(currentPeriod, timeRange);

  // Tab definitions: 5 tabs
  const tabs: { key: ReportType; label: string }[] = [
    { key: "spending", label: t("reports.spending") },
    { key: "income_expense", label: t("reports.incomeExpense") },
    { key: "net_worth", label: t("reports.netWorth") },
    { key: "financial_health", label: t("reports.financialHealth") },
    { key: "sankey", label: t("reports.cashFlow") },
  ];

  return (
    <View testID="reports-screen" className="flex-1 bg-background">
      {/* Report Type Tabs -- scrollable if 5 tabs overflow */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-surface-100 border-b border-border"
        contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 4 }}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            testID={`report-tab-${tab.key}`}
            onPress={() => setActiveReport(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeReport === tab.key }}
            className={`py-3 px-3 items-center border-b-2 ${
              activeReport === tab.key ? "border-primary-600" : "border-transparent"
            }`}
            style={{ minWidth: 70 }}
          >
            <Text
              className={`text-xs font-semibold tracking-wide uppercase ${
                activeReport === tab.key ? "text-primary-700" : "text-surface-800"
              }`}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* TimeRangeSelector -- pill strip */}
      <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />

      {/* Period Label */}
      <Text className="text-sm font-bold text-foreground text-center mb-2">{periodLabel}</Text>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate="fast"
        removeClippedSubviews
      >
        <SwipeableChart onNext={handleNext} onPrev={handlePrev}>
          {/* Spending Tab */}
          {activeReport === "spending" && (
            <View className="px-4">
              <Card>
                {currentMonth && currentMonth.spendingByCategory.length > 0 ? (
                  <SpendingBarChart
                    categories={currentMonth.spendingByCategory}
                    totalSpending={currentMonth.expense}
                  />
                ) : (
                  <ReportEmptyState
                    type="spending"
                    title={t("reports.noSpendingTitle")}
                    body={t("reports.noSpendingBody")}
                  />
                )}
              </Card>
            </View>
          )}

          {/* Income/Expense Tab */}
          {activeReport === "income_expense" && (
            <View className="px-4">
              <Card>
                {data.length > 0 ? (
                  <IncomeExpenseBarChart data={data} />
                ) : (
                  <ReportEmptyState
                    type="transactions"
                    title={t("reports.noTransactionsTitle")}
                    body={t("reports.noTransactionsBody")}
                  />
                )}
              </Card>
            </View>
          )}

          {/* Net Worth Tab */}
          {activeReport === "net_worth" && (
            <View className="px-4">
              {data.length > 0 ? (
                <NetWorthLineChart data={data} />
              ) : (
                <Card>
                  <ReportEmptyState
                    type="accounts"
                    title={t("reports.noAccountsTitle")}
                    body={t("reports.noAccountsBody")}
                  />
                </Card>
              )}
            </View>
          )}

          {/* Financial Health Tab */}
          {activeReport === "financial_health" && (
            <View className="px-4">
              {data.length > 0 ? (
                <View className="gap-4">
                  <Card className="border border-primary-400/15">
                    <AoMTrendChart data={data} />
                  </Card>
                  <Card className="border border-accent-300/10">
                    <DoBTrendChart data={data} />
                  </Card>
                </View>
              ) : (
                <Card>
                  <ReportEmptyState
                    type="trend"
                    title={t("reports.noTrendTitle")}
                    body={t("reports.noTrendBody")}
                  />
                </Card>
              )}
            </View>
          )}

          {/* Cash Flow (Sankey) Tab */}
          {activeReport === "sankey" && (
            <View>
              {currentMonth && currentMonth.spendingByCategory.length > 0 ? (
                <SankeyDiagram
                  spending={currentMonth.spendingByCategory}
                  totalIncome={currentMonth.income}
                />
              ) : (
                <View className="px-4">
                  <Card>
                    <ReportEmptyState
                      type="cashflow"
                      title={t("reports.noCashFlowTitle")}
                      body={t("reports.noCashFlowBody")}
                    />
                  </Card>
                </View>
              )}
            </View>
          )}
        </SwipeableChart>

        {/* Bottom spacer for tab bar */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

/**
 * Format period label based on current period and time range.
 * 1M: "March 2026", 3M: "Jan - Mar 2026", 6M: "Oct 2025 - Mar 2026", etc.
 */
function formatPeriodLabel(period: string, timeRange: TimeRange): string {
  const [year, month] = period.split("-").map(Number);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (timeRange === "1M") {
    return `${months[month - 1]} ${year}`;
  }

  const rangeMonths: Record<string, number> = { "3M": 3, "6M": 6, "1Y": 12, ALL: 24 };
  const count = rangeMonths[timeRange] || 1;
  const startDate = new Date(year, month - 1 - count + 1, 1);
  const startMonth = months[startDate.getMonth()];
  const startYear = startDate.getFullYear();
  const endMonth = months[month - 1];

  if (startYear === year) {
    return `${startMonth} - ${endMonth} ${year}`;
  }
  return `${startMonth} ${startYear} - ${endMonth} ${year}`;
}
