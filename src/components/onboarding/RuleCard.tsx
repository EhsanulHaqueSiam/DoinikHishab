import { Briefcase, Calendar, Clock, RefreshCw } from "lucide-react-native";
import type React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import type { YnabRule } from "../../services/onboarding/rules";

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Briefcase,
  Calendar,
  RefreshCw,
  Clock,
};

interface RuleCardProps {
  rule: YnabRule;
  width: number;
}

export function RuleCard({ rule, width }: RuleCardProps) {
  const { t } = useTranslation();
  const IconComponent = ICON_MAP[rule.icon] || Briefcase;

  return (
    <View className="bg-surface-200 rounded-2xl p-6 mx-4" style={{ width }}>
      <IconComponent size={48} color={rule.color} />

      <Text className="text-lg font-bold text-foreground mt-4">{t(rule.titleKey as any)}</Text>

      <Text className="text-sm text-surface-900 mt-2 leading-5">{t(rule.descKey as any)}</Text>

      <View className="mt-4 pl-3 border-l-2" style={{ borderLeftColor: "#e6a444" }}>
        <Text className="text-sm text-surface-800 leading-5">{t(rule.exampleKey as any)}</Text>
      </View>
    </View>
  );
}
