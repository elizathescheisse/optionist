import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AuthCard({ children, className }: Props) {
  return <div className={cn("auth-card", className)}>{children}</div>;
}
