import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function FileInput({
  label = "Choose file",
  className,
  ...props
}: Props) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer", className)}>
      <span className="px-3 py-1.5 rounded text-sm font-medium border border-border bg-surface text-text-muted hover:bg-surface-muted transition-colors">
        {label}
      </span>
      <input type="file" className="sr-only" {...props} />
    </label>
  );
}
