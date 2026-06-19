import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore, currentOrganization } from "../../store/useWorkspaceStore";
import { isSupabaseConfigured } from "../../lib/supabase";
import { canSeeOrgSettings } from "../../lib/permissions";
import OrganizationSwitcher from "./OrganizationSwitcher";
import GuestMenuPanel from "../guest/GuestMenuPanel";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

type NavItem = {
  to: string;
  label: string;
  matchPaths: string[];
  requiresOrgAdmin?: boolean;
  requiresAuth?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", matchPaths: ["/dashboard"] },
  { to: "/projects", label: "Projects", matchPaths: ["/projects"] },
  { to: "/history", label: "History", matchPaths: ["/history"] },
  { to: "/settings", label: "Settings", matchPaths: ["/settings"], requiresAuth: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const logout = useAuthStore((s) => s.logout);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboarding = useAuthStore((s) => s.onboarding);
  const role = useWorkspaceStore((s) => s.currentRole);
  const org = useWorkspaceStore(currentOrganization);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const state = location.state as { guestAccountOnly?: boolean } | null;
    if (state?.guestAccountOnly) {
      showToast("Create an account to access account settings.", "default");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate, showToast]);

  function isActive(matchPaths: string[]) {
    return matchPaths.some(
      (match) =>
        location.pathname === match ||
        location.pathname.startsWith(match + "/"),
    );
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleGuestLogout() {
    exitGuestMode();
    navigate("/login");
  }

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.requiresAuth && isGuest()) return false;
    if (item.requiresOrgAdmin && !canSeeOrgSettings(role)) return false;
    return true;
  });

  const workspaceLabel = isGuest()
    ? "Guest Workspace"
    : (org?.name ?? onboarding?.workspaceName ?? user?.name ?? "Optionist");

  return (
    <div className="h-full flex bg-bg">
      <aside className="shrink-0 w-[var(--spacing-sidebar)] flex flex-col border-r border-border bg-surface">
        <div className="h-[var(--spacing-topbar)] flex items-center px-4 border-b border-border shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              O
            </span>
            <span className="font-semibold text-text text-sm tracking-tight truncate">
              Optionist
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive(item.matchPaths)
                  ? "bg-primary-soft text-primary"
                  : "text-text-muted hover:bg-surface-muted hover:text-text",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {isGuest() ? (
          <GuestMenuPanel />
        ) : isSupabaseConfigured ? (
          <OrganizationSwitcher />
        ) : (
          onboarding?.workspaceName && (
            <div className="px-4 py-3 border-t border-border">
              <p className="text-xs text-text-soft">Workspace</p>
              <p className="text-sm text-text font-medium truncate">{workspaceLabel}</p>
            </div>
          )
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-2 flex items-center justify-between">
          <Link
            to="/design-system"
            className="text-xs text-text-soft hover:text-primary transition-colors"
          >
            Design System
          </Link>
          {isGuest() ? (
            <div className="flex items-center gap-3">
              <Link
                to="/signup"
                className="text-xs text-primary font-medium hover:underline"
              >
                Save my work
              </Link>
              <button
                type="button"
                onClick={handleGuestLogout}
                className="text-xs text-text-soft hover:text-text transition-colors"
              >
                Log out
              </button>
            </div>
          ) : isAuthenticated() ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-text-soft hover:text-text transition-colors"
            >
              Log out
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
