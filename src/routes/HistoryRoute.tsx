import { Link } from "react-router-dom";
import { getTimelineEvents } from "../services/timeline";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

export default function HistoryRoute() {
  const events = getTimelineEvents();

  return (
    <div className="flex-1 overflow-y-auto bg-app-bg">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
        <PageHeader
          title="History"
          subtitle="Timeline of comparisons, decisions, and feedback."
        />

        {events.length === 0 ? (
          <EmptyState
            message="No history yet"
            detail="Events appear here when you create comparisons, capture decisions, or add feedback."
          />
        ) : (
          <ol className="relative border-l border-app-border ml-3 flex flex-col gap-4">
            {events.map((event) => (
              <li key={event.id} className="ml-6">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary border-2 border-app-bg" />
                <Card padding="sm">
                  <p className="text-sm font-medium text-text">{event.label}</p>
                  <p className="text-xs text-text-soft mt-0.5">
                    {new Date(event.createdAt).toLocaleString()} · {event.type.replace(/_/g, " ")}
                  </p>
                  <Link
                    to={`/app/comparisons/${event.decisionId}`}
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Open comparison
                  </Link>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
