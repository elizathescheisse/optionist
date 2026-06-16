import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/auth/RequireAuth";
import ProjectsRoute from "./routes/ProjectsRoute";
import ProjectRoute from "./routes/ProjectRoute";
import ReviewRoute from "./routes/ReviewRoute";
import HistoryRoute from "./routes/HistoryRoute";
import NotFoundRoute from "./routes/NotFoundRoute";
import LoginRoute from "./routes/auth/LoginRoute";
import SignupRoute from "./routes/auth/SignupRoute";
import OnboardingRoute from "./routes/auth/OnboardingRoute";
import ForgotPasswordRoute from "./routes/auth/ForgotPasswordRoute";
import AppDashboardRoute from "./routes/AppDashboardRoute";
import SettingsRoute from "./routes/SettingsRoute";
import DesignSystemRoute from "./routes/DesignSystemRoute";
import PresentRoute from "./routes/PresentRoute";
import { ToastProvider } from "./context/ToastContext";
import StorageQuotaWatcher from "./components/shared/StorageQuotaWatcher";
import DesignSystemModal from "./components/shared/DesignSystemModal";

// Layout routes: render a shell with <Outlet/> so the shell stays mounted while
// navigating between its child routes. AppShell/AppLayout take `children`, and
// <Outlet/> is passed as that child — neither component needed changes.
function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function SidebarLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StorageQuotaWatcher />
      <DesignSystemModal />
      <BrowserRouter>
        <Routes>
          {/* Public auth routes (full screen; GuestOnly handles redirects) */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />

          {/* Full-screen presentation mode (protected, no chrome) */}
          <Route
            path="/present/:decisionId"
            element={
              <RequireAuth>
                <PresentRoute />
              </RequireAuth>
            }
          />

          {/* New sidebar routes (protected, AppLayout) */}
          <Route
            element={
              <RequireAuth>
                <SidebarLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<AppDashboardRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
            <Route path="/design-system" element={<DesignSystemRoute />} />
          </Route>

          {/* Existing routes (protected, original AppShell — unchanged) */}
          <Route
            element={
              <RequireAuth>
                <AppShellLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<ProjectsRoute />} />
            <Route path="/projects/:projectId" element={<ProjectRoute />} />
            <Route
              path="/projects/:projectId/review/:decisionId"
              element={<ReviewRoute />}
            />
            <Route path="/history" element={<HistoryRoute />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
