import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

export default function WorkspaceSwitcher({ compact }: { compact?: boolean }) {
  const onboarding = useAuthStore((s) => s.onboarding);
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const name = onboarding?.workspaceName ?? "My workspace";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative px-3 py-2 border-b border-app-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-2 py-2 text-left",
          "hover:bg-app-surface-soft transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          compact && "justify-center px-1",
        )}
        title={name}
      >
        <span className="w-7 h-7 rounded-md bg-primary-soft text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {name.charAt(0).toUpperCase()}
        </span>
        {!compact && (
          <>
            <span className="flex-1 min-w-0">
              <span className="block text-xs text-text-soft">Workspace</span>
              <span className="block text-sm font-medium text-text truncate">{name}</span>
            </span>
            <svg className="w-4 h-4 text-text-soft shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-dropdown bg-app-panel border border-app-border rounded-lg shadow-popover py-1">
          <div className="px-3 py-2 text-sm font-medium text-text truncate">{name}</div>
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm text-text-muted hover:bg-app-surface-soft"
            onClick={() => {
              setOpen(false);
              showToast("Workspace creation coming soon");
            }}
          >
            + Create workspace
          </button>
        </div>
      )}
    </div>
  );
}
