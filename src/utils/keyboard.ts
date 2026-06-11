export function isTypingTarget(element: Element | null): boolean {
  if (!element) return false;
  const tag = element.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  if ((element as HTMLElement).isContentEditable) return true;
  return false;
}
