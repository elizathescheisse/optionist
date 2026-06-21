import { useState } from "react";
import { useAuthStore, type OnboardingAnswers } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { isSupabaseConfigured } from "../../lib/supabase";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import type { OnboardingData } from "../../types/workspace";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsField from "../../components/settings/SettingsField";
import SettingsToggle from "../../components/settings/SettingsToggle";

export default function ProfileSettingsRoute() {
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const onboarding = useAuthStore((s) => s.onboarding);
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const profile = useWorkspaceStore((s) => s.profile);
  const wsSettings = useWorkspaceStore((s) => s.settings);
  const saveProfile = useWorkspaceStore((s) => s.saveProfile);
  const org = useWorkspaceStore((s) =>
    s.organizations.find((o) => o.id === s.currentOrganizationId),
  );

  const onboardingData = (wsSettings?.onboarding_data ?? onboarding) as
    | OnboardingAnswers
    | OnboardingData
    | null;

  const [name, setName] = useState(
    profile?.full_name ?? settings.name ?? user?.name ?? "",
  );

  async function handleSaveName() {
    const trimmed = name.trim();
    if (isSupabaseConfigured && user?.id) {
      await saveProfile(user.id, { full_name: trimmed });
    } else {
      updateSettings({ name: trimmed });
    }
    showToast("Settings saved.", "success");
  }

  const email = profile?.email ?? user?.email ?? "—";
  const role = profile?.job_title ?? onboardingData?.role ?? "—";
  const workspace = org?.name ?? onboardingData?.workspaceName ?? "—";

  return (
    <SettingsSection
      title="Profile"
      description="Manage how your name and profile appear across Optionist."
    >
      <SettingsCard title="Basic Information">
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => void handleSaveName()}
        />
        <SettingsField label="Email">
          <p className="text-sm text-text">{email}</p>
        </SettingsField>
        <SettingsField label="Role">
          <p className="text-sm text-text">{role}</p>
        </SettingsField>
        <SettingsField label="Workspace">
          <p className="text-sm text-text">{workspace}</p>
        </SettingsField>
        <Button variant="secondary" size="sm" disabled className="self-start">
          Save — coming soon
        </Button>
      </SettingsCard>

      <SettingsCard title="Avatar">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-muted border border-border flex items-center justify-center text-text-soft text-lg font-medium">
            {(name || email).charAt(0).toUpperCase()}
          </div>
          <Button variant="secondary" size="sm" disabled>
            Upload avatar
          </Button>
        </div>
        <p className="text-xs text-text-soft">
          Avatar uploads will be available when account storage is connected.
        </p>
      </SettingsCard>

      <SettingsCard title="Profile Visibility">
        <SettingsToggle
          label="Show name on shared comparison links"
          description="Display your name when sharing comparisons externally."
        />
        <SettingsToggle
          label="Show workspace name on exports"
          description="Include your workspace name in exported files."
        />
      </SettingsCard>
    </SettingsSection>
  );
}
