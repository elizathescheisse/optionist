import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

// Wraps the auth screens (login/signup/onboarding/forgot-password). If the
// visitor is already signed in, there's no reason to show them a login form, so
// send them to the dashboard. The mirror of RequireAuth, which guards the app.
export default function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
