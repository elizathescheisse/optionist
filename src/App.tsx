import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import RequireAuth from "./components/auth/RequireAuth";
import GuestOnly from "./components/auth/GuestOnly";
import AppLayout from "./components/layout/AppLayout";
import LoginRoute from "./routes/auth/LoginRoute";
import SignupRoute from "./routes/auth/SignupRoute";
import ForgotPasswordRoute from "./routes/auth/ForgotPasswordRoute";
import OnboardingRoute from "./routes/auth/OnboardingRoute";
import AppDashboardRoute from "./routes/AppDashboardRoute";
import ProjectsRoute from "./routes/ProjectsRoute";
import ProjectRoute from "./routes/ProjectRoute";
import ComparisonRoute from "./routes/ComparisonRoute";
import PresentRoute from "./routes/PresentRoute";
import ReviewRoute from "./routes/ReviewRoute";
import HistoryRoute from "./routes/HistoryRoute";
import DesignSystemRoute from "./routes/DesignSystemRoute";
import SettingsRoute from "./routes/SettingsRoute";
import NotFoundRoute from "./routes/NotFoundRoute";
import { LegacyRedirect, RootRedirect } from "./routes/LegacyRedirect";

function AppLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route
            path="/onboarding"
            element={
              <GuestOnly>
                <OnboardingRoute />
              </GuestOnly>
            }
          />

          {/* Protected app shell routes (sidebar layout) */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayoutRoute />
              </RequireAuth>
            }
          >
            <Route index element={<AppDashboardRoute />} />
            <Route path="projects" element={<ProjectsRoute />} />
            <Route path="design-system" element={<DesignSystemRoute />} />
            <Route path="settings" element={<SettingsRoute />} />
            <Route path="history" element={<HistoryRoute />} />
          </Route>

          {/* Protected workspace routes (full workspace shell) */}
          <Route
            path="/app/projects/:projectId"
            element={
              <RequireAuth>
                <ProjectRoute />
              </RequireAuth>
            }
          />
          <Route
            path="/app/projects/:projectId/review/:decisionId"
            element={
              <RequireAuth>
                <ReviewRoute />
              </RequireAuth>
            }
          />
          <Route
            path="/app/comparisons/:comparisonId"
            element={
              <RequireAuth>
                <ComparisonRoute />
              </RequireAuth>
            }
          />
          <Route
            path="/app/comparisons/:comparisonId/present"
            element={
              <RequireAuth>
                <PresentRoute />
              </RequireAuth>
            }
          />

          {/* Legacy redirects */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/projects/*" element={<LegacyRedirect />} />
          <Route path="/history" element={<Navigate to="/app/history" replace />} />

          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
