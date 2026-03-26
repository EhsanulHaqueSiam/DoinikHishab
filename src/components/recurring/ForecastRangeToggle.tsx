import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";

type ForecastDays = 30 | 60 | 90;

interface ForecastRangeToggleProps {
  selected: ForecastDays;
  onChange: (days: ForecastDays) => void;
}

const OPTIONS: { days: ForecastDays; key: string }[] = [
  { days: 30, key: "recurring.days30" },
  { days: 60, key: "recurring.days60" },
  { days: 90, key: "recurring.days90" },
];

export function ForecastRangeToggle({ selected, onChange }: ForecastRangeToggleProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-between mx-4 mt-3 mb-2">
      {OPTIONS.map(({ days, key }) => {
        const isActive = days === selected;
        return (
          <Pressable
            key={days}
            onPress={() => onChange(days)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className={`rounded-full px-3 py-2 min-w-[44px] items-center ${
              isActive ? "bg-primary-500" : "bg-surface-300"
            }`}
          >
            <Text className={`text-2xs font-bold ${isActive ? "text-white" : "text-surface-900"}`}>
              {t(key)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
