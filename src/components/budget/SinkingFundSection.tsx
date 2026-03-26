import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SINKING_FUND_TEMPLATES } from "../../services/mock-data";
import { SinkingFundRow } from "./SinkingFundRow";

/**
 * Mock accumulation data for offline development.
 * These values simulate varying progress states for each sinking fund.
 */
const MOCK_ACCUMULATIONS: Record<string, { accumulated: number; monthsRemaining: number }> = {
  eid_fund: { accumulated: 1500000, monthsRemaining: 3 }, // 60% of 25,00,000 target
  school_fees: { accumulated: 1500000, monthsRemaining: 9 }, // 30% of 50,00,000 target
  wedding_gifts: { accumulated: 2400000, monthsRemaining: 2 }, // 80% of 30,00,000 target
  medical_reserve: { accumulated: 1000000, monthsRemaining: 10 }, // 20% of 50,00,000 target
};

export function SinkingFundSection() {
  const { t } = useTranslation();

  const preSelectedFunds = SINKING_FUND_TEMPLATES;

  if (preSelectedFunds.length === 0) {
    return (
      <View className="mx-4 mt-3">
        <Text className="text-2xs font-bold uppercase tracking-widest text-surface-800 px-1 mb-2">
          {t("sinkingFunds.title" as any)}
        </Text>
        <View className="bg-surface-200 rounded-2xl p-4 items-center">
          <Text className="text-sm font-bold text-surface-900">
            {t("sinkingFunds.noFunds" as any)}
          </Text>
          <Text className="text-2xs text-surface-800 mt-1 text-center">
            {t("sinkingFunds.noFundsDesc" as any)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mt-3">
      <Text className="text-2xs font-bold uppercase tracking-widest text-surface-800 px-1 mb-2">
        {t("sinkingFunds.title" as any)}
      </Text>
      <View className="bg-surface-200 rounded-2xl p-3 overflow-hidden">
        {preSelectedFunds.map((fund, index) => {
          const mock = MOCK_ACCUMULATIONS[fund.id] ?? {
            accumulated: 0,
            monthsRemaining: fund.monthsToTarget,
          };
          return (
            <View key={fund.id}>
              {index > 0 && <View className="h-px bg-border/15 mx-2" />}
              <SinkingFundRow
                template={fund}
                accumulated={mock.accumulated}
                targetAmount={fund.targetAmount}
                monthsRemaining={mock.monthsRemaining}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
