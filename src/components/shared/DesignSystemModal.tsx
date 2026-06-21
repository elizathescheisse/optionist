import { useEffect, useState } from "react";
import { isTypingTarget } from "../../utils/keyboard";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import Textarea from "../ui/Textarea";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Divider from "../ui/Divider";
import EmptyState from "../ui/EmptyState";
import IconButton from "../ui/IconButton";
import LoadingState from "../ui/LoadingState";
import PageHeader from "../ui/PageHeader";
import Pill from "../ui/Pill";
import SectionHeader from "../ui/SectionHeader";
import Tabs from "../ui/Tabs";

const COLORS = [
  { name: "surface", hex: "#ffffff", token: "surface", usage: "Cards, panels, inputs, elevated surfaces." },
  { name: "border", hex: "#e3e8f2", token: "border", usage: "Dividers, input borders, card outlines." },
  { name: "text", hex: "#151827", token: "text", usage: "Primary body and heading text." },
  { name: "success", hex: "#059669", token: "success", usage: "Confirmed states, positive feedback." },
  { name: "error", hex: "#dc2626", token: "error", usage: "Errors, destructive actions." },
  { name: "warning", hex: "#a16207", token: "warning", usage: "Caution states, missing rationale." },
  { name: "warning-soft", hex: "#fefce8", token: "warning-soft", usage: "Soft warning backgrounds, active nav highlight." },
];

const TYPE_SAMPLES = [
  { role: "Display", class: "text-3xl font-semibold leading-tight", size: "36px", weight: "600", usage: "Marketing headlines" },
  { role: "Page title", class: "text-xl font-semibold leading-tight", size: "22px", weight: "600", usage: "Dashboard and page headers" },
  { role: "Section title", class: "text-md font-semibold", size: "16px", weight: "600", usage: "Section headers within pages" },
  { role: "Card title", class: "text-sm font-medium", size: "14px", weight: "500", usage: "Decision and option card titles" },
  { role: "Body", class: "text-sm leading-normal", size: "14px", weight: "400", usage: "Default UI text" },
  { role: "Small text", class: "text-xs leading-normal", size: "12px", weight: "400", usage: "Metadata, timestamps" },
  { role: "Label", class: "text-xs font-medium uppercase tracking-wider", size: "12px", weight: "500", usage: "Form labels, section labels" },
  { role: "Caption", class: "text-xs text-text-soft", size: "12px", weight: "400", usage: "Helper text, footnotes" },
  { role: "Button text", class: "text-sm font-medium", size: "14px", weight: "500", usage: "All button labels" },
];

function UiRow({
  name,
  path,
  children,
}: {
  name: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-6 items-start">
      <div>
        <p className="text-xs font-medium text-text">{name}</p>
        <p className="text-[10px] text-text-soft font-mono mt-0.5">{path}</p>
      </div>
      <div className="flex gap-3 flex-wrap items-center">{children}</div>
    </div>
  );
}

export default function DesignSystemModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("colors");
  const [demoTab, setDemoTab] = useState("overview");
  const [darkPreview, setDarkPreview] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target as Element)) return;
      if (e.key === "d" || e.key === "D") setOpen((v) => !v);
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-overlay flex items-start justify-center overflow-y-auto py-12 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Design system"
        className="bg-surface rounded-xl shadow-2xl w-full max-w-5xl border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border sticky top-0 bg-surface rounded-t-xl z-10">
          <div>
            <h1 className="text-base font-semibold text-text">Design System</h1>
            <p className="text-xs text-text-soft mt-0.5">
              Optionist visual language — tokens, typography, and components. Press D or Esc to close.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-text-soft hover:text-text text-xl leading-none transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab nav */}
        <div className="px-8 pt-5 sticky top-[73px] bg-surface z-10">
          <Tabs
            tabs={[
              { id: "colors", label: "Colors" },
              { id: "typography", label: "Typography" },
              { id: "components", label: "Components" },
              { id: "layout", label: "Layout" },
            ]}
            activeId={tab}
            onChange={setTab}
          />
        </div>

        <div className="px-8 py-6">
          {tab === "colors" && (
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="Core palette"
                description="src/styles/tokens.css — seven semantic tokens; everything else is derived from these."
              />
              <div className="flex flex-wrap gap-6">
                {COLORS.map((c) => (
                  <div key={c.token} className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-xl border border-border shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <p className="text-xs font-mono text-text-muted">{c.name}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COLORS.map((c) => (
                  <Card key={`${c.token}-detail`} padding="sm">
                    <p className="text-sm font-medium text-text font-mono">{c.name}</p>
                    <p className="text-xs font-mono text-text-muted">{c.hex}</p>
                    <p className="text-xs text-text-soft mt-1">{c.usage}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {tab === "typography" && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Type scale" description="Geist Sans — single family for MVP." />
              <div className="flex flex-col gap-4">
                {TYPE_SAMPLES.map((t) => (
                  <Card key={t.role} padding="md">
                    <p className={t.class}>{t.role} — The quick brown fox</p>
                    <p className="text-xs text-text-soft mt-2">
                      {t.size} / weight {t.weight} — {t.usage}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {tab === "components" && (
            <section className="flex flex-col gap-6">
              <div>
                <SectionHeader title="Buttons" description="components/ui/Button.tsx" />
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                </div>
              </div>

              <div>
                <SectionHeader title="Inputs" description="components/ui/TextInput.tsx · Textarea.tsx" />
                <div className="grid sm:grid-cols-2 gap-4 mt-3 max-w-2xl">
                  <TextInput label="Default" placeholder="Enter text…" />
                  <TextInput label="With error" error="This field is required." />
                  <Textarea label="Textarea" rows={2} placeholder="Notes…" />
                </div>
              </div>

              <Divider />

              <div>
                <SectionHeader title="UI library" description="components/ui/" />
                <div className="space-y-6 mt-3">
                  <UiRow name="Badge" path="ui/Badge.tsx">
                    <Badge>Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </UiRow>

                  <UiRow name="Pill" path="ui/Pill.tsx">
                    <Pill active>Active</Pill>
                    <Pill>Inactive</Pill>
                  </UiRow>

                  <UiRow name="IconButton" path="ui/IconButton.tsx">
                    <IconButton label="Add" size="sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          d="M12 5v14M5 12h14"
                        />
                      </svg>
                    </IconButton>
                  </UiRow>

                  <UiRow name="Card" path="ui/Card.tsx">
                    <Card padding="sm" className="w-32 text-sm text-text">Default</Card>
                    <Card padding="sm" hover className="w-32 text-sm text-text">Hover</Card>
                    <Card padding="sm" selected className="w-32 text-sm text-text">Selected</Card>
                  </UiRow>

                  <UiRow name="Tabs" path="ui/Tabs.tsx">
                    <div className="w-full min-w-[280px]">
                      <Tabs
                        tabs={[
                          { id: "overview", label: "Overview" },
                          { id: "details", label: "Details" },
                        ]}
                        activeId={demoTab}
                        onChange={setDemoTab}
                      />
                    </div>
                  </UiRow>

                  <UiRow name="PageHeader" path="ui/PageHeader.tsx">
                    <div className="w-full">
                      <PageHeader
                        title="Page title"
                        subtitle="Supporting subtitle."
                        action={
                          <Button variant="primary" size="sm">Action</Button>
                        }
                      />
                    </div>
                  </UiRow>

                  <UiRow name="EmptyState" path="ui/EmptyState.tsx">
                    <div className="w-full border border-border rounded-lg">
                      <EmptyState
                        message="Nothing here yet"
                        detail="Empty states explain what's missing."
                      />
                    </div>
                  </UiRow>

                  <UiRow name="LoadingState" path="ui/LoadingState.tsx">
                    <div className="w-full border border-border rounded-lg">
                      <LoadingState />
                    </div>
                  </UiRow>

                  <UiRow name="Modal" path="ui/Modal.tsx">
                    <p className="text-xs text-text-soft">
                      Centered dialog that traps focus and closes on Escape. Not shown live here to
                      avoid nesting a dialog inside this overlay.
                    </p>
                  </UiRow>
                </div>
              </div>

              <Divider label="Dark mode preview" />

              <div className="flex items-center gap-2">
                <Button
                  variant={darkPreview ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setDarkPreview(!darkPreview)}
                >
                  Toggle dark preview
                </Button>
              </div>
              <div
                data-theme={darkPreview ? "dark" : "light"}
                className="rounded-lg border border-border p-6 bg-bg"
              >
                <p className="text-text font-medium">Preview panel</p>
                <p className="text-text-muted text-sm mt-1">
                  Token-based surfaces in {darkPreview ? "dark" : "light"} mode.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                </div>
              </div>
            </section>
          )}

          {tab === "layout" && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Layout tokens" description="src/styles/tokens.css" />
              <Card padding="md">
                <ul className="text-sm text-text-muted flex flex-col gap-2">
                  <li>Sidebar width: 260px</li>
                  <li>Topbar height: 72px</li>
                  <li>Max content width: 1440px</li>
                  <li>Canvas: bg · Content: surface · Panels: surface-muted</li>
                </ul>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
