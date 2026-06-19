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
    "disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-900";
  const sizes = {
    lg: "px-3 py-1.5 text-sm",
    sm: "px-2 py-1 text-xs",
  };
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-700 shadow-sm",
    secondary:
      "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm",
    danger:
      "bg-white border border-red-200 text-red-500 hover:bg-red-50 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
