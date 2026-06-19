import { Link } from "react-router-dom";
import AuthBackgroundVideo from "./AuthBackgroundVideo";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-full grid lg:grid-cols-2">
      {/* Left — brand storytelling */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-auth-panel text-white overflow-hidden min-h-full">
        <AuthBackgroundVideo />

        <div className="relative z-10">
          <Link to="/login" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-sm font-bold">
              O
            </span>
            <span className="font-semibold text-lg tracking-tight">Optionist</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-6 max-w-md -translate-y-[50px]">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            Compare design directions. Capture decisions. Move forward with confidence.
          </h1>
          <ul className="flex flex-col gap-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">●</span>
              Present multiple UI options side by side
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60 mt-0.5">●</span>
              Add rationale, notes, and stakeholder feedback
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/40 mt-0.5">●</span>
              Capture decisions in one clean workspace
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          A premium prototype review room for design teams.
        </p>
      </div>

      {/* Right — form area */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-surface min-h-full">
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold">
            O
          </span>
          <span className="font-semibold text-text">Optionist</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
