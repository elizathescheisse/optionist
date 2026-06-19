import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsRow from "../../components/settings/SettingsRow";
import SettingsField from "../../components/settings/SettingsField";
import SettingsBadge from "../../components/settings/SettingsBadge";

const SIGN_IN_METHODS = [
  { name: "Email / password", status: "connected" as const },
  { name: "Google", status: "coming-soon" as const },
  { name: "Apple", status: "coming-soon" as const },
  { name: "Facebook", status: "coming-soon" as const },
];

export default function AccountSettingsRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const email = user?.email ?? "—";

  return (
    <SettingsSection
      title="Account"
      description="Manage your sign-in methods and account access."
    >
      <SettingsCard title="Sign-in Methods">
        <div className="flex flex-col gap-3">
          {SIGN_IN_METHODS.map((method) => (
            <SettingsRow key={method.name} label={method.name}>
              <SettingsBadge
                variant={
                  method.status === "connected" ? "connected" : "coming-soon"
                }
              >
                {method.status === "connected" ? "Connected" : "Coming soon"}
              </SettingsBadge>
            </SettingsRow>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Email Address">
        <SettingsField label="Current email">
          <p className="text-sm text-text">{email}</p>
        </SettingsField>
        <Button variant="secondary" size="sm" disabled className="self-start">
          Change email
        </Button>
      </SettingsCard>

      <SettingsCard title="Password">
        <Button variant="secondary" size="sm" disabled className="self-start">
          Change password
        </Button>
        <p className="text-xs text-text-soft">
          Password changes apply to email sign-in. OAuth-only accounts use their
          provider for authentication.
        </p>
      </SettingsCard>

      <SettingsCard title="Session">
        <SettingsRow
          label="Signed in"
          description={email}
        >
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </SettingsRow>
      </SettingsCard>
    </SettingsSection>
  );
}
