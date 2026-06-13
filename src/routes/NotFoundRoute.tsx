import { Link } from "react-router-dom";

export default function NotFoundRoute() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-3 bg-bg">
      <p className="text-sm text-text-muted">Page not found.</p>
      <Link
        to="/app"
        className="text-sm text-primary font-medium hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
