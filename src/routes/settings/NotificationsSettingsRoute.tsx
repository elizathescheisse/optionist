import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsToggle from "../../components/settings/SettingsToggle";

export default function NotificationsSettingsRoute() {
  return (
    <SettingsSection
      title="Notifications"
      description="Choose when Optionist should notify you about workspace activity."
    >
      <SettingsCard title="Email Notifications">
        <SettingsToggle label="Project shared with me" />
        <SettingsToggle label="Comments or feedback added" />
        <SettingsToggle label="Export completed" />
        <SettingsToggle label="Weekly workspace summary" />
        <p className="text-xs text-text-soft">
          Email notifications are not active yet. Delivery settings will be saved
          when notification infrastructure is connected.
        </p>
      </SettingsCard>

      <SettingsCard title="In-app Notifications">
        <SettingsToggle label="Mentions" />
        <SettingsToggle label="Review requests" />
        <SettingsToggle label="Project updates" />
      </SettingsCard>

      <SettingsCard title="Digest">
        <div className="flex flex-wrap gap-4 opacity-60">
          {["Daily", "Weekly", "Never"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm text-text cursor-not-allowed"
            >
              <input
                type="radio"
                name="digest"
                disabled
                defaultChecked={option === "Weekly"}
              />
              {option}
            </label>
          ))}
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
