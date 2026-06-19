import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import RedirectIfAuthed from "../../components/auth/RedirectIfAuthed";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";

export default function ForgotPasswordRoute() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
              <Button type="submit" variant="primary" className="w-full">
                Send reset link
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
