import { cn } from "../../utils/cn";

type BadgeVariant =
  | "connected"
  | "not-connected"
  | "coming-soon"
  | "admin"
  | "owner"
  | "default";

type Props = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  connected: "bg-success/10 text-success",
  "not-connected": "bg-surface-muted text-text-muted",
  "coming-soon": "bg-surface-muted text-text-soft",
  admin: "bg-primary-soft text-primary",
  owner: "bg-primary-soft text-primary",
  default: "bg-surface-muted text-text-muted",
};

export default function SettingsBadge({
  variant = "default",
  children,
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
