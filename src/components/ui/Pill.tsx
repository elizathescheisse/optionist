import { cn } from "../../utils/cn";

type Props = {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function Pill({ children, active, className, onClick }: Props) {
  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        "transition-colors motion-reduce:transition-none",
        active
          ? "bg-primary text-white"
          : "bg-surface-muted text-text-muted hover:bg-primary-soft hover:text-primary",
        onClick &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
