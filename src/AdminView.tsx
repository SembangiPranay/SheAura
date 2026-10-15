import { FormEvent, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type Status = "draft" | "published";
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
  ingredients: string;
  benefits: string;
  how_to_use: string;
  size: string;
  stock_quantity: number | string;
  status: Status;
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
  tag: "Icon",
  tone: "#a81920",
  image_url: "",
  campaign_image_url: "",
  ingredients: "Damask Rose Petal Extract, Plant Squalane (Olive-Derived), Shea Butter",
  benefits: "12H Hydra-Glide Comfort\nPetal-Soft Satin Texture\n100% Vegan & Cruelty-Free",
  how_to_use: "Glide directly onto bare lips from center outward for sculpted satin payoff.",
  size: "3.8g / 0.13 oz",
  stock_quantity: 50,
  status: "draft",
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

export default function AdminView() {
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
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { data, error: e } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setBusy(false);
    if (e) {
      setError(e.message);
    } else {
      setProducts(
        (data || []).map((product) => ({
          ...product,
          status: product.is_published ? "published" : "draft",
          benefits: Array.isArray(product.benefits) ? product.benefits.join("\n") : product.benefits || "",
        })) as Product[]
      );
    }
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
    if (!supabase || !editing) return;
    setBusy(true);
    setError("");

    const { id, status, ...rest } = editing;
    const payload = {
      ...rest,
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

    const result = id
      ? await supabase.from("products").update(payload).eq("id", id)
      : await supabase.from("products").insert(payload);

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      setEditing(null);
      setNotice(id ? "Product updated successfully." : "New product published to catalogue.");
      void loadProducts();
      setTimeout(() => setNotice(""), 3000);
    }
  }

  async function toggleStatus(product: Product) {
    if (!supabase || !product.id) return;
    const newStatus = product.status === "published" ? "draft" : "published";
    const { error: err } = await supabase
      .from("products")
      .update({ is_published: newStatus === "published" })
      .eq("id", product.id);

    if (err) {
      setError(err.message);
    } else {
      setNotice(`Updated ${product.name} to ${newStatus}.`);
      void loadProducts();
      setTimeout(() => setNotice(""), 2500);
    }
  }

  async function deleteProduct(product: Product) {
    if (!supabase || !product.id) return;
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    setBusy(true);
    const { error: err } = await supabase.from("products").delete().eq("id", product.id);
    setBusy(false);

    if (err) {
      setError(err.message);
    } else {
      setNotice(`Deleted "${product.name}".`);
      if (editing?.id === product.id) setEditing(null);
      void loadProducts();
      setTimeout(() => setNotice(""), 2500);
    }
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
          <a href="/" className="admin-back">
            Return to storefront
          </a>
          <button onClick={() => void supabase?.auth.signOut()}>Sign out</button>
        </div>
      </header>

      {error && (
        <div className="admin-error admin-wide">
          <b>Notice:</b> {error}
        </div>
      )}
      {notice && <div className="admin-notice admin-wide">{notice}</div>}

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
                <b>{p.name}</b>
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
    setEditing({ ...editing, [key]: value });

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
          2. Device Photos
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

        {/* Tab 2: Device Photos */}
        {activeTab === "media" && (
          <div style={{ display: "grid", gap: "18px" }}>
            <p style={{ color: "#765d50", fontSize: "12px", margin: 0 }}>
              Upload authentic photos directly from your computer or phone. Photos will automatically be optimized and hosted in Supabase Storage.
            </p>
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
