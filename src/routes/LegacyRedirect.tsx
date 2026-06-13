import { Navigate, useLocation } from "react-router-dom";

/** Redirect legacy paths to /app/* equivalents */
export function LegacyRedirect() {
  const location = useLocation();
  const path = location.pathname.replace(/^\/projects/, "/app/projects");
  return <Navigate to={path + location.search} replace />;
}

export function RootRedirect() {
  return <Navigate to="/app" replace />;
}
