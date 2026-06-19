import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export default function Textarea({ className, label, id, ...props }: Props) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full border border-border rounded-md px-3 py-1.5 text-sm",
          "bg-surface text-text placeholder:text-text-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent resize-y transition-shadow",
          className,
        )}
        {...props}
      />
    </div>
  );
}
