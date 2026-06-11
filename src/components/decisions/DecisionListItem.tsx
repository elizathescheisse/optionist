import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Decision } from "../../types/domain";
import DecisionStatusBadge from "./DecisionStatusBadge";
import Modal from "../shared/Modal";

type Props = {
  decision: Decision;
  isSelected: boolean;
  onSelect: () => void;
};

export default function DecisionListItem({ decision, isSelected, onSelect }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteDecision = useAppStore((s) => s.deleteDecision);
  const archiveDecision = useAppStore((s) => s.archiveDecision);
  const postponeDecision = useAppStore((s) => s.postponeDecision);
  const reactivateDecision = useAppStore((s) => s.reactivateDecision);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);

  function handleDelete() {
    deleteDecision(decision.id);
    setShowDeleteModal(false);
  }

  const optionCount = decision.optionIds.length;

  return (
    <>
      <div
        className={`group px-3 py-2 rounded cursor-pointer flex flex-col gap-1 transition-colors ${
          isSelected ? "bg-gray-100" : "hover:bg-gray-50"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-800 truncate flex-1">
            {decision.title}
          </span>
          <DecisionStatusBadge status={decision.status} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400">
            {optionCount === 0
              ? "No options"
              : `${optionCount} option${optionCount !== 1 ? "s" : ""}`}
            {decision.status === "finalized" && decision.selectedOptionId && " · ✓ Final chosen"}
          </span>

          <div className="hidden group-hover:flex items-center gap-1">
            {(decision.status === "archived" || decision.status === "postponed") && (
              <button
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  reactivateDecision(decision.id);
                  setCurrentDecision(decision.id);
                }}
              >
                Reactivate
              </button>
            )}
            {decision.status === "active" && (
              <>
                <button
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={(e) => { e.stopPropagation(); postponeDecision(decision.id); }}
                >
                  Postpone
                </button>
                <span className="text-gray-200">·</span>
                <button
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={(e) => { e.stopPropagation(); archiveDecision(decision.id); }}
                >
                  Archive
                </button>
                <span className="text-gray-200">·</span>
              </>
            )}
            {decision.status === "finalized" && (
              <>
                <button
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={(e) => { e.stopPropagation(); archiveDecision(decision.id); }}
                >
                  Archive
                </button>
                <span className="text-gray-200">·</span>
              </>
            )}
            <button
              className="text-xs text-red-400 hover:text-red-600"
              onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
            >
              Delete
            </button>
          </div>
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
