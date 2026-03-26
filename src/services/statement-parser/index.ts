/**
 * Statement Parser Service
 *
 * Main entry point for statement parsing. Provides format detection,
 * parse dispatch, and duplicate detection.
 * Per IMPT-05: All parsing happens on-device with no network calls.
 */

import { parseBkashText } from "./bkash-parser";
import { parseNagadText } from "./nagad-parser";
import { parsePDF } from "./pdf-parser";
import type { ImportResult, ParsedTransaction, StatementFormat } from "./types";
import { parseXLS } from "./xls-parser";

export type { ImportResult, ParsedTransaction, ParseError, StatementFormat } from "./types";

/**
 * Detect whether text content is from bKash or Nagad.
 */
export function detectFormat(text: string): StatementFormat {
  const lower = text.toLowerCase();
  if (lower.includes("bkash") || lower.includes("trx id")) return "bkash";
  if (lower.includes("nagad")) return "nagad";
  return "unknown";
}

/**
 * Generate a hash for duplicate detection.
 */
function transactionHash(date: string, amount: number, reference: string): string {
  return `${date}|${amount}|${reference}`;
}

/**
 * Detect duplicate transactions by comparing parsed against existing.
 * Returns a Map where key is the index in parsed array, value is true if duplicate.
 */
export function detectDuplicates(
  parsed: ParsedTransaction[],
  existing: ParsedTransaction[]
): Map<number, boolean> {
  const existingHashes = new Set(
    existing.map((t) => transactionHash(t.date, t.amount, t.reference))
  );
  const duplicates = new Map<number, boolean>();
  parsed.forEach((t, idx) => {
    duplicates.set(idx, existingHashes.has(transactionHash(t.date, t.amount, t.reference)));
  });
  return duplicates;
}

/**
 * Parse a statement file and return structured transactions.
 *
 * @param data - File contents (text for TXT, base64 for XLS)
 * @param isBinary - Whether data is base64-encoded binary
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @param fileUri - File URI (needed for PDF parsing)
 */
export async function parseStatement(
  data: string,
  isBinary: boolean,
  fileName: string,
  mimeType?: string,
  fileUri?: string
): Promise<ImportResult> {
  // PDF dispatch
  if (mimeType === "application/pdf") {
    try {
      const transactions = await parsePDF(fileUri || "");
      const provider = transactions.length > 0 ? transactions[0].provider : "unknown";
      return { transactions, errors: [], provider };
    } catch (error) {
      return {
        transactions: [],
        errors: [error instanceof Error ? error.message : "PDF parsing failed"],
        provider: "unknown",
      };
    }
  }

  // XLS/XLSX dispatch
  if (isBinary || mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) {
    try {
      // Auto-detect provider from file name or default to bkash
      const providerHint = fileName.toLowerCase().includes("nagad") ? "nagad" : "bkash";
      const transactions = parseXLS(data, providerHint);
      return {
        transactions,
        errors: [],
        provider: providerHint,
      };
    } catch (error) {
      return {
        transactions: [],
        errors: [error instanceof Error ? error.message : "XLS parsing failed"],
        provider: "unknown",
      };
    }
  }

  // Text dispatch
  const format = detectFormat(data);
  let transactions: ParsedTransaction[] = [];

  if (format === "bkash") {
    transactions = parseBkashText(data);
  } else if (format === "nagad") {
    transactions = parseNagadText(data);
  } else {
    // Try both parsers
    transactions = parseBkashText(data);
    if (transactions.length === 0) {
      transactions = parseNagadText(data);
    }
  }

  return {
    transactions,
    errors: transactions.length === 0 ? ["Could not parse the statement content"] : [],
    provider: format,
  };
}
