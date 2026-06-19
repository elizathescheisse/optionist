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
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeader
          title="Settings"
          subtitle="Manage your account, workspace, and Optionist preferences."
        />

        <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
          <SettingsNav />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
