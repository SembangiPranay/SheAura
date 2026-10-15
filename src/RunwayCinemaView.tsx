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
  // Modes: "dual-kinetic" (One column scrolls up, another scrolls down in a single video edit) OR "solo-theater"
  const [viewMode, setViewMode] = useState<"dual-kinetic" | "solo-theater">("dual-kinetic");

  // Kinetic Multi-Column state
  const [columnCount, setColumnCount] = useState<2 | 4 | 5>(4); // Defaults to 4 columns as requested
  const [editModeSource, setEditModeSource] = useState<"interactive-wall" | "rendered-video">("interactive-wall");
  const [isKineticPlaying, setIsKineticPlaying] = useState(true);
  const [kineticSpeed, setKineticSpeed] = useState<"1x" | "1.5x" | "2x">("1x");
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || "reel-01");

  // Solo Theater state
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

  // Current active reel (shared across both modes)
  const activeReel = useMemo(() => {
    if (viewMode === "dual-kinetic") {
      return reels.find((r) => r.id === activeReelId) || reels[0];
    }
    return filteredReels[activeIndex] || filteredReels[0] || reels[0];
  }, [viewMode, activeReelId, activeIndex, filteredReels, reels]);

  const nextReel = filteredReels[(activeIndex + 1) % filteredReels.length];

  // Distribute all 20 reels dynamically across 2, 4, or 5 columns
  // With 4 columns: 5 reels per column
  // With 5 columns: 4 reels per column
  // With 2 columns: 10 reels per column
  const kineticColumns = useMemo(() => {
    const cols: Reel[][] = Array.from({ length: columnCount }, () => []);
    reels.forEach((reel, idx) => {
      cols[idx % columnCount].push(reel);
    });
    return cols;
  }, [reels, columnCount]);

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
      category: activeReel.category === "blush" ? "Blush" : activeReel.category === "lips" ? "Lip colour" : activeReel.category === "complexion" ? "Complexion" : activeReel.category === "collection" ? "Collection" : "Highlighter",
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

  // Jump to specific index in solo mode
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

  // Switch to solo mode focused on a specific reel
  const focusReelInSolo = (reelId: string) => {
    const idx = filteredReels.findIndex((r) => r.id === reelId);
    if (idx !== -1) setActiveIndex(idx);
    setActiveReelId(reelId);
    setViewMode("solo-theater");
  };

  // Solo video progress handler
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

  // Solo video auto-advance
  const handleVideoEnded = () => {
    if (autoAdvance) {
      goNext();
    } else {
      if (activeVideoRef.current) {
        activeVideoRef.current.currentTime = 0;
        activeVideoRef.current.play().catch(() => {});
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (viewMode === "dual-kinetic") {
          setIsKineticPlaying((p) => !p);
        } else {
          setIsPlaying((p) => {
            if (activeVideoRef.current) {
              if (p) activeVideoRef.current.pause();
              else activeVideoRef.current.play().catch(() => {});
            }
            return !p;
          });
        }
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((m) => !m);
      } else if (viewMode === "solo-theater") {
        if (e.key === "ArrowDown" || e.key === "PageDown") {
          e.preventDefault();
          goNext();
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          e.preventDefault();
          goPrev();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, goNext, goPrev, onBack]);

  // Touch swipe support for solo theater
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || viewMode !== "solo-theater") return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) {
      goNext();
    } else if (diff < -50) {
      goPrev();
    }
    touchStartY.current = null;
  };

  // Add to cart handler
  const handleAddToCart = () => {
    onAddBag(matchingProduct);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  // Scroll duration in seconds based on kinetic speed
  const kineticDurationSeconds = kineticSpeed === "2x" ? 22 : kineticSpeed === "1.5x" ? 34 : 48;

  return (
    <div
      className="runway-cinema-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ambient lighting halo */}
      <div
        className="runway-ambient-halo"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${matchingProduct.tone || "#a81920"}36 0%, rgba(12, 6, 4, 0.95) 75%)`,
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
            <span className="runway-tagline">
              {viewMode === "dual-kinetic" ? `RUNWAY VIDEO EDIT · ${columnCount} COLUMNS · 20 LOOKS` : "SOLO THEATER"}
            </span>
          </div>
        </div>

        {/* Center: Mode Switcher (Multi-Column Edit vs Solo Theater) */}
        <div className="runway-header-center">
          <div className="runway-mode-tabs">
            <button
              className={`mode-tab-btn ${viewMode === "dual-kinetic" ? "active" : ""}`}
              onClick={() => setViewMode("dual-kinetic")}
              title="Watch all 20 videos composed together in multi-column opposing scroll"
            >
              <span className="mode-icon">☷</span>
              <span>{columnCount}-Column Video Wall</span>
            </button>
            <button
              className={`mode-tab-btn ${viewMode === "solo-theater" ? "active" : ""}`}
              onClick={() => setViewMode("solo-theater")}
              title="Watch individual reels full-screen with auto-advance"
            >
              <span className="mode-icon">▯</span>
              <span>Solo Theater</span>
            </button>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="runway-header-right">
          <button
            className={`runway-sound-pill ${!isMuted ? "sound-on" : ""}`}
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Audio muted. Click to enable sound." : "Sound live. Click to mute."}
          >
            <div className={`runway-eq-bars ${!isMuted ? "playing" : ""}`}>
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

      {/* =========================================================================
          VIEW MODE 1: MULTI-COLUMN VIDEO EDIT (4-5 COLUMNS OPPOSING CONTINUOUS MOTION)
          ========================================================================= */}
      {viewMode === "dual-kinetic" ? (
        <main className="runway-kinetic-stage">
          <div className={`kinetic-cinema-wrapper ${columnCount >= 4 ? "wide-wall" : ""}`}>
            {/* The Single Master Video Canvas Bezel */}
            <div className={`kinetic-master-bezel cols-${columnCount}`}>
              {/* Top Video Header Overlay */}
              <div className="kinetic-bezel-top-bar">
                <div className="kinetic-badge">
                  <span className="runway-pulse-dot" />
                  <span>OPPOSING MOTION · {columnCount} COLUMNS · 20 REELS</span>
                </div>

                {/* Column Count Selector: 2, 4 (Mosaic), 5 (Wall) */}
                <div className="kinetic-col-controls">
                  <span className="col-label">COLUMNS:</span>
                  {([2, 4, 5] as const).map((cnt) => (
                    <button
                      key={cnt}
                      className={`col-pill ${columnCount === cnt ? "active" : ""}`}
                      onClick={() => setColumnCount(cnt)}
                      title={`Switch to ${cnt} moving columns`}
                    >
                      {cnt === 4 ? "4 Cols (Mosaic)" : cnt === 5 ? "5 Cols (Wall)" : "2 Cols"}
                    </button>
                  ))}
                </div>

                {/* Video Mode Source: Interactive Wall vs Real Baked MP4 */}
                <div className="kinetic-source-toggle">
                  <button
                    className={`source-toggle-btn ${editModeSource === "interactive-wall" ? "active" : ""}`}
                    onClick={() => setEditModeSource("interactive-wall")}
                    title="Interactive 60fps wall with tap-to-shop"
                  >
                    Live Wall
                  </button>
                  <button
                    className={`source-toggle-btn ${editModeSource === "rendered-video" ? "active" : ""}`}
                    onClick={() => setEditModeSource("rendered-video")}
                    title="Watch actual rendered MP4 video edit"
                  >
                    Real Baked MP4
                  </button>
                </div>

                {/* Speed Controls */}
                {editModeSource === "interactive-wall" && (
                  <div className="kinetic-speed-controls">
                    <span className="speed-label">SPEED:</span>
                    {(["1x", "1.5x", "2x"] as const).map((spd) => (
                      <button
                        key={spd}
                        className={`speed-pill ${kineticSpeed === spd ? "active" : ""}`}
                        onClick={() => setKineticSpeed(spd)}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Viewport: Either Real Baked MP4 or Multi-Column Interactive Wall */}
              {editModeSource === "rendered-video" ? (
                <div className="baked-video-viewport">
                  <video
                    src="/reels/sheaura-master-runway-wall.mp4"
                    autoPlay
                    loop
                    muted={isMuted}
                    controls
                    playsInline
                    className="baked-master-video"
                  />
                  <div className="baked-video-overlay-badge">
                    <Icon name="sparkle" />
                    <span>REAL COMPILED MASTER VIDEO EDIT · 4 COLUMNS OPPOSING CONTINUOUS MOTION</span>
                  </div>
                </div>
              ) : (
                <div className={`kinetic-columns-viewport cols-${columnCount}`}>
                  {kineticColumns.map((colReels, colIdx) => {
                    const isUp = colIdx % 2 === 0;
                    return (
                      <React.Fragment key={`col-frag-${colIdx}`}>
                        {colIdx > 0 && (
                          <div className="kinetic-center-seam">
                            <div className="seam-line" />
                            <div className="seam-arrows">
                              <span className="arrow-up">{isUp ? "▲" : "▼"}</span>
                              <span className="arrow-down">{isUp ? "▼" : "▲"}</span>
                            </div>
                            <div className="seam-line" />
                          </div>
                        )}
                        <div className={`kinetic-scroll-column col-wrapper-${colIdx}`}>
                          <div
                            className={`kinetic-ribbon-track ${isUp ? "track-scroll-up" : "track-scroll-down"}`}
                            style={{
                              animationDuration: `${kineticDurationSeconds}s`,
                              animationPlayState: isKineticPlaying ? "running" : "paused",
                            }}
                          >
                            {/* Duplicated twice for seamless, infinite looping scroll */}
                            {[...colReels, ...colReels].map((reel, idx) => {
                              const isSelected = reel.id === activeReel.id;
                              return (
                                <div
                                  key={`col-${colIdx}-${reel.id}-${idx}`}
                                  className={`kinetic-video-card ${isSelected ? "selected" : ""}`}
                                  onClick={() => setActiveReelId(reel.id)}
                                >
                                  <video
                                    src={reel.videoUrl}
                                    poster={reel.poster}
                                    autoPlay
                                    loop
                                    muted={isMuted || !isSelected}
                                    playsInline
                                    className="kinetic-card-video"
                                  />
                                  <div className="kinetic-card-overlay">
                                    <span className="card-look-pill">{reel.step}</span>
                                    <span className="card-reel-name">{reel.title}</span>
                                  </div>
                                  {isSelected && (
                                    <div className="card-active-indicator">
                                      <span />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Bottom Video Edit Controls Bar (Play/Pause, Sound, Instructions) */}
              <div className="kinetic-bezel-bottom-bar">
                {editModeSource === "interactive-wall" ? (
                  <button
                    className="kinetic-play-toggle-btn"
                    onClick={() => setIsKineticPlaying(!isKineticPlaying)}
                    title={isKineticPlaying ? "Pause continuous scroll" : "Resume continuous scroll"}
                  >
                    <Icon name={isKineticPlaying ? "pause" : "play"} />
                    <span>{isKineticPlaying ? "PAUSE MOTION" : "RESUME FLOW"}</span>
                  </button>
                ) : (
                  <div className="baked-status-pill">
                    <span className="runway-pulse-dot" />
                    <span>Single 1080p Master MP4 Video Edit</span>
                  </div>
                )}

                <div className="kinetic-hint-badge">
                  <span>{editModeSource === "interactive-wall" ? "TAP ANY LOOK TO SHOP" : "MASTER VIDEO RENDER (11 MB)"}</span>
                </div>

                <div className="kinetic-bottom-actions">
                  <a
                    href="/reels/sheaura-master-runway-wall.mp4"
                    download="sheaura-master-runway-wall.mp4"
                    className="kinetic-download-pill"
                    title="Download the rendered single master video file"
                  >
                    <Icon name="arrow" className="rotate-90" />
                    <span>Download MP4</span>
                  </a>

                  <button
                    className="kinetic-focus-btn"
                    onClick={() => focusReelInSolo(activeReel.id)}
                    title="Expand selected reel to full solo theater"
                  >
                    <Icon name="play" />
                    <span>FOCUS SOLO</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Synchronized Side Product Atelier Card */}
            <aside className="kinetic-side-atelier">
              <div className="atelier-header">
                <span className="atelier-eyebrow">
                  <Icon name="sparkle" />
                  <span>SELECTED IN MOTION</span>
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
                  “{activeReel.quote}”
                </p>

                <div className="atelier-creator-row">
                  <img src={activeReel.avatar} alt="" className="creator-avatar" />
                  <div>
                    <b>{activeReel.handle}</b>
                    <small>{activeReel.views} watches · Official SheAura Reel</small>
                  </div>
                  <a
                    href={activeReel.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="creator-ig-btn"
                  >
                    <Icon name="instagram" /> Instagram
                  </a>
                </div>

                <div className="atelier-actions">
                  <button
                    className={`atelier-add-bag-btn ${addedToast ? "added" : ""}`}
                    onClick={handleAddToCart}
                  >
                    {addedToast ? "Added to Bag ✓" : `Quick Add to Bag — ${activeReel.productPrice || matchingProduct.price}`}
                  </button>

                  <div className="atelier-action-duo">
                    <button
                      className="atelier-solo-btn"
                      onClick={() => focusReelInSolo(activeReel.id)}
                    >
                      <Icon name="play" />
                      <span>Watch Fullscreen Solo</span>
                    </button>
                    <button
                      className="atelier-details-btn"
                      onClick={() => {
                        onSelectProduct(matchingProduct);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <span>Formula Details</span>
                      <Icon name="arrow" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Jump Ribbon */}
              <div className="kinetic-quick-strip">
                <span className="strip-label">OR JUMP DIRECTLY TO ANY LOOK (20 TOTAL):</span>
                <div className="strip-pills">
                  {reels.map((r, i) => (
                    <button
                      key={r.id}
                      className={`strip-pill-btn ${r.id === activeReel.id ? "active" : ""}`}
                      onClick={() => setActiveReelId(r.id)}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      ) : (
        /* =========================================================================
            VIEW MODE 2: SOLO THEATER (INDIVIDUAL FULLSCREEN REELS)
            ========================================================================= */
        <main className="runway-main-stage">
          {/* Navigation arrow buttons */}
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
            <div className="runway-video-container" onClick={() => setIsPlaying(!isPlaying)}>
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

              {nextReel && (
                <video
                  src={nextReel.videoUrl}
                  preload="auto"
                  muted
                  style={{ display: "none" }}
                />
              )}

              {!isPlaying && (
                <div className="runway-pause-scrim">
                  <div className="runway-pause-icon">
                    <Icon name="play" />
                  </div>
                  <span>PAUSED · TAP TO RESUME</span>
                </div>
              )}

              {isMuted && (
                <div
                  className="runway-unmute-prompt"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(false);
                  }}
                >
                  <Icon name="volumeX" />
                  <span>SOUND MUTED · TAP TO UNMUTE RUNWAY AUDIO</span>
                </div>
              )}

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

            {/* Bottom Scrubber */}
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

          {/* Floating Side Editorial Atelier */}
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

            <button
              className="atelier-filmstrip-toggle"
              onClick={() => setFilmstripOpen(!filmstripOpen)}
            >
              <span>{filmstripOpen ? "Hide All 20 Looks" : "Explore All 20 Runway Looks"}</span>
              <Icon name="sparkle" />
            </button>
          </aside>
        </main>
      )}

      {/* Expandable Bottom 20-Look Filmstrip Drawer (Available in solo mode) */}
      <footer className={`runway-filmstrip-drawer ${filmstripOpen ? "open" : ""}`}>
        <div className="filmstrip-drawer-head">
          <div className="drawer-title-row">
            <b>HAUTE RUNWAY LOOKBOOK</b>
            <span>20 LIVE APPLICATION REELS · TAP ANY LOOK TO JUMP</span>
          </div>
          <div className="filmstrip-filter-tabs">
            {[
              { id: "all", label: "All Looks (20)" },
              { id: "lips", label: "Lipsticks" },
              { id: "blush", label: "Blush" },
              { id: "glow", label: "Highlighter & Oil" },
              { id: "complexion", label: "Foundation" },
              { id: "collection", label: "Wardrobe Edit" },
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
