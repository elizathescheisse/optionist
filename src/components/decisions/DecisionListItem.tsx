import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Decision } from "../../types/domain";
import Modal from "../shared/Modal";

type Props = {
  decision: Decision;
  isSelected: boolean;
  onSelect: () => void;
};

export default function DecisionListItem({ decision, isSelected, onSelect }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteDecision = useAppStore((s) => s.deleteDecision);
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
        className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors motion-reduce:transition-none ${
          isSelected
            ? "bg-slate-600 text-white"
            : "hover:bg-gray-50 text-gray-700"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm font-medium truncate flex-1 leading-snug ${isSelected ? "text-white" : "text-gray-800"}`}>
            {decision.title}
          </span>

          {/* Actions — shown on hover (only when not selected) */}
          {!isSelected && (
            <div className="hidden group-hover:flex items-center gap-1 shrink-0 mt-0.5">
              {(decision.status === "archived" || decision.status === "postponed") && (
                <button
                  className="text-xs text-blue-500 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    reactivateDecision(decision.id);
                    setCurrentDecision(decision.id);
                  }}
                >
                  Restore
                </button>
              )}
              {decision.status === "active" && (
                <>
                  <button
                    className="text-xs text-gray-400 hover:text-gray-600"
                    onClick={(e) => { e.stopPropagation(); postponeDecision(decision.id); }}
                  >
                    Pause
                  </button>
                  <span className="text-gray-200 text-xs">·</span>
                </>
              )}
              <button
                className="text-xs text-red-400 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <span className={`text-xs mt-0.5 block ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
          {optionCount === 0
            ? "No options"
            : `${optionCount} option${optionCount !== 1 ? "s" : ""}`}
          {decision.status === "finalized" && decision.selectedOptionId && " · ✓ Final"}
          {decision.status === "postponed" && " · Paused"}
          {decision.status === "archived" && " · Archived"}
        </span>
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
