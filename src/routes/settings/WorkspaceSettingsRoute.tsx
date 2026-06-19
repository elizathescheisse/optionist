import { useAuthStore, type OnboardingAnswers } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import TextInput from "../../components/ui/TextInput";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsField from "../../components/settings/SettingsField";
import type { OnboardingData } from "../../types/workspace";

export default function WorkspaceSettingsRoute() {
  const onboarding = useAuthStore((s) => s.onboarding);
  const wsSettings = useWorkspaceStore((s) => s.settings);
  const org = useWorkspaceStore((s) =>
    s.organizations.find((o) => o.id === s.currentOrganizationId),
  );

  const onboardingData = (wsSettings?.onboarding_data ?? onboarding) as
    | OnboardingAnswers
    | OnboardingData
    | null;

  const workspaceName = org?.name ?? onboardingData?.workspaceName ?? "";
  const workspaceSlug = org?.slug ?? workspaceName.toLowerCase().replace(/\s+/g, "-");

  return (
    <SettingsSection
      title="Workspace"
      description="Manage your workspace profile and shared defaults."
    >
      <SettingsCard title="Workspace Details">
        <TextInput
          label="Workspace name"
          value={workspaceName}
          disabled
          onChange={() => {}}
        />
        <SettingsField label="Workspace slug">
          <p className="text-sm text-text font-mono">{workspaceSlug || "—"}</p>
        </SettingsField>
        <TextInput
          label="Workspace description"
          value=""
          disabled
          placeholder="Add a description — coming soon"
          onChange={() => {}}
        />
      </SettingsCard>

      <SettingsCard title="Workspace Defaults">
        <div className="flex flex-col gap-3 opacity-60">
          <SettingsField label="Default project visibility">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Private</option>
              <option>Workspace</option>
            </select>
          </SettingsField>
          <SettingsField label="Default design mode">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Comparison</option>
              <option>Review</option>
            </select>
          </SettingsField>
          <SettingsField label="Default export format">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>PNG</option>
              <option>PDF</option>
            </select>
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard title="Workspace Branding">
        <div className="flex items-center gap-4 opacity-60">
          <div className="w-12 h-12 rounded-lg bg-surface-muted border border-border" />
          <p className="text-sm text-text-muted">Logo — coming soon</p>
        </div>
        <SettingsField label="Accent color">
          <div className="w-8 h-8 rounded-md bg-primary opacity-60" />
        </SettingsField>
        <SettingsField label="Export watermark">
          <p className="text-sm text-text-muted">Not configured — coming soon</p>
        </SettingsField>
      </SettingsCard>
    </SettingsSection>
  );
}
