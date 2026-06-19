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
  { name: "surface", hex: "#ffffff", token: "surface" },
  { name: "border", hex: "#e3e8f2", token: "border" },
  { name: "text", hex: "#151827", token: "text" },
  { name: "success", hex: "#059669", token: "success" },
  { name: "error", hex: "#dc2626", token: "error" },
  { name: "warning", hex: "#a16207", token: "warning" },
  { name: "warning-soft", hex: "#fefce8", token: "warning-soft" },
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
  const [demoTab, setDemoTab] = useState("overview");

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
        <div className="flex items-center justify-between px-8 py-5 border-b border-border sticky top-0 bg-surface rounded-t-xl z-10">
          <div>
            <h1 className="text-base font-semibold text-text">Design System</h1>
            <p className="text-xs text-text-soft mt-0.5">Press D or Esc to close</p>
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

        <div className="px-8 py-6 space-y-10">
          <section>
            <SectionHeader
              title="Color tokens"
              description="src/styles/tokens.css — the core palette."
            />
            <div className="flex flex-wrap gap-6 mt-4">
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
          </section>

          <Divider />

          <section>
            <SectionHeader title="Button" description="components/ui/Button.tsx" />
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </section>

          <section>
            <SectionHeader title="Inputs" description="components/ui/TextInput.tsx · Textarea.tsx" />
            <div className="grid sm:grid-cols-2 gap-4 mt-4 max-w-2xl">
              <TextInput label="Default" placeholder="Enter text…" />
              <TextInput label="With error" error="Required." />
              <Textarea label="Textarea" rows={2} placeholder="Notes…" />
            </div>
          </section>

          <Divider />

          <section>
            <SectionHeader title="UI library" description="components/ui/" />
            <div className="space-y-6 mt-4">
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
                <Card padding="sm" className="w-32 text-sm text-text">
                  Default
                </Card>
                <Card padding="sm" hover className="w-32 text-sm text-text">
                  Hover
                </Card>
                <Card padding="sm" selected className="w-32 text-sm text-text">
                  Selected
                </Card>
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
                      <Button variant="primary" size="sm">
                        Action
                      </Button>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
