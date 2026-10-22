import express from "express";
import { config } from "./config.js";
import { securityHeaders, corsPolicy, apiLimiter } from "./middleware/security.js";
import { apiRouter } from "./routes/api.js";

const app = express();

// Trust reverse proxy (Vercel, Nginx, Hostinger, AWS ALB)
app.set("trust proxy", 1);

// Security Middleware Pipeline
app.use(securityHeaders);
app.use(corsPolicy);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate Limiting
app.use("/api", apiLimiter);

// Mount API Routes
app.use("/api", apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Central Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[ServerError]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(config.nodeEnv === "development" ? { stack: err.stack } : {}),
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`[SheAura API] Secure Backend running on port ${config.port} (${config.nodeEnv})`);
  console.log(`[SheAura API] Health check available at: http://localhost:${config.port}/api/health`);
});

export default app;
