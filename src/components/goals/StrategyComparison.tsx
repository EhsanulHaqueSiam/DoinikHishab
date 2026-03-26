import React from "react";
import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import type { StrategyResult } from "../../services/goal-storage/types";
import { Card } from "../ui/Card";

interface StrategyComparisonProps {
  avalanche: StrategyResult;
  snowball: StrategyResult;
}

function StrategyCard({
  result,
  isRecommended,
  t,
}: {
  result: StrategyResult;
  isRecommended: boolean;
  t: (key: any, params?: any) => string;
}) {
  const strategyLabel =
    result.strategy === "avalanche" ? t("goals.avalanche" as any) : t("goals.snowball" as any);

  const payoffDateFormatted = new Date(result.payoffDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <Card
      className={`mb-3 ${isRecommended ? "border-l-4 border-primary-500" : ""}`}
      accessibilityLabel={`${strategyLabel}, ${t("goals.totalInterest" as any)} ${formatCurrency(result.totalInterest)}, ${t("goals.payoffDate" as any)} ${payoffDateFormatted}${isRecommended ? ", " + t("goals.recommended" as any) : ""}`}
    >
      {/* Strategy name + recommended badge */}
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-sm font-bold text-foreground">{strategyLabel}</Text>
        {isRecommended && (
          <Text className="text-2xs font-bold text-primary-700">
            {t("goals.recommended" as any)}
          </Text>
        )}
      </View>

      {/* Total interest */}
      <View className="flex-row justify-between mb-1">
        <Text className="text-2xs text-surface-800">{t("goals.totalInterest" as any)}</Text>
        <Text className="text-xs font-bold text-foreground">
          {formatCurrency(result.totalInterest)}
        </Text>
      </View>

      {/* Payoff date */}
      <View className="flex-row justify-between mb-1">
        <Text className="text-2xs text-surface-800">{t("goals.payoffDate" as any)}</Text>
        <Text className="text-xs font-bold text-foreground">{payoffDateFormatted}</Text>
      </View>

      {/* Total cost */}
      <View className="flex-row justify-between">
        <Text className="text-2xs text-surface-800">{t("goals.totalCost" as any)}</Text>
        <Text className="text-xs font-bold text-foreground">
          {formatCurrency(result.totalCost)}
        </Text>
      </View>
    </Card>
  );
}

export function StrategyComparison({ avalanche, snowball }: StrategyComparisonProps) {
  const { t } = useTranslation();

  // Avalanche always saves more on interest
  const interestSaved = snowball.totalInterest - avalanche.totalInterest;
  const monthsSaved = snowball.payoffMonths - avalanche.payoffMonths;

  const winnerStrategy = t("goals.avalanche" as any);

  return (
    <View>
      {/* Avalanche card (recommended) */}
      <StrategyCard result={avalanche} isRecommended={true} t={t} />

      {/* Snowball card */}
      <StrategyCard result={snowball} isRecommended={false} t={t} />

      {/* Delta row */}
      {(interestSaved > 0 || monthsSaved > 0) && (
        <Card className="mt-1">
          <Text className="text-sm font-bold text-primary-700 text-center">
            {t("goals.strategySavings" as any, {
              amount: formatCurrency(interestSaved),
              strategy: winnerStrategy,
              months: monthsSaved,
            })}
          </Text>
        </Card>
      )}
    </View>
  );
}
