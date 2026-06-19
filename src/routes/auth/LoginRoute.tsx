import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import RedirectIfAuthed from "../../components/auth/RedirectIfAuthed";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import Divider from "../../components/ui/Divider";
import { useAuthStore } from "../../store/useAuthStore";
import { isSupabaseConfigured } from "../../lib/supabase";
import { cn } from "../../utils/cn";

export default function LoginRoute() {
  const navigate = useNavigate();
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const authError = useAuthStore((s) => s.authError);
  const clearAuthError = useAuthStore((s) => s.clearAuthError);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    clearAuthError();
    setSubmitting(true);
    const ok = await signInWithPassword(email.trim(), password);
    setSubmitting(false);
    if (ok) {
      navigate("/dashboard");
    } else if (!useAuthStore.getState().authError && !isSupabaseConfigured) {
      setLocalError("Invalid credentials. Try test@test.com / test.");
    }
  }

  const errorMessage = authError ?? localError;

  return (
    <RedirectIfAuthed>
      <AuthLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Welcome back</h1>
            <p className="text-sm text-text-muted mt-1">
              Sign in to your Optionist workspace
            </p>
          </div>

          {!showEmail ? (
            <>
              <SocialLoginButtons
                onEmailClick={() => {
                  clearAuthError();
                  setShowEmail(true);
                }}
              />
              {errorMessage && (
                <p className="text-sm text-error" role="alert">
                  {errorMessage}
                </p>
              )}
            </>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
              <div
                className={cn(
                  "flex flex-col gap-4",
                  "animate-[fadeSlideIn_200ms_var(--ease-standard)_forwards]",
                )}
              >
                <TextInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <TextInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="self-start text-xs text-text-soft hover:text-text-muted"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide password" : "Show password"}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm text-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>

              <button
                type="button"
                className="text-sm text-text-soft hover:text-text-muted text-center"
                onClick={() => {
                  clearAuthError();
                  setLocalError("");
                  setShowEmail(false);
                }}
              >
                Back to other sign-in options
              </button>
            </form>
          )}

          <Divider />

          <p className="text-sm text-text-soft text-center">
            <Link to="/forgot-password" className="text-primary font-medium hover:underline">
              Forgot password?
            </Link>
            {" · "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </AuthLayout>
    </RedirectIfAuthed>
  );
}
