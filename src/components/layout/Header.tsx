import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const onProjectsPage = location.pathname === "/";

  return (
    <header className="border-b border-gray-200 bg-white px-6 h-12 flex items-center gap-4 shrink-0">
      <Link to="/" className="font-semibold text-gray-900 tracking-tight hover:text-gray-600 transition-colors">
        Decision Compare
      </Link>
      {!onProjectsPage && (
        <span className="text-gray-300 text-sm select-none">/</span>
      )}
    </header>
  );
}
