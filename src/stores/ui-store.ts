import { create } from "zustand";
import type { Id } from "../../convex/_generated/dataModel";

interface UIState {
  // Quick add sheet
  isQuickAddOpen: boolean;
  quickAddType: "expense" | "income" | "transfer";

  // Transaction detail
  editingTransactionId: Id<"transactions"> | null;

  // Category picker
  isCategoryPickerOpen: boolean;

  // Account picker
  isAccountPickerOpen: boolean;

  // Actions
  openQuickAdd: (type?: "expense" | "income" | "transfer") => void;
  closeQuickAdd: () => void;
  setEditingTransaction: (id: Id<"transactions"> | null) => void;
  setCategoryPickerOpen: (open: boolean) => void;
  setAccountPickerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isQuickAddOpen: false,
  quickAddType: "expense",
  editingTransactionId: null,
  isCategoryPickerOpen: false,
  isAccountPickerOpen: false,

  openQuickAdd: (type = "expense") =>
    set({ isQuickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),
  setEditingTransaction: (id) => set({ editingTransactionId: id }),
  setCategoryPickerOpen: (open) => set({ isCategoryPickerOpen: open }),
  setAccountPickerOpen: (open) => set({ isAccountPickerOpen: open }),
}));
