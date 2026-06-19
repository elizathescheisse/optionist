import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import PageHeader from "../ui/PageHeader";
import SettingsNav from "./SettingsNav";

export default function SettingsLayout() {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  if (isGuest()) {
    return (
      <Navigate
        to="/dashboard"
        state={{ guestAccountOnly: true, from: location }}
        replace
      />
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <aside className="hidden lg:flex shrink-0 w-[var(--spacing-settings-nav)] flex-col border-r border-border bg-surface min-h-0">
        <div className="shrink-0 px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text tracking-tight">Settings</p>
          <p className="text-xs text-text-muted mt-1 leading-normal">
            Manage your account, workspace, and Optionist preferences.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          <SettingsNav variant="desktop" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <div className="lg:hidden shrink-0 border-b border-border bg-surface px-4 py-4 flex flex-col gap-3">
          <PageHeader
            title="Settings"
            subtitle="Manage your account, workspace, and Optionist preferences."
          />
          <SettingsNav variant="mobile" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-3xl w-full mx-auto px-6 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
