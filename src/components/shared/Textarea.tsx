import { useId, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export default function Textarea({ className = "", label, id, ...props }: Props) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-gray-500">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent resize-y transition-shadow ${className}`}
        {...props}
      />
    </div>
  );
}
