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
        className="bg-white rounded-lg shadow-xl p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {SHORTCUTS.map(([key, label]) => (
              <tr key={key} className="border-b border-gray-100 last:border-0">
                <td className="py-1.5 pr-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                  {key}
                </td>
                <td className="py-1.5 text-gray-700">{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
