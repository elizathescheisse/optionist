import { cn } from "../../utils/cn";

type Props = {
  label: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

export default function SettingsToggle({
  label,
  description,
  checked = false,
  disabled = true,
  onChange,
}: Props) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-4",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm text-text">{label}</span>
        {description && (
          <span className="text-xs text-text-muted">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative shrink-0 w-10 h-6 rounded-full transition-colors motion-reduce:transition-none",
          checked ? "bg-primary" : "bg-border",
          disabled && "pointer-events-none",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
            checked && "translate-x-4",
          )}
        />
      </button>
    </label>
  );
}
