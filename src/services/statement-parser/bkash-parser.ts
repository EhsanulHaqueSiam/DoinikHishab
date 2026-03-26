/**
 * bKash Statement Text Parser
 *
 * Parses bKash statement text (tab/comma-separated) into ParsedTransaction[].
 * Columns: SL, Trx ID, Transaction Date, Trx Type, Sender, Receiver, Reference, Amount
 * Per D-10: On-device regex parsing with flexible column matching.
 */

import { mapTransactionType } from "./type-mapping";
import type { ParsedTransaction } from "./types";

/**
 * Normalize a date string to YYYY-MM-DD format.
 * Handles DD/MM/YYYY and MM/DD/YYYY formats.
 */
function normalizeDate(dateStr: string): string {
  const cleaned = dateStr.trim();

  // Try YYYY-MM-DD (already normalized)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Try DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slashMatch) {
    const [, part1, part2, year] = slashMatch;
    const p1 = parseInt(part1, 10);
    const p2 = parseInt(part2, 10);

    // If first part > 12, it must be DD/MM/YYYY
    if (p1 > 12) {
      return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
    }
    // If second part > 12, it must be MM/DD/YYYY
    if (p2 > 12) {
      return `${year}-${String(p1).padStart(2, "0")}-${String(p2).padStart(2, "0")}`;
    }
    // Ambiguous — default to DD/MM/YYYY (common in Bangladesh)
    return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
  }

  // Try DD/MM/YY
  const shortMatch = cleaned.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2})$/);
  if (shortMatch) {
    const [, day, month, shortYear] = shortMatch;
    const year = parseInt(shortYear, 10) > 50 ? `19${shortYear}` : `20${shortYear}`;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return cleaned;
}

/**
 * Parse a BDT amount string to positive integer paisa.
 */
function parseBDTAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  const value = Math.abs(parseFloat(cleaned));
  if (isNaN(value)) return 0;
  return Math.round(value * 100);
}

/**
 * Detect the column index for known headers (case-insensitive).
 */
function findColumnIndex(headers: string[], ...candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex((h) => h.trim().toLowerCase() === candidate.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Parse bKash text statement into ParsedTransaction array.
 * Handles tab-separated and comma-separated formats.
 */
export function parseBkashText(text: string): ParsedTransaction[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Find header row
  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes("trx id") || lower.includes("trxid") || lower.includes("transaction date")) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

  // Detect separator from the header row (not first line which may be a title)
  const separator = lines[headerIndex].includes("\t") ? "\t" : ",";
  const headers = lines[headerIndex].split(separator).map((h) => h.trim());
  const trxIdCol = findColumnIndex(headers, "Trx ID", "TrxID", "Transaction ID");
  const dateCol = findColumnIndex(headers, "Transaction Date", "Date", "Trx Date");
  const typeCol = findColumnIndex(headers, "Trx Type", "Transaction Type", "Type");
  const amountCol = findColumnIndex(headers, "Amount", "Transacted Amount");
  const refCol = findColumnIndex(headers, "Reference", "Ref");

  if (dateCol === -1 || amountCol === -1) return [];

  const transactions: ParsedTransaction[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map((c) => c.trim());
    if (cols.length <= Math.max(dateCol, amountCol)) continue;

    const dateStr = cols[dateCol];
    const amount = parseBDTAmount(cols[amountCol]);
    const originalType = typeCol !== -1 ? cols[typeCol] : "";
    const reference = trxIdCol !== -1 ? cols[trxIdCol] : refCol !== -1 ? cols[refCol] : "";

    if (!dateStr || amount === 0) continue;

    transactions.push({
      date: normalizeDate(dateStr),
      description: originalType,
      amount,
      type: mapTransactionType(originalType, "bkash"),
      reference,
      provider: "bkash",
      originalType,
    });
  }

  return transactions;
}
