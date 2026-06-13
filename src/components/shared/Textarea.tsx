import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export default function Textarea({
  className = "",
  label,
  helperText,
  error,
  id,
  ...props
}: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full border rounded-md px-3 py-2 text-sm bg-surface text-text",
          "placeholder:text-text-soft resize-y",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
          "transition-shadow motion-reduce:transition-none",
          error ? "border-error" : "border-border",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-text-soft">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
