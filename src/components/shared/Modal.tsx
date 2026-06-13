import { useEffect, useRef, type ReactNode } from "react";
import Button from "./Button";
import { cn } from "../../utils/cn";

type ModalSize = "sm" | "md" | "lg";

type Props = {
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: "primary" | "destructive";
  size?: ModalSize;
  footer?: ReactNode;
  className?: string;
};

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  size = "sm",
  footer,
  className,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelRef.current();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "bg-app-panel rounded-xl shadow-modal w-full mx-4 p-6 flex flex-col gap-4",
          "border border-app-border",
          SIZE_CLASS[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="font-semibold text-text text-md">
          {title}
        </h2>
        <div className="text-sm text-text-muted leading-relaxed [&_input]:text-text [&_textarea]:text-text">
          {children}
        </div>
        {footer ?? (
          <div className="flex justify-end gap-2 pt-1 border-t border-app-border">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
