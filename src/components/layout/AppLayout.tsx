import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, FolderOpen, Clock, Settings, type LucideIcon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../utils/cn";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  matchPaths: string[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, matchPaths: ["/dashboard"] },
  { to: "/projects", label: "Projects", icon: FolderOpen, matchPaths: ["/projects"] },
  { to: "/history", label: "History", icon: Clock, matchPaths: ["/history"] },
  { to: "/settings", label: "Settings", icon: Settings, matchPaths: ["/settings"] },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const onboarding = useAuthStore((s) => s.onboarding);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") !== "false";
  });

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

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  return (
    <div className="h-full flex bg-bg">
      <aside
        className={cn(
          "shrink-0 flex flex-col border-r border-border bg-surface transition-[width] duration-200",
          collapsed ? "w-12" : "w-[var(--spacing-sidebar)]",
        )}
      >
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

        <nav className="flex-1 p-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center py-2 rounded-md text-sm font-medium transition-colors overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                collapsed ? "justify-center px-2" : "gap-2.5 px-3",
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

        {!collapsed && onboarding?.workspaceName && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-text-soft">Workspace</p>
            <p className="text-sm text-text font-medium truncate">
              {onboarding.workspaceName}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 h-9 flex items-center justify-center border-t border-border text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={cn("transition-transform duration-200", collapsed ? "rotate-0" : "rotate-180")}
          >
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-text-soft hover:text-text transition-colors"
          >
            Log out
          </button>
        </footer>
      </div>
    </div>
  );
}
