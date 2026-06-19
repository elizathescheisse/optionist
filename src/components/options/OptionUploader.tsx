import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { useAppStore } from "../../store/useAppStore";
import {
  validateImageFile,
  fileToDataUrl,
  type FileValidationError,
} from "../../utils/files";
import type { DesignOption } from "../../types/domain";
import Button from "../ui/Button";

type Props = {
  decisionId: string;
  compact?: boolean;
  /** Renders a smaller drop zone suited for the right panel */
  panel?: boolean;
};

const ERROR_MESSAGES: Record<FileValidationError, string> = {
  "invalid-type": "Only PNG, JPEG, WebP, and GIF files are accepted.",
  "too-large": "File must be under 10 MB.",
  empty: "File is empty.",
};

export default function OptionUploader({ decisionId, compact = false, panel = false }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addOption = useAppStore((s) => s.addOption);

  async function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    setIsLoading(true);

    for (const file of fileArray) {
      const error = validateImageFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${ERROR_MESSAGES[error]}`);
        continue;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        addOption(decisionId, {
          name: file.name.replace(/\.[^.]+$/, ""),
          imageDataUrl: dataUrl,
          imageMimeType: file.type as DesignOption["imageMimeType"],
        });
      } catch {
        newErrors.push(`${file.name}: Failed to read file.`);
      }
    }

    setErrors(newErrors);
    setIsLoading(false);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={handleChange}
    />
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          className="text-xs"
        >
          {isLoading ? "Loading…" : "Add screenshots"}
        </Button>
        {input}
        {errors.length > 0 && (
          <ul className="flex flex-col gap-0.5">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-500">
                {err}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const outerPad = panel ? "p-3" : "p-6";
  const innerPad = panel ? "p-4 py-5" : "p-10";
  const bodyText = panel ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-col gap-2 ${outerPad}`}>
      <div
        className={`rounded-xl border ${innerPad} flex flex-col items-center gap-2 transition-colors motion-reduce:transition-none cursor-pointer select-none ${
          isDragging
            ? "border-border bg-surface-muted"
            : "border-border bg-surface-muted hover:border-border hover:bg-surface-muted"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <p className={`${bodyText} text-text-muted text-center`}>
          {isLoading
            ? "Loading…"
            : "Drop screenshots here, or click to choose files"}
        </p>
        <p className="text-xs text-text-soft">
          PNG, JPEG, WebP, GIF · Max 10 MB each
        </p>
        <Button
          type="button"
          variant="secondary"
          className={panel ? "text-xs py-1" : ""}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choose files
        </Button>
        {input}
      </div>

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <li key={i} className="text-xs text-red-500">
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
