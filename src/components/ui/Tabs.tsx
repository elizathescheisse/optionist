import { cn } from "../../utils/cn";

type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export default function Tabs({ tabs, activeId, onChange, className }: Props) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-border", className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={activeId === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-2 text-sm font-medium -mb-px transition-colors motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-md",
            activeId === tab.id
              ? "text-primary border-b-2 border-primary"
              : "text-text-muted hover:text-text",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
