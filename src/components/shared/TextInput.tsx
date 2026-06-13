import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent transition-shadow ${className}`}
      {...props}
    />
  );
}
