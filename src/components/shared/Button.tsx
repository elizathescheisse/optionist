import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ variant = "secondary", className = "", ...props }: Props) {
  const base =
    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors motion-reduce:transition-none " +
    "disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-900";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-700 shadow-sm",
    secondary: "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm",
    danger: "bg-white border border-red-200 text-red-500 hover:bg-red-50 shadow-sm",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
