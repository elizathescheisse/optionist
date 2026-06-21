import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { isSupabaseConfigured } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";

export default function ThemeSettingsRoute() {
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const user = useAuthStore((s) => s.user);
  const wsSettings = useWorkspaceStore((s) => s.settings);
  const saveWsSettings = useWorkspaceStore((s) => s.saveSettings);

  async function handleTheme(theme: "light" | "dark" | "system") {
    if (isSupabaseConfigured && user?.id) {
      await saveWsSettings(user.id, { theme });
      updateSettings({ theme });
    } else {
      updateSettings({ theme });
    }
  }

  const activeTheme = wsSettings?.theme ?? settings.theme ?? "light";

  return (
    <SettingsSection
      title="Theme"
      description="Choose how Optionist appears on this device. New users start in Light mode unless they change it here."
    >
      <SettingsCard title="Appearance">
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
      </SettingsCard>
    </SettingsSection>
  );
}
