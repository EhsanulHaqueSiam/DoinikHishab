/**
 * FilePickerButton
 *
 * Card with upload icon for selecting a bKash or Nagad statement file.
 * Per D-09: expo-document-picker filtered to PDF/XLS/TXT MIME types.
 */

import { Upload } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import { Card } from "../ui/Card";

interface FilePickerButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function FilePickerButton({ onPress, disabled = false }: FilePickerButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Select statement file. Accepted formats: PDF, XLS, TXT"
    >
      {({ pressed }) => (
        <Card
          variant="outline"
          className={`items-center justify-center py-10 ${
            pressed ? "bg-surface-400/30" : ""
          } ${disabled ? "opacity-50" : ""}`}
        >
          <View className="items-center gap-3">
            <View className="rounded-full bg-primary-500/10 p-4">
              <Upload size={32} color="#0d9488" />
            </View>
            <Text className="text-sm font-bold text-foreground">{t("import.selectFile")}</Text>
            <Text className="text-2xs text-surface-800">{t("import.acceptedFormats")}</Text>
          </View>
        </Card>
      )}
    </Pressable>
  );
}
