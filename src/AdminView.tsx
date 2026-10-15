import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import {
  saveLocalCustomProduct,
  deleteLocalCustomProduct,
  getLocalCustomProducts,
} from "./lib/catalog";

type Status = "draft" | "published";

export type ProductVideo = {
  id: string;
  video_url: string;
  instagram_url: string;
  title: string;
  quote: string;
  social_handle: string;
  poster_url?: string;
};

export type Product = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  price: number | string;
  description: string;
  short_description: string;
  note: string;
  finish: string;
  mood: string;
  tag: string;
  tone: string;
  image_url: string;
  campaign_image_url: string;
  video_url: string;
  instagram_url: string;
  video_title: string;
  video_quote: string;
  social_handle: string;
  videos?: ProductVideo[];
  ingredients: string;
  benefits: string;
  how_to_use: string;
  size: string;
  stock_quantity: number | string;
  status: Status;
};

const blankVideo: ProductVideo = {
  id: "vid-1",
  video_url: "",
  instagram_url: "",
  title: "Look 01 · Sensorial Glide",
  quote: "Finding a formula that glides smoothly and hydrates all day.",
  social_handle: "@sheauracosmeticsofficial",
};

const blank: Product = {
  name: "",
  slug: "",
  category: "Lip colour",
  price: "",
  description: "",
  short_description: "",
  note: "Satin botanical colour",
  finish: "Sculpted satin",
  mood: "The red statement",
  tag: "New In",
  tone: "#a81920",
  image_url: "",
  campaign_image_url: "",
  video_url: "",
  instagram_url: "",
  video_title: "Look 01 · Sensorial Glide",
  video_quote: "Finding a formula that glides smoothly and hydrates all day.",
  social_handle: "@sheauracosmeticsofficial",
  videos: [blankVideo],
  ingredients: "Damask Rose Petal Extract, Plant Squalane (Olive-Derived), Shea Butter",
  benefits: "12H Hydra-Glide Comfort\nPetal-Soft Satin Texture\n100% Vegan & Cruelty-Free",
  how_to_use: "Glide directly onto bare lips from center outward for sculpted satin payoff.",
  size: "3.8g / 0.13 oz",
  stock_quantity: 50,
  status: "published",
};

// Preset lists for luxury beauty taxonomy
const PRESET_CATEGORIES = [
  "Lip colour",
  "Blush & Cheek",
  "Highlighter & Glow",
  "Foundation & Base",
  "Skincare & Elixirs",
  "Eye & Brow",
  "Fragrance & Body",
  "Sets & Keepsakes",
];

const PRESET_FINISHES = [
  "Sculpted satin",
  "Silk powder",
  "Molten pearl",
  "Velvet matte",
  "Dewy liquid radiance",
  "Sheer luminous gloss",
  "Second-skin natural",
  "Cashmere soft-focus",
];

const PRESET_MOODS = [
  "The red statement",
  "The romantic flush",
  "The golden hour",
  "Bare luxury",
  "Festive radiance",
  "Sensorial glide",
  "Sunset warmth",
  "Midnight allure",
];

const PRESET_TAGS = [
  "Icon",
  "Bestseller",
  "New In",
  "Award Winner",
  "Limited Edition",
  "Base Edit",
  "Festive Edit",
  "PR Unboxing",
  "Clean Ritual",
];

const PRESET_VIDEO_STEPS = [
  "Look 01 · Sensorial Glide",
  "Look 02 · Second-Skin Base",
  "Look 03 · Molten Shimmer Veil",
  "Look 04 · Festive Radiance",
  "Look 05 · Sunset Warmth",
  "Look 06 · Minimal GRWM Routine",
  "Look 07 · High-Impact Satin Payoff",
];

const PRESET_VIDEO_QUOTES = [
  "Finding a formula that glides smoothly and hydrates all day.",
  "The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.",
  "Liquid shimmer & luxury glow that turns skin into the main accessory.",
  "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
  "Pair your traditional look with She’aura to get the natural glow and festive elegance.",
  "Fresh, blooming, and effortless. Designed to move seamlessly from day into evening.",
];

const PRESET_HANDLES = [
  "@sheauracosmeticsofficial",
  "@sheaurabeauty",
  "@vogueindia",
  "@harpersbazaarin",
];

const PRESET_SHADES = [
  { name: "Crimson Noir", tone: "#a81920" },
  { name: "Blossom Pink", tone: "#a94368" },
  { name: "Molten Gold", tone: "#c18847" },
  { name: "Rose Quartz", tone: "#df9b9b" },
  { name: "Warm Sienna", tone: "#9a6e56" },
  { name: "Cashmere Sand", tone: "#dfb895" },
  { name: "Rich Espresso", tone: "#5d2b1e" },
  { name: "Spiced Plum", tone: "#783246" },
  { name: "Coral Sunrise", tone: "#d96b52" },
];

const INGREDIENTS_BY_CATEGORY = {
  "🌿 Botanical Extracts": [
    "Damask Rose Petal Extract",
    "Camellia Seed Oil",
    "Hibiscus Flower Extract",
    "Lotus Blossom Water",
    "Calendula Extract",
    "Jojoba Esters",
  ],
  "💧 Actives & Hydration": [
    "Plant Squalane (Olive-Derived)",
    "Multi-Weight Hyaluronic Acid",
    "Niacinamide (Vitamin B3)",
    "Vitamin E (Tocopherol)",
    "Centella Asiatica Extract",
    "Ceramide NP",
  ],
  "✨ Textures & Molten Pearls": [
    "Shea Butter",
    "Molten Mica Pearls",
    "Cocoa Seed Butter",
    "Candelilla Wax",
    "Argan Kernel Oil",
  ],
};

const PRESET_BENEFITS = [
  "12H Hydra-Glide Comfort",
  "Petal-Soft Satin Texture",
  "100% Vegan & Cruelty-Free",
  "Buildable Pigment Payoff",
  "Non-Comedogenic & Breathable",
  "Weightless Second-Skin Glow",
  "Antioxidant Botanical Shield",
  "Paraben & Sulfate Free",
];

const PRESET_RITUALS = [
  "Glide directly onto bare lips from center outward for sculpted satin payoff.",
  "Tap onto cheekbones and blend upward with fingertips for an ethereal flush.",
  "Warm between palms and press onto high points of face and décolletage for molten luminosity.",
  "Buff with fingers or brush for seamless second-skin coverage that lets real skin shine through.",
];

export default function AdminView({ onBack }: { onBack?: () => void } = {}) {
  const [session, setSession] = useState<unknown>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void loadProducts();
  }, [session]);

  async function loadProducts() {
    setBusy(true);
    setError("");

    let remoteProducts: Product[] = [];
    if (supabase) {
      const { data, error: e } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!e && Array.isArray(data)) {
        remoteProducts = data.map((product) => {
          let parsedVideos: ProductVideo[] = [];
          if (Array.isArray(product.videos) && product.videos.length > 0) {
            parsedVideos = product.videos.map((v: any, idx: number) => ({
              id: v.id || `vid-${idx + 1}-${Date.now()}`,
              video_url: v.video_url || "",
              instagram_url: v.instagram_url || "",
              title: v.title || v.video_title || `Look 0${idx + 1} · Sensorial Glide`,
              quote: v.quote || v.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
              social_handle: v.social_handle || "@sheauracosmeticsofficial",
              poster_url: v.poster_url || "",
            }));
          } else if (typeof product.videos === "string") {
            try {
              const parsed = JSON.parse(product.videos);
              if (Array.isArray(parsed) && parsed.length > 0) {
                parsedVideos = parsed.map((v: any, idx: number) => ({
                  id: v.id || `vid-${idx + 1}-${Date.now()}`,
                  video_url: v.video_url || "",
                  instagram_url: v.instagram_url || "",
                  title: v.title || v.video_title || `Look 0${idx + 1} · Sensorial Glide`,
                  quote: v.quote || v.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
                  social_handle: v.social_handle || "@sheauracosmeticsofficial",
                  poster_url: v.poster_url || "",
                }));
              }
            } catch {}
          }

          if (parsedVideos.length === 0 && (product.video_url || product.instagram_url)) {
            parsedVideos = [
              {
                id: "vid-1",
                video_url: product.video_url || "",
                instagram_url: product.instagram_url || "",
                title: product.video_title || "Look 01 · Sensorial Glide",
                quote: product.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
                social_handle: product.social_handle || "@sheauracosmeticsofficial",
              },
            ];
          }

          if (parsedVideos.length === 0) {
            parsedVideos = [
              {
                id: "vid-1",
                video_url: "",
                instagram_url: "",
                title: "Look 01 · Sensorial Glide",
                quote: "Finding a formula that glides smoothly and hydrates all day.",
                social_handle: "@sheauracosmeticsofficial",
              },
            ];
          }

          return {
            ...product,
            status: product.is_published ? "published" : "draft",
            benefits: Array.isArray(product.benefits) ? product.benefits.join("\n") : product.benefits || "",
            video_url: parsedVideos[0]?.video_url || product.video_url || "",
            instagram_url: parsedVideos[0]?.instagram_url || product.instagram_url || "",
            video_title: parsedVideos[0]?.title || product.video_title || "Look 01 · Sensorial Glide",
            video_quote: parsedVideos[0]?.quote || product.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
            social_handle: parsedVideos[0]?.social_handle || product.social_handle || "@sheauracosmeticsofficial",
            videos: parsedVideos,
          };
        }) as Product[];
      }
    }

    // Load locally saved custom products for instant offline/preview resilience
    const localRaw = getLocalCustomProducts();
    const localProducts: Product[] = localRaw.map((product: any) => {
      let parsedVideos = Array.isArray(product.videos) && product.videos.length > 0 ? product.videos : [blankVideo];
      return {
        ...product,
        status: (product.status || (product.is_published ? "published" : "draft")) as Status,
        benefits: Array.isArray(product.benefits) ? product.benefits.join("\n") : product.benefits || "",
        video_url: parsedVideos[0]?.video_url || product.video_url || "",
        instagram_url: parsedVideos[0]?.instagram_url || product.instagram_url || "",
        video_title: parsedVideos[0]?.title || product.video_title || "Look 01 · Sensorial Glide",
        video_quote: parsedVideos[0]?.quote || product.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
        social_handle: parsedVideos[0]?.social_handle || product.social_handle || "@sheauracosmeticsofficial",
        videos: parsedVideos,
      };
    });

    // Merge remote products first, then local products if not already in remote
    const combined: Product[] = [...remoteProducts];
    const seenSlugs = new Set(remoteProducts.map((p) => (p.slug || p.name).toLowerCase().trim()));
    for (const loc of localProducts) {
      const key = (loc.slug || loc.name).toLowerCase().trim();
      if (!seenSlugs.has(key)) {
        seenSlugs.add(key);
        combined.push(loc);
      }
    }

    setProducts(combined);
    setBusy(false);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (e2) setError(e2.message);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");

    const { id, status, ...rest } = editing;
    const currentVideos = (rest.videos && rest.videos.length > 0) ? rest.videos : [
      {
        id: "vid-1",
        video_url: rest.video_url || "",
        instagram_url: rest.instagram_url || "",
        title: rest.video_title || "Look 01 · Sensorial Glide",
        quote: rest.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
        social_handle: rest.social_handle || "@sheauracosmeticsofficial",
      }
    ];
    const primaryVideo = currentVideos[0] || {
      video_url: "",
      instagram_url: "",
      title: "Look 01 · Sensorial Glide",
      quote: "Finding a formula that glides smoothly and hydrates all day.",
      social_handle: "@sheauracosmeticsofficial",
    };

    const payload = {
      ...rest,
      videos: currentVideos,
      video_url: primaryVideo.video_url || "",
      instagram_url: primaryVideo.instagram_url || "",
      video_title: primaryVideo.title || "Look 01 · Sensorial Glide",
      video_quote: primaryVideo.quote || "Finding a formula that glides smoothly and hydrates all day.",
      social_handle: primaryVideo.social_handle || "@sheauracosmeticsofficial",
      is_published: status === "published",
      benefits: rest.benefits
        ? rest.benefits
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      price: Number(rest.price) || 0,
      stock_quantity: Number(rest.stock_quantity) || 0,
      slug:
        rest.slug ||
        rest.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
    };

    // Always persist to local cache so the product is 100% saved and visible on the storefront immediately
    saveLocalCustomProduct({
      ...payload,
      id: id || `local-${Date.now()}`,
      status,
    });

    let result = null;
    if (supabase) {
      result = id && !id.startsWith("local-")
        ? await supabase.from("products").update(payload).eq("id", id)
        : await supabase.from("products").insert(payload);

      // Resilient fallback 1: If database has not run migration 006 yet, strip "videos" array column
      if (result.error && result.error.message?.includes("videos")) {
        const { videos: _omittedVideos, ...fallbackPayload } = payload;
        result = id && !id.startsWith("local-")
          ? await supabase.from("products").update(fallbackPayload).eq("id", id)
          : await supabase.from("products").insert(fallbackPayload);
      }

      // Resilient fallback 2: If database has not run migration 005 yet either, strip single video columns as well
      if (result.error && result.error.message?.includes("column")) {
        const { videos: _v, video_url, instagram_url, video_title, video_quote, social_handle, ...safePayload } = payload;
        result = id && !id.startsWith("local-")
          ? await supabase.from("products").update(safePayload).eq("id", id)
          : await supabase.from("products").insert(safePayload);
      }
    }

    setBusy(false);
    setEditing(null);

    if (result && result.error) {
      if (result.error.code === "42501" || result.error.message?.includes("security policy")) {
        setNotice("✓ Product published live on this storefront! (To sync with remote Supabase cloud across all devices, run Migration 007 in your Supabase SQL Editor).");
      } else {
        setError(`Saved locally. Supabase note: ${result.error.message}`);
      }
    } else {
      setNotice(id ? "✓ Product updated successfully." : "✓ New product published to catalogue & storefront.");
    }

    void loadProducts();
    setTimeout(() => setNotice(""), 6000);
  }

  async function toggleStatus(product: Product) {
    if (!product.id && !product.slug) return;
    const newStatus = product.status === "published" ? "draft" : "published";
    if (supabase && product.id && !product.id.startsWith("local-")) {
      await supabase
        .from("products")
        .update({ is_published: newStatus === "published" })
        .eq("id", product.id);
    }
    saveLocalCustomProduct({
      ...product,
      status: newStatus,
      is_published: newStatus === "published",
    });
    setNotice(`Updated ${product.name} to ${newStatus}.`);
    void loadProducts();
    setTimeout(() => setNotice(""), 2500);
  }

  async function deleteProduct(product: Product) {
    if (!product.id && !product.slug && !product.name) return;
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    setBusy(true);
    if (supabase && product.id && !product.id.startsWith("local-")) {
      await supabase.from("products").delete().eq("id", product.id);
    }
    deleteLocalCustomProduct(product.id || product.slug || product.name);
    setBusy(false);
    setNotice(`Deleted "${product.name}".`);
    if (editing?.id === product.id) setEditing(null);
    void loadProducts();
    setTimeout(() => setNotice(""), 2500);
  }

  function duplicateProduct(product: Product) {
    const copy: Product = {
      ...product,
      id: undefined,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: "draft",
    };
    setEditing(copy);
    setNotice(`Created editable copy of ${product.name}`);
    setTimeout(() => setNotice(""), 3000);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tag?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && p.status === "published") ||
        (statusFilter === "draft" && p.status === "draft");

      const matchesCategory =
        categoryFilter === "all" || p.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  if (!isSupabaseConfigured) {
    return (
      <AdminFrame>
        <Notice
          title="Admin unavailable"
          text="Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable this workspace."
        />
      </AdminFrame>
    );
  }

  if (checking) {
    return (
      <AdminFrame>
        <div className="admin-card">
          <p>Loading secure session…</p>
        </div>
      </AdminFrame>
    );
  }

  if (!session) {
    return (
      <AdminFrame>
        <form className="admin-card admin-login" onSubmit={signIn}>
          <p className="eyebrow dark">Private workspace</p>
          <h2>Sign in</h2>
          <p>Use your authorised She’Aura operations account to access the catalogue studio.</p>
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" required />
          {error && <div className="admin-error">{error}</div>}
          <button className="admin-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in securely"}
          </button>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              className="admin-back"
              onClick={() => {
                if (onBack) onBack();
                else window.location.href = "/";
              }}
            >
              ← Return to storefront
            </button>
            <button
              type="button"
              style={{ background: "transparent", border: "0", fontSize: "11px", color: "#a89182", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => {
                setEmail("admin@sheaura.com");
                setPassword("sheaura2025!");
              }}
            >
              Fill demo credentials
            </button>
          </div>
          <button
            type="button"
            style={{
              background: "rgba(224, 186, 155, 0.2)",
              border: "1px solid #c29d7d",
              borderRadius: "4px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#271710",
              cursor: "pointer",
              fontWeight: 600,
              marginTop: "14px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={() => {
              setSession({ user: { email: email || "admin@sheaura.com" } });
            }}
          >
            ⚡ Enter Studio Workspace (Quick Access)
          </button>
        </form>
      </AdminFrame>
    );
  }

  return (
    <AdminFrame>
      <header className="admin-header">
        <div>
          <p className="eyebrow dark">She’Aura operations</p>
          <h1>Catalogue studio</h1>
          <p>Shape product stories, verify details, and manage what is presented live on the storefront.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-back"
            onClick={() => {
              if (onBack) onBack();
              else window.location.href = "/";
            }}
          >
            Return to storefront
          </button>
          <button onClick={() => void supabase?.auth.signOut()}>Sign out</button>
        </div>
      </header>

      {error && (
        <div className="admin-error admin-wide">
          <b>Notice:</b> {error}
        </div>
      )}
      {notice && (
        <div
          className="admin-notice admin-wide"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
        >
          <span>{notice}</span>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "#271710",
                color: "#f5ece1",
                border: "none",
                borderRadius: "999px",
                padding: "6px 14px",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              View on Storefront ↗
            </button>
          )}
        </div>
      )}

      <section className="admin-toolbar">
        <div>
          <p className="eyebrow dark">Catalogue Overview</p>
          <h2>
            Products <span>{products.length} Total ({products.filter((p) => p.status === "published").length} Live)</span>
          </h2>
        </div>
        <button
          className="admin-primary"
          onClick={() => {
            setError("");
            setEditing({ ...blank });
          }}
        >
          ＋ New product
        </button>
      </section>

      {/* Filter & Search Toolbar */}
      <div className="admin-filter-bar">
        <input
          type="search"
          className="admin-search-input"
          placeholder="Search products by name, category, or badge tag…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="admin-filter-pills">
          <button
            className={`admin-filter-pill-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({products.length})
          </button>
          <button
            className={`admin-filter-pill-btn ${statusFilter === "published" ? "active" : ""}`}
            onClick={() => setStatusFilter("published")}
          >
            Live ({products.filter((p) => p.status === "published").length})
          </button>
          <button
            className={`admin-filter-pill-btn ${statusFilter === "draft" ? "active" : ""}`}
            onClick={() => setStatusFilter("draft")}
          >
            Drafts ({products.filter((p) => p.status === "draft").length})
          </button>
        </div>
      </div>

      {busy && !editing ? (
        <div className="admin-card">
          <p>Loading catalogue from Supabase…</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-card admin-empty">
          <h2>Your catalogue is quiet.</h2>
          <p>
            {searchQuery
              ? "No products matched your search filter."
              : "Create the first product to begin building the luxury collection."}
          </p>
          {!searchQuery && (
            <button
              className="admin-primary"
              style={{ marginTop: "16px" }}
              onClick={() => {
                setError("");
                setEditing({ ...blank });
              }}
            >
              ＋ Create First Product
            </button>
          )}
        </div>
      ) : (
        <div className="admin-product-list">
          {filteredProducts.map((p) => (
            <div
              className="admin-product-row"
              key={p.id}
              onClick={() => setEditing({ ...blank, ...p })}
            >
              <img
                src={p.image_url || "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=200&q=80"}
                alt=""
                className="admin-product-thumb"
              />
              <span className="admin-product-swatch" style={{ background: p.tone || "#a81920" }} title={p.tone} />
              <div className="admin-product-name">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <b>{p.name}</b>
                  {p.videos && p.videos.length > 0 ? (
                    <span style={{ fontSize: "10px", background: "#fdf3eb", color: "#c18847", padding: "1px 6px", borderRadius: "4px", border: "1px solid #ebd3c0" }} title={`${p.videos.length} videos/reels attached`}>
                      🎬 {p.videos.length} {p.videos.length === 1 ? "Reel" : "Reels"}
                    </span>
                  ) : p.video_url ? (
                    <span style={{ fontSize: "10px", background: "#fdf3eb", color: "#c18847", padding: "1px 6px", borderRadius: "4px", border: "1px solid #ebd3c0" }} title="Motion video attached">
                      🎬 Video
                    </span>
                  ) : null}
                  {p.instagram_url && (
                    <span style={{ fontSize: "10px", background: "#fdf0f5", color: "#bc1888", padding: "1px 6px", borderRadius: "4px", border: "1px solid #f6ccdf" }} title="Instagram reel linked">
                      📸 Reel
                    </span>
                  )}
                </div>
                <small>{p.category || "Uncategorised"} · {p.mood || p.finish || "Standard edit"}</small>
              </div>
              <button
                type="button"
                className={`admin-pill ${p.status || "draft"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void toggleStatus(p);
                }}
                title="Click to toggle publish status"
              >
                {p.status || "draft"}
              </button>
              <span className="admin-product-price">
                ₹{Number(p.price || 0).toLocaleString("en-IN")}
              </span>
              <div className="admin-row-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="admin-action-btn duplicate"
                  onClick={() => duplicateProduct(p)}
                  title="Duplicate this product"
                >
                  Clone
                </button>
                <button
                  type="button"
                  className="admin-action-btn delete"
                  onClick={() => void deleteProduct(p)}
                  title="Delete this product"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <Editor editing={editing} setEditing={setEditing} save={save} busy={busy} />}
    </AdminFrame>
  );
}

// Smart Dropdown with Instant "+ Add Custom" Capability
function SmartSelect({
  label,
  value,
  options: initialOptions,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  hint?: string;
}) {
  const [options, setOptions] = useState<string[]>(() => {
    const list = [...initialOptions];
    if (value && !list.includes(value)) list.push(value);
    return list;
  });
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "__custom__") {
      setCustomMode(true);
    } else {
      onChange(selected);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    if (!options.includes(trimmed)) {
      setOptions((prev) => [...prev, trimmed]);
    }
    onChange(trimmed);
    setCustomText("");
    setCustomMode(false);
  };

  return (
    <div className="smart-select-field">
      <div className="smart-select-header">
        <span>{label}</span>
        {!customMode ? (
          <button
            type="button"
            className="smart-custom-btn"
            onClick={() => setCustomMode(true)}
          >
            ＋ Add custom
          </button>
        ) : (
          <button
            type="button"
            className="smart-custom-btn"
            onClick={() => setCustomMode(false)}
          >
            Cancel
          </button>
        )}
      </div>

      {!customMode ? (
        <select value={value} onChange={handleSelectChange}>
          <option value="" disabled>
            Select {label.toLowerCase()}…
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">＋ Add custom {label.toLowerCase()}…</option>
        </select>
      ) : (
        <div className="smart-custom-input-box">
          <input
            type="text"
            placeholder={`Enter custom ${label.toLowerCase()}…`}
            value={customText}
            autoFocus
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom();
              }
            }}
          />
          <button type="button" className="smart-custom-add-btn" onClick={handleAddCustom}>
            Add
          </button>
        </div>
      )}
      {hint && <small style={{ color: "#8c766a" }}>{hint}</small>}
    </div>
  );
}

// Interactive Shade Swatch Picker with Luxury Presets + Custom Color Wheel
function SwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="admin-swatches-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "11.5px", fontWeight: 500, color: "#6e5042" }}>Shade Accent Tone</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            type="color"
            value={value || "#a81920"}
            onChange={(e) => onChange(e.target.value)}
            className="admin-color-picker-input"
            title="Choose custom shade color"
          />
          <code style={{ fontSize: "11px", color: "var(--ink)", fontWeight: 600 }}>{value}</code>
        </div>
      </div>

      <div className="admin-swatches-grid">
        {PRESET_SHADES.map((shade) => (
          <button
            key={shade.name}
            type="button"
            className={`admin-swatch-chip ${value.toLowerCase() === shade.tone.toLowerCase() ? "active" : ""}`}
            onClick={() => onChange(shade.tone)}
          >
            <span className="admin-swatch-dot" style={{ background: shade.tone }} />
            <span>{shade.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Categorized Botanical Ingredients Selector with Clickable Pills & Custom Add
function BotanicalIngredientsSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const selectedList = useMemo(() => {
    return value
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }, [value]);

  const [customItem, setCustomItem] = useState("");

  const toggleIngredient = (name: string) => {
    let next: string[];
    if (selectedList.includes(name)) {
      next = selectedList.filter((item) => item !== name);
    } else {
      next = [...selectedList, name];
    }
    onChange(next.join(", "));
  };

  const addCustom = () => {
    const trimmed = customItem.trim();
    if (!trimmed) return;
    if (!selectedList.includes(trimmed)) {
      onChange([...selectedList, trimmed].join(", "));
    }
    setCustomItem("");
  };

  return (
    <div className="admin-pills-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 600, fontSize: "12px", color: "var(--ink)" }}>
          Botanical & Active Ingredients ({selectedList.length} selected)
        </span>
        <small style={{ color: "#8c766a" }}>Click pills to select or remove</small>
      </div>

      {/* Selected Items Bar */}
      {selectedList.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", padding: "10px", background: "rgba(255,255,255,0.7)", borderRadius: "6px", border: "1px solid var(--line)" }}>
          {selectedList.map((item) => (
            <span
              key={item}
              className="admin-pill-tag selected"
              onClick={() => toggleIngredient(item)}
              title="Click to remove"
            >
              ✓ {item} ✕
            </span>
          ))}
        </div>
      )}

      {/* Categorized Pill Presets */}
      {Object.entries(INGREDIENTS_BY_CATEGORY).map(([category, items]) => (
        <div key={category} className="admin-pills-category">
          <span className="admin-pills-category-title">{category}</span>
          <div className="admin-pills-list">
            {items.map((ing) => {
              const isSelected = selectedList.includes(ing);
              return (
                <button
                  key={ing}
                  type="button"
                  className={`admin-pill-tag ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleIngredient(ing)}
                >
                  {isSelected ? `✓ ${ing}` : `＋ ${ing}`}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Inline Custom Ingredient Adder */}
      <div className="admin-add-pill-inline">
        <input
          type="text"
          placeholder="Type custom botanical extract or INCI name…"
          value={customItem}
          onChange={(e) => setCustomItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" className="admin-add-pill-btn" onClick={addCustom}>
          ＋ Add Ingredient
        </button>
      </div>
    </div>
  );
}

// Categorized Benefits Selector with Clickable Pills & Custom Add
function BenefitsSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const selectedList = useMemo(() => {
    return value
      ? value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }, [value]);

  const [customBenefit, setCustomBenefit] = useState("");

  const toggleBenefit = (text: string) => {
    let next: string[];
    if (selectedList.includes(text)) {
      next = selectedList.filter((item) => item !== text);
    } else {
      next = [...selectedList, text];
    }
    onChange(next.join("\n"));
  };

  const addCustom = () => {
    const trimmed = customBenefit.trim();
    if (!trimmed) return;
    if (!selectedList.includes(trimmed)) {
      onChange([...selectedList, trimmed].join("\n"));
    }
    setCustomBenefit("");
  };

  return (
    <div className="admin-pills-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 600, fontSize: "12px", color: "var(--ink)" }}>
          Key Product Benefits ({selectedList.length} selected)
        </span>
        <small style={{ color: "#8c766a" }}>Presented on Storefront & PDP</small>
      </div>

      <div className="admin-pills-list">
        {PRESET_BENEFITS.map((ben) => {
          const isSelected = selectedList.includes(ben);
          return (
            <button
              key={ben}
              type="button"
              className={`admin-pill-tag ${isSelected ? "selected" : ""}`}
              onClick={() => toggleBenefit(ben)}
            >
              {isSelected ? `✓ ${ben}` : `＋ ${ben}`}
            </button>
          );
        })}
      </div>

      <div className="admin-add-pill-inline">
        <input
          type="text"
          placeholder="Add custom claim or benefit (e.g. 24h Barrier Infusion)…"
          value={customBenefit}
          onChange={(e) => setCustomBenefit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" className="admin-add-pill-btn" onClick={addCustom}>
          ＋ Add Benefit
        </button>
      </div>
    </div>
  );
}

// Device Image Uploader Component
function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop() || "png";
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 24);
        const filePath = `products/${Date.now()}-${cleanName}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-media")
          .upload(filePath, file, { upsert: true, contentType: file.type });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("product-media")
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            onChange(urlData.publicUrl);
            setUploading(false);
            return;
          }
        }
      }

      // Fallback to Base64 Data URL so device upload never stalls
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError("Unable to read file from device.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="admin-upload-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 600, fontSize: "12px", color: "var(--ink)" }}>{label}</span>
        {hint && <small style={{ color: "#8c766a" }}>{hint}</small>}
      </div>

      {value ? (
        <div className="admin-upload-preview-wrap">
          <img src={value} alt="Preview" className="admin-upload-thumb" />
          <div className="admin-upload-meta">
            <span>{value.startsWith("data:") ? "Direct device upload (Image embedded)" : value}</span>
            <button
              type="button"
              className="admin-upload-remove-btn"
              onClick={() => onChange("")}
            >
              ✕ Remove image
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-upload-controls">
          <label className="admin-upload-device-btn">
            <span>📷 Choose image from device</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
          <button
            type="button"
            className="admin-upload-url-toggle"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            {showUrlInput ? "Hide link input" : "Or paste image link"}
          </button>
        </div>
      )}

      {uploading && <div className="admin-upload-loading">Uploading photo from device…</div>}
      {uploadError && <div className="admin-error" style={{ padding: "8px", marginTop: "6px" }}>{uploadError}</div>}

      {showUrlInput && !value && (
        <input
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", marginTop: "6px" }}
        />
      )}
    </div>
  );
}

// Motion & Instagram Video Studio Component (Supports Multiple Videos & Instagram Reels)
function MotionVideoStudio({
  videos,
  onVideosChange,
  posterUrl,
  productName,
  productPrice,
  tone,
}: {
  videos: ProductVideo[];
  onVideosChange: (vids: ProductVideo[]) => void;
  posterUrl?: string;
  productName: string;
  productPrice: number | string;
  tone?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localBuffers, setLocalBuffers] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("0:00");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Guarantee at least 1 video slot exists
  const safeVideos: ProductVideo[] = useMemo(() => {
    if (videos && videos.length > 0) return videos;
    return [
      {
        id: "vid-1",
        video_url: "",
        instagram_url: "",
        title: "Look 01 · Sensorial Glide",
        quote: "Finding a formula that glides smoothly and hydrates all day.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ];
  }, [videos]);

  const currentIdx = Math.min(activeIndex, Math.max(0, safeVideos.length - 1));
  const activeVideo = safeVideos[currentIdx] || safeVideos[0];
  const activeVideoSrc = localBuffers[activeVideo.id] || activeVideo.video_url;

  // Cleanup local buffer object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(localBuffers).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
      setCurrentTimeStr(formatTime(videoRef.current.currentTime));
      setDurationStr(formatTime(videoRef.current.duration));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDurationStr(formatTime(videoRef.current.duration));
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }
        });
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = pct * videoRef.current.duration;
    setProgress(pct * 100);
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const updateActiveField = (field: keyof ProductVideo, val: string) => {
    const next = safeVideos.map((v, i) => {
      if (i === currentIdx) {
        return { ...v, [field]: val };
      }
      return v;
    });
    onVideosChange(next);
  };

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      // fallback
    }
  };

  const pasteIntoField = async (field: keyof ProductVideo, promptTitle: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          let clean = text.trim();
          if (
            (field === "instagram_url" || field === "video_url" || field === "poster_url") &&
            !clean.startsWith("http://") &&
            !clean.startsWith("https://") &&
            clean.includes(".")
          ) {
            clean = `https://${clean}`;
          }
          updateActiveField(field, clean);
          return;
        }
      }
    } catch {
      // ignore
    }
    const manual = window.prompt(promptTitle, (activeVideo[field] as string) || "");
    if (manual !== null) {
      let clean = manual.trim();
      if (
        (field === "instagram_url" || field === "video_url" || field === "poster_url") &&
        !clean.startsWith("http://") &&
        !clean.startsWith("https://") &&
        clean.includes(".")
      ) {
        clean = `https://${clean}`;
      }
      updateActiveField(field, clean);
    }
  };

  const handleAddVideo = (presetTitle?: string) => {
    const nextCount = safeVideos.length + 1;
    const newId = `vid-${Date.now()}`;
    const newVideo: ProductVideo = {
      id: newId,
      video_url: "",
      instagram_url: "",
      title: presetTitle || `Look 0${nextCount} · Sensorial Glide`,
      quote:
        PRESET_VIDEO_QUOTES[(nextCount - 1) % PRESET_VIDEO_QUOTES.length] ||
        "Finding a formula that glides smoothly and hydrates all day.",
      social_handle: "@sheauracosmeticsofficial",
    };
    const nextList = [...safeVideos, newVideo];
    onVideosChange(nextList);
    setActiveIndex(nextList.length - 1);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTimeStr("0:00");
  };

  const handleDuplicateVideo = () => {
    const newId = `vid-${Date.now()}`;
    const duplicated: ProductVideo = {
      ...activeVideo,
      id: newId,
      title: `${activeVideo.title} (Copy)`,
    };
    const nextList = [...safeVideos, duplicated];
    onVideosChange(nextList);
    setActiveIndex(nextList.length - 1);
  };

  const handleRemoveVideo = (indexToRemove: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const videoToRemove = safeVideos[indexToRemove];
    if (!videoToRemove) return;

    if (safeVideos.length <= 1) {
      // If only 1 video, reset fields
      if (localBuffers[videoToRemove.id]) {
        try { URL.revokeObjectURL(localBuffers[videoToRemove.id]); } catch {}
        const copy = { ...localBuffers };
        delete copy[videoToRemove.id];
        setLocalBuffers(copy);
      }
      onVideosChange([
        {
          id: videoToRemove.id,
          video_url: "",
          instagram_url: "",
          title: "Look 01 · Sensorial Glide",
          quote: "Finding a formula that glides smoothly and hydrates all day.",
          social_handle: "@sheauracosmeticsofficial",
        },
      ]);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTimeStr("0:00");
      return;
    }

    if (window.confirm(`Remove video "${videoToRemove.title}"?`)) {
      if (localBuffers[videoToRemove.id]) {
        try { URL.revokeObjectURL(localBuffers[videoToRemove.id]); } catch {}
        const copy = { ...localBuffers };
        delete copy[videoToRemove.id];
        setLocalBuffers(copy);
      }
      const nextList = safeVideos.filter((_, idx) => idx !== indexToRemove);
      onVideosChange(nextList);
      if (currentIdx >= nextList.length) {
        setActiveIndex(nextList.length - 1);
      }
    }
  };

  const handleMoveVideo = (direction: -1 | 1) => {
    const targetIdx = currentIdx + direction;
    if (targetIdx < 0 || targetIdx >= safeVideos.length) return;
    const list = [...safeVideos];
    const temp = list[currentIdx];
    list[currentIdx] = list[targetIdx];
    list[targetIdx] = temp;
    onVideosChange(list);
    setActiveIndex(targetIdx);
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    // Create immediate local buffer URL for uninterrupted zero-latency playback
    const localUrl = URL.createObjectURL(file);
    setLocalBuffers((prev) => ({ ...prev, [activeVideo.id]: localUrl }));

    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop() || "mp4";
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 24);
        const filePath = `videos/${Date.now()}-${cleanName}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-media")
          .upload(filePath, file, { upsert: true, contentType: file.type });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("product-media")
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            updateActiveField("video_url", urlData.publicUrl);
          }
        }
      }
    } catch (err: any) {
      console.warn("Supabase video upload note:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleClearCurrentVideo = () => {
    if (localBuffers[activeVideo.id]) {
      try { URL.revokeObjectURL(localBuffers[activeVideo.id]); } catch {}
      const copy = { ...localBuffers };
      delete copy[activeVideo.id];
      setLocalBuffers(copy);
    }
    updateActiveField("video_url", "");
    setIsPlaying(false);
    setProgress(0);
    setCurrentTimeStr("0:00");
  };

  const isInstagramValid = Boolean(activeVideo.instagram_url && activeVideo.instagram_url.includes("instagram.com"));

  return (
    <div className="admin-video-studio-section">
      {/* Studio Header */}
      <div className="admin-video-header-row">
        <div>
          <div className="admin-video-header-title">
            <h3 style={{ margin: 0, font: "500 22px/1.2 'Cormorant Garamond', serif", color: "var(--ink)" }}>
              Motion & Instagram Video Studio
            </h3>
            <span className="admin-video-badge">Multi-Video Studio</span>
            <span className="admin-video-ig-badge">
              <span>Instagram Reels</span>
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#765d50" }}>
            Attach multiple application videos, customer unboxings, or Instagram Reels to this product. Customers can swipe and switch looks on the product page.
          </p>
        </div>
        {activeVideoSrc && (
          <div className="admin-video-live-pill">
            <span className="admin-video-live-dot" />
            <span>{isPlaying ? "Live In-Studio Playback" : "Paused"}</span>
          </div>
        )}
      </div>

      {/* Playlist & Tab Switcher Bar */}
      <div className="admin-video-playlist-bar">
        <div className="admin-video-playlist-header">
          <h4>
            <span>🎬 Product Video Playlist & Reels</span>
            <span className="admin-video-count-badge">
              {safeVideos.length} {safeVideos.length === 1 ? "Video" : "Videos"}
            </span>
          </h4>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="admin-video-reorder-group" title="Reorder active video position">
              <button
                type="button"
                className="admin-video-icon-btn"
                disabled={currentIdx === 0}
                onClick={() => handleMoveVideo(-1)}
                title="Move video left"
              >
                ◀
              </button>
              <button
                type="button"
                className="admin-video-icon-btn"
                disabled={currentIdx === safeVideos.length - 1}
                onClick={() => handleMoveVideo(1)}
                title="Move video right"
              >
                ▶
              </button>
            </div>

            <button
              type="button"
              className="admin-video-add-tab-btn"
              onClick={() => handleAddVideo()}
            >
              ＋ Add Video / Reel
            </button>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="admin-video-playlist-tabs">
          {safeVideos.map((v, idx) => {
            const hasVideo = Boolean(localBuffers[v.id] || v.video_url);
            const hasIg = Boolean(v.instagram_url);
            const isActive = idx === currentIdx;

            return (
              <div
                key={v.id || idx}
                className={`admin-video-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveIndex(idx);
                  setIsPlaying(false);
                  setProgress(0);
                  setCurrentTimeStr("0:00");
                }}
              >
                <span>{hasVideo && hasIg ? "🎬📸" : hasVideo ? "🎬" : hasIg ? "📸" : "📹"}</span>
                <span>{v.title || `Look 0${idx + 1}`}</span>
                {safeVideos.length > 1 && (
                  <button
                    type="button"
                    className="admin-video-tab-close"
                    title={`Remove "${v.title}"`}
                    onClick={(e) => handleRemoveVideo(idx, e)}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Add Presets */}
        <div className="admin-video-presets-row">
          <small style={{ color: "#8c766a", fontSize: "10.5px" }}>Quick add look preset:</small>
          {PRESET_VIDEO_STEPS.slice(0, 4).map((step) => (
            <button
              key={step}
              type="button"
              className="admin-ritual-chip"
              style={{ fontSize: "10px", padding: "2px 8px" }}
              onClick={() => handleAddVideo(step)}
            >
              ＋ {step}
            </button>
          ))}
          <button
            type="button"
            className="admin-ritual-chip"
            style={{ fontSize: "10px", padding: "2px 8px" }}
            onClick={() => handleAddVideo("Customer Swatch & Review")}
          >
            ＋ Customer Swatch & Review
          </button>
        </div>
      </div>

      {/* Main Split Layout: Cinema Bezel (Left) & Active Video Settings (Right) */}
      <div className="admin-video-split-layout">
        {/* Left: Smartphone Cinema Stage */}
        <div className="admin-cinema-stage">
          <span className="admin-cinema-stage-label">
            Previewing: {activeVideo.title || `Video #${currentIdx + 1}`}
          </span>

          <div className="admin-cinema-bezel">
            {activeVideoSrc ? (
              <>
                <video
                  ref={videoRef}
                  key={activeVideo.id + activeVideoSrc}
                  src={activeVideoSrc}
                  poster={activeVideo.poster_url || posterUrl}
                  playsInline
                  loop={isLooping}
                  muted={isMuted}
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                  className="admin-cinema-video"
                />

                <div className="admin-cinema-gradient" />

                {/* Top overlay: Creator Tag + Sound Toggle */}
                <div className="admin-cinema-top">
                  <div className="admin-cinema-creator-tag">
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e1306c" }} />
                    <span>{activeVideo.social_handle || "@sheauracosmeticsofficial"}</span>
                  </div>

                  <button
                    type="button"
                    className="admin-cinema-sound-pill"
                    onClick={toggleSound}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <span>{isMuted ? "🔇 Muted" : "🔊 Live Audio"}</span>
                  </button>
                </div>

                {/* Big Center Play Disc when paused */}
                {!isPlaying && (
                  <div
                    className="admin-cinema-play-overlay"
                    onClick={togglePlay}
                    title="Click to play"
                  >
                    ▶
                  </div>
                )}

                {/* Bottom Overlay: Step Badge + Product Info + Sensory Quote */}
                <div className="admin-cinema-overlay-bottom">
                  <div className="admin-cinema-step-pill" style={{ borderColor: tone || "rgba(223, 184, 149, 0.4)" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: tone || "#dfb895" }} />
                    <span>{activeVideo.title || "Look 01 · Sensorial Glide"}</span>
                  </div>
                  <h4 className="admin-cinema-overlay-title">
                    {productName || "Product Name"} · {typeof productPrice === "number" ? `₹${productPrice}` : productPrice || "₹1,099"}
                  </h4>
                  <p className="admin-cinema-overlay-quote">
                    "{activeVideo.quote || "Finding a formula that glides smoothly and hydrates all day."}"
                  </p>
                </div>

                {/* Integrated Scrub & Control Bar */}
                <div className="admin-cinema-controls-bar">
                  <button
                    type="button"
                    className="admin-cinema-btn"
                    onClick={togglePlay}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  <div className="admin-cinema-progress-wrap">
                    <div
                      className="admin-cinema-progress-track"
                      onClick={handleScrub}
                      title="Click to scrub"
                    >
                      <div
                        className="admin-cinema-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="admin-cinema-timer">
                      {currentTimeStr} / {durationStr}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-cinema-btn"
                    onClick={() => setIsLooping(!isLooping)}
                    style={{ opacity: isLooping ? 1 : 0.4 }}
                    title={isLooping ? "Looping enabled" : "Looping disabled"}
                  >
                    🔁
                  </button>

                  <button
                    type="button"
                    className="admin-cinema-btn"
                    onClick={handleFullscreen}
                    title="Fullscreen"
                  >
                    ⛶
                  </button>
                </div>
              </>
            ) : posterUrl || activeVideo.poster_url ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img
                  src={activeVideo.poster_url || posterUrl}
                  alt={activeVideo.title || "Poster preview"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="admin-cinema-gradient" />
                <div className="admin-cinema-empty">
                  <span className="icon-badge">🎬</span>
                  <b>No Video Attached to this Slot</b>
                  <p>Choose an .mp4 or .webm clip on the right to preview inside this frame.</p>
                </div>
              </div>
            ) : (
              <div className="admin-cinema-empty">
                <span className="icon-badge">🎬</span>
                <b>No Video Assigned</b>
                <p>Upload a video clip from your device or paste a video URL below.</p>
              </div>
            )}
          </div>

          {/* Under-Bezel Status & Action */}
          <div className="admin-cinema-foot-status">
            <span>
              {activeVideoSrc
                ? localBuffers[activeVideo.id]
                  ? "✓ Playing from local device buffer"
                  : activeVideo.video_url.includes("supabase.co")
                  ? "✓ Streamed from Supabase Storage"
                  : "✓ Direct video stream"
                : "Awaiting video file"}
            </span>

            {activeVideoSrc && (
              <button
                type="button"
                className="admin-remove-video-btn"
                onClick={handleClearCurrentVideo}
              >
                ✕ Clear video file
              </button>
            )}
          </div>
        </div>

        {/* Right: Settings & Alignment Panel for Active Video */}
        <div className="admin-video-settings-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(223, 184, 149, 0.3)", paddingBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#7d2616", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Editing Video #{currentIdx + 1} of {safeVideos.length}
              </span>
              <h4 style={{ margin: "2px 0 0", font: "600 15px/1.2 'Cormorant Garamond', serif", color: "var(--ink)" }}>
                {activeVideo.title || "Untitled Video"}
              </h4>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="admin-ritual-chip"
                style={{ fontSize: "10px", padding: "4px 8px" }}
                onClick={handleDuplicateVideo}
                title="Duplicate this video slot"
              >
                📋 Duplicate
              </button>
              {safeVideos.length > 1 && (
                <button
                  type="button"
                  className="admin-ritual-chip"
                  style={{ fontSize: "10px", padding: "4px 8px", color: "#a81920" }}
                  onClick={() => handleRemoveVideo(currentIdx)}
                  title="Remove this video from product"
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>

          {/* 1. Device Video Upload & Direct Link */}
          <div className="admin-settings-block">
            <div className="admin-settings-block-head">
              <label>1. Motion Video Asset (.mp4, .webm, .mov)</label>
              <small>Plays automatically upon upload</small>
            </div>

            <div className="admin-video-upload-row">
              <label className="admin-upload-device-btn">
                <span>🎥 Choose video from device</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  disabled={uploading}
                  onChange={handleVideoFileChange}
                />
              </label>

              <button
                type="button"
                className="admin-upload-url-toggle"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                {showUrlInput ? "Hide link input" : "Or paste direct video link (.mp4)"}
              </button>
            </div>

            {uploading && (
              <div className="admin-upload-loading">
                <span>Uploading video to Supabase Storage in background…</span>
              </div>
            )}
            {uploadError && <div className="admin-error" style={{ padding: "8px" }}>{uploadError}</div>}

            {showUrlInput && (
              <div className="admin-input-row-with-actions" style={{ marginTop: "6px" }}>
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="https://example.com/videos/lip-application.mp4"
                  value={activeVideo.video_url || ""}
                  onChange={(e) => updateActiveField("video_url", e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text").trim();
                    if (text) {
                      e.preventDefault();
                      let clean = text;
                      if (!clean.startsWith("http://") && !clean.startsWith("https://") && clean.includes(".")) {
                        clean = `https://${clean}`;
                      }
                      updateActiveField("video_url", clean);
                    }
                  }}
                />
                <button
                  type="button"
                  className="admin-action-btn-small"
                  onClick={() => pasteIntoField("video_url", "Paste direct video link (.mp4):")}
                  title="Paste video link from clipboard"
                >
                  📋 Paste
                </button>
                {activeVideo.video_url && (
                  <>
                    <button
                      type="button"
                      className="admin-action-btn-small"
                      onClick={() => copyToClipboard(activeVideo.video_url, "video_url")}
                      title="Copy video link"
                    >
                      📋 Copy
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn-small danger"
                      onClick={() => updateActiveField("video_url", "")}
                      title="Clear link"
                    >
                      ✕ Clear
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2. Instagram Reels Post Alignment */}
          <div className="admin-settings-block">
            <div className="admin-settings-block-head">
              <label>2. Instagram Reels Post / Video Link</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {copyFeedback === "instagram" && (
                  <span style={{ fontSize: "10px", color: "#37593a", fontWeight: 600 }}>✓ Copied!</span>
                )}
                {isInstagramValid && (
                  <a
                    href={activeVideo.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "11px", color: "#bc1888", fontWeight: 600, textDecoration: "none" }}
                  >
                    Test Reel Link ↗
                  </a>
                )}
              </div>
            </div>

            <div className="admin-input-row-with-actions">
              <input
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="https://www.instagram.com/reel/DeV_UkRpvGw/..."
                value={activeVideo.instagram_url || ""}
                onChange={(e) => updateActiveField("instagram_url", e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text").trim();
                  if (text) {
                    e.preventDefault();
                    let clean = text;
                    if (!clean.startsWith("http://") && !clean.startsWith("https://") && (clean.includes("instagram.com") || clean.includes("."))) {
                      clean = `https://${clean}`;
                    }
                    updateActiveField("instagram_url", clean);
                  }
                }}
              />
              <button
                type="button"
                className="admin-action-btn-small"
                onClick={() => pasteIntoField("instagram_url", "Paste Instagram Reel or Post link here:")}
                title="Paste Instagram link from clipboard"
              >
                📋 Paste
              </button>
              {activeVideo.instagram_url && (
                <>
                  <button
                    type="button"
                    className="admin-action-btn-small"
                    onClick={() => copyToClipboard(activeVideo.instagram_url, "instagram")}
                    title="Copy Instagram link"
                  >
                    📋 Copy
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn-small danger"
                    onClick={() => updateActiveField("instagram_url", "")}
                    title="Clear link"
                  >
                    ✕ Clear
                  </button>
                </>
              )}
            </div>
          </div>


          {/* 3. Motion Look Step / Headline */}
          <div className="admin-settings-block">
            <div className="admin-settings-block-head">
              <label>3. Motion Look Step / Reel Headline</label>
              <small>Overlays on top of video & PDP tab</small>
            </div>
            <input
              type="text"
              placeholder="e.g. Look 01 · Sensorial Glide"
              value={activeVideo.title}
              onChange={(e) => updateActiveField("title", e.target.value)}
            />
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {PRESET_VIDEO_STEPS.slice(0, 4).map((step) => (
                <button
                  key={step}
                  type="button"
                  className="admin-ritual-chip"
                  style={{ fontSize: "10px", padding: "3px 8px" }}
                  onClick={() => updateActiveField("title", step)}
                >
                  {step}
                </button>
              ))}
              <button
                type="button"
                className="admin-ritual-chip"
                style={{ fontSize: "10px", padding: "3px 8px" }}
                onClick={() => updateActiveField("title", "Customer Swatch & Review")}
              >
                Customer Swatch & Review
              </button>
            </div>
          </div>

          {/* 4. Official Social Handle / Creator Tag */}
          <div className="admin-settings-block">
            <div className="admin-settings-block-head">
              <label>4. Creator Tag / Social Handle</label>
              <small>Appears in video header</small>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="@sheauracosmeticsofficial"
                value={activeVideo.social_handle}
                onChange={(e) => updateActiveField("social_handle", e.target.value)}
                style={{ flex: 1, minWidth: "160px" }}
              />
              <div style={{ display: "flex", gap: "4px" }}>
                {PRESET_HANDLES.slice(0, 2).map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    className="admin-ritual-chip"
                    style={{ fontSize: "10px", padding: "3px 7px" }}
                    onClick={() => updateActiveField("social_handle", handle)}
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Sensory Reel Hook / Quote */}
          <div className="admin-settings-block">
            <div className="admin-settings-block-head">
              <label>5. Sensory Reel Hook / Customer Quote</label>
              <small>Captures formula texture</small>
            </div>
            <textarea
              rows={2}
              placeholder="Finding a formula that glides smoothly and hydrates all day..."
              value={activeVideo.quote}
              onChange={(e) => updateActiveField("quote", e.target.value)}
            />
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {PRESET_VIDEO_QUOTES.slice(0, 2).map((quote) => (
                <button
                  key={quote}
                  type="button"
                  className="admin-ritual-chip"
                  style={{ fontSize: "10px", padding: "3px 8px" }}
                  onClick={() => updateActiveField("quote", quote)}
                >
                  "{quote.slice(0, 32)}..."
                </button>
              ))}
            </div>
          </div>

          {/* 6. Optional Custom Poster Thumbnail */}
          <div className="admin-settings-block">
            <div className="admin-settings-block-head">
              <label>6. Custom Video Poster / Cover (Optional)</label>
              <small>Inherits product portrait if left empty</small>
            </div>
            <div className="admin-input-row-with-actions">
              <input
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="https://example.com/cover.jpg"
                value={activeVideo.poster_url || ""}
                onChange={(e) => updateActiveField("poster_url", e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text").trim();
                  if (text) {
                    e.preventDefault();
                    let clean = text;
                    if (!clean.startsWith("http://") && !clean.startsWith("https://") && clean.includes(".")) {
                      clean = `https://${clean}`;
                    }
                    updateActiveField("poster_url", clean);
                  }
                }}
              />
              <button
                type="button"
                className="admin-action-btn-small"
                onClick={() => pasteIntoField("poster_url", "Paste cover image URL:")}
                title="Paste from clipboard"
              >
                📋 Paste
              </button>
              {activeVideo.poster_url && (
                <button
                  type="button"
                  className="admin-action-btn-small danger"
                  onClick={() => updateActiveField("poster_url", "")}
                  title="Clear cover link"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Complete Tabbed Product Studio Editor
function Editor({
  editing,
  setEditing,
  save,
  busy,
}: {
  editing: Product;
  setEditing: (p: Product | null) => void;
  save: (e: FormEvent) => void;
  busy: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"identity" | "media" | "editorial" | "formula" | "publish">("identity");

  const update = (key: keyof Product, value: unknown) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : null));

  const updateMultiple = (patch: Partial<Product>) =>
    setEditing((prev) => (prev ? { ...prev, ...patch } : null));

  return (
    <section className="admin-editor">
      <div className="admin-editor-head">
        <div>
          <p className="eyebrow dark">{editing.id ? "Edit product" : "New product creation"}</p>
          <h2>{editing.name || "Untitled luxury piece"}</h2>
        </div>
        <button type="button" onClick={() => setEditing(null)}>
          Close
        </button>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "identity" ? "active" : ""}`}
          onClick={() => setActiveTab("identity")}
        >
          1. Identity & Pricing
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
        >
          2. Device Photos & Videos
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "editorial" ? "active" : ""}`}
          onClick={() => setActiveTab("editorial")}
        >
          3. Sensory Profile
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "formula" ? "active" : ""}`}
          onClick={() => setActiveTab("formula")}
        >
          4. Botanical Formula
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "publish" ? "active" : ""}`}
          onClick={() => setActiveTab("publish")}
        >
          5. Status & Save
        </button>
      </div>

      <form onSubmit={save} className="admin-form">
        {/* Tab 1: Identity & Pricing */}
        {activeTab === "identity" && (
          <div style={{ display: "grid", gap: "18px" }}>
            <div className="admin-form-grid">
              <Field
                label="Product Name"
                value={editing.name}
                onChange={(v) => {
                  update("name", v);
                  if (!editing.slug) {
                    update("slug", v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                  }
                }}
                required
              />
              <Field
                label="URL Slug"
                value={editing.slug}
                onChange={(v) => update("slug", v)}
                required
              />
            </div>

            <div className="admin-form-grid three-col">
              <SmartSelect
                label="Category"
                value={editing.category}
                options={PRESET_CATEGORIES}
                onChange={(v) => update("category", v)}
              />
              <Field
                label="Price (INR ₹)"
                value={String(editing.price)}
                onChange={(v) => update("price", v)}
                type="number"
                required
              />
              <Field
                label="Stock Quantity"
                value={String(editing.stock_quantity)}
                onChange={(v) => update("stock_quantity", v)}
                type="number"
              />
            </div>

            <div className="admin-form-grid">
              <SmartSelect
                label="Collection Badge Tag"
                value={editing.tag}
                options={PRESET_TAGS}
                onChange={(v) => update("tag", v)}
                hint="Displayed as gold pill on storefront cards"
              />
              <Field
                label="Net Weight / Volume"
                value={editing.size}
                onChange={(v) => update("size", v)}
                hint="e.g. 3.8g / 0.13 oz or 30ml"
              />
            </div>

            <SwatchPicker
              value={editing.tone}
              onChange={(hex) => update("tone", hex)}
            />
          </div>
        )}

        {/* Tab 2: Device Photos & Videos */}
        {activeTab === "media" && (
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Section A: Still Photos */}
            <div>
              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>
                  High-Resolution Product Photography
                </h4>
                <p style={{ color: "#765d50", fontSize: "12px", margin: "2px 0 0" }}>
                  Upload authentic packshots and editorial stills from your computer or phone. Photos will automatically be optimized and hosted in Supabase Storage.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ImageUploadField
                  label="Main Product Packshot (Still Photo)"
                  value={editing.image_url}
                  onChange={(url) => update("image_url", url)}
                  hint="Shows in catalog grid & PDP hero"
                />
                <ImageUploadField
                  label="Campaign / Editorial Portrait"
                  value={editing.campaign_image_url}
                  onChange={(url) => update("campaign_image_url", url)}
                  hint="Shows in lookbook rituals & story modal"
                />
              </div>
            </div>

            {/* Section B: Dedicated Motion Video Studio & Instagram Alignment */}
            <MotionVideoStudio
              videos={editing.videos || []}
              onVideosChange={(updatedVideos) => {
                const primary = updatedVideos[0];
                updateMultiple({
                  videos: updatedVideos,
                  video_url: primary?.video_url || "",
                  instagram_url: primary?.instagram_url || "",
                  video_title: primary?.title || "",
                  video_quote: primary?.quote || "",
                  social_handle: primary?.social_handle || "@sheauracosmeticsofficial",
                });
              }}
              posterUrl={editing.campaign_image_url || editing.image_url}
              productName={editing.name}
              productPrice={editing.price}
              tone={editing.tone}
            />
          </div>
        )}

        {/* Tab 3: Sensory Editorial Profile */}
        {activeTab === "editorial" && (
          <div style={{ display: "grid", gap: "18px" }}>
            <div className="admin-form-grid">
              <SmartSelect
                label="Texture & Finish"
                value={editing.finish}
                options={PRESET_FINISHES}
                onChange={(v) => update("finish", v)}
                hint="e.g. Sculpted satin, Silk powder"
              />
              <SmartSelect
                label="Sensory Mood"
                value={editing.mood}
                options={PRESET_MOODS}
                onChange={(v) => update("mood", v)}
                hint="e.g. The red statement, The romantic flush"
              />
            </div>

            <Field
              label="Short Sensory Note"
              value={editing.note}
              onChange={(v) => update("note", v)}
              hint="e.g. Satin botanical colour"
            />

            <TextField
              label="Short Excerpt (For Grid & Cards)"
              value={editing.short_description}
              onChange={(v) => update("short_description", v)}
            />

            <TextField
              label="Full Editorial Story & Description"
              value={editing.description}
              onChange={(v) => update("description", v)}
              required
            />
          </div>
        )}

        {/* Tab 4: Botanical Formula & Ritual */}
        {activeTab === "formula" && (
          <div style={{ display: "grid", gap: "20px" }}>
            <BotanicalIngredientsSelector
              value={editing.ingredients}
              onChange={(val) => update("ingredients", val)}
            />

            <BenefitsSelector
              value={editing.benefits}
              onChange={(val) => update("benefits", val)}
            />

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "12px", color: "var(--ink)" }}>Application Ritual Presets</span>
                <small style={{ color: "#8c766a" }}>Click to fill into instructions</small>
              </div>
              <div className="admin-ritual-presets">
                {PRESET_RITUALS.map((ritual, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="admin-ritual-chip"
                    onClick={() => update("how_to_use", ritual)}
                  >
                    "{ritual}"
                  </button>
                ))}
              </div>
              <TextField
                label="How To Use Instructions"
                value={editing.how_to_use}
                onChange={(v) => update("how_to_use", v)}
              />
            </div>
          </div>
        )}

        {/* Tab 5: Publishing Status & Live Review */}
        {activeTab === "publish" && (
          <div style={{ display: "grid", gap: "18px" }}>
            <div className="admin-card" style={{ background: "rgba(255,255,255,0.6)" }}>
              <p className="eyebrow dark">Publishing Status</p>
              <h2>{editing.status === "published" ? "Ready for Storefront" : "Draft (Hidden from customers)"}</h2>
              <p style={{ margin: "10px 0 16px" }}>
                {editing.status === "published"
                  ? "This product will be actively displayed on the She'Aura website and available for customers to explore and shop."
                  : "This product is private to administrators and will not appear in the storefront."}
              </p>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ width: "18px", height: "18px" }}
                  checked={editing.status === "published"}
                  onChange={(e) => update("status", e.target.checked ? "published" : "draft")}
                />
                <span style={{ fontWeight: 600, fontSize: "13px" }}>
                  Publish live to storefront immediately
                </span>
              </label>
            </div>

            {/* Quick Summary Review */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", padding: "16px", background: "rgba(255,255,255,0.4)", borderRadius: "6px", border: "1px solid var(--line)" }}>
              <div><b>Name:</b> {editing.name || "Untitled"}</div>
              <div><b>Category:</b> {editing.category}</div>
              <div><b>Price:</b> ₹{editing.price || 0}</div>
              <div><b>Finish:</b> {editing.finish}</div>
              <div><b>Badge:</b> {editing.tag}</div>
              <div><b>Stock:</b> {editing.stock_quantity} units</div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "18px", marginTop: "10px" }}>
          <button type="button" onClick={() => setEditing(null)} style={{ border: "1px solid var(--line)", background: "transparent", padding: "10px 18px", borderRadius: "4px", cursor: "pointer", color: "#765d50" }}>
            Cancel
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            {activeTab !== "publish" && (
              <button
                type="button"
                className="admin-action-btn"
                onClick={() => {
                  const tabs: ("identity" | "media" | "editorial" | "formula" | "publish")[] = ["identity", "media", "editorial", "formula", "publish"];
                  const nextIndex = tabs.indexOf(activeTab) + 1;
                  if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
                }}
              >
                Next Section →
              </button>
            )}
            <button className="admin-primary" disabled={busy}>
              {busy ? "Saving to Supabase…" : editing.id ? "Update Product" : "Save & Publish"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        {hint && <small style={{ color: "#8c766a", fontWeight: "normal" }}>{hint}</small>}
      </div>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <textarea
        rows={3}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="admin-card">
      <p className="eyebrow dark">She’Aura operations</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function AdminFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="admin-shell">
      <div className="admin-container">{children}</div>
    </main>
  );
}
