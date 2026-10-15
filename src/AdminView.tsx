import { FormEvent, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type Status = "draft" | "published";
type Product = {
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
  category: "",
  price: "",
  description: "",
  short_description: "",
  note: "",
  finish: "",
  mood: "",
  tag: "",
  tone: "#a81920",
  image_url: "",
  campaign_image_url: "",
  ingredients: "",
  benefits: "",
  how_to_use: "",
  size: "",
  stock_quantity: 0,
  status: "draft",
};

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
      setNotice("Product saved successfully.");
      void loadProducts();
      setTimeout(() => setNotice(""), 2500);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminFrame>
        <Notice
          title="Admin unavailable"
          text="Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable this workspace."
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
          <p>Use your authorised She’Aura operations account.</p>
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
          <p>Shape product stories, verify details, and decide what is ready for the storefront.</p>
        </div>
        <div className="admin-header-actions">
          <a href="/" className="admin-back">
            Return to storefront
          </a>
          <button onClick={() => void supabase?.auth.signOut()}>Sign out</button>
        </div>
      </header>

      {error && <div className="admin-error admin-wide">{error}</div>}
      {notice && <div className="admin-notice admin-wide">{notice}</div>}

      <section className="admin-toolbar">
        <div>
          <p className="eyebrow dark">Catalogue</p>
          <h2>
            Products <span>{products.length}</span>
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

      {busy && !editing ? (
        <div className="admin-card">
          <p>Loading catalogue…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-card admin-empty">
          <h2>Your catalogue is quiet.</h2>
          <p>Create the first product to begin building the collection.</p>
        </div>
      ) : (
        <div className="admin-product-list">
          {products.map((p) => (
            <button
              className="admin-product-row"
              key={p.id}
              onClick={() => setEditing({ ...blank, ...p })}
            >
              <span className="admin-product-swatch" style={{ background: p.tone || "#a81920" }} />
              <span className="admin-product-name">
                <b>{p.name}</b>
                <small>{p.category || "Uncategorised"}</small>
              </span>
              <span className={`admin-pill ${p.status || "draft"}`}>{p.status || "draft"}</span>
              <span className="admin-product-price">
                ₹{Number(p.price || 0).toLocaleString("en-IN")}
              </span>
              <span>→</span>
            </button>
          ))}
        </div>
      )}

      {editing && <Editor editing={editing} setEditing={setEditing} save={save} busy={busy} />}
    </AdminFrame>
  );
}

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
      // 1. Try uploading directly to Supabase Storage bucket 'product-media'
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

      // 2. Resilient fallback: read as Base64 Data URL so device upload NEVER fails
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
  const update = (key: keyof Product, value: string) => setEditing({ ...editing, [key]: value });

  const textRows = useMemo(
    () =>
      [
        ["name", "Product name"],
        ["slug", "Slug"],
        ["category", "Category"],
        ["price", "Price (INR)"],
        ["size", "Size / volume"],
        ["stock_quantity", "Stock quantity"],
        ["note", "Short product note"],
        ["finish", "Finish"],
        ["mood", "Mood"],
        ["tag", "Badge / tag"],
        ["tone", "Accent colour"],
      ] as [keyof Product, string][],
    []
  );

  return (
    <section className="admin-editor">
      <div className="admin-editor-head">
        <div>
          <p className="eyebrow dark">{editing.id ? "Edit product" : "New product"}</p>
          <h2>{editing.name || "Untitled product"}</h2>
        </div>
        <button type="button" onClick={() => setEditing(null)}>
          Close
        </button>
      </div>

      <form onSubmit={save} className="admin-form">
        <div className="admin-form-grid">
          {textRows.map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={String(editing[key] ?? "")}
              onChange={(v) => update(key, v)}
              type={
                key === "price" || key === "stock_quantity"
                  ? "number"
                  : key === "tone"
                  ? "color"
                  : "text"
              }
              required={key === "name" || key === "price"}
            />
          ))}
        </div>

        {/* Device Image Uploaders */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "8px 0" }}>
          <ImageUploadField
            label="Product Packshot (Still Photo)"
            value={editing.image_url}
            onChange={(url) => update("image_url", url)}
            hint="Lipstick, compact, or bottle photo"
          />
          <ImageUploadField
            label="Campaign / Editorial Portrait"
            value={editing.campaign_image_url}
            onChange={(url) => update("campaign_image_url", url)}
            hint="Model look, swatch, or editorial shot"
          />
        </div>

        <TextField
          label="Short description"
          value={editing.short_description}
          onChange={(v) => update("short_description", v)}
        />
        <TextField
          label="Description"
          value={editing.description}
          onChange={(v) => update("description", v)}
          required
        />
        <TextField
          label="Benefits (one per line)"
          value={editing.benefits}
          onChange={(v) => update("benefits", v)}
        />
        <TextField
          label="How to use"
          value={editing.how_to_use}
          onChange={(v) => update("how_to_use", v)}
        />
        <TextField
          label="Ingredients / INCI"
          value={editing.ingredients}
          onChange={(v) => update("ingredients", v)}
        />

        <label>
          Status
          <select value={editing.status} onChange={(e) => update("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <button className="admin-primary" disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </button>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
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
        rows={4}
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
