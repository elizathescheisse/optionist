import Button from "../../components/ui/Button";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsField from "../../components/settings/SettingsField";
import SettingsEmptyState from "../../components/settings/SettingsEmptyState";

export default function BillingSettingsRoute() {
  return (
    <SettingsSection
      title="Billing"
      description="Manage your plan, invoices, and usage."
    >
      <SettingsCard title="Current Plan">
        <div className="flex flex-wrap gap-2 opacity-60">
          {["Free", "Pro", "Team", "Enterprise"].map((plan) => (
            <label
              key={plan}
              className="flex items-center gap-2 text-sm text-text cursor-not-allowed"
            >
              <input
                type="radio"
                name="plan"
                disabled
                defaultChecked={plan === "Free"}
              />
              {plan}
            </label>
          ))}
        </div>
        <p className="text-xs text-text-soft">
          Billing is not active yet. All accounts are on the Free plan.
        </p>
      </SettingsCard>

      <SettingsCard title="Usage">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Projects used", value: "—" },
            { label: "Exports this month", value: "—" },
            { label: "Members", value: "1" },
            { label: "Storage", value: "—" },
          ].map((stat) => (
            <SettingsField key={stat.label} label={stat.label}>
              <p className="text-sm text-text">{stat.value}</p>
            </SettingsField>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Invoices">
        <SettingsEmptyState
          title="No invoices yet"
          description="When billing is enabled, your invoice history will appear here."
        />
      </SettingsCard>

      <SettingsCard title="Upgrade">
        <Button variant="primary" size="sm" disabled className="self-start">
          Upgrade — coming soon
        </Button>
      </SettingsCard>
    </SettingsSection>
  );
}
