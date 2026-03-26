/**
 * Statement Parser Types
 *
 * Shared interfaces for bKash/Nagad statement parsing.
 * All amounts are in paisa (integer cents), always positive.
 */

export interface ParsedTransaction {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Transaction description (type + details) */
  description: string;
  /** Amount in paisa (always positive integer) */
  amount: number;
  /** Mapped transaction type */
  type: "expense" | "income";
  /** Transaction reference/ID from statement */
  reference: string;
  /** Statement provider */
  provider: "bkash" | "nagad";
  /** Original transaction type string from statement */
  originalType: string;
}

export interface ImportResult {
  /** Successfully parsed transactions */
  transactions: ParsedTransaction[];
  /** Parse errors encountered */
  errors: string[];
  /** Detected provider */
  provider: "bkash" | "nagad" | "unknown";
}

export type StatementFormat = "bkash" | "nagad" | "unknown";

export interface ParseError {
  /** Line number where error occurred */
  line: number;
  /** Error description */
  message: string;
}
