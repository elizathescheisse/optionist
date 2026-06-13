import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "quiet" | "destructive";
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
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-md",
  };

  const variants = {
    primary: "bg-primary text-white hover:opacity-90 shadow-sm",
    secondary:
      "bg-app-surface border border-app-border text-text-muted hover:bg-app-surface-soft shadow-sm",
    outline:
      "bg-transparent border border-app-border text-text hover:bg-app-surface-soft",
    ghost: "bg-transparent text-text-muted hover:bg-app-surface-soft",
    quiet: "bg-transparent text-text-soft hover:text-text hover:bg-app-surface-soft",
    destructive:
      "bg-app-surface border border-error/30 text-error hover:bg-error-soft shadow-sm",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
