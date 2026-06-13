import { cn } from "../../utils/cn";

type Props = {
  message: string;
  detail?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function EmptyState({ message, detail, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center gap-3",
        className,
      )}
    >
      <p className="text-sm font-medium text-text-muted">{message}</p>
      {detail && <p className="text-xs text-text-soft max-w-sm">{detail}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
