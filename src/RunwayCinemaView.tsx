import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Icon, Product, Reel } from "./App";
import { photos } from "./lib/catalog";

interface RunwayCinemaViewProps {
  reels: Reel[];
  catalog?: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAddBag: (product: Product) => void;
  cartCount: number;
}

export default function RunwayCinemaView({
  reels,
  catalog,
  onBack,
  onSelectProduct,
  onAddBag,
  cartCount,
}: RunwayCinemaViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("0:20");
  const [addedToast, setAddedToast] = useState(false);
  const [filmstripOpen, setFilmstripOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [transitioning, setTransitioning] = useState(false);

  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Filtered reels list
  const filteredReels = useMemo(() => {
    if (categoryFilter === "all") return reels;
    return reels.filter((r) => r.category === categoryFilter);
  }, [reels, categoryFilter]);

  const activeReel = filteredReels[activeIndex] || filteredReels[0] || reels[0];
  const nextReel = filteredReels[(activeIndex + 1) % filteredReels.length];

  // Match corresponding product from catalog
  const matchingProduct: Product = useMemo(() => {
    if (catalog && catalog.length > 0) {
      const match = catalog.find(
        (p) =>
          p.name === activeReel.productName ||
          p.category.toLowerCase().includes(activeReel.category)
      );
      if (match) return match;
    }
    return {
      id: "prod-default",
      name: activeReel.productName,
      category: activeReel.category === "blush" ? "Blush" : activeReel.category === "lips" ? "Lip colour" : "Highlighter",
      price: activeReel.productPrice || "₹1,099.00",
      image: activeReel.productImage || photos.lipstick,
      still: photos.blushStill,
      campaign: photos.model,
      description: activeReel.quote,
      finish: activeReel.subtitle,
      mood: activeReel.title,
      tone: activeReel.tone || "#a81920",
      tag: activeReel.productTag || "Icon",
    } as Product;
  }, [catalog, activeReel]);

  // Jump to specific index with smooth animation
  const jumpTo = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setProgress(0);
        setTransitioning(false);
      }, 180);
    },
    [activeIndex]
  );

  const goNext = useCallback(() => {
    jumpTo((activeIndex + 1) % filteredReels.length);
  }, [activeIndex, filteredReels.length, jumpTo]);

  const goPrev = useCallback(() => {
    jumpTo((activeIndex - 1 + filteredReels.length) % filteredReels.length);
  }, [activeIndex, filteredReels.length, jumpTo]);

  // Handle video progress & autonomous scroll
  const handleTimeUpdate = () => {
    const v = activeVideoRef.current;
    if (!v || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    setProgress(pct);

    const curM = Math.floor(v.currentTime / 60);
    const curS = Math.floor(v.currentTime % 60);
    setCurrentTimeStr(`${curM}:${String(curS).padStart(2, "0")}`);

    const durM = Math.floor(v.duration / 60);
    const durS = Math.floor(v.duration % 60);
    setDurationStr(`${durM}:${String(durS).padStart(2, "0")}`);
  };

  // When a video reaches the end -> AUTO-SCROLL to next video!
  const handleVideoEnded = () => {
    if (autoAdvance) {
      goNext();
    } else {
      // Loop current video
      if (activeVideoRef.current) {
        activeVideoRef.current.currentTime = 0;
        activeVideoRef.current.play().catch(() => {});
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => {
          if (activeVideoRef.current) {
            if (p) activeVideoRef.current.pause();
            else activeVideoRef.current.play().catch(() => {});
          }
          return !p;
        });
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((m) => !m);
      } else if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onBack]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) {
      goNext(); // Swiped up -> next reel
    } else if (diff < -50) {
      goPrev(); // Swiped down -> prev reel
    }
    touchStartY.current = null;
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (!activeVideoRef.current) return;
    if (isPlaying) {
      activeVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      activeVideoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Unmute toggle
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Add to cart handler
  const handleAddToCart = () => {
    onAddBag(matchingProduct);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  return (
    <div
      className="runway-cinema-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ambient lighting */}
      <div
        className="runway-ambient-halo"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${matchingProduct.tone || "#a81920"}33 0%, rgba(12, 6, 4, 0.95) 75%)`,
        }}
      />

      {/* Top Header Bar */}
      <header className="runway-top-header">
        <div className="runway-header-left">
          <button className="runway-exit-btn" onClick={onBack} title="Return to Storefront">
            <Icon name="arrow" className="rotate-180" />
            <span>Storefront</span>
          </button>
          <div className="runway-brand-badge">
            <span className="runway-pulse-dot" />
            <b>SHE’AURA</b>
            <span className="runway-tagline">HAUTE RUNWAY CINEMA · 20 LOOKS</span>
          </div>
        </div>

        {/* Center: Autonomous Self-Scroll Control */}
        <div className="runway-header-center">
          <button
            className={`runway-autoscroll-toggle ${autoAdvance ? "active" : ""}`}
            onClick={() => setAutoAdvance(!autoAdvance)}
            title={autoAdvance ? "Auto-scroll is ON. Videos advance themselves automatically." : "Auto-scroll paused. Click to resume hands-free mode."}
          >
            <span className="autoscroll-indicator">
              <span className="autoscroll-pulse" />
            </span>
            <span className="autoscroll-text">
              {autoAdvance ? "AUTO-SCROLL: ACTIVE" : "AUTO-SCROLL: PAUSED"}
            </span>
          </button>
          <span className="runway-counter">
            {String(activeIndex + 1).padStart(2, "0")} / {String(filteredReels.length).padStart(2, "0")}
          </span>
        </div>

        <div className="runway-header-right">
          <button
            className={`runway-sound-pill ${!isMuted ? "sound-on" : ""}`}
            onClick={toggleMute}
            aria-label={isMuted ? "Audio muted. Click to enable sound." : "Sound live. Click to mute."}
          >
            <div className={`runway-eq-bars ${!isMuted && isPlaying ? "playing" : ""}`}>
              <span /><span /><span /><span />
            </div>
            <span>{isMuted ? "MUTED" : "LIVE AUDIO"}</span>
          </button>

          <button
            className="runway-bag-btn"
            onClick={() => onSelectProduct(matchingProduct)}
            title="View Shopping Bag"
          >
            <Icon name="bag" />
            <span className="bag-badge">{cartCount}</span>
          </button>

          <button
            className="runway-close-btn"
            onClick={onBack}
            aria-label="Exit Cinema"
            title="Exit Cinema (Esc)"
          >
            <Icon name="close" />
          </button>
        </div>
      </header>

      {/* Main Cinema Theater Stage */}
      <main className="runway-main-stage">
        {/* Navigation arrow buttons (Desktop / Tablet) */}
        <button
          className="runway-nav-arrow runway-prev-arrow"
          onClick={goPrev}
          aria-label="Previous look (Up)"
          title="Previous look"
        >
          <Icon name="arrow" />
        </button>

        <button
          className="runway-nav-arrow runway-next-arrow"
          onClick={goNext}
          aria-label="Next look (Down)"
          title="Next look"
        >
          <Icon name="arrow" />
        </button>

        {/* The 9:16 Authentic Vertical Phone Frame */}
        <div className={`runway-theater-bezel ${transitioning ? "transitioning" : ""}`}>
          {/* Top Story Progress Bar */}
          <div className="runway-story-progress">
            {filteredReels.map((_, idx) => (
              <div
                key={idx}
                className={`story-bar-segment ${
                  idx < activeIndex ? "completed" : idx === activeIndex ? "active" : ""
                }`}
                onClick={() => jumpTo(idx)}
                title={`Jump to Look ${idx + 1}`}
              >
                <div
                  className="story-bar-fill"
                  style={{
                    width:
                      idx < activeIndex
                        ? "100%"
                        : idx === activeIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Video Player */}
          <div className="runway-video-container" onClick={togglePlay}>
            <video
              ref={activeVideoRef}
              key={activeReel.videoUrl}
              src={activeReel.videoUrl}
              poster={activeReel.poster}
              playsInline
              autoPlay
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="runway-video-element"
            />

            {/* Hidden preloader for the NEXT video for zero buffering delay */}
            {nextReel && (
              <video
                src={nextReel.videoUrl}
                preload="auto"
                muted
                style={{ display: "none" }}
              />
            )}

            {/* Play/Pause overlay indicator */}
            {!isPlaying && (
              <div className="runway-pause-scrim">
                <div className="runway-pause-icon">
                  <Icon name="play" />
                </div>
                <span>PAUSED · TAP TO RESUME</span>
              </div>
            )}

            {/* Unmute prompt banner (when muted) */}
            {isMuted && (
              <div
                className="runway-unmute-prompt"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                <Icon name="volumeX" />
                <span>SOUND MUTED · TAP TO UNMUTE RUNWAY AUDIO</span>
              </div>
            )}

            {/* In-Video Story Information Overlay */}
            <div className="runway-video-overlay-info">
              <div className="overlay-eyebrow">
                <span className="overlay-step-badge">{activeReel.step}</span>
                <span className="overlay-views-pill">{activeReel.views} watches</span>
              </div>
              <h2 className="overlay-title">{activeReel.title}</h2>
              <p className="overlay-quote">“{activeReel.quote}”</p>
              <div className="overlay-handle-row">
                <img src={activeReel.avatar} alt="" className="overlay-avatar" />
                <span>{activeReel.handle}</span>
                <a
                  href={activeReel.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="overlay-ig-badge"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon name="instagram" /> Instagram <Icon name="external" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Video Progress Scrub Line */}
          <div className="runway-bottom-scrubber">
            <span className="scrubber-time">{currentTimeStr}</span>
            <div
              className="scrubber-track"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                if (activeVideoRef.current && activeVideoRef.current.duration) {
                  activeVideoRef.current.currentTime = pct * activeVideoRef.current.duration;
                }
              }}
            >
              <div className="scrubber-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="scrubber-time">{durationStr}</span>
          </div>
        </div>

        {/* Floating Side Editorial Atelier (Product & Checkout) */}
        <aside className="runway-product-atelier">
          <div className="atelier-header">
            <span className="atelier-eyebrow">
              <Icon name="sparkle" />
              <span>FEATURED IN THIS LOOK</span>
            </span>
            <span className="atelier-step-label">{activeReel.step}</span>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-top">
              <div
                className="atelier-thumb-wrap"
                onClick={() => {
                  onSelectProduct(matchingProduct);
                  window.scrollTo(0, 0);
                }}
                title={`Explore ${matchingProduct.name}`}
              >
                <img
                  src={activeReel.productImage || matchingProduct.image}
                  alt={matchingProduct.name}
                  className="atelier-thumb"
                />
                <span className="atelier-thumb-tag">{matchingProduct.tag || "Couture"}</span>
              </div>

              <div className="atelier-card-meta">
                <span className="atelier-category">{matchingProduct.category}</span>
                <h3
                  className="atelier-product-title"
                  onClick={() => {
                    onSelectProduct(matchingProduct);
                    window.scrollTo(0, 0);
                  }}
                >
                  {matchingProduct.name}
                </h3>
                <div className="atelier-swatch-row">
                  <span
                    className="atelier-swatch-dot"
                    style={{ backgroundColor: activeReel.tone || matchingProduct.tone || "#a81920" }}
                  />
                  <span className="atelier-finish-name">{matchingProduct.finish}</span>
                </div>
                <div className="atelier-price-row">
                  <b>{activeReel.productPrice || matchingProduct.price}</b>
                  <small>Taxes included</small>
                </div>
              </div>
            </div>

            <p className="atelier-desc">
              {matchingProduct.description || activeReel.quote}
            </p>

            <div className="atelier-attributes">
              <div>
                <span>Wear</span>
                <b>Buildable</b>
              </div>
              <div>
                <span>Standard</span>
                <b>Botanical</b>
              </div>
              <div>
                <span>Finish</span>
                <b>{matchingProduct.finish.split(" ")[0]}</b>
              </div>
            </div>

            <div className="atelier-actions">
              <button
                className={`atelier-add-bag-btn ${addedToast ? "added" : ""}`}
                onClick={handleAddToCart}
              >
                {addedToast ? "Added to Bag ✓" : `Quick Add to Bag — ${activeReel.productPrice || matchingProduct.price}`}
              </button>

              <button
                className="atelier-details-btn"
                onClick={() => {
                  onSelectProduct(matchingProduct);
                  window.scrollTo(0, 0);
                }}
              >
                <span>Explore Full Formula</span>
                <Icon name="arrow" />
              </button>
            </div>
          </div>

          {/* Quick Lookbook Navigation Pill Row */}
          <div className="atelier-quick-stepper">
            <button className="stepper-pill-btn" onClick={goPrev}>
              <Icon name="arrow" className="rotate-180" />
              <span>Previous Look</span>
            </button>
            <button className="stepper-pill-btn next" onClick={goNext}>
              <span>Next Look</span>
              <Icon name="arrow" />
            </button>
          </div>

          {/* Filmstrip drawer toggle button */}
          <button
            className="atelier-filmstrip-toggle"
            onClick={() => setFilmstripOpen(!filmstripOpen)}
          >
            <span>{filmstripOpen ? "Hide All 20 Looks" : "Explore All 20 Runway Looks"}</span>
            <Icon name="sparkle" />
          </button>
        </aside>
      </main>

      {/* Expandable Bottom 20-Look Runway Filmstrip */}
      <footer className={`runway-filmstrip-drawer ${filmstripOpen ? "open" : ""}`}>
        <div className="filmstrip-drawer-head">
          <div className="drawer-title-row">
            <b>HAUTE RUNWAY LOOKBOOK</b>
            <span>20 LIVE APPLICATION REELS · TAP ANY LOOK TO JUMP</span>
          </div>
          <div className="filmstrip-filter-tabs">
            {[
              { id: "all", label: "All Looks (20)" },
              { id: "blush", label: "Blush" },
              { id: "lips", label: "Lipsticks" },
              { id: "glow", label: "Highlighter & Oil" },
              { id: "routine", label: "GRWM & Routines" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={categoryFilter === tab.id ? "active" : ""}
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setActiveIndex(0);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filmstrip-ribbon-track">
          {filteredReels.map((reel, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={reel.id}
                className={`filmstrip-thumb-card ${isCurrent ? "current" : ""}`}
                onClick={() => {
                  jumpTo(idx);
                  setFilmstripOpen(false);
                }}
              >
                <div className="thumb-media">
                  <img src={reel.poster} alt={reel.title} loading="lazy" />
                  <span className="thumb-num">{String(idx + 1).padStart(2, "0")}</span>
                  <span
                    className="thumb-swatch-dot"
                    style={{ backgroundColor: reel.tone || "#a81920" }}
                  />
                  {isCurrent && (
                    <div className="thumb-playing-wave">
                      <span /><span /><span />
                    </div>
                  )}
                </div>
                <div className="thumb-info">
                  <b>{reel.title}</b>
                  <small>{reel.step}</small>
                </div>
              </button>
            );
          })}
        </div>
      </footer>

      {/* Floating Added-to-Bag Toast */}
      {addedToast && (
        <div className="runway-toast">
          <Icon name="check" />
          <span><b>{matchingProduct.name}</b> added to your bag!</span>
        </div>
      )}
    </div>
  );
}
