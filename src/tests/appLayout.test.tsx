import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../context/ToastContext";
import AppLayout from "../components/layout/AppLayout";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

// Tripwire test for the collapsible sidebar. This decision (collapse toggle +
// lucide icons, collapsed by default) has been silently reverted twice by
// unrelated PRs that rewrote AppLayout. These assertions go red if it happens
// again, so the regression can't merge unnoticed.

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <ToastProvider>
        <AppLayout>
          <div>content</div>
        </AppLayout>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("AppLayout sidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      status: "authenticated",
      user: { id: "u1", email: "test@example.com", name: "Test User" },
      session: null,
      onboarding: null,
      settings: { theme: "light" },
    });
    useWorkspaceStore.setState({
      status: "ready",
      profile: null,
      organizations: [],
      currentOrganizationId: null,
      currentRole: null,
      settings: null,
    });
  });

  it("renders nav items as icons, not text initials", () => {
    renderLayout();
    const nav = screen.getByRole("navigation");
    // Each nav link should render an svg icon (lucide), not a letter.
    const icons = nav.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it("starts collapsed by default (labels hidden)", () => {
    renderLayout();
    // Collapsed: only icons show, so the "Dashboard" label text is not rendered.
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("expands when the collapse toggle is clicked, and persists the choice", () => {
    renderLayout();
    const toggle = screen.getByRole("button", { name: /expand sidebar/i });
    fireEvent.click(toggle);

    // Expanded: nav labels now appear.
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Dashboard")).toBeInTheDocument();
    // And the choice is remembered for next visit.
    expect(localStorage.getItem("sidebar-collapsed")).toBe("false");
  });

  it("logs out when the sidebar log out button is clicked", () => {
    const logoutSpy = vi.fn();
    useAuthStore.setState({ logout: logoutSpy });
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(logoutSpy).toHaveBeenCalled();
  });
});
