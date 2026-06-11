import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { getReviewKeyAction, isTypingTarget } from "../utils/keyboard";
import { useReviewKeyboard } from "../hooks/useReviewKeyboard";

function makeEvent(key: string, target: EventTarget | null) {
  return { key, target };
}

describe("getReviewKeyAction", () => {
  it("Space resolves to next", () => {
    expect(getReviewKeyAction(makeEvent(" ", null))).toBe("next");
  });

  it("ArrowRight resolves to next", () => {
    expect(getReviewKeyAction(makeEvent("ArrowRight", null))).toBe("next");
  });

  it("ArrowLeft resolves to previous", () => {
    expect(getReviewKeyAction(makeEvent("ArrowLeft", null))).toBe("previous");
  });

  it("unrelated keys resolve to null", () => {
    expect(getReviewKeyAction(makeEvent("a", null))).toBeNull();
    expect(getReviewKeyAction(makeEvent("Enter", null))).toBeNull();
    expect(getReviewKeyAction(makeEvent("ArrowUp", null))).toBeNull();
  });

  it("does not fire while typing in an input", () => {
    const input = document.createElement("input");
    expect(getReviewKeyAction(makeEvent(" ", input))).toBeNull();
    expect(getReviewKeyAction(makeEvent("ArrowRight", input))).toBeNull();
    expect(getReviewKeyAction(makeEvent("ArrowLeft", input))).toBeNull();
  });

  it("does not fire while typing in a textarea", () => {
    const textarea = document.createElement("textarea");
    expect(getReviewKeyAction(makeEvent(" ", textarea))).toBeNull();
    expect(getReviewKeyAction(makeEvent("ArrowRight", textarea))).toBeNull();
    expect(getReviewKeyAction(makeEvent("ArrowLeft", textarea))).toBeNull();
  });
});

describe("isTypingTarget", () => {
  it("returns true for an input element", () => {
    expect(isTypingTarget(document.createElement("input"))).toBe(true);
  });

  it("returns true for a textarea element", () => {
    expect(isTypingTarget(document.createElement("textarea"))).toBe(true);
  });

  it("returns false for a button element", () => {
    expect(isTypingTarget(document.createElement("button"))).toBe(false);
  });

  it("returns false for a div element", () => {
    expect(isTypingTarget(document.createElement("div"))).toBe(false);
  });

  it("returns false for null", () => {
    expect(isTypingTarget(null)).toBe(false);
  });

  it("returns true for a contenteditable element", () => {
    const div = document.createElement("div");
    Object.defineProperty(div, "isContentEditable", { value: true });
    expect(isTypingTarget(div)).toBe(true);
  });
});

describe("useReviewKeyboard", () => {
  it("Space dispatched on window calls onNext", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    renderHook(() => useReviewKeyboard({ onNext, onPrevious }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it("ArrowLeft dispatched on window calls onPrevious", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    renderHook(() => useReviewKeyboard({ onNext, onPrevious }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    renderHook(() => useReviewKeyboard({ enabled: false, onNext, onPrevious }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(onNext).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const { unmount } = renderHook(() =>
      useReviewKeyboard({ onNext, onPrevious })
    );
    unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(onNext).not.toHaveBeenCalled();
  });
});
