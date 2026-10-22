import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load backend/.env first
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Also load root .env as fallback
dotenv.config();

const DEFAULT_SUPABASE_URL = "https://erxquucmoonszopopavx.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeHF1dWNtb29uc3pvcG9wYXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3MzAsImV4cCI6MjEwNzYzNzczMH0.95JwMIJygPAmdPNcTGN3HQaPDw1mgTH1adVoUuK4Vuk";

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:6080,http://localhost:8443,http://localhost:5173").split(","),
  supabase: {
    url: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY || DEFAULT_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_ANON_KEY,
    databaseUrl: process.env.DATABASE_URL || "",
  },
  payments: {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  },
  admin: {
    secretKey: process.env.ADMIN_SECRET_KEY || "sheaura_production_admin_vault_2026",
  },
};
