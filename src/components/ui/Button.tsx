import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "lg" | "sm";
};

export default function Button({
  variant = "secondary",
  size = "lg",
  className,
  ...props
}: Props) {
  const base =
    "rounded-md font-medium transition-colors motion-reduce:transition-none " +
    "disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary";
  const sizes = {
    lg: "px-3 py-1.5 text-sm",
    sm: "px-2 py-1 text-xs",
  };
  const variants = {
    primary: "bg-primary text-white hover:opacity-90 shadow-sm",
    secondary:
      "bg-surface border border-border text-text-muted hover:bg-surface-muted shadow-sm",
    danger:
      "bg-surface border border-error/30 text-error hover:bg-error-soft shadow-sm",
    ghost: "bg-transparent text-text-muted hover:bg-surface-muted",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
