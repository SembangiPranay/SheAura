// ==============================================================================
// SHE'AURA — EXACT PRODUCT VIDEO SYNC SCRIPT
// Meticulously examines each of the 20 reels and syncs each video strictly to
// its corresponding product in Supabase and the catalog.
// ==============================================================================

const SUPABASE_URL = "https://erxquucmoonszopopavx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeHF1dWNtb29uc3pvcG9wYXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3MzAsImV4cCI6MjEwNzYzNzczMH0.95JwMIJygPAmdPNcTGN3HQaPDw1mgTH1adVoUuK4Vuk";

const lipstickVideos = [
  {
    id: "reel-02",
    video_url: "/reels/reel-02-nothing-better-lipstick.mp4",
    poster_url: "/reels/posters/reel-02-nothing-better-lipstick.jpg",
    instagram_url: "https://www.instagram.com/reel/DeO8B16hEAz/?utm_source=ig_web_copy_link",
    title: "Look 01 · The Red Statement",
    quote: "There’s nothing better than this. Rich pigment with hydrating comfort in a single stroke.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-03",
    video_url: "/reels/reel-03-everyday-glam.mp4",
    poster_url: "/reels/posters/reel-03-everyday-glam.jpg",
    instagram_url: "https://www.instagram.com/reel/DeLrsOLMSyo/?utm_source=ig_web_copy_link",
    title: "Look 02 · Nude to Bold",
    quote: "Everyday glam made effortless. Layerable formulas crafted for daylight and evening.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-04",
    video_url: "/reels/reel-04-grwm-lipsticks.mp4",
    poster_url: "/reels/posters/reel-04-grwm-lipsticks.jpg",
    instagram_url: "https://www.instagram.com/reel/DeJ0vGmMjxv/?utm_source=ig_web_copy_link",
    title: "Look 03 · Sensorial Hydra-Glide",
    quote: "GRWM featuring She’Aura lipsticks! Finding a formula that glides smoothly and hydrates all day.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-12",
    video_url: "/reels/reel-12-bullet-lipstick-luxury.mp4",
    poster_url: "/reels/posters/reel-12-bullet-lipstick-luxury.jpg",
    instagram_url: "https://www.instagram.com/reel/DdyuxBAPQMs/?utm_source=ig_web_copy_link",
    title: "Look 04 · Haute Luxury Bullet",
    quote: "Bullet lipstick but make it luxury! The detailing, the shade, the finish — everything is top notch.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-13",
    video_url: "/reels/reel-13-scarlet-rose-confidence.mp4",
    poster_url: "/reels/posters/reel-13-scarlet-rose-confidence.jpg",
    instagram_url: "https://www.instagram.com/reel/DdyjIg-tdpw/?utm_source=ig_web_copy_link",
    title: "Look 05 · Scarlet Confidence",
    quote: "Unveil your inner confidence with SheAura’s Scarlet Rose Lipstick—the perfect touch of bold, timeless beauty.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-15",
    video_url: "/reels/reel-15-colour-confidence-lip.mp4",
    poster_url: "/reels/posters/reel-15-colour-confidence-lip.jpg",
    instagram_url: "https://www.instagram.com/reel/DebGeA6vwb7/?utm_source=ig_web_copy_link",
    title: "Look 06 · Statement Nude",
    quote: "A little colour, a lot of confidence! The perfect lip shade just hits different on every skin tone.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-17",
    video_url: "/reels/reel-17-vegan-luxe-lipstick-steal.mp4",
    poster_url: "/reels/posters/reel-17-vegan-luxe-lipstick-steal.jpg",
    instagram_url: "https://www.instagram.com/reel/Ddi1IzLo90u/?utm_source=ig_web_copy_link",
    title: "Look 07 · Vegan Luxe Glide",
    quote: "Y’all need to steal this! It’s vegan, has luxe packaging and goes on smooth as silk without feeling heavy.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-18",
    video_url: "/reels/reel-18-three-reasons-love-bundle.mp4",
    poster_url: "/reels/posters/reel-18-three-reasons-love-bundle.jpg",
    instagram_url: "https://www.instagram.com/reel/DdllwnOBVms/?utm_source=ig_web_copy_link",
    title: "Look 08 · 3 Reasons to Fall in Love",
    quote: "Because one is never enough... so we’re giving you 3 reasons to fall in love with She’Aura beauty.",
    social_handle: "@sheauracosmeticsofficial",
  },
];

const blushVideos = [
  {
    id: "reel-01",
    video_url: "/reels/reel-01-perfect-blush.mp4",
    poster_url: "/reels/posters/reel-01-perfect-blush.jpg",
    instagram_url: "https://www.instagram.com/reel/DeV_UkRpvGw/?utm_source=ig_web_copy_link",
    title: "Look 01 · Everyday Petal Flush",
    quote: "The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-07",
    video_url: "/reels/reel-07-traditional-glow.mp4",
    poster_url: "/reels/posters/reel-07-traditional-glow.jpg",
    instagram_url: "https://www.instagram.com/reel/Dd_2YLhR6P4/?utm_source=ig_web_copy_link",
    title: "Look 02 · Festive Natural Glow",
    quote: "Pair your traditional look with She’aura to get the natural glow and festive elegance.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-08",
    video_url: "/reels/reel-08-orchid-peach-grwm.mp4",
    poster_url: "/reels/posters/reel-08-orchid-peach-grwm.jpg",
    instagram_url: "https://www.instagram.com/reel/Dd-wD1Oz39K/?utm_source=ig_web_copy_link",
    title: "Look 03 · Peach Blossom Glow",
    quote: "Perfect GRWM featuring Orchid Lipstick and Peach Blossom Blush. Fresh, blooming, and effortless.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-11",
    video_url: "/reels/reel-11-shade-blush-rose.mp4",
    poster_url: "/reels/posters/reel-11-shade-blush-rose.jpg",
    instagram_url: "https://www.instagram.com/reel/Dd1LXAoSxAk/?utm_source=ig_web_copy_link",
    title: "Look 04 · Shade Blush Rose",
    quote: "Shade Blush Rose! Exploring effortless gifting and everyday botanical radiance with natural cheek glow.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-14",
    video_url: "/reels/reel-14-grwm-viral-trend.mp4",
    poster_url: "/reels/posters/reel-14-grwm-viral-trend.jpg",
    instagram_url: "https://www.instagram.com/reel/Debtm5PypqV/?utm_source=ig_web_copy_link",
    title: "Look 05 · Keepsake Compact Routine",
    quote: "Get ready with me for office featuring the SheAura keepsake gold compact blush.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-19",
    video_url: "/reels/reel-19-perfect-blush-and-lipstick.mp4",
    poster_url: "/reels/posters/reel-19-perfect-blush-and-lipstick.jpg",
    instagram_url: "https://www.instagram.com/reel/DdjIZCsovzC/?utm_source=ig_web_copy_link",
    title: "Look 06 · The Perfect Blush & Lip Duo",
    quote: "Got my hands on the perfect blush and lipstick! Harmonic hues that bring natural vitality to skin.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-20",
    video_url: "/reels/reel-20-complete-makeup-blush.mp4",
    poster_url: "/reels/posters/reel-20-complete-makeup-blush.jpg",
    instagram_url: "https://www.instagram.com/reel/DdvUvMJS-Ui/?utm_source=ig_web_copy_link",
    title: "Look 07 · The Finishing Flush",
    quote: "The perfect blush from SheAura to complete my makeup look. Soft, romantic, and all-day wear.",
    social_handle: "@sheauracosmeticsofficial",
  },
];

const highlighterVideos = [
  {
    id: "reel-05",
    video_url: "/reels/reel-05-body-highlighter-oil.mp4",
    poster_url: "/reels/posters/reel-05-body-highlighter-oil.jpg",
    instagram_url: "https://www.instagram.com/reel/DeG5GujBNVT/?utm_source=ig_web_copy_link",
    title: "Look 01 · Body Shimmer Veil",
    quote: "Just gift her the She’Aura Body Highlighter Oil. Smooth application, gorgeous shimmer, and luxury glow.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-09",
    video_url: "/reels/reel-09-moonflower-highlighter.mp4",
    poster_url: "/reels/posters/reel-09-moonflower-highlighter.jpg",
    instagram_url: "https://www.instagram.com/reel/Dd6SWx_tJjp/?utm_source=ig_web_copy_link",
    title: "Look 02 · Moonflower Liquid Light",
    quote: "Giving full Bebo vibes! The Moonflower Highlighter by SHE’AURA is all about that dreamy, molten glow.",
    social_handle: "@sheauracosmeticsofficial",
  },
  {
    id: "reel-16",
    video_url: "/reels/reel-16-sheaura-body-oil-highlighter.mp4",
    poster_url: "/reels/posters/reel-16-sheaura-body-oil-highlighter.jpg",
    instagram_url: "https://www.instagram.com/reel/DeZ2Y7OvRQs/?utm_source=ig_web_copy_link",
    title: "Look 03 · Molten Body Shine",
    quote: "What do you think about this? Try SheAura Body Oil Highlighter for that goddess molten shine on collarbones and shoulders.",
    social_handle: "@sheauracosmeticsofficial",
  },
];

const foundationVideos = [
  {
    id: "reel-06",
    video_url: "/reels/reel-06-not-a-filter-foundation.mp4",
    poster_url: "/reels/posters/reel-06-not-a-filter-foundation.jpg",
    instagram_url: "https://www.instagram.com/reel/DeEq7-Azk_P/?utm_source=ig_web_copy_link",
    title: "Look 01 · Second-Skin Base",
    quote: "This is not a filter, it’s my foundation. Featherweight coverage that lets real skin shine through.",
    social_handle: "@sheauracosmeticsofficial",
  },
];

async function syncProduct(name, updatePayload) {
  const url = `${SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(updatePayload),
  });
  const data = await res.json();
  console.log(`Updated ${name} in Supabase:`, data.length > 0 ? "OK" : "Not Found / Skipped");
}

async function main() {
  console.log("Synchronizing exact product videos to Supabase...");

  // 1. Scarlet Rose Lipstick
  await syncProduct("Scarlet Rose Lipstick", {
    video_url: lipstickVideos[0].video_url,
    instagram_url: lipstickVideos[0].instagram_url,
    video_title: lipstickVideos[0].title,
    video_quote: lipstickVideos[0].quote,
    social_handle: lipstickVideos[0].social_handle,
    videos: lipstickVideos,
  });

  // 2. Pink Blossom Blush
  await syncProduct("Pink Blossom Blush", {
    video_url: blushVideos[0].video_url,
    instagram_url: blushVideos[0].instagram_url,
    video_title: blushVideos[0].title,
    video_quote: blushVideos[0].quote,
    social_handle: blushVideos[0].social_handle,
    videos: blushVideos,
  });

  // 3. Molten Glow Highlighter
  await syncProduct("Molten Glow Highlighter", {
    video_url: highlighterVideos[0].video_url,
    instagram_url: highlighterVideos[0].instagram_url,
    video_title: highlighterVideos[0].title,
    video_quote: highlighterVideos[0].quote,
    social_handle: highlighterVideos[0].social_handle,
    videos: highlighterVideos,
  });

  // 4. Upsert Radiant Fluid Foundation if not present
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/products?name=eq.Radiant%20Fluid%20Foundation`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const found = await checkRes.json();
  if (!Array.isArray(found) || found.length === 0) {
    console.log("Inserting Radiant Fluid Foundation into Supabase...");
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: "Radiant Fluid Foundation",
        slug: "radiant-fluid-foundation",
        category: "Complexion",
        price: 1299,
        image_url: "https://images.unsplash.com/photo-1650529192390-19528c5db606?auto=format&fit=crop&w=900&q=85",
        campaign_image_url: "https://images.unsplash.com/photo-1675773051474-55c4b7d2cf53?auto=format&fit=crop&w=1400&q=90",
        tag: "Complexion",
        tone: "#dfb895",
        finish: "Second-skin satin",
        mood: "Pure skin radiance",
        description: "A breathable, featherweight foundation that melts into the skin for a seamless, second-skin finish without masking your natural glow.",
        short_description: "Featherweight second-skin fluid foundation.",
        ingredients: "Hyaluronic Acid, Camellia Sinensis Leaf Extract, Niacinamide, Pure Mineral Pigments",
        benefits: ["Weightless Second-Skin Feel", "Non-Comedogenic & Breathable", "All-Day Natural Radiance"],
        how_to_use: "Dispense 1-2 pumps onto the back of your hand and blend outward with fingertips or a damp sponge.",
        size: "30ml / 1.0 fl oz",
        is_published: true,
        video_url: foundationVideos[0].video_url,
        instagram_url: foundationVideos[0].instagram_url,
        video_title: foundationVideos[0].title,
        video_quote: foundationVideos[0].quote,
        social_handle: foundationVideos[0].social_handle,
        videos: foundationVideos,
      }),
    });
    console.log("Foundation insert status:", insertRes.status);
  } else {
    console.log("Updating existing Radiant Fluid Foundation...");
    await syncProduct("Radiant Fluid Foundation", {
      video_url: foundationVideos[0].video_url,
      instagram_url: foundationVideos[0].instagram_url,
      video_title: foundationVideos[0].title,
      video_quote: foundationVideos[0].quote,
      social_handle: foundationVideos[0].social_handle,
      videos: foundationVideos,
    });
  }

  console.log("Product video sync completed!");
}

main().catch(console.error);
