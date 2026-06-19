import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function SettingsRow({
  label,
  description,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm text-text">{label}</p>
        {description && (
          <p className="text-xs text-text-muted">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
