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
  gallery?: string[];
  shades?: { name: string; tone: string; image?: string; slug?: string }[];
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
  lipstick: resolveAsset("/products/Scarlet Rose Lipstick.webp"),
  makeup: resolveAsset("/products/products.png"),
  skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
  model: resolveAsset("/products/Minimal_design/Daffodil.png"),
  floral: "https://images.unsplash.com/photo-1536568033156-c6bf7b18dfba?auto=format&fit=crop&w=900&q=85",
  perfume: "https://images.unsplash.com/photo-1726758004499-b4ea21408bcf?auto=format&fit=crop&w=1400&q=90",
  cream: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85",
  foundation: resolveAsset("/products/Daffodil.webp"),
  oil: resolveAsset("/products/Body_Highlighter_Oil_design.webp"),
  ingredients: "https://images.unsplash.com/photo-1726758004519-7ccecda8b076?auto=format&fit=crop&w=1800&q=90",
  arches: "https://images.unsplash.com/photo-1543682388-4b46a14c91db?auto=format&fit=crop&w=2000&q=90",
  scarletPortrait: resolveAsset("/campaign/scarlet-portrait.png"),
  scarletBotanical: resolveAsset("/products/Minimal_design/Scarlet Rose Lipstick_still.png"),
  blushPortrait: resolveAsset("/campaign/pink-blossom-portrait.png"),
  blushStill: resolveAsset("/products/Minimal_design/pink blossam blus simple.png"),
  highlighterPortrait: resolveAsset("/campaign/highlighter-glow-portrait.png"),
  highlighterBotanical: resolveAsset("/products/Minimal_design/Highlighter simple.png"),
};

export const defaultProducts: StorefrontProduct[] = [
  {
    slug: "scarlet-rose-lipstick",
    name: "Scarlet Rose Lipstick",
    price: "₹1,099.00",
    rawPrice: 1099,
    image: resolveAsset("/products/Scarlet Rose Lipstick.webp"),
    campaign: resolveAsset("/campaign/scarlet-portrait.png"),
    still: resolveAsset("/products/Minimal_design/Scarlet Rose Lipstick_still.png"),
    gallery: [
      resolveAsset("/products/Scarlet Rose Lipstick.webp"),
      resolveAsset("/campaign/scarlet-portrait.png"),
      resolveAsset("/products/Minimal_design/Scarlet Rose Lipstick_still.png"),
      resolveAsset("/products/Minimal_design/Scarlet Rose Lipstick.png"),
    ],
    shades: [
      { name: "Scarlet Rose", tone: "#a81920", slug: "scarlet-rose-lipstick", image: resolveAsset("/products/Scarlet Rose Lipstick.webp") },
      { name: "Roseberry", tone: "#8e2a59", slug: "roseberry-lipstick", image: resolveAsset("/products/Roseberry Lipstick.webp") },
      { name: "Blush Rose", tone: "#c47d7b", slug: "blush-rose-lipstick", image: resolveAsset("/products/Lipstick_red.webp") },
      { name: "Orchid", tone: "#a05c7b", slug: "orchid-lipstick", image: resolveAsset("/products/Orchid Lipstick.webp") },
    ],
    tag: "Icon",
    tone: "#a81920",
    category: "Lip colour",
    note: "Satin botanical colour",
    finish: "Sculpted satin",
    mood: "The red statement",
    description: "A couture red lip with a petal-embossed silhouette, designed as the finishing piece in your everyday wardrobe. Enriched with botanical waxes and damask rose extract.",
    short_description: "Satin botanical lip colour with petal-soft glide in iconic Scarlet Rose.",
    ingredients: "Damask Rose Petal Extract, Plant Squalane (Olive-Derived), Shea Butter, Vitamin E, Candelilla Wax, Mineral Iron Oxides.",
    benefits: ["12H Hydra-Glide Comfort", "Petal-Soft Satin Texture", "100% Vegan & Cruelty-Free", "Embossed Petal Bullet"],
    how_to_use: "Glide directly onto bare lips from center outward for sculpted satin payoff.",
    size: "3.8g / 0.13 oz",
    video_url: resolveAsset("/reels/reel-02-nothing-better-lipstick.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeO8B16hEAz/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · The Red Statement",
    video_quote: "There’s nothing better than this. Rich pigment with hydrating comfort in a single stroke.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-02",
        video_url: resolveAsset("/reels/reel-02-nothing-better-lipstick.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-02-nothing-better-lipstick.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeO8B16hEAz/?utm_source=ig_web_copy_link",
        title: "Look 01 · The Red Statement",
        quote: "There’s nothing better than this. Rich pigment with hydrating comfort in a single stroke.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-12",
        video_url: resolveAsset("/reels/reel-12-bullet-lipstick-luxury.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-12-bullet-lipstick-luxury.jpg"),
        instagram_url: "https://www.instagram.com/reel/DdyuxBAPQMs/?utm_source=ig_web_copy_link",
        title: "Look 04 · Bullet Lipstick Made Luxury",
        quote: "Bullet lipstick but make it luxury! The detailing, the shade, the finish — everything is top notch.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-13",
        video_url: resolveAsset("/reels/reel-13-scarlet-rose-confidence.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-13-scarlet-rose-confidence.jpg"),
        instagram_url: "https://www.instagram.com/reel/DdyjIg-tdpw/?utm_source=ig_web_copy_link",
        title: "Look 05 · Scarlet Rose Confidence",
        quote: "Unveil your inner confidence with SheAura’s Scarlet Rose Lipstick—the perfect touch of bold, timeless beauty.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-17",
        video_url: resolveAsset("/reels/reel-17-vegan-luxe-lipstick-steal.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-17-vegan-luxe-lipstick-steal.jpg"),
        instagram_url: "https://www.instagram.com/reel/Ddi1IzLo90u/?utm_source=ig_web_copy_link",
        title: "Look 07 · Vegan Luxe Silk Glide",
        quote: "Y’all need to steal this! It’s vegan, has luxe packaging and goes on smooth as silk without feeling heavy.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "roseberry-lipstick",
    name: "Roseberry Lipstick",
    price: "₹1,099.00",
    rawPrice: 1099,
    image: resolveAsset("/products/Roseberry Lipstick.webp"),
    campaign: resolveAsset("/products/Minimal_design/Roseberry Lipstick.png"),
    still: resolveAsset("/products/Roseberry Lipstick.webp"),
    gallery: [
      resolveAsset("/products/Roseberry Lipstick.webp"),
      resolveAsset("/products/Minimal_design/Roseberry Lipstick.png"),
    ],
    shades: [
      { name: "Scarlet Rose", tone: "#a81920", slug: "scarlet-rose-lipstick", image: resolveAsset("/products/Scarlet Rose Lipstick.webp") },
      { name: "Roseberry", tone: "#8e2a59", slug: "roseberry-lipstick", image: resolveAsset("/products/Roseberry Lipstick.webp") },
      { name: "Blush Rose", tone: "#c47d7b", slug: "blush-rose-lipstick", image: resolveAsset("/products/Lipstick_red.webp") },
      { name: "Orchid", tone: "#a05c7b", slug: "orchid-lipstick", image: resolveAsset("/products/Orchid Lipstick.webp") },
    ],
    tag: "Bestseller",
    tone: "#8e2a59",
    category: "Lip colour",
    note: "Velvet roseberry tint",
    finish: "Sculpted satin",
    mood: "The berry indulgence",
    description: "A luxurious berry-rose satin lipstick formulated with botanical waxes and conditioning damask rose extract for a velvety, petal-soft finish with rich, buildable depth.",
    short_description: "Deep berry-rose botanical lipstick with sculpted petal embossing.",
    ingredients: "Damask Rose Petal Extract, Plant Squalane, Jojoba Seed Oil, Shea Butter, Vitamin E, Wild Berry Wax.",
    benefits: ["Velvety Deep Plum Sheen", "Hydra-Barrier Moisture Lock", "100% Vegan & Cruelty-Free", "Petal-Embossed Silhouette"],
    how_to_use: "Swipe across lips for an instant berry-stained velvet finish. Blot with tissue for a subtle French-girl tint.",
    size: "3.8g / 0.13 oz",
    video_url: resolveAsset("/reels/reel-03-everyday-glam.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeLrsOLMSyo/?utm_source=ig_web_copy_link",
    video_title: "Look 02 · Nude to Bold Everyday Glam",
    video_quote: "Everyday glam made effortless. Layerable formulas crafted for daylight and evening.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-03",
        video_url: resolveAsset("/reels/reel-03-everyday-glam.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-03-everyday-glam.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeLrsOLMSyo/?utm_source=ig_web_copy_link",
        title: "Look 02 · Nude to Bold Everyday Glam",
        quote: "Everyday glam made effortless. Layerable formulas crafted for daylight and evening.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-18",
        video_url: resolveAsset("/reels/reel-18-three-reasons-love-bundle.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-18-three-reasons-love-bundle.jpg"),
        instagram_url: "https://www.instagram.com/reel/DdllwnOBVms/?utm_source=ig_web_copy_link",
        title: "Look 08 · 3 Reasons to Fall in Love",
        quote: "Because one is never enough... so we’re giving you 3 reasons to fall in love with She’Aura beauty.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "blush-rose-lipstick",
    name: "Blush Rose Lipstick",
    price: "₹1,099.00",
    rawPrice: 1099,
    image: resolveAsset("/products/Lipstick_red.webp"),
    campaign: resolveAsset("/products/Minimal_design/Lipstick_red.png"),
    still: resolveAsset("/products/Lipstick_red.webp"),
    gallery: [
      resolveAsset("/products/Lipstick_red.webp"),
      resolveAsset("/products/Minimal_design/Lipstick_red.png"),
      resolveAsset("/products/Minimal_design/Blush Rose Lipstick.png"),
    ],
    shades: [
      { name: "Scarlet Rose", tone: "#a81920", slug: "scarlet-rose-lipstick", image: resolveAsset("/products/Scarlet Rose Lipstick.webp") },
      { name: "Roseberry", tone: "#8e2a59", slug: "roseberry-lipstick", image: resolveAsset("/products/Roseberry Lipstick.webp") },
      { name: "Blush Rose", tone: "#c47d7b", slug: "blush-rose-lipstick", image: resolveAsset("/products/Lipstick_red.webp") },
      { name: "Orchid", tone: "#a05c7b", slug: "orchid-lipstick", image: resolveAsset("/products/Orchid Lipstick.webp") },
    ],
    tag: "Trending",
    tone: "#c47d7b",
    category: "Lip colour",
    note: "Soft nude rose petal",
    finish: "Sculpted satin",
    mood: "Everyday romantic nude",
    description: "An effortless nude rose satin lipstick that flatters every skin tone. Enriched with botanical emollients and squalane for a soft-focus velvet sheen.",
    short_description: "Soft-focus nude rose lipstick for effortless everyday radiance.",
    ingredients: "Damask Rose Extract, Camellia Oleifera Seed Oil, Plant Squalane, Vitamin E, Shea Butter, French Kaolin.",
    benefits: ["Universally Flattering Nude Rose", "Weightless Second-Skin Glide", "Hydrating Botanical Base", "100% Vegan"],
    how_to_use: "Apply directly to bare lips or dab on center of lips for an ethereal gradient tint.",
    size: "3.8g / 0.13 oz",
    video_url: resolveAsset("/reels/reel-15-colour-confidence-lip.mp4"),
    instagram_url: "https://www.instagram.com/reel/DebGeA6vwb7/?utm_source=ig_web_copy_link",
    video_title: "Look 06 · A Little Colour, A Lot of Confidence",
    video_quote: "A little colour, a lot of confidence! The perfect lip shade just hits different on every skin tone.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-15",
        video_url: resolveAsset("/reels/reel-15-colour-confidence-lip.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-15-colour-confidence-lip.jpg"),
        instagram_url: "https://www.instagram.com/reel/DebGeA6vwb7/?utm_source=ig_web_copy_link",
        title: "Look 06 · A Little Colour, A Lot of Confidence",
        quote: "A little colour, a lot of confidence! The perfect lip shade just hits different on every skin tone.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-04",
        video_url: resolveAsset("/reels/reel-04-grwm-lipsticks.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-04-grwm-lipsticks.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeJ0vGmMjxv/?utm_source=ig_web_copy_link",
        title: "Look 03 · Sensorial Hydra-Glide Ritual",
        quote: "GRWM featuring She’Aura lipsticks! Finding a formula that glides smoothly and hydrates all day.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "orchid-lipstick",
    name: "Orchid Lipstick",
    price: "₹1,099.00",
    rawPrice: 1099,
    image: resolveAsset("/products/Orchid Lipstick.webp"),
    campaign: resolveAsset("/products/Minimal_design/Orchid Lipstick.png"),
    still: resolveAsset("/products/Orchid Lipstick.webp"),
    gallery: [
      resolveAsset("/products/Orchid Lipstick.webp"),
      resolveAsset("/products/Minimal_design/Orchid Lipstick.png"),
    ],
    shades: [
      { name: "Scarlet Rose", tone: "#a81920", slug: "scarlet-rose-lipstick", image: resolveAsset("/products/Scarlet Rose Lipstick.webp") },
      { name: "Roseberry", tone: "#8e2a59", slug: "roseberry-lipstick", image: resolveAsset("/products/Roseberry Lipstick.webp") },
      { name: "Blush Rose", tone: "#c47d7b", slug: "blush-rose-lipstick", image: resolveAsset("/products/Lipstick_red.webp") },
      { name: "Orchid", tone: "#a05c7b", slug: "orchid-lipstick", image: resolveAsset("/products/Orchid Lipstick.webp") },
    ],
    tag: "New",
    tone: "#a05c7b",
    category: "Lip colour",
    note: "Mauve botanical glow",
    finish: "Sculpted satin",
    mood: "The modern classic",
    description: "A sophisticated mauve orchid hue infused with botanical lotus extract and hyaluronic spheres for all-day hydra-glide wear and sculpted definition.",
    short_description: "Mauve orchid botanical satin lipstick with petal-soft finish.",
    ingredients: "Lotus Flower Extract, Damask Rose Wax, Olive Squalane, Hyaluronic Spheres, Vitamin E.",
    benefits: ["Cool-Toned Mauve Orchid Tint", "Plumping Moisture Complex", "Sculpted Petal Bullet", "Cruelty-Free"],
    how_to_use: "Glide onto lips directly. Pair with She’Aura Peach Blossom Blush for a balanced modern look.",
    size: "3.8g / 0.13 oz",
    video_url: resolveAsset("/reels/reel-08-orchid-peach-grwm.mp4"),
    instagram_url: "https://www.instagram.com/reel/Dd-wD1Oz39K/?utm_source=ig_web_copy_link",
    video_title: "Look 03 · Peach Blossom Glow & Orchid Lip",
    video_quote: "Perfect GRWM featuring Orchid Lipstick and Peach Blossom Blush. Fresh, blooming, and effortless.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-08",
        video_url: resolveAsset("/reels/reel-08-orchid-peach-grwm.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-08-orchid-peach-grwm.jpg"),
        instagram_url: "https://www.instagram.com/reel/Dd-wD1Oz39K/?utm_source=ig_web_copy_link",
        title: "Look 03 · Peach Blossom Glow & Orchid Lip",
        quote: "Perfect GRWM featuring Orchid Lipstick and Peach Blossom Blush. Fresh, blooming, and effortless.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "pink-blossom-blush",
    name: "Pink Blossom Blush",
    price: "₹899.00",
    rawPrice: 899,
    image: resolveAsset("/products/Pink Blossom Blush.webp"),
    campaign: resolveAsset("/campaign/pink-blossom-portrait.png"),
    still: resolveAsset("/products/Minimal_design/pink blossam blus simple.png"),
    gallery: [
      resolveAsset("/products/Pink Blossom Blush.webp"),
      resolveAsset("/campaign/pink-blossom-portrait.png"),
      resolveAsset("/products/Minimal_design/pink blossam blus simple.png"),
      resolveAsset("/products/Minimal_design/Pink Blossom Blush.png"),
    ],
    shades: [
      { name: "Pink Blossom", tone: "#b8486e", slug: "pink-blossom-blush", image: resolveAsset("/products/Pink Blossom Blush.webp") },
      { name: "Peach Blossom", tone: "#e27a67", slug: "peach-blossom-blush", image: resolveAsset("/products/Peach Blossom Blush.webp") },
      { name: "Cherry Blossom", tone: "#9b2c58", slug: "cherry-blossom-blush", image: resolveAsset("/products/Cherry Blossom Blush.webp") },
    ],
    tag: "Bestseller",
    tone: "#b8486e",
    category: "Blush",
    note: "Soft-focus pink flush",
    finish: "Silk powder",
    mood: "The romantic flush",
    description: "A buildable pink flush presented in a keepsake gold compact, made to move effortlessly from daylight to evening. Infused with camellia seed oil and multi-weight hyaluronic acid.",
    short_description: "Soft-focus silk powder blush in signature Pink Blossom.",
    ingredients: "Camellia Seed Oil, Multi-Weight Hyaluronic Acid, Candelilla Wax, Botanical Pigments, Micronized Silk Mica.",
    benefits: ["Soft-Focus Silk Texture", "Buildable Petal Flush", "Keepsake Engraved Gold Compact", "Paraben Free"],
    how_to_use: "Tap onto cheekbones and sweep upward toward temples with fingertips or a fluffy blush brush.",
    size: "5.2g / 0.18 oz",
    video_url: resolveAsset("/reels/reel-01-perfect-blush.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeV_UkRpvGw/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · Everyday Petal Flush",
    video_quote: "The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-01",
        video_url: resolveAsset("/reels/reel-01-perfect-blush.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-01-perfect-blush.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeV_UkRpvGw/?utm_source=ig_web_copy_link",
        title: "Look 01 · Everyday Petal Flush",
        quote: "The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-07",
        video_url: resolveAsset("/reels/reel-07-traditional-glow.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-07-traditional-glow.jpg"),
        instagram_url: "https://www.instagram.com/reel/Dd_2YLhR6P4/?utm_source=ig_web_copy_link",
        title: "Look 02 · Festive Natural Glow",
        quote: "Pair your traditional look with She’aura to get the natural glow and festive elegance.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-14",
        video_url: resolveAsset("/reels/reel-14-grwm-viral-trend.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-14-grwm-viral-trend.jpg"),
        instagram_url: "https://www.instagram.com/reel/Debtm5PypqV/?utm_source=ig_web_copy_link",
        title: "Look 05 · Keepsake Compact Routine",
        quote: "Get ready with me for office featuring the SheAura keepsake gold compact blush.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-19",
        video_url: resolveAsset("/reels/reel-19-perfect-blush-and-lipstick.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-19-perfect-blush-and-lipstick.jpg"),
        instagram_url: "https://www.instagram.com/reel/DdjIZCsovzC/?utm_source=ig_web_copy_link",
        title: "Look 06 · The Signature Blush & Lip Duo",
        quote: "Got my hands on the perfect blush and lipstick! Harmonic hues that bring natural vitality to skin.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "peach-blossom-blush",
    name: "Peach Blossom Blush",
    price: "₹899.00",
    rawPrice: 899,
    image: resolveAsset("/products/Peach Blossom Blush.webp"),
    campaign: resolveAsset("/products/Minimal_design/Peach Blossom Blush.png"),
    still: resolveAsset("/products/Peach Blossom Blush.webp"),
    gallery: [
      resolveAsset("/products/Peach Blossom Blush.webp"),
      resolveAsset("/products/Minimal_design/Peach Blossom Blush.png"),
    ],
    shades: [
      { name: "Pink Blossom", tone: "#b8486e", slug: "pink-blossom-blush", image: resolveAsset("/products/Pink Blossom Blush.webp") },
      { name: "Peach Blossom", tone: "#e27a67", slug: "peach-blossom-blush", image: resolveAsset("/products/Peach Blossom Blush.webp") },
      { name: "Cherry Blossom", tone: "#9b2c58", slug: "cherry-blossom-blush", image: resolveAsset("/products/Cherry Blossom Blush.webp") },
    ],
    tag: "Trending",
    tone: "#e27a67",
    category: "Blush",
    note: "Sun-kissed peach veil",
    finish: "Silk powder",
    mood: "The golden hour flush",
    description: "A warm, luminous peach silk powder blush presented in our signature gold keepsake compact. Melt-in botanical pigments deliver an instant healthy radiance.",
    short_description: "Warm golden peach silk compact blush for a fresh daylight glow.",
    ingredients: "Camellia Seed Oil, Apricot Kernel Extract, Vitamin E, Micronized Golden Pearls, Botanical Pigments.",
    benefits: ["Luminous Sun-Kissed Warmth", "Blurs Pores & Fine Texture", "Gold Keepsake Compact with Mirror", "Clean Formula"],
    how_to_use: "Dust lightly over the apples of your cheeks and across the bridge of your nose for a sunlit glow.",
    size: "5.2g / 0.18 oz",
    video_url: resolveAsset("/reels/reel-08-orchid-peach-grwm.mp4"),
    instagram_url: "https://www.instagram.com/reel/Dd-wD1Oz39K/?utm_source=ig_web_copy_link",
    video_title: "Look 03 · Peach Blossom Glow",
    video_quote: "Perfect GRWM featuring Orchid Lipstick and Peach Blossom Blush. Fresh, blooming, and effortless.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-08",
        video_url: resolveAsset("/reels/reel-08-orchid-peach-grwm.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-08-orchid-peach-grwm.jpg"),
        instagram_url: "https://www.instagram.com/reel/Dd-wD1Oz39K/?utm_source=ig_web_copy_link",
        title: "Look 03 · Peach Blossom Glow",
        quote: "Perfect GRWM featuring Orchid Lipstick and Peach Blossom Blush. Fresh, blooming, and effortless.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-11",
        video_url: resolveAsset("/reels/reel-11-shade-blush-rose.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-11-shade-blush-rose.jpg"),
        instagram_url: "https://www.instagram.com/reel/Dd1LXAoSxAk/?utm_source=ig_web_copy_link",
        title: "Look 04 · Shade Blush Rose",
        quote: "Shade Blush Rose! Exploring effortless gifting and everyday botanical radiance with natural cheek glow.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "cherry-blossom-blush",
    name: "Cherry Blossom Blush",
    price: "₹899.00",
    rawPrice: 899,
    image: resolveAsset("/products/Cherry Blossom Blush.webp"),
    campaign: resolveAsset("/products/Minimal_design/Cherry Blossom Blush.png"),
    still: resolveAsset("/products/Cherry Blossom Blush.webp"),
    gallery: [
      resolveAsset("/products/Cherry Blossom Blush.webp"),
      resolveAsset("/products/Minimal_design/Cherry Blossom Blush.png"),
    ],
    shades: [
      { name: "Pink Blossom", tone: "#b8486e", slug: "pink-blossom-blush", image: resolveAsset("/products/Pink Blossom Blush.webp") },
      { name: "Peach Blossom", tone: "#e27a67", slug: "peach-blossom-blush", image: resolveAsset("/products/Peach Blossom Blush.webp") },
      { name: "Cherry Blossom", tone: "#9b2c58", slug: "cherry-blossom-blush", image: resolveAsset("/products/Cherry Blossom Blush.webp") },
    ],
    tag: "New",
    tone: "#9b2c58",
    category: "Blush",
    note: "Vivid petal bloom",
    finish: "Silk powder",
    mood: "The couture pop",
    description: "A striking cherry blossom rose compact blush with buildable micronized pigments. Infused with camellia seed oil for effortless blendability and bold couture presence.",
    short_description: "Vivid couture cherry rose silk powder compact blush.",
    ingredients: "Camellia Seed Oil, Damask Rose Extract, Vitamin E, Micronized French Mica, Mineral Pigments.",
    benefits: ["High-Impact Petal Pigment", "Seamless Melt-Into-Skin Texture", "Luxurious Mirror Compact", "12H Longwear"],
    how_to_use: "Lightly tap with a brush, smile, and blend along high cheekbones for a dramatic couture flush.",
    size: "5.2g / 0.18 oz",
    video_url: resolveAsset("/reels/reel-20-complete-makeup-blush.mp4"),
    instagram_url: "https://www.instagram.com/reel/DdvUvMJS-Ui/?utm_source=ig_web_copy_link",
    video_title: "Look 07 · The Finishing Flush",
    video_quote: "The perfect blush from SheAura to complete my makeup look. Soft, romantic, and all-day wear.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-20",
        video_url: resolveAsset("/reels/reel-20-complete-makeup-blush.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-20-complete-makeup-blush.jpg"),
        instagram_url: "https://www.instagram.com/reel/DdvUvMJS-Ui/?utm_source=ig_web_copy_link",
        title: "Look 07 · The Finishing Flush",
        quote: "The perfect blush from SheAura to complete my makeup look. Soft, romantic, and all-day wear.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "molten-glow-highlighter",
    name: "Molten Glow Highlighter · Sunflower Gold",
    price: "₹1,199.00",
    rawPrice: 1199,
    image: resolveAsset("/products/Body_Highlighter_Oil_design.webp"),
    campaign: resolveAsset("/campaign/highlighter-glow-portrait.png"),
    still: resolveAsset("/products/Minimal_design/Highlighter simple.png"),
    gallery: [
      resolveAsset("/products/Body_Highlighter_Oil_design.webp"),
      resolveAsset("/campaign/highlighter-glow-portrait.png"),
      resolveAsset("/products/Minimal_design/Highlighter simple.png"),
      resolveAsset("/products/Minimal_design/Body_Highlighter_Oil_Sunflower.png"),
      resolveAsset("/products/Body_Highlighter_Oil_Sunflower.webp"),
    ],
    shades: [
      { name: "Sunflower Gold", tone: "#c18847", slug: "molten-glow-highlighter", image: resolveAsset("/products/Body_Highlighter_Oil_design.webp") },
      { name: "Moonflower Pearl", tone: "#d8d2ce", slug: "moonflower-highlighter-oil", image: resolveAsset("/products/Body_Highlighter_Oil_Moonflower_2.webp") },
    ],
    tag: "Bestseller",
    tone: "#c18847",
    category: "Highlighter",
    note: "Sunflower liquid gold",
    finish: "Molten pearl",
    mood: "The golden hour",
    description: "A fluid veil of warm golden luminosity that catches the light like molten jewellery and turns skin into the main accessory. Infused with squalane and molten mica pearls.",
    short_description: "Liquid golden hour luminosity with molten mica pearl veil.",
    ingredients: "Molten Mica Pearls, Plant Squalane, Niacinamide, Lotus Blossom Water, Jojoba Golden Oil.",
    benefits: ["Weightless Second-Skin Glow", "Molten Mica Pearls", "Hydrating Botanical Base", "For Face & Body"],
    how_to_use: "Warm 2-3 drops between palms and press onto high points of cheekbones, collarbones, and shoulders.",
    size: "30ml / 1.0 fl oz",
    video_url: resolveAsset("/reels/reel-05-body-highlighter-oil.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeG5GujBNVT/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · Body Shimmer Veil",
    video_quote: "Just gift her the She’Aura Body Highlighter Oil. Smooth application, gorgeous shimmer, and luxury glow.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-05",
        video_url: resolveAsset("/reels/reel-05-body-highlighter-oil.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-05-body-highlighter-oil.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeG5GujBNVT/?utm_source=ig_web_copy_link",
        title: "Look 01 · Body Shimmer Veil",
        quote: "Just gift her the She’Aura Body Highlighter Oil. Smooth application, gorgeous shimmer, and luxury glow.",
        social_handle: "@sheauracosmeticsofficial",
      },
      {
        id: "reel-16",
        video_url: resolveAsset("/reels/reel-16-sheaura-body-oil-highlighter.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-16-sheaura-body-oil-highlighter.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeZ2Y7OvRQs/?utm_source=ig_web_copy_link",
        title: "Look 03 · Molten Body Shine",
        quote: "What do you think about this? Try SheAura Body Oil Highlighter for that goddess molten shine on collarbones and shoulders.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "moonflower-highlighter-oil",
    name: "Moonflower Highlighter Oil",
    price: "₹1,199.00",
    rawPrice: 1199,
    image: resolveAsset("/products/Body_Highlighter_Oil_Moonflower_2.webp"),
    campaign: resolveAsset("/products/Minimal_design/Body_Highlighter_Oil_Moonflower.png"),
    still: resolveAsset("/products/Body_Highlighter_Oil_Moonflower.webp"),
    gallery: [
      resolveAsset("/products/Body_Highlighter_Oil_Moonflower_2.webp"),
      resolveAsset("/products/Minimal_design/Body_Highlighter_Oil_Moonflower.png"),
      resolveAsset("/products/Body_Highlighter_Oil_Moonflower.webp"),
    ],
    shades: [
      { name: "Sunflower Gold", tone: "#c18847", slug: "molten-glow-highlighter", image: resolveAsset("/products/Body_Highlighter_Oil_design.webp") },
      { name: "Moonflower Pearl", tone: "#d8d2ce", slug: "moonflower-highlighter-oil", image: resolveAsset("/products/Body_Highlighter_Oil_Moonflower_2.webp") },
    ],
    tag: "New",
    tone: "#d8d2ce",
    category: "Highlighter",
    note: "Celestial pearlescent veil",
    finish: "Molten crystal pearl",
    mood: "The starlight glow",
    description: "A dreamy starlight pearl highlighter oil with ethereal Moonflower luminosity. Weightless squalane base glides effortlessly across skin, leaving a dewy, non-sticky diamond sheen.",
    short_description: "Dreamy starlight pearl highlighter oil for luminous glass skin.",
    ingredients: "Crystal Mica Pearls, Plant Squalane, Evening Primrose Extract, Niacinamide, Vitamin E, White Lotus Essence.",
    benefits: ["Glass-Skin Crystal Glow", "Non-Sticky Silk Feel", "Luxe Gold Pump Bottle", "Universal Pearl Luminosity"],
    how_to_use: "Pump 1-2 drops onto fingertips and blend over high cheekbones, brow bones, and shoulders for liquid light.",
    size: "30ml / 1.0 fl oz",
    video_url: resolveAsset("/reels/reel-09-moonflower-highlighter.mp4"),
    instagram_url: "https://www.instagram.com/reel/Dd6SWx_tJjp/?utm_source=ig_web_copy_link",
    video_title: "Look 02 · Moonflower Liquid Light",
    video_quote: "Giving full Bebo vibes! The Moonflower Highlighter by SHE’AURA is all about that dreamy, molten glow.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-09",
        video_url: resolveAsset("/reels/reel-09-moonflower-highlighter.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-09-moonflower-highlighter.jpg"),
        instagram_url: "https://www.instagram.com/reel/Dd6SWx_tJjp/?utm_source=ig_web_copy_link",
        title: "Look 02 · Moonflower Liquid Light",
        quote: "Giving full Bebo vibes! The Moonflower Highlighter by SHE’AURA is all about that dreamy, molten glow.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "hydrating-matte-foundation-daffodil",
    name: "Hydrating Matte Foundation · Daffodil",
    price: "₹1,299.00",
    rawPrice: 1299,
    image: resolveAsset("/products/Daffodil.webp"),
    campaign: resolveAsset("/products/Minimal_design/Daffodil.png"),
    still: resolveAsset("/products/Daffodil.webp"),
    gallery: [
      resolveAsset("/products/Daffodil.webp"),
      resolveAsset("/products/Minimal_design/Daffodil.png"),
    ],
    shades: [
      { name: "Daffodil (Warm)", tone: "#dfb895", slug: "hydrating-matte-foundation-daffodil", image: resolveAsset("/products/Daffodil.webp") },
      { name: "Snowdrop (Fair)", tone: "#f1ded0", slug: "hydrating-matte-foundation-snowdrop", image: resolveAsset("/products/Foundation_snowdrop.webp") },
    ],
    tag: "Complexion",
    tone: "#dfb895",
    category: "Complexion",
    note: "Warm sand featherweight base",
    finish: "Hydrating matte",
    mood: "Pure skin radiance",
    description: "A breathable, featherweight hydrating matte foundation in shade Daffodil. Melts into the skin for a seamless, second-skin finish without masking your natural glow.",
    short_description: "Featherweight hydrating matte foundation in warm sand Daffodil.",
    ingredients: "Hyaluronic Acid, Camellia Sinensis Leaf Extract, Niacinamide, Pure Mineral Pigments, Vitamin E.",
    benefits: ["12H Breathable Matte Wear", "Multi-Weight Hyaluronic Hydration", "Non-Comedogenic & Clean", "Blurring Second-Skin Finish"],
    how_to_use: "Dispense 1-2 pumps onto the back of your hand and blend outward with fingertips or a damp sponge.",
    size: "30ml / 1.0 fl oz",
    video_url: resolveAsset("/reels/reel-06-not-a-filter-foundation.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeEq7-Azk_P/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · Second-Skin Base",
    video_quote: "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-06",
        video_url: resolveAsset("/reels/reel-06-not-a-filter-foundation.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-06-not-a-filter-foundation.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeEq7-Azk_P/?utm_source=ig_web_copy_link",
        title: "Look 01 · Second-Skin Base",
        quote: "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "hydrating-matte-foundation-snowdrop",
    name: "Hydrating Matte Foundation · Snowdrop",
    price: "₹1,299.00",
    rawPrice: 1299,
    image: resolveAsset("/products/Foundation_snowdrop.webp"),
    campaign: resolveAsset("/products/Minimal_design/Snowdrop.png"),
    still: resolveAsset("/products/Foundation_snowdrop.webp"),
    gallery: [
      resolveAsset("/products/Foundation_snowdrop.webp"),
      resolveAsset("/products/Foundation_snowdrop_desgin inspirations.webp"),
      resolveAsset("/products/Minimal_design/Snowdrop.png"),
    ],
    shades: [
      { name: "Daffodil (Warm)", tone: "#dfb895", slug: "hydrating-matte-foundation-daffodil", image: resolveAsset("/products/Daffodil.webp") },
      { name: "Snowdrop (Fair)", tone: "#f1ded0", slug: "hydrating-matte-foundation-snowdrop", image: resolveAsset("/products/Foundation_snowdrop.webp") },
    ],
    tag: "New Shade",
    tone: "#f1ded0",
    category: "Complexion",
    note: "Fair porcelain second-skin",
    finish: "Hydrating matte",
    mood: "Flawless porcelain veil",
    description: "Our signature hydrating matte formula in shade Snowdrop. Enriched with hyaluronic acid, niacinamide, and botanical squalane for fair skin tones seeking breathable coverage.",
    short_description: "Featherweight hydrating matte foundation in fair porcelain Snowdrop.",
    ingredients: "Hyaluronic Acid, Niacinamide, White Snowdrop Extract, Plant Squalane, Micronized Mineral Pigments.",
    benefits: ["Fair Porcelain Neutral Tone", "Weightless Second-Skin Feel", "Hydrates While Controlling Shine", "Dermatologist Tested"],
    how_to_use: "Dispense 1 pump and buff into skin with a foundation brush for airbrushed, velvet porcelain perfection.",
    size: "30ml / 1.0 fl oz",
    video_url: resolveAsset("/reels/reel-06-not-a-filter-foundation.mp4"),
    instagram_url: "https://www.instagram.com/reel/DeEq7-Azk_P/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · Second-Skin Base",
    video_quote: "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-06",
        video_url: resolveAsset("/reels/reel-06-not-a-filter-foundation.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-06-not-a-filter-foundation.jpg"),
        instagram_url: "https://www.instagram.com/reel/DeEq7-Azk_P/?utm_source=ig_web_copy_link",
        title: "Look 01 · Second-Skin Base",
        quote: "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
  },
  {
    slug: "sheaura-discovery-wardrobe",
    name: "She’Aura Discovery Wardrobe",
    price: "₹3,299.00",
    rawPrice: 3299,
    image: resolveAsset("/products/products.png"),
    campaign: resolveAsset("/products/Minimal_design/Daffodil.png"),
    still: resolveAsset("/products/products.png"),
    gallery: [
      resolveAsset("/products/products.png"),
      resolveAsset("/products/Minimal_design/Scarlet Rose Lipstick_still.png"),
      resolveAsset("/products/Minimal_design/pink blossam blus simple.png"),
      resolveAsset("/products/Minimal_design/Highlighter simple.png"),
    ],
    tag: "The Vault",
    tone: "#dfb895",
    category: "Collection",
    note: "Curated 4-piece luxury wardrobe",
    finish: "Multi-dimensional luxury",
    mood: "Complete collection",
    description: "The complete luxury SHE’AURA wardrobe edit featuring our Scarlet Rose Lipstick, Pink Blossom Blush compact, Radiant Fluid Foundation, and Molten Glow Highlighter.",
    short_description: "The complete 4-piece luxury beauty collection edit.",
    ingredients: "Formulated with signature botanicals: Damask Rose, Camellia Seed Oil, Plant Squalane, and Pure Mineral Pigments.",
    benefits: ["Complete 4-Piece Couture Ritual", "Signature Gold Keepsake Packaging", "Exclusive Gift Wardrobe Presentation"],
    how_to_use: "Apply the Radiant Fluid Foundation base, sculpt cheeks with Pink Blossom Blush, add liquid light with Molten Glow Highlighter, and finish with Scarlet Rose Lipstick.",
    size: "4-Piece Set",
    video_url: resolveAsset("/reels/reel-10-pr-review-unboxing.mp4"),
    instagram_url: "https://www.instagram.com/reel/Dd62wF7SbMG/?utm_source=ig_web_copy_link",
    video_title: "Look 01 · PR Review & Unboxing",
    video_quote: "Unboxing the luxury SHE’AURA collection. Sculpted packaging, sensory formulas, and radiant payoff.",
    social_handle: "@sheauracosmeticsofficial",
    videos: [
      {
        id: "reel-10",
        video_url: resolveAsset("/reels/reel-10-pr-review-unboxing.mp4"),
        poster_url: resolveAsset("/reels/posters/reel-10-pr-review-unboxing.jpg"),
        instagram_url: "https://www.instagram.com/reel/Dd62wF7SbMG/?utm_source=ig_web_copy_link",
        title: "Look 01 · PR Review & Complete Unboxing",
        quote: "Unboxing the luxury SHE’AURA collection. Sculpted packaging, sensory formulas, and radiant payoff.",
        social_handle: "@sheauracosmeticsofficial",
      },
    ],
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

  const slug = row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const matchingDefault = defaultProducts.find(
    (d) => (d.slug || d.name).toLowerCase() === (slug || row.name || "").toLowerCase()
  );

  const image = row.image_url || matchingDefault?.image || photos.makeup;
  const campaign = row.campaign_image_url || matchingDefault?.campaign || photos.model;
  const still = row.still || matchingDefault?.still || row.image_url || photos.lipstick;

  const gallery = Array.isArray(row.gallery) && row.gallery.length > 0
    ? row.gallery
    : matchingDefault?.gallery || [image, still, campaign].filter(Boolean);

  const shades = Array.isArray(row.shades) && row.shades.length > 0
    ? row.shades
    : matchingDefault?.shades;

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

  // Fallback to matching default videos or legacy single-video columns
  if (parsedVideos.length === 0 && matchingDefault?.videos && matchingDefault.videos.length > 0) {
    parsedVideos = matchingDefault.videos;
  } else if (parsedVideos.length === 0 && (row.video_url || row.instagram_url)) {
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
    slug,
    name: row.name || matchingDefault?.name || "Untitled Product",
    price: priceStr,
    rawPrice: numPrice || matchingDefault?.rawPrice,
    image,
    campaign,
    still,
    gallery,
    shades,
    tag: row.tag || matchingDefault?.tag || "Icon",
    tone: row.tone || matchingDefault?.tone || "#a81920",
    category: row.category || matchingDefault?.category || "Lip colour",
    note: row.note || row.short_description || matchingDefault?.note || "Botanical formula",
    finish: row.finish || matchingDefault?.finish || "Sculpted satin",
    mood: row.mood || matchingDefault?.mood || "The statement",
    description: row.description || row.short_description || matchingDefault?.description || "A conscious beauty piece from the She'Aura studio.",
    short_description: row.short_description || matchingDefault?.short_description || "",
    ingredients: row.ingredients || matchingDefault?.ingredients || "",
    benefits: Array.isArray(row.benefits) ? row.benefits : typeof row.benefits === "string" ? row.benefits.split("\n") : (matchingDefault?.benefits || []),
    how_to_use: row.how_to_use || matchingDefault?.how_to_use || "",
    size: row.size || matchingDefault?.size || "",
    video_url: parsedVideos[0]?.video_url || row.video_url || matchingDefault?.video_url || "",
    instagram_url: parsedVideos[0]?.instagram_url || row.instagram_url || matchingDefault?.instagram_url || "",
    video_title: parsedVideos[0]?.title || row.video_title || matchingDefault?.video_title || "Look 01 · Sensorial Glide",
    video_quote: parsedVideos[0]?.quote || row.video_quote || matchingDefault?.video_quote || "Finding a formula that glides smoothly and hydrates all day.",
    social_handle: parsedVideos[0]?.social_handle || row.social_handle || matchingDefault?.social_handle || "@sheauracosmeticsofficial",
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
