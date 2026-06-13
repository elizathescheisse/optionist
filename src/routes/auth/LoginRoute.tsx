import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthDivider from "../../components/auth/AuthDivider";
import AuthFooterLink from "../../components/auth/AuthFooterLink";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import GuestOnly from "../../components/auth/GuestOnly";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../utils/cn";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginRoute() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setEmailError("");
    setPasswordError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setPasswordError("Password is required.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    if (login(trimmedEmail, password)) {
      navigate("/app");
      return;
    }

    setLoading(false);
    setFormError("Invalid email or password.");
  }

  return (
    <GuestOnly>
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-text tracking-tight">Welcome back</h1>
              <p className="text-sm text-text-muted">Sign in to your Optionist workspace</p>
            </div>

            <SocialAuthButtons disabled={loading} />

            <AuthDivider />

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <AuthInput
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                  setFormError("");
                }}
                placeholder="you@company.com"
                error={emailError}
                disabled={loading}
              />

              <PasswordInput
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                  setFormError("");
                }}
                placeholder="Enter your password"
                error={passwordError}
                disabled={loading}
              />

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2.5 text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-app-border text-primary focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  Keep me signed in
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded shrink-0"
                >
                  Forgot password?
                </Link>
              </div>

              {formError && (
                <p className="text-sm text-error text-center" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-[var(--token-auth-button-height)] rounded-[var(--token-auth-radius-control)]",
                  "bg-primary text-white text-sm font-semibold",
                  "hover:opacity-90 transition-opacity motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <AuthFooterLink />
          </div>
        </AuthCard>
      </AuthLayout>
    </GuestOnly>
  );
}
