import { useState } from "react";
import Button from "../components/shared/Button";
import TextInput from "../components/shared/TextInput";
import Textarea from "../components/shared/Textarea";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Pill from "../components/ui/Pill";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import SectionHeader from "../components/ui/SectionHeader";
import Modal from "../components/shared/Modal";
import { cn } from "../utils/cn";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "buttons", label: "Buttons" },
  { id: "forms", label: "Forms" },
  { id: "cards", label: "Cards" },
  { id: "states", label: "Component states" },
  { id: "dark", label: "Dark QA" },
] as const;

const COLORS = [
  { name: "Primary", hex: "#4D61A3", usage: "Actions, active nav" },
  { name: "App background", hex: "#F4F6FB", usage: "Canvas" },
  { name: "App panel", hex: "#FFFFFF", usage: "Cards, inspector" },
  { name: "Border", hex: "#E3E8F2", usage: "Dividers" },
  { name: "Text", hex: "#151827", usage: "Body copy" },
  { name: "Success", hex: "#059669", usage: "Decided states" },
];

export default function DesignSystemRoute() {
  const [section, setSection] = useState<(typeof NAV)[number]["id"]>("overview");
  const [showModal, setShowModal] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);

  return (
    <div className="flex-1 overflow-hidden flex bg-app-bg">
      <nav className="w-48 shrink-0 border-r border-app-border p-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={cn(
              "text-left px-3 py-2 rounded-md text-sm font-medium",
              section === item.id ? "bg-primary-soft text-primary" : "text-text-muted hover:bg-app-surface-soft",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
          <PageHeader
            title="Design System"
            subtitle="Optionist visual language — preserved dark settings feel, app surface tokens."
          />

          {section === "overview" && (
            <Card padding="md">
              <p className="text-sm text-text-muted leading-relaxed">
                Login/auth uses <code className="text-xs">--token-auth-panel</code> (deep purple).
                Logged-in app uses <code className="text-xs">--app-*</code> layered surfaces.
                Radius: 8 / 12 / 18 / 24. Button heights: 32 / 40 / 48px.
              </p>
            </Card>
          )}

          {section === "colors" && (
            <div className="grid grid-cols-2 gap-3">
              {COLORS.map((c) => (
                <Card key={c.name} padding="sm">
                  <div className="w-full h-10 rounded-md mb-2 border border-app-border" style={{ backgroundColor: c.hex }} />
                  <p className="text-sm font-medium text-text">{c.name}</p>
                  <p className="text-xs text-text-soft">{c.usage}</p>
                </Card>
              ))}
            </div>
          )}

          {section === "typography" && (
            <div className="flex flex-col gap-3">
              <Card padding="md"><p className="text-3xl font-semibold">Display 36px</p></Card>
              <Card padding="md"><p className="text-xl font-semibold">Page title 22px</p></Card>
              <Card padding="md"><p className="text-sm">Body 14px — Geist Sans</p></Card>
              <Card padding="md"><p className="text-xs font-medium uppercase tracking-wider text-text-muted">Label</p></Card>
            </div>
          )}

          {section === "spacing" && (
            <Card padding="md">
              <ul className="text-sm text-text-muted space-y-2">
                <li>Sidebar: 240px</li>
                <li>Topbar: 72px</li>
                <li>Inspector: 320px (w-80)</li>
                <li>Card padding: sm 12 / md 20 / lg 24</li>
              </ul>
            </Card>
          )}

          {section === "buttons" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="quiet">Quiet</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          )}

          {section === "forms" && (
            <div className="max-w-sm flex flex-col gap-3">
              <TextInput label="Default" placeholder="Enter text…" />
              <TextInput label="Error" error="Required field" />
              <Textarea label="Textarea" rows={2} />
            </div>
          )}

          {section === "cards" && (
            <div className="grid grid-cols-2 gap-3">
              <Card padding="md">Default</Card>
              <Card padding="md" hover>Hover</Card>
              <Card padding="md" selected>Selected</Card>
            </div>
          )}

          {section === "states" && (
            <section className="flex flex-col gap-6">
              <SectionHeader title="Interactive states" description="Default, focus (Tab), disabled, error." />
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Pill active>Active</Pill>
                <Pill>Inactive</Pill>
              </div>
              <EmptyState message="Empty state" detail="Helper copy for empty views." />
              <Button variant="secondary" onClick={() => setShowModal(true)}>Open modal</Button>
            </section>
          )}

          {section === "dark" && (
            <>
              <Button variant={darkPreview ? "primary" : "secondary"} size="sm" onClick={() => setDarkPreview(!darkPreview)}>
                Toggle dark preview panel
              </Button>
              <div data-theme={darkPreview ? "dark" : "light"} className="rounded-xl border border-app-border p-6 bg-app-bg space-y-4">
                <p className="text-text font-medium">Dark QA — settings navy preserved</p>
                <Card padding="md"><p className="text-text-muted text-sm">Card on app-bg</p></Card>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                </div>
                <TextInput label="Input in theme" placeholder="Type here…" />
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title="Example modal" onConfirm={() => setShowModal(false)} onCancel={() => setShowModal(false)}>
          Standard modal with sm/md/lg sizes and footer slots.
        </Modal>
      )}
    </div>
  );
}
