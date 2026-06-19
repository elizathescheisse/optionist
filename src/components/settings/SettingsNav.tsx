import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { cn } from "../../utils/cn";
import { canSeeOrgSettings } from "../../lib/permissions";
import {
  filterNavForAccess,
  getSettingsAccessContext,
} from "./settingsAccess";
import { SETTINGS_NAV } from "./settingsNavConfig";
import SettingsBadge from "./SettingsBadge";

function NavLinkItem({
  to,
  label,
  badge,
  danger,
  showBadge,
}: {
  to: string;
  label: string;
  badge?: "admin" | "owner";
  danger?: boolean;
  showBadge: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors motion-reduce:transition-none",
          "hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isActive
            ? "bg-primary-soft text-primary font-medium"
            : danger
              ? "text-error/80 hover:text-error"
              : "text-text-muted hover:text-text",
        )
      }
    >
      <span>{label}</span>
      {showBadge && badge && (
        <SettingsBadge variant={badge === "owner" ? "owner" : "admin"}>
          {badge === "owner" ? "Owner" : "Admin"}
        </SettingsBadge>
      )}
    </NavLink>
  );
}

function DesktopNav() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useWorkspaceStore((s) => s.currentRole);
  const ctx = getSettingsAccessContext(isGuest(), isAuthenticated(), role);
  const showAdminBadges = canSeeOrgSettings(role);

  return (
    <nav className="hidden lg:flex flex-col gap-6" aria-label="Settings sections">
      {SETTINGS_NAV.map((group) => {
        const items = filterNavForAccess(group.items, ctx);
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 text-xs font-medium text-text-soft uppercase tracking-wide">
              {group.label}
            </p>
            {items.map((item) => (
              <NavLinkItem
                key={item.path}
                to={item.path}
                label={item.label}
                badge={item.badge}
                danger={item.danger}
                showBadge={showAdminBadges}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function MobileNav() {
  const location = useLocation();
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useWorkspaceStore((s) => s.currentRole);
  const ctx = getSettingsAccessContext(isGuest(), isAuthenticated(), role);

  const flatItems = filterNavForAccess(
    SETTINGS_NAV.flatMap((g) => g.items),
    ctx,
  );

  return (
    <nav
      className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none"
      aria-label="Settings sections"
    >
      {flatItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors motion-reduce:transition-none",
              "hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-primary-soft text-primary"
                : item.danger
                  ? "text-error/80"
                  : "text-text-muted hover:text-text",
            )}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function SettingsNav() {
  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  );
}
