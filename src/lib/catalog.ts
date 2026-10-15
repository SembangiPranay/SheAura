import { supabase, isSupabaseConfigured } from "./supabase";

export type ProductVideo = {
  id: string;
  video_url: string;
  instagram_url: string;
  title: string;
  quote: string;
  social_handle: string;
  poster_url?: string;
};

export type StorefrontProduct = {
  id?: string;
  slug?: string;
  name: string;
  price: string;
  rawPrice?: number;
  image: string;
  campaign: string;
  still: string;
  tag: string;
  tone: string;
  category: string;
  note: string;
  finish: string;
  mood: string;
  description: string;
  short_description?: string;
  ingredients?: string;
  benefits?: string[] | string;
  how_to_use?: string;
  size?: string;
  video_url?: string;
  instagram_url?: string;
  video_title?: string;
  video_quote?: string;
  social_handle?: string;
  videos?: ProductVideo[];
};

export const resolveAsset = (path: string): string => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "./";
  const cleanPath = path.replace(/^\.?\//, "");
  return base.endsWith("/") ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
};

export const photos = {
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

export const defaultProducts: StorefrontProduct[] = [
  {
    slug: "scarlet-rose-lipstick",
    name: "Scarlet Rose Lipstick",
    price: "₹1,099.00",
    rawPrice: 1099,
    image: photos.scarletBotanical,
    campaign: photos.scarletPortrait,
    still: photos.scarletBotanical,
    tag: "Icon",
    tone: "#a81920",
    category: "Lip colour",
    note: "Satin botanical colour",
    finish: "Sculpted satin",
    mood: "The red statement",
    description: "A couture red lip with a petal-embossed silhouette, designed as the finishing piece in your everyday wardrobe.",
    short_description: "Satin botanical lip colour with petal-soft glide.",
    ingredients: "Damask Rose Petal Extract, Plant Squalane (Olive-Derived), Shea Butter, Vitamin E",
    benefits: ["12H Hydra-Glide Comfort", "Petal-Soft Satin Texture", "100% Vegan & Cruelty-Free"],
    how_to_use: "Glide directly onto bare lips from center outward for sculpted satin payoff.",
    size: "3.8g / 0.13 oz",
    video_url: resolveAsset("/reels/reel-02-nothing-better-lipstick.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeO8B16hEAz/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · Sensorial Glide",
    video_quote: "Finding a formula that glides smoothly and hydrates all day.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    slug: "pink-blossom-blush",
    name: "Pink Blossom Blush",
    price: "₹899.00",
    rawPrice: 899,
    image: photos.blushStill,
    campaign: photos.blushPortrait,
    still: photos.blushStill,
    tag: "Bestseller",
    tone: "#a94368",
    category: "Blush",
    note: "Soft-focus flush",
    finish: "Silk powder",
    mood: "The romantic flush",
    description: "A buildable pink flush presented in a keepsake gold compact, made to move effortlessly from daylight to evening.",
    short_description: "Soft-focus silk powder blush with fresh botanical flush.",
    ingredients: "Camellia Seed Oil, Multi-Weight Hyaluronic Acid, Candelilla Wax, Botanical Pigments",
    benefits: ["Soft-Focus Silk Texture", "Buildable Petal Flush", "Skin-Safe & Paraben Free"],
    how_to_use: "Tap onto cheekbones and blend upward with fingertips for an ethereal flush.",
    size: "5.2g / 0.18 oz",
    video_url: resolveAsset("/reels/reel-01-perfect-blush.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeV_UkRpvGw/?utm_source=ig_web_copy_link",
    video_title: "Look 02 · The Romantic Flush",
    video_quote: "The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    slug: "molten-glow-highlighter",
    name: "Molten Glow Highlighter",
    price: "₹1,199.00",
    rawPrice: 1199,
    image: photos.highlighterBotanical,
    campaign: photos.highlighterPortrait,
    still: photos.highlighterBotanical,
    tag: "New",
    tone: "#c18847",
    category: "Highlighter",
    note: "Liquid luminosity",
    finish: "Molten pearl",
    mood: "The golden hour",
    description: "A fluid veil of warm luminosity that catches the light like jewellery and turns skin into the main accessory.",
    short_description: "Liquid golden hour luminosity with molten mica pearl veil.",
    ingredients: "Molten Mica Pearls, Plant Squalane, Niacinamide, Lotus Blossom Water",
    benefits: ["Weightless Second-Skin Glow", "Molten Mica Pearls", "Hydrating Botanical Base"],
    how_to_use: "Warm between palms and press onto high points of face and décolletage for molten luminosity.",
    size: "15ml / 0.5 fl oz",
    video_url: resolveAsset("/reels/reel-03-molten-highlighter.mp4"),
    instagram_url: "https://www.instagram.com/reel/Dfh8kY6p-gV/?utm_source=ig_web_copy_link",
    video_title: "Look 03 · Molten Shimmer Veil",
    video_quote: "Liquid shimmer & luxury glow that turns skin into the main accessory.",
    social_handle: "@sheauracosmeticsofficial",
  },
];

export function formatPrice(val: number | string | undefined): string {
  if (val === undefined || val === null || val === "") return "₹0.00";
  if (typeof val === "string" && val.includes("₹")) return val;
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

export function mapSupabaseToStorefront(row: any): StorefrontProduct {
  const priceStr = formatPrice(row.price);
  const numPrice = typeof row.price === "number" ? row.price : parseFloat(String(row.price).replace(/[^0-9.]/g, "")) || 0;

  const image = row.image_url || photos.makeup;
  const campaign = row.campaign_image_url || row.image_url || photos.model;
  const still = row.image_url || row.campaign_image_url || photos.lipstick;

  let parsedVideos: ProductVideo[] = [];
  if (Array.isArray(row.videos) && row.videos.length > 0) {
    parsedVideos = row.videos.map((v: any, idx: number) => ({
      id: v.id || `vid-${idx + 1}-${Date.now()}`,
      video_url: v.video_url || "",
      instagram_url: v.instagram_url || "",
      title: v.title || v.video_title || `Look 0${idx + 1}`,
      quote: v.quote || v.video_quote || "Sensorial texture that glides smoothly and hydrates all day.",
      social_handle: v.social_handle || "@sheauracosmeticsofficial",
      poster_url: v.poster_url || campaign,
    }));
  } else if (typeof row.videos === "string") {
    try {
      const parsed = JSON.parse(row.videos);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedVideos = parsed.map((v: any, idx: number) => ({
          id: v.id || `vid-${idx + 1}-${Date.now()}`,
          video_url: v.video_url || "",
          instagram_url: v.instagram_url || "",
          title: v.title || v.video_title || `Look 0${idx + 1}`,
          quote: v.quote || v.video_quote || "Sensorial texture that glides smoothly and hydrates all day.",
          social_handle: v.social_handle || "@sheauracosmeticsofficial",
          poster_url: v.poster_url || campaign,
        }));
      }
    } catch {}
  }

  // Fallback to legacy single-video columns if array was empty
  if (parsedVideos.length === 0 && (row.video_url || row.instagram_url)) {
    parsedVideos = [
      {
        id: "vid-1",
        video_url: row.video_url || "",
        instagram_url: row.instagram_url || "",
        title: row.video_title || "Look 01 · Sensorial Glide",
        quote: row.video_quote || "Sensorial texture that glides smoothly and hydrates all day.",
        social_handle: row.social_handle || "@sheauracosmeticsofficial",
        poster_url: campaign,
      },
    ];
  }

  return {
    id: row.id,
    slug: row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: row.name || "Untitled Product",
    price: priceStr,
    rawPrice: numPrice,
    image,
    campaign,
    still,
    tag: row.tag || "Icon",
    tone: row.tone || "#a81920",
    category: row.category || "Lip colour",
    note: row.note || row.short_description || "Botanical formula",
    finish: row.finish || "Sculpted satin",
    mood: row.mood || "The statement",
    description: row.description || row.short_description || "A conscious beauty piece from the She'Aura studio.",
    short_description: row.short_description || "",
    ingredients: row.ingredients || "",
    benefits: Array.isArray(row.benefits) ? row.benefits : typeof row.benefits === "string" ? row.benefits.split("\n") : [],
    how_to_use: row.how_to_use || "",
    size: row.size || "",
    video_url: parsedVideos[0]?.video_url || row.video_url || "",
    instagram_url: parsedVideos[0]?.instagram_url || row.instagram_url || "",
    video_title: parsedVideos[0]?.title || row.video_title || "Look 01 · Sensorial Glide",
    video_quote: parsedVideos[0]?.quote || row.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
    social_handle: parsedVideos[0]?.social_handle || row.social_handle || "@sheauracosmeticsofficial",
    videos: parsedVideos,
  };
}

const LOCAL_STORAGE_KEY = "sheaura_custom_products";

export function getLocalCustomProducts(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomProduct(product: any): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalCustomProducts();
    const slug = product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filtered = existing.filter((p: any) => p.slug !== slug && p.id !== product.id && p.name !== product.name);
    filtered.unshift({
      ...product,
      slug,
      is_published: product.status === "published" || product.is_published === true,
      updated_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("sheaura:catalog-updated"));
  } catch (err) {
    console.error("Failed to save local custom product:", err);
  }
}

export function deleteLocalCustomProduct(idOrSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalCustomProducts();
    const updated = existing.filter((p: any) => p.slug !== idOrSlug && p.id !== idOrSlug && p.name !== idOrSlug);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sheaura:catalog-updated"));
  } catch (err) {
    console.error("Failed to delete local custom product:", err);
  }
}

export async function loadStorefrontCatalog(): Promise<StorefrontProduct[]> {
  let supabaseProducts: StorefrontProduct[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        supabaseProducts = data.map(mapSupabaseToStorefront);
      }
    } catch (err) {
      console.warn("Could not fetch remote products from Supabase; using local fallback.", err);
    }
  }

  // Load published products stored locally
  const localRaw = getLocalCustomProducts();
  const localProducts = localRaw
    .filter((p: any) => p.is_published !== false && p.status !== "draft")
    .map(mapSupabaseToStorefront);

  // Merge list:
  // 1. Supabase published products
  // 2. Locally saved published custom products (if not already in Supabase)
  // 3. Default curated flagship products (if not already in list)
  const combined: StorefrontProduct[] = [];
  const seenKeys = new Set<string>();

  const register = (item: StorefrontProduct) => {
    const key = (item.slug || item.name).toLowerCase().trim();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(item);
    }
  };

  // Add remote products first
  supabaseProducts.forEach(register);

  // Add local custom products next
  localProducts.forEach(register);

  // Always ensure default flagship products exist if not superseded
  defaultProducts.forEach(register);

  return combined;
}
