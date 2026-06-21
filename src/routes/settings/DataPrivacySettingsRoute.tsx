import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import { useResetDemoData } from "../../components/settings/useResetDemoData";

export default function DataPrivacySettingsRoute() {
  const { requestReset, ResetConfirmModal } = useResetDemoData();

  return (
    <SettingsSection
      title="Data & Privacy"
      description="Manage data retention, exports, and privacy preferences."
    >
      <SettingsCard title="Data Export">
        <Button variant="secondary" size="sm" disabled className="self-start">
          Export my data
        </Button>
        <p className="text-xs text-text-soft">
          Download a copy of your Optionist data. Coming soon.
        </p>
      </SettingsCard>

      <SettingsCard title="Data Retention">
        <div className="flex flex-col gap-2 text-sm text-text-muted">
          <label className="flex items-center gap-2 opacity-60 cursor-not-allowed">
            <input type="radio" name="retention" disabled defaultChecked />
            Keep history forever
          </label>
          <label className="flex items-center gap-2 opacity-60 cursor-not-allowed">
            <input type="radio" name="retention" disabled />
            Keep history for 90 days
          </label>
          <label className="flex items-center gap-2 opacity-60 cursor-not-allowed">
            <input type="radio" name="retention" disabled />
            Keep history for 30 days
          </label>
        </div>
        <p className="text-xs text-text-soft">
          Retention policies will apply to cloud-backed workspaces. Coming soon.
        </p>
      </SettingsCard>

      <SettingsCard title="Privacy">
        <div className="flex flex-col gap-3 opacity-60">
          <label className="flex items-center justify-between gap-4 text-sm text-text cursor-not-allowed">
            <span>Allow anonymous product analytics</span>
            <input type="checkbox" disabled />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-text cursor-not-allowed">
            <span>Include workspace name in shared links</span>
            <input type="checkbox" disabled defaultChecked />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-text cursor-not-allowed">
            <span>Make shared links discoverable</span>
            <input type="checkbox" disabled />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard title="Local Data">
        <Button
          variant="secondary"
          size="sm"
          onClick={requestReset}
          className="self-start"
        >
          Reset demo data
        </Button>
        <p className="text-xs text-text-soft">
          Clears all projects, decisions, and options from local storage. Your
          account and preferences are not affected.
        </p>
      </SettingsCard>

      <ResetConfirmModal />
    </SettingsSection>
  );
}
