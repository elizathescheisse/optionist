import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";

type PermissionRow = {
  permission: string;
  owner: string;
  admin: string;
  editor: string;
  viewer: string;
  guest: string;
};

const PERMISSIONS: PermissionRow[] = [
  {
    permission: "Create projects",
    owner: "Yes",
    admin: "Yes",
    editor: "Yes",
    viewer: "No",
    guest: "Local only",
  },
  {
    permission: "Invite members",
    owner: "Yes",
    admin: "Yes",
    editor: "No",
    viewer: "No",
    guest: "No",
  },
  {
    permission: "Manage billing",
    owner: "Yes",
    admin: "No",
    editor: "No",
    viewer: "No",
    guest: "No",
  },
  {
    permission: "Export files",
    owner: "Yes",
    admin: "Yes",
    editor: "Yes",
    viewer: "View",
    guest: "No",
  },
  {
    permission: "Manage workspace settings",
    owner: "Yes",
    admin: "Yes",
    editor: "No",
    viewer: "No",
    guest: "No",
  },
  {
    permission: "Edit comparisons",
    owner: "Yes",
    admin: "Yes",
    editor: "Yes",
    viewer: "No",
    guest: "Local only",
  },
];

export default function RolesSettingsRoute() {
  return (
    <SettingsSection
      title="Roles & Permissions"
      description="Understand what each role can do in your workspace."
    >
      <SettingsCard title="Permission Matrix">
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-muted py-2 pr-4">
                  Permission
                </th>
                {["Owner", "Admin", "Editor", "Viewer", "Guest"].map((role) => (
                  <th
                    key={role}
                    className="text-left text-xs font-medium text-text-muted py-2 pr-3"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((row) => (
                <tr key={row.permission} className="border-b border-border/60">
                  <td className="py-3 pr-4 text-text">{row.permission}</td>
                  <td className="py-3 pr-3 text-text-muted">{row.owner}</td>
                  <td className="py-3 pr-3 text-text-muted">{row.admin}</td>
                  <td className="py-3 pr-3 text-text-muted">{row.editor}</td>
                  <td className="py-3 pr-3 text-text-muted">{row.viewer}</td>
                  <td className="py-3 pr-3 text-text-muted">{row.guest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-soft">
          Role management and custom permissions are coming soon. This matrix
          shows the planned default behavior.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
