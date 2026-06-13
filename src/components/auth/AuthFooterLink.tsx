import { Link } from "react-router-dom";

type Props = {
  prompt?: string;
  linkText?: string;
  to?: string;
};

export default function AuthFooterLink({
  prompt = "Don't have an account?",
  linkText = "Sign up",
  to = "/signup",
}: Props) {
  return (
    <p className="text-sm text-text-muted text-center pt-2 border-t border-app-border mt-2">
      {prompt}{" "}
      <Link
        to={to}
        className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {linkText}
      </Link>
    </p>
  );
}
