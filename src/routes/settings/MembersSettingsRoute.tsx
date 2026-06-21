import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsBadge from "../../components/settings/SettingsBadge";
import SettingsPlaceholderTable from "../../components/settings/SettingsPlaceholderTable";
import SettingsEmptyState from "../../components/settings/SettingsEmptyState";

type MemberRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
};

const MOCK_MEMBERS: MemberRow[] = [
  {
    id: "1",
    name: "You",
    email: "you@example.com",
    role: "Owner",
    status: "Active",
    lastActive: "Now",
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex@example.com",
    role: "Editor",
    status: "Active",
    lastActive: "2 days ago",
  },
  {
    id: "3",
    name: "Sam Rivera",
    email: "sam@example.com",
    role: "Viewer",
    status: "Active",
    lastActive: "1 week ago",
  },
];

export default function MembersSettingsRoute() {
  return (
    <SettingsSection
      title="Members"
      description="Invite teammates and manage workspace access."
    >
      <SettingsCard title="Invite Member">
        <div className="flex flex-col sm:flex-row gap-3">
          <TextInput
            label="Email"
            value=""
            placeholder="colleague@company.com"
            disabled
            onChange={() => {}}
            className="flex-1"
          />
          <div className="flex flex-col gap-1 opacity-60">
            <label className="text-xs font-medium text-text-muted">Role</label>
            <select
              disabled
              className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted h-[38px]"
            >
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
        <Button variant="primary" size="sm" disabled className="self-start">
          Send invite — coming soon
        </Button>
      </SettingsCard>

      <SettingsCard title="Members">
        <SettingsPlaceholderTable
          columns={[
            { key: "name", header: "Name", render: (r) => r.name },
            { key: "email", header: "Email", render: (r) => r.email },
            {
              key: "role",
              header: "Role",
              render: (r) => (
                <SettingsBadge variant="default">{r.role}</SettingsBadge>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <SettingsBadge variant="connected">{r.status}</SettingsBadge>
              ),
            },
            { key: "lastActive", header: "Last active", render: (r) => r.lastActive },
            {
              key: "actions",
              header: "Actions",
              render: () => (
                <span className="text-text-soft text-xs">Coming soon</span>
              ),
            },
          ]}
          rows={MOCK_MEMBERS}
          getRowKey={(r) => r.id}
        />
        <p className="text-xs text-text-soft">
          Sample members shown for preview. Member management is coming soon.
        </p>
      </SettingsCard>

      <SettingsCard title="Pending Invites">
        <SettingsEmptyState
          title="No pending invites"
          description="When you invite teammates, pending invitations will appear here."
        />
      </SettingsCard>
    </SettingsSection>
  );
}
