export default function AuthDivider() {
  return (
    <div className="relative flex items-center py-1" role="separator">
      <div className="flex-1 border-t border-app-border" />
      <span className="px-4 text-xs font-medium text-text-soft uppercase tracking-wider">
        Or
      </span>
      <div className="flex-1 border-t border-app-border" />
    </div>
  );
}
