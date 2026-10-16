import { useEffect, useState } from "react";

interface BrandIntroProps {
  onComplete: () => void;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Classic dwell timer: 2.2s for letter reveals and signature flourish,
    // followed by a smooth, unbroken 0.9s cross-dissolve into the classic hero
    const timer = setTimeout(() => {
      triggerDissolve();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const triggerDissolve = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 900);
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
      <div className={`brand-intro-content ${isFadingOut ? "is-fading-out" : ""}`}>
        {/* Couture Calligraphic Signature Flourish */}
        <div className="brand-intro-signature">
          <svg
            className="brand-signature-svg"
            viewBox="0 0 280 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Elegant fluid ink stroke that writes itself out */}
            <path
              d="M20 52 C45 15, 75 10, 85 35 C95 60, 60 72, 52 50 C44 26, 95 18, 140 38 C175 52, 210 25, 235 32 C255 38, 268 48, 275 42"
              stroke="#1b100c"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="signature-stroke"
            />
            {/* Fine accent cross-stroke */}
            <path
              d="M70 38 C105 34, 160 32, 195 36"
              stroke="#c59868"
              strokeWidth="1.2"
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
                    animationDelay: `${0.18 + index * 0.045}s`,
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
