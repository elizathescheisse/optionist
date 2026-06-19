import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { DecisionStatus } from "../../types/domain";
import DecisionListItem from "./DecisionListItem";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import SessionReviewModal from "./SessionReviewModal";

type Props = { projectId: string };

const SECONDARY_GROUPS: { status: DecisionStatus; label: string }[] = [
  { status: "postponed", label: "Postponed" },
  { status: "archived", label: "Archived" },
];

export default function DecisionSidebar({ projectId }: Props) {
  const project = useAppStore((s) => s.projects[projectId]);
  const decisions = useAppStore((s) => s.decisions);
  const currentDecisionId = useAppStore((s) => s.currentDecisionId);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);
  const createDecision = useAppStore((s) => s.createDecision);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addError, setAddError] = useState("");
  const [showReview, setShowReview] = useState(false);

  if (!project) return null;

  const projectDecisions = project.decisionIds
    .map((id) => decisions[id])
    .filter(Boolean);

  const activeDecisions = projectDecisions.filter((d) => d.status === "active");
  const finalizedDecisions = projectDecisions.filter((d) => d.status === "finalized");
  const hasFinalized = finalizedDecisions.length > 0;

  const secondaryGroups = SECONDARY_GROUPS.map(({ status, label }) => ({
    label,
    status,
    items: projectDecisions.filter((d) => d.status === status),
  })).filter((g) => g.items.length > 0);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setAddError("Title is required.");
      return;
    }
    const id = createDecision(projectId, { title: trimmed });
    setCurrentDecision(id);
    setNewTitle("");
    setAddError("");
    setShowAddForm(false);
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
          <span className="text-xs font-semibold text-text-soft uppercase tracking-widest">
            Decisions
          </span>
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setAddError("");
            }}
            className="w-5 h-5 flex items-center justify-center rounded text-text-soft hover:text-text hover:bg-surface-muted transition-colors"
            aria-label="Add decision"
            title="Add decision"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Inline add form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="flex flex-col gap-1 px-3 pb-2 shrink-0">
            <div className="flex gap-1.5 items-start">
              <TextInput
                autoFocus
                placeholder="Decision title"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (addError) setAddError("");
                }}
                className="text-xs py-1"
                aria-label="New decision title"
                error={addError}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowAddForm(false);
                    setNewTitle("");
                  }
                }}
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0">
                Add
              </Button>
            </div>
          </form>
        )}

        {/* Decision list */}
        <div className="flex-1 overflow-y-auto flex flex-col py-1">
          {/* Active decisions */}
          {activeDecisions.length === 0 && finalizedDecisions.length === 0 && secondaryGroups.length === 0 && (
            <p className="text-xs text-text-soft px-4 py-2">
              No decisions yet. Click the + above to add one.
            </p>
          )}

          <div className="flex flex-col gap-2 px-3">
            {activeDecisions.map((decision) => (
              <DecisionListItem
                key={decision.id}
                decision={decision}
                isSelected={currentDecisionId === decision.id}
                onSelect={() => setCurrentDecision(decision.id)}
              />
            ))}
          </div>

          {/* Decided section */}
          {finalizedDecisions.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-2">
              <div className="flex items-center gap-2 px-4 py-1">
                <span className="text-xs font-medium text-text-soft uppercase tracking-wider">
                  Decided
                </span>
                <div className="flex-1 h-px bg-surface-muted" />
              </div>
              <div className="px-3 flex flex-col gap-2">
                {finalizedDecisions.map((decision) => (
                  <DecisionListItem
                    key={decision.id}
                    decision={decision}
                    isSelected={currentDecisionId === decision.id}
                    onSelect={() => setCurrentDecision(decision.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Postponed / Archived */}
          {secondaryGroups.map(({ label, status, items }) => (
            <div key={status} className="flex flex-col gap-0.5 mt-2">
              <div className="flex items-center gap-2 px-4 py-1">
                <span className="text-xs font-medium text-text-soft uppercase tracking-wider">
                  {label}
                </span>
                <div className="flex-1 h-px bg-surface-muted" />
              </div>
              <div className="px-3 flex flex-col gap-2">
                {items.map((decision) => (
                  <DecisionListItem
                    key={decision.id}
                    decision={decision}
                    isSelected={currentDecisionId === decision.id}
                    onSelect={() => setCurrentDecision(decision.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Review button — pinned to bottom */}
        <div className="shrink-0 px-3 py-3 border-t border-border">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setShowReview(true)}
            disabled={!hasFinalized}
            title={!hasFinalized ? "Finalize a decision first" : undefined}
          >
            Review decisions
          </Button>
        </div>
      </div>

      {showReview && (
        <SessionReviewModal
          projectId={projectId}
          onClose={() => setShowReview(false)}
        />
      )}
    </>
  );
}
