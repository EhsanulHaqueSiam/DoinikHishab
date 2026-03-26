/**
 * Transaction Type Mapping
 *
 * Maps bKash/Nagad transaction type strings to expense/income categories.
 * Per D-12: Cash Out/Send Money/Payment = expense, Cash In/Add Money = income, etc.
 */

export const BKASH_TYPE_MAP: Record<string, "expense" | "income"> = {
  "Cash Out": "expense",
  "Send Money": "expense",
  "Payment": "expense",
  "Mobile Recharge": "expense",
  "bKash to Bank": "expense",
  "Savings Deposit": "expense",
  "Cash In": "income",
  "Add Money": "income",
  "Bank to bKash": "income",
  "Cashback": "income",
};

export const NAGAD_TYPE_MAP: Record<string, "expense" | "income"> = {
  "Cash Out": "expense",
  "Send Money": "expense",
  "Payment": "expense",
  "Mobile Recharge": "expense",
  "Cash In": "income",
  "Add Money": "income",
  "Cashback": "income",
};

/**
 * Map a raw transaction type string to expense/income.
 * Defaults to "expense" for unknown types.
 */
export function mapTransactionType(
  originalType: string,
  provider: "bkash" | "nagad",
): "expense" | "income" {
  const map = provider === "bkash" ? BKASH_TYPE_MAP : NAGAD_TYPE_MAP;
  return map[originalType] ?? "expense";
}
