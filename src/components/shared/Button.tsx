import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: Props) {
  const base = cn(
    "inline-flex items-center justify-center font-medium rounded-md",
    "transition-colors motion-reduce:transition-none",
    "disabled:opacity-40 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary",
  );

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2.5 text-md",
  };

  const variants = {
    primary: "bg-primary text-white hover:opacity-90 shadow-sm",
    secondary:
      "bg-surface border border-border text-text-muted hover:bg-surface-muted shadow-sm",
    ghost: "bg-transparent text-text-muted hover:bg-surface-muted",
    destructive:
      "bg-surface border border-error/30 text-error hover:bg-error-soft shadow-sm",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
