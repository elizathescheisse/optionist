import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import Tabs from "../ui/Tabs";
import ComparisonBriefTab from "./ComparisonBriefTab";
import ComparisonAssetsTab from "./ComparisonAssetsTab";
import ComparisonNotesTab from "./ComparisonNotesTab";
import ComparisonDecisionTab from "./ComparisonDecisionTab";
import ComparisonFeedbackTab from "./ComparisonFeedbackTab";
import OptionInspectorPanel from "./OptionInspectorPanel";
import Button from "../shared/Button";
import Modal from "../shared/Modal";

const INSPECTOR_TABS = [
  { id: "brief", label: "Brief" },
  { id: "assets", label: "Assets" },
  { id: "notes", label: "Notes" },
  { id: "decision", label: "Decision" },
  { id: "feedback", label: "Feedback" },
];

type Props = { decisionId: string };

export default function ComparisonInspector({ decisionId }: Props) {
  const [tab, setTab] = useState("brief");
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const deleteDecision = useAppStore((s) => s.deleteDecision);
  const postponeDecision = useAppStore((s) => s.postponeDecision);
  const [showDelete, setShowDelete] = useState(false);

  if (!decision) return null;

  function handleDelete() {
    deleteDecision(decisionId);
    setShowDelete(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-app-panel">
      <Tabs tabs={INSPECTOR_TABS} activeId={tab} onChange={setTab} className="px-2 shrink-0" />

      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "brief" && <ComparisonBriefTab key={decisionId} decisionId={decisionId} />}
        {tab === "assets" && <ComparisonAssetsTab decisionId={decisionId} />}
        {tab === "notes" && <ComparisonNotesTab key={`notes-${decisionId}`} decisionId={decisionId} />}
        {tab === "decision" && <ComparisonDecisionTab key={`dec-${decisionId}`} decisionId={decisionId} />}
        {tab === "feedback" && <ComparisonFeedbackTab decisionId={decisionId} />}
      </div>

      {currentOptionId && tab === "assets" && (
        <OptionInspectorPanel optionId={currentOptionId} />
      )}

      <div className="shrink-0 p-3 border-t border-app-border flex flex-col gap-2">
        <Button variant="secondary" size="sm" onClick={() => postponeDecision(decisionId)}>
          Postpone comparison
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
          Delete comparison
        </Button>
      </div>

      {showDelete && (
        <Modal
          title="Delete comparison?"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          confirmLabel="Delete"
          confirmVariant="destructive"
        >
          <p>
            <strong>{decision.title}</strong> and all design options will be permanently deleted.
          </p>
        </Modal>
      )}
    </div>
  );
}
