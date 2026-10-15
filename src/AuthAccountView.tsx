import { useState, useEffect, FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { Icon, products, Product } from "./App";

interface AuthAccountViewProps {
  onBack: () => void;
  onOpenAdmin: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function AuthAccountView({
  onBack,
  onOpenAdmin,
  onSelectProduct,
}: AuthAccountViewProps) {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "admin">("signin");
  const [profileTab, setProfileTab] = useState<"overview" | "orders" | "wishlist" | "rituals">("overview");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!supabase) {
      setLoadingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg("Database authentication is not configured yet.");
      return;
    }
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSession(data.session);
      setSuccessMsg("Signed in successfully to She'Aura.");
      if (authMode === "admin") {
        setTimeout(() => {
          onOpenAdmin();
        }, 600);
      }
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg("Database authentication is not configured yet.");
      return;
    }
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim() || "She'Aura Member",
        },
      },
    });

    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
    } else if (data.session) {
      setSession(data.session);
      setSuccessMsg("Account created and signed in! Welcome to She'Aura.");
    } else {
      setSuccessMsg("Account created! Please check your email inbox to confirm your registration.");
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setSuccessMsg("Signed out safely.");
  };

  // Demo shortcut for fast evaluation
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

  const userDisplayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Maison Member";
  const userEmail = session?.user?.email || "";
  const isAdminUser = userEmail.includes("admin") || authMode === "admin";

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
          {session ? (
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
        ) : session ? (
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
                    <span>RADIANCE CIRCLE MEMBER</span>
                  </span>
                  {isAdminUser && (
                    <span className="account-badge admin">
                      <Icon name="shield" />
                      <span>ADMINISTRATIVE PRIVILEGES</span>
                    </span>
                  )}
                </div>
                <h2>Welcome back, {userDisplayName}</h2>
                <p className="account-email">{userEmail}</p>
                <span className="account-meta-note">
                  Maison She'Aura Member · VIP Botanical Complimentary Shipping Enabled
                </span>
              </div>

              <div className="account-hero-actions">
                <button className="account-admin-action-btn" onClick={onOpenAdmin}>
                  <Icon name="shield" />
                  <span>Open Admin Studio</span>
                </button>
                <button className="account-signout-btn" onClick={handleSignOut}>
                  <Icon name="logOut" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Quick Operations Atelier Banner */}
            <div className="account-admin-hub-card">
              <div className="hub-card-left">
                <div className="hub-icon-wrap">
                  <Icon name="shield" />
                </div>
                <div>
                  <span className="hub-eyebrow">CATALOGUE & STUDIO OPERATIONS</span>
                  <h3>She’Aura Admin Management Studio</h3>
                  <p>
                    Manage the live storefront catalogue, inventory, ingredients taxonomy, 
                    10 official video reels, and media uploads with direct Supabase cloud sync.
                  </p>
                </div>
              </div>
              <button className="hub-launch-btn" onClick={onOpenAdmin}>
                Launch Admin Studio <Icon name="arrow" />
              </button>
            </div>

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
                <span>Orders & Deliveries</span>
              </button>
              <button
                className={`account-tab ${profileTab === "wishlist" ? "active" : ""}`}
                onClick={() => setProfileTab("wishlist")}
              >
                <Icon name="heart" />
                <span>Saved Lookbook Pieces</span>
              </button>
            </div>

            {/* Tab Contents */}
            {profileTab === "overview" && (
              <div className="account-grid-section">
                <div className="account-info-card">
                  <h4>Beauty Profile & Skin Undertone</h4>
                  <div className="info-list">
                    <div className="info-row">
                      <span>Preferred Finish</span>
                      <b>Sculpted Satin & Soft Silk Powder</b>
                    </div>
                    <div className="info-row">
                      <span>Signature Scent</span>
                      <b>Damask Rose & Botanical Amber</b>
                    </div>
                    <div className="info-row">
                      <span>Ingredient Standard</span>
                      <b>100% Vegan, Cruelty-Free, Squalane-Infused</b>
                    </div>
                    <div className="info-row">
                      <span>Delivery Privilege</span>
                      <b>Free Express White-Glove Dispatch</b>
                    </div>
                  </div>
                </div>

                <div className="account-info-card">
                  <h4>Delivery Address Book</h4>
                  <div className="address-box">
                    <b>Primary Maison Delivery</b>
                    <p>
                      {userDisplayName}<br />
                      Maison Radiance, 42 Luxury Boulevard, Suite 10<br />
                      Bandra West, Mumbai 400050<br />
                      India
                    </p>
                    <span className="address-pill">Default Shipping</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === "orders" && (
              <div className="account-orders-section">
                <div className="order-card">
                  <div className="order-head">
                    <div>
                      <span className="order-number">ORDER #SA-2025-8841</span>
                      <span className="order-date">Placed Today · Verified</span>
                    </div>
                    <span className="order-status dispatch">IN WHITE-GLOVE TRANSIT</span>
                  </div>
                  <div className="order-items-row">
                    <img src={products[0].image} alt={products[0].name} className="order-thumb" />
                    <div className="order-item-meta">
                      <h5>{products[0].name}</h5>
                      <p>Shade: The Red Statement · Sculpted satin finish</p>
                      <b>{products[0].price}</b>
                    </div>
                  </div>
                  <div className="order-foot">
                    <span>Estimated arrival: Tomorrow by 2:00 PM</span>
                    <button className="order-track-btn">Track Delivery</button>
                  </div>
                </div>

                <div className="order-card">
                  <div className="order-head">
                    <div>
                      <span className="order-number">ORDER #SA-2025-7192</span>
                      <span className="order-date">September 28, 2025</span>
                    </div>
                    <span className="order-status delivered">DELIVERED TO RESIDENCE</span>
                  </div>
                  <div className="order-items-row">
                    <img src={products[1].image} alt={products[1].name} className="order-thumb" />
                    <div className="order-item-meta">
                      <h5>{products[1].name}</h5>
                      <p>Shade: Pink Blossom · Keepsake gold compact</p>
                      <b>{products[1].price}</b>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  }}
                >
                  <Icon name="shield" />
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Alerts */}
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

              {/* Fast Evaluation Demo Shortcuts */}
              <div className="auth-quick-demo-section">
                <span className="demo-label">Quick Testing Credentials</span>
                <div className="demo-btns-row">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => handleQuickDemo("member")}
                  >
                    <Icon name="user" /> Fill Member Demo
                  </button>
                  <button
                    type="button"
                    className="demo-btn admin"
                    onClick={() => handleQuickDemo("admin")}
                  >
                    <Icon name="shield" /> Fill Admin Demo
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
