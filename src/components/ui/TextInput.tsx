import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function TextInput({
  className,
  label,
  error,
  helperText,
  id,
  ...props
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full border border-border rounded-md px-3 py-1.5 text-sm",
          "bg-surface text-text placeholder:text-text-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-shadow",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : (
        helperText && <p className="text-xs text-text-soft">{helperText}</p>
      )}
    </div>
  );
}
