import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ReactNode;
};

function EnvelopeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 7.5h16v9H4v-9z M4 7.5l8 5.5 8-5.5"
      />
    </svg>
  );
}

export default function AuthInput({
  label,
  error,
  icon,
  id,
  className,
  ...props
}: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const leftIcon = icon ?? (props.type === "email" ? <EnvelopeIcon /> : null);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-soft pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full h-[var(--token-auth-field-height)] rounded-[var(--token-auth-radius-control)]",
            "border bg-app-panel text-text text-sm",
            "placeholder:text-text-soft",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
            "transition-shadow motion-reduce:transition-none",
            leftIcon ? "pl-12 pr-4" : "px-4",
            error ? "border-error" : "border-app-border",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
