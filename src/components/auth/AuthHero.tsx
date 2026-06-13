import { Link } from "react-router-dom";
import AuthBackgroundVideo from "./AuthBackgroundVideo";
import { cn } from "../../utils/cn";

const BULLETS = [
  { color: "text-accent-yellow", text: "Present multiple UI options side by side" },
  { color: "text-accent-pink", text: "Add rationale, notes, and stakeholder feedback" },
  { color: "text-accent-orange", text: "Capture decisions in one clean workspace" },
] as const;

export default function AuthHero() {
  return (
    <div
      className={cn(
        "auth-hero relative flex flex-col justify-between text-white overflow-hidden",
        "px-6 py-8 sm:px-10 lg:px-[var(--token-auth-hero-padding-x)] lg:py-[var(--token-auth-hero-padding-y)]",
        "min-h-[220px] lg:min-h-screen lg:w-1/2 lg:shrink-0",
      )}
    >
      <AuthBackgroundVideo />

      <div className="auth-hero__content">
        <Link
          to="/login"
          className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-sm font-bold border border-white/10">
            O
          </span>
          <span className="font-semibold text-lg tracking-tight">Optionist</span>
        </Link>
      </div>

      <div className="auth-hero__content flex flex-col gap-6 lg:gap-8 max-w-[560px] lg:-translate-y-8 mt-6 lg:mt-0">
        <h1 className="auth-hero__headline text-2xl sm:text-3xl lg:text-[clamp(2rem,3vw,2.75rem)]">
          Compare design directions.
          <br />
          Capture decisions.
          <br />
          Move forward with confidence.
        </h1>
        <ul className="hidden lg:flex flex-col gap-4 text-[15px] text-white/85">
          {BULLETS.map((b) => (
            <li key={b.text} className="flex items-start gap-3">
              <span className={cn("mt-1.5 text-xs leading-none", b.color)} aria-hidden>
                ●
              </span>
              {b.text}
            </li>
          ))}
        </ul>
      </div>

      <p className="auth-hero__content text-sm text-white/50 max-w-md hidden lg:block">
        A premium prototype review room for design teams.
      </p>
    </div>
  );
}
