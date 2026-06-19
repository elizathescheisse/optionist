import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import RedirectIfAuthed from "../../components/auth/RedirectIfAuthed";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import PasswordInput from "../../components/ui/PasswordInput";
import Divider from "../../components/ui/Divider";
import ContinueAsGuestButton from "../../components/auth/ContinueAsGuestButton";
import { useAuthStore } from "../../store/useAuthStore";
import { isSupabaseConfigured } from "../../lib/supabase";
import { cn } from "../../utils/cn";

export default function SignupRoute() {
  const navigate = useNavigate();
  const signUpWithPassword = useAuthStore((s) => s.signUpWithPassword);
  const authError = useAuthStore((s) => s.authError);
  const clearAuthError = useAuthStore((s) => s.clearAuthError);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    clearAuthError();
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const ok = await signUpWithPassword(email.trim(), password);
    setSubmitting(false);
    if (ok) {
      if (isSupabaseConfigured) {
        setCheckEmail(true);
      } else {
        navigate("/onboarding");
      }
    }
  }

  const errorMessage = authError ?? localError;

  return (
    <RedirectIfAuthed>
      <AuthLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Create your account</h1>
            <p className="text-sm text-text-muted mt-1">
              Get started with Optionist in a few quick steps
            </p>
          </div>

          {checkEmail ? (
            <div className="rounded-lg bg-primary-soft p-4 text-sm text-text">
              Check your email to confirm your account, then sign in to continue setup.
            </div>
          ) : !showEmail ? (
            <>
              <SocialLoginButtons
                emailButtonLabel="Sign up with email"
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
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <PasswordInput
                  label="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting ? "Creating account…" : "Create account"}
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
                Back to other sign-up options
              </button>
            </form>
          )}

          <Divider />

          <ContinueAsGuestButton />

          <Divider />

          <p className="text-sm text-text-soft text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    </RedirectIfAuthed>
  );
}
