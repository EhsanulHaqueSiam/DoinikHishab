import {
  AlertTriangle,
  BarChart3,
  GitBranch,
  type LucideIcon,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type EmptyStateType = "spending" | "transactions" | "accounts" | "trend" | "cashflow" | "error";

const ICON_MAP: Record<EmptyStateType, LucideIcon> = {
  spending: BarChart3,
  transactions: BarChart3,
  accounts: BarChart3,
  trend: TrendingUp,
  cashflow: GitBranch,
  error: AlertTriangle,
};

interface ReportEmptyStateProps {
  type: EmptyStateType;
  title: string;
  body: string;
}

export function ReportEmptyState({ type, title, body }: ReportEmptyStateProps) {
  const Icon = ICON_MAP[type];
  return (
    <View className="items-center justify-center py-12" accessibilityLabel={`${title}. ${body}`}>
      <Icon size={48} color="#6b83a3" />
      <Text className="text-sm font-bold text-surface-900 mt-3">{title}</Text>
      <Text className="text-2xs text-surface-800 mt-1 text-center px-8">{body}</Text>
    </View>
  );
}
