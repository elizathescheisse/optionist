import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/** Handles OAuth redirect return — session is detected by the Supabase client. */
export default function AuthCallbackRoute() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authError = useAuthStore((s) => s.authError);

  useEffect(() => {
    if (status === "loading") return;
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [status, isAuthenticated, navigate]);

  if (authError) {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-error">{authError}</p>
        <a href="/login" className="text-sm text-primary font-medium hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-text-muted">
      Signing you in…
    </div>
  );
}
