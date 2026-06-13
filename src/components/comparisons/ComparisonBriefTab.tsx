import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";

type Props = { decisionId: string };

export default function ComparisonBriefTab({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const updateDecision = useAppStore((s) => s.updateDecision);

  const [title, setTitle] = useState(decision?.title ?? "");
  const [description, setDescription] = useState(decision?.description ?? "");
  const [summary, setSummary] = useState(decision?.summary ?? "");
  const [audience, setAudience] = useState(decision?.audience ?? "");
  const [dueDate, setDueDate] = useState(decision?.dueDate ?? "");
  const [owner, setOwner] = useState(decision?.owner ?? "");

  if (!decision) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Comparison title</span>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            const t = title.trim();
            if (t && t !== decision.title) updateDecision(decisionId, { title: t });
          }}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Decision to make</span>
        <Textarea
          rows={3}
          placeholder="What decision needs to be made?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description.trim() !== decision.description)
              updateDecision(decisionId, { description: description.trim() });
          }}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Brief summary</span>
        <Textarea
          rows={2}
          placeholder="One-paragraph context for stakeholders…"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          onBlur={() => {
            if (summary !== decision.summary) updateDecision(decisionId, { summary });
          }}
        />
      </label>

      <TextInput
        label="Audience"
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        onBlur={() => {
          if (audience !== decision.audience) updateDecision(decisionId, { audience });
        }}
      />

      <TextInput
        label="Owner"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        onBlur={() => {
          if (owner !== decision.owner) updateDecision(decisionId, { owner });
        }}
      />

      <TextInput
        label="Due date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        onBlur={() => {
          if (dueDate !== decision.dueDate) updateDecision(decisionId, { dueDate });
        }}
      />
    </div>
  );
}
