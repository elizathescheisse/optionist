type Props = {
  title: string;
  description: string;
};

export default function SettingsEmptyState({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-border rounded-lg bg-surface-muted/30">
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="text-xs text-text-muted mt-1 max-w-sm leading-normal">
        {description}
      </p>
    </div>
  );
}
