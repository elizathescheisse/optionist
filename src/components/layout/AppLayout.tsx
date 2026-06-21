import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LayoutDashboard, FolderOpen, Clock, Settings, LogOut, type LucideIcon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore, currentOrganization } from "../../store/useWorkspaceStore";
import { isSupabaseConfigured } from "../../lib/supabase";
import { canSeeOrgSettings } from "../../lib/permissions";
import OrganizationSwitcher from "./OrganizationSwitcher";
import GuestMenuPanel from "../guest/GuestMenuPanel";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";
import { resolveThemePreference, useSystemThemeListener } from "../../lib/theme";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  matchPaths: string[];
  requiresOrgAdmin?: boolean;
  requiresAuth?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, matchPaths: ["/dashboard"] },
  { to: "/projects", label: "Projects", icon: FolderOpen, matchPaths: ["/projects"] },
  { to: "/history", label: "History", icon: Clock, matchPaths: ["/history"] },
  { to: "/settings", label: "Settings", icon: Settings, matchPaths: ["/settings"], requiresAuth: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const logout = useAuthStore((s) => s.logout);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboarding = useAuthStore((s) => s.onboarding);
  const role = useWorkspaceStore((s) => s.currentRole);
  const org = useWorkspaceStore(currentOrganization);
  const user = useAuthStore((s) => s.user);
  const localTheme = useAuthStore((s) => s.settings.theme);
  const wsTheme = useWorkspaceStore((s) => s.settings?.theme);
  const appThemePreference = resolveThemePreference(wsTheme ?? localTheme);
  useSystemThemeListener(appThemePreference);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") !== "false"
  );

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

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
      <aside
        className={cn(
          "shrink-0 flex flex-col border-r border-border bg-surface transition-[width] duration-200",
          collapsed ? "w-12" : "w-[var(--spacing-sidebar)]",
        )}
      >
        {/* Logo / wordmark */}
        <div className="h-[var(--spacing-topbar)] flex items-center px-2.5 border-b border-border shrink-0 overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              O
            </span>
            {!collapsed && (
              <span className="font-semibold text-text text-sm tracking-tight truncate">
                Optionist
              </span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                collapsed ? "justify-center" : "",
                isActive(item.matchPaths)
                  ? "bg-primary-soft text-primary"
                  : "text-text-muted hover:bg-surface-muted hover:text-text",
              )}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Workspace + log out, on one line (guests use their own panel) */}
        {!collapsed &&
          (isGuest() ? (
            <GuestMenuPanel />
          ) : (
            <div className="border-t border-border flex items-stretch">
              <div className="flex-1 min-w-0">
                {isSupabaseConfigured ? (
                  <OrganizationSwitcher />
                ) : (
                  onboarding?.workspaceName && (
                    <div className="px-4 py-3 min-w-0">
                      <p className="text-xs text-text-soft">Workspace</p>
                      <p className="text-sm text-text font-medium truncate">{workspaceLabel}</p>
                    </div>
                  )
                )}
              </div>
              {isAuthenticated() && (
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  aria-label="Log out"
                  className="shrink-0 px-4 flex items-center text-text-soft hover:text-text hover:bg-surface-muted transition-colors"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ))}

        {/* Log out — icon only when collapsed (no workspace label to sit beside) */}
        {collapsed && isAuthenticated() && (
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="shrink-0 flex items-center justify-center h-9 border-t border-border text-text-soft hover:text-text hover:bg-surface-muted transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
          </button>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 flex items-center justify-center h-9 border-t border-border text-text-soft hover:text-text hover:bg-surface-muted transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform duration-200", collapsed ? "rotate-180" : "")}
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
