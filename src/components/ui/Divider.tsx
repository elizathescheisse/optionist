import { cn } from "../../utils/cn";

type Props = {
  className?: string;
  label?: string;
};

export default function Divider({ className, label }: Props) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-soft font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <hr className={cn("border-0 h-px bg-border", className)} />;
}
