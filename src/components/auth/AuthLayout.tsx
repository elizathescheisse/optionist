import type { ReactNode } from "react";
import AuthHero from "./AuthHero";

type Props = {
  children: ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthHero />
      <div className="flex-1 flex flex-col items-center justify-center bg-app-bg px-5 py-10 sm:px-8 lg:px-10 lg:min-h-screen">
        {children}
      </div>
    </div>
  );
}
