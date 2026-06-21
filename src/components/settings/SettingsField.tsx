import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  helper?: string;
};

export default function SettingsField({ label, children, helper }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      {children}
      {helper && (
        <p className="text-xs text-text-soft leading-normal">{helper}</p>
      )}
    </div>
  );
}
