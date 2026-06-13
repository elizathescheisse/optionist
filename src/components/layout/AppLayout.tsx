import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { cn } from "../../utils/cn";

type NavItem = {
  to: string;
  label: string;
  match: string;
  icon: ReactNode;
};

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/app",
    label: "Dashboard",
    match: "/app",
    icon: <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    to: "/app/projects",
    label: "Projects",
    match: "/app/projects",
    icon: <NavIcon d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
  },
  {
    to: "/app/settings",
    label: "Settings",
    match: "/app/settings",
    icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);

  function isActive(match: string) {
    if (match === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(match);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function toggleTheme() {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  }

  const isWorkspace =
    location.pathname.includes("/projects/") ||
    location.pathname.includes("/comparisons/");

  const compact = isWorkspace;

  return (
    <div className="h-full flex bg-app-bg">
      <aside
        className={cn(
          "shrink-0 flex flex-col border-r border-app-border bg-app-sidebar",
          compact ? "w-14" : "w-[var(--spacing-sidebar)]",
        )}
      >
        <div className="h-[var(--spacing-topbar)] flex items-center px-4 border-b border-app-border shrink-0">
          <Link to="/app" className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              O
            </span>
            {!compact && (
              <span className="font-semibold text-text text-sm tracking-tight truncate">
                Optionist
              </span>
            )}
          </Link>
        </div>

        <WorkspaceSwitcher compact={compact} />

        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={compact ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive(item.match)
                  ? "bg-primary-soft text-primary"
                  : "text-text-muted hover:bg-app-surface-soft hover:text-text",
                compact && "justify-center px-2",
              )}
            >
              {item.icon}
              {!compact && item.label}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-app-border flex flex-col gap-0.5">
          <Link
            to="/app/design-system"
            title={compact ? "Design System" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-muted",
              "hover:bg-app-surface-soft hover:text-text transition-colors",
              compact && "justify-center px-2",
            )}
          >
            <NavIcon d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            {!compact && "Design System"}
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            title={compact ? "Toggle theme" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-muted w-full",
              "hover:bg-app-surface-soft hover:text-text transition-colors",
              compact && "justify-center px-2",
            )}
          >
            <NavIcon d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            {!compact && (settings.theme === "dark" ? "Light mode" : "Dark mode")}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title={compact ? "Log out" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-muted w-full",
              "hover:bg-app-surface-soft hover:text-text transition-colors",
              compact && "justify-center px-2",
            )}
          >
            <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            {!compact && "Log out"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
