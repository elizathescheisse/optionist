import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { isSupabaseConfigured } from "../../lib/supabase";

const SETUP_PATHS = ["/profile/setup", "/onboarding"];

export default function AuthenticatedBootstrap() {
  const user = useAuthStore((s) => s.user);
  const wsStatus = useWorkspaceStore((s) => s.status);
  const profile = useWorkspaceStore((s) => s.profile);
  const wsError = useWorkspaceStore((s) => s.error);
  const load = useWorkspaceStore((s) => s.load);
  const hydrateDemo = useWorkspaceStore((s) => s.hydrateDemo);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    if (user.id && isSupabaseConfigured) {
      void load(user.id);
    } else {
      hydrateDemo();
    }
  }, [user, user?.id, load, hydrateDemo]);

  if (!user) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  if (wsStatus === "loading" || wsStatus === "idle") {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-text-muted">
        Loading workspace…
      </div>
    );
  }

  if (wsStatus === "error") {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-error">{wsError ?? "Could not load workspace."}</p>
        <button
          type="button"
          className="text-sm text-primary font-medium hover:underline"
          onClick={() => user.id && void load(user.id)}
        >
          Try again
        </button>
      </div>
    );
  }

  // Demo mode — no Supabase profile routing
  if (!isSupabaseConfigured || !profile) {
    return <Outlet />;
  }

  const onSetupPath = SETUP_PATHS.includes(location.pathname);

  if (profile.onboarding_status === "profile_incomplete" && location.pathname !== "/profile/setup") {
    return <Navigate to="/profile/setup" replace />;
  }

  if (
    profile.onboarding_status === "onboarding_incomplete" &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile.onboarding_status === "complete" && onSetupPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
