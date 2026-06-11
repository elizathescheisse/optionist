import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function FileInput({ label = "Choose file", className = "", ...props }: Props) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <span className="px-3 py-1.5 rounded text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
        {label}
      </span>
      <input type="file" className="sr-only" {...props} />
    </label>
  );
}
