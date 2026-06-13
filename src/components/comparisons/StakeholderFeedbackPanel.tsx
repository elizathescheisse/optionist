import { useState } from "react";
import { getItem, setItem, STORAGE_KEYS } from "../../services/storage";
import Button from "../shared/Button";
import TextInput from "../shared/TextInput";
import Textarea from "../shared/Textarea";
import SectionHeader from "../ui/SectionHeader";
import Badge from "../ui/Badge";
import { createId } from "../../utils/ids";

export type FeedbackSentiment = "positive" | "concern" | "question" | "neutral";

export type StakeholderFeedback = {
  id: string;
  decisionId: string;
  optionId?: string;
  person: string;
  comment: string;
  sentiment: FeedbackSentiment;
  createdAt: string;
};

type FeedbackStore = Record<string, StakeholderFeedback[]>;

function loadFeedback(): FeedbackStore {
  return getItem<FeedbackStore>(STORAGE_KEYS.feedback) ?? {};
}

function saveFeedback(store: FeedbackStore) {
  setItem(STORAGE_KEYS.feedback, store);
}

export function getFeedbackForDecision(decisionId: string): StakeholderFeedback[] {
  return loadFeedback()[decisionId] ?? [];
}

export function getFeedbackCountForOption(decisionId: string, optionId: string): number {
  return getFeedbackForDecision(decisionId).filter((f) => f.optionId === optionId).length;
}

type Props = {
  decisionId: string;
};

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

export default function StakeholderFeedbackPanel({ decisionId }: Props) {
  const [items, setItems] = useState(() => getFeedbackForDecision(decisionId));
  const [person, setPerson] = useState("");
  const [comment, setComment] = useState("");
  const [sentiment, setSentiment] = useState<FeedbackSentiment>("neutral");

  function handleAdd() {
    if (!comment.trim()) return;
    const entry: StakeholderFeedback = {
      id: createId(),
      decisionId,
      person: person.trim() || "Anonymous",
      comment: comment.trim(),
      sentiment,
      createdAt: new Date().toISOString(),
    };
    const store = loadFeedback();
    const next = [...(store[decisionId] ?? []), entry];
    store[decisionId] = next;
    saveFeedback(store);
    setItems(next);
    setComment("");
    setPerson("");
  }

  return (
    <div className="border-t border-border p-4 flex flex-col gap-3 overflow-y-auto max-h-64">
      <SectionHeader title="Stakeholder Feedback" />
      <div className="flex flex-col gap-2">
        <TextInput
          placeholder="Person"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
        />
        <Textarea
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
        />
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value as FeedbackSentiment)}
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-surface text-text"
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
      </div>
      {items.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {items.map((f) => (
            <li key={f.id} className="text-xs border border-border rounded-md p-2 bg-surface">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-text">{f.person}</span>
                <Badge variant={SENTIMENT_VARIANT[f.sentiment]}>{SENTIMENT_LABELS[f.sentiment]}</Badge>
              </div>
              <p className="text-text-muted">{f.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
