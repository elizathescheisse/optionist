import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  danger?: boolean;
};

export default function SettingsSection({
  title,
  description,
  children,
  className,
  danger = false,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-6 min-w-0", className)}>
      <div className="flex flex-col gap-1">
        <h2
          className={cn(
            "text-md font-semibold text-text",
            danger && "text-error",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-muted leading-normal">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
