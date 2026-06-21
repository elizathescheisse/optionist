import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsField from "../../components/settings/SettingsField";
import SettingsToggle from "../../components/settings/SettingsToggle";

export default function ProjectsSettingsRoute() {
  return (
    <SettingsSection
      title="Projects"
      description="Set defaults for new projects and comparison workspaces."
    >
      <SettingsCard title="Project Defaults">
        <div className="flex flex-col gap-3 opacity-60">
          <SettingsField label="Default project visibility">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Private</option>
              <option>Workspace</option>
            </select>
          </SettingsField>
          <SettingsField label="Default project type">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Design comparison</option>
              <option>Decision review</option>
            </select>
          </SettingsField>
          <SettingsField label="Default sorting">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Recently updated</option>
              <option>Alphabetical</option>
            </select>
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard title="Comparison Defaults">
        <SettingsField label="Number of options shown by default">
          <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs opacity-60">
            <option>All options</option>
            <option>Finalists only</option>
          </select>
        </SettingsField>
        <SettingsToggle label="Enable notes" checked />
        <SettingsToggle label="Enable scoring" />
      </SettingsCard>

      <SettingsCard title="History">
        <SettingsField label="Retention period">
          <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs opacity-60">
            <option>Keep forever</option>
            <option>90 days</option>
            <option>30 days</option>
          </select>
        </SettingsField>
        <SettingsToggle label="Auto-save project history" checked />
        <p className="text-xs text-text-soft">
          Workspace-level project defaults are not saved yet. Coming soon.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
