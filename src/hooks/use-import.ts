/**
 * useImport Hook
 *
 * State machine managing the import workflow:
 * idle -> picking -> parsing -> review -> importing -> success
 *                                                   -> error
 *
 * Per IMPT-05: All file parsing happens on-device with no network calls.
 */

import * as DocumentPicker from "expo-document-picker";
import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner-native";
import {
  detectDuplicates,
  type ParsedTransaction,
  parseStatement,
  type StatementFormat,
} from "../services/statement-parser";
import { getJSON, setJSON } from "../services/storage";

const IMPORT_STORAGE_KEY = "import:transactions";

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export type ImportState =
  | "idle"
  | "picking"
  | "parsing"
  | "review"
  | "importing"
  | "success"
  | "error";

interface ImportHookState {
  state: ImportState;
  transactions: ParsedTransaction[];
  duplicates: Map<number, boolean>;
  selected: Set<number>;
  error: string | null;
  provider: StatementFormat;
}

export function useImport() {
  const [hookState, setHookState] = useState<ImportHookState>({
    state: "idle",
    transactions: [],
    duplicates: new Map(),
    selected: new Set(),
    error: null,
    provider: "unknown",
  });

  const pickFile = useCallback(async () => {
    setHookState((prev) => ({ ...prev, state: "picking" }));

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_MIME_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setHookState((prev) => ({ ...prev, state: "idle" }));
        return;
      }

      const asset = result.assets[0];
      if (!asset) {
        setHookState((prev) => ({ ...prev, state: "idle" }));
        return;
      }

      setHookState((prev) => ({ ...prev, state: "parsing" }));

      const { uri, name: fileName, mimeType } = asset;

      // Determine file reading strategy
      const isPDF = mimeType === "application/pdf";
      const isBinary = mimeType?.includes("excel") || mimeType?.includes("spreadsheet") || false;

      let data = "";

      if (isPDF) {
        // For PDF: pass fileUri directly to parseStatement for native PDF extraction
        data = "";
      } else if (isBinary) {
        // XLS: read as base64
        data = await readAsStringAsync(uri, {
          encoding: EncodingType.Base64,
        });
      } else {
        // TXT: read as UTF-8
        data = await readAsStringAsync(uri, {
          encoding: EncodingType.UTF8,
        });
      }

      // Parse the statement
      const importResult = await parseStatement(data, isBinary, fileName, mimeType, uri);

      if (importResult.transactions.length === 0) {
        setHookState((prev) => ({
          ...prev,
          state: "error",
          error: "import.parseError",
          transactions: [],
          duplicates: new Map(),
          selected: new Set(),
        }));
        return;
      }

      // Load existing imported transactions for dedup
      const existing = getJSON<ParsedTransaction[]>(IMPORT_STORAGE_KEY) ?? [];

      // Detect duplicates
      const duplicateMap = detectDuplicates(importResult.transactions, existing);

      // Initialize selected with all non-duplicate indices
      const initialSelected = new Set<number>();
      importResult.transactions.forEach((_, idx) => {
        if (!duplicateMap.get(idx)) {
          initialSelected.add(idx);
        }
      });

      setHookState({
        state: "review",
        transactions: importResult.transactions,
        duplicates: duplicateMap,
        selected: initialSelected,
        error: null,
        provider: importResult.provider,
      });
    } catch (error) {
      setHookState((prev) => ({
        ...prev,
        state: "error",
        error: "import.parseError",
      }));
    }
  }, []);

  const toggleSelection = useCallback((index: number) => {
    setHookState((prev) => {
      const newSelected = new Set(prev.selected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return { ...prev, selected: newSelected };
    });
  }, []);

  const selectAll = useCallback(() => {
    setHookState((prev) => {
      const newSelected = new Set<number>();
      prev.transactions.forEach((_, idx) => {
        if (!prev.duplicates.get(idx)) {
          newSelected.add(idx);
        }
      });
      return { ...prev, selected: newSelected };
    });
  }, []);

  const deselectAll = useCallback(() => {
    setHookState((prev) => ({
      ...prev,
      selected: new Set<number>(),
    }));
  }, []);

  const toggleType = useCallback((index: number) => {
    setHookState((prev) => {
      const newTransactions = [...prev.transactions];
      const txn = newTransactions[index];
      if (txn) {
        newTransactions[index] = {
          ...txn,
          type: txn.type === "expense" ? "income" : "expense",
        };
      }
      return { ...prev, transactions: newTransactions };
    });
  }, []);

  const importSelected = useCallback(async () => {
    setHookState((prev) => ({ ...prev, state: "importing" }));

    try {
      const existing = getJSON<ParsedTransaction[]>(IMPORT_STORAGE_KEY) ?? [];

      const selectedTransactions = hookState.transactions.filter((_, idx) =>
        hookState.selected.has(idx)
      );

      const updated = [...existing, ...selectedTransactions];
      setJSON(IMPORT_STORAGE_KEY, updated);

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics may not be available on web
      }

      toast.success(`Imported ${selectedTransactions.length} transactions`);

      setHookState((prev) => ({
        ...prev,
        state: "success",
      }));
    } catch {
      setHookState((prev) => ({
        ...prev,
        state: "error",
        error: "import.importError",
      }));
    }
  }, [hookState.transactions, hookState.selected]);

  const reset = useCallback(() => {
    setHookState({
      state: "idle",
      transactions: [],
      duplicates: new Map(),
      selected: new Set(),
      error: null,
      provider: "unknown",
    });
  }, []);

  const selectedCount = useMemo(() => hookState.selected.size, [hookState.selected]);

  const duplicateCount = useMemo(() => {
    let count = 0;
    hookState.duplicates.forEach((isDup) => {
      if (isDup) count++;
    });
    return count;
  }, [hookState.duplicates]);

  return {
    state: hookState.state,
    transactions: hookState.transactions,
    duplicates: hookState.duplicates,
    selected: hookState.selected,
    error: hookState.error,
    provider: hookState.provider,
    pickFile,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleType,
    importSelected,
    reset,
    selectedCount,
    duplicateCount,
  };
}
