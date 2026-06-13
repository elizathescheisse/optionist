import type { ReactNode } from "react";
import Header from "./Header";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-bg">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}

/** Legacy alias — prefer WorkspaceShell inside /app routes */
export default function AppShell({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
