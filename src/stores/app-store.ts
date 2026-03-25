import { create } from "zustand";
import type { Id } from "../../convex/_generated/dataModel";
import i18n from "../lib/i18n";

interface AppState {
  // User
  userId: Id<"users"> | null;
  deviceId: string;
  locale: "en" | "bn";
  theme: "light" | "dark" | "system";

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Current view state
  currentMonth: string; // YYYYMM
  selectedAccountId: Id<"accounts"> | null;

  // Actions
  setUserId: (id: Id<"users">) => void;
  setDeviceId: (id: string) => void;
  setLocale: (locale: "en" | "bn") => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setOnboardingComplete: () => void;
  setCurrentMonth: (month: string) => void;
  setSelectedAccountId: (id: Id<"accounts"> | null) => void;
}

function getInitialMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  deviceId: generateDeviceId(),
  locale: (i18n.language as "en" | "bn") || "en",
  theme: "system",
  hasCompletedOnboarding: false,
  currentMonth: getInitialMonth(),
  selectedAccountId: null,

  setUserId: (id) => set({ userId: id }),
  setDeviceId: (id) => set({ deviceId: id }),
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),
}));
