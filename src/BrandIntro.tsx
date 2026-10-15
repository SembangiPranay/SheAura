import { useEffect, useState, useRef } from "react";

interface BrandIntroProps {
  onComplete: () => void;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Enforce smooth 1.0 playback rate on the 2X master edit
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }

    // Auto-proceed smoothly after 5 seconds if not clicked
    const timer = setTimeout(() => {
      handleEnter();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 700);
  };

  const letters = ["S", "H", "E", "’", "A", "U", "R", "A"];

  return (
    <div
      className={`brand-intro-curtain ${isExiting ? "is-exiting" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="She'Aura Haute Maison Entrance"
    >
      {/* 2X Master Runway Video Backdrop */}
      <video
        ref={videoRef}
        className="brand-intro-video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/reels/sheaura-master-runway-wall.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Vignette Overlay */}
      <div className="brand-intro-overlay" />

      {/* Centerpiece Monogram & Typography Animation */}
      <div className="brand-intro-content">
        {/* Subtle Couture Badge */}
        <div className="brand-intro-eyebrow-pill">
          <span className="intro-pulse-dot" />
          <span>HAUTE MAISON ENTRANCE</span>
        </div>

        {/* Couture Calligraphic Signature Flourish */}
        <div className="brand-intro-signature">
          <svg
            className="brand-signature-svg"
            viewBox="0 0 280 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 52 C45 15, 75 10, 85 35 C95 60, 60 72, 52 50 C44 26, 95 18, 140 38 C175 52, 210 25, 235 32 C255 38, 268 48, 275 42"
              stroke="#dfb895"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="signature-stroke"
            />
            <path
              d="M70 38 C105 34, 160 32, 195 36"
              stroke="#f1e0cf"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="signature-accent-stroke"
            />
          </svg>
        </div>

        {/* Sculpted Editorial Serif Wordmark with Letter-by-Letter Stagger Reveal */}
        <div className="brand-intro-wordmark-wrap">
          <h1 className="brand-intro-wordmark">
            {letters.map((char, index) => (
              <span key={index} className="char-mask">
                <span
                  className="char-glyph"
                  style={{
                    animationDelay: `${0.18 + index * 0.05}s`,
                  }}
                >
                  {char}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Expanding Golden Hairline Accent */}
        <div className="brand-intro-hairline" />

        {/* Tagline Breathing In with Tracked Micro-Caps */}
        <p className="brand-intro-tagline">
          YOUR AURA · YOUR STORY
        </p>

        {/* Enter Atelier Interactive Pill */}
        <button
          type="button"
          className="brand-intro-enter-btn"
          onClick={handleEnter}
          aria-label="Enter She'Aura Storefront"
        >
          <span>Enter Atelier</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
