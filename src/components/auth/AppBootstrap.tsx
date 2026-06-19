import { useAuthStore } from "../../store/useAuthStore";
import AuthenticatedBootstrap from "./AuthenticatedBootstrap";
import GuestBootstrap from "../guest/GuestBootstrap";

export default function AppBootstrap() {
  const isGuest = useAuthStore((s) => s.isGuest);

  if (isGuest()) {
    return <GuestBootstrap />;
  }

  return <AuthenticatedBootstrap />;
}
