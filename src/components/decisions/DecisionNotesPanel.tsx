import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";
import Button from "../shared/Button";
import DecisionStatusBadge from "./DecisionStatusBadge";

type Props = { decisionId: string };

export default function DecisionNotesPanel({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const selectedOption = useAppStore((s) =>
    decision?.selectedOptionId ? s.options[decision.selectedOptionId] : undefined
  );
  const updateDecision = useAppStore((s) => s.updateDecision);
  const archiveDecision = useAppStore((s) => s.archiveDecision);
  const postponeDecision = useAppStore((s) => s.postponeDecision);
  const reactivateDecision = useAppStore((s) => s.reactivateDecision);

  // Local draft state; the panel is remounted per decision via a key prop,
  // so these initialize correctly when the selected decision changes.
  const [title, setTitle] = useState(decision?.title ?? "");
  const [description, setDescription] = useState(decision?.description ?? "");
  const [notes, setNotes] = useState(decision?.notes ?? "");
  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale ?? "");

  if (!decision) return null;

  const isFinalized = decision.status === "finalized";
  const rationaleMissing = isFinalized && finalRationale.trim() === "";

  function commitTitle() {
    const trimmed = title.trim();
    if (trimmed === "") {
      // Don't allow an empty title; revert to the stored value.
      setTitle(decision!.title);
      return;
    }
    if (trimmed !== decision!.title) updateDecision(decisionId, { title: trimmed });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Decision
        </span>
        <DecisionStatusBadge status={decision.status} />
      </div>

      {/* Title */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Title</span>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
        />
      </label>

      {/* Description */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Description</span>
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            const trimmed = description.trim();
            if (trimmed !== decision.description)
              updateDecision(decisionId, { description: trimmed });
          }}
        />
      </label>

      {/* Notes */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Notes</span>
        <Textarea
          rows={4}
          placeholder="Working notes for this decision…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== decision.notes)
              updateDecision(decisionId, { notes });
          }}
        />
      </label>

      {/* Selected final option */}
      {selectedOption && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Final option</span>
          <div className="flex items-center gap-2 border border-green-200 bg-green-50 rounded px-2 py-1.5">
            <img
              src={selectedOption.imageDataUrl}
              alt={selectedOption.name}
              className="w-8 h-8 object-cover rounded"
              draggable={false}
            />
            <span className="text-sm text-gray-800 truncate">
              {selectedOption.name}
            </span>
          </div>
        </div>
      )}

      {/* Final rationale */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Final rationale</span>
        <Textarea
          rows={4}
          placeholder="Why was the final option chosen?"
          value={finalRationale}
          onChange={(e) => setFinalRationale(e.target.value)}
          onBlur={() => {
            if (finalRationale !== decision.finalRationale)
              updateDecision(decisionId, { finalRationale });
          }}
        />
        {rationaleMissing && (
          <span className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
            This decision is finalized but has no rationale. Add one to fully
            complete it.
          </span>
        )}
      </label>

      {/* Status controls */}
      <div className="flex flex-col gap-1 pt-1 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-500">Status</span>
        <div className="flex flex-wrap gap-2">
          {decision.status === "active" && (
            <>
              <Button variant="secondary" onClick={() => postponeDecision(decisionId)}>
                Postpone
              </Button>
              <Button variant="secondary" onClick={() => archiveDecision(decisionId)}>
                Archive
              </Button>
            </>
          )}
          {decision.status === "finalized" && (
            <Button variant="secondary" onClick={() => archiveDecision(decisionId)}>
              Archive
            </Button>
          )}
          {(decision.status === "postponed" || decision.status === "archived") && (
            <Button variant="secondary" onClick={() => reactivateDecision(decisionId)}>
              Reactivate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
