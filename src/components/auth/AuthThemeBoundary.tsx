import { useLayoutEffect } from "react";
import { enterAuthThemeScope, exitAuthThemeScope } from "../../lib/theme";

type Props = {
  children: React.ReactNode;
};

/**
 * Forces light mode for pre-auth and onboarding routes.
 * Does not read or write theme preference in localStorage or Supabase.
 */
export default function AuthThemeBoundary({ children }: Props) {
  useLayoutEffect(() => {
    enterAuthThemeScope();
    return () => {
      exitAuthThemeScope();
    };
  }, []);

  return children;
}
