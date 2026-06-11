import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${className}`}
      {...props}
    />
  );
}
