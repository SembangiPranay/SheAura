import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { supabaseAdmin } from "../services/supabaseServer.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: string;
  };
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const adminKey = req.headers["x-admin-key"] as string | undefined;
  if (adminKey && adminKey === config.admin.secretKey) {
    req.user = { id: "admin-root", role: "admin" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing authentication credentials" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
      return;
    }

    // Verify user role in profiles table
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "customer";
    if (role !== "admin") {
      res.status(403).json({ error: "Forbidden: Administrative privileges required" });
      return;
    }

    req.user = { id: user.id, email: user.email, role: "admin" };
    next();
  } catch (err: any) {
    res.status(500).json({ error: "Auth verification failure", details: err?.message });
  }
}
