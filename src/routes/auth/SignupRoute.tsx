import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GuestOnly from "../../components/auth/GuestOnly";
import Button from "../../components/shared/Button";

export default function SignupRoute() {
  const navigate = useNavigate();

  return (
    <GuestOnly>
      <AuthLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Create your account</h1>
            <p className="text-sm text-text-muted mt-1">
              Get started with Optionist in a few quick steps
            </p>
          </div>

          <p className="text-sm text-text-muted leading-relaxed">
            We&apos;ll ask a few questions to tailor your workspace, then you&apos;re
            ready to compare design directions.
          </p>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate("/onboarding")}
          >
            Get started
          </Button>

          <p className="text-sm text-text-soft text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GuestOnly>
  );
}
