import { useUIStore } from "./ui-store";

describe("UIStore", () => {
  const initialState = useUIStore.getState();

  beforeEach(() => {
    useUIStore.setState(initialState, true);
  });

  it("starts with quick add closed", () => {
    expect(useUIStore.getState().isQuickAddOpen).toBe(false);
  });

  it("opens quick add with default type", () => {
    useUIStore.getState().openQuickAdd();
    expect(useUIStore.getState().isQuickAddOpen).toBe(true);
    expect(useUIStore.getState().quickAddType).toBe("expense");
  });

  it("opens quick add with income type", () => {
    useUIStore.getState().openQuickAdd("income");
    expect(useUIStore.getState().isQuickAddOpen).toBe(true);
    expect(useUIStore.getState().quickAddType).toBe("income");
  });

  it("closes quick add", () => {
    useUIStore.getState().openQuickAdd();
    useUIStore.getState().closeQuickAdd();
    expect(useUIStore.getState().isQuickAddOpen).toBe(false);
  });

  it("toggles category picker", () => {
    useUIStore.getState().setCategoryPickerOpen(true);
    expect(useUIStore.getState().isCategoryPickerOpen).toBe(true);
    useUIStore.getState().setCategoryPickerOpen(false);
    expect(useUIStore.getState().isCategoryPickerOpen).toBe(false);
  });
});
