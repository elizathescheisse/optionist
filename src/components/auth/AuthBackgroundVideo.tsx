import { useEffect, useRef } from "react";

export default function AuthBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch(() => {
      // Autoplay blocked in strict browsers — first frame still shows when loaded
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-85 motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/auth/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-auth-panel/90" />
    </div>
  );
}
