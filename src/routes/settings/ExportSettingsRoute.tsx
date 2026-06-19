import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsToggle from "../../components/settings/SettingsToggle";

export default function ExportSettingsRoute() {
  return (
    <SettingsSection
      title="Export Settings"
      description="Manage how files, summaries, and comparison outputs are exported."
    >
      <SettingsCard title="Default Export Format">
        <div className="flex flex-wrap gap-2 opacity-60">
          {["PNG", "PDF", "Markdown", "JSON", "ZIP package"].map((format) => (
            <label
              key={format}
              className="flex items-center gap-2 text-sm text-text cursor-not-allowed"
            >
              <input
                type="radio"
                name="export-format"
                disabled
                defaultChecked={format === "PNG"}
              />
              {format}
            </label>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Export Naming">
        <SettingsToggle label="Include project name" checked />
        <SettingsToggle label="Include date" checked />
        <SettingsToggle label="Include option label" />
      </SettingsCard>

      <SettingsCard title="Export Metadata">
        <SettingsToggle label="Include author" checked />
        <SettingsToggle label="Include workspace" />
        <SettingsToggle label="Include comments" />
        <SettingsToggle label="Include design tokens" />
        <p className="text-xs text-text-soft">
          Export preferences are not saved yet. Coming soon.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
