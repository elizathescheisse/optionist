import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import Card from "../ui/Card";

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  danger?: boolean;
};

export default function SettingsCard({
  title,
  description,
  children,
  className,
  danger = false,
}: Props) {
  return (
    <Card
      padding="md"
      className={cn(
        "flex flex-col gap-4",
        danger && "border-error/30",
        className,
      )}
    >
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && (
            <p className="text-sm font-medium text-text">{title}</p>
          )}
          {description && (
            <p className="text-xs text-text-muted leading-normal">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </Card>
  );
}
