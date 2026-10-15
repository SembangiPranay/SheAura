import { useEffect, useState } from "react";

interface BrandIntroProps {
  onComplete: () => void;
  onStartDissolve?: () => void;
}

export default function BrandIntro({ onComplete, onStartDissolve }: BrandIntroProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Elegant dwell timer: 2.3s for letter reveals and signature flourish,
    // followed by a smooth, unbroken 1.1s cinematic dissolve into the storefront
    const timer = setTimeout(() => {
      triggerDissolve();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const triggerDissolve = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    onStartDissolve?.();
    setTimeout(() => {
      onComplete();
    }, 1100);
  };

  const letters = ["S", "H", "E", "’", "A", "U", "R", "A"];

  return (
    <div
      className={`brand-intro-curtain ${isFadingOut ? "is-fading-out" : ""}`}
      onClick={triggerDissolve}
      role="presentation"
      aria-hidden="true"
      title="Click anywhere to proceed directly"
    >
      {/* Centerpiece Monogram & Typography Animation */}
      <div className={`brand-intro-content ${isFadingOut ? "is-fading-out" : ""}`}>
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
                    animationDelay: `${0.16 + index * 0.045}s`,
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
      </div>
    </div>
  );
}
