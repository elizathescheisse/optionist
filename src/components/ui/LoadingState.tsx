import { cn } from "../../utils/cn";

type Props = {
  className?: string;
  label?: string;
};

export default function LoadingState({ className, label = "Loading…" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin motion-reduce:animate-none" />
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
