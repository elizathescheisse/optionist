import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";
import Button from "../shared/Button";

type Props = { optionId: string };

const STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "ready", label: "Ready" },
  { id: "recommended", label: "Recommended" },
  { id: "selected", label: "Selected" },
  { id: "rejected", label: "Not selected" },
] as const;

export default function OptionInspectorPanel({ optionId }: Props) {
  const option = useAppStore((s) => s.options[optionId]);
  const updateOption = useAppStore((s) => s.updateOption);

  const [name, setName] = useState(option?.name ?? "");
  const [summary, setSummary] = useState(option?.summary ?? "");
  const [pros, setPros] = useState(option?.pros ?? "");
  const [risks, setRisks] = useState(option?.risks ?? "");
  const [notes, setNotes] = useState(option?.notes ?? "");

  if (!option) return null;

  return (
    <div className="border-t border-app-border p-3 bg-app-surface-soft flex flex-col gap-2 max-h-64 overflow-y-auto">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        Option inspector
      </p>
      <TextInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() !== option.name) updateOption(optionId, { name: name.trim() });
        }}
      />
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Status</span>
        <select
          value={option.displayStatus}
          onChange={(e) =>
            updateOption(optionId, {
              displayStatus: e.target.value as typeof option.displayStatus,
            })
          }
          className="text-sm border border-app-border rounded-md px-3 py-2 bg-app-panel text-text"
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <Textarea
        label="Summary"
        rows={2}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        onBlur={() => {
          if (summary !== option.summary) updateOption(optionId, { summary });
        }}
      />
      <Textarea
        label="Pros"
        rows={2}
        value={pros}
        onChange={(e) => setPros(e.target.value)}
        onBlur={() => {
          if (pros !== option.pros) updateOption(optionId, { pros });
        }}
      />
      <Textarea
        label="Risks"
        rows={2}
        value={risks}
        onChange={(e) => setRisks(e.target.value)}
        onBlur={() => {
          if (risks !== option.risks) updateOption(optionId, { risks });
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          updateOption(optionId, {
            displayStatus: option.displayStatus === "recommended" ? "ready" : "recommended",
          })
        }
      >
        {option.displayStatus === "recommended" ? "Remove recommendation" : "Mark recommended"}
      </Button>
      <Textarea
        label="Notes"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== option.notes) updateOption(optionId, { notes });
        }}
      />
    </div>
  );
}
