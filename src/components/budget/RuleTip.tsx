import React, { useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { isTipDismissed, dismissTip } from "../../services/onboarding";

interface RuleTipProps {
  ruleId: string;
  titleKey: string;
  bodyKey: string;
}

export function RuleTip({ ruleId, titleKey, bodyKey }: RuleTipProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => isTipDismissed(ruleId));

  const handleDismiss = useCallback(() => {
    dismissTip(ruleId);
    setDismissed(true);
  }, [ruleId]);

  if (dismissed) {
    return null;
  }

  return (
    <View className="mx-4 my-2 p-3 bg-primary-50 border border-primary-400/20 rounded-xl">
      <Text className="text-xs font-bold text-primary-700">
        {t(titleKey as any)}
      </Text>
      <Text className="text-2xs text-surface-900 leading-4 mt-1">
        {t(bodyKey as any)}
      </Text>
      <Pressable
        onPress={handleDismiss}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("tips.dismiss" as any)}
        className="self-end mt-2"
      >
        <Text className="text-2xs text-surface-800">
          {t("tips.dismiss" as any)}
        </Text>
      </Pressable>
    </View>
  );
}
