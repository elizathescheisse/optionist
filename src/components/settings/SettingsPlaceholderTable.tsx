import { cn } from "../../utils/cn";

export type SettingsTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: SettingsTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  className?: string;
};

export default function SettingsPlaceholderTable<T>({
  columns,
  rows,
  getRowKey,
  className,
}: Props<T>) {
  return (
    <div className={cn("overflow-x-auto -mx-1 px-1", className)}>
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left text-xs font-medium text-text-muted py-2 pr-4",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-border/60">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("py-3 pr-4 text-text", col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
