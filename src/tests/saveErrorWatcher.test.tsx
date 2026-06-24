import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider } from "../context/ToastContext";
import SaveErrorWatcher from "../components/shared/SaveErrorWatcher";
import { SAVE_ERROR_EVENT } from "../store/useAppStore";

// Locks the decision that a failed DB write surfaces to the user instead of
// failing silently — and that a burst of failures collapses into one toast.
// Goes red if the watcher stops listening or the throttle is removed.

function renderWatcher() {
  return render(
    <ToastProvider>
      <SaveErrorWatcher />
    </ToastProvider>,
  );
}

describe("SaveErrorWatcher", () => {
  it("shows an error toast when a save fails", () => {
    renderWatcher();
    act(() => {
      window.dispatchEvent(new CustomEvent(SAVE_ERROR_EVENT));
    });
    expect(screen.getByText(/couldn't save your changes/i)).toBeInTheDocument();
  });

  it("collapses a burst of failures into a single toast", () => {
    renderWatcher();
    act(() => {
      window.dispatchEvent(new CustomEvent(SAVE_ERROR_EVENT));
      window.dispatchEvent(new CustomEvent(SAVE_ERROR_EVENT));
      window.dispatchEvent(new CustomEvent(SAVE_ERROR_EVENT));
    });
    expect(screen.getAllByText(/couldn't save your changes/i)).toHaveLength(1);
  });
});
