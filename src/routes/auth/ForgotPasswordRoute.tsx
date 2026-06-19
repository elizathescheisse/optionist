import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import RedirectIfAuthed from "../../components/auth/RedirectIfAuthed";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import { useAuthStore } from "../../store/useAuthStore";

export default function ForgotPasswordRoute() {
  const resetPasswordForEmail = useAuthStore((s) => s.resetPasswordForEmail);
  const authError = useAuthStore((s) => s.authError);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await resetPasswordForEmail(email);
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <RedirectIfAuthed>
      <AuthLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Reset password</h1>
            <p className="text-sm text-text-muted mt-1">
              Enter your email and we&apos;ll send reset instructions
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg bg-primary-soft p-4 text-sm text-text">
              If this email exists, we&apos;ll send reset instructions.
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
              {authError && (
                <p className="text-sm text-error" role="alert">
                  {authError}
                </p>
              )}
              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}

          <Link
            to="/login"
            className="text-sm text-primary font-medium hover:underline text-center"
          >
            Back to login
          </Link>
        </div>
      </AuthLayout>
    </RedirectIfAuthed>
  );
}
