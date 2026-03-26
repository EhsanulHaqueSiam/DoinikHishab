export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

export type ReportType =
  | "spending"
  | "income_expense"
  | "net_worth"
  | "financial_health"
  | "sankey";

export interface CategorySpendingData {
  categoryId: string;
  name: string;
  color: string;
  total: number; // paisa
  percentage: number;
}

export interface MonthlyReportData {
  month: string; // YYYY-MM
  income: number; // paisa
  expense: number; // paisa
  net: number; // paisa
  spendingByCategory: CategorySpendingData[];
  netWorth: number; // paisa
  ageOfMoney: number | null; // days
  daysOfBuffering: number | null; // days
}

export const DEFAULT_CHART_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
] as const;

export const TIME_RANGES: TimeRange[] = ["1M", "3M", "6M", "1Y", "ALL"];
