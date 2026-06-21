import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import { useResetDemoData } from "../../components/settings/useResetDemoData";

export default function DangerZoneSettingsRoute() {
  const { requestReset, ResetConfirmModal } = useResetDemoData();

  return (
    <SettingsSection
      title="Danger Zone"
      description="Permanent and destructive actions for your account or workspace."
      danger
    >
      <SettingsCard title="Reset Demo Data" danger>
        <p className="text-sm text-text-muted">
          Clear all local projects, decisions, and options. Your account and
          theme preferences are not affected.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={requestReset}
          className="self-start"
        >
          Reset demo data
        </Button>
      </SettingsCard>

      <SettingsCard title="Leave Workspace" danger>
        <p className="text-sm text-text-muted">
          Remove yourself from this workspace. You will lose access to shared
          projects.
        </p>
        <Button variant="danger" size="sm" disabled className="self-start">
          Leave workspace — coming soon
        </Button>
      </SettingsCard>

      <SettingsCard title="Delete Workspace" danger>
        <p className="text-sm text-text-muted">
          Permanently delete this workspace and all of its projects. This
          cannot be undone.
        </p>
        <Button variant="danger" size="sm" disabled className="self-start">
          Delete workspace — coming soon
        </Button>
      </SettingsCard>

      <SettingsCard title="Delete Account" danger>
        <p className="text-sm text-text-muted">
          Permanently delete your Optionist account and all associated data.
        </p>
        <Button variant="danger" size="sm" disabled className="self-start">
          Delete account — coming soon
        </Button>
      </SettingsCard>

      <ResetConfirmModal />
    </SettingsSection>
  );
}
