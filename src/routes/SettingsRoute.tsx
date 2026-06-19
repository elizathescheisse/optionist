import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type OnboardingAnswers } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAppStore } from "../store/useAppStore";
import { isSupabaseConfigured } from "../lib/supabase";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import { useToast } from "../context/ToastContext";
import type { OnboardingData } from "../types/workspace";

export default function SettingsRoute() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const onboarding = useAuthStore((s) => s.onboarding);
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const logout = useAuthStore((s) => s.logout);
  const profile = useWorkspaceStore((s) => s.profile);
  const wsSettings = useWorkspaceStore((s) => s.settings);
  const saveProfile = useWorkspaceStore((s) => s.saveProfile);
  const saveWsSettings = useWorkspaceStore((s) => s.saveSettings);
  const org = useWorkspaceStore((s) =>
    s.organizations.find((o) => o.id === s.currentOrganizationId),
  );
  const resetAllData = useAppStore((s) => s.resetAllData);

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

  async function handleTheme(theme: "light" | "dark" | "system") {
    if (isSupabaseConfigured && user?.id) {
      await saveWsSettings(user.id, { theme });
      updateSettings({ theme });
    } else {
      updateSettings({ theme });
    }
  }

  const activeTheme = wsSettings?.theme ?? settings.theme ?? "light";

  function handleResetDemo() {
    resetAllData();
    showToast("Demo data reset.", "success");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg w-full mx-auto px-6 py-10 flex flex-col gap-6">
        <PageHeader title="Settings" subtitle="Manage your workspace preferences." />

        <Card padding="md" className="flex flex-col gap-4">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => void handleSaveName()}
          />
          <div>
            <p className="text-xs font-medium text-text-muted mb-1">Email</p>
            <p className="text-sm text-text">{profile?.email ?? user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted mb-1">Role</p>
            <p className="text-sm text-text">
              {profile?.job_title ?? onboardingData?.role ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted mb-1">Workspace</p>
            <p className="text-sm text-text">
              {org?.name ?? onboardingData?.workspaceName ?? "—"}
            </p>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col gap-3">
          <p className="text-sm font-medium text-text">Theme</p>
          <div className="flex flex-wrap gap-2">
            {(["light", "dark", "system"] as const).map((theme) => (
              <Button
                key={theme}
                variant={activeTheme === theme ? "primary" : "secondary"}
                size="sm"
                onClick={() => void handleTheme(theme)}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Button>
            ))}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col gap-3">
          <Button variant="secondary" onClick={handleResetDemo}>
            Reset demo data
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </Card>
      </div>
    </div>
  );
}
