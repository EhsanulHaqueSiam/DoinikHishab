/**
 * Date helpers for DoinikHishab
 */

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function getMonthLabel(month: string): string {
  const year = parseInt(month.substring(0, 4), 10);
  const m = parseInt(month.substring(4, 6), 10) - 1;
  const d = new Date(year, m, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function previousMonth(month: string): string {
  const year = parseInt(month.substring(0, 4), 10);
  const m = parseInt(month.substring(4, 6), 10);
  if (m === 1) return `${year - 1}12`;
  return `${year}${String(m - 1).padStart(2, "0")}`;
}

export function nextMonth(month: string): string {
  const year = parseInt(month.substring(0, 4), 10);
  const m = parseInt(month.substring(4, 6), 10);
  if (m === 12) return `${year + 1}01`;
  return `${year}${String(m + 1).padStart(2, "0")}`;
}

export function isCurrentMonth(month: string): boolean {
  return month === currentMonth();
}

export function groupByDate<T extends { date: string }>(
  items: T[]
): { date: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const existing = groups.get(item.date);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(item.date, [item]);
    }
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}
