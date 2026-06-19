import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

// Wraps the auth screens (login/signup/onboarding/forgot-password). If the
// visitor is already signed in, there's no reason to show them a login form, so
// send them to the dashboard. The mirror of RequireAuth, which guards the app.
export default function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
