import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastProvider } from "../context/ToastContext";
import SettingsLayout from "../components/settings/SettingsLayout";
import ProfileSettingsRoute from "../routes/settings/ProfileSettingsRoute";
import AppLayout from "../components/layout/AppLayout";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

function SidebarLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function SettingsRoutes() {
  return (
    <Routes>
      <Route element={<SidebarLayout />}>
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettingsRoute />} />
        </Route>
      </Route>
    </Routes>
  );
}

describe("settings routing", () => {
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

  it("renders profile content at /settings/profile", () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/settings/profile"]}>
          <SettingsRoutes />
        </MemoryRouter>
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("redirects /settings to profile content", () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/settings"]}>
          <SettingsRoutes />
        </MemoryRouter>
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  });
});
