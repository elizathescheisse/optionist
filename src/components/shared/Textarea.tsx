import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: Props) {
  return (
    <textarea
      className={`w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent resize-y transition-shadow ${className}`}
      {...props}
    />
  );
}
