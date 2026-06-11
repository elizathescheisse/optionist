type Props = {
  message: string;
  detail?: string;
};

export default function EmptyState({ message, detail }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
      <p className="text-sm font-medium text-gray-400">{message}</p>
      {detail && <p className="text-xs text-gray-300">{detail}</p>}
    </div>
  );
}
