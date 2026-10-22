/**
 * SheAura Clean API Client
 * Connects the React Storefront on Vercel to either:
 * 1. Supabase Edge Functions (Native Supabase Serverless)
 * 2. Dedicated Backend API (/api)
 */

import { supabase, isSupabaseConfigured } from "./supabase";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const USE_SUPABASE_FUNCTIONS =
  import.meta.env.VITE_USE_SUPABASE_FUNCTIONS === "true" ||
  API_BASE.includes("supabase.co");

export interface ApiOrderItem {
  productId: string;
  name?: string;
  shade?: string;
  quantity: number;
}

export interface ApiOrderPayload {
  items: ApiOrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    state?: string;
  };
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  promoCode?: string;
}

export interface OrderCalculationResult {
  items: Array<{
    productId: string;
    name: string;
    shade: string;
    unitPrice: number;
    quantity: number;
    itemTotal: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

/** Check backend health */
export async function checkBackendHealth(): Promise<boolean> {
  if (USE_SUPABASE_FUNCTIONS && isSupabaseConfigured) {
    return true;
  }
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "healthy";
  } catch {
    return false;
  }
}

/** Server-validated order calculation and pricing preview */
export async function previewOrderPricing(
  items: ApiOrderItem[],
  promoCode?: string
): Promise<OrderCalculationResult | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, promoCode }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.calculation;
  } catch {
    return null;
  }
}

/** Secure Server-Side Order Placement (Supabase Edge Function or Backend API) */
export async function submitOrderToBackend(payload: ApiOrderPayload): Promise<any> {
  // Option A: If configured for Supabase Edge Functions, invoke directly
  if (USE_SUPABASE_FUNCTIONS && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("orders", {
        body: payload,
      });
      if (!error && data?.success) {
        return data;
      }
      if (error) {
        console.warn("[API] Supabase Edge Function error, trying REST fallback:", error);
      }
    } catch (e) {
      console.warn("[API] Supabase Edge invocation error:", e);
    }
  }

  // Option B: Standard Backend API
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to submit order to secure backend");
  }
  return data;
}

/** Verify Cryptographic Payment Signature */
export async function verifyPaymentSignature(paymentData: {
  orderId: string;
  gatewayOrderId?: string;
  paymentId: string;
  signature?: string;
}): Promise<boolean> {
  if (USE_SUPABASE_FUNCTIONS && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("payment-verify", {
        body: paymentData,
      });
      return !error && data?.success === true;
    } catch {
      return false;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    return res.ok && data.success === true;
  } catch {
    return false;
  }
}
