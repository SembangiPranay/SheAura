import { useState, useEffect, FormEvent } from "react";
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

interface AuthAccountViewProps {
  onBack: () => void;
  onOpenAdmin: () => void;
  onSelectProduct: (product: Product) => void;
}

const UNDERTONE_OPTIONS = [
  { id: "Warm Golden", label: "Warm Golden", desc: "Olive, bronze, warm peachy undertones" },
  { id: "Neutral Rose", label: "Neutral Rose", desc: "Balanced beige with soft petal rose" },
  { id: "Deep Olive", label: "Deep Olive", desc: "Rich golden green & warm amber tones" },
  { id: "Cool Porcelain", label: "Cool Porcelain", desc: "Pink, blue, alabaster cool undertones" },
];

const FINISH_OPTIONS = [
  "Sculpted satin",
  "Silk powder",
  "Molten pearl",
  "Velvet matte",
  "Dewy liquid radiance",
];

const SCENT_OPTIONS = [
  "Damask Rose & Botanical Amber",
  "Crushed Jasmine & Warm Vanilla",
  "Orange Blossom & Sandalwood",
  "Fragrance-Free Pure Botanical",
];

export default function AuthAccountView({
  onBack,
  onOpenAdmin,
  onSelectProduct,
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
              </div>
              <div className="account-hero-info">
                <div className="account-badge-row">
                  <span className="account-badge tier">
                    <Icon name="sparkle" />
                    <span>{user.tier.toUpperCase()}</span>
                  </span>
                  {isAdminUser && (
                    <span className="account-badge admin">
                      <Icon name="shield" />
                      <span>ADMINISTRATIVE PRIVILEGES</span>
                    </span>
                  )}
                  <span className="account-badge points" style={{ background: "rgba(193, 136, 71, 0.12)", color: "#7d4416" }}>
                    <span>✦ {user.loyaltyPoints} Radiance Points</span>
                  </span>
                </div>
                <h2>Welcome back, {userDisplayName}</h2>
                <p className="account-email">{userEmail}</p>
                <span className="account-meta-note">
                  Member since {user.memberSince} · VIP Botanical Complimentary White-Glove Dispatch Enabled
                </span>
              </div>

              <div className="account-hero-actions">
                {isAdminUser && (
                  <button className="account-admin-action-btn" onClick={onOpenAdmin}>
                    <Icon name="shield" />
                    <span>Open Admin Studio</span>
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
              <div className="account-grid-section">
                <div className="account-info-card">
                  <h4>Beauty Profile & Skin Undertone</h4>
                  <div className="info-list">
                    <div className="info-row">
                      <span>Skin Undertone</span>
                      <b>{user.beautyProfile?.undertone || "Neutral Rose"}</b>
                    </div>
                    <div className="info-row">
                      <span>Preferred Finish</span>
                      <b>{user.beautyProfile?.preferredFinish || "Sculpted satin"}</b>
                    </div>
                    <div className="info-row">
                      <span>Signature Scent</span>
                      <b>{user.beautyProfile?.signatureScent || "Damask Rose & Botanical Amber"}</b>
                    </div>
                    <div className="info-row">
                      <span>Formula Standard</span>
                      <b>100% Vegan, Cruelty-Free, Squalane-Infused</b>
                    </div>
                    <div className="info-row">
                      <span>Delivery Privilege</span>
                      <b>Free White-Glove Dispatch</b>
                    </div>
                  </div>

                  {/* Interactive Ritual Customizer */}
                  <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(223, 184, 149, 0.3)" }}>
                    <span style={{ fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7d2616", display: "block", marginBottom: "8px" }}>
                      Refine Your Undertone
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {UNDERTONE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const updated = updateBeautyProfile({ undertone: opt.id });
                            if (updated) setUser(updated);
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: user.beautyProfile?.undertone === opt.id ? "1.5px solid #32150f" : "1px solid rgba(43, 19, 12, 0.2)",
                            background: user.beautyProfile?.undertone === opt.id ? "#32150f" : "#fdfbf9",
                            color: user.beautyProfile?.undertone === opt.id ? "#ffffff" : "#4b3228",
                            fontSize: "8.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

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
    </div>
  );
}
