import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsField from "../../components/settings/SettingsField";
import SettingsToggle from "../../components/settings/SettingsToggle";

export default function DesignDefaultsSettingsRoute() {
  return (
    <SettingsSection
      title="Design Defaults"
      description="Set the default design assumptions used when creating new comparisons."
    >
      <SettingsCard title="Default Canvas">
        <div className="flex flex-wrap gap-2 opacity-60">
          {["Desktop", "Tablet", "Mobile", "Custom"].map((size) => (
            <label
              key={size}
              className="flex items-center gap-2 text-sm text-text cursor-not-allowed"
            >
              <input
                type="radio"
                name="canvas"
                disabled
                defaultChecked={size === "Desktop"}
              />
              {size}
            </label>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Design Review Defaults">
        <SettingsToggle label="Show notes panel" checked />
        <SettingsToggle label="Enable score cards" />
        <SettingsToggle label="Show option labels" checked />
      </SettingsCard>

      <SettingsCard title="Token Defaults">
        <div className="flex flex-col gap-3 opacity-60">
          <SettingsField label="Border radius">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Medium (8px)</option>
              <option>Small (4px)</option>
              <option>Large (12px)</option>
            </select>
          </SettingsField>
          <SettingsField label="Font scale">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>100%</option>
              <option>110%</option>
            </select>
          </SettingsField>
          <SettingsField label="Color mode">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Light</option>
              <option>Dark</option>
            </select>
          </SettingsField>
          <SettingsField label="Spacing density">
            <select disabled className="text-sm border border-border rounded-md px-3 py-2 bg-surface text-text-muted w-full max-w-xs">
              <option>Comfortable</option>
              <option>Compact</option>
            </select>
          </SettingsField>
        </div>
        <p className="text-xs text-text-soft">
          Design defaults apply to new comparisons. Not saved yet — coming soon.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
