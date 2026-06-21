import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsBadge from "../../components/settings/SettingsBadge";

const INTEGRATIONS = [
  {
    name: "Figma",
    description: "Import frames and compare design directions.",
  },
  {
    name: "GitHub",
    description:
      "Attach comparisons to pull requests and design implementation branches.",
  },
  {
    name: "Slack",
    description: "Share comparison summaries with your team.",
  },
  {
    name: "Linear",
    description: "Link design decisions to issues and project milestones.",
  },
  {
    name: "Jira",
    description: "Connect comparisons to epics and design tickets.",
  },
  {
    name: "Notion",
    description: "Embed comparison summaries in workspace docs.",
  },
  {
    name: "Google Drive",
    description: "Export and sync comparison outputs to Drive.",
  },
];

export default function IntegrationsSettingsRoute() {
  return (
    <SettingsSection
      title="Integrations"
      description="Connect Optionist to tools you already use."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => (
          <SettingsCard key={integration.name} title={integration.name}>
            <p className="text-sm text-text-muted leading-normal">
              {integration.description}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" disabled>
                Connect
              </Button>
              <SettingsBadge variant="coming-soon">Coming soon</SettingsBadge>
            </div>
          </SettingsCard>
        ))}
      </div>
    </SettingsSection>
  );
}
