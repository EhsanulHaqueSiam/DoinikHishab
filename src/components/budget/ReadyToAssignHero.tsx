import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { shadow } from "../../lib/platform";

interface ReadyToAssignHeroProps {
  amount: number;
  onPress?: () => void;
}

export function ReadyToAssignHero({ amount, onPress }: ReadyToAssignHeroProps) {
  const { t } = useTranslation();

  const formattedAmount = formatCurrency(amount);
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const isZero = amount === 0;

  const amountColorClass = isNegative ? "text-danger" : "text-primary-700";

  const subtitle = isPositive
    ? t("readyToAssign.positive")
    : isZero
      ? t("readyToAssign.zero")
      : t("readyToAssign.overAssigned");

  const glowStyle = isPositive
    ? shadow("#0d9488", 0, 4, 0.2, 20, 8)
    : isNegative
      ? shadow("#f87171", 0, 4, 0.15, 20, 8)
      : undefined;

  return (
    <Pressable
      onPress={onPress}
      className="active:bg-surface-400/30"
      accessibilityRole="button"
      accessibilityLabel={`${t("readyToAssign.title")}: ${formattedAmount}`}
    >
      <View
        className="bg-surface-200 rounded-2xl p-5 mx-4 mt-3 items-center border border-primary-400/15"
        style={glowStyle}
      >
        <Text className="text-2xs font-bold text-surface-800 uppercase tracking-widest">
          {t("readyToAssign.title")}
        </Text>
        <Text
          className={`text-hero font-bold tracking-tight mt-1 ${amountColorClass}`}
          style={{ lineHeight: 42 }}
        >
          {formattedAmount}
        </Text>
        <Text className="text-2xs text-surface-800 mt-1">{subtitle}</Text>
      </View>
    </Pressable>
  );
}
