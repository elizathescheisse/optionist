import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/** Account-only routes — guests are redirected to dashboard with a signup hint. */
export default function RequireAuthenticated({
  children,
}: {
  children?: React.ReactNode;
}) {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  if (isGuest()) {
    return <Navigate to="/dashboard" state={{ guestAccountOnly: true, from: location }} replace />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
}
