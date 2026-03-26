/**
 * XLS/XLSX Statement Parser
 *
 * Parses Excel files using SheetJS (xlsx library) into ParsedTransaction[].
 * Supports both .xls (BIFF) and .xlsx (OOXML) formats.
 */

import * as XLSX from "xlsx";
import { mapTransactionType } from "./type-mapping";
import type { ParsedTransaction } from "./types";

/**
 * Normalize a date value from Excel to YYYY-MM-DD.
 */
function normalizeDate(dateVal: string | number): string {
  if (typeof dateVal === "number") {
    // Excel serial date number
    const date = new Date((dateVal - 25569) * 86400 * 1000);
    return date.toISOString().slice(0, 10);
  }

  const str = String(dateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const slashMatch = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slashMatch) {
    const [, part1, part2, year] = slashMatch;
    const p1 = parseInt(part1, 10);
    const p2 = parseInt(part2, 10);
    if (p1 > 12) {
      return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
    }
    return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
  }

  return str;
}

/**
 * Parse a BDT amount to positive integer paisa.
 */
function parseBDTAmount(val: string | number): number {
  if (typeof val === "number") return Math.round(Math.abs(val) * 100);
  const cleaned = String(val)
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "");
  const value = Math.abs(parseFloat(cleaned));
  if (isNaN(value)) return 0;
  return Math.round(value * 100);
}

/**
 * Find a value by checking multiple possible column names in a row object.
 */
function findValue(row: Record<string, unknown>, ...candidates: string[]): unknown {
  for (const candidate of candidates) {
    // Exact match
    if (row[candidate] !== undefined) return row[candidate];
    // Case-insensitive match
    const key = Object.keys(row).find((k) => k.trim().toLowerCase() === candidate.toLowerCase());
    if (key !== undefined && row[key] !== undefined) return row[key];
  }
  return undefined;
}

/**
 * Parse an XLS/XLSX file (base64 encoded) into ParsedTransaction[].
 * Provider must be specified since format detection from binary is unreliable.
 */
export function parseXLS(base64Data: string, provider: "bkash" | "nagad"): ParsedTransaction[] {
  const workbook = XLSX.read(base64Data, { type: "base64" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const transactions: ParsedTransaction[] = [];

  for (const row of rows) {
    const dateVal = findValue(row, "Date", "Transaction Date", "Trx Date");
    const typeVal = findValue(row, "Transaction Type", "Trx Type", "Type");
    const amountVal = findValue(row, "Amount", "Transacted Amount");
    const refVal = findValue(row, "Trx ID", "TrxID", "Reference", "Ref");

    if (!dateVal || !amountVal) continue;

    const originalType = String(typeVal ?? "");
    const amount = parseBDTAmount(amountVal as string | number);
    if (amount === 0) continue;

    transactions.push({
      date: normalizeDate(dateVal as string | number),
      description: originalType,
      amount,
      type: mapTransactionType(originalType, provider),
      reference: String(refVal ?? ""),
      provider,
      originalType,
    });
  }

  return transactions;
}
