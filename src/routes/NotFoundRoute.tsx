import { Link } from "react-router-dom";

export default function NotFoundRoute() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-text-muted">Page not found.</p>
      <Link to="/dashboard" className="text-sm text-text underline underline-offset-2 hover:text-text-muted">
        Back to dashboard
      </Link>
    </div>
  );
}
