import { useAppStore } from "./app-store";

describe("AppStore", () => {
  const initialState = useAppStore.getState();

  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it("has correct initial locale", () => {
    expect(useAppStore.getState().locale).toBe("en");
  });

  it("sets locale to Bengali", () => {
    useAppStore.getState().setLocale("bn");
    expect(useAppStore.getState().locale).toBe("bn");
  });

  it("sets locale back to English", () => {
    useAppStore.getState().setLocale("bn");
    useAppStore.getState().setLocale("en");
    expect(useAppStore.getState().locale).toBe("en");
  });

  it("has correct initial theme", () => {
    expect(useAppStore.getState().theme).toBe("system");
  });

  it("sets theme to dark", () => {
    useAppStore.getState().setTheme("dark");
    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("sets onboarding complete", () => {
    expect(useAppStore.getState().hasCompletedOnboarding).toBe(false);
    useAppStore.getState().setOnboardingComplete();
    expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it("sets current month", () => {
    useAppStore.getState().setCurrentMonth("202601");
    expect(useAppStore.getState().currentMonth).toBe("202601");
  });
});
