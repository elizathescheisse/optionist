import { useAuthStore, type OnboardingAnswers } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useAppStore } from "../../store/useAppStore";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsField from "../../components/settings/SettingsField";
import type { OnboardingData } from "../../types/workspace";

export default function OrganizationSettingsRoute() {
  const user = useAuthStore((s) => s.user);
  const onboarding = useAuthStore((s) => s.onboarding);
  const wsSettings = useWorkspaceStore((s) => s.settings);
  const org = useWorkspaceStore((s) =>
    s.organizations.find((o) => o.id === s.currentOrganizationId),
  );
  const projects = useAppStore((s) => s.projects);

  const onboardingData = (wsSettings?.onboarding_data ?? onboarding) as
    | OnboardingAnswers
    | OnboardingData
    | null;

  const orgName = org?.name ?? onboardingData?.workspaceName ?? "—";

  return (
    <SettingsSection
      title="Organization"
      description="Manage organization-level details for your Optionist account."
    >
      <SettingsCard title="Organization Details">
        <TextInput
          label="Organization name"
          value={orgName}
          disabled
          onChange={() => {}}
        />
        <TextInput
          label="Legal / company name"
          value=""
          disabled
          placeholder="Not set — coming soon"
          onChange={() => {}}
        />
        <SettingsField label="Primary owner">
          <p className="text-sm text-text">{user?.name ?? user?.email ?? "—"}</p>
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Workspace Structure">
        <SettingsField label="Current workspace">
          <p className="text-sm text-text">{orgName}</p>
        </SettingsField>
        <SettingsField label="Number of projects">
          <p className="text-sm text-text">{Object.keys(projects).length}</p>
        </SettingsField>
        <SettingsField label="Number of members">
          <p className="text-sm text-text-muted">1 — member management coming soon</p>
        </SettingsField>
        <SettingsField label="Plan">
          <p className="text-sm text-text-muted">Free — billing coming soon</p>
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Ownership">
        <Button variant="danger" size="sm" disabled className="self-start">
          Transfer ownership — coming soon
        </Button>
        <p className="text-xs text-text-soft">
          Transferring ownership requires confirmation from the new owner.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
