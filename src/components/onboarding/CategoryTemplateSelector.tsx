import React from "react";
import { View, Text, Pressable } from "react-native";
import { BookOpen, Briefcase, Laptop, Users } from "lucide-react-native";
import { CATEGORY_TEMPLATE_SETS } from "../../services/mock-data";
import { useTranslation } from "../../lib/i18n";

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  BookOpen,
  Briefcase,
  Laptop,
  Users,
};

const ICON_COLORS: Record<string, string> = {
  student: "#0d9488",
  professional: "#e6a444",
  freelancer: "#8b5cf6",
  family: "#34d399",
};

interface CategoryTemplateSelectorProps {
  selectedId: string | null;
  onSelect: (templateId: string) => void;
}

export function CategoryTemplateSelector({
  selectedId,
  onSelect,
}: CategoryTemplateSelectorProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap gap-3">
      {CATEGORY_TEMPLATE_SETS.map((template) => {
        const isSelected = selectedId === template.id;
        const IconComponent = ICON_MAP[template.icon] || BookOpen;
        const iconColor = ICON_COLORS[template.id] || "#0d9488";

        return (
          <Pressable
            key={template.id}
            onPress={() => onSelect(template.id)}
            className={`rounded-xl p-4 ${
              isSelected
                ? "border-2 border-primary-500 bg-primary-50"
                : "border border-border/40 bg-card"
            }`}
            style={{ width: "48%" }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(template.nameKey as any)}
          >
            <IconComponent size={32} color={iconColor} />

            <Text className="text-sm font-bold text-foreground mt-2">
              {t(template.nameKey as any)}
            </Text>

            <Text className="text-2xs text-surface-800 mt-1">
              {t(template.descriptionKey as any)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
