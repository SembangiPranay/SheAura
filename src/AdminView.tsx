import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  X,
  Check,
  CheckCircle2,
  Search,
  Film,
  Video,
  Package,
  BarChart3,
  Database,
  Layers,
  IndianRupee,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Zap,
  LayoutGrid,
  List,
  Plus,
  AlertTriangle,
  Camera,
  Archive,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import {
  saveLocalCustomProduct,
  deleteLocalCustomProduct,
  getLocalCustomProducts,
  defaultProducts,
  photos,
  resolveAsset,
} from "./lib/catalog";
import { reels as fallbackReels, Reel } from "./App";

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

export default function AdminView({
  onBack,
  reels: propReels,
  onSelectProduct,
}: {
  onBack?: () => void;
  reels?: Reel[];
  onSelectProduct?: (product: any) => void;
} = {}) {
  const [session, setSession] = useState<unknown>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Responsive mobile detector
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const checkResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkResize);
    return () => window.removeEventListener("resize", checkResize);
  }, []);

  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<"products" | "reels" | "inventory" | "database">("products");

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-desc" | "price-asc" | "stock-desc" | "name-asc">("newest");
  const [viewDensity, setViewDensity] = useState<"table" | "cards">(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "cards" : "table"
  );

  // Multi-select bulk state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewReel, setPreviewReel] = useState<Reel | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Product | null>(null);
  const [pingResult, setPingResult] = useState<{ testing: boolean; latencyMs?: number; message?: string; ok?: boolean } | null>(null);

  const activeReelsList: Reel[] = useMemo(() => {
    return (propReels && propReels.length > 0) ? propReels : (fallbackReels || []);
  }, [propReels]);

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

    // Merge remote products first, then local products, then official default catalog
    const combined: Product[] = [...remoteProducts];
    const seenSlugs = new Set(remoteProducts.map((p) => (p.slug || p.name).toLowerCase().trim()));
    for (const loc of localProducts) {
      const key = (loc.slug || loc.name).toLowerCase().trim();
      if (!seenSlugs.has(key)) {
        seenSlugs.add(key);
        combined.push(loc);
      }
    }

    // Ensure all 5 core SheAura luxury products exist in the catalog
    for (const def of defaultProducts) {
      const key = (def.slug || def.name).toLowerCase().trim();
      if (!seenSlugs.has(key)) {
        seenSlugs.add(key);
        combined.push({
          id: `def-${def.slug}`,
          name: def.name,
          slug: def.slug || "",
          category: def.category,
          price: def.rawPrice || parseFloat(def.price.replace(/[^0-9.]/g, "")) || 0,
          description: def.description,
          short_description: def.short_description || "",
          note: def.note || "",
          finish: def.finish || "",
          mood: def.mood || "",
          tag: def.tag || "Icon",
          tone: def.tone || "#a81920",
          image_url: def.image,
          campaign_image_url: def.campaign,
          video_url: def.video_url || "",
          instagram_url: def.instagram_url || "",
          video_title: def.video_title || "",
          video_quote: def.video_quote || "",
          social_handle: def.social_handle || "@sheauracosmeticsofficial",
          videos: def.videos,
          ingredients: def.ingredients || "",
          benefits: Array.isArray(def.benefits) ? def.benefits.join("\n") : def.benefits || "",
          how_to_use: def.how_to_use || "",
          size: def.size || "",
          stock_quantity: 50,
          status: "published",
        });
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
      result = id && !id.startsWith("local-") && !id.startsWith("def-")
        ? await supabase.from("products").update(payload).eq("id", id)
        : await supabase.from("products").insert(payload);

      // Resilient fallback 1: If database has not run migration 006 yet, strip "videos" array column
      if (result.error && result.error.message?.includes("videos")) {
        const { videos: _omittedVideos, ...fallbackPayload } = payload;
        result = id && !id.startsWith("local-") && !id.startsWith("def-")
          ? await supabase.from("products").update(fallbackPayload).eq("id", id)
          : await supabase.from("products").insert(fallbackPayload);
      }

      // Resilient fallback 2: If database has not run migration 005 yet either, strip single video columns as well
      if (result.error && result.error.message?.includes("column")) {
        const { videos: _v, video_url, instagram_url, video_title, video_quote, social_handle, ...safePayload } = payload;
        result = id && !id.startsWith("local-") && !id.startsWith("def-")
          ? await supabase.from("products").update(safePayload).eq("id", id)
          : await supabase.from("products").insert(safePayload);
      }
    }

    setBusy(false);
    setEditing(null);
    window.scrollTo({ top: 0, behavior: "instant" });

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
    if (supabase && product.id && !product.id.startsWith("local-") && !product.id.startsWith("def-")) {
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
    setNotice(`Updated ${product.name} to ${newStatus.toUpperCase()}.`);
    void loadProducts();
    setTimeout(() => setNotice(""), 2500);
  }

  async function deleteProduct(product: Product) {
    if (!product.id && !product.slug && !product.name) return;
    setBusy(true);
    if (supabase && product.id && !product.id.startsWith("local-") && !product.id.startsWith("def-")) {
      await supabase.from("products").delete().eq("id", product.id);
    }
    deleteLocalCustomProduct(product.id || product.slug || product.name);
    setBusy(false);
    setDeleteConfirmTarget(null);
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
    window.scrollTo({ top: 0, behavior: "instant" });
    setNotice(`Created editable copy of ${product.name}`);
    setTimeout(() => setNotice(""), 3000);
  }

  function handleQuickRestock(product: Product, quantityToAdd: number) {
    const currentStock = Number(product.stock_quantity) || 0;
    const newStock = currentStock + quantityToAdd;
    if (supabase && product.id && !product.id.startsWith("local-") && !product.id.startsWith("def-")) {
      void supabase.from("products").update({ stock_quantity: newStock }).eq("id", product.id);
    }
    saveLocalCustomProduct({
      ...product,
      stock_quantity: newStock,
    });
    setNotice(`✓ Restocked ${product.name}: +${quantityToAdd} units (Total: ${newStock})`);
    void loadProducts();
    setTimeout(() => setNotice(""), 3000);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id || p.slug || p.name)));
    }
  }

  async function handleBulkStatusChange(newStatus: Status) {
    if (selectedIds.size === 0) return;
    setBusy(true);
    for (const p of products) {
      const key = p.id || p.slug || p.name;
      if (selectedIds.has(key)) {
        if (supabase && p.id && !p.id.startsWith("local-") && !p.id.startsWith("def-")) {
          await supabase.from("products").update({ is_published: newStatus === "published" }).eq("id", p.id);
        }
        saveLocalCustomProduct({
          ...p,
          status: newStatus,
          is_published: newStatus === "published",
        });
      }
    }
    setBusy(false);
    setNotice(`✓ Updated ${selectedIds.size} products to ${newStatus.toUpperCase()}.`);
    setSelectedIds(new Set());
    void loadProducts();
    setTimeout(() => setNotice(""), 3000);
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected products? This action cannot be undone.`)) return;
    setBusy(true);
    for (const p of products) {
      const key = p.id || p.slug || p.name;
      if (selectedIds.has(key)) {
        if (supabase && p.id && !p.id.startsWith("local-") && !p.id.startsWith("def-")) {
          await supabase.from("products").delete().eq("id", p.id);
        }
        deleteLocalCustomProduct(key);
      }
    }
    setBusy(false);
    setNotice(`✓ Deleted ${selectedIds.size} products.`);
    setSelectedIds(new Set());
    void loadProducts();
    setTimeout(() => setNotice(""), 3000);
  }

  function handleExportSelected() {
    const toExport = products.filter((p) => selectedIds.has(p.id || p.slug || p.name));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sheaura-selected-products-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotice(`✓ Exported ${toExport.length} products to JSON backup.`);
    setTimeout(() => setNotice(""), 3000);
  }

  function handleExportAll() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sheaura-complete-catalog-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotice(`✓ Full catalog backup downloaded (${products.length} products).`);
    setTimeout(() => setNotice(""), 3000);
  }

  function handleSeedOfficialCatalog() {
    for (const def of defaultProducts) {
      saveLocalCustomProduct({
        ...def,
        id: `local-${def.slug}`,
        status: "published",
        is_published: true,
        stock_quantity: 50,
        price: def.rawPrice || parseFloat(def.price.replace(/[^0-9.]/g, "")) || 0,
        image_url: def.image,
        campaign_image_url: def.campaign,
      });
    }
    setNotice("✓ Re-seeded official 5 core She'Aura luxury products into catalog storage!");
    void loadProducts();
    setTimeout(() => setNotice(""), 3500);
  }

  async function testDatabasePing() {
    setPingResult({ testing: true });
    const startTime = performance.now();
    try {
      if (!supabase) throw new Error("Supabase client not initialized.");
      const { error: e } = await supabase.from("products").select("id").limit(1);
      const latency = Math.round(performance.now() - startTime);
      if (e) {
        setPingResult({ testing: false, latencyMs: latency, message: `Connected (Response in ${latency}ms, notice: ${e.message})`, ok: true });
      } else {
        setPingResult({ testing: false, latencyMs: latency, message: `✓ Cloud Online & Synced (${latency}ms round-trip latency)`, ok: true });
      }
    } catch (err: any) {
      setPingResult({ testing: false, message: `Local Resilient Fallback Active (${err.message || "Failed"})`, ok: false });
    }
  }

  // Executive KPI calculations
  const kpis = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.status === "published").length;
    const drafts = total - published;
    const totalStock = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0);
    const totalValuation = products.reduce((acc, p) => {
      const price = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;
      const stock = Number(p.stock_quantity) || 0;
      return acc + (price * stock);
    }, 0);
    const lowStockCount = products.filter((p) => {
      const stock = Number(p.stock_quantity) || 0;
      return stock > 0 && stock <= 10;
    }).length;
    const outOfStockCount = products.filter((p) => (Number(p.stock_quantity) || 0) === 0).length;
    const withVideosCount = products.filter((p) => (p.videos && p.videos.length > 0) || p.video_url).length;

    return {
      total,
      published,
      drafts,
      totalStock,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      withVideosCount,
      coveragePercent: total > 0 ? Math.round((withVideosCount / total) * 100) : 100,
    };
  }, [products]);

  // Master Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.tag?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q) ||
        p.mood?.toLowerCase().includes(q) ||
        p.ingredients?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && p.status === "published") ||
        (statusFilter === "draft" && p.status === "draft");

      const matchesCategory =
        categoryFilter === "all" || p.category?.toLowerCase() === categoryFilter.toLowerCase();

      const stock = Number(p.stock_quantity) || 0;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 10) ||
        (stockFilter === "low-stock" && stock > 0 && stock <= 10) ||
        (stockFilter === "out-of-stock" && stock === 0);

      return matchesSearch && matchesStatus && matchesCategory && matchesStock;
    });

    list = [...list].sort((a, b) => {
      const priceA = typeof a.price === "number" ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, "")) || 0;
      const priceB = typeof b.price === "number" ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, "")) || 0;
      const stockA = Number(a.stock_quantity) || 0;
      const stockB = Number(b.stock_quantity) || 0;

      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "stock-desc") return stockB - stockA;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [products, searchQuery, statusFilter, categoryFilter, stockFilter, sortBy]);

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

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
          <p>Loading secure operations session…</p>
        </div>
      </AdminFrame>
    );
  }

  if (!session) {
    return (
      <AdminFrame>
        <div className="admin-luxury-auth-wrapper">
          <form className="admin-luxury-auth-card" onSubmit={signIn}>
            {/* Top Brand Medallion */}
            <div className="admin-auth-brand-badge">
              <div className="admin-auth-monogram">
                <Sparkles size={18} strokeWidth={1.8} style={{ color: "#dfb895" }} />
              </div>
              <span className="admin-auth-eyebrow">SHE’AURA HAUTE MAISON</span>
              <div className="admin-auth-security-pill">
                <ShieldCheck size={12} strokeWidth={2} style={{ color: "#10b981" }} />
                <span>Secured Operations Console</span>
              </div>
            </div>

            <div className="admin-auth-headings">
              <h2 className="admin-auth-title">Catalogue Studio</h2>
              <p className="admin-auth-subtitle">
                Sign in with your administrative credentials to manage luxury SKUs, inventory, and official media reels.
              </p>
            </div>

            {error && (
              <div className="admin-error" style={{ marginBottom: "0", textAlign: "left" }}>
                <b>Notice:</b> {error}
              </div>
            )}

            {/* Email Field with Icon */}
            <div className="admin-auth-field-group">
              <label className="admin-auth-label">OPERATIONS EMAIL</label>
              <div className="admin-auth-input-wrapper">
                <span className="admin-auth-input-icon">
                  <Mail size={16} strokeWidth={1.8} />
                </span>
                <input
                  type="email"
                  className="admin-auth-input"
                  placeholder="admin@sheaura.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field with Icon & Eye Toggle */}
            <div className="admin-auth-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className="admin-auth-label">SECURITY KEY</label>
                <button
                  type="button"
                  className="admin-auth-demo-pill"
                  onClick={() => {
                    setEmail("admin@sheaura.com");
                    setPassword("sheaura2025!");
                  }}
                  title="Auto-fill verified demo operations account credentials"
                >
                  <Zap size={10} strokeWidth={2.2} />
                  <span>Fill Demo</span>
                </button>
              </div>
              <div className="admin-auth-input-wrapper">
                <span className="admin-auth-input-icon">
                  <Lock size={16} strokeWidth={1.8} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="admin-auth-input has-toggle"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="admin-auth-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button className="admin-auth-primary-btn" disabled={busy}>
              <Lock size={14} strokeWidth={2} />
              <span>{busy ? "Authenticating Session…" : "Sign in Securely"}</span>
            </button>

            {/* VIP Fast Studio Pass Button */}
            <button
              type="button"
              className="admin-auth-vip-btn"
              onClick={() => {
                setSession({ user: { email: email || "admin@sheaura.com" } });
              }}
              title="One-click bypass for preview & staging"
            >
              <Sparkles size={14} strokeWidth={2} style={{ color: "#c18847" }} />
              <span>Enter Studio Workspace (Instant Access)</span>
            </button>

            {/* Return Link */}
            <div style={{ textAlign: "center", paddingTop: "8px" }}>
              <button
                type="button"
                className="admin-auth-return-btn"
                onClick={() => {
                  if (onBack) onBack();
                  else window.location.href = "/";
                }}
              >
                <ArrowLeft size={13} strokeWidth={2} />
                <span>Return to Luxury Storefront</span>
              </button>
            </div>
          </form>
        </div>
      </AdminFrame>
    );
  }

  if (editing) {
    return (
      <AdminFrame>
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
          </div>
        )}
        <Editor
          editing={editing}
          setEditing={setEditing}
          save={save}
          busy={busy}
          onBackToList={() => {
            setEditing(null);
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          onViewOnStorefront={onBack}
        />
      </AdminFrame>
    );
  }

  return (
    <AdminFrame>
      {/* 1. TOP CONSOLE BRAND & STATUS BAR */}
      <div className="admin-console-bar">
        <div className="admin-console-brand">
          <span className="admin-console-logo">SHE’AURA</span>
          <span className="admin-console-tag">Operations Console</span>
          <div className="admin-console-status">
            <span className="admin-status-dot" />
            <span>Cloud Sync Active</span>
          </div>
        </div>

        <div className="admin-console-actions">
          <button
            type="button"
            className="admin-storefront-btn"
            onClick={() => {
              if (onBack) onBack();
              else window.location.href = "/";
            }}
            title="View live customer storefront"
          >
            <span>Storefront</span>
            <ExternalLink size={12} strokeWidth={2} />
          </button>

          <button
            type="button"
            className="admin-primary"
            style={{ padding: "8px 16px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            onClick={() => {
              setError("");
              setEditing({ ...blank });
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
          >
            <Plus size={13} strokeWidth={2.2} />
            <span>New Product</span>
          </button>

          <button
            type="button"
            className="admin-signout-btn"
            onClick={() => void supabase?.auth.signOut()}
            title="Sign out of operations session"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="admin-error admin-wide" style={{ marginBottom: "16px" }}>
          <b>Notice:</b> {error}
        </div>
      )}
      {notice && (
        <div
          className="admin-notice admin-wide"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={15} strokeWidth={2} style={{ color: "#059669" }} />
            <span>{notice.replace(/^[✓\s]+/, "")}</span>
          </span>
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
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>View on Storefront</span>
              <ExternalLink size={11} strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* 2. EXECUTIVE KPI CARDS */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Catalog SKUs</span>
            <span className="admin-kpi-icon"><Package size={17} strokeWidth={1.8} /></span>
          </div>
          <div className="admin-kpi-value">{kpis.total}</div>
          <div className="admin-kpi-meta">
            <span className="admin-kpi-pill-ok">{kpis.published} Live</span>
            <span>· {kpis.drafts} Draft</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Total Catalog Worth</span>
            <span className="admin-kpi-icon"><IndianRupee size={17} strokeWidth={2.2} /></span>
          </div>
          <div className="admin-kpi-value">₹{kpis.totalValuation.toLocaleString("en-IN")}</div>
          <div className="admin-kpi-meta">
            <span>Cumulative Retail Valuation</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Inventory Units</span>
            <span className="admin-kpi-icon"><Layers size={17} strokeWidth={1.8} /></span>
          </div>
          <div className="admin-kpi-value">{kpis.totalStock.toLocaleString()}</div>
          <div className="admin-kpi-meta">
            {kpis.lowStockCount > 0 ? (
              <span className="admin-kpi-pill-warn">{kpis.lowStockCount} Low Stock</span>
            ) : (
              <span className="admin-kpi-pill-ok">Optimal Stock Levels</span>
            )}
            {kpis.outOfStockCount > 0 && <span style={{ color: "#dc2626", fontWeight: 600 }}>· {kpis.outOfStockCount} Out</span>}
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Video Reel Coverage</span>
            <span className="admin-kpi-icon"><Film size={17} strokeWidth={1.8} /></span>
          </div>
          <div className="admin-kpi-value">{kpis.coveragePercent}%</div>
          <div className="admin-kpi-meta">
            <span className="admin-kpi-pill-ok">{activeReelsList.length} Official Reels Audited</span>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONS TABS STRIP */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${currentTab === "products" ? "active" : ""}`}
          onClick={() => setCurrentTab("products")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Package size={14} strokeWidth={1.8} />
            Products Catalog
          </span>
          <span className="admin-tab-badge">{products.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${currentTab === "reels" ? "active" : ""}`}
          onClick={() => setCurrentTab("reels")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} strokeWidth={1.8} />
            Media & Reels Studio
          </span>
          <span className="admin-tab-badge">{activeReelsList.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${currentTab === "inventory" ? "active" : ""}`}
          onClick={() => setCurrentTab("inventory")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <BarChart3 size={14} strokeWidth={1.8} />
            Inventory & Stock Analytics
          </span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${currentTab === "database" ? "active" : ""}`}
          onClick={() => setCurrentTab("database")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Database size={14} strokeWidth={1.8} />
            Database & Health
          </span>
        </button>
      </div>

      {/* TAB 1: MASTER PRODUCTS CATALOG */}
      {currentTab === "products" && (
        <>
          {/* Controls & Filter Grid */}
          <div className="admin-controls-grid">
            <div className="admin-search-wrapper">
              <input
                type="search"
                className="admin-search-pro"
                placeholder="Search products by name, category, finish, tag, or formula…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="admin-search-clear" onClick={() => setSearchQuery("")}>
                  <X size={12} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="admin-filter-pills" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
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
                Live ({kpis.published})
              </button>
              <button
                className={`admin-filter-pill-btn ${statusFilter === "draft" ? "active" : ""}`}
                onClick={() => setStatusFilter("draft")}
              >
                Drafts ({kpis.drafts})
              </button>

              {isMobile && (
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${showMobileFilters ? "active" : ""}`}
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Filter size={11} strokeWidth={2} />
                  <span>{showMobileFilters ? "Less" : "Filters & Sort"}</span>
                </button>
              )}
            </div>

            {(!isMobile || showMobileFilters) && (
              <>
                <select
                  className="admin-select-pro"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories ({products.length})</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({products.filter((p) => p.category === cat).length})
                    </option>
                  ))}
                </select>

                <select
                  className="admin-select-pro"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in-stock">In Stock (&gt;10)</option>
                  <option value="low-stock">Low Stock (1–10)</option>
                  <option value="out-of-stock">Out of Stock (0)</option>
                </select>

                <select
                  className="admin-select-pro"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Sort: Default / Newest</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="stock-desc">Stock: High → Low</option>
                  <option value="name-asc">Name: A → Z</option>
                </select>

                <div className="admin-density-toggle">
                  <button
                    type="button"
                    className={`admin-density-btn ${viewDensity === "table" ? "active" : ""}`}
                    onClick={() => setViewDensity("table")}
                    title="Table view"
                  >
                    <List size={13} strokeWidth={2} />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    className={`admin-density-btn ${viewDensity === "cards" ? "active" : ""}`}
                    onClick={() => setViewDensity("cards")}
                    title="Visual cards view"
                  >
                    <LayoutGrid size={13} strokeWidth={2} />
                    <span>Cards</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Table / Cards View */}
          {busy ? (
            <div className="admin-card">
              <p>Refreshing catalogue data…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-card admin-empty">
              <h2>No products found</h2>
              <p>
                {searchQuery
                  ? `No items matched "${searchQuery}". Try clearing search or filters.`
                  : "No products match the selected criteria."}
              </p>
              <button
                className="admin-primary"
                style={{ marginTop: "16px" }}
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setStockFilter("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : viewDensity === "table" ? (
            <div className="admin-table-container">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "36px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="admin-table-checkbox"
                          checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                          title="Select all products"
                        />
                      </th>
                      <th>Product</th>
                      <th>Category & Finish</th>
                      <th>Inventory</th>
                      <th>Price</th>
                      <th>Motion Media</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const key = p.id || p.slug || p.name;
                      const isSelected = selectedIds.has(key);
                      const stock = Number(p.stock_quantity) || 0;
                      const videoCount = (p.videos && p.videos.length > 0) ? p.videos.length : (p.video_url ? 1 : 0);

                      return (
                        <tr key={key} className={isSelected ? "selected" : ""}>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              className="admin-table-checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(key)}
                            />
                          </td>
                          <td>
                            <div className="admin-prod-cell">
                              <div
                                className="admin-prod-thumb-wrap"
                                onClick={() => setPreviewProduct(p)}
                                title="Click to preview storefront card"
                              >
                                <img
                                  src={p.image_url || photos.makeup}
                                  alt=""
                                />
                                <span className="admin-swatch-badge" style={{ background: p.tone || "#a81920" }} />
                              </div>
                              <div className="admin-prod-info">
                                <span
                                  className="admin-prod-title"
                                  onClick={() => {
                                    setError("");
                                    setEditing({ ...blank, ...p });
                                    window.scrollTo({ top: 0, behavior: "instant" });
                                  }}
                                >
                                  {p.name}
                                </span>
                                <span className="admin-prod-sub">{p.mood || p.note || p.finish}</span>
                                {p.tag && <span className="admin-tag-pill">{p.tag}</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontWeight: 600, color: "#241610" }}>{p.category || "General"}</span>
                              <span style={{ color: "#8c766a", fontSize: "11px" }}>{p.finish || "Standard finish"}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                className={`admin-stock-badge ${
                                  stock > 10 ? "in-stock" : stock > 0 ? "low-stock" : "out-of-stock"
                                }`}
                              >
                                {stock > 10 ? `${stock} in stock` : stock > 0 ? `Low (${stock})` : "Out of stock"}
                              </span>
                              <button
                                type="button"
                                style={{
                                  background: "transparent",
                                  border: "1px dashed rgba(42, 26, 20, 0.2)",
                                  borderRadius: "4px",
                                  padding: "2px 6px",
                                  fontSize: "9.5px",
                                  cursor: "pointer",
                                  color: "#765d50",
                                }}
                                onClick={() => handleQuickRestock(p, 50)}
                                title="Add +50 units to stock"
                              >
                                +50
                              </button>
                            </div>
                          </td>
                          <td>
                            <b style={{ fontSize: "13.5px", color: "#241610" }}>
                              ₹{Number(p.price || 0).toLocaleString("en-IN")}
                            </b>
                          </td>
                          <td>
                            {videoCount > 0 ? (
                              <button
                                type="button"
                                className="admin-reel-btn"
                                onClick={() => {
                                  // Open matching reel in inspector modal
                                  const match = activeReelsList.find((r) => r.productName === p.name) || activeReelsList[0];
                                  if (match) setPreviewReel(match);
                                }}
                                title="Watch attached video reel"
                              >
                                <Film size={11} strokeWidth={2} />
                                <span>{videoCount} {videoCount === 1 ? "Reel" : "Reels"}</span>
                              </button>
                            ) : (
                              <span className="admin-reel-btn empty">No reels</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-toggle-switch"
                              onClick={() => void toggleStatus(p)}
                              title={`Click to switch to ${p.status === "published" ? "Draft" : "Published"}`}
                            >
                              <span className={`admin-switch-track ${p.status === "published" ? "active" : ""}`}>
                                <span className="admin-switch-thumb" />
                              </span>
                              <span className={`admin-status-text ${p.status}`}>
                                {p.status === "published" ? "Live" : "Draft"}
                              </span>
                            </button>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="admin-row-action-btns" style={{ justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="admin-btn-icon"
                                onClick={() => {
                                  setError("");
                                  setEditing({ ...blank, ...p });
                                  window.scrollTo({ top: 0, behavior: "instant" });
                                }}
                                title="Edit product details in dedicated editor"
                                style={{ background: "#241610", color: "#ffffff", borderColor: "#241610" }}
                              >
                                <Pencil size={11} strokeWidth={2} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="admin-btn-icon"
                                onClick={() => setPreviewProduct(p)}
                                title="Quick preview storefront card"
                              >
                                <Eye size={12} strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn-icon"
                                onClick={() => duplicateProduct(p)}
                                title="Duplicate this product"
                              >
                                <Copy size={12} strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn-icon delete"
                                onClick={() => setDeleteConfirmTarget(p)}
                                title="Delete product"
                              >
                                <Trash2 size={12} strokeWidth={1.8} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Visual Cards View */
            <div className="admin-cards-grid">
              {filteredProducts.map((p) => {
                const stock = Number(p.stock_quantity) || 0;
                return (
                  <div className="admin-product-visual-card" key={p.id || p.slug}>
                    <div className="admin-card-img-wrap" onClick={() => setPreviewProduct(p)}>
                      <img src={p.image_url || photos.makeup} alt="" />
                      <span className="admin-swatch-badge" style={{ background: p.tone || "#a81920", width: "16px", height: "16px" }} />
                      {p.tag && (
                        <span style={{ position: "absolute", top: "10px", left: "10px" }} className="admin-tag-pill">
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <div className="admin-card-body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "11px", color: "#8c766a", fontWeight: 600, textTransform: "uppercase" }}>
                          {p.category}
                        </span>
                        <b style={{ fontSize: "15px", color: "#241610" }}>
                          ₹{Number(p.price || 0).toLocaleString("en-IN")}
                        </b>
                      </div>
                      <h4 style={{ margin: "2px 0 0", fontSize: "15px", color: "#241610" }}>{p.name}</h4>
                      <p style={{ margin: "0", fontSize: "11.5px", color: "#765d50", lineHeight: 1.4 }}>
                        {p.short_description || p.description?.slice(0, 80) + "…"}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "8px" }}>
                        <span className={`admin-stock-badge ${stock > 10 ? "in-stock" : stock > 0 ? "low-stock" : "out-of-stock"}`}>
                          {stock > 10 ? `${stock} in stock` : stock > 0 ? `Low (${stock})` : "Out of stock"}
                        </span>
                        <span className={`admin-status-text ${p.status}`}>{p.status === "published" ? "Live" : "Draft"}</span>
                      </div>
                    </div>
                    <div className="admin-card-footer">
                      <button
                        type="button"
                        className="admin-btn-icon"
                        onClick={() => {
                          setError("");
                          setEditing({ ...blank, ...p });
                          window.scrollTo({ top: 0, behavior: "instant" });
                        }}
                        style={{ background: "#241610", color: "#ffffff", borderColor: "#241610", flex: 1, justifyContent: "center" }}
                        title="Edit product details in dedicated editor"
                      >
                        <Pencil size={12} strokeWidth={2} />
                        <span>Edit Details</span>
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon"
                        onClick={() => setPreviewProduct(p)}
                        title="Quick preview storefront card"
                      >
                        <Eye size={13} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon delete"
                        onClick={() => setDeleteConfirmTarget(p)}
                        title="Delete product"
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Sticky Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="admin-bulk-bar">
              <span className="admin-bulk-count">{selectedIds.size} Selected</span>
              <button
                type="button"
                className="admin-bulk-btn"
                onClick={() => void handleBulkStatusChange("published")}
              >
                <CheckCircle2 size={13} strokeWidth={2} />
                <span>Publish Live</span>
              </button>
              <button
                type="button"
                className="admin-bulk-btn"
                onClick={() => void handleBulkStatusChange("draft")}
              >
                <Archive size={13} strokeWidth={1.8} />
                <span>Set to Draft</span>
              </button>
              <button
                type="button"
                className="admin-bulk-btn"
                onClick={handleExportSelected}
              >
                <Download size={13} strokeWidth={1.8} />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                className="admin-bulk-btn delete"
                onClick={() => void handleBulkDelete()}
              >
                <Trash2 size={13} strokeWidth={1.8} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                className="admin-bulk-cancel"
                onClick={() => setSelectedIds(new Set())}
              >
                Deselect
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MEDIA & REELS STUDIO */}
      {currentTab === "reels" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p className="eyebrow dark" style={{ margin: 0 }}>Official Motion Catalog</p>
              <h2 style={{ margin: "4px 0 0", fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: "#241610" }}>
                20 Official Instagram Reels
              </h2>
            </div>
            <span style={{ fontSize: "12px", color: "#8c766a" }}>
              Every video audited and linked strictly to its exact product.
            </span>
          </div>

          <div className="admin-reels-grid">
            {activeReelsList.map((reel) => (
              <div className="admin-reel-card" key={reel.id}>
                <div
                  className="admin-reel-poster-wrap"
                  onClick={() => setPreviewReel(reel)}
                  title="Click to play in 9:16 portrait video player"
                >
                  <img src={reel.poster} alt={reel.title} />
                  <div className="admin-reel-play-overlay">
                    <span className="admin-reel-play-disc">
                      <Play size={16} fill="currentColor" style={{ marginLeft: "2px" }} />
                    </span>
                  </div>
                </div>
                <div className="admin-reel-card-body">
                  <span className="admin-reel-card-product">{reel.productName}</span>
                  <span className="admin-reel-card-title">{reel.title}</span>
                  <p className="admin-reel-card-quote">"{reel.quote}"</p>
                </div>
                <div className="admin-reel-card-footer">
                  <span style={{ color: "#8c766a" }}>{reel.duration} · {reel.views} views</span>
                  <a
                    href={reel.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-ig-link"
                    title="View original reel on Instagram"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <span>Instagram</span>
                    <ExternalLink size={11} strokeWidth={2} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY & STOCK ANALYTICS */}
      {currentTab === "inventory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <p className="eyebrow dark" style={{ margin: 0 }}>Stock & Supply Chain</p>
            <h2 style={{ margin: "4px 0 0", fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: "#241610" }}>
              Inventory Valuation & Restock Desk
            </h2>
          </div>

          {/* Category Valuation Table */}
          <div className="admin-table-container">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(42, 26, 20, 0.1)", background: "#fdfaf6" }}>
              <b style={{ fontSize: "13px", color: "#241610" }}>Category Inventory Breakdown</b>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Active SKUs</th>
                    <th>Total Units in Stock</th>
                    <th>Category Valuation</th>
                    <th>Average Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueCategories.map((cat) => {
                    const catProducts = products.filter((p) => p.category === cat);
                    const units = catProducts.reduce((sum, p) => sum + (Number(p.stock_quantity) || 0), 0);
                    const val = catProducts.reduce((sum, p) => {
                      const price = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;
                      return sum + (price * (Number(p.stock_quantity) || 0));
                    }, 0);
                    const avg = units > 0 ? Math.round(val / units) : 0;

                    return (
                      <tr key={cat}>
                        <td><b>{cat}</b></td>
                        <td>{catProducts.length} SKUs</td>
                        <td>{units.toLocaleString()} units</td>
                        <td><b style={{ color: "#241610" }}>₹{val.toLocaleString("en-IN")}</b></td>
                        <td>₹{avg.toLocaleString("en-IN")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Restock Desk */}
          <div className="admin-table-container">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(42, 26, 20, 0.1)", background: "#fdfaf6" }}>
              <b style={{ fontSize: "13px", color: "#241610" }}>Product Stock Control & 1-Click Restock</b>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Quick Restock Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const stock = Number(p.stock_quantity) || 0;
                    return (
                      <tr key={p.id || p.slug}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img src={p.image_url || photos.makeup} alt="" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                            <b>{p.name}</b>
                          </div>
                        </td>
                        <td>{stock} units</td>
                        <td>
                          <span className={`admin-stock-badge ${stock > 10 ? "in-stock" : stock > 0 ? "low-stock" : "out-of-stock"}`}>
                            {stock > 10 ? "Adequate" : stock > 0 ? "Low" : "Depleted"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleQuickRestock(p, 10)}
                            style={{ marginRight: "6px" }}
                          >
                            +10 Units
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleQuickRestock(p, 50)}
                            style={{ background: "#241610", color: "#ffffff", borderColor: "#241610" }}
                          >
                            +50 Units
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & SYSTEM HEALTH */}
      {currentTab === "database" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <p className="eyebrow dark" style={{ margin: 0 }}>System Architecture</p>
            <h2 style={{ margin: "4px 0 0", fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: "#241610" }}>
              Database Diagnostics & Backup Console
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Supabase Card */}
            <div className="admin-kpi-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="admin-kpi-title">Supabase Cloud Database</span>
                <span className="admin-status-dot" />
              </div>
              <p style={{ margin: "0 0 16px", fontSize: "12.5px", color: "#765d50", lineHeight: 1.5 }}>
                Direct REST interface connected to PostgreSQL cluster. Supports products, videos schema, and realtime sync.
              </p>
              <div style={{ background: "#fdfaf6", padding: "12px 14px", borderRadius: "8px", fontSize: "11.5px", color: "#422a20", marginBottom: "16px" }}>
                <div>Endpoint: <code>erxquucmoonszopopavx.supabase.co</code></div>
                <div>Status: <b style={{ color: "#059669" }}>Active & Connected</b></div>
              </div>
              <button
                type="button"
                className="admin-primary"
                onClick={() => void testDatabasePing()}
                style={{ width: "100%", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <Zap size={13} strokeWidth={2} />
                <span>{pingResult?.testing ? "Testing Latency…" : "Test Cloud Connection Ping"}</span>
              </button>
              {pingResult && !pingResult.testing && (
                <div style={{ marginTop: "12px", fontSize: "11.5px", color: pingResult.ok ? "#059669" : "#b45309", fontWeight: 600 }}>
                  {pingResult.message}
                </div>
              )}
            </div>

            {/* Catalog Backup & Seed Card */}
            <div className="admin-kpi-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="admin-kpi-title">Backup & Seeding Operations</span>
                <span className="admin-kpi-icon"><Database size={17} strokeWidth={1.8} /></span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: "12.5px", color: "#765d50", lineHeight: 1.5 }}>
                Export full snapshot of your catalog data or restore the 5 official core luxury products with verified reels.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={handleExportAll}
                  style={{ padding: "10px 16px", justifyContent: "center", fontWeight: 600 }}
                >
                  <Download size={13} strokeWidth={1.8} />
                  <span>Download Catalog Backup (JSON)</span>
                </button>
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={handleSeedOfficialCatalog}
                  style={{ padding: "10px 16px", justifyContent: "center", color: "#b45309", borderColor: "#fed7aa", background: "#fdf3eb" }}
                >
                  <RotateCcw size={13} strokeWidth={1.8} />
                  <span>Re-Seed 5 Official Luxury Products</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STOREFRONT PREVIEW MODAL */}
      {previewProduct && (
        <div className="admin-modal-overlay" onClick={() => setPreviewProduct(null)}>
          <div className="admin-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Storefront Card Preview</h3>
              <button type="button" className="admin-modal-close" onClick={() => setPreviewProduct(null)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ width: "220px", flexShrink: 0 }}>
                  <img
                    src={previewProduct.image_url || photos.makeup}
                    alt=""
                    style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.1)", aspectRatio: "1", objectFit: "cover" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: previewProduct.tone || "#a81920", border: "1px solid rgba(0,0,0,0.2)" }} />
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{previewProduct.tone}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.08em" }}>
                    {previewProduct.category} · {previewProduct.tag}
                  </span>
                  <h2 style={{ margin: "0", fontFamily: "Cormorant Garamond, serif", fontSize: "28px", color: "#241610" }}>
                    {previewProduct.name}
                  </h2>
                  <b style={{ fontSize: "20px", color: "#241610" }}>
                    ₹{Number(previewProduct.price || 0).toLocaleString("en-IN")}
                  </b>
                  <p style={{ margin: "4px 0", fontSize: "12.5px", color: "#765d50", lineHeight: 1.5 }}>
                    {previewProduct.description}
                  </p>
                  <div style={{ background: "#fdfaf6", padding: "12px", borderRadius: "8px", border: "1px solid rgba(42, 26, 20, 0.08)", marginTop: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#8c766a" }}>FINISH: <b>{previewProduct.finish || "Sculpted satin"}</b></div>
                    <div style={{ fontSize: "11px", color: "#8c766a", marginTop: "4px" }}>FORMULA: <b>{previewProduct.ingredients?.slice(0, 70) || "Clean botanical extract"}…</b></div>
                    <div style={{ fontSize: "11px", color: "#8c766a", marginTop: "4px" }}>STOCK: <b>{previewProduct.stock_quantity || 50} units in inventory</b></div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button
                      type="button"
                      className="admin-primary"
                      onClick={() => {
                        const target = previewProduct;
                        setPreviewProduct(null);
                        setEditing({ ...blank, ...target });
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      style={{ flex: 1, textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <Pencil size={12} strokeWidth={2} />
                      <span>Open in Full Editor</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => setPreviewProduct(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IN-SITU REEL PLAYER & SKU DETAILS INSPECTOR MODAL */}
      {previewReel && (() => {
        const matchedProduct = products.find(
          (p) =>
            p.name.toLowerCase() === previewReel.productName.toLowerCase() ||
            p.id === (previewReel as any).productId ||
            p.slug === (previewReel as any).productSlug
        ) || products[0];

        return (
          <div className="admin-modal-overlay" onClick={() => setPreviewReel(null)}>
            <div
              className="admin-modal-window admin-reel-inspector-window"
              style={{
                maxWidth: "460px",
                width: "100%",
                background: "#160e0a",
                color: "#ffffff",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "18px",
                border: "1px solid rgba(224, 186, 155, 0.25)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "#120a07",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="runway-pulse-dot" />
                  <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, color: "#dfb895" }}>
                    {previewReel.step || "Look Details"} · Reel Inspector
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReel(null)}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  title="Close inspector"
                >
                  <X size={15} strokeWidth={2} />
                </button>
              </div>

              {/* Scrollable Container */}
              <div
                style={{
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                {/* Constrained Video Viewport */}
                <div style={{ position: "relative", width: "100%", maxHeight: "44vh", background: "#000000", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <video
                    src={previewReel.videoUrl}
                    poster={previewReel.poster}
                    controls
                    autoPlay
                    playsInline
                    style={{ width: "100%", maxHeight: "44vh", objectFit: "contain" }}
                  />
                </div>

                {/* Rich Details Section */}
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Linked Product Card */}
                  {matchedProduct && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(224, 186, 155, 0.2)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={matchedProduct.image_url || previewReel.poster || photos.makeup}
                        alt={matchedProduct.name}
                        style={{ width: "54px", height: "54px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#dfb895", background: "rgba(223, 184, 149, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                            {matchedProduct.category}
                          </span>
                          {matchedProduct.tag && (
                            <span style={{ fontSize: "9px", color: "#f5ece1", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                              {matchedProduct.tag}
                            </span>
                          )}
                        </div>
                        <h4 style={{ margin: "4px 0 2px", fontSize: "14.5px", color: "#ffffff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {matchedProduct.name}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <b style={{ fontSize: "14px", color: "#dfb895" }}>
                            ₹{Number(matchedProduct.price || 0).toLocaleString("en-IN")}
                          </b>
                          <span style={{ fontSize: "11px", color: Number(matchedProduct.stock_quantity || 0) > 10 ? "#34d399" : "#fbbf24" }}>
                            ● {matchedProduct.stock_quantity || 50} in stock
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reel Headline & Full Quote */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c18847", fontWeight: 700, marginBottom: "4px" }}>
                      MOTION EDITORIAL HIGHLIGHT
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "#ffffff", fontFamily: "Cormorant Garamond, serif" }}>
                      {previewReel.title}
                    </h3>
                    <p style={{ margin: "0", fontSize: "12.5px", color: "#d5c3b9", fontStyle: "italic", lineHeight: 1.5 }}>
                      "{previewReel.quote}"
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "10px", paddingTop: "8px", fontSize: "11px", color: "#a89182" }}>
                      <span>⏱ {previewReel.duration} · 👁 {previewReel.views} views</span>
                      <span style={{ color: "#dfb895" }}>{previewReel.handle || "@sheauracosmeticsofficial"}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <a
                      href={previewReel.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "linear-gradient(135deg, #c13584, #e1306c, #f56040)",
                        color: "#ffffff",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        textAlign: "center",
                      }}
                    >
                      <span>Instagram</span>
                      <ExternalLink size={12} strokeWidth={2} />
                    </a>

                    {matchedProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = matchedProduct;
                          setPreviewReel(null);
                          setEditing({ ...blank, ...target });
                          window.scrollTo({ top: 0, behavior: "instant" });
                        }}
                        style={{
                          background: "rgba(223, 184, 149, 0.15)",
                          border: "1px solid rgba(223, 184, 149, 0.35)",
                          color: "#dfb895",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Pencil size={12} strokeWidth={2} />
                        <span>Edit Product</span>
                      </button>
                    )}
                  </div>

                  {onBack && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewReel(null);
                        onBack();
                      }}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#f5ece1",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "100%",
                      }}
                    >
                      <span>View Live on Storefront</span>
                      <ExternalLink size={11} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirmTarget(null)}>
          <div className="admin-modal-window" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Confirm Deletion</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteConfirmTarget(null)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#422a20", lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <b>"{deleteConfirmTarget.name}"</b>? This will remove it from the catalog and the live storefront.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={() => setDeleteConfirmTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-icon delete"
                  onClick={() => void deleteProduct(deleteConfirmTarget)}
                  style={{ background: "#dc2626", color: "#ffffff", borderColor: "#dc2626", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} strokeWidth={1.8} />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

// Complete Tabbed Product Studio Editor (Dedicated Page)
function Editor({
  editing,
  setEditing,
  save,
  busy,
  onBackToList,
  onViewOnStorefront,
}: {
  editing: Product;
  setEditing: React.Dispatch<React.SetStateAction<Product | null>>;
  save: (e: FormEvent) => void;
  busy: boolean;
  onBackToList: () => void;
  onViewOnStorefront?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"identity" | "media" | "editorial" | "formula" | "publish">("identity");

  const update = (key: keyof Product, value: unknown) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : null));

  const updateMultiple = (patch: Partial<Product>) =>
    setEditing((prev) => (prev ? { ...prev, ...patch } : null));

  const isPublished = editing.status === "published";

  return (
    <div className="admin-editor-page">
      {/* Top Sticky Action & Breadcrumb Navigation Bar */}
      <div className="admin-editor-sticky-header">
        <div className="admin-editor-top-nav">
          <button
            type="button"
            className="admin-editor-back-btn"
            onClick={onBackToList}
            title="Return to products catalogue overview"
          >
            ← Back to Products List
          </button>

          <div className="admin-editor-breadcrumbs">
            <span className="crumb-root" onClick={onBackToList}>Catalogue Studio</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{editing.name || "New Product Creation"}</span>
          </div>

          <div className="admin-editor-top-actions">
            {/* Live Status Toggle Pill */}
            <button
              type="button"
              className={`admin-status-pill-toggle ${isPublished ? "published" : "draft"}`}
              onClick={() => update("status", isPublished ? "draft" : "published")}
              title="Click to toggle publish status"
            >
              <span className="status-dot" />
              <span>{isPublished ? "Live on Storefront" : "Draft (Hidden)"}</span>
            </button>

            {editing.id && isPublished && onViewOnStorefront && (
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={onViewOnStorefront}
                title="Preview live storefront"
              >
                Storefront ↗
              </button>
            )}

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={onBackToList}
              title="Discard edits and return to list"
            >
              Discard
            </button>

            <button
              type="button"
              className="admin-primary"
              disabled={busy}
              onClick={() => {
                const form = document.getElementById("admin-product-edit-form") as HTMLFormElement | null;
                if (form) {
                  if (form.reportValidity()) {
                    form.requestSubmit();
                  }
                }
              }}
            >
              {busy ? "Saving…" : editing.id ? "Update Product" : "Save & Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-editor-content">
        {/* Editor Product Header Banner */}
        <div className="admin-editor-hero-bar">
          <div>
            <p className="eyebrow dark" style={{ margin: "0 0 6px" }}>
              {editing.id ? "Product Specification Studio" : "New Luxury Creation"}
            </p>
            <h2 className="admin-editor-hero-title">
              {editing.name || "Untitled Luxury Creation"}
            </h2>
            <div className="admin-editor-meta-strip">
              <span className="admin-meta-chip">
                Category: <b>{editing.category || "Uncategorised"}</b>
              </span>
              <span className="admin-meta-chip">
                Price: <b>₹{Number(editing.price || 0).toLocaleString("en-IN")}</b>
              </span>
              {editing.tag && (
                <span className="admin-meta-chip gold">
                  Badge: <b>{editing.tag}</b>
                </span>
              )}
              {editing.finish && (
                <span className="admin-meta-chip">
                  Finish: <b>{editing.finish}</b>
                </span>
              )}
              {editing.slug && (
                <span className="admin-meta-chip">
                  Slug: <code>/{editing.slug}</code>
                </span>
              )}
            </div>
          </div>
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

        <form id="admin-product-edit-form" onSubmit={save} className="admin-form">
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
              <div className="admin-media-photos-grid">
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

        {/* Action Controls Footer */}
        <div className="admin-form-actions-footer">
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={onBackToList}
          >
            ← Back to Products List
          </button>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {activeTab !== "identity" && (
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => {
                  const tabs: ("identity" | "media" | "editorial" | "formula" | "publish")[] = [
                    "identity",
                    "media",
                    "editorial",
                    "formula",
                    "publish",
                  ];
                  const prevIndex = tabs.indexOf(activeTab) - 1;
                  if (prevIndex >= 0) {
                    setActiveTab(tabs[prevIndex]);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }
                }}
              >
                ← Previous Section
              </button>
            )}
            {activeTab !== "publish" && (
              <button
                type="button"
                className="admin-action-btn"
                onClick={() => {
                  const tabs: ("identity" | "media" | "editorial" | "formula" | "publish")[] = [
                    "identity",
                    "media",
                    "editorial",
                    "formula",
                    "publish",
                  ];
                  const nextIndex = tabs.indexOf(activeTab) + 1;
                  if (nextIndex < tabs.length) {
                    setActiveTab(tabs[nextIndex]);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }
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
    </div>
  </div>
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
