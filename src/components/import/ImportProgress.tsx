/**
 * ImportProgress
 *
 * Parsing progress indicator with ActivityIndicator and text.
 * Shown during file parse and import operations.
 */

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface ImportProgressProps {
  message?: string;
}

export function ImportProgress({ message = "Parsing statement..." }: ImportProgressProps) {
  return (
    <View className="items-center justify-center py-8 gap-3">
      <ActivityIndicator size="large" color="#0d9488" />
      <Text className="text-sm text-surface-800">{message}</Text>
    </View>
  );
}
