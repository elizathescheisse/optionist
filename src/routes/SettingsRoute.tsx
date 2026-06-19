import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import { useToast } from "../context/ToastContext";

export default function SettingsRoute() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const onboarding = useAuthStore((s) => s.onboarding);
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const logout = useAuthStore((s) => s.logout);
  const resetAllData = useAppStore((s) => s.resetAllData);

  const [name, setName] = useState(settings.name ?? user?.name ?? "");

  function handleSaveName() {
    updateSettings({ name: name.trim() });
    showToast("Settings saved.", "success");
  }

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
            onBlur={handleSaveName}
          />
          <div>
            <p className="text-xs font-medium text-text-muted mb-1">Role</p>
            <p className="text-sm text-text">{onboarding?.role ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted mb-1">Workspace</p>
            <p className="text-sm text-text">{onboarding?.workspaceName ?? "—"}</p>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col gap-3">
          <p className="text-sm font-medium text-text">Theme</p>
          <div className="flex gap-2">
            <Button
              variant={settings.theme === "light" ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateSettings({ theme: "light" })}
            >
              Light
            </Button>
            <Button
              variant={settings.theme === "dark" ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateSettings({ theme: "dark" })}
            >
              Dark
            </Button>
          </div>
          <p className="text-xs text-text-soft">
            Dark mode uses design tokens; some older screens may still be light-only.
          </p>
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
