import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsBadge from "../../components/settings/SettingsBadge";
import SettingsPlaceholderTable from "../../components/settings/SettingsPlaceholderTable";

type LoginRow = {
  id: string;
  device: string;
  location: string;
  time: string;
};

const MOCK_LOGINS: LoginRow[] = [
  {
    id: "1",
    device: "Chrome on macOS",
    location: "Current device",
    time: "Active now",
  },
  {
    id: "2",
    device: "Safari on iPhone",
    location: "San Francisco, CA",
    time: "3 days ago",
  },
];

export default function SecuritySettingsRoute() {
  return (
    <SettingsSection
      title="Security"
      description="Manage account security, sessions, and access safeguards."
    >
      <SettingsCard title="Password">
        <Button variant="secondary" size="sm" disabled className="self-start">
          Change password — coming soon
        </Button>
      </SettingsCard>

      <SettingsCard title="Two-Factor Authentication">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-text-muted">Status</p>
          <SettingsBadge variant="not-connected">Not enabled</SettingsBadge>
        </div>
        <Button variant="secondary" size="sm" disabled className="self-start">
          Enable 2FA — coming soon
        </Button>
      </SettingsCard>

      <SettingsCard title="Active Sessions">
        <SettingsPlaceholderTable
          columns={[
            { key: "device", header: "Device", render: (r) => r.device },
            { key: "location", header: "Location", render: (r) => r.location },
            { key: "time", header: "Last active", render: (r) => r.time },
            {
              key: "actions",
              header: "Actions",
              render: (r) =>
                r.id === "1" ? (
                  <span className="text-xs text-text-soft">Current</span>
                ) : (
                  <span className="text-xs text-text-soft">Coming soon</span>
                ),
            },
          ]}
          rows={MOCK_LOGINS}
          getRowKey={(r) => r.id}
        />
      </SettingsCard>

      <SettingsCard title="Login Activity">
        <SettingsPlaceholderTable
          columns={[
            { key: "device", header: "Device", render: (r) => r.device },
            { key: "location", header: "Location", render: (r) => r.location },
            { key: "time", header: "Time", render: (r) => r.time },
          ]}
          rows={MOCK_LOGINS}
          getRowKey={(r) => r.id}
        />
        <p className="text-xs text-text-soft">
          Sample activity shown for preview. Session management connects with
          Supabase auth.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
