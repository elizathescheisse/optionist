const SHORTCUTS: [string, string][] = [
  ["Space / →", "Next option"],
  ["←", "Previous option"],
  ["R", "Reject / Restore option"],
  ["F", "Mark option final"],
  ["Esc", "Return to project"],
  ["?", "Toggle this help"],
];

type Props = { onClose: () => void };

export default function KeyboardShortcutHelp({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-xl p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="text-text-soft hover:text-text-muted text-xl leading-none"
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {SHORTCUTS.map(([key, label]) => (
              <tr key={key} className="border-b border-border last:border-0">
                <td className="py-1.5 pr-4 font-mono text-xs text-text-muted whitespace-nowrap">
                  {key}
                </td>
                <td className="py-1.5 text-text">{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
