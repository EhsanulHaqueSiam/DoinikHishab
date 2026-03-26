import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import type { TimeRange } from "./report-types";
import { TIME_RANGES } from "./report-types";

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const RANGE_I18N_KEYS: Record<TimeRange, string> = {
  "1M": "reports.range1M",
  "3M": "reports.range3M",
  "6M": "reports.range6M",
  "1Y": "reports.range1Y",
  ALL: "reports.rangeAll",
};

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row justify-between mx-4 mt-3 mb-2">
      {TIME_RANGES.map((range) => {
        const isActive = range === selected;
        return (
          <Pressable
            key={range}
            onPress={() => onChange(range)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t("reports.rangeLabel", { range: t(RANGE_I18N_KEYS[range]) })}
            className={`rounded-full px-3 py-2 min-w-[44px] items-center ${
              isActive ? "bg-primary-500" : "bg-surface-300"
            }`}
          >
            <Text className={`text-2xs font-bold ${isActive ? "text-white" : "text-surface-900"}`}>
              {t(RANGE_I18N_KEYS[range])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
