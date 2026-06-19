import { useWorkspaceStore, currentOrganization } from "../../store/useWorkspaceStore";
import { cn } from "../../utils/cn";

export default function OrganizationSwitcher() {
  const organizations = useWorkspaceStore((s) => s.organizations);
  const currentOrganizationId = useWorkspaceStore((s) => s.currentOrganizationId);
  const setCurrentOrganization = useWorkspaceStore((s) => s.setCurrentOrganization);
  const org = useWorkspaceStore(currentOrganization);

  if (organizations.length === 0) return null;

  if (organizations.length === 1) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-text-soft">Workspace</p>
        <p className="text-sm text-text font-medium truncate">{org?.name ?? organizations[0].name}</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-border">
      <label htmlFor="org-switcher" className="text-xs text-text-soft px-1">
        Workspace
      </label>
      <select
        id="org-switcher"
        value={currentOrganizationId ?? ""}
        onChange={(e) => setCurrentOrganization(e.target.value)}
        className={cn(
          "mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        {organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
