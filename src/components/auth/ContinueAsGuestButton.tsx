import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../ui/Button";

export default function ContinueAsGuestButton() {
  const navigate = useNavigate();
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);

  function handleClick() {
    enterGuestMode();
    navigate("/dashboard");
  }

  return (
    <Button variant="ghost" className="w-full" onClick={handleClick}>
      Continue as Guest
    </Button>
  );
}
