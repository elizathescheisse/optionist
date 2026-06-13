import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooterLink from "../../components/auth/AuthFooterLink";
import GuestOnly from "../../components/auth/GuestOnly";
import Button from "../../components/shared/Button";

export default function SignupRoute() {
  const navigate = useNavigate();

  return (
    <GuestOnly>
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-text tracking-tight">Create your account</h1>
              <p className="text-sm text-text-muted">
                Get started with Optionist in a few quick steps
              </p>
            </div>

            <p className="text-sm text-text-muted leading-relaxed text-center">
              We&apos;ll ask a few questions to tailor your workspace, then you&apos;re ready to
              compare design directions.
            </p>

            <Button
              variant="primary"
              className="w-full h-[var(--token-auth-button-height)] rounded-[var(--token-auth-radius-control)]"
              onClick={() => navigate("/onboarding")}
            >
              Get started
            </Button>

            <AuthFooterLink
              prompt="Already have an account?"
              linkText="Sign in"
              to="/login"
            />
          </div>
        </AuthCard>
      </AuthLayout>
    </GuestOnly>
  );
}
