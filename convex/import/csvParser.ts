"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  reference: string;
  type: "expense" | "income";
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeDate(raw: string): string {
  // Handle DD/MM/YYYY (common BD bank format)
  const ddmmyyyy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Handle YYYY-MM-DD (ISO)
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;
  // Handle MM/DD/YYYY
  const mmddyyyy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return raw;
}

function parseAmount(raw: string): number {
  // Remove currency symbols, commas, spaces
  const cleaned = raw.replace(/[৳$,\s]/g, "").replace(/[()]/g, (m) =>
    m === "(" ? "-" : ""
  );
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  // Convert to paisa (integer)
  return Math.round(num * 100);
}

function parseCSVContent(content: string): ParsedTransaction[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());

  const dateIdx = header.findIndex((h) =>
    ["date", "transaction date", "txn date", "তারিখ"].includes(h)
  );
  const descIdx = header.findIndex((h) =>
    ["description", "narration", "particulars", "details", "বিবরণ"].includes(h)
  );
  const amountIdx = header.findIndex((h) =>
    ["amount", "debit/credit", "টাকা"].includes(h)
  );
  const debitIdx = header.findIndex((h) =>
    ["debit", "withdrawal", "dr"].includes(h)
  );
  const creditIdx = header.findIndex((h) =>
    ["credit", "deposit", "cr"].includes(h)
  );
  const refIdx = header.findIndex((h) =>
    ["reference", "ref", "ref no", "transaction id", "txn id"].includes(h)
  );

  const results: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const date = dateIdx >= 0 ? normalizeDate(cols[dateIdx]) : "";
    const description = descIdx >= 0 ? cols[descIdx] : "";
    let amount = 0;

    if (amountIdx >= 0) {
      amount = parseAmount(cols[amountIdx]);
    } else if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = debitIdx >= 0 ? parseAmount(cols[debitIdx]) : 0;
      const credit = creditIdx >= 0 ? parseAmount(cols[creditIdx]) : 0;
      amount = credit > 0 ? credit : -debit;
    }

    const reference = refIdx >= 0 ? cols[refIdx] : "";
    const type: "expense" | "income" = amount < 0 ? "expense" : "income";

    if (date || description) {
      results.push({ date, description, amount, reference, type });
    }
  }

  return results;
}

export const parseCSV = action({
  args: {
    content: v.string(),
    format: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<ParsedTransaction[]> => {
    return parseCSVContent(args.content);
  },
});
