import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RuleCarousel } from "../../src/components/onboarding/RuleCarousel";
import { useOnboarding } from "../../src/hooks/use-onboarding";
import i18n from "../../src/lib/i18n";
import { useAppStore } from "../../src/stores/app-store";

export default function RulesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { advance, skip } = useOnboarding();
  const setLocale = useAppStore((s) => s.setLocale);
  const locale = useAppStore((s) => s.locale);

  const handleLanguageToggle = () => {
    const newLocale = locale === "en" ? "bn" : "en";
    i18n.changeLanguage(newLocale);
    setLocale(newLocale);
  };

  const handleLetsGo = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    advance(0);
    router.push("/onboarding/account");
  };

  const handleSkip = () => {
    skip();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Language Toggle */}
      <View className="flex-row justify-end px-6 pt-2">
        <Pressable
          onPress={handleLanguageToggle}
          className="rounded-lg border border-border/40 px-3 py-1.5"
          accessibilityLabel="Toggle language"
        >
          <Text className="text-sm font-bold text-primary-400">
            {locale === "en" ? "\u09AC\u09BE\u0982" : "EN"}
          </Text>
        </Pressable>
      </View>

      {/* Rule Carousel */}
      <View className="flex-1 justify-center px-4">
        <RuleCarousel />
      </View>

      {/* Bottom Buttons */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleLetsGo}
          className="bg-primary-500 rounded-xl py-4 items-center"
          accessibilityRole="button"
        >
          <Text className="text-base font-bold text-white">{t("onboarding.letsGo")}</Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          className="mt-3 items-center py-2"
          accessibilityRole="button"
        >
          <Text className="text-sm text-surface-800">{t("onboarding.skip")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
