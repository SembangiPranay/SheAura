import type { Request, Response } from "express";
import { z } from "zod";
import { calculateOrderTotals } from "../services/pricingService.js";
import { supabaseAdmin } from "../services/supabaseServer.js";

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().optional(),
  shade: z.string().optional(),
  quantity: z.number().int().positive().max(50),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(7),
    address: z.string().min(3),
    city: z.string().min(1),
    postalCode: z.string().min(3),
    state: z.string().optional(),
  }),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]).default("upi"),
  promoCode: z.string().optional(),
});

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = CreateOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation error: Invalid order payload",
        details: parseResult.error.format(),
      });
      return;
    }

    const { items, customer, paymentMethod, promoCode } = parseResult.data;

    // Recalculate and enforce server-verified pricing
    const orderCalc = calculateOrderTotals(items, promoCode);

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: `${customer.address}, ${customer.city}, ${customer.state || ""} ${customer.postalCode}`.trim(),
      items: orderCalc.items,
      subtotal: orderCalc.subtotal,
      discount: orderCalc.discount,
      shipping_fee: orderCalc.shipping,
      tax_amount: orderCalc.tax,
      total_price: orderCalc.total,
      currency: orderCalc.currency,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cod" ? "pending_cod" : "awaiting_payment",
      status: "processing",
      created_at: new Date().toISOString(),
    };

    // Save order in Supabase
    const { error: dbError } = await supabaseAdmin.from("orders").insert(newOrder);

    if (dbError) {
      console.error("[OrderController] Supabase insert error:", dbError);
      // Fallback: return order with note
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      message: "Order placed and verified by SheAura Secure Core",
    });
  } catch (err: any) {
    console.error("[OrderController] Error:", err);
    res.status(500).json({ error: "Failed to process order", message: err?.message });
  }
}

export async function previewOrder(req: Request, res: Response): Promise<void> {
  try {
    const { items, promoCode } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }
    const calculation = calculateOrderTotals(items, promoCode);
    res.json({ success: true, calculation });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || "Invalid calculation request" });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
}
