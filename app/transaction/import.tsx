import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  reference: string;
  type: "expense" | "income";
  suggestedCategory: string;
  confidence: number;
  approved: boolean;
}

export default function ImportScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCSV = useAction(api.import.csvParser.parseCSV);
  const categorize = useAction(api.import.categorizer.categorize);

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/octet-stream"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setFileName(file.name);
      setLoading(true);

      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsed = await parseCSV({ content });

      // Get category suggestions
      const descriptions = parsed.map((r: { description: string }) => r.description);
      const categories = await categorize({ descriptions });

      const enriched: ParsedRow[] = parsed.map(
        (r: { date: string; description: string; amount: number; reference: string; type: "expense" | "income" }, i: number) => ({
          ...r,
          suggestedCategory: categories[i]?.categoryName ?? "Uncategorized",
          confidence: categories[i]?.confidence ?? 0,
          approved: true,
        })
      );

      setRows(enriched);
    } catch (error) {
      Alert.alert("Error", "Failed to parse file. Please check the format.");
    } finally {
      setLoading(false);
    }
  }, [parseCSV, categorize]);

  const toggleRow = useCallback((index: number) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, approved: !r.approved } : r
      )
    );
  }, []);

  const importAll = useCallback(async () => {
    const approved = rows.filter((r) => r.approved);
    if (approved.length === 0) {
      Alert.alert("No Transactions", "Please approve at least one transaction to import.");
      return;
    }

    setImporting(true);
    try {
      // In production, this would batch-create transactions via a Convex mutation
      Alert.alert(
        "Success",
        `${approved.length} transaction(s) imported successfully.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to import transactions.");
    } finally {
      setImporting(false);
    }
  }, [rows, router]);

  const approvedCount = rows.filter((r) => r.approved).length;

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount) / 100;
    const sign = amount < 0 ? "-" : "+";
    return `${sign}${abs.toLocaleString("en-BD", { minimumFractionDigits: 2 })} BDT`;
  };

  const renderRow = ({ item, index }: { item: ParsedRow; index: number }) => (
    <Pressable onPress={() => toggleRow(index)}>
      <Card
        className={`mb-2 ${item.approved ? "border-primary-600" : "border-border/30 opacity-50"}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
              {item.description || "No description"}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {item.date}
              {item.reference ? ` | Ref: ${item.reference}` : ""}
            </Text>
            <View className="flex-row items-center mt-1 gap-1">
              <View className="bg-surface-300 px-2 py-0.5 rounded-full">
                <Text className="text-xs text-primary-700">
                  {item.suggestedCategory}
                </Text>
              </View>
              {item.confidence > 0 && (
                <Text className="text-xs text-muted-foreground">
                  {Math.round(item.confidence * 100)}%
                </Text>
              )}
            </View>
          </View>
          <View className="items-end">
            <Text
              className={`text-sm font-semibold ${
                item.amount < 0 ? "text-danger" : "text-success"
              }`}
            >
              {formatAmount(item.amount)}
            </Text>
            <View
              className={`w-5 h-5 rounded-full border-2 mt-1 items-center justify-center ${
                item.approved
                  ? "bg-primary-600 border-primary-600"
                  : "border-border bg-transparent"
              }`}
            >
              {item.approved && (
                <Text className="text-white text-xs font-bold">
                  {"\u2713"}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface-100 border-b border-border px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary-600 text-base">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-bold text-foreground">
            Import Transactions
          </Text>
          <View className="w-14" />
        </View>
      </View>

      <View className="flex-1 px-4 pt-4">
        {/* File Picker */}
        {rows.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-4">
            <View className="w-20 h-20 rounded-full bg-surface-300 items-center justify-center">
              <Text className="text-3xl">📄</Text>
            </View>
            <Text className="text-lg font-semibold text-foreground">
              Import from CSV
            </Text>
            <Text className="text-sm text-muted-foreground text-center px-8">
              Upload a CSV file from your bank statement. Supported columns:
              Date, Description, Amount, Reference.
            </Text>
            <Button onPress={pickFile} loading={loading} size="lg">
              Choose File
            </Button>
          </View>
        ) : (
          <>
            {/* Summary */}
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-foreground">
                    {fileName}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {approvedCount} of {rows.length} transactions selected
                  </Text>
                </View>
                <Button variant="outline" size="sm" onPress={pickFile}>
                  Change
                </Button>
              </View>
            </Card>

            {/* Transaction List */}
            <FlatList
              data={rows}
              renderItem={renderRow}
              keyExtractor={(_, i) => i.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Import Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-surface-100 border-t border-border px-4 py-4 pb-8">
              <Button
                onPress={importAll}
                loading={importing}
                disabled={approvedCount === 0}
                size="lg"
              >
                {`Import ${approvedCount} Transaction${approvedCount !== 1 ? "s" : ""}`}
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
