import { useState } from "react";
import Button from "../components/shared/Button";
import TextInput from "../components/shared/TextInput";
import Textarea from "../components/shared/Textarea";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Pill from "../components/ui/Pill";
import Divider from "../components/ui/Divider";
import Tabs from "../components/ui/Tabs";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import SectionHeader from "../components/ui/SectionHeader";
import Modal from "../components/shared/Modal";

const COLORS = [
  { name: "Primary Blue", hex: "#4D61A3", token: "primary", usage: "Primary actions, selected states, active navigation, key highlights." },
  { name: "Orange", hex: "#EBA03F", token: "accent-orange", usage: "Tags, empty states, option badges, onboarding accents." },
  { name: "Yellow", hex: "#FDD86A", token: "accent-yellow", usage: "Decorative accents, illustrations, warm highlights." },
  { name: "Pink", hex: "#FF6E99", token: "accent-pink", usage: "Decorative accents, onboarding moments." },
  { name: "Rose", hex: "#D1416C", token: "accent-rose", usage: "Decision-status accents, decorative use." },
  { name: "Background", hex: "#F5F7FB", token: "bg", usage: "App canvas background." },
  { name: "Surface", hex: "#FFFFFF", token: "surface", usage: "Cards, panels, inputs." },
  { name: "Border", hex: "#E3E8F2", token: "border", usage: "Dividers, input borders, card outlines." },
  { name: "Text", hex: "#151827", token: "text", usage: "Primary body and heading text." },
  { name: "Text Muted", hex: "#677085", token: "text-muted", usage: "Secondary text, descriptions." },
  { name: "Success", hex: "#059669", token: "success", usage: "Confirmed states, positive feedback." },
  { name: "Warning", hex: "#A16207", token: "warning", usage: "Caution states, missing rationale." },
  { name: "Error", hex: "#DC2626", token: "error", usage: "Errors, destructive actions." },
  { name: "Info", hex: "#2563EB", token: "info", usage: "Informational badges and hints." },
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

export default function DesignSystemRoute() {
  const [tab, setTab] = useState("colors");
  const [showModal, setShowModal] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeader
          title="Design System"
          subtitle="Optionist visual language — tokens, typography, and components."
        />

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

        {tab === "colors" && (
          <section className="flex flex-col gap-4">
            <SectionHeader title="Brand palette" description="Use accents sparingly — mostly on tags, badges, and empty states." />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLORS.map((c) => (
                <Card key={c.name} padding="sm">
                  <div
                    className="w-full h-12 rounded-md mb-2 border border-border"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="text-sm font-medium text-text">{c.name}</p>
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
              <SectionHeader title="Buttons" />
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <SectionHeader title="Inputs" />
              <div className="max-w-sm flex flex-col gap-3">
                <TextInput label="Default input" placeholder="Enter text…" />
                <TextInput label="With error" error="This field is required." />
                <Textarea label="Textarea" rows={2} placeholder="Notes…" />
              </div>
            </div>

            <div>
              <SectionHeader title="Badges & pills" />
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Pill active>Active pill</Pill>
                <Pill>Inactive pill</Pill>
              </div>
            </div>

            <div>
              <SectionHeader title="Cards" />
              <div className="grid grid-cols-2 gap-3">
                <Card padding="md">Default card</Card>
                <Card padding="md" hover>Hover card</Card>
                <Card padding="md" selected>Selected card</Card>
              </div>
            </div>

            <div>
              <SectionHeader title="Empty state" />
              <EmptyState message="No decisions yet" detail="Create your first decision to get started." />
            </div>

            <div>
              <SectionHeader title="Modal" />
              <Button variant="secondary" onClick={() => setShowModal(true)}>
                Open modal
              </Button>
            </div>

            <Divider label="Dark mode preview" />

            <div className="flex items-center gap-2 mb-2">
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
            <SectionHeader title="Layout tokens" />
            <Card padding="md">
              <ul className="text-sm text-text-muted flex flex-col gap-2">
                <li>Sidebar width: 260px</li>
                <li>Topbar height: 72px</li>
                <li>Max content width: 1440px</li>
                <li>Radius sm/md/lg/xl: 8 / 14 / 22 / 28px</li>
                <li>Canvas: soft gray bg · Content: white card surfaces</li>
              </ul>
            </Card>
          </section>
        )}
      </div>

      {showModal && (
        <Modal
          title="Example modal"
          onConfirm={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        >
          Modals trap focus and close on Escape.
        </Modal>
      )}
    </div>
  );
}
