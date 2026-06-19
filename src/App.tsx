import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import RequireAppAccess from "./components/auth/RequireAppAccess";
import RequireAuthenticated from "./components/auth/RequireAuthenticated";
import AppBootstrap from "./components/auth/AppBootstrap";
import HomeRedirect from "./routes/HomeRedirect";
import ProjectsRoute from "./routes/ProjectsRoute";
import ProjectRoute from "./routes/ProjectRoute";
import ReviewRoute from "./routes/ReviewRoute";
import HistoryRoute from "./routes/HistoryRoute";
import NotFoundRoute from "./routes/NotFoundRoute";
import LoginRoute from "./routes/auth/LoginRoute";
import SignupRoute from "./routes/auth/SignupRoute";
import OnboardingRoute from "./routes/auth/OnboardingRoute";
import ProfileSetupRoute from "./routes/auth/ProfileSetupRoute";
import ForgotPasswordRoute from "./routes/auth/ForgotPasswordRoute";
import AuthCallbackRoute from "./routes/auth/AuthCallbackRoute";
import AppDashboardRoute from "./routes/AppDashboardRoute";
import SettingsRoute from "./routes/SettingsRoute";
import DesignSystemRoute from "./routes/DesignSystemRoute";
import PresentRoute from "./routes/PresentRoute";
import { ToastProvider } from "./context/ToastContext";
import StorageQuotaWatcher from "./components/shared/StorageQuotaWatcher";
import GuestLimitWatcher from "./components/guest/GuestLimitWatcher";
import GuestMigrationModal from "./components/guest/GuestMigrationModal";
import DesignSystemModal from "./components/shared/DesignSystemModal";

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
      <GuestLimitWatcher />
      <GuestMigrationModal />
      <DesignSystemModal />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/auth/callback" element={<AuthCallbackRoute />} />

          <Route
            path="/present/:decisionId"
            element={
              <RequireAppAccess>
                <PresentRoute />
              </RequireAppAccess>
            }
          />

          <Route
            element={
              <RequireAppAccess>
                <AppBootstrap />
              </RequireAppAccess>
            }
          >
            <Route
              path="/profile/setup"
              element={
                <RequireAuthenticated>
                  <ProfileSetupRoute />
                </RequireAuthenticated>
              }
            />
            <Route
              path="/onboarding"
              element={
                <RequireAuthenticated>
                  <OnboardingRoute />
                </RequireAuthenticated>
              }
            />

            <Route element={<SidebarLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<AppDashboardRoute />} />
              <Route path="/projects" element={<ProjectsRoute />} />
              <Route path="/projects/:projectId" element={<ProjectRoute />} />
              <Route
                path="/projects/:projectId/review/:decisionId"
                element={<ReviewRoute />}
              />
              <Route path="/history" element={<HistoryRoute />} />
              <Route
                path="/settings"
                element={
                  <RequireAuthenticated>
                    <SettingsRoute />
                  </RequireAuthenticated>
                }
              />
              <Route path="/design-system" element={<DesignSystemRoute />} />
              <Route path="*" element={<NotFoundRoute />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
