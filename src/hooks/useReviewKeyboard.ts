import { useEffect } from "react";
import { getReviewKeyAction } from "../utils/keyboard";

type Options = {
  enabled?: boolean;
  onNext: () => void;
  onPrevious: () => void;
};

/**
 * Window-level keyboard navigation for option review.
 * Space / ArrowRight → next, ArrowLeft → previous.
 * Shortcuts are gated by getReviewKeyAction so they never fire while
 * the user is typing in an input, textarea, or editable element.
 */
export function useReviewKeyboard({ enabled = true, onNext, onPrevious }: Options) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      const action = getReviewKeyAction(e);
      if (!action) return;
      e.preventDefault();
      if (action === "next") onNext();
      else onPrevious();
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onNext, onPrevious]);
}
