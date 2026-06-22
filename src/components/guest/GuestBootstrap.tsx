import { Outlet } from "react-router-dom";
import GuestNotice from "./GuestNotice";
import GuestStorageRecovery from "./GuestStorageRecovery";

export default function GuestBootstrap() {
  // Full-height column so the guest banner and the app layout *share* the
  // screen height. Without this, the banner stacks on top of a layout that
  // still demands the full viewport, pushing the sidebar's log out button below
  // the fold. flex-1 + min-h-0 lets the app fill whatever the banner leaves.
  return (
    <div className="h-full flex flex-col">
      <GuestStorageRecovery />
      <GuestNotice />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
