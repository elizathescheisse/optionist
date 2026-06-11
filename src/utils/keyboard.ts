export function isTypingTarget(element: Element | null): boolean {
  if (!element) return false;
  // A keydown target may be window/document, which has no tagName.
  const tagName = (element as Element).tagName;
  if (typeof tagName !== "string") return false;
  const tag = tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  if ((element as HTMLElement).isContentEditable) return true;
  return false;
}

export type ReviewKeyAction =
  | "next"
  | "previous"
  | "reject"
  | "final"
  | null;

/**
 * Resolve a keyboard event into a review action.
 * Returns null when focus is in a typing target so shortcuts never
 * fire while the user is typing.
 */
export function getReviewKeyAction(e: {
  key: string;
  target: EventTarget | null;
}): ReviewKeyAction {
  if (isTypingTarget(e.target as Element | null)) return null;
  switch (e.key) {
    case " ":
    case "ArrowRight":
      return "next";
    case "ArrowLeft":
      return "previous";
    case "r":
    case "R":
      return "reject";
    case "f":
    case "F":
      return "final";
    default:
      return null;
  }
}
