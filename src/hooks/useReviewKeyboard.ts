import { useEffect } from "react";
import { getReviewKeyAction, type ReviewKeyAction } from "../utils/keyboard";

type Options = {
  enabled?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onReject?: () => void;
  onFinal?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
};

export function useReviewKeyboard({
  enabled = true,
  onNext,
  onPrevious,
  onReject,
  onFinal,
  onEscape,
  onHelp,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      const action = getReviewKeyAction(e);
      if (!action) return;

      const handlers: Record<Exclude<ReviewKeyAction, null>, (() => void) | undefined> = {
        next: onNext,
        previous: onPrevious,
        reject: onReject,
        final: onFinal,
        escape: onEscape,
        help: onHelp,
      };

      const fn = handlers[action];
      if (!fn) return;
      e.preventDefault();
      fn();
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onNext, onPrevious, onReject, onFinal, onEscape, onHelp]);
}
