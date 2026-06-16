import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";
import Button from "../shared/Button";
import DecisionStatusBadge from "./DecisionStatusBadge";
import OptionUploader from "../options/OptionUploader";
import Modal from "../shared/Modal";

type Props = { decisionId: string };

export default function DecisionNotesPanel({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const selectedOption = useAppStore((s) =>
    s.decisions[decisionId]?.selectedOptionId
      ? s.options[s.decisions[decisionId].selectedOptionId!]
      : undefined
  );
  const updateDecision = useAppStore((s) => s.updateDecision);
  const postponeDecision = useAppStore((s) => s.postponeDecision);
  const reactivateDecision = useAppStore((s) => s.reactivateDecision);
  const deleteDecision = useAppStore((s) => s.deleteDecision);

  // Local draft state; the panel is remounted per decision via a key prop,
  // so these initialize correctly when the selected decision changes.
  const [title, setTitle] = useState(decision?.title ?? "");
  const [description, setDescription] = useState(decision?.description ?? "");
  const [notes, setNotes] = useState(decision?.notes ?? "");
  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale ?? "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!decision) return null;

  const isFinalized = decision.status === "finalized";
  const rationaleMissing = isFinalized && !finalRationale.trim();

  function commitTitle() {
    const trimmed = title.trim();
    if (trimmed === "") {
      setTitle(decision!.title);
      return;
    }
    if (trimmed !== decision!.title) updateDecision(decisionId, { title: trimmed });
  }

  function handleDelete() {
    deleteDecision(decisionId);
    setShowDeleteModal(false);
  }

  const canPostpone = decision.status === "active" || decision.status === "finalized";
  const canReactivate = decision.status === "postponed" || decision.status === "archived";

  return (
    <>
      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Decision
          </span>
          <DecisionStatusBadge status={decision.status} />
        </div>

        {/* Title */}
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
        />

        {/* Description */}
        <Textarea
          label="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            const trimmed = description.trim();
            if (trimmed !== decision.description)
              updateDecision(decisionId, { description: trimmed });
          }}
        />

        {/* Screenshots uploader */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Screenshots</span>
          <div className="-mx-4">
            <OptionUploader decisionId={decisionId} panel />
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Notes"
          rows={4}
          placeholder="Working notes for this decision…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== decision.notes)
              updateDecision(decisionId, { notes });
          }}
        />

        {/* Chosen option (when finalized) */}
        {selectedOption && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Chosen option</span>
            <div className="flex items-center gap-2 border border-green-200 bg-green-50 rounded-lg px-2 py-1.5">
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
        <div className="flex flex-col gap-1">
          <Textarea
            label="Final rationale"
            rows={3}
            placeholder="Why was the final option chosen?"
            value={finalRationale}
            onChange={(e) => setFinalRationale(e.target.value)}
            onBlur={() => {
              if (finalRationale !== decision.finalRationale)
                updateDecision(decisionId, { finalRationale });
            }}
          />
          {rationaleMissing && (
            <span className="text-xs text-warning bg-warning-soft rounded px-2 py-1">
              This decision is finalized but has no rationale. Add one to fully
              complete it.
            </span>
          )}
        </div>

        {/* Action buttons — secondary only, no primary */}
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
          {canReactivate && (
            <Button variant="secondary" onClick={() => reactivateDecision(decisionId)}>
              Reactivate
            </Button>
          )}
          {canPostpone && (
            <Button variant="secondary" onClick={() => postponeDecision(decisionId)}>
              Postpone
            </Button>
          )}
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete decision
          </Button>
        </div>
      </div>

      {showDeleteModal && (
        <Modal
          title="Delete decision?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
          confirmVariant="danger"
        >
          <p>
            <strong>{decision.title}</strong> and all its options will be
            permanently deleted. This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}
