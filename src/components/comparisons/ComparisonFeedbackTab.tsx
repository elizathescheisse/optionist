import { useState } from "react";
import { getItem, setItem, STORAGE_KEYS } from "../../services/storage";
import { logTimelineEvent } from "../../services/timeline";
import Button from "../shared/Button";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";
import Badge from "../ui/Badge";
import { createId } from "../../utils/ids";
import type { FeedbackSentiment, StakeholderFeedback } from "./StakeholderFeedbackPanel";

type FeedbackStore = Record<string, StakeholderFeedback[]>;

const QUICK_CHIPS = [
  "Needs more contrast",
  "Feels on-brand",
  "Too busy",
  "Clear hierarchy",
  "Accessibility concern",
  "Ship it",
];

const SENTIMENT_LABELS: Record<FeedbackSentiment, string> = {
  positive: "Positive",
  concern: "Concern",
  question: "Question",
  neutral: "Neutral",
};

const SENTIMENT_VARIANT: Record<
  FeedbackSentiment,
  "success" | "warning" | "info" | "default"
> = {
  positive: "success",
  concern: "warning",
  question: "info",
  neutral: "default",
};

function loadFeedback(): FeedbackStore {
  return getItem<FeedbackStore>(STORAGE_KEYS.feedback) ?? {};
}

function saveFeedback(store: FeedbackStore) {
  setItem(STORAGE_KEYS.feedback, store);
}

type Props = { decisionId: string };

export default function ComparisonFeedbackTab({ decisionId }: Props) {
  const [items, setItems] = useState(() => loadFeedback()[decisionId] ?? []);
  const [person, setPerson] = useState("");
  const [role, setRole] = useState("");
  const [theme, setTheme] = useState("");
  const [comment, setComment] = useState("");
  const [sentiment, setSentiment] = useState<FeedbackSentiment>("neutral");
  const [filter, setFilter] = useState<FeedbackSentiment | "all">("all");

  function handleAdd() {
    if (!comment.trim()) return;
    const entry: StakeholderFeedback = {
      id: createId(),
      decisionId,
      person: person.trim() || "Anonymous",
      comment: [role && `[${role}]`, theme && `Theme: ${theme}`, comment.trim()]
        .filter(Boolean)
        .join(" "),
      sentiment,
      createdAt: new Date().toISOString(),
    };
    const store = loadFeedback();
    const next = [...(store[decisionId] ?? []), entry];
    store[decisionId] = next;
    saveFeedback(store);
    logTimelineEvent({
      type: "feedback_added",
      decisionId,
      label: `Feedback from ${entry.person}`,
    });
    setItems(next);
    setComment("");
  }

  function appendChip(chip: string) {
    setComment((c) => (c ? `${c} ${chip}` : chip));
  }

  const filtered =
    filter === "all" ? items : items.filter((f) => f.sentiment === filter);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => appendChip(chip)}
            className="text-xs px-2 py-1 rounded-full border border-app-border bg-app-surface-soft text-text-muted hover:text-text hover:border-primary/30 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      <TextInput placeholder="Person" value={person} onChange={(e) => setPerson(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <TextInput placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <TextInput placeholder="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} />
      </div>
      <Textarea
        placeholder="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <select
        value={sentiment}
        onChange={(e) => setSentiment(e.target.value as FeedbackSentiment)}
        className="text-sm border border-app-border rounded-md px-3 py-2 bg-app-panel text-text h-10"
      >
        {Object.entries(SENTIMENT_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <Button variant="secondary" size="sm" onClick={handleAdd}>
        Add feedback
      </Button>

      {items.length > 0 && (
        <>
          <div className="flex gap-1 flex-wrap pt-2 border-t border-app-border">
            {(["all", "positive", "concern", "question", "neutral"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-xs px-2 py-1 rounded-md ${filter === f ? "bg-primary-soft text-primary" : "text-text-soft"}`}
              >
                {f === "all" ? "All" : SENTIMENT_LABELS[f]}
              </button>
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {filtered.map((f) => (
              <li key={f.id} className="text-xs border border-app-border rounded-md p-2 bg-app-panel">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-text">{f.person}</span>
                  <Badge variant={SENTIMENT_VARIANT[f.sentiment]}>
                    {SENTIMENT_LABELS[f.sentiment]}
                  </Badge>
                </div>
                <p className="text-text-muted">{f.comment}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
