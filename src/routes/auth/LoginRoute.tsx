import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GuestOnly from "../../components/auth/GuestOnly";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
import Button from "../../components/shared/Button";
import TextInput from "../../components/shared/TextInput";
import Divider from "../../components/ui/Divider";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../utils/cn";

export default function LoginRoute() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (login(email.trim(), password)) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Try test@test.com / test.");
    }
  }

  return (
    <GuestOnly>
      <AuthLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Welcome back</h1>
            <p className="text-sm text-text-muted mt-1">
              Sign in to your Optionist workspace
            </p>
          </div>

          {!showEmail ? (
            <SocialLoginButtons onEmailClick={() => setShowEmail(true)} />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div
                className={cn(
                  "flex flex-col gap-4",
                  "animate-[fadeSlideIn_200ms_var(--ease-standard)_forwards]",
                )}
              >
                <TextInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@test.com"
                  helperText="Demo: test@test.com / test"
                />
                <TextInput
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="test"
                  helperText={error ? undefined : "Password: test"}
                  error={error || undefined}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Sign in
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowEmail(false);
                  setError("");
                }}
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                Use another sign-in method
              </button>
            </form>
          )}

          <Divider />

          <div className="flex flex-col items-center gap-2 text-sm">
            <Link
              to="/forgot-password"
              className="text-text-muted hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
            <p className="text-text-soft">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    </GuestOnly>
  );
}
