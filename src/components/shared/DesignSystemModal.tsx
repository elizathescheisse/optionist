import { useEffect, useState } from "react";
import { isTypingTarget } from "../../utils/keyboard";
import Button from "./Button";

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

const HIS_SIZES = [
  { label: "sm", style: { height: "32px", padding: "0 12px", fontSize: "12px" } },
  { label: "md", style: { height: "40px", padding: "0 16px", fontSize: "14px" } },
  { label: "lg", style: { height: "48px", padding: "0 20px", fontSize: "16px" } },
];

// ─── Token table ─────────────────────────────────────────────────────────────

function TokenTable({ rows, usedIn }: { rows: TokenRow[]; usedIn?: string[] }) {
  return (
    <table className="text-xs w-full mt-2 border-collapse">
      <thead>
        <tr className="text-gray-400 text-left">
          <th className="font-medium pb-1 pr-4 w-24">piece</th>
          <th className="font-medium pb-1 pr-4 w-40">token</th>
          <th className="font-medium pb-1 pr-4">value</th>
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

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function DesignSystemModal() {
  const [open, setOpen] = useState(false);

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

          {/* ── Your Button ─────────────────────────────────────────────── */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your Button</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                src/components/shared/Button.tsx · 3 variants · 1 size · hardcoded values
              </p>
            </div>

            <div className="space-y-6">
              {YOUR_VARIANTS.map((v) => (
                <div key={v.label} className="grid grid-cols-[220px_1fr] gap-6 items-start">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-mono mb-2">{v.label}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant={v.label as "primary" | "secondary" | "danger"}>Button</Button>
                      <Button variant={v.label as "primary" | "secondary" | "danger"} disabled>Disabled</Button>
                    </div>
                  </div>
                  <TokenTable rows={v.tokenRows} usedIn={v.usedIn} />
                </div>
              ))}
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

        </div>
      </div>
    </div>
  );
}
