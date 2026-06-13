import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import Textarea from "../shared/Textarea";

type Props = { decisionId: string };

export default function ComparisonNotesTab({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const updateDecision = useAppStore((s) => s.updateDecision);
  const [notes, setNotes] = useState(decision?.notes ?? "");

  if (!decision) return null;

  return (
    <div className="p-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">
          Facilitator notes
          <span className="text-text-soft font-normal ml-1">(private)</span>
        </span>
        <Textarea
          rows={8}
          placeholder="Working notes — not shown in presentation mode…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== decision.notes) updateDecision(decisionId, { notes });
          }}
        />
      </label>
    </div>
  );
}
