import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function TextInput({ className = "", label, error, helperText, id, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-500">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent transition-shadow ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        helperText && <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
