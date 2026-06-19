import { Outlet } from "react-router-dom";
import GuestNotice from "./GuestNotice";
import GuestStorageRecovery from "./GuestStorageRecovery";

export default function GuestBootstrap() {
  return (
    <>
      <GuestStorageRecovery />
      <GuestNotice />
      <Outlet />
    </>
  );
}
