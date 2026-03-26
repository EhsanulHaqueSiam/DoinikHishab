import { act, renderHook } from "@testing-library/react-native";
import * as Updates from "expo-updates";
import { AppState } from "react-native";
import { toast } from "sonner-native";

// Must import after mocks are set up via jest.setup.js
import { useUpdateCheck } from "./use-update-check";

// Mock sonner-native toast
jest.mock("sonner-native", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCheckForUpdateAsync = Updates.checkForUpdateAsync as jest.Mock;
const mockFetchUpdateAsync = Updates.fetchUpdateAsync as jest.Mock;
const mockToastSuccess = toast.success as jest.Mock;

describe("useUpdateCheck", () => {
  let addEventListenerSpy: jest.SpyInstance;
  let capturedCallback: ((state: string) => void) | null = null;
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedCallback = null;

    // Capture the AppState listener callback
    addEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((event: string, handler: any) => {
        if (event === "change") {
          capturedCallback = handler;
        }
        return { remove: mockRemove };
      });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  it("should not register AppState listener in __DEV__ mode", () => {
    // __DEV__ is true in test environment by default
    renderHook(() => useUpdateCheck());
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("should call fetchUpdateAsync and show toast when update is available", async () => {
    // Temporarily set __DEV__ to false
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: true });
    mockFetchUpdateAsync.mockResolvedValue({});

    renderHook(() => useUpdateCheck());

    expect(addEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));
    expect(capturedCallback).not.toBeNull();

    // Simulate app coming to foreground
    await act(async () => {
      await capturedCallback!("active");
    });

    expect(mockCheckForUpdateAsync).toHaveBeenCalled();
    expect(mockFetchUpdateAsync).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("Update downloaded. Restart to apply.", {
      duration: 4000,
    });

    (global as any).__DEV__ = originalDev;
  });

  it("should not call fetchUpdateAsync when no update is available", async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: false });

    renderHook(() => useUpdateCheck());

    await act(async () => {
      await capturedCallback!("active");
    });

    expect(mockCheckForUpdateAsync).toHaveBeenCalled();
    expect(mockFetchUpdateAsync).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();

    (global as any).__DEV__ = originalDev;
  });

  it("should catch errors silently when checkForUpdateAsync throws", async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockCheckForUpdateAsync.mockRejectedValue(new Error("Network error"));

    renderHook(() => useUpdateCheck());

    await act(async () => {
      await capturedCallback!("active");
    });

    // Should not crash -- error caught silently
    expect(consoleSpy).toHaveBeenCalledWith("Update check failed:", expect.any(Error));
    expect(mockFetchUpdateAsync).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    (global as any).__DEV__ = originalDev;
  });

  it("should remove AppState listener on unmount", () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const { unmount } = renderHook(() => useUpdateCheck());

    expect(addEventListenerSpy).toHaveBeenCalled();

    unmount();

    expect(mockRemove).toHaveBeenCalled();

    (global as any).__DEV__ = originalDev;
  });
});
