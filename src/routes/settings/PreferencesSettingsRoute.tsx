import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsToggle from "../../components/settings/SettingsToggle";

export default function PreferencesSettingsRoute() {
  return (
    <SettingsSection
      title="Preferences"
      description="Customize your personal Optionist experience."
    >
      <SettingsCard title="Default Landing Page">
        <div className="flex flex-wrap gap-2 opacity-60">
          {["Dashboard", "Projects", "Last opened project"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm text-text cursor-not-allowed"
            >
              <input
                type="radio"
                name="landing"
                disabled
                defaultChecked={option === "Dashboard"}
              />
              {option}
            </label>
          ))}
        </div>
        <p className="text-xs text-text-soft">
          Landing page preference is not saved yet. Coming soon.
        </p>
      </SettingsCard>

      <SettingsCard title="Comparison Behavior">
        <SettingsToggle label="Open newest option first" />
        <SettingsToggle label="Show comparison notes by default" />
        <SettingsToggle label="Remember last selected view" />
      </SettingsCard>

      <SettingsCard title="Editor Preferences">
        <SettingsToggle label="Show rulers and guides" />
        <SettingsToggle label="Enable keyboard shortcuts" checked />
        <div className="flex flex-col gap-1 opacity-60">
          <p className="text-xs font-medium text-text-muted">Default zoom level</p>
          <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted max-w-xs">
            <option>100%</option>
            <option>Fit to width</option>
          </select>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
