import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import Textarea from "../shared/Textarea";
import Button from "../shared/Button";
import { useToast } from "../../context/ToastContext";
import DecisionStatusBadge from "../decisions/DecisionStatusBadge";

type Props = { decisionId: string };

function buildMemo(decision: NonNullable<ReturnType<typeof useAppStore.getState>["decisions"][string]>, optionName?: string) {
  const lines = [
    `# ${decision.title}`,
    "",
    decision.description && `**Decision to make:** ${decision.description}`,
    decision.summary && `**Summary:** ${decision.summary}`,
    optionName && `**Selected direction:** ${optionName}`,
    decision.finalRationale && `**Rationale:** ${decision.finalRationale}`,
    decision.openConcerns && `**Open concerns:** ${decision.openConcerns}`,
    decision.nextSteps && `**Next steps:** ${decision.nextSteps}`,
    decision.owner && `**Owner:** ${decision.owner}`,
    decision.dueDate && `**Due:** ${decision.dueDate}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export default function ComparisonDecisionTab({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const selectedOption = useAppStore((s) =>
    decision?.selectedOptionId ? s.options[decision.selectedOptionId] : undefined,
  );
  const updateDecision = useAppStore((s) => s.updateDecision);
  const { showToast } = useToast();

  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale ?? "");
  const [openConcerns, setOpenConcerns] = useState(decision?.openConcerns ?? "");
  const [nextSteps, setNextSteps] = useState(decision?.nextSteps ?? "");

  if (!decision) return null;

  const isDecided = decision.decisionStatus === "decided";

  async function copyMemo() {
    const text = buildMemo(decision!, selectedOption?.name);
    try {
      await navigator.clipboard.writeText(text);
      showToast("Decision memo copied", "success");
    } catch {
      showToast("Could not copy to clipboard");
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <DecisionStatusBadge status={decision.status} />
        <Button variant="outline" size="sm" onClick={copyMemo}>
          Copy memo
        </Button>
      </div>

      {selectedOption && (
        <div className="flex items-center gap-2 border border-success/30 bg-success-soft rounded-lg px-3 py-2">
          <img
            src={selectedOption.imageDataUrl}
            alt={selectedOption.name}
            className="w-10 h-10 object-cover rounded-md"
            draggable={false}
          />
          <div>
            <p className="text-xs text-text-soft">Selected design option</p>
            <p className="text-sm font-medium text-text">{selectedOption.name}</p>
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Rationale</span>
        <Textarea
          rows={3}
          placeholder="Why was this direction chosen?"
          value={finalRationale}
          disabled={isDecided}
          onChange={(e) => setFinalRationale(e.target.value)}
          onBlur={() => {
            if (finalRationale !== decision.finalRationale)
              updateDecision(decisionId, { finalRationale });
          }}
        />
        <span className="text-xs text-text-soft">Explain the tradeoffs and why this option wins.</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Open concerns</span>
        <Textarea
          rows={2}
          value={openConcerns}
          disabled={isDecided}
          onChange={(e) => setOpenConcerns(e.target.value)}
          onBlur={() => {
            if (openConcerns !== decision.openConcerns)
              updateDecision(decisionId, { openConcerns });
          }}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Next steps</span>
        <Textarea
          rows={2}
          value={nextSteps}
          disabled={isDecided}
          onChange={(e) => setNextSteps(e.target.value)}
          onBlur={() => {
            if (nextSteps !== decision.nextSteps)
              updateDecision(decisionId, { nextSteps });
          }}
        />
      </label>

      <div className="rounded-lg border border-app-border bg-app-surface-soft p-3">
        <p className="text-xs font-medium text-text-muted mb-2">Memo preview</p>
        <pre className="text-xs text-text-muted whitespace-pre-wrap font-sans leading-relaxed">
          {buildMemo(decision, selectedOption?.name)}
        </pre>
      </div>
    </div>
  );
}
