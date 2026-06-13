import { useEffect, useRef } from "react";

export default function AuthBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      // Autoplay blocked — first frame still shows when loaded
    });
  }, []);

  return (
    <div className="auth-hero__media" aria-hidden="true">
      <video
        ref={videoRef}
        className="auth-hero__video motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/auth/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="auth-hero__overlay-base" />
      <div className="auth-hero__overlay-vignette" />
      <div className="auth-hero__dots auth-hero__dots--tr" />
      <div className="auth-hero__dots auth-hero__dots--bl" />
      <div className="auth-hero__curve auth-hero__curve--bl" aria-hidden="true">
        <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 100 C 60 40, 120 80, 200 30 S 280 60, 280 20"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
