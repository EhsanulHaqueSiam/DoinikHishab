import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";

interface ViewToggleProps {
  selected: "calendar" | "list";
  onChange: (view: "calendar" | "list") => void;
}

export function ViewToggle({ selected, onChange }: ViewToggleProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-2 mx-4 mt-4">
      <Pressable
        className={`rounded-full px-3 py-2 min-w-[44px] items-center ${
          selected === "calendar" ? "bg-primary-500" : "bg-surface-300"
        }`}
        onPress={() => onChange("calendar")}
        accessibilityRole="tab"
        accessibilityState={{ selected: selected === "calendar" }}
      >
        <Text
          className={`text-sm font-semibold ${
            selected === "calendar" ? "text-white" : "text-surface-900"
          }`}
        >
          {t("recurring.calendarView")}
        </Text>
      </Pressable>

      <Pressable
        className={`rounded-full px-3 py-2 min-w-[44px] items-center ${
          selected === "list" ? "bg-primary-500" : "bg-surface-300"
        }`}
        onPress={() => onChange("list")}
        accessibilityRole="tab"
        accessibilityState={{ selected: selected === "list" }}
      >
        <Text
          className={`text-sm font-semibold ${
            selected === "list" ? "text-white" : "text-surface-900"
          }`}
        >
          {t("recurring.listView")}
        </Text>
      </Pressable>
    </View>
  );
}
