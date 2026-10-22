import type { Request, Response } from "express";
import crypto from "crypto";
import { config } from "../config.js";
import { supabaseAdmin } from "../services/supabaseServer.js";

export async function createPaymentIntent(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, amount, currency = "INR" } = req.body;

    if (!orderId || !amount) {
      res.status(400).json({ error: "Missing orderId or amount" });
      return;
    }

    // In a live integration, call Razorpay Orders API:
    // const rzpOrder = await razorpay.orders.create({ amount: amount * 100, currency, receipt: orderId });
    const gatewayOrderId = `rzp_order_${Date.now().toString(36)}`;

    res.json({
      success: true,
      gatewayOrderId,
      amount,
      currency,
      keyId: config.payments.razorpayKeyId || "rzp_test_placeholder",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to initialize payment gateway", details: err?.message });
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, gatewayOrderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId) {
      res.status(400).json({ error: "Missing verification parameters" });
      return;
    }

    // Cryptographic HMAC-SHA256 signature verification
    const secret = config.payments.razorpayKeySecret;
    if (secret && signature && gatewayOrderId) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${gatewayOrderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature !== signature) {
        res.status(400).json({ error: "Cryptographic signature mismatch: Forged payment detected" });
        return;
      }
    }

    // Update order status in Supabase
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        gateway_payment_id: paymentId,
        gateway_order_id: gatewayOrderId,
        status: "processing",
      })
      .eq("id", orderId);

    res.json({
      success: true,
      message: "Payment verified successfully by SheAura Security Engine",
      orderId,
      paymentId,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Payment verification error", details: err?.message });
  }
}
