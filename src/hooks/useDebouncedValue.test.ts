import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("batman", 400));

    expect(result.current).toBe("batman");
  });

  it("does not update the value before the delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      {
        initialProps: {
          value: "batman",
        },
      },
    );

    rerender({
      value: "resident evil",
    });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe("batman");
  });

  it("updates the value after the delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      {
        initialProps: {
          value: "batman",
        },
      },
    );

    rerender({
      value: "resident evil",
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("resident evil");
  });

  it("cancels the previous timer when the value changes again", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      {
        initialProps: {
          value: "",
        },
      },
    );

    rerender({
      value: "bat",
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({
      value: "batman",
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("batman");
  });
});
