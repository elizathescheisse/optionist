import { useAppStore } from "../../store/useAppStore";
import type { DecisionStatus } from "../../types/domain";
import DecisionListItem from "./DecisionListItem";
import CreateDecisionForm from "./CreateDecisionForm";

const GROUPS: { status: DecisionStatus; label: string }[] = [
  { status: "active", label: "Active" },
  { status: "finalized", label: "Finalized" },
  { status: "postponed", label: "Postponed" },
  { status: "archived", label: "Archived" },
];

type Props = { projectId: string };

export default function DecisionSidebar({ projectId }: Props) {
  const project = useAppStore((s) => s.projects[projectId]);
  const decisions = useAppStore((s) => s.decisions);
  const currentDecisionId = useAppStore((s) => s.currentDecisionId);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);

  if (!project) return null;

  const projectDecisions = project.decisionIds
    .map((id) => decisions[id])
    .filter(Boolean);

  const grouped = GROUPS.map(({ status, label }) => ({
    label,
    status,
    items: projectDecisions.filter((d) => d.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-1 shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Decisions
        </span>
      </div>

      <CreateDecisionForm projectId={projectId} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 py-1">
        {grouped.length === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-1">No decisions yet.</p>
        ) : (
          grouped.map(({ label, status, items }) => (
            <div key={status} className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-400 px-2 pt-1">
                {label}
              </span>
              {items.map((decision) => (
                <DecisionListItem
                  key={decision.id}
                  decision={decision}
                  isSelected={currentDecisionId === decision.id}
                  onSelect={() => setCurrentDecision(decision.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
