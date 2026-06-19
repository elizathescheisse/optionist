import { useEffect, useRef, type ReactNode } from "react";
import Button from "./Button";

type Props = {
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
};

export default function Modal({
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4 focus:outline-none"
      >
        <h2 className="font-semibold text-text text-base">{title}</h2>
        <div className="text-sm text-text-muted leading-relaxed">{children}</div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
