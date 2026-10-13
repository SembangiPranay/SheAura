import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import BrandIntro from "./BrandIntro";

export const resolveAsset = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "./";
  const cleanPath = path.replace(/^\.?\//, "");
  return base.endsWith("/") ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
};

const photos = {
  hero: "https://images.unsplash.com/photo-1434730737257-3e97ad16f4b6?auto=format&fit=crop&w=2200&q=90",
  lipstick: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85",
  makeup: resolveAsset("/products/products.png"),
  skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
  model: "https://images.unsplash.com/photo-1675773051474-55c4b7d2cf53?auto=format&fit=crop&w=1400&q=90",
  floral: "https://images.unsplash.com/photo-1536568033156-c6bf7b18dfba?auto=format&fit=crop&w=900&q=85",
  perfume: "https://images.unsplash.com/photo-1726758004499-b4ea21408bcf?auto=format&fit=crop&w=1400&q=90",
  cream: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85",
  foundation: "https://images.unsplash.com/photo-1650529192390-19528c5db606?auto=format&fit=crop&w=900&q=85",
  oil: "https://images.unsplash.com/photo-1695972235594-8478ab831602?auto=format&fit=crop&w=900&q=85",
  ingredients: "https://images.unsplash.com/photo-1726758004519-7ccecda8b076?auto=format&fit=crop&w=1800&q=90",
  arches: "https://images.unsplash.com/photo-1543682388-4b46a14c91db?auto=format&fit=crop&w=2000&q=90",
  scarletPortrait: resolveAsset("/campaign/scarlet-portrait.png"),
  scarletBotanical: resolveAsset("/campaign/scarlet-botanical.png"),
  blushPortrait: resolveAsset("/campaign/pink-blossom-portrait.png"),
  blushStill: resolveAsset("/campaign/pink-blossom-still.png"),
  highlighterPortrait: resolveAsset("/campaign/highlighter-glow-portrait.png"),
  highlighterBotanical: resolveAsset("/campaign/highlighter-glow-still.png"),
};

type IconName = "search" | "user" | "bag" | "arrow" | "leaf" | "drop" | "sparkle" | "instagram" | "play" | "pause" | "volume" | "volumeX" | "close" | "check" | "external";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5.5 20c.6-4 2.7-6 6.5-6s5.9 2 6.5 6" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    arrow: <><path d="M4 12h15" /><path d="m15 8 4 4-4 4" /></>,
    leaf: <><path d="M19 4C10 4 5 8 5 14c0 3 2 5 5 5 6 0 9-6 9-15Z" /><path d="M5 20c2-5 6-8 11-11" /></>,
    drop: <path d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z" />,
    sparkle: <><path d="M12 2c.6 6 2 7.4 8 8-6 .6-7.4 2-8 8-.6-6-2-7.4-8-8 6-.6 7.4-2 8-8Z" /><path d="M19 17c.2 2.2.8 2.8 3 3-2.2.2-2.8.8-3 3-.2-2.2-.8-2.8-3-3 2.2-.2 2.8-.8 3-3Z" /></>,
    instagram: <><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    play: <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />,
    pause: <><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" /></>,
    volume: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>,
    volumeX: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
  };
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">{paths[name]}</svg>;
}

function ArrowLink({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <a className={`arrow-link ${light ? "light" : ""}`} href="#shop">{children}<Icon name="arrow" /></a>;
}

const products = [
  { name: "Scarlet Rose Lipstick", price: "₹1,099.00", image: photos.scarletBotanical, campaign: photos.scarletPortrait, still: photos.scarletBotanical, tag: "Icon", tone: "#a81920", category: "Lip colour", note: "Satin botanical colour", finish: "Sculpted satin", mood: "The red statement", description: "A couture red lip with a petal-embossed silhouette, designed as the finishing piece in your everyday wardrobe." },
  { name: "Pink Blossom Blush", price: "₹899.00", image: photos.blushStill, campaign: photos.blushPortrait, still: photos.blushStill, tag: "Bestseller", tone: "#a94368", category: "Blush", note: "Soft-focus flush", finish: "Silk powder", mood: "The romantic flush", description: "A buildable pink flush presented in a keepsake gold compact, made to move effortlessly from daylight to evening." },
  { name: "Molten Glow Highlighter", price: "₹1,199.00", image: photos.highlighterBotanical, campaign: photos.highlighterPortrait, still: photos.highlighterBotanical, tag: "New", tone: "#c18847", category: "Highlighter", note: "Liquid luminosity", finish: "Molten pearl", mood: "The golden hour", description: "A fluid veil of warm luminosity that catches the light like jewellery and turns skin into the main accessory." },
];

type Product = (typeof products)[number];

type Reel = {
  id: string;
  title: string;
  subtitle: string;
  productName: string;
  category: "all" | "blush" | "lips" | "glow" | "routine";
  videoUrl: string;
  poster: string;
  instagramUrl: string;
  handle: string;
  avatar: string;
  duration: string;
  views: string;
  likes: string;
  quote: string;
  step: string;
  tone: string;
  productPrice: string;
  productImage: string;
  productTag?: string;
};

const reels: Reel[] = [
  {
    id: "reel-01",
    title: "The Perfect Everyday Blush",
    subtitle: "Soft-Focus Silk Powder Flush",
    productName: "Pink Blossom Blush",
    category: "blush",
    videoUrl: resolveAsset("/reels/reel-01-perfect-blush.mp4"),
    poster: photos.blushPortrait,
    instagramUrl: "https://www.instagram.com/reel/DeV_UkRpvGw/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.blushPortrait,
    duration: "0:24",
    views: "342K",
    likes: "48.6K",
    quote: "The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.",
    step: "Look 01 · Everyday Flush",
    tone: "#a94368",
    productPrice: "₹899.00",
    productImage: photos.blushStill,
    productTag: "Bestseller",
  },
  {
    id: "reel-02",
    title: "Couture Red Lip Finish",
    subtitle: "Botanical Emollient Glide",
    productName: "Scarlet Rose Lipstick",
    category: "lips",
    videoUrl: resolveAsset("/reels/reel-02-nothing-better-lipstick.mp4"),
    poster: photos.scarletPortrait,
    instagramUrl: "https://www.instagram.com/reel/DeO8B16hEAz/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.scarletPortrait,
    duration: "0:18",
    views: "420K",
    likes: "61.2K",
    quote: "There’s nothing better than this. Rich pigment with hydrating comfort in a single stroke.",
    step: "Look 02 · The Red Statement",
    tone: "#a81920",
    productPrice: "₹1,099.00",
    productImage: photos.scarletBotanical,
    productTag: "Icon",
  },
  {
    id: "reel-03",
    title: "Effortless Everyday Glam",
    subtitle: "From Subtle Nude to Bold Statement",
    productName: "Scarlet Rose Lipstick",
    category: "lips",
    videoUrl: resolveAsset("/reels/reel-03-everyday-glam.mp4"),
    poster: photos.scarletBotanical,
    instagramUrl: "https://www.instagram.com/reel/DeLrsOLMSyo/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.scarletPortrait,
    duration: "0:16",
    views: "288K",
    likes: "39.4K",
    quote: "Everyday glam made effortless. Layerable formulas crafted for daylight and evening.",
    step: "Look 03 · Nude to Bold",
    tone: "#9a6e56",
    productPrice: "₹1,099.00",
    productImage: photos.scarletBotanical,
    productTag: "Icon",
  },
  {
    id: "reel-04",
    title: "Hydra-Glide Lipstick Ritual",
    subtitle: "Silky Sensation on Bare Lips",
    productName: "Scarlet Rose Lipstick",
    category: "lips",
    videoUrl: resolveAsset("/reels/reel-04-grwm-lipsticks.mp4"),
    poster: photos.lipstick,
    instagramUrl: "https://www.instagram.com/reel/DeJ0vGmMjxv/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.model,
    duration: "0:21",
    views: "512K",
    likes: "74.1K",
    quote: "GRWM featuring She’Aura lipsticks! Finding a formula that glides smoothly and hydrates all day.",
    step: "Look 04 · Sensorial Glide",
    tone: "#a81920",
    productPrice: "₹1,099.00",
    productImage: photos.scarletBotanical,
    productTag: "Icon",
  },
  {
    id: "reel-05",
    title: "She’Aura Body Highlighter Oil",
    subtitle: "Liquid Shimmer & Luxury Glow",
    productName: "Molten Glow Highlighter",
    category: "glow",
    videoUrl: resolveAsset("/reels/reel-05-body-highlighter-oil.mp4"),
    poster: photos.highlighterBotanical,
    instagramUrl: "https://www.instagram.com/reel/DeG5GujBNVT/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.highlighterPortrait,
    duration: "0:20",
    views: "610K",
    likes: "89.3K",
    quote: "Just gift her the She’Aura Body Highlighter Oil. Smooth application, gorgeous shimmer, and luxury glow.",
    step: "Look 05 · Body Shimmer Veil",
    tone: "#c18847",
    productPrice: "₹1,199.00",
    productImage: photos.highlighterBotanical,
    productTag: "New",
  },
  {
    id: "reel-06",
    title: "Not A Filter, Pure Skin Foundation",
    subtitle: "Second-Skin Complexion Blend",
    productName: "Pink Blossom Blush",
    category: "glow",
    videoUrl: resolveAsset("/reels/reel-06-not-a-filter-foundation.mp4"),
    poster: photos.foundation,
    instagramUrl: "https://www.instagram.com/reel/DeEq7-Azk_P/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.model,
    duration: "0:19",
    views: "395K",
    likes: "52.8K",
    quote: "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
    step: "Look 06 · Second-Skin Base",
    tone: "#dfb895",
    productPrice: "₹899.00",
    productImage: photos.blushStill,
    productTag: "Base Edit",
  },
  {
    id: "reel-07",
    title: "Traditional Festive Radiance",
    subtitle: "Natural Glow with Heritage Elegance",
    productName: "Pink Blossom Blush",
    category: "routine",
    videoUrl: resolveAsset("/reels/reel-07-traditional-glow.mp4"),
    poster: photos.blushPortrait,
    instagramUrl: "https://www.instagram.com/reel/Dd_2YLhR6P4/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.blushPortrait,
    duration: "0:17",
    views: "478K",
    likes: "67.0K",
    quote: "Pair your traditional look with She’aura to get the natural glow and festive elegance.",
    step: "Look 07 · Festive Glow",
    tone: "#a94368",
    productPrice: "₹899.00",
    productImage: photos.blushStill,
    productTag: "Festive Edit",
  },
  {
    id: "reel-08",
    title: "Orchid Lip & Peach Blossom Blush",
    subtitle: "Signature Minimal GRWM Routine",
    productName: "Pink Blossom Blush",
    category: "blush",
    videoUrl: resolveAsset("/reels/reel-08-orchid-peach-grwm.mp4"),
    poster: photos.blushStill,
    instagramUrl: "https://www.instagram.com/reel/Dd-wD1Oz39K/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.blushStill,
    duration: "0:25",
    views: "530K",
    likes: "78.4K",
    quote: "Perfect GRWM featuring Orchid Lipstick and Peach Blossom Blush. Fresh, blooming, and effortless.",
    step: "Look 08 · Orchid & Peach",
    tone: "#dda196",
    productPrice: "₹899.00",
    productImage: photos.blushStill,
    productTag: "GRWM Edit",
  },
  {
    id: "reel-09",
    title: "Moonflower Highlighter Glow",
    subtitle: "Full Bebo Vibes & Liquid Light",
    productName: "Molten Glow Highlighter",
    category: "glow",
    videoUrl: resolveAsset("/reels/reel-09-moonflower-highlighter.mp4"),
    poster: photos.highlighterPortrait,
    instagramUrl: "https://www.instagram.com/reel/Dd6SWx_tJjp/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.highlighterPortrait,
    duration: "0:28",
    views: "812K",
    likes: "115K",
    quote: "Giving full Bebo vibes! The Moonflower Highlighter by SHE’AURA is all about that dreamy, molten glow.",
    step: "Look 09 · Moonflower Dream",
    tone: "#c18847",
    productPrice: "₹1,199.00",
    productImage: photos.highlighterBotanical,
    productTag: "Viral",
  },
  {
    id: "reel-10",
    title: "PR Review & Unboxing",
    subtitle: "First Impressions & Formula Swatches",
    productName: "Scarlet Rose Lipstick",
    category: "routine",
    videoUrl: resolveAsset("/reels/reel-10-pr-review-unboxing.mp4"),
    poster: photos.model,
    instagramUrl: "https://www.instagram.com/reel/Dd62wF7SbMG/?utm_source=ig_web_copy_link",
    handle: "@sheauracosmeticsofficial",
    avatar: photos.model,
    duration: "0:22",
    views: "640K",
    likes: "92.3K",
    quote: "Unboxing the luxury SHE’AURA collection. Sculpted packaging, sensory formulas, and radiant payoff.",
    step: "Look 10 · The Complete Edit",
    tone: "#dfb895",
    productPrice: "₹1,099.00",
    productImage: photos.scarletBotanical,
    productTag: "PR Unboxing",
  },
];

function ReelCard({
  reel,
  onOpenReel,
  onSelectProduct,
  onAddBag,
}: {
  reel: Reel;
  onOpenReel: (reel: Reel) => void;
  onSelectProduct: (product: Product) => void;
  onAddBag: (product: Product) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [addedBadge, setAddedBadge] = useState(false);
  const matchingProduct = products.find((p) => p.name === reel.productName) || products[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddBag(matchingProduct);
    setAddedBadge(true);
    setTimeout(() => setAddedBadge(false), 1600);
  };

  const openInstagram = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(reel.instagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="reel-card"
      onClick={() => onOpenReel(reel)}
    >
      <div className="reel-media">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.poster}
          muted={isMuted}
          playsInline
          autoPlay
          loop
          preload="metadata"
          className="reel-video"
          onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
        />
        <div className="reel-gradient-wash" />
      </div>

      <div className="reel-top-row">
        <button
          className="reel-creator-pill"
          onClick={openInstagram}
          title="Open original reel on Instagram"
          aria-label="Open original reel on Instagram"
        >
          <Icon name="instagram" />
          <span>{reel.handle}</span>
          <Icon name="external" />
        </button>
        <div className="reel-top-actions">
          <span className="reel-live-badge"><i /> LIVE</span>
          <button
            className="reel-icon-btn"
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            <Icon name={isMuted ? "volumeX" : "volume"} />
          </button>
        </div>
      </div>

      <div className="reel-center-play">
        <div className="reel-play-circle" title="Watch in fullscreen">
          <Icon name="play" />
        </div>
      </div>

      <div className="reel-bottom-sheet">
        <div className="reel-step-pill">{reel.step}</div>
        <p className="reel-quote">"{reel.quote}"</p>
        <div
          className="reel-product-card"
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(matchingProduct);
            window.scrollTo(0, 0);
          }}
        >
          <img src={reel.productImage || matchingProduct.image} alt={matchingProduct.name} className="reel-prod-thumb" />
          <div className="reel-prod-meta">
            {reel.productTag && <span className="reel-prod-tag-pill">{reel.productTag}</span>}
            <h4 className="reel-prod-title">{matchingProduct.name}</h4>
            <div className="reel-prod-price-row">
              <b>{reel.productPrice || matchingProduct.price}</b>
              <span className="reel-prod-views">{reel.views} views</span>
            </div>
          </div>
          <button
            className="reel-quick-add"
            onClick={handleQuickAdd}
            title="Quick add to bag"
            aria-label="Add to bag"
          >
            {addedBadge ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelViewerModal({
  reel,
  onClose,
  onSelectProduct,
  onAddBag,
  reels,
  onSwitchReel,
}: {
  reel: Reel;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddBag: (product: Product) => void;
  reels: Reel[];
  onSwitchReel: (reel: Reel) => void;
}) {
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const matchingProduct = products.find((p) => p.name === reel.productName) || products[0];

  const currentIndex = reels.findIndex((r) => r.id === reel.id);

  const touchStartXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const diff = touchStartXRef.current - e.changedTouches[0].clientX;
      if (diff > 45) {
        nextReel();
      } else if (diff < -45) {
        prevReel();
      }
    }
  };

  const handleVideoTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const width = rect.width;
    if (tapX < width * 0.28) {
      prevReel();
    } else if (tapX > width * 0.72) {
      nextReel();
    } else {
      togglePlay();
    }
  };

  const prevReel = () => {
    const nextIndex = (currentIndex - 1 + reels.length) % reels.length;
    onSwitchReel(reels[nextIndex]);
    setProgress(0);
  };

  const nextReel = () => {
    const nextIndex = (currentIndex + 1) % reels.length;
    onSwitchReel(reels[nextIndex]);
    setProgress(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevReel();
      if (e.key === "ArrowRight") nextReel();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [reel.id]);

  const handleTimeUpdate = () => {
    if (modalVideoRef.current && modalVideoRef.current.duration) {
      const p = (modalVideoRef.current.currentTime / modalVideoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const togglePlay = () => {
    if (modalVideoRef.current) {
      if (isPlaying) {
        modalVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        modalVideoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleSound = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAddToCart = () => {
    onAddBag(matchingProduct);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  return (
    <div className="reel-modal-backdrop" onClick={onClose}>
      <div className="reel-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="reel-modal-close" onClick={onClose} aria-label="Close story viewer">
          <Icon name="close" />
        </button>

        <button className="reel-nav-btn prev" onClick={prevReel} aria-label="Previous reel">
          <Icon name="arrow" />
        </button>

        <div
          className="reel-modal-theater"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="reel-story-progress-bar">
            {reels.map((r, idx) => (
              <div key={r.id} className="progress-track" onClick={() => onSwitchReel(r)}>
                <div
                  className="progress-fill"
                  style={{
                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="reel-theater-header">
            <div className="reel-creator-info">
              <img src={reel.avatar} alt={reel.handle} className="reel-avatar" />
              <div>
                <b>{reel.handle}</b>
                <span>{reel.step}</span>
              </div>
            </div>
            <div className="theater-controls">
              <a
                href={reel.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="theater-ig-badge"
                title="Open on Instagram"
              >
                <Icon name="instagram" />
                <span>Instagram</span>
                <Icon name="external" />
              </a>
              <button onClick={toggleSound} className="theater-icon-btn" aria-label="Toggle sound">
                <Icon name={isMuted ? "volumeX" : "volume"} />
              </button>
              <button onClick={togglePlay} className="theater-icon-btn" aria-label="Play or pause">
                <Icon name={isPlaying ? "pause" : "play"} />
              </button>
            </div>
          </div>

          <video
            ref={modalVideoRef}
            src={reel.videoUrl}
            poster={reel.poster}
            playsInline
            loop
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onClick={handleVideoTap}
            className="theater-video"
          />

          {!isPlaying && (
            <div className="theater-paused-overlay" onClick={togglePlay}>
              <div className="theater-paused-circle"><Icon name="play" /></div>
            </div>
          )}

          <div className="theater-caption-overlay">
            <div className="theater-badge">
              <Icon name="instagram" />
              <span>Verified Look · @sheauracosmeticsofficial</span>
            </div>
            <h3>{reel.title}</h3>
            <p className="theater-caption-text">{reel.quote}</p>
          </div>
        </div>

        <div className="reel-modal-sidebar">
          <div>
            <div className="sidebar-header">
              <p className="eyebrow dark">Featured Piece in Reel</p>
              <span className="sidebar-step">{reel.step}</span>
            </div>

            <div className="sidebar-product-hero">
              <img src={reel.productImage || matchingProduct.image} alt={matchingProduct.name} />
              <div className="sidebar-prod-badge" style={{ background: reel.tone || matchingProduct.tone }}>
                {matchingProduct.category}
              </div>
            </div>

            <div className="sidebar-info">
              <h3>{matchingProduct.name}</h3>
              <div className="sidebar-price-row">
                <b>{reel.productPrice || matchingProduct.price}</b>
                <span>{matchingProduct.finish} finish</span>
              </div>
              <p className="sidebar-desc">{matchingProduct.description}</p>
            </div>

            <div className="sidebar-attributes">
              <div><span>Tone</span><b>{matchingProduct.name.split(" ")[0]}</b></div>
              <div><span>Wear</span><b>Buildable</b></div>
              <div><span>Standard</span><b>Botanical</b></div>
            </div>
          </div>

          <div className="sidebar-actions-wrap">
            <div className="sidebar-actions">
              <button className="sidebar-add-bag" onClick={handleAddToCart}>
                {addedToast ? "Added to Bag ✓" : `Add to Bag — ${reel.productPrice || matchingProduct.price}`}
              </button>
              <button
                className="sidebar-view-details"
                onClick={() => {
                  onClose();
                  onSelectProduct(matchingProduct);
                  window.scrollTo(0, 0);
                }}
              >
                Explore Full Details <Icon name="arrow" />
              </button>
              <a
                href={reel.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="sidebar-ig-link"
              >
                <Icon name="instagram" /> View Reel on Instagram <Icon name="external" />
              </a>
            </div>

            {addedToast && (
              <div className="sidebar-toast">
                <Icon name="check" /> {matchingProduct.name} added to your shopping bag!
              </div>
            )}
          </div>
        </div>

        <button className="reel-nav-btn next" onClick={nextReel} aria-label="Next reel">
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

function ReelsSection({
  onSelectProduct,
  onAddBag,
  onOpenReel,
}: {
  onSelectProduct: (product: Product) => void;
  onAddBag: (product: Product) => void;
  onOpenReel: (reel: Reel) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState(reels[0].id);

  const filteredReels = useMemo(() => {
    return filter === "all" ? reels : reels.filter((r) => r.category === filter);
  }, [filter]);

  useEffect(() => {
    if (!filteredReels.some((reel) => reel.id === activeId)) setActiveId(filteredReels[0]?.id || reels[0].id);
  }, [filter, filteredReels, activeId]);

  const activeIndex = Math.max(0, filteredReels.findIndex((reel) => reel.id === activeId));
  const activeReel = filteredReels[activeIndex] || filteredReels[0] || reels[0];
  const move = (direction: number) => setActiveId(filteredReels[(activeIndex + direction + filteredReels.length) % filteredReels.length].id);

  return (
    <section className="reels-section" id="rituals">
      <div className="shell reels-header-wrap">
        <div className="section-heading">
          <div>
            <div className="reels-eyebrow-row">
              <p className="eyebrow dark">Official Instagram Reels · Watch & Shop</p>
              <span className="reels-live-pulse"><i /> 10 RITUALS RUNNING LIVE</span>
            </div>
            <h2>Aura in Motion.</h2>
            <p>Real skin, botanical textures, unedited swatches. Watch our official Instagram reels flowing live—tap any piece to shop the exact shades worn in motion.</p>
          </div>
          <div className="reels-header-controls">
            <div className="reels-filters">
              {[
                { id: "all", label: "All Reels (10)" },
                { id: "blush", label: "Blush" },
                { id: "lips", label: "Lipsticks" },
                { id: "glow", label: "Highlighter & Oil" },
                { id: "routine", label: "GRWM & Routines" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={filter === tab.id ? "active" : ""}
                  onClick={() => setFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="reels-motion-controls">
              <div className="reels-arrow-btns">
                <button onClick={() => move(-1)} aria-label="Previous reel" title="Previous reel">
                  <Icon name="arrow" />
                </button>
                <button onClick={() => move(1)} aria-label="Next reel" title="Next reel">
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reels-featured-layout">
        <button className="reels-featured-arrow prev" onClick={() => move(-1)} aria-label="Previous reel"><Icon name="arrow" /></button>
        <div className="reels-featured-active"><ReelCard reel={activeReel} onOpenReel={onOpenReel} onSelectProduct={onSelectProduct} onAddBag={onAddBag} /></div>
        <button className="reels-featured-arrow next" onClick={() => move(1)} aria-label="Next reel"><Icon name="arrow" /></button>
        <div className="reels-thumbnails" aria-label="Choose a reel">
          {filteredReels.map((reel) => <button key={reel.id} className={`reel-thumbnail ${reel.id === activeReel.id ? "active" : ""}`} onClick={() => setActiveId(reel.id)}><img src={reel.poster} alt="" /><span>{reel.title}</span></button>)}
        </div>
      </div>

      <div className="reels-bottom-note shell">
        <div className="note-left">
          <Icon name="instagram" />
          <span>Featuring 10 official reels from <b>@sheauracosmeticsofficial</b>. Tag <b>#MySheAura</b> to be featured.</span>
        </div>
        <a href="https://www.instagram.com/sheauracosmeticsofficial/" target="_blank" rel="noreferrer" className="follow-link">
          Visit @sheauracosmeticsofficial <Icon name="external" />
        </a>
      </div>
    </section>
  );
}

function PdpReelHighlight({
  product,
  onOpenReel,
}: {
  product: Product;
  onOpenReel: (reel: Reel) => void;
}) {
  // Find matching reels for this product category
  const matchingReels = reels.filter((r) => r.productName === product.name || (product.category === "Lip colour" && r.category === "lips") || (product.category === "Blush" && r.category === "blush") || (product.category === "Highlighter" && r.category === "glow"));
  const primaryReel = matchingReels[0] || reels[0];

  return (
    <section className="pdp-motion shell">
      <div className="pdp-motion-card">
        <div className="pdp-motion-video-wrap" onClick={() => onOpenReel(primaryReel)}>
          <video
            src={primaryReel.videoUrl}
            poster={primaryReel.poster}
            playsInline
            muted
            loop
            autoPlay
            className="pdp-motion-video"
            onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
          />
          <div className="pdp-motion-play-badge">
            <Icon name="play" />
            <span>Watch Fullscreen Story</span>
          </div>
        </div>
        <div className="pdp-motion-copy">
          <div className="pdp-motion-eyebrow">
            <Icon name="instagram" />
            <span>Official Reel · Real Application & Swatch</span>
          </div>
          <h2>See {product.name} on Real Skin.</h2>
          <p className="pdp-motion-desc">"{primaryReel.quote}"</p>
          <div className="pdp-motion-meta">
            <div>
              <span>Official Channel</span>
              <b>{primaryReel.handle}</b>
            </div>
            <div>
              <span>Application Finish</span>
              <b>{product.finish}</b>
            </div>
            <div>
              <span>Featured Look</span>
              <b>{primaryReel.step}</b>
            </div>
          </div>
          <div className="pdp-motion-actions">
            <button className="pdp-motion-btn" onClick={() => onOpenReel(primaryReel)}>
              <Icon name="play" /> Watch Reel in Fullscreen
            </button>
            <a
              href={primaryReel.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="pdp-motion-ig-btn"
            >
              <Icon name="instagram" /> Open on Instagram <Icon name="external" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityStrip() {
  return (
    <section className="community-strip">
      <div className="community-marquee">
        <span>AS SEEN ON INSTAGRAM · TAG #MYSHEAURA TO BE FEATURED · 100% BOTANICAL EXTRACTS · SCULPTED TEXTURES · VEGAN & CRUELTY FREE · YOUR AURA, YOUR STORY ·&nbsp;</span>
        <span>AS SEEN ON INSTAGRAM · TAG #MYSHEAURA TO BE FEATURED · 100% BOTANICAL EXTRACTS · SCULPTED TEXTURES · VEGAN & CRUELTY FREE · YOUR AURA, YOUR STORY ·&nbsp;</span>
      </div>
    </section>
  );
}


function ProductPage({
  product,
  onBack,
  onAdd,
  onSelect,
  onOpenReel,
}: {
  product: Product;
  onBack: () => void;
  onAdd: () => void;
  onSelect: (product: Product) => void;
  onOpenReel: (reel: Reel) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState("formula");
  const related = products.filter((item) => item.name !== product.name);

  return (
    <main className="product-page">
      <header className="product-nav shell">
        <button className="back-link" onClick={onBack} aria-label="Back to collection"><Icon name="arrow" /> <span>Back to collection</span></button>
        <button className="brand product-brand" onClick={onBack}>SHE’AURA<span>YOUR AURA · YOUR STORY</span></button>
        <div className="product-nav-actions"><button aria-label="Search"><Icon name="search" /></button><button aria-label="Shopping bag" onClick={onAdd} className="bag"><Icon name="bag" /></button></div>
      </header>

      <section className="pdp-hero">
        <div className="pdp-gallery">
          <span className="pdp-index">LOOK 01 — {product.category}</span>
          <img className="pdp-product-photo" src={product.image} alt={product.name} />
          <div className="pdp-photo-shade" />
          <div className="pdp-caption"><span>Object of desire</span><b>SHE’AURA / 2025</b></div>
        </div>
        <div className="pdp-info">
          <p className="eyebrow dark">{product.mood}</p>
          <h1>{product.name}</h1>
          <div className="pdp-price"><span>{product.price}</span><small>Inclusive of all taxes</small></div>
          <p className="pdp-description">{product.description}</p>
          <div className="wear-profile">
            <div><span>Finish</span><b>{product.finish}</b></div>
            <div><span>Wear</span><b>Buildable</b></div>
            <div><span>Conscious edit</span><b>Ingredient-led</b></div>
          </div>
          <div className="shade-selector">
            <div><span>Selected shade</span><b>{product.name.split(" ").slice(0, 2).join(" ")}</b></div>
            <button className="shade active" style={{ background: product.tone }} aria-label="Selected shade" />
            <button className="shade shade-two" aria-label="Alternative shade" />
            <button className="shade shade-three" aria-label="Alternative shade" />
          </div>
          <div className="purchase-row">
            <div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}>+</button></div>
            <button className="add-bag" onClick={onAdd}>Add to bag — {product.price}</button>
          </div>
          <p className="delivery-note"><Icon name="sparkle" /> Complimentary delivery on orders above ₹1,499</p>
          <div className="pdp-accordions">
            {[
              ["formula", "The formula", "A sensorial, buildable texture created to layer comfortably and wear beautifully. Verified product-specific INCI details will be published here."],
              ["ritual", "How to wear", `Wear ${product.name} alone as a statement or layer it into your routine for a more dimensional finish.`],
              ["conscious", "Conscious standard", "Designed with ingredient transparency in mind. Packaging and formula credentials will be listed as they are verified."],
            ].map(([id, title, copy]) => (
              <div className={detailsOpen === id ? "open" : ""} key={id}>
                <button onClick={() => setDetailsOpen(detailsOpen === id ? "" : id)}><span>{title}</span><b>{detailsOpen === id ? "−" : "+"}</b></button>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="campaign-break">
        <img src={product.still} alt={`${product.name} botanical campaign`} />
        <div>
          <p className="eyebrow">Campaign 01 / 2025</p>
          <h2>{product.mood}.<br /><i>Captured.</i></h2>
          <p>Beauty as adornment—colour, light, texture, and gold composed as one complete look.</p>
        </div>
        <span>{product.name}</span>
      </section>

      <section className="fashion-formula">
        <div className="fashion-panel">
          <img src={product.campaign} alt={`${product.name} fashion campaign`} />
          <div><p className="eyebrow">The style note</p><h2>Wear your<br />own aura.</h2><p>Not trend-led. Self-led. SHE’AURA colour is designed like fashion: expressive, layerable, and entirely personal.</p></div>
        </div>
        <div className="formula-panel">
          <p className="eyebrow dark">The conscious formula</p>
          <h2>What’s inside<br />matters.</h2>
          <p className="formula-lead">We pair performance with transparency. Product-specific ingredient lists will be shown in full—no vague claims, no hidden story.</p>
          <div className="formula-principles">
            <div><span>01</span><Icon name="leaf" /><h3>Purposeful inputs</h3><p>Every ingredient should have a clear role in texture, colour, care, or wear.</p></div>
            <div><span>02</span><Icon name="drop" /><h3>Skin-first texture</h3><p>Sensory formulas created for comfortable layering and expressive application.</p></div>
            <div><span>03</span><Icon name="sparkle" /><h3>Full transparency</h3><p>Complete verified INCI information, presented clearly before purchase.</p></div>
          </div>
        </div>
      </section>

      <PdpReelHighlight product={product} onOpenReel={onOpenReel} />

      <section className="pdp-ingredients">
        <div className="ingredient-marquee">FASHION CONSCIOUS <i>·</i> INGREDIENT CONSCIOUS <i>·</i> YOUR AURA, YOUR STORY</div>
        <div className="ingredient-bento shell">
          <div className="bento-title"><p className="eyebrow dark">The ingredient wardrobe</p><h2>Formula,<br /><i>undressed.</i></h2></div>
          <div className="bento-card bento-botanical"><Icon name="leaf" /><span>01</span><h3>Botanical emollients</h3><p>For glide, comfort and a polished feel.</p></div>
          <div className="bento-card bento-pigment"><span>02</span><div className="pigment-smear" /><h3>Considered pigments</h3><p>For expressive colour with buildable payoff.</p></div>
          <div className="bento-card bento-inci"><span>03</span><h3>Know every layer.</h3><p>The exact ingredient list for each formula will live here once laboratory documentation is verified.</p><button>View INCI standard <Icon name="arrow" /></button></div>
        </div>
      </section>

      <section className="related shell">
        <div className="section-heading compact"><div><p className="eyebrow dark">Complete the look</p><h2>The finishing pieces.</h2></div></div>
        <div className="related-grid">
          {related.map((item) => <button onClick={() => { onSelect(item); window.scrollTo(0, 0); }} key={item.name}><div><img src={item.image} alt="" /></div><span>{item.category}</span><h3>{item.name}</h3><p>{item.price}</p></button>)}
        </div>
      </section>
      <footer className="pdp-footer"><span>SHE’AURA</span><p>Fashion conscious. Ingredient conscious. Always you.</p><button onClick={onBack}>Return home <Icon name="arrow" /></button></footer>
    </main>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeModalReel, setActiveModalReel] = useState<Reel | null>(null);
  const [introStage, setIntroStage] = useState<"active" | "unveiling" | "completed">("active");
  const handleStartUnveil = useCallback(() => setIntroStage("unveiling"), []);
  const handleCompleteIntro = useCallback(() => setIntroStage("completed"), []);

  if (selectedProduct) {
    return (
      <>
        {introStage !== "completed" && (
          <BrandIntro
            onStartUnveil={handleStartUnveil}
            onComplete={handleCompleteIntro}
          />
        )}
        <ProductPage
          product={selectedProduct}
          onBack={() => {
            setSelectedProduct(null);
            setTimeout(() => document.getElementById("shop")?.scrollIntoView(), 0);
          }}
          onAdd={() => setCartCount((count) => count + 1)}
          onSelect={setSelectedProduct}
          onOpenReel={setActiveModalReel}
        />
        {activeModalReel && (
          <ReelViewerModal
            reel={activeModalReel}
            onClose={() => setActiveModalReel(null)}
            onSelectProduct={setSelectedProduct}
            onAddBag={() => setCartCount((c) => c + 1)}
            reels={reels}
            onSwitchReel={setActiveModalReel}
          />
        )}
      </>
    );
  }

  return (
    <>
      {introStage !== "completed" && (
        <BrandIntro
          onStartUnveil={handleStartUnveil}
          onComplete={handleCompleteIntro}
        />
      )}
      <main>
      <section className={`hero ${introStage === "active" ? "hero-standby" : "hero-unveiled"}`}>
        <img className="hero-bg" src={photos.hero} alt="" />
        <div className="hero-wash" />
        <div className="hero-botanical hero-botanical-left" style={{ backgroundImage: `url(${photos.scarletBotanical})` }} />
        <div className="hero-botanical hero-botanical-right" style={{ backgroundImage: `url(${photos.highlighterBotanical})` }} />
        <header className="nav shell">
           <a className="brand brand-light brand-animated" href="#" aria-label="She Aura">
             <span className="brand-name" aria-hidden="true">SHE’AURA</span>
             <span className="brand-tagline">YOUR AURA · YOUR STORY</span>
           </a>
          <nav className={menuOpen ? "nav-links open" : "nav-links"}>
            {["Shop", "Collections", "Skincare", "Makeup", "About", "Journal"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button aria-label="Search"><Icon name="search" /></button>
            <button aria-label="Account"><Icon name="user" /></button>
            <button aria-label="Shopping bag" className="bag"><Icon name="bag" /><span>{cartCount}</span></button>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><i /><i /></button>
          </div>
        </header>
        <div className="hero-content shell">
          <p className="eyebrow">Beauty in your element</p>
          <h1>A Ritual<br />Beyond<br />Beauty.</h1>
          <p className="hero-copy">Thoughtful formulas. Sensory textures.<br />A more radiant you, every day.</p>
          <div className="hero-cta-group">
            <ArrowLink light>Explore the collection</ArrowLink>
            <button
              type="button"
              className="hero-film-trigger"
              onClick={() => setIntroStage("active")}
              aria-label="Replay Brand Intro"
            >
              <Icon name="play" />
              <span>Replay Intro</span>
            </button>
          </div>
        </div>
        <div className="scroll-note">Scroll to discover <span /></div>
      </section>

      <section className="categories" id="collections">
        {[
          { name: "Makeup", image: photos.scarletBotanical },
          { name: "Glow", image: photos.highlighterBotanical },
          { name: "Best Sellers", image: photos.blushStill },
          { name: "New In", image: photos.highlighterPortrait },
        ].map(({ name, image }) => (
          <a className="category category-photo" href="#shop" key={name}>
            <img className="category-foreground" src={image} alt="" />
            <div className="category-overlay" />
            <div><h3>{name}</h3><span>Explore <Icon name="arrow" /></span></div>
          </a>
        ))}
      </section>

      <section className="manifesto" id="about">
        <div className="manifesto-image"><img src={photos.blushPortrait} alt="SHE’AURA Pink Blossom campaign portrait" /></div>
        <div className="manifesto-copy">
          <div>
            <p className="eyebrow dark">Our philosophy</p>
            <h2>More<br />Than Beauty.</h2>
            <p>We create high-performance formulas that celebrate your individuality — expressive colour, conscious ingredients, and skin that still feels like you.</p>
            <ArrowLink>Our story</ArrowLink>
          </div>
          <div className="image-pair">
            <img src={photos.blushStill} alt="Pink Blossom Blush among flowers" />
            <img src={photos.highlighterBotanical} alt="Molten Glow Highlighter botanical still" />
          </div>
          <div className="values">
            {[["leaf", "Cruelty Free"], ["drop", "Vegan Formulas"], ["sparkle", "Paraben Free"], ["leaf", "Skin Safe"]].map(([icon, label]) => (
              <div key={label}><Icon name={icon as IconName} /><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="shop shell" id="shop">
        <div className="section-heading">
          <div><p className="eyebrow dark">The first drop</p><h2>The SHE’AURA Wardrobe.</h2><p>Statement colour. Skin-conscious formulas. Made to be worn your way.</p></div>
          <ArrowLink>Shop all</ArrowLink>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className={`product-image product-image-${product.category.toLowerCase().replace(" ", "-")}`}>
                {product.tag && <span className="tag">{product.tag}</span>}
                <img className="product-photo" src={product.image} alt={product.name} />
                <button onClick={() => setCartCount((count) => count + 1)} aria-label={`Add ${product.name} to bag`}>+</button>
                <button className="quick-view" onClick={() => { setSelectedProduct(product); window.scrollTo(0, 0); }}>View piece</button>
              </div>
              <span className="product-category">{product.category}</span>
              <h3>{product.name}</h3>
              <div className="product-meta"><p>{product.price}</p><span>{product.note}</span></div>
              <div className="swatches"><i style={{ background: product.tone }} /><i /><i /><span>More shades coming</span></div>
            </article>
          ))}
        </div>
      </section>

      <ReelsSection
        onSelectProduct={setSelectedProduct}
        onAddBag={() => setCartCount((count) => count + 1)}
        onOpenReel={setActiveModalReel}
      />

      <section className="ingredient-wardrobe">
        <div className="ingredient-intro">
          <p className="eyebrow">Inside the formula</p>
          <h2>Ingredients,<br /><i>styled.</i></h2>
          <p>Beauty should look extraordinary and feel considered. Every hero ingredient is chosen for the way it wears, cares, and performs.</p>
          <span className="vertical-note">Traceable · Skin-loving · Intentional</span>
        </div>
        <div className="ingredient-stage">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <img className="ingredient-product" src={photos.scarletBotanical} alt="Scarlet Rose Lipstick botanical campaign" />
          <div className="ingredient-token token-rose">
            <img src={photos.floral} alt="" />
            <span><b>01</b> Botanical waxes</span>
            <p>Comforting glide</p>
          </div>
          <div className="ingredient-token token-vitamin">
            <span className="vitamin-symbol">E</span>
            <span><b>02</b> Antioxidant care</span>
            <p>Antioxidant care</p>
          </div>
          <div className="ingredient-token token-oil">
            <span className="oil-drop" />
            <span><b>03</b> Conditioning oils</span>
            <p>Weightless moisture</p>
          </div>
          <div className="formula-stamp"><Icon name="leaf" /><span>Conscious<br />colour</span></div>
        </div>
      </section>

      <section className="ingredients">
        <img src={photos.ingredients} alt="Dark botanical ingredients and amber glass" />
        <div className="ingredients-shade" />
        <div className="ingredients-copy">
          <p className="eyebrow">Science meets nature</p>
          <h2>Ingredients<br />with Intention.</h2>
          <p>Botanicals, actives and advanced formulations come together to give you real, visible results.</p>
          <ArrowLink light>Discover ingredients</ArrowLink>
        </div>
        <div className="ingredient-list">
          <span>Botanical emollients</span><span>Antioxidant support</span><span>Considered pigments</span><span>Conditioning oils</span>
        </div>
      </section>

      <section className="formulas">
        <div className="formula-copy">
          <p className="eyebrow dark">Why SHE’AURA</p>
          <h2>Thoughtful<br />Formulas.<br />Real Results.</h2>
          <p>Every product is designed to fit into your life — with textures you love, results you can see, and an essential experience that stays with you.</p>
          <ArrowLink>Our process</ArrowLink>
        </div>
        <div className="formula-visual">
          <img src={photos.makeup} alt="SHE’AURA luxury beauty collection" />
          <div className="formula-points">
            <div><b>01</b><span>Sensory<br />textures</span></div>
            <div><b>02</b><span>Skin-loving<br />ingredients</span></div>
            <div><b>03</b><span>Visible<br />results</span></div>
          </div>
        </div>
      </section>

      <section className="journal shell" id="journal">
        <div className="section-heading compact">
          <div><p className="eyebrow dark">The SHE’AURA journal</p><h2>Stories, Rituals and More.</h2></div>
          <ArrowLink>Explore all</ArrowLink>
        </div>
        <div className="journal-grid">
          {[
            ["The Scarlet Statement", photos.scarletPortrait, "The Look"],
            ["The Art of Golden Hour", photos.highlighterPortrait, "Beauty"],
            ["Pink Blossom, In Full Bloom", photos.blushStill, "Campaign"],
          ].map(([title, image, tag]) => (
            <article key={title}><img src={image} alt="" /><span>{tag}</span><h3>{title}</h3><ArrowLink>Read more</ArrowLink></article>
          ))}
        </div>
      </section>

      <CommunityStrip />

      <section className="closing">
        <img src={photos.highlighterBotanical} alt="SHE’AURA Molten Glow Highlighter among flowers" />
        <div><h2>A More Radiant<br />You, Every Day.</h2><ArrowLink>Shop now</ArrowLink></div>
      </section>

      <footer>
        <div className="footer-main shell">
          <a className="brand" href="#">SHE’AURA<span>YOUR AURA · YOUR STORY</span></a>
          <div className="footer-links"><div><b>Shop</b><a href="#shop">Makeup</a><a href="#shop">Skincare</a><a href="#shop">Body Care</a></div><div><b>About</b><a href="#about">Our Story</a><a href="#journal">Journal</a><a href="#">Sustainability</a></div><div><b>Help</b><a href="#">Shipping</a><a href="#">Returns</a><a href="#">Contact</a></div></div>
          <div className="newsletter"><h3>Join Our Circle</h3><p>Our edit of beauty, new launches and more.</p><div><input type="email" placeholder="Your email" aria-label="Your email" /><button aria-label="Subscribe"><Icon name="arrow" /></button></div></div>
        </div>
        <div className="footer-bottom shell"><span>© 2025 SHE’AURA. All rights reserved.</span><div><a href="#">Privacy</a><a href="#">Terms</a><Icon name="instagram" /></div></div>
      </footer>

      {activeModalReel && (
        <ReelViewerModal
          reel={activeModalReel}
          onClose={() => setActiveModalReel(null)}
          onSelectProduct={setSelectedProduct}
          onAddBag={() => setCartCount((c) => c + 1)}
          reels={reels}
          onSwitchReel={setActiveModalReel}
        />
      )}
      </main>
    </>
  );
}
