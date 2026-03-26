/**
 * ImportScreen
 *
 * Main import layout orchestrating the pick -> parse -> review -> import flow.
 * Per D-11, D-15: State-driven UI based on useImport state machine.
 */

import { AlertCircle, CircleCheck } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useImport } from "../../hooks/use-import";
import { useTranslation } from "../../lib/i18n";
import { FilePickerButton } from "./FilePickerButton";
import { ImportProgress } from "./ImportProgress";
import { ImportReviewList } from "./ImportReviewList";

export function ImportScreen() {
  const { t } = useTranslation();
  const {
    state,
    transactions,
    duplicates,
    selected,
    error,
    pickFile,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleType,
    importSelected,
    reset,
    selectedCount,
    duplicateCount,
  } = useImport();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 px-4 py-4">
        {/* Idle: Show file picker */}
        {state === "idle" && (
          <View className="flex-1 justify-center">
            <FilePickerButton onPress={pickFile} />
          </View>
        )}

        {/* Picking: Show disabled file picker */}
        {state === "picking" && (
          <View className="flex-1 justify-center">
            <FilePickerButton onPress={pickFile} disabled />
          </View>
        )}

        {/* Parsing: Show spinner */}
        {state === "parsing" && (
          <View className="flex-1 justify-center">
            <ImportProgress message={t("import.parsing")} />
          </View>
        )}

        {/* Importing: Show spinner with import text */}
        {state === "importing" && (
          <View className="flex-1 justify-center">
            <ImportProgress message={t("import.importing")} />
          </View>
        )}

        {/* Review: Show transaction list + CTA */}
        {state === "review" && (
          <>
            <View className="flex-1">
              <ImportReviewList
                transactions={transactions}
                duplicates={duplicates}
                selected={selected}
                onToggleSelect={toggleSelection}
                onToggleType={toggleType}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                duplicateCount={duplicateCount}
              />
            </View>

            {/* CTA Button */}
            <View className="pt-3">
              <Pressable
                onPress={importSelected}
                disabled={selectedCount === 0}
                accessibilityLabel={
                  selectedCount > 0
                    ? `Import ${selectedCount} transactions`
                    : t("import.selectToImport")
                }
                className={`rounded-xl py-3 items-center bg-primary-500 ${
                  selectedCount === 0 ? "opacity-30" : ""
                }`}
              >
                <Text className="text-sm font-bold text-white">
                  {selectedCount > 0
                    ? t("import.importN").replace("{{count}}", String(selectedCount))
                    : t("import.selectToImport")}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Success: Show completion message */}
        {state === "success" && (
          <View className="flex-1 items-center justify-center gap-4">
            <View className="rounded-full bg-primary-500/10 p-4">
              <CircleCheck size={48} color="#0d9488" />
            </View>
            <Text className="text-xl font-bold text-foreground">{t("import.successTitle")}</Text>
            <Pressable onPress={reset} className="rounded-xl py-3 px-6 bg-primary-500">
              <Text className="text-sm font-bold text-white">{t("import.importMore")}</Text>
            </Pressable>
          </View>
        )}

        {/* Error: Show error message with retry */}
        {state === "error" && (
          <View className="flex-1 items-center justify-center gap-4">
            <View className="rounded-full bg-danger/10 p-4">
              <AlertCircle size={48} color="#f87171" />
            </View>
            <Text className="text-sm text-surface-800 text-center px-8">
              {t("import.parseError")}
            </Text>
            <Pressable onPress={reset} className="rounded-xl py-3 px-6 bg-primary-500">
              <Text className="text-sm font-bold text-white">{t("import.tryAnother")}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
