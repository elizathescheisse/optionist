import { Link } from "react-router-dom";

export default function NotFoundRoute() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-gray-500">Page not found.</p>
      <Link to="/" className="text-sm text-gray-900 underline underline-offset-2 hover:text-gray-600">
        Back to projects
      </Link>
    </div>
  );
}
