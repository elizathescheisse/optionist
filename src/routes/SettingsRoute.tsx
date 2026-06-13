import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, type AppSettings } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import Button from "../components/shared/Button";
import TextInput from "../components/shared/TextInput";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import ImportExportControls from "../components/projects/ImportExportControls";
import Modal from "../components/shared/Modal";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";
import { removeItem, STORAGE_KEYS } from "../services/storage";
import { clearTimeline } from "../services/timeline";
import type { CompareMode } from "../types/domain";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "workspace", label: "Workspace" },
  { id: "preferences", label: "Preferences" },
  { id: "presentation", label: "Presentation" },
  { id: "data", label: "Data" },
  { id: "integrations", label: "Integrations" },
  { id: "team", label: "Team" },
  { id: "notifications", label: "Notifications" },
  { id: "workflow", label: "Workflow" },
  { id: "advanced", label: "Advanced" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = (searchParams.get("section") as SectionId) || "profile";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const user = useAuthStore((s) => s.user);
  const onboarding = useAuthStore((s) => s.onboarding);
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const logout = useAuthStore((s) => s.logout);
  const resetAllData = useAppStore((s) => s.resetAllData);

  const [name, setName] = useState(settings.name ?? user?.name ?? "");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function setSection(id: SectionId) {
    setSearchParams({ section: id });
  }

  function handleSaveName() {
    updateSettings({ name: name.trim() });
    showToast("Profile saved", "success");
  }

  function toggleNotification(key: keyof NonNullable<AppSettings["notifications"]>) {
    const notifications = {
      emailDigest: false,
      decisionReminders: true,
      feedbackAlerts: true,
      ...settings.notifications,
      [key]: !settings.notifications?.[key],
    };
    updateSettings({ notifications });
  }

  function toggleWorkflow(key: keyof NonNullable<AppSettings["workflow"]>) {
    const workflow = {
      requireRationale: false,
      warnOnUndecided: true,
      ...settings.workflow,
      [key]: !settings.workflow?.[key],
    };
    updateSettings({ workflow });
  }

  return (
    <div className="flex-1 overflow-hidden flex">
      <nav className="w-52 shrink-0 border-r border-app-border bg-app-sidebar p-3 flex flex-col gap-0.5 overflow-y-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
              section === s.id
                ? "bg-primary-soft text-primary"
                : "text-text-muted hover:bg-app-surface-soft hover:text-text",
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
          <PageHeader
            title="Settings"
            subtitle="Manage your workspace, preferences, and integrations."
          />

          {section === "profile" && (
            <Card padding="md" className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-soft text-primary font-semibold text-lg flex items-center justify-center">
                  {(name || user?.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{name || "Demo User"}</p>
                  <p className="text-xs text-text-soft">{user?.email ?? "demo@optionist.app"}</p>
                </div>
              </div>
              <TextInput label="Display name" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSaveName} />
              <div>
                <p className="text-xs font-medium text-text-muted mb-1">Role</p>
                <p className="text-sm text-text">{onboarding?.role ?? "Product designer"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted mb-1">Organization</p>
                <p className="text-sm text-text">{onboarding?.workspaceName ?? "My workspace"}</p>
              </div>
            </Card>
          )}

          {section === "workspace" && (
            <Card padding="md" className="flex flex-col gap-4">
              <TextInput label="Workspace name" defaultValue={onboarding?.workspaceName ?? ""} readOnly />
              <TextInput label="Description" defaultValue="" placeholder="What this workspace is for…" onFocus={() => showToast("Workspace editing coming soon")} />
              <TextInput label="Default audience" defaultValue={onboarding?.audience ?? ""} readOnly />
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Accent preview</p>
                <div className="h-10 rounded-lg bg-primary" />
              </div>
            </Card>
          )}

          {section === "preferences" && (
            <Card padding="md" className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-text mb-2">Theme</p>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <Button
                      key={t}
                      variant={settings.theme === t ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => updateSettings({ theme: t })}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text mb-2">Density</p>
                <div className="flex gap-2">
                  {(["comfortable", "compact"] as const).map((d) => (
                    <Button
                      key={d}
                      variant={(settings.density ?? "comfortable") === d ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => updateSettings({ density: d })}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text mb-2">Default compare view</p>
                <div className="flex gap-2">
                  {(["grid", "side-by-side", "focus"] as CompareMode[]).map((v) => (
                    <Button
                      key={v}
                      variant={(settings.defaultCompareView ?? "grid") === v ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => updateSettings({ defaultCompareView: v })}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={settings.reduceMotion ?? false}
                  onChange={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
                />
                Reduce motion
              </label>
            </Card>
          )}

          {section === "presentation" && (
            <Card padding="md" className="flex flex-col gap-3">
              {(
                [
                  ["showRecommendation", "Show recommendation"],
                  ["hideNotes", "Hide facilitator notes"],
                  ["showExecutiveSummary", "Show executive summary slide"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={settings.presentationDefaults?.[key] ?? true}
                    onChange={() =>
                      updateSettings({
                        presentationDefaults: {
                          showRecommendation: true,
                          hideNotes: true,
                          showExecutiveSummary: true,
                          ...settings.presentationDefaults,
                          [key]: !settings.presentationDefaults?.[key],
                        },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </Card>
          )}

          {section === "data" && (
            <Card padding="md" className="flex flex-col gap-4">
              <ImportExportControls />
              <Button variant="secondary" onClick={() => { resetAllData(); showToast("Demo data reset", "success"); }}>
                Reset all demo data
              </Button>
              <Button variant="destructive" onClick={() => showToast("Clear comparisons only — coming soon")}>
                Clear comparisons only
              </Button>
            </Card>
          )}

          {section === "integrations" && (
            <div className="grid grid-cols-2 gap-3">
              {["Figma", "Slack", "Jira", "Linear"].map((intName) => (
                <button
                  key={intName}
                  type="button"
                  className="text-left"
                  onClick={() => showToast(`${intName} integration coming soon`)}
                >
                  <Card padding="md" hover>
                    <p className="text-sm font-medium text-text">{intName}</p>
                    <p className="text-xs text-text-soft mt-1">
                      {intName === "Figma" ? "Import design options" : "Coming soon"}
                    </p>
                  </Card>
                </button>
              ))}
            </div>
          )}

          {section === "team" && (
            <Card padding="md" className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-text">Team members</p>
                <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
                  Invite
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-soft text-xs">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-app-border">
                    <td className="py-2 text-text">{settings.name ?? user?.name ?? "You"}</td>
                    <td className="py-2 text-text-muted">Owner</td>
                  </tr>
                  <tr className="border-t border-app-border">
                    <td className="py-2 text-text-muted">Alex Chen</td>
                    <td className="py-2 text-text-muted">Reviewer</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          )}

          {section === "notifications" && (
            <Card padding="md" className="flex flex-col gap-3">
              {(
                [
                  ["emailDigest", "Weekly email digest"],
                  ["decisionReminders", "Decision due date reminders"],
                  ["feedbackAlerts", "New feedback alerts"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={settings.notifications?.[key] ?? false}
                    onChange={() => toggleNotification(key)}
                  />
                  {label}
                </label>
              ))}
            </Card>
          )}

          {section === "workflow" && (
            <Card padding="md" className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={settings.workflow?.requireRationale ?? false}
                  onChange={() => toggleWorkflow("requireRationale")}
                />
                Require rationale before marking decided
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={settings.workflow?.warnOnUndecided ?? true}
                  onChange={() => toggleWorkflow("warnOnUndecided")}
                />
                Warn when leaving undecided comparisons
              </label>
            </Card>
          )}

          {section === "advanced" && (
            <Card padding="md" className="flex flex-col gap-3">
              <button
                type="button"
                className="text-sm text-text-muted text-left"
                onClick={() => setAdvancedOpen(!advancedOpen)}
              >
                {advancedOpen ? "▼" : "▶"} Debug tools
              </button>
              {advancedOpen && (
                <div className="flex flex-col gap-2 pl-2">
                  <Button variant="outline" size="sm" onClick={() => showToast(JSON.stringify(useAppStore.getState(), null, 2).slice(0, 200) + "…")}>
                    Copy app state (truncated)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { removeItem(STORAGE_KEYS.auth); showToast("Auth cleared — reload to log out"); }}>
                    Clear auth
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { removeItem(STORAGE_KEYS.onboarding); showToast("Onboarding cleared"); }}>
                    Clear onboarding
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { clearTimeline(); showToast("Timeline cleared"); }}>
                    Clear timeline
                  </Button>
                </div>
              )}
            </Card>
          )}

          <div className="pt-4 border-t border-app-border">
            <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }}>
              Log out
            </Button>
          </div>
        </div>
      </div>

      {showInvite && (
        <Modal
          title="Invite teammate"
          size="sm"
          onConfirm={() => {
            setShowInvite(false);
            showToast(`Invite sent to ${inviteEmail || "teammate"} (demo)`);
            setInviteEmail("");
          }}
          onCancel={() => setShowInvite(false)}
          confirmLabel="Send invite"
        >
          <TextInput
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
          />
        </Modal>
      )}
    </div>
  );
}
