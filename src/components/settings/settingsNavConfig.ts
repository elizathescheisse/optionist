import type { SettingsAccess } from "./settingsAccess";

export type SettingsNavBadge = "admin" | "owner";

export type SettingsNavItem = {
  label: string;
  path: string;
  access: SettingsAccess;
  badge?: SettingsNavBadge;
  danger?: boolean;
};

export type SettingsNavGroup = {
  label: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    label: "Personal",
    items: [
      { label: "Profile", path: "/settings/profile", access: "user" },
      { label: "Account", path: "/settings/account", access: "user" },
      { label: "Preferences", path: "/settings/preferences", access: "user" },
      {
        label: "Notifications",
        path: "/settings/notifications",
        access: "user",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "Workspace",
        path: "/settings/workspace",
        access: "workspace-member",
      },
      {
        label: "Members",
        path: "/settings/members",
        access: "workspace-admin",
        badge: "admin",
      },
      {
        label: "Roles & Permissions",
        path: "/settings/roles",
        access: "workspace-admin",
        badge: "admin",
      },
      {
        label: "Projects",
        path: "/settings/projects",
        access: "workspace-member",
      },
    ],
  },
  {
    label: "Product",
    items: [
      { label: "Theme", path: "/settings/theme", access: "guest" },
      {
        label: "Design Defaults",
        path: "/settings/design-defaults",
        access: "user",
      },
      {
        label: "Export Settings",
        path: "/settings/export",
        access: "user",
      },
      {
        label: "Integrations",
        path: "/settings/integrations",
        access: "workspace-admin",
        badge: "admin",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Organization",
        path: "/settings/organization",
        access: "workspace-owner",
        badge: "owner",
      },
      {
        label: "Billing",
        path: "/settings/billing",
        access: "workspace-owner",
        badge: "owner",
      },
      { label: "Security", path: "/settings/security", access: "user" },
      {
        label: "Data & Privacy",
        path: "/settings/data-privacy",
        access: "user",
      },
      {
        label: "Danger Zone",
        path: "/settings/danger-zone",
        access: "workspace-owner",
        badge: "owner",
        danger: true,
      },
    ],
  },
];

export const ALL_SETTINGS_PATHS = SETTINGS_NAV.flatMap((g) =>
  g.items.map((i) => i.path),
);
