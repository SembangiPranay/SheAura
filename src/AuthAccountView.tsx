import { useState, useEffect, FormEvent, useMemo } from "react";
import {
  SheAuraUser,
  initAuth,
  signIn,
  signUp,
  signOut,
  updateBeautyProfile,
  updateAddress,
  onAuthStateChanged,
} from "./lib/auth";
import { Icon, products, Product } from "./App";
import {
  Sparkles,
  Gift,
  ShoppingBag,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Heart,
  Eye,
  Clock,
  MapPin,
  Lock,
} from "lucide-react";

interface AuthAccountViewProps {
  onBack: () => void;
  onOpenAdmin: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onOpenCart?: () => void;
}

export interface SwatchOption {
  id: string;
  name: string;
  hex: string;
  toneTitle: string;
  desc: string;
  flatteringNote: string;
  matchedLipShades: string;
  bestProductSlugs: string[];
}

export const UNDERTONE_SWATCHES: SwatchOption[] = [
  {
    id: "Fair Porcelain Rose",
    name: "Alabaster Rose",
    hex: "#F5DFD2",
    toneTitle: "Cool Rose & Petal Alabaster",
    desc: "Delicate porcelain with cool pink undertones",
    flatteringNote: "Accentuates soft petal-pink, crushed berry stains, and cool rosewood.",
    matchedLipShades: "Rosewood Velvet · Petal Bloom · Orchid Silk",
    bestProductSlugs: ["lip-01", "face-01", "blush-01"],
  },
  {
    id: "Warm Golden Honey",
    name: "Golden Honey",
    hex: "#E8C6A5",
    toneTitle: "Warm Golden & Peachy Olive",
    desc: "Sun-drenched light/medium with warm golden glow",
    flatteringNote: "Pops dramatically with iconic scarlet red, warm terracotta, and molten amber.",
    matchedLipShades: "The Red Statement · Terracotta Dusk · Molten Glaze",
    bestProductSlugs: ["lip-01", "lip-02", "glow-01"],
  },
  {
    id: "Radiant Neutral Sand",
    name: "Neutral Sand",
    hex: "#DEB887",
    toneTitle: "Balanced Beige & Biscuit",
    desc: "Evenly balanced undertones suited for both satin and dewy finishes",
    flatteringNote: "Universally flattering — pairs effortlessly with rich nudes, spiced rose, and cashmere browns.",
    matchedLipShades: "Spiced Cashmere · Velvet Beige · Rose Squalane",
    bestProductSlugs: ["face-01", "lip-02", "blush-01"],
  },
  {
    id: "Sun-Kissed Bronze",
    name: "Warm Bronze",
    hex: "#C68B59",
    toneTitle: "Golden Ochre & Rich Caramel",
    desc: "Luminous tan with deep amber and golden glow",
    flatteringNote: "Complements molten bronze highlights, deep Bordeaux wine, and warm sunset apricot.",
    matchedLipShades: "Sunset Apricot · Molten Bronze · Scarlet Rose",
    bestProductSlugs: ["glow-01", "lip-01", "face-01"],
  },
  {
    id: "Deep Espresso Velvet",
    name: "Rich Cocoa",
    hex: "#6B3B24",
    toneTitle: "Deep Mahogany & Warm Cocoa",
    desc: "Deep sculpted complexion with rich mahogany warmth",
    flatteringNote: "Stunning with high-pigment bold scarlet, deep plum, and golden glazed glass.",
    matchedLipShades: "Blackberry Velvet · Rich Ruby · Molten Gold",
    bestProductSlugs: ["lip-01", "face-01", "glow-01"],
  },
];

export const VANITY_ARCHETYPES = [
  {
    id: "Old Money Radiance",
    title: "Old Money Radiance",
    tagline: "Polished · Cashmere · Timeless",
    desc: "Luminous, velvet-matte base with sculpted rosewood lips and subtle champagne cheekbones.",
    badge: "✦ Most Adored",
    colors: ["#2b130c", "#dfb895", "#8c4436"],
  },
  {
    id: "Sunlit Glass Skin",
    title: "Sunlit Glass Skin",
    tagline: "Dewy · Glazed · Botanical",
    desc: "Ultra-hydrated, drenched radiance with translucent skin and light-reflecting botanical glow.",
    badge: "✨ Viral Glow",
    colors: ["#f4ede5", "#c18847", "#dfb895"],
  },
  {
    id: "French Girl Effortless",
    title: "French Girl Effortless",
    tagline: "Blurred · Petal · Minimal",
    desc: "Fluffy feathery brows, soft-bitten berry stained pout, and barely-there skin tint.",
    badge: "🍒 Editorial",
    colors: ["#7d2616", "#f9e5dc", "#a81920"],
  },
  {
    id: "Haute Runway Drama",
    title: "Haute Runway Drama",
    tagline: "Sculpted · Bold · Iconic",
    desc: "Saturated signature crimson lips, razor-sharp sculpting, and 24K velvet intensity.",
    badge: "🥀 Runway Muse",
    colors: ["#a81920", "#1a0b07", "#dfb895"],
  },
];

export const SKIN_PRIORITIES = [
  { id: "Glass-Skin Hydration", label: "Glass-Skin Hydration", note: "Plant Squalane & Rosewater" },
  { id: "Poreless Velvet Blur", label: "Poreless Velvet Blur", note: "Soft-Focus Cashmere Micro-Powder" },
  { id: "16H Transfer-Proof", label: "16H Transfer-Proof", note: "Runway-Grade All-Day Wear" },
  { id: "Botanical Barrier Shield", label: "Botanical Barrier Shield", note: "Damask Rose & Centella Calm" },
];

export const FINISH_OPTIONS = [
  "Sculpted satin",
  "Velvet matte",
  "Molten pearl glaze",
  "Soft silk powder",
  "Dewy liquid radiance",
];

export const BIRTHDAY_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AuthAccountView({
  onBack,
  onOpenAdmin,
  onSelectProduct,
  onAddToCart,
  onOpenCart,
}: AuthAccountViewProps) {
  const [user, setUser] = useState<SheAuraUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "admin">("signin");
  const [profileTab, setProfileTab] = useState<"overview" | "orders" | "wishlist" | "rituals">("overview");

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [infoNotice, setInfoNotice] = useState("");
  const [passportToast, setPassportToast] = useState("");

  const showPassportToast = (msg: string) => {
    setPassportToast(msg);
    setTimeout(() => setPassportToast(""), 4500);
  };

  const handleUpdateProfile = (delta: Partial<SheAuraUser["beautyProfile"]>, feedbackMsg?: string) => {
    const updated = updateBeautyProfile(delta);
    if (updated) {
      setUser(updated);
      showPassportToast(feedbackMsg || "✦ Aura Beauty Passport Refined · Saved to Maison Profile");
    }
  };

  const activeSwatch = useMemo(() => {
    return (
      UNDERTONE_SWATCHES.find((s) => s.id === user?.beautyProfile?.undertone) ||
      UNDERTONE_SWATCHES[2]
    );
  }, [user?.beautyProfile?.undertone]);

  const activeArchetype = useMemo(() => {
    return (
      VANITY_ARCHETYPES.find((a) => a.id === user?.beautyProfile?.vanityMood) ||
      VANITY_ARCHETYPES[0]
    );
  }, [user?.beautyProfile?.vanityMood]);

  const curatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.slice(0, 3);
  }, [products]);

  // Modals
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  // Load and listen to auth state
  useEffect(() => {
    window.scrollTo(0, 0);

    initAuth().then((initialUser) => {
      setUser(initialUser);
      setLoadingSession(false);
      if (initialUser?.addressBook?.[0]) {
        const addr = initialUser.addressBook[0];
        setAddressForm({
          fullName: addr.fullName,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
        });
      }
    });

    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoadingSession(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Calculate password strength
  const passwordStrength = (() => {
    if (!password) return { level: 0, text: "", color: "" };
    if (password.length < 6) return { level: 1, text: "Weak (Min. 6 chars)", color: "#e11d48" };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const score = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecial ? 1 : 0) + (password.length >= 8 ? 1 : 0);
    if (score >= 3) return { level: 3, text: "Strong Maison Key", color: "#10b981" };
    return { level: 2, text: "Good", color: "#f59e0b" };
  })();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");
    setInfoNotice("");

    const result = await signIn(email, password);
    setBusy(false);

    if (result.success && result.user) {
      setUser(result.user);
      setSuccessMsg(result.message || "Signed in successfully to She’Aura.");
      if (authMode === "admin" || result.user.role === "admin") {
        setTimeout(() => {
          onOpenAdmin();
        }, 600);
      }
    } else {
      setErrorMsg(result.error || "Unable to sign in. Please verify your email and password.");
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");
    setInfoNotice("");

    const result = await signUp(fullName, email, password);
    setBusy(false);

    if (result.accountExists) {
      // Graceful auto-redirection to Sign In
      setAuthMode("signin");
      setInfoNotice(result.error || "An account already exists for this email. Please enter your password to sign in.");
      return;
    }

    if (result.success && result.user) {
      setUser(result.user);
      setSuccessMsg(result.message || "Account created and signed in! Welcome to She’Aura.");
    } else {
      setErrorMsg(result.error || "Could not register account. Please check the details.");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSuccessMsg("You have safely signed out of your Maison session.");
    setErrorMsg("");
    setInfoNotice("");
  };

  const handleQuickDemo = (type: "member" | "admin") => {
    if (type === "admin") {
      setEmail("admin@sheaura.com");
      setPassword("sheaura2025!");
      setAuthMode("admin");
    } else {
      setEmail("client@sheaura.com");
      setPassword("sheaura2025!");
      setAuthMode("signin");
    }
  };

  const handleDirectDemoLogin = async (type: "member" | "admin") => {
    setBusy(true);
    setErrorMsg("");
    setInfoNotice("");
    const targetEmail = type === "admin" ? "admin@sheaura.com" : "client@sheaura.com";
    const result = await signIn(targetEmail, "sheaura2025!");
    setBusy(false);
    if (result.success && result.user) {
      setUser(result.user);
      setSuccessMsg(result.message || "VIP Demo Session Activated.");
      if (type === "admin") {
        setTimeout(() => onOpenAdmin(), 500);
      }
    }
  };

  const handleSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = updateAddress({
      id: user.addressBook[0]?.id || `addr-${Date.now()}`,
      isDefault: true,
      fullName: addressForm.fullName || user.fullName,
      street: addressForm.street,
      city: addressForm.city,
      state: addressForm.state,
      postalCode: addressForm.postalCode,
      country: addressForm.country,
      phone: addressForm.phone,
    });
    if (updated) {
      setUser(updated);
      setIsEditingAddress(false);
      setSuccessMsg("Maison delivery address updated.");
    }
  };

  const userDisplayName = user?.fullName || user?.email?.split("@")[0] || "Maison Member";
  const userEmail = user?.email || "";
  const isAdminUser = user?.role === "admin" || userEmail.includes("admin") || authMode === "admin";

  return (
    <div className="auth-page">
      {/* Top Haute Navigation */}
      <header className="auth-nav shell">
        <button className="auth-back-btn" onClick={onBack} aria-label="Return to storefront">
          <Icon name="arrow" />
          <span>Return to Storefront</span>
        </button>

        <button className="brand auth-brand" onClick={onBack}>
          SHE’AURA
          <span>YOUR AURA · YOUR STORY</span>
        </button>

        <div className="auth-nav-actions">
          {user ? (
            <button className="auth-pill-btn signout" onClick={handleSignOut} title="Sign Out">
              <Icon name="logOut" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button className="auth-pill-btn admin" onClick={onOpenAdmin} title="Direct Operations Studio">
              <Icon name="shield" />
              <span>Admin Studio</span>
            </button>
          )}
        </div>
      </header>

      <div className="auth-container shell">
        {loadingSession ? (
          <div className="auth-loading-card">
            <div className="auth-spinner" />
            <p>Consulting She’Aura Secure Session…</p>
          </div>
        ) : user ? (
          /* =========================================================================
             AUTHENTICATED STATE: Luxury Member Atelier & Profile Dashboard
             ========================================================================= */
          <div className="account-dashboard">
            {/* User Profile Hero */}
            <div className="account-hero-card">
              <div className="account-avatar-circle">
                <span>{userDisplayName.slice(0, 2).toUpperCase()}</span>
                <span className="account-avatar-halo" />
              </div>
              <div className="account-hero-info">
                <div className="account-badge-row">
                  <span className="account-badge tier">
                    <Icon name="sparkle" />
                    <span>{user.tier.toUpperCase()}</span>
                  </span>
                  <span className="account-badge mood-tag">
                    <Sparkles size={11} strokeWidth={2.2} />
                    <span>{user.beautyProfile?.vanityMood?.toUpperCase() || "OLD MONEY RADIANCE"}</span>
                  </span>
                  <span className="account-badge points">
                    <span>✦ {user.loyaltyPoints} Radiance Points</span>
                  </span>
                  {user.beautyProfile?.birthdayMonth && (
                    <span className="account-badge birthday-tag">
                      <Gift size={11} strokeWidth={2.2} />
                      <span>{user.beautyProfile.birthdayMonth.toUpperCase()} VIP GIFT</span>
                    </span>
                  )}
                  {isAdminUser && (
                    <span className="account-badge admin">
                      <Icon name="shield" />
                      <span>ADMIN STUDIO</span>
                    </span>
                  )}
                </div>
                <h2>Welcome back, {userDisplayName}</h2>
                <p className="account-email">{userEmail}</p>
                <div className="account-aura-summary-bar">
                  <span className="aura-live-dot" />
                  <span>
                    Aura Passport Active: <b>{activeSwatch.name}</b> ({activeSwatch.toneTitle}) · <b>{activeArchetype.title}</b> · Complimentary White-Glove Courier Active
                  </span>
                </div>
              </div>

              <div className="account-hero-actions">
                {isAdminUser && (
                  <button className="account-admin-action-btn" onClick={onOpenAdmin}>
                    <Icon name="shield" />
                    <span>Admin Studio</span>
                  </button>
                )}
                {onOpenCart && (
                  <button
                    type="button"
                    className="account-bag-action-btn"
                    onClick={onOpenCart}
                    title="View Haute Bag & Checkout"
                  >
                    <ShoppingBag size={13} strokeWidth={2} />
                    <span>View Bag</span>
                  </button>
                )}
                <button className="account-signout-btn" onClick={handleSignOut}>
                  <Icon name="logOut" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Quick Operations Atelier Banner for Admins */}
            {isAdminUser && (
              <div className="account-admin-hub-card">
                <div className="hub-card-left">
                  <div className="hub-icon-wrap">
                    <Icon name="shield" />
                  </div>
                  <div>
                    <span className="hub-eyebrow">CATALOGUE & STUDIO OPERATIONS</span>
                    <h3>She’Aura Admin Management Studio</h3>
                    <p>
                      Manage live storefront catalogue, inventory, ingredients taxonomy, 
                      20 official video reels, and media uploads with direct cloud sync.
                    </p>
                  </div>
                </div>
                <button className="hub-launch-btn" onClick={onOpenAdmin}>
                  Launch Admin Studio <Icon name="arrow" />
                </button>
              </div>
            )}

            {/* Dashboard Tabs */}
            <div className="account-tabs-row">
              <button
                className={`account-tab ${profileTab === "overview" ? "active" : ""}`}
                onClick={() => setProfileTab("overview")}
              >
                <Icon name="user" />
                <span>My Profile & Rituals</span>
              </button>
              <button
                className={`account-tab ${profileTab === "orders" ? "active" : ""}`}
                onClick={() => setProfileTab("orders")}
              >
                <Icon name="package" />
                <span>Orders & Deliveries ({user.orders.length})</span>
              </button>
              <button
                className={`account-tab ${profileTab === "wishlist" ? "active" : ""}`}
                onClick={() => setProfileTab("wishlist")}
              >
                <Icon name="heart" />
                <span>Saved Lookbook Pieces</span>
              </button>
            </div>

            {/* TAB 1: Profile & Rituals */}
            {profileTab === "overview" && (
              <div className="account-passport-layout">
                {/* 1. THE AURA BEAUTY PASSPORT (MAIN ATELIER CARD) */}
                <div className="beauty-passport-card">
                  {/* Passport Header */}
                  <div className="passport-card-header">
                    <div className="passport-header-title-group">
                      <span className="passport-eyebrow">
                        <Sparkles size={12} strokeWidth={2.2} style={{ color: "#c18847" }} />
                        <span>MAISON DIAGNOSTIC IDENTITY</span>
                      </span>
                      <h3>Your Aura Beauty Passport</h3>
                      <p>
                        Calibrated for your skin undertone, signature vanity aesthetic, and customized formulation rituals.
                      </p>
                    </div>

                    <div className="passport-active-pill">
                      <span className="passport-pulse-dot" />
                      <span>Passport Active</span>
                    </div>
                  </div>

                  {/* Section A: Complexion & Skin Undertone Swatches */}
                  <div className="passport-section">
                    <div className="passport-section-head">
                      <div>
                        <h4>1. Complexion Tone & Undertone Match</h4>
                        <p>Select your true complexion shade to match lipsticks, blushers, and radiant powders.</p>
                      </div>
                      <span className="passport-current-badge" style={{ backgroundColor: activeSwatch.hex, color: activeSwatch.hex === "#6B3B24" ? "#fff" : "#2b130c" }}>
                        {activeSwatch.name}
                      </span>
                    </div>

                    <div className="swatches-interactive-grid">
                      {UNDERTONE_SWATCHES.map((swatch) => {
                        const isSelected = (user.beautyProfile?.undertone || "Radiant Neutral Sand") === swatch.id;
                        return (
                          <button
                            key={swatch.id}
                            type="button"
                            className={`swatch-card-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              handleUpdateProfile(
                                { undertone: swatch.id },
                                `✓ Undertone calibrated to ${swatch.name} (${swatch.toneTitle})`
                              );
                            }}
                          >
                            <div className="swatch-card-top">
                              <span
                                className="swatch-color-circle"
                                style={{ backgroundColor: swatch.hex }}
                              >
                                {isSelected && <Check size={14} strokeWidth={3} style={{ color: swatch.hex === "#F5DFD2" || swatch.hex === "#E8C6A5" ? "#2b130c" : "#ffffff" }} />}
                              </span>
                              <div className="swatch-meta">
                                <b>{swatch.name}</b>
                                <small>{swatch.toneTitle}</small>
                              </div>
                            </div>
                            <p className="swatch-desc">{swatch.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Flattering Harmony Callout */}
                    <div className="swatch-harmony-box">
                      <div className="harmony-icon-wrap">
                        <Sparkles size={16} strokeWidth={2} style={{ color: "#c18847" }} />
                      </div>
                      <div className="harmony-info">
                        <b>FLATTERING HARMONY FOR {activeSwatch.name.toUpperCase()}:</b>
                        <p>{activeSwatch.flatteringNote}</p>
                        <span className="harmony-matched-shades">
                          Recommended Lip & Cheek Palette: <b>{activeSwatch.matchedLipShades}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Signature Vanity Archetype */}
                  <div className="passport-section">
                    <div className="passport-section-head">
                      <div>
                        <h4>2. Signature Vanity Aesthetic & Aura Style</h4>
                        <p>Choose the cosmetic mood that defines your signature day-to-night presence.</p>
                      </div>
                      <span className="passport-section-tag">
                        {activeArchetype.title}
                      </span>
                    </div>

                    <div className="archetypes-grid">
                      {VANITY_ARCHETYPES.map((arch) => {
                        const isSelected = (user.beautyProfile?.vanityMood || "Old Money Radiance") === arch.id;
                        return (
                          <div
                            key={arch.id}
                            className={`archetype-card ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              handleUpdateProfile(
                                { vanityMood: arch.id },
                                `✓ Vanity Aesthetic set to ${arch.title}`
                              );
                            }}
                          >
                            <div className="archetype-top">
                              <span className="archetype-badge">{arch.badge}</span>
                              <div className="archetype-palette">
                                {arch.colors.map((c, idx) => (
                                  <span key={idx} style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </div>

                            <h5 className="archetype-title">{arch.title}</h5>
                            <span className="archetype-tagline">{arch.tagline}</span>
                            <p className="archetype-desc">{arch.desc}</p>

                            <div className="archetype-footer">
                              <span className="archetype-select-status">
                                {isSelected ? "✓ Selected Aesthetic" : "Select Aesthetic"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section C: Skin Finish & Priorities */}
                  <div className="passport-section">
                    <div className="passport-section-head">
                      <div>
                        <h4>3. Skin Priorities & Finish Preference</h4>
                        <p>Choose your primary skin priority and preferred tactile finish.</p>
                      </div>
                    </div>

                    <div className="priorities-pills-row">
                      {SKIN_PRIORITIES.map((prio) => {
                        const isSelected = (user.beautyProfile?.skinPriority || "Glass-Skin Hydration") === prio.id;
                        return (
                          <button
                            key={prio.id}
                            type="button"
                            className={`priority-pill-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              handleUpdateProfile(
                                { skinPriority: prio.id },
                                `✓ Skin priority updated to ${prio.label}`
                              );
                            }}
                          >
                            <span className="priority-pill-label">{prio.label}</span>
                            <small className="priority-pill-note">{prio.note}</small>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <span className="sub-section-eyebrow">PREFERRED FORMULA FINISH:</span>
                      <div className="finish-pills-row">
                        {FINISH_OPTIONS.map((fin) => {
                          const isSelected = (user.beautyProfile?.preferredFinish || "Sculpted satin") === fin;
                          return (
                            <button
                              key={fin}
                              type="button"
                              className={`finish-pill-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                handleUpdateProfile(
                                  { preferredFinish: fin },
                                  `✓ Preferred finish updated to ${fin}`
                                );
                              }}
                            >
                              {fin}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section D: Birthday Month Indulgence Perk */}
                  <div className="passport-section">
                    <div className="passport-section-head">
                      <div>
                        <h4>4. Maison Birthday Celebration</h4>
                        <p>Receive a complimentary full-size Atelier Satin Lipstick & handwritten Maison note during your birth month.</p>
                      </div>
                    </div>

                    <div className="birthday-selector-row">
                      <div className="birthday-months-scroll">
                        {BIRTHDAY_MONTHS.map((month) => {
                          const isSelected = (user.beautyProfile?.birthdayMonth || "October") === month;
                          return (
                            <button
                              key={month}
                              type="button"
                              className={`birthday-month-pill ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                handleUpdateProfile(
                                  { birthdayMonth: month },
                                  `✓ Birthday Month recorded for ${month} — Deluxe Gift unlocked!`
                                );
                              }}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="birthday-perk-box">
                      <Gift size={22} strokeWidth={1.8} style={{ color: "#c18847", flexShrink: 0 }} />
                      <div className="birthday-perk-info">
                        <b>EXCLUSIVE {user.beautyProfile?.birthdayMonth?.toUpperCase() || "OCTOBER"} BIRTHDAY INDULGENCE:</b>
                        <p>
                          Orders placed during your birthday month automatically include the <b>Maison Keepsake Silk Box</b>, a <b>Full-Size Rose Gold Atelier Lipstick</b>, and <b>Double Radiance Loyalty Points</b>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section E: Curated Vanity Edit (Products Tailored for You) */}
                  <div className="passport-section" style={{ borderBottom: "none", paddingBottom: "0" }}>
                    <div className="passport-section-head">
                      <div>
                        <h4>✦ Curated Pieces For Your Aura</h4>
                        <p>Selected to harmonize specifically with your {activeSwatch.name} undertone and {activeArchetype.title} aesthetic.</p>
                      </div>
                    </div>

                    <div className="curated-products-grid">
                      {curatedProducts.map((prod) => (
                        <div key={prod.name} className="curated-prod-card">
                          <div className="curated-prod-media" onClick={() => { onBack(); onSelectProduct(prod); }}>
                            <img src={prod.image} alt={prod.name} />
                            <span className="curated-match-tag">✦ 98% Tone Match</span>
                          </div>
                          <div className="curated-prod-info">
                            <span className="curated-prod-cat">{prod.category}</span>
                            <h5 onClick={() => { onBack(); onSelectProduct(prod); }}>{prod.name}</h5>
                            <span className="curated-prod-mood">{prod.mood || prod.note || prod.finish}</span>
                            <div className="curated-prod-price-row">
                              <b>{prod.price}</b>
                              {prod.tone && (
                                <span className="curated-tone-dot" style={{ backgroundColor: prod.tone }} />
                              )}
                            </div>
                            <div className="curated-prod-actions">
                              {onAddToCart && (
                                <button
                                  type="button"
                                  className="curated-add-btn"
                                  onClick={() => {
                                    onAddToCart(prod);
                                    showPassportToast(`✓ Added ${prod.name} to your Haute Bag!`);
                                  }}
                                >
                                  <ShoppingBag size={12} strokeWidth={2} />
                                  <span>Add to Bag</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className="curated-view-btn"
                                onClick={() => {
                                  onBack();
                                  onSelectProduct(prod);
                                }}
                                title="Explore Details"
                              >
                                <Eye size={13} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. DELIVERY ADDRESS BOOK & WHITE-GLOVE DETAILS */}
                <div className="account-sidebar-column">
                  <div className="account-info-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid rgba(223, 184, 149, 0.3)" }}>
                    <h4 style={{ margin: 0, padding: 0, border: "none" }}>Delivery Address Book</h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "8.5px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#7d2616",
                        cursor: "pointer",
                      }}
                    >
                      {isEditingAddress ? "Cancel" : "Edit Address"}
                    </button>
                  </div>

                  {isEditingAddress ? (
                    <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Recipient Full Name"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(43, 19, 12, 0.2)", fontSize: "11px" }}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Street Address & Residence"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(43, 19, 12, 0.2)", fontSize: "11px" }}
                        required
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(43, 19, 12, 0.2)", fontSize: "11px" }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(43, 19, 12, 0.2)", fontSize: "11px" }}
                          required
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(43, 19, 12, 0.2)", fontSize: "11px" }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Contact Phone"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(43, 19, 12, 0.2)", fontSize: "11px" }}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          marginTop: "6px",
                          padding: "10px",
                          borderRadius: "999px",
                          background: "#32150f",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "8.5px",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        Save Address
                      </button>
                    </form>
                  ) : (
                    <div className="address-box">
                      <b>Primary Maison Delivery</b>
                      <p>
                        {user.addressBook?.[0]?.fullName || userDisplayName}<br />
                        {user.addressBook?.[0]?.street || "Atelier 18, Couture Boulevard"}<br />
                        {user.addressBook?.[0]?.city || "Mumbai"}, {user.addressBook?.[0]?.state || "Maharashtra"} {user.addressBook?.[0]?.postalCode || "400050"}<br />
                        {user.addressBook?.[0]?.country || "India"}<br />
                        Phone: {user.addressBook?.[0]?.phone || user.phone || "+91 98200 55443"}
                      </p>
                      <span className="address-pill">Default White-Glove Shipping</span>
                    </div>
                  )}
                  </div>

                  {/* Maison Privileges Summary */}
                  <div className="maison-privileges-card">
                    <h5>Maison Muse Privileges</h5>
                    <ul>
                      <li>
                        <Check size={12} strokeWidth={2.5} style={{ color: "#10b981" }} />
                        <span>Complimentary White-Glove Courier</span>
                      </li>
                      <li>
                        <Check size={12} strokeWidth={2.5} style={{ color: "#10b981" }} />
                        <span>Deluxe Botanical Sample in Every Order</span>
                      </li>
                      <li>
                        <Check size={12} strokeWidth={2.5} style={{ color: "#10b981" }} />
                        <span>Hand-Tied Gold Foil Silk Presentation Box</span>
                      </li>
                      <li>
                        <Check size={12} strokeWidth={2.5} style={{ color: "#10b981" }} />
                        <span>Private Runway Cinema Front-Row Access</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Orders & Deliveries */}
            {profileTab === "orders" && (
              <div className="account-orders-section">
                {user.orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: "18px", border: "1px solid rgba(223, 184, 149, 0.45)" }}>
                    <Icon name="package" />
                    <h4 style={{ font: "500 22px 'Cormorant Garamond', serif", color: "#2b130c", margin: "10px 0 6px" }}>No Orders Yet</h4>
                    <p style={{ fontSize: "11px", color: "#765d50", maxWidth: "380px", margin: "0 auto 16px" }}>
                      Your private lookbook rituals will appear here as soon as you place your first order.
                    </p>
                    <button
                      className="hub-launch-btn"
                      onClick={() => {
                        onBack();
                      }}
                    >
                      Explore Storefront Pieces
                    </button>
                  </div>
                ) : (
                  user.orders.map((ord) => (
                    <div key={ord.id} className="order-card">
                      <div className="order-head">
                        <div>
                          <span className="order-number">ORDER #{ord.id}</span>
                          <span className="order-date">{ord.date}</span>
                        </div>
                        <span className={`order-status ${ord.status === "delivered" ? "delivered" : "dispatch"}`}>
                          {ord.status === "delivered" ? "DELIVERED TO RESIDENCE" : "IN WHITE-GLOVE TRANSIT"}
                        </span>
                      </div>

                      {ord.items.map((item, idx) => (
                        <div key={idx} className="order-items-row">
                          <img src={item.image} alt={item.name} className="order-thumb" />
                          <div className="order-item-meta">
                            <h5>{item.name}</h5>
                            <p>Shade: {item.shade}</p>
                            <b>{item.price}</b>
                          </div>
                        </div>
                      ))}

                      <div className="order-foot" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(223, 184, 149, 0.25)" }}>
                        <span style={{ fontSize: "10px", color: "#765d50" }}>
                          Tracking: <b>{ord.trackingNumber}</b> · {ord.eta}
                        </span>
                        <button
                          className="order-track-btn"
                          onClick={() => setTrackingOrder(ord)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "999px",
                            border: "1px solid #7d2616",
                            background: "transparent",
                            color: "#7d2616",
                            fontSize: "8.5px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                          }}
                        >
                          Track Delivery
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Wishlist Pieces */}
            {profileTab === "wishlist" && (
              <div className="account-wishlist-grid">
                {products.map((item) => (
                  <div key={item.name} className="wishlist-item-card">
                    <div className="wishlist-thumb-wrap">
                      <img src={item.image} alt={item.name} />
                      <span className="wishlist-tag">{item.tag}</span>
                    </div>
                    <div className="wishlist-info">
                      <span className="wishlist-cat">{item.category}</span>
                      <h4>{item.name}</h4>
                      <b>{item.price}</b>
                      <button
                        className="wishlist-shop-btn"
                        onClick={() => {
                          onBack();
                          onSelectProduct(item);
                        }}
                      >
                        Explore Details <Icon name="arrow" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tracking Modal */}
            {trackingOrder && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(35, 17, 12, 0.65)",
                  backdropFilter: "blur(8px)",
                  display: "grid",
                  placeItems: "center",
                  zIndex: 9999,
                  padding: "20px",
                }}
                onClick={() => setTrackingOrder(null)}
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    maxWidth: "520px",
                    width: "100%",
                    padding: "28px",
                    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <div>
                      <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", color: "#7d2616", textTransform: "uppercase" }}>
                        White-Glove Courier Dispatch
                      </span>
                      <h3 style={{ font: "500 24px 'Cormorant Garamond', serif", color: "#2b130c", margin: "2px 0 0" }}>
                        Tracking {trackingOrder.id}
                      </h3>
                    </div>
                    <button
                      onClick={() => setTrackingOrder(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "6px" }}
                    >
                      <Icon name="close" />
                    </button>
                  </div>

                  <div style={{ background: "#fbf8f5", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                      <span style={{ color: "#765d50" }}>Logistics Partner</span>
                      <b style={{ color: "#2b130c" }}>BlueDart Apex Express Haute VIP</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                      <span style={{ color: "#765d50" }}>Waybill AWB</span>
                      <b style={{ color: "#2b130c" }}>{trackingOrder.trackingNumber}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <span style={{ color: "#765d50" }}>Status</span>
                      <b style={{ color: "#10b981" }}>{trackingOrder.status === "delivered" ? "Delivered & Signed" : "On Schedule"}</b>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingLeft: "10px", borderLeft: "2px solid #dfb895", marginLeft: "10px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "-16px", top: "3px", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                      <b style={{ fontSize: "11px", color: "#2b130c" }}>Order Placed & Botanical Batch Reserved</b>
                      <p style={{ fontSize: "9.5px", color: "#765d50", margin: "2px 0 0" }}>Maison Mumbai Center · Verified</p>
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "-16px", top: "3px", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                      <b style={{ fontSize: "11px", color: "#2b130c" }}>Artisanal Gift-Wrapped with Gold Seal</b>
                      <p style={{ fontSize: "9.5px", color: "#765d50", margin: "2px 0 0" }}>Prepared in temperature-controlled beauty chamber</p>
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "-16px", top: "3px", width: "10px", height: "10px", borderRadius: "50%", background: trackingOrder.status === "delivered" ? "#10b981" : "#7d2616" }} />
                      <b style={{ fontSize: "11px", color: "#2b130c" }}>In White-Glove Transit</b>
                      <p style={{ fontSize: "9.5px", color: "#765d50", margin: "2px 0 0" }}>Dispatched via express priority route</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setTrackingOrder(null)}
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      padding: "12px",
                      borderRadius: "999px",
                      background: "#32150f",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Close Tracking Window
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             UNAUTHENTICATED STATE: Haute Couture Login & Sign-up Portal
             ========================================================================= */
          <div className="auth-card-wrap">
            <div className="auth-card">
              {/* Header Badges & Title */}
              <div className="auth-card-head">
                <div className="auth-crest">
                  <Icon name="sparkle" />
                </div>
                <span className="auth-eyebrow">
                  {authMode === "admin"
                    ? "SHE’AURA OPERATIONS PORTAL"
                    : "MAISON SHE’AURA MEMBER ATELIER"}
                </span>
                <h2>
                  {authMode === "signup"
                    ? "Create Your Account"
                    : authMode === "admin"
                    ? "Operations Sign In"
                    : "Welcome to She’Aura"}
                </h2>
                <p>
                  {authMode === "signup"
                    ? "Join our intimate circle to access private formula launches, unboxing previews, and couture edits."
                    : authMode === "admin"
                    ? "Enter authorised staff credentials to access the real-time Supabase product and reels studio."
                    : "Sign in with your email to access your rituals, orders, and personalised shade recommendations."}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="auth-mode-tabs">
                <button
                  type="button"
                  className={authMode === "signin" ? "active" : ""}
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                    setInfoNotice("");
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={authMode === "signup" ? "active" : ""}
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                    setInfoNotice("");
                  }}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className={`admin-tab ${authMode === "admin" ? "active" : ""}`}
                  onClick={() => {
                    setAuthMode("admin");
                    setErrorMsg("");
                    setSuccessMsg("");
                    setInfoNotice("");
                  }}
                >
                  <Icon name="shield" />
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Alerts */}
              {infoNotice && (
                <div className="auth-alert" style={{ background: "rgba(193, 136, 71, 0.12)", border: "1px solid rgba(193, 136, 71, 0.35)", color: "#7d4416" }}>
                  <Icon name="sparkle" />
                  <span>{infoNotice}</span>
                </div>
              )}
              {errorMsg && (
                <div className="auth-alert error">
                  <Icon name="close" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="auth-alert success">
                  <Icon name="check" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={authMode === "signup" ? handleSignUp : handleSignIn} className="auth-form">
                {authMode === "signup" && (
                  <div className="auth-field">
                    <label htmlFor="auth-name">Full Name</label>
                    <div className="auth-input-wrap">
                      <Icon name="user" />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="e.g. Maya Sen"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="auth-email">
                    {authMode === "admin" ? "Authorised Staff Email" : "Email Address"}
                  </label>
                  <div className="auth-input-wrap">
                    <Icon name="user" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder={authMode === "admin" ? "admin@sheaura.com" : "you@domain.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label htmlFor="auth-password">Password</label>
                    <button
                      type="button"
                      className="auth-show-pass-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="auth-input-wrap">
                    <Icon name="lock" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Password strength visualizer in signup mode */}
                  {authMode === "signup" && password.length > 0 && (
                    <div style={{ marginTop: "6px" }}>
                      <div style={{ display: "flex", gap: "4px", height: "3px", borderRadius: "2px", overflow: "hidden", background: "rgba(43, 19, 12, 0.1)" }}>
                        <div style={{ flex: 1, background: passwordStrength.level >= 1 ? passwordStrength.color : "transparent", transition: "all 0.3s" }} />
                        <div style={{ flex: 1, background: passwordStrength.level >= 2 ? passwordStrength.color : "transparent", transition: "all 0.3s" }} />
                        <div style={{ flex: 1, background: passwordStrength.level >= 3 ? passwordStrength.color : "transparent", transition: "all 0.3s" }} />
                      </div>
                      <span style={{ fontSize: "8px", color: passwordStrength.color, marginTop: "3px", display: "inline-block", fontWeight: 600 }}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                </div>

                {authMode === "admin" && (
                  <div className="admin-auth-tip">
                    <Icon name="shield" />
                    <span>
                      Logging in here grants access to both your member profile and the{" "}
                      <b>Admin Catalogue Studio</b>.
                    </span>
                  </div>
                )}

                <button type="submit" className="auth-submit-btn" disabled={busy}>
                  {busy ? (
                    <span className="auth-submitting">
                      <span className="btn-spinner" /> Authenticating…
                    </span>
                  ) : authMode === "signup" ? (
                    "Create She’Aura Account"
                  ) : authMode === "admin" ? (
                    "Sign In to Admin Studio"
                  ) : (
                    "Sign In Securely"
                  )}
                </button>
              </form>

              {/* Fast Evaluation Demo Shortcuts with 1-Click Direct Login */}
              <div className="auth-quick-demo-section">
                <span className="demo-label">Instant VIP Testing Credentials</span>
                <div className="demo-btns-row">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => handleDirectDemoLogin("member")}
                    title="1-Click Login as Member"
                  >
                    <Icon name="user" /> VIP Member Demo
                  </button>
                  <button
                    type="button"
                    className="demo-btn admin"
                    onClick={() => handleDirectDemoLogin("admin")}
                    title="1-Click Login as Admin"
                  >
                    <Icon name="shield" /> Admin Studio Demo
                  </button>
                </div>
              </div>

              {/* Direct Bypass to Admin Studio for Developer / Owner */}
              <div className="auth-admin-bypass">
                <span>Already have admin privileges or want to inspect directly?</span>
                <button
                  type="button"
                  className="admin-direct-link"
                  onClick={onOpenAdmin}
                >
                  Enter Admin Studio Directly <Icon name="arrow" />
                </button>
              </div>
            </div>

            {/* Footer Trust Markers */}
            <div className="auth-trust-strip">
              <div>
                <Icon name="shield" />
                <span>Supabase 256-Bit SSL Encrypted Session</span>
              </div>
              <div>
                <Icon name="sparkle" />
                <span>Exclusive Maison Privileges</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {passportToast && (
        <div className="passport-toast-pill">
          <Sparkles size={14} strokeWidth={2.2} style={{ color: "#c18847" }} />
          <span>{passportToast}</span>
        </div>
      )}
    </div>
  );
}
