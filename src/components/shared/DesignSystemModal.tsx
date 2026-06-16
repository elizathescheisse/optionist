import { useEffect, useState } from "react";
import { isTypingTarget } from "../../utils/keyboard";
import Button from "./Button";
import TextInput from "./TextInput";
import Textarea from "./Textarea";
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

type TokenRow = {
  piece: string;
  token: string;
  value: string;
};

type VariantSpec = {
  label: string;
  tokenRows: TokenRow[];
  usedIn?: string[];
};

// ─── Your current Button ─────────────────────────────────────────────────────

const YOUR_VARIANTS: VariantSpec[] = [
  {
    label: "primary",
    usedIn: ["Create project", "Review decisions", "Mark final", "Reject", "Finalize", "Add decision"],
    tokenRows: [
      { piece: "background", token: "—", value: "gray-900 (#111827)" },
      { piece: "text", token: "—", value: "white (#ffffff)" },
      { piece: "hover bg", token: "—", value: "gray-700 (#374151)" },
      { piece: "shadow", token: "—", value: "shadow-sm" },
    ],
  },
  {
    label: "secondary",
    usedIn: ["Export JSON", "Import JSON", "View History", "Choose files", "Cancel", "Postpone", "Restore"],
    tokenRows: [
      { piece: "background", token: "—", value: "white (#ffffff)" },
      { piece: "border", token: "—", value: "gray-200 (#e5e7eb)" },
      { piece: "text", token: "—", value: "gray-600 (#4b5563)" },
      { piece: "hover bg", token: "—", value: "gray-50 (#f9fafb)" },
    ],
  },
  {
    label: "danger",
    usedIn: ["Delete decision"],
    tokenRows: [
      { piece: "background", token: "—", value: "white (#ffffff)" },
      { piece: "border", token: "—", value: "red-200 (#fecaca)" },
      { piece: "text", token: "—", value: "red-500 (#ef4444)" },
      { piece: "hover bg", token: "—", value: "red-50 (#fef2f2)" },
    ],
  },
];

// ─── His Button (rendered using actual resolved values from his tokens.css) ──
// We hardcode the resolved values here so his buttons render correctly even
// though his full token system isn't in main yet.

type HisVariantSpec = {
  label: string;
  bg: string;
  text: string;
  border?: string;
  hoverBg?: string;
  hoverOpacity?: boolean;
  tokenRows: TokenRow[];
};

const HIS_VARIANTS: HisVariantSpec[] = [
  {
    label: "primary",
    bg: "#4d61a3",
    text: "#ffffff",
    hoverOpacity: true,
    tokenRows: [
      { piece: "background", token: "bg-primary", value: "#4d61a3" },
      { piece: "text", token: "text-white", value: "#ffffff" },
      { piece: "hover", token: "hover:opacity-90", value: "fades to 90%" },
      { piece: "focus ring", token: "ring-primary", value: "#4d61a3" },
    ],
  },
  {
    label: "secondary",
    bg: "#ffffff",
    text: "#677085",
    border: "#e3e8f2",
    hoverBg: "#f8fafd",
    tokenRows: [
      { piece: "background", token: "bg-app-surface", value: "#ffffff" },
      { piece: "border", token: "border-app-border", value: "#e3e8f2" },
      { piece: "text", token: "text-text-muted", value: "#677085" },
      { piece: "hover bg", token: "hover:bg-app-surface-soft", value: "#f8fafd" },
    ],
  },
  {
    label: "outline",
    bg: "transparent",
    text: "#151827",
    border: "#e3e8f2",
    hoverBg: "#f8fafd",
    tokenRows: [
      { piece: "background", token: "bg-transparent", value: "transparent" },
      { piece: "border", token: "border-app-border", value: "#e3e8f2" },
      { piece: "text", token: "text-text", value: "#151827" },
      { piece: "hover bg", token: "hover:bg-app-surface-soft", value: "#f8fafd" },
    ],
  },
  {
    label: "ghost",
    bg: "transparent",
    text: "#677085",
    hoverBg: "#f8fafd",
    tokenRows: [
      { piece: "background", token: "bg-transparent", value: "transparent" },
      { piece: "text", token: "text-text-muted", value: "#677085" },
      { piece: "hover bg", token: "hover:bg-app-surface-soft", value: "#f8fafd" },
    ],
  },
  {
    label: "quiet",
    bg: "transparent",
    text: "#98a1b3",
    hoverBg: "#f8fafd",
    tokenRows: [
      { piece: "background", token: "bg-transparent", value: "transparent" },
      { piece: "text", token: "text-text-soft", value: "#98a1b3" },
      { piece: "hover text", token: "hover:text-text", value: "#151827" },
      { piece: "hover bg", token: "hover:bg-app-surface-soft", value: "#f8fafd" },
    ],
  },
  {
    label: "destructive",
    bg: "#ffffff",
    text: "#dc2626",
    border: "rgba(220,38,38,0.3)",
    hoverBg: "#fef2f2",
    tokenRows: [
      { piece: "background", token: "bg-app-surface", value: "#ffffff" },
      { piece: "border", token: "border-error/30", value: "rgba(220,38,38,0.3)" },
      { piece: "text", token: "text-error", value: "#dc2626" },
      { piece: "hover bg", token: "hover:bg-error-soft", value: "#fef2f2" },
    ],
  },
];

const TEXTINPUT_USED_IN = ["New project name", "New decision title (sidebar + create form)", "Title (decision panel)"];

const TEXTINPUT_TOKEN_ROWS: TokenRow[] = [
  { piece: "background", token: "—", value: "white (#ffffff)" },
  { piece: "border", token: "—", value: "gray-200 (#e5e7eb)" },
  { piece: "text", token: "—", value: "gray-900 (#111827)" },
  { piece: "placeholder", token: "—", value: "gray-400 (#9ca3af)" },
  { piece: "focus ring", token: "—", value: "gray-900 (#111827)" },
  { piece: "label text", token: "—", value: "gray-500 (#6b7280)" },
  { piece: "error text", token: "—", value: "red-500 (#ef4444)" },
];

const TEXTAREA_USED_IN = ["Description (decision panel)", "Notes (decision panel)", "Final rationale (decision panel)", "Rationale (finalize modal)"];

const TEXTAREA_TOKEN_ROWS: TokenRow[] = [
  { piece: "background", token: "—", value: "white (#ffffff)" },
  { piece: "border", token: "—", value: "gray-200 (#e5e7eb)" },
  { piece: "text", token: "—", value: "gray-900 (#111827)" },
  { piece: "placeholder", token: "—", value: "gray-400 (#9ca3af)" },
  { piece: "focus ring", token: "—", value: "gray-900 (#111827)" },
  { piece: "label text", token: "—", value: "gray-500 (#6b7280)" },
];

type ColorToken = { name: string; value: string };

const YOUR_COLOR_TOKENS: ColorToken[] = [
  { name: "surface", value: "#ffffff" },
  { name: "border", value: "#e3e8f2" },
  { name: "text", value: "#151827" },
  { name: "success", value: "#059669" },
  { name: "error", value: "#dc2626" },
  { name: "warning", value: "#a16207" },
  { name: "warning-soft", value: "#fefce8" },
];

const HIS_COLOR_GROUPS: { label: string; tokens: ColorToken[] }[] = [
  {
    label: "app surface",
    tokens: [
      { name: "app-bg", value: "#f4f6fb" },
      { name: "app-surface", value: "#ffffff" },
      { name: "app-surface-soft", value: "#f8fafd" },
      { name: "app-panel", value: "#ffffff" },
      { name: "app-panel-muted", value: "#f6f8fc" },
      { name: "app-border", value: "#e3e8f2" },
      { name: "app-border-strong", value: "#d5dbeb" },
      { name: "app-sidebar", value: "#ffffff" },
    ],
  },
  {
    label: "text",
    tokens: [
      { name: "text", value: "#151827" },
      { name: "text-muted", value: "#677085" },
      { name: "text-soft", value: "#98a1b3" },
    ],
  },
  {
    label: "semantic",
    tokens: [
      { name: "success", value: "#059669" },
      { name: "warning", value: "#d97706" },
      { name: "error", value: "#dc2626" },
      { name: "info", value: "#2563eb" },
    ],
  },
  {
    label: "accent",
    tokens: [
      { name: "primary", value: "#4d61a3" },
      { name: "accent-orange", value: "#eba03f" },
      { name: "accent-yellow", value: "#fdd86a" },
      { name: "accent-pink", value: "#ff6e99" },
      { name: "accent-rose", value: "#d1416c" },
    ],
  },
];

const HIS_SIZES = [
  { label: "sm", style: { height: "32px", padding: "0 12px", fontSize: "12px" } },
  { label: "md", style: { height: "40px", padding: "0 16px", fontSize: "14px" } },
  { label: "lg", style: { height: "48px", padding: "0 20px", fontSize: "16px" } },
];

// ─── Token table ─────────────────────────────────────────────────────────────

function TokenTable({ rows, usedIn }: { rows: TokenRow[]; usedIn?: string[] }) {
  return (
    <table className="text-xs w-full mt-2 border-collapse table-fixed">
      <thead>
        <tr className="text-gray-400 text-left">
          <th className="font-medium pb-1 pr-4 w-24">piece</th>
          <th className="font-medium pb-1 pr-4 w-40">token</th>
          <th className="font-medium pb-1 pr-4 w-44">value</th>
          {usedIn && <th className="font-medium pb-1">used in</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.piece} className="border-t border-gray-100">
            <td className="py-1 pr-4 text-gray-500">{r.piece}</td>
            <td className="py-1 pr-4 font-mono text-indigo-500">{r.token}</td>
            <td className="py-1 pr-4 text-gray-600">{r.value}</td>
            {usedIn && i === 0 && (
              <td rowSpan={rows.length} className="py-1 text-gray-500 align-top leading-relaxed">
                {usedIn.join(", ")}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ColorSwatch({ name, value }: ColorToken) {
  return (
    <div className="flex flex-col items-center gap-1 w-16">
      <div
        className="w-10 h-10 rounded-md border border-gray-200"
        style={{ backgroundColor: value }}
      />
      <span className="text-[10px] font-mono text-gray-500 text-center leading-tight">{name}</span>
    </div>
  );
}

// ─── His button rendered with inline styles (tokens not in main yet) ──────────

function HisButton({
  spec,
  size,
  disabled,
}: {
  spec: HisVariantSpec;
  size: (typeof HIS_SIZES)[number];
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      style={{
        ...size.style,
        backgroundColor: spec.bg,
        color: disabled ? undefined : spec.text,
        border: spec.border ? `1px solid ${spec.border}` : undefined,
        borderRadius: "6px",
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 150ms",
      }}
    >
      Button
    </button>
  );
}

// ─── New ui/ library row (name + path on the left, live examples on the right) ─

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
    <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
      <div>
        <p className="text-xs text-gray-400 font-mono">{name}</p>
        <p className="text-[10px] text-gray-300 font-mono mt-0.5">{path}</p>
      </div>
      <div className="flex gap-3 flex-wrap items-center">{children}</div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

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
      className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-12 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Design System</h1>
            <p className="text-xs text-gray-400 mt-0.5">Press D or Esc to close</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-12">

          {/* ── Your tokens.css ─────────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your tokens.css</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                src/styles/tokens.css · 7 colors + 1 font + 1 z-index · a seed, not a system
              </p>
            </div>

            <div className="flex gap-4 flex-wrap mb-4">
              {YOUR_COLOR_TOKENS.map((t) => (
                <ColorSwatch key={t.name} {...t} />
              ))}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-mono text-indigo-500">font-sans</span> → Geist Sans</p>
              <p><span className="font-mono text-indigo-500">z-toast</span> → 200</p>
            </div>

            <p className="text-xs text-gray-400 mt-3 italic">
              Consumed by ToastContext.tsx and the rationale-missing warning in
              DecisionNotesPanel — everything else in the app still uses Tailwind's
              default scale, not one of these tokens.
            </p>
          </section>

          <div className="border-t border-gray-100" />

          {/* ── Friend's tokens.css ─────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Friend's tokens.css</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                origin/UX · full system — colors, spacing, typography, shadows, radius, motion, z-index
              </p>
            </div>

            <div className="space-y-4 mb-4">
              {HIS_COLOR_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="text-xs text-gray-400 font-mono mb-2">{g.label}</p>
                  <div className="flex gap-4 flex-wrap">
                    {g.tokens.map((t) => (
                      <ColorSwatch key={t.name} {...t} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs text-gray-500">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Typography</p>
                <p>text-xs (12px) → text-3xl (36px), 7 steps</p>
                <p>leading: tight / normal / relaxed</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Spacing</p>
                <p>sidebar 240px · topbar 72px · layout-max 1440px</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Shadows &amp; radius</p>
                <p>shadow: card / modal / popover / sm / md / lg</p>
                <p>radius: sm / md / lg / xl</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Motion &amp; layers</p>
                <p>duration: fast / normal / slow · 1 easing curve</p>
                <p>z-index: dropdown / modal / toast</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 italic">
              Every color above also has a dark-mode override defined under [data-theme="dark"].
            </p>
          </section>

          <div className="border-t border-gray-100" />

          {/* ── Your Button ─────────────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your Button</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                src/components/shared/Button.tsx · 3 variants · 2 sizes (lg / sm) · hardcoded values
              </p>
            </div>

            <div className="space-y-6">
              {YOUR_VARIANTS.map((v) => (
                <div key={v.label} className="grid grid-cols-[220px_1fr] gap-6 items-start">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-mono mb-2">{v.label}</p>
                    <div className="flex gap-2 flex-wrap items-center">
                      <Button size="lg" variant={v.label as "primary" | "secondary" | "danger"}>Button</Button>
                      <Button size="sm" variant={v.label as "primary" | "secondary" | "danger"}>Button</Button>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                      <Button size="lg" variant={v.label as "primary" | "secondary" | "danger"} disabled>Disabled</Button>
                      <Button size="sm" variant={v.label as "primary" | "secondary" | "danger"} disabled>Disabled</Button>
                    </div>
                  </div>
                  <TokenTable rows={v.tokenRows} usedIn={v.usedIn} />
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* ── Your TextInput ──────────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your TextInput</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                src/components/shared/TextInput.tsx · label + error props · hardcoded values
              </p>
            </div>

            <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
              <div className="space-y-4">
                <TextInput placeholder="New project name" />
                <TextInput label="Title" defaultValue="font" />
                <TextInput label="Decision title" error="Title is required." />
                <TextInput placeholder="Disabled" disabled />
              </div>
              <TokenTable rows={TEXTINPUT_TOKEN_ROWS} usedIn={TEXTINPUT_USED_IN} />
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* ── Your Textarea ───────────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your Textarea</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                src/components/shared/Textarea.tsx · label prop · hardcoded values
              </p>
            </div>

            <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
              <div className="space-y-4">
                <Textarea placeholder="Working notes for this decision…" rows={2} />
                <Textarea label="Notes" defaultValue="Initial thoughts here." rows={2} />
                <Textarea placeholder="Disabled" rows={2} disabled />
              </div>
              <TokenTable rows={TEXTAREA_TOKEN_ROWS} usedIn={TEXTAREA_USED_IN} />
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* ── His Button ──────────────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Friend's Button</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                origin/UX · 6 variants · 3 sizes (sm/md/lg) · rendered with resolved token values
              </p>
            </div>

            {/* Size legend */}
            <div className="flex gap-6 mb-6">
              {HIS_SIZES.map((s) => (
                <div key={s.label} className="text-xs text-gray-400">
                  <span className="font-mono">{s.label}</span>
                  <span className="ml-2 text-gray-300">
                    h-{s.label === "sm" ? "8" : s.label === "md" ? "10" : "12"} ·{" "}
                    {s.style.fontSize}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              {HIS_VARIANTS.map((v) => (
                <div key={v.label} className="grid grid-cols-[220px_1fr] gap-6 items-start">
                  <div>
                    <p className="text-xs text-gray-400 font-mono mb-2">{v.label}</p>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center flex-wrap">
                        {HIS_SIZES.map((s) => (
                          <HisButton key={s.label} spec={v} size={s} />
                        ))}
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        {HIS_SIZES.map((s) => (
                          <HisButton key={s.label} spec={v} size={s} disabled />
                        ))}
                      </div>
                    </div>
                  </div>
                  <TokenTable rows={v.tokenRows} />
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* ── New ui/ component library ────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">UI component library</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                src/components/ui/ · reintroduced from PR #35 · rendered live with the merged tokens
              </p>
            </div>

            <div className="space-y-8">
              <UiRow name="Badge" path="ui/Badge.tsx">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </UiRow>

              <UiRow name="Pill" path="ui/Pill.tsx">
                <Pill active>Active</Pill>
                <Pill>Inactive</Pill>
                <Pill onClick={() => {}}>Clickable</Pill>
              </UiRow>

              <UiRow name="IconButton" path="ui/IconButton.tsx">
                <IconButton label="Add" size="sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                </IconButton>
                <IconButton label="Add" size="md">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                </IconButton>
              </UiRow>

              <UiRow name="Card" path="ui/Card.tsx">
                <Card padding="sm" className="w-40 text-sm text-text">Default</Card>
                <Card padding="sm" hover className="w-40 text-sm text-text">Hover</Card>
                <Card padding="sm" selected className="w-40 text-sm text-text">Selected</Card>
              </UiRow>

              <UiRow name="Divider" path="ui/Divider.tsx">
                <div className="w-full space-y-4">
                  <Divider />
                  <Divider label="OR" />
                </div>
              </UiRow>

              <UiRow name="Tabs" path="ui/Tabs.tsx">
                <div className="w-full">
                  <Tabs
                    tabs={[
                      { id: "overview", label: "Overview" },
                      { id: "details", label: "Details" },
                      { id: "history", label: "History" },
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
                    subtitle="A short supporting subtitle."
                    action={<Button variant="primary" size="sm">Action</Button>}
                  />
                </div>
              </UiRow>

              <UiRow name="SectionHeader" path="ui/SectionHeader.tsx">
                <div className="w-full">
                  <SectionHeader title="Section title" description="With a description." />
                </div>
              </UiRow>

              <UiRow name="EmptyState" path="ui/EmptyState.tsx">
                <div className="w-full border border-gray-100 rounded-lg">
                  <EmptyState
                    message="Nothing here yet"
                    detail="Empty states explain what's missing and offer a next step."
                    action={<Button variant="primary" size="sm">Create</Button>}
                  />
                </div>
              </UiRow>

              <UiRow name="LoadingState" path="ui/LoadingState.tsx">
                <div className="w-full border border-gray-100 rounded-lg">
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
