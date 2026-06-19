import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/auth/RequireAuth";
import HomeRedirect from "./routes/HomeRedirect";
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
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />

          <Route
            path="/present/:decisionId"
            element={
              <RequireAuth>
                <PresentRoute />
              </RequireAuth>
            }
          />

          <Route
            element={
              <RequireAuth>
                <SidebarLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<AppDashboardRoute />} />
            <Route path="/projects" element={<ProjectsRoute />} />
            <Route path="/projects/:projectId" element={<ProjectRoute />} />
            <Route
              path="/projects/:projectId/review/:decisionId"
              element={<ReviewRoute />}
            />
            <Route path="/history" element={<HistoryRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
            <Route path="/design-system" element={<DesignSystemRoute />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
