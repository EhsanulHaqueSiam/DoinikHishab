/**
 * Nagad Statement Text Parser
 *
 * Parses Nagad statement text (tab/comma-separated) into ParsedTransaction[].
 * Nagad columns vary but typically include: Date, Type, Debit, Credit, Reference, Balance.
 * Per D-10: On-device regex parsing with flexible column matching.
 */

import { mapTransactionType } from "./type-mapping";
import type { ParsedTransaction } from "./types";

/**
 * Normalize a date string to YYYY-MM-DD format.
 */
function normalizeDate(dateStr: string): string {
  const cleaned = dateStr.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const slashMatch = cleaned.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slashMatch) {
    const [, part1, part2, year] = slashMatch;
    const p1 = parseInt(part1, 10);
    const p2 = parseInt(part2, 10);

    if (p1 > 12) {
      return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
    }
    if (p2 > 12) {
      return `${year}-${String(p1).padStart(2, "0")}-${String(p2).padStart(2, "0")}`;
    }
    return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
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
 * Parse Nagad text statement into ParsedTransaction array.
 * Handles tab-separated and comma-separated formats.
 * Detects Debit/Credit columns to determine transaction type.
 */
export function parseNagadText(text: string): ParsedTransaction[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Find header row by looking for characteristic Nagad columns
  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes("debit") || lower.includes("credit") || lower.includes("transaction type")) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

  // Detect separator from the header row (not first line which may be a title)
  const separator = lines[headerIndex].includes("\t") ? "\t" : ",";
  const headers = lines[headerIndex].split(separator).map((h) => h.trim());
  const dateCol = findColumnIndex(headers, "Date", "Transaction Date", "Trx Date");
  const typeCol = findColumnIndex(headers, "Transaction Type", "Type", "Trx Type");
  const debitCol = findColumnIndex(headers, "Debit", "Debit Amount");
  const creditCol = findColumnIndex(headers, "Credit", "Credit Amount");
  const amountCol = findColumnIndex(headers, "Amount", "Transacted Amount");
  const refCol = findColumnIndex(headers, "Reference", "Ref", "Trx ID", "TrxID");

  if (dateCol === -1) return [];

  const transactions: ParsedTransaction[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map((c) => c.trim());
    if (cols.length <= dateCol) continue;

    const dateStr = cols[dateCol];
    if (!dateStr) continue;

    let amount = 0;
    let transactionType: "expense" | "income" = "expense";

    // Debit/Credit column pattern
    if (debitCol !== -1 && creditCol !== -1) {
      const debit = parseBDTAmount(cols[debitCol] || "0");
      const credit = parseBDTAmount(cols[creditCol] || "0");
      if (debit > 0) {
        amount = debit;
        transactionType = "expense";
      } else if (credit > 0) {
        amount = credit;
        transactionType = "income";
      }
    } else if (amountCol !== -1) {
      amount = parseBDTAmount(cols[amountCol]);
    }

    const originalType = typeCol !== -1 ? cols[typeCol] : "";
    const reference = refCol !== -1 ? cols[refCol] : "";

    // If we have a type column, use type mapping to determine expense/income
    if (originalType && (debitCol === -1 || creditCol === -1)) {
      transactionType = mapTransactionType(originalType, "nagad");
    }

    if (amount === 0) continue;

    transactions.push({
      date: normalizeDate(dateStr),
      description: originalType,
      amount,
      type: transactionType,
      reference,
      provider: "nagad",
      originalType,
    });
  }

  return transactions;
}
