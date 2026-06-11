import { useEffect } from "react";
import { getReviewKeyAction, type ReviewKeyAction } from "../utils/keyboard";

type Options = {
  enabled?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onReject?: () => void;
  onFinal?: () => void;
};

/**
 * Window-level keyboard navigation for option review.
 * Space / ArrowRight → next, ArrowLeft → previous, R → reject/restore,
 * F → mark final.
 *
 * Shortcuts are gated by getReviewKeyAction so they never fire while the
 * user is typing. Reject/final only act when a handler is supplied, so
 * callers that only navigate are unaffected by R/F presses.
 */
export function useReviewKeyboard({
  enabled = true,
  onNext,
  onPrevious,
  onReject,
  onFinal,
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
      };

      const fn = handlers[action];
      if (!fn) return;
      e.preventDefault();
      fn();
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onNext, onPrevious, onReject, onFinal]);
}
