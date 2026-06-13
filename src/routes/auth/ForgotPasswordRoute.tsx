import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import GuestOnly from "../../components/auth/GuestOnly";
import AuthInput from "../../components/auth/AuthInput";
import { cn } from "../../utils/cn";

export default function ForgotPasswordRoute() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <GuestOnly>
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-text tracking-tight">Reset password</h1>
              <p className="text-sm text-text-muted">
                Enter your email and we&apos;ll send reset instructions
              </p>
            </div>

            {submitted ? (
              <div className="rounded-[var(--token-auth-radius-control)] bg-primary-soft p-4 text-sm text-text text-center">
                If this email exists, we&apos;ll send reset instructions.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <AuthInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-[var(--token-auth-button-height)] rounded-[var(--token-auth-radius-control)]",
                    "bg-primary text-white text-sm font-semibold hover:opacity-90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    "disabled:opacity-60",
                  )}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )}

            <Link
              to="/login"
              className="text-sm text-primary font-medium hover:underline text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Back to login
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    </GuestOnly>
  );
}
