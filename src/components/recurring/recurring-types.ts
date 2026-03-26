/**
 * Type definitions for recurring bills and subscription tracking.
 * Used by subscription-detector, recurring-storage, and UI components.
 */

export type RecurringFrequency = "weekly" | "monthly" | "yearly";

export type BillStatus = "paid" | "upcoming" | "overdue";

export interface Subscription {
  id: string;
  payee: string;
  amount: number; // paisa
  frequency: RecurringFrequency;
  categoryId: string;
  nextDueDate: string; // ISO date YYYY-MM-DD
  isActive: boolean;
  type: "income" | "expense";
}

export interface BillItem {
  id: string;
  subscriptionId: string;
  payee: string;
  amount: number; // paisa
  dueDate: string; // ISO date YYYY-MM-DD
  status: BillStatus;
  categoryId: string;
  type: "income" | "expense";
}

export interface DetectedSubscription {
  payee: string;
  amount: number; // paisa (average)
  frequency: RecurringFrequency;
  confidence: number; // 0-1
  occurrences: number;
  lastDate: string; // ISO date YYYY-MM-DD
  categoryId?: string;
}

export interface MockTransaction {
  id: string;
  payee: string;
  amount: number; // paisa
  date: string; // ISO date YYYY-MM-DD
  categoryId: string;
  type: "income" | "expense";
}

export interface RecurringDataStore {
  version: number;
  subscriptions: Subscription[];
}

export interface DismissedStore {
  version: number;
  payees: string[];
}
