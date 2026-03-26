import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { usePlatform } from "../../hooks/use-platform";
import { Card } from "../ui/Card";
import { SankeyVertical } from "./SankeyVertical";
import { SankeyHorizontal } from "./SankeyHorizontal";
import { PrivacyToggle, usePrivacyMode } from "./PrivacyToggle";
import { ReportEmptyState } from "./ReportEmptyState";
import type { CategorySpendingData } from "./report-types";

interface SankeyDiagramProps {
  spending: CategorySpendingData[];
  totalIncome: number;
}

export function SankeyDiagram({ spending, totalIncome }: SankeyDiagramProps) {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();
  const { width: windowWidth } = useWindowDimensions();
  const [isPrivacy, togglePrivacy] = usePrivacyMode();

  if (spending.length === 0 || totalIncome === 0) {
    return (
      <Card className="mx-4">
        <ReportEmptyState
          type="cashflow"
          title={t("reports.noCashFlowTitle")}
          body={t("reports.noCashFlowBody")}
        />
      </Card>
    );
  }

  const chartWidth = Math.min(windowWidth - 32, 480); // mx-4 padding, max 480px
  const chartHeight = isMobile ? 320 : 400;

  const SankeyComponent = isMobile ? SankeyVertical : SankeyHorizontal;

  return (
    <View className="mx-4">
      {/* Header row: title + privacy toggle */}
      <View className="flex-row items-center justify-between mt-4 mb-2">
        <Text className="text-lg font-bold text-foreground">
          {t("reports.cashFlowTitle")}
        </Text>
        <PrivacyToggle isPrivacy={isPrivacy} onToggle={togglePrivacy} />
      </View>

      <Card>
        <SankeyComponent
          spending={spending}
          totalIncome={totalIncome}
          isPrivacy={isPrivacy}
          width={chartWidth}
          height={chartHeight}
        />
      </Card>

      {/* Sankey legend */}
      <View className="flex-row flex-wrap gap-3 mt-3 px-1">
        <View className="flex-row items-center gap-1">
          <View
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#0d9488" }}
          />
          <Text className="text-2xs text-surface-800">
            {t("transaction.income")}
          </Text>
        </View>
        {spending.slice(0, isMobile ? 8 : 15).map((cat) => (
          <View
            key={cat.categoryId}
            className="flex-row items-center gap-1"
          >
            <View
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: cat.color }}
            />
            <Text className="text-2xs text-surface-800">
              {cat.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
