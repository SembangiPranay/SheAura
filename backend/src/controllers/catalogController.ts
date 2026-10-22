import type { Request, Response } from "express";
import { supabaseAdmin } from "../services/supabaseServer.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory cache for ultra-high throughput
let cachedCatalog: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function loadFallbackCatalog(): any[] {
  try {
    const catalogPath = path.resolve(__dirname, "../../../src/data/scraped_sheaura_catalog.json");
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[CatalogController] Could not load fallback catalog file:", err);
  }
  return [];
}

export async function getCatalog(req: Request, res: Response): Promise<void> {
  const now = Date.now();
  if (cachedCatalog && now - lastCacheTime < CACHE_TTL_MS) {
    res.setHeader("X-Cache", "HIT");
    res.json({ success: true, count: cachedCatalog.length, products: cachedCatalog });
    return;
  }

  try {
    // Attempt to query Supabase
    const { data: dbProducts, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbProducts && dbProducts.length > 0) {
      cachedCatalog = dbProducts;
      lastCacheTime = now;
      res.setHeader("X-Cache", "MISS");
      res.json({ success: true, count: dbProducts.length, products: dbProducts });
      return;
    }

    // Fallback to local high-fidelity scraped catalog
    const local = loadFallbackCatalog();
    cachedCatalog = local;
    lastCacheTime = now;
    res.setHeader("X-Cache", "FALLBACK");
    res.json({ success: true, count: local.length, products: local });
  } catch (err: any) {
    const local = loadFallbackCatalog();
    res.json({ success: true, count: local.length, products: local });
  }
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  try {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && product) {
      res.json({ success: true, product });
      return;
    }

    const fallback = loadFallbackCatalog().find((p) => p.slug === slug);
    if (fallback) {
      res.json({ success: true, product: fallback });
      return;
    }

    res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
