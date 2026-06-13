import type { ReactNode } from "react";
import Header from "./Header";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
