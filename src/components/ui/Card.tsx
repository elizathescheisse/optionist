import { cn } from "../../utils/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  selected?: boolean;
};

const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className,
  padding = "md",
  hover = false,
  selected = false,
}: Props) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-lg shadow-sm",
        PADDING[padding],
        hover &&
          "transition-all motion-reduce:transition-none hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        selected && "ring-2 ring-primary border-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}
