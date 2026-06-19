import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/** Allows signed-in users and guest-mode users into the app. */
export default function RequireAppAccess({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const canAccessApp = useAuthStore((s) => s.canAccessApp);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  if (!canAccessApp()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
