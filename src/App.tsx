import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import SettingsLayout from "./components/settings/SettingsLayout";
import ProfileSettingsRoute from "./routes/settings/ProfileSettingsRoute";
import AccountSettingsRoute from "./routes/settings/AccountSettingsRoute";
import PreferencesSettingsRoute from "./routes/settings/PreferencesSettingsRoute";
import NotificationsSettingsRoute from "./routes/settings/NotificationsSettingsRoute";
import WorkspaceSettingsRoute from "./routes/settings/WorkspaceSettingsRoute";
import MembersSettingsRoute from "./routes/settings/MembersSettingsRoute";
import RolesSettingsRoute from "./routes/settings/RolesSettingsRoute";
import ProjectsSettingsRoute from "./routes/settings/ProjectsSettingsRoute";
import ThemeSettingsRoute from "./routes/settings/ThemeSettingsRoute";
import DesignDefaultsSettingsRoute from "./routes/settings/DesignDefaultsSettingsRoute";
import ExportSettingsRoute from "./routes/settings/ExportSettingsRoute";
import IntegrationsSettingsRoute from "./routes/settings/IntegrationsSettingsRoute";
import OrganizationSettingsRoute from "./routes/settings/OrganizationSettingsRoute";
import BillingSettingsRoute from "./routes/settings/BillingSettingsRoute";
import SecuritySettingsRoute from "./routes/settings/SecuritySettingsRoute";
import DataPrivacySettingsRoute from "./routes/settings/DataPrivacySettingsRoute";
import DangerZoneSettingsRoute from "./routes/settings/DangerZoneSettingsRoute";
import PresentRoute from "./routes/PresentRoute";
import { ToastProvider } from "./context/ToastContext";
import StorageQuotaWatcher from "./components/shared/StorageQuotaWatcher";
import GuestLimitWatcher from "./components/guest/GuestLimitWatcher";
import GuestMigrationModal from "./components/guest/GuestMigrationModal";
import DesignSystemModal from "./components/shared/DesignSystemModal";
import AuthThemeBoundary from "./components/auth/AuthThemeBoundary";

function AuthThemeLayout() {
  return (
    <AuthThemeBoundary>
      <Outlet />
    </AuthThemeBoundary>
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
      <GuestLimitWatcher />
      <DesignSystemModal />
      <BrowserRouter>
        <GuestMigrationModal />
        <Routes>
          <Route element={<AuthThemeLayout />}>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup" element={<SignupRoute />} />
            <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          </Route>
          <Route
            path="/auth/callback"
            element={
              <AuthThemeBoundary>
                <AuthCallbackRoute />
              </AuthThemeBoundary>
            }
          />

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
                  <AuthThemeBoundary>
                    <ProfileSetupRoute />
                  </AuthThemeBoundary>
                </RequireAuthenticated>
              }
            />
            <Route
              path="/onboarding"
              element={
                <RequireAuthenticated>
                  <AuthThemeBoundary>
                    <OnboardingRoute />
                  </AuthThemeBoundary>
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
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfileSettingsRoute />} />
                <Route path="account" element={<AccountSettingsRoute />} />
                <Route path="preferences" element={<PreferencesSettingsRoute />} />
                <Route path="notifications" element={<NotificationsSettingsRoute />} />
                <Route path="workspace" element={<WorkspaceSettingsRoute />} />
                <Route path="members" element={<MembersSettingsRoute />} />
                <Route path="roles" element={<RolesSettingsRoute />} />
                <Route path="projects" element={<ProjectsSettingsRoute />} />
                <Route path="theme" element={<ThemeSettingsRoute />} />
                <Route path="design-defaults" element={<DesignDefaultsSettingsRoute />} />
                <Route path="export" element={<ExportSettingsRoute />} />
                <Route path="integrations" element={<IntegrationsSettingsRoute />} />
                <Route path="organization" element={<OrganizationSettingsRoute />} />
                <Route path="billing" element={<BillingSettingsRoute />} />
                <Route path="security" element={<SecuritySettingsRoute />} />
                <Route path="data-privacy" element={<DataPrivacySettingsRoute />} />
                <Route path="danger-zone" element={<DangerZoneSettingsRoute />} />
              </Route>
              <Route path="*" element={<NotFoundRoute />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
