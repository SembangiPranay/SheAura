import { useState, useEffect, useCallback } from "react";

interface BrandIntroProps {
  onStartUnveil?: () => void;
  onComplete: () => void;
}

export default function BrandIntro({ onStartUnveil, onComplete }: BrandIntroProps) {
  const [phase, setPhase] = useState<"drawing" | "revealing" | "settled" | "unveiling">("drawing");

  const startUnveiling = useCallback(() => {
    if (phase === "unveiling") return;
    setPhase("unveiling");
    if (onStartUnveil) {
      onStartUnveil();
    }
    setTimeout(() => {
      onComplete();
    }, 950);
  }, [phase, onStartUnveil, onComplete]);

  useEffect(() => {
    // Stage 1: Calligraphy flourish ink path writes smoothly (0ms -> 420ms)
    const t1 = setTimeout(() => {
      setPhase("revealing");
    }, 420);

    // Stage 2: Letter-by-letter glyphs and golden hairline breathe in (420ms -> 1180ms)
    const t2 = setTimeout(() => {
      setPhase("settled");
    }, 1180);

    // Stage 3: Natural poise pause, then automatically & cleanly glides open into hero (1850ms)
    const t3 = setTimeout(() => {
      startUnveiling();
    }, 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [startUnveiling]);

  // Subtle keyboard escape for instant bypass if desired
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startUnveiling();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startUnveiling]);

  const letters = ["S", "H", "E", "’", "A", "U", "R", "A"];

  return (
    <div
      className={`brand-intro-curtain ${phase === "unveiling" ? "is-exiting" : ""}`}
      aria-hidden={phase === "unveiling"}
      role="presentation"
    >
      <div className={`brand-intro-content ${phase === "unveiling" ? "is-exiting-content" : ""}`}>
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
                    animationDelay: `${0.32 + index * 0.045}s`,
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
      </div>
    </div>
  );
}
