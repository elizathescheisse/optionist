import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DesignSystemModal from "../components/shared/DesignSystemModal";

// Guards the consolidation: the design system lives only in the press-"D"
// modal now (the standalone /design-system page was removed), and it must keep
// its four tabs. A revert that drops the tabbed content would fail here.

describe("DesignSystemModal", () => {
  it("is hidden until D is pressed, then shows the four tabs", () => {
    render(<DesignSystemModal />);
    // Closed by default.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Press D to open.
    fireEvent.keyDown(window, { key: "d" });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Design System")).toBeInTheDocument();
    for (const label of ["Colors", "Typography", "Components", "Layout"]) {
      expect(within(dialog).getByText(label)).toBeInTheDocument();
    }
  });

  it("switches tab content when a tab is clicked", () => {
    render(<DesignSystemModal />);
    fireEvent.keyDown(window, { key: "d" });
    const dialog = screen.getByRole("dialog");

    // Colors tab is active first.
    expect(within(dialog).getByText("Core palette")).toBeInTheDocument();

    // Switch to Typography.
    fireEvent.click(within(dialog).getByText("Typography"));
    expect(within(dialog).getByText("Type scale")).toBeInTheDocument();
  });

  it("opens a nested modal on top, and Escape closes only the nested one", () => {
    render(<DesignSystemModal />);
    fireEvent.keyDown(window, { key: "d" });
    const dialog = screen.getByRole("dialog", { name: "Design system" });

    fireEvent.click(within(dialog).getByText("Components"));
    fireEvent.click(within(dialog).getByText("Open modal"));
    expect(screen.getByText("Example modal")).toBeInTheDocument();

    // Escape closes the nested demo, but the design system modal stays open.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Example modal")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Design system" })).toBeInTheDocument();
  });
});
