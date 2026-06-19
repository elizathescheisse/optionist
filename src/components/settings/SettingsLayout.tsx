import { Outlet } from "react-router-dom";
import PageHeader from "../ui/PageHeader";
import SettingsNav from "./SettingsNav";

export default function SettingsLayout() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeader
          title="Settings"
          subtitle="Manage your account, workspace, and Optionist preferences."
        />

        <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
          <SettingsNav />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
