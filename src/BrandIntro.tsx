import { useState, useEffect, useCallback } from "react";

interface BrandIntroProps {
  onComplete: () => void;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [phase, setPhase] = useState<"drawing" | "revealing" | "settled" | "exiting">("drawing");

  const handleFinish = useCallback(() => {
    if (phase === "exiting") return;
    setPhase("exiting");
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [phase, onComplete]);

  useEffect(() => {
    // Phase 1: Calligraphy flourish / monogram draws (0ms -> 500ms)
    const t1 = setTimeout(() => {
      setPhase("revealing");
    }, 450);

    // Phase 2: Letters finish staggering in and tagline expands (500ms -> 1200ms)
    const t2 = setTimeout(() => {
      setPhase("settled");
    }, 1300);

    // Phase 3: Smooth curtain unveil into the boutique (2200ms)
    const t3 = setTimeout(() => {
      handleFinish();
    }, 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [handleFinish]);

  // Click anywhere, scroll, or press key to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        handleFinish();
      }
    };
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 20) {
        handleFinish();
      }
    };
    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchY - e.changedTouches[0].clientY > 30) {
        handleFinish();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleFinish]);

  const letters = ["S", "H", "E", "’", "A", "U", "R", "A"];

  return (
    <div
      className={`brand-intro-curtain ${phase === "exiting" ? "is-exiting" : ""}`}
      onClick={handleFinish}
      role="dialog"
      aria-modal="true"
      aria-label="She’Aura Brand Entrance"
    >
      <div className="brand-intro-content">
        {/* Couture Calligraphic Signature Flourish */}
        <div className={`brand-intro-signature ${phase !== "drawing" ? "drawn" : ""}`}>
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
                    animationDelay: `${0.35 + index * 0.045}s`,
                  }}
                >
                  {char}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Expanding Golden Hairline Accent */}
        <div className={`brand-intro-hairline ${phase !== "drawing" ? "expanded" : ""}`} />

        {/* Tagline Breathing In with Tracked Micro-Caps */}
        <p className={`brand-intro-tagline ${phase !== "drawing" ? "visible" : ""}`}>
          YOUR AURA · YOUR STORY
        </p>

        {/* Discrete Tap Hint */}
        <span className="brand-intro-skip-hint">
          Click anywhere to enter boutique
        </span>
      </div>
    </div>
  );
}
