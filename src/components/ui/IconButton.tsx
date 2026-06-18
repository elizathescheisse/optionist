import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: "sm" | "md";
};

export default function IconButton({
  label,
  size = "md",
  className = "",
  children,
  ...props
}: Props & { children: ReactNode }) {
  const sizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        "text-text-muted hover:bg-surface-muted hover:text-text",
        "transition-colors motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:opacity-40",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
