import OptionUploader from "../options/OptionUploader";

type Props = { decisionId: string };

export default function ComparisonAssetsTab({ decisionId }: Props) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs text-text-muted">
        Upload design options for this comparison. Each upload becomes a card in the workspace.
      </p>
      <OptionUploader decisionId={decisionId} panel />
    </div>
  );
}
