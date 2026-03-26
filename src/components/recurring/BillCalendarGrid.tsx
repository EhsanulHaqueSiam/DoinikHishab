import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { BillItem } from "./recurring-types";

interface BillCalendarGridProps {
  bills: BillItem[];
  onDayPress: (date: string, dayBills: BillItem[]) => void;
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function BillCalendarGrid({ bills, onDayPress }: BillCalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const today = useMemo(() => new Date(), []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Build bill lookup: date string -> BillItem[]
  const billsByDate = useMemo(() => {
    const map: Record<string, BillItem[]> = {};
    for (const bill of bills) {
      if (!map[bill.dueDate]) {
        map[bill.dueDate] = [];
      }
      map[bill.dueDate].push(bill);
    }
    return map;
  }, [bills]);

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateString: string;
    }> = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month - 1;
      const y = m < 0 ? year - 1 : year;
      const actualMonth = m < 0 ? 11 : m;
      days.push({
        day: d,
        month: actualMonth,
        year: y,
        isCurrentMonth: false,
        dateString: formatDateString(y, actualMonth, d),
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        month,
        year,
        isCurrentMonth: true,
        dateString: formatDateString(year, month, d),
      });
    }

    // Next month padding to fill remaining row
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      const nextMonth = month + 1;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const actualMonth = nextMonth > 11 ? 0 : nextMonth;
      for (let d = 1; d <= remaining; d++) {
        days.push({
          day: d,
          month: actualMonth,
          year: nextYear,
          isCurrentMonth: false,
          dateString: formatDateString(nextYear, actualMonth, d),
        });
      }
    }

    return days;
  }, [year, month]);

  // Split into rows of 7
  const rows: (typeof calendarDays)[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    rows.push(calendarDays.slice(i, i + 7));
  }

  const navigateMonth = (direction: -1 | 1) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const handleDayPress = (dateString: string) => {
    const dayBills = billsByDate[dateString];
    if (dayBills && dayBills.length > 0) {
      onDayPress(dateString, dayBills);
    }
  };

  return (
    <View className="mx-4 mt-4">
      {/* Month Navigation */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={() => navigateMonth(-1)}
          className="p-2"
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <ChevronLeft size={20} className="text-surface-900" />
        </Pressable>
        <Text className="text-base font-bold text-foreground">{getMonthLabel(currentMonth)}</Text>
        <Pressable
          onPress={() => navigateMonth(1)}
          className="p-2"
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <ChevronRight size={20} className="text-surface-900" />
        </Pressable>
      </View>

      {/* Weekday Headers */}
      <View className="flex-row">
        {WEEKDAY_HEADERS.map((day) => (
          <View key={day} className="flex-1 items-center py-1">
            <Text className="text-2xs font-semibold text-surface-800 uppercase">{day}</Text>
          </View>
        ))}
      </View>

      {/* Day Grid */}
      {rows.map((row, rowIndex) => (
        <View key={`row-${row[0]?.dateString ?? rowIndex}`} className="flex-row">
          {row.map((dayInfo) => {
            const dayBills = billsByDate[dayInfo.dateString] || [];
            const isToday =
              dayInfo.isCurrentMonth &&
              isSameDay(new Date(dayInfo.year, dayInfo.month, dayInfo.day), today);

            const hasPaid = dayBills.some((b) => b.status === "paid");
            const hasUpcoming = dayBills.some((b) => b.status === "upcoming");
            const hasOverdue = dayBills.some((b) => b.status === "overdue");

            return (
              <Pressable
                key={dayInfo.dateString}
                className={`flex-1 items-center py-2 min-h-[44px] ${
                  isToday ? "bg-primary-400/20 border border-primary-500/30 rounded-lg" : ""
                } ${!dayInfo.isCurrentMonth ? "opacity-30" : ""}`}
                onPress={() => handleDayPress(dayInfo.dateString)}
                accessibilityRole="button"
                accessibilityLabel={`${dayInfo.day}${dayBills.length > 0 ? `, ${dayBills.length} bills due` : ""}`}
                accessibilityState={{ selected: isToday }}
              >
                <Text
                  className={`text-sm ${
                    isToday ? "text-primary-700 font-bold" : "text-foreground"
                  }`}
                >
                  {dayInfo.day}
                </Text>

                {/* Status Dots */}
                {dayBills.length > 0 && (
                  <View className="flex-row gap-1 mt-1">
                    {hasPaid && <View className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                    {hasUpcoming && <View className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    {hasOverdue && <View className="w-1.5 h-1.5 rounded-full bg-danger" />}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
