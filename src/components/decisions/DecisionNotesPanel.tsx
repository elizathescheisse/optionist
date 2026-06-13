import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";
import Button from "../shared/Button";
import DecisionStatusBadge from "./DecisionStatusBadge";
import OptionUploader from "../options/OptionUploader";
import Modal from "../shared/Modal";
import Divider from "../ui/Divider";

type Props = { decisionId: string };

export default function DecisionNotesPanel({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const selectedOption = useAppStore((s) =>
    s.decisions[decisionId]?.selectedOptionId
      ? s.options[s.decisions[decisionId].selectedOptionId!]
      : undefined,
  );
  const updateDecision = useAppStore((s) => s.updateDecision);
  const postponeDecision = useAppStore((s) => s.postponeDecision);
  const reactivateDecision = useAppStore((s) => s.reactivateDecision);
  const deleteDecision = useAppStore((s) => s.deleteDecision);

  const [title, setTitle] = useState(decision?.title ?? "");
  const [description, setDescription] = useState(decision?.description ?? "");
  const [notes, setNotes] = useState(decision?.notes ?? "");
  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale ?? "");
  const [openConcerns, setOpenConcerns] = useState(decision?.openConcerns ?? "");
  const [nextSteps, setNextSteps] = useState(decision?.nextSteps ?? "");
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
      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Decision
          </span>
          <DecisionStatusBadge status={decision.status} />
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Comparison title</span>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Decision prompt</span>
          <Textarea
            rows={2}
            placeholder="What decision needs to be made?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              const trimmed = description.trim();
              if (trimmed !== decision.description)
                updateDecision(decisionId, { description: trimmed });
            }}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Screenshots</span>
          <div className="-mx-4">
            <OptionUploader decisionId={decisionId} panel />
          </div>
        </div>

        <Divider />

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">
            Facilitator Notes
            <span className="text-text-soft font-normal ml-1">(private)</span>
          </span>
          <Textarea
            rows={3}
            placeholder="Working notes — not shown in presentation mode…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== decision.notes) updateDecision(decisionId, { notes });
            }}
          />
        </label>

        {selectedOption && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-muted">Recommendation</span>
            <div className="flex items-center gap-2 border border-success/30 bg-success-soft rounded-lg px-2 py-1.5">
              <img
                src={selectedOption.imageDataUrl}
                alt={selectedOption.name}
                className="w-8 h-8 object-cover rounded"
                draggable={false}
              />
              <span className="text-sm text-text truncate">{selectedOption.name}</span>
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Rationale</span>
          <Textarea
            rows={2}
            placeholder="Why was this direction chosen?"
            value={finalRationale}
            onChange={(e) => setFinalRationale(e.target.value)}
            onBlur={() => {
              if (finalRationale !== decision.finalRationale)
                updateDecision(decisionId, { finalRationale });
            }}
          />
          {rationaleMissing && (
            <span className="text-xs text-warning bg-warning-soft rounded px-2 py-1">
              Decision captured but rationale is missing.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Open concerns</span>
          <Textarea
            rows={2}
            placeholder="Unresolved questions or risks…"
            value={openConcerns}
            onChange={(e) => setOpenConcerns(e.target.value)}
            onBlur={() => {
              if (openConcerns !== decision.openConcerns)
                updateDecision(decisionId, { openConcerns });
            }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Next step</span>
          <Textarea
            rows={2}
            placeholder="What happens after this decision?"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            onBlur={() => {
              if (nextSteps !== decision.nextSteps)
                updateDecision(decisionId, { nextSteps });
            }}
          />
        </label>

        <div className="flex flex-col gap-2 pt-1 border-t border-border">
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
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            Delete comparison
          </Button>
        </div>
      </div>

      {showDeleteModal && (
        <Modal
          title="Delete comparison?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
          confirmVariant="destructive"
        >
          <p>
            <strong>{decision.title}</strong> and all its options will be permanently
            deleted. This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}
