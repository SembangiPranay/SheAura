import specsData from "../data/sheaura_detailed_specs.json";

export interface InciHighlight {
  name: string;
  role: string;
  concentration?: string;
  benefit: string;
}

export interface InciDetails {
  summary: string;
  highlights: InciHighlight[];
  badges: string[];
  fullInci: string;
  keyBenefits?: string;
  howToUse?: string;
}

const typedSpecs = specsData as Record<
  string,
  {
    name: string;
    slug: string;
    accordions?: {
      "Product Description"?: string;
      "How to use it?"?: string;
      Ingredients?: string;
      "Key Benefits"?: string;
      "Key Features"?: string;
      "Return Policy"?: string;
    };
  }
>;

export function getProductInciDetails(product: {
  name?: string;
  slug?: string;
  category?: string;
  ingredients?: string;
}): InciDetails {
  const slug = (product.slug || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  // Try to match from scraped authentic specs
  let matchedSpec =
    typedSpecs[slug] ||
    Object.values(typedSpecs).find(
      (s) =>
        s.slug === slug ||
        s.name.toLowerCase() === name ||
        name.includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(name.split(" ")[0])
    );

  const rawIngredients =
    matchedSpec?.accordions?.Ingredients || product.ingredients || "";
  const howToUse = matchedSpec?.accordions?.["How to use it?"] || "";
  const keyBenefits = matchedSpec?.accordions?.["Key Benefits"] || "";

  // 1. FOUNDATIONS
  if (
    category.includes("foundation") ||
    slug.includes("foundation") ||
    slug === "honey-lily" ||
    slug === "toffee-rose" ||
    slug === "daffodil" ||
    slug === "snowdrop"
  ) {
    return {
      summary:
        "Engineered with soft-focus blurring silica (3.9%), hydrating sodium hyaluronate (0.03%), and a breathable film-former for a comfortable, 8-hour matte finish.",
      badges: ["100% Vegan", "Cruelty-Free", "Paraben-Free", "8-Hour Wear Tested"],
      highlights: [
        {
          name: "Silica Blurring System",
          concentration: "3.9%",
          role: "Soft-Focus & Oil Control",
          benefit: "Absorbs excess sebum, refines the appearance of pores and uneven texture.",
        },
        {
          name: "Sodium Hyaluronate + Glycerin",
          concentration: "4.5%",
          role: "Deep Moisture Infusion",
          benefit: "Maintains skin hydration balance, preventing caking and tightness.",
        },
        {
          name: "Caprylyl Methicone System",
          concentration: "5.0%",
          role: "Silky Glide Matrix",
          benefit: "Provides weightless spreadability and an airbrushed, skin-mimicking texture.",
        },
        {
          name: "Acrylates Film-Former",
          concentration: "3.4%",
          role: "8-Hour Wear Adherence",
          benefit: "Locks pigment molecules to skin for sweat-resistant, transfer-proof wear.",
        },
      ],
      fullInci: rawIngredients,
      keyBenefits,
      howToUse,
    };
  }

  // 2. LIPSTICKS
  if (
    category.includes("lipstick") ||
    slug.includes("lipstick") ||
    slug.includes("rose") ||
    slug.includes("orchid")
  ) {
    return {
      summary:
        "Crafted with botanical Simmondsia Chinensis (Jojoba) seed oil and dimethicone wrinkle-blurring polymers for rich hydration and weightless 8-hour velvet wear.",
      badges: ["100% Vegan", "Cruelty-Free", "Paraben-Free", "Floral Embossed Bullet"],
      highlights: [
        {
          name: "Jojoba Seed Oil (Simmondsia Chinensis)",
          role: "Botanical Lipid Moisture",
          benefit: "Mimics human sebum for instant lip conditioning and long-lasting softness.",
        },
        {
          name: "Dimethicone Crosspolymer",
          role: "Wrinkle-Smoothing Polymer",
          benefit: "Fills and smooths fine lip lines, providing a non-drying soft-matte effect.",
        },
        {
          name: "Tocopherol (Vitamin E)",
          role: "Antioxidant Care",
          benefit: "Shields delicate lip skin from environmental dryness.",
        },
        {
          name: "Pure Mineral Pigments",
          role: "Expressive Colour Payoff",
          benefit: "Triple-milled micronized pigments for even, one-swipe opacity.",
        },
      ],
      fullInci: rawIngredients,
      keyBenefits,
      howToUse,
    };
  }

  // 3. HIGHLIGHTERS
  if (
    category.includes("highlight") ||
    slug.includes("moonflower") ||
    slug.includes("sunflower")
  ) {
    return {
      summary:
        "Infused with multi-dimensional synthetic fluorphlogopite pearls suspended in a cushiony gel network for high-beam luminescence without glitter fallout.",
      badges: ["100% Vegan", "Cruelty-Free", "Paraben-Free", "Zero Glitter Fallout"],
      highlights: [
        {
          name: "Synthetic Fluorphlogopite & Titanium Dioxide",
          concentration: "<4.0%",
          role: "Luminescent Mineral Radiance",
          benefit: "Creates a glass-like multidimensional sheen that catches light naturally.",
        },
        {
          name: "Texture-Enhancing Gel Network",
          concentration: "<11%",
          role: "Cushion Suspension",
          benefit: "Suspends micro-pearls evenly without settling into fine lines or pores.",
        },
        {
          name: "Emollient Oil Blend",
          concentration: "<95%",
          role: "Glossy Skin Glide",
          benefit: "Allows effortless fingertip or brush blending with a dew-kissed finish.",
        },
      ],
      fullInci: rawIngredients,
      keyBenefits,
      howToUse,
    };
  }

  // 4. BLUSHES
  if (
    category.includes("blush") ||
    slug.includes("blush") ||
    slug.includes("blossom")
  ) {
    return {
      summary:
        "Formulated with animal-free botanical squalane, skin-friendly coated mica, and Vitamin E for a seamless, silky wash of petal-soft colour.",
      badges: ["100% Vegan", "Cruelty-Free", "Paraben-Free", "Skin-Biocompatible"],
      highlights: [
        {
          name: "Synthetic Botanical Squalane",
          role: "Moisture-Lock Emollient",
          benefit: "Delivers deep water-retention and antioxidant care with 100% animal-free sourcing.",
        },
        {
          name: "Dimethicone-Coated Talc & Mica",
          role: "Silky Skin Adherence",
          benefit: "Eliminates chalkiness and blends smoothly into skin like a second layer.",
        },
        {
          name: "Tocopheryl Acetate (Vitamin E)",
          role: "Skin Nourishment",
          benefit: "Supports skin health while maintaining all-day fresh blush pigment.",
        },
      ],
      fullInci: rawIngredients,
      keyBenefits,
      howToUse,
    };
  }

  // Default fallback for curated collections or other items
  return {
    summary:
      "A conscious formula combining clean botanical emollients, pure mineral pigments, and tested skin-conditioning actives.",
    badges: ["100% Vegan", "Cruelty-Free", "Paraben-Free", "Conscious Beauty"],
    highlights: [
      {
        name: "Botanical Plant Waxes",
        role: "Natural Texture & Glide",
        benefit: "Ensures smooth application and comfortable non-sticky feel.",
      },
      {
        name: "Pure Mineral Pigments",
        role: "Considered Colour",
        benefit: "Provides clean, expressive colour with buildable payoff.",
      },
    ],
    fullInci: rawIngredients,
    keyBenefits,
    howToUse,
  };
}
