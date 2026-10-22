import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../services/supabaseServer.js";

export async function getAdminOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, limit = "100" } = req.query;

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit as string, 10));

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;
    if (error) {
      res.status(500).json({ error: "Failed to query orders", details: error.message });
      return;
    }

    res.json({ success: true, count: orders?.length || 0, orders: orders || [] });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", message: err?.message });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ["processing", "dispatched", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const updatePayload: Record<string, any> = { status };
    if (trackingNumber) updatePayload.tracking_number = trackingNumber;

    const { data: updated, error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: "Failed to update order status", details: error.message });
      return;
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", message: err?.message });
  }
}

export async function getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { data: orders } = await supabaseAdmin.from("orders").select("total_price, status");
    const { data: products } = await supabaseAdmin.from("products").select("id, stock_quantity");

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0) || 0;
    const processing = orders?.filter((o) => o.status === "processing").length || 0;
    const dispatched = orders?.filter((o) => o.status === "dispatched").length || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        processingOrders: processing,
        dispatchedOrders: dispatched,
        totalProducts: products?.length || 13,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", message: err?.message });
  }
}
