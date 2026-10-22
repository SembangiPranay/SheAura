import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  User,
  ShoppingBag,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
  Layers,
  MapPin,
  Phone,
  Mail,
  X,
  CreditCard,
  Tag,
  Check,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import SheAuraLogo from "./SheAuraLogo";

export interface AdminOrderItem {
  productId: string;
  name: string;
  shade?: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  image?: string;
}

export interface AdminOrder {
  id: string;
  client_name: string;
  customer_name?: string;
  client_email: string;
  customer_email?: string;
  client_phone: string;
  customer_phone?: string;
  shipping_address: string;
  items: AdminOrderItem[] | string;
  items_count: number;
  total_amount: string;
  subtotal?: number;
  discount?: number;
  shipping_fee?: number;
  tax_amount?: number;
  total_price?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  status: "pending" | "processing" | "dispatched" | "delivered" | "cancelled";
  tracking_number?: string | null;
  eta?: string;
  created_at: string;
  updated_at?: string;
}

export interface CustomerSummary {
  name: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock_quantity?: number;
  image?: string;
}

interface AdminViewProps {
  onBack: () => void;
  reels?: any;
  onSelectProduct?: (product: any) => void;
}

const FALLBACK_PRODUCTS: AdminProduct[] = [
  { id: "1", name: "Pink Blossom Blush", slug: "pink-blossom-blush", category: "Blush", price: 899, stock_quantity: 42, image: "/products/Pink Blossom Blush.webp" },
  { id: "2", name: "Peach Blossom Blush", slug: "peach-blossom-blush", category: "Blush", price: 899, stock_quantity: 38, image: "/products/Peach Blossom Blush.webp" },
  { id: "3", name: "Cherry Blossom Blush", slug: "cherry-blossom-blush", category: "Blush", price: 899, stock_quantity: 26, image: "/products/Cherry Blossom Blush.webp" },
  { id: "4", name: "Scarlet Rose Lipstick", slug: "scarlet-rose-lipstick", category: "Lipstick", price: 1099, stock_quantity: 54, image: "/products/Minimal_design/Scarlet Rose Lipstick_still.png" },
  { id: "5", name: "Roseberry Lipstick", slug: "roseberry-lipstick", category: "Lipstick", price: 1099, stock_quantity: 48, image: "/products/Roseberry Lipstick.webp" },
  { id: "6", name: "Blush Rose Lipstick", slug: "blush-rose-lipstick", category: "Lipstick", price: 1099, stock_quantity: 35, image: "/products/Blush Rose Lipstick.webp" },
  { id: "7", name: "Orchid Lipstick", slug: "orchid-lipstick", category: "Lipstick", price: 1099, stock_quantity: 29, image: "/products/Orchid Lipstick.webp" },
  { id: "8", name: "Molten Glow Highlighter · Sunflower", slug: "molten-glow-highlighter", category: "Highlighter", price: 1199, stock_quantity: 18, image: "/products/Minimal_design/Highlighter simple.png" },
  { id: "9", name: "Moonflower Highlighter Oil", slug: "moonflower-highlighter-oil", category: "Highlighter", price: 1199, stock_quantity: 12, image: "/products/Moonflower Highlighter Oil.webp" },
  { id: "10", name: "Hydrating Matte Foundation · Daffodil", slug: "hydrating-matte-foundation-daffodil", category: "Foundation", price: 1299, stock_quantity: 32, image: "/products/Daffodil.png" },
  { id: "11", name: "Hydrating Matte Foundation · Snowdrop", slug: "hydrating-matte-foundation-snowdrop", category: "Foundation", price: 1299, stock_quantity: 24, image: "/products/Snowdrop.png" },
  { id: "12", name: "She’Aura Discovery Wardrobe", slug: "sheaura-discovery-wardrobe", category: "Collection", price: 3299, stock_quantity: 9, image: "/products/discovery-wardrobe-still.png" },
];

export default function AdminView({ onBack }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "customers" | "inventory">("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Load orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setOrders(data as AdminOrder[]);
        }
      }
    } catch (err) {
      console.warn("[AdminView] Live orders fetch notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Status Updater
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "processing" | "dispatched" | "delivered" | "cancelled",
    customTracking?: string
  ) => {
    setIsUpdatingStatus(true);
    const tracking = customTracking || `EXP-BLUEDART-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from("orders")
          .update({
            status: newStatus,
            tracking_number: newStatus === "dispatched" || newStatus === "delivered" ? tracking : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                tracking_number: newStatus === "dispatched" || newStatus === "delivered" ? tracking : o.tracking_number,
              }
            : o
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                tracking_number: newStatus === "dispatched" || newStatus === "delivered" ? tracking : prev.tracking_number,
              }
            : null
        );
      }

      showNotice(`Order ${orderId} transitioned to ${newStatus.toUpperCase()}`);
    } catch (e: any) {
      showNotice(`Failed to update status: ${e.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Generate dynamic test order for demonstration
  const handleCreateDynamicTestOrder = async () => {
    const clients = [
      { name: "Sanjana Rao", email: "sanjana.rao@hyderabadarts.in", phone: "+91 98490 12890", city: "Hyderabad, Telangana 500034" },
      { name: "Alisha Sen", email: "alisha.sen@delhifashion.com", phone: "+91 98102 77102", city: "New Delhi, Delhi 110024" },
      { name: "Meera Nambiar", email: "meera.nambiar@kochi.co.in", phone: "+91 94470 33819", city: "Kochi, Kerala 682016" },
      { name: "Kavya Deshmukh", email: "kavya.deshmukh@pune.org", phone: "+91 98220 55192", city: "Pune, Maharashtra 411004" },
    ];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const chosenProduct = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(1 + Math.random() * 2);
    const itemTotal = chosenProduct.price * qty;
    const shipping = itemTotal >= 1499 ? 0 : 150;
    const tax = Math.round((itemTotal * 18) / 118);
    const grandTotal = itemTotal + shipping;
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrderPayload: AdminOrder = {
      id: orderId,
      client_name: client.name,
      customer_name: client.name,
      client_email: client.email,
      customer_email: client.email,
      client_phone: client.phone,
      customer_phone: client.phone,
      shipping_address: `Boutique Residence, ${client.city}`,
      items: [
        {
          productId: chosenProduct.slug,
          name: chosenProduct.name,
          shade: chosenProduct.category,
          quantity: qty,
          unitPrice: chosenProduct.price,
          itemTotal,
          image: chosenProduct.image,
        },
      ],
      items_count: qty,
      total_amount: `₹${grandTotal.toLocaleString("en-IN")}`,
      subtotal: itemTotal,
      discount: 0,
      shipping_fee: shipping,
      tax_amount: tax,
      total_price: grandTotal,
      currency: "INR",
      payment_method: "upi",
      payment_status: "paid",
      status: "processing",
      tracking_number: null,
      eta: "Arriving in 2-3 Business Days",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from("orders").insert([newOrderPayload]);
    }

    setOrders((prev) => [newOrderPayload, ...prev]);
    showNotice(`Dynamic order placed for ${client.name} (${orderId})`);
  };

  // Stock Adjustment
  const handleAdjustStock = (slug: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, stock_quantity: Math.max(0, (p.stock_quantity || 0) + delta) } : p
      )
    );
    showNotice(`Stock updated for ${slug}`);
  };

  // Parse items safely
  const parseItems = (raw: any): AdminOrderItem[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "awaiting"
          ? o.payment_status === "pending" || o.payment_method === "cod"
          : o.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.client_name || o.customer_name || "").toLowerCase().includes(q) ||
        (o.client_email || o.customer_email || "").toLowerCase().includes(q) ||
        (o.client_phone || o.customer_phone || "").toLowerCase().includes(q) ||
        (o.shipping_address || "").toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Aggregated Multi-Customers
  const customersList: CustomerSummary[] = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    orders.forEach((o) => {
      const email = (o.client_email || o.customer_email || "guest@sheaura.com").toLowerCase().trim();
      const name = o.client_name || o.customer_name || "Valued Client";
      const phone = o.client_phone || o.customer_phone || "—";
      const addressParts = (o.shipping_address || "").split(",");
      const city = addressParts[addressParts.length - 2]?.trim() || addressParts[addressParts.length - 1]?.trim() || "India";
      const spend = Number(o.total_price) || 0;

      if (!map.has(email)) {
        map.set(email, {
          name,
          email,
          phone,
          city,
          orderCount: 1,
          totalSpent: spend,
          lastOrderDate: o.created_at,
        });
      } else {
        const existing = map.get(email)!;
        existing.orderCount += 1;
        existing.totalSpent += spend;
        if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.created_at;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Financial KPIs
  const kpis = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    const count = orders.length;
    const aov = count > 0 ? Math.round(totalRev / count) : 0;
    const processing = orders.filter((o) => o.status === "processing").length;
    const dispatched = orders.filter((o) => o.status === "dispatched").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    return { totalRev, count, aov, processing, dispatched, delivered, customers: customersList.length };
  }, [orders, customersList]);

  return (
    <div className="admin-console-root" style={{ minHeight: "100vh", background: "#f8f0e5", color: "#21130f", fontFamily: "'Montserrat', sans-serif" }}>
      {/* Top Banner Notice */}
      {actionNotice && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 9999,
            background: "#191970",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(25,25,112,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            letterSpacing: "0.03em",
          }}
        >
          <CheckCircle2 size={16} /> {actionNotice}
        </div>
      )}

      {/* Header Bar */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(42, 26, 20, 0.12)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(42, 26, 20, 0.2)",
              borderRadius: "999px",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#21130f",
            }}
          >
            <ArrowLeft size={14} /> Storefront
          </button>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <SheAuraLogo height={24} fill="#191970" />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#765d50",
                fontWeight: 600,
              }}
            >
              Operations Studio
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#1e6b37",
              background: "rgba(30, 107, 55, 0.1)",
              padding: "5px 12px",
              borderRadius: "999px",
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={14} /> Live Supabase Connected
          </div>

          <button
            onClick={handleCreateDynamicTestOrder}
            style={{
              background: "#191970",
              color: "#ffffff",
              border: "0",
              borderRadius: "999px",
              padding: "8px 16px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <PlusCircle size={14} /> + New Test Customer Order
          </button>

          <button
            onClick={fetchOrders}
            disabled={loading}
            style={{
              background: "transparent",
              border: "1px solid rgba(42, 26, 20, 0.2)",
              borderRadius: "999px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              color: "#21130f",
            }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px" }}>
        {/* KPI Strip */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "11px", color: "#765d50", textTransform: "uppercase", letterSpacing: "0.08em" }}>Gross Revenue</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#191970", marginTop: "4px" }}>
              ₹{kpis.totalRev.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "10px", color: "#765d50", marginTop: "4px" }}>Across {kpis.count} total orders</div>
          </div>

          <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "11px", color: "#765d50", textTransform: "uppercase", letterSpacing: "0.08em" }}>Average Order Value</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#21130f", marginTop: "4px" }}>
              ₹{kpis.aov.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "10px", color: "#765d50", marginTop: "4px" }}>Premium Maison basket average</div>
          </div>

          <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "11px", color: "#765d50", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active Clients</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#21130f", marginTop: "4px" }}>
              {kpis.customers}
            </div>
            <div style={{ fontSize: "10px", color: "#765d50", marginTop: "4px" }}>Multi-city client base</div>
          </div>

          <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "11px", color: "#765d50", textTransform: "uppercase", letterSpacing: "0.08em" }}>Fulfillment Queue</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: kpis.processing > 0 ? "#b85d19" : "#1e6b37", marginTop: "4px" }}>
              {kpis.processing} Pending
            </div>
            <div style={{ fontSize: "10px", color: "#765d50", marginTop: "4px" }}>{kpis.dispatched} dispatched, {kpis.delivered} delivered</div>
          </div>
        </section>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(42, 26, 20, 0.12)", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "10px 20px",
              border: "0",
              borderBottom: activeTab === "orders" ? "2px solid #191970" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "orders" ? "#191970" : "#765d50",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "0.05em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Package size={15} /> Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            style={{
              padding: "10px 20px",
              border: "0",
              borderBottom: activeTab === "customers" ? "2px solid #191970" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "customers" ? "#191970" : "#765d50",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "0.05em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <User size={15} /> Clients Directory ({customersList.length})
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            style={{
              padding: "10px 20px",
              border: "0",
              borderBottom: activeTab === "inventory" ? "2px solid #191970" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "inventory" ? "#191970" : "#765d50",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "0.05em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Layers size={15} /> 12 Pieces Inventory
          </button>
        </div>

        {/* ================= TAB 1: LIVE ORDERS ================= */}
        {activeTab === "orders" && (
          <div>
            {/* Filter & Search Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { key: "all", label: "All" },
                  { key: "processing", label: "Processing" },
                  { key: "dispatched", label: "Dispatched" },
                  { key: "delivered", label: "Delivered" },
                  { key: "awaiting", label: "COD / Awaiting" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    style={{
                      border: "1px solid rgba(42, 26, 20, 0.15)",
                      borderRadius: "999px",
                      padding: "6px 14px",
                      fontSize: "11px",
                      cursor: "pointer",
                      background: statusFilter === f.key ? "#191970" : "#ffffff",
                      color: statusFilter === f.key ? "#ffffff" : "#21130f",
                      fontWeight: statusFilter === f.key ? 600 : 400,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", minWidth: "280px" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: 11, color: "#765d50" }} />
                <input
                  type="text"
                  placeholder="Search order ID, client, email, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 34px",
                    borderRadius: "999px",
                    border: "1px solid rgba(42, 26, 20, 0.15)",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#ffffff",
                  }}
                />
              </div>
            </div>

            {/* Orders Table */}
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
              {filteredOrders.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "#765d50" }}>
                  <Package size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>No orders match this filter</div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>Generate a test order or adjust your search filter above.</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "#fcf8f2", borderBottom: "1px solid rgba(42, 26, 20, 0.08)", color: "#765d50", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <th style={{ padding: "14px 18px" }}>Order Ref</th>
                        <th style={{ padding: "14px 18px" }}>Client</th>
                        <th style={{ padding: "14px 18px" }}>Items</th>
                        <th style={{ padding: "14px 18px" }}>Total</th>
                        <th style={{ padding: "14px 18px" }}>Payment</th>
                        <th style={{ padding: "14px 18px" }}>Status</th>
                        <th style={{ padding: "14px 18px" }}>Tracking</th>
                        <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const items = parseItems(o.items);
                        const isPaid = o.payment_status === "paid";
                        return (
                          <tr
                            key={o.id}
                            style={{
                              borderBottom: "1px solid rgba(42, 26, 20, 0.06)",
                              transition: "background 0.15s ease",
                            }}
                          >
                            <td style={{ padding: "16px 18px", fontWeight: 600, color: "#191970" }}>
                              <div>{o.id}</div>
                              <div style={{ fontSize: "10px", color: "#765d50", fontWeight: 400, marginTop: "2px" }}>
                                {new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>

                            <td style={{ padding: "16px 18px" }}>
                              <div style={{ fontWeight: 600 }}>{o.client_name || o.customer_name}</div>
                              <div style={{ fontSize: "11px", color: "#765d50" }}>{o.client_email || o.customer_email}</div>
                              <div style={{ fontSize: "10px", color: "#9c8172" }}>{o.client_phone || o.customer_phone}</div>
                            </td>

                            <td style={{ padding: "16px 18px" }}>
                              <div style={{ fontWeight: 500 }}>
                                {items.length > 0 ? items[0].name : `${o.items_count} pieces`}
                              </div>
                              {items.length > 1 && (
                                <div style={{ fontSize: "10.5px", color: "#765d50" }}>+{items.length - 1} more items</div>
                              )}
                            </td>

                            <td style={{ padding: "16px 18px", fontWeight: 700 }}>
                              {o.total_amount || `₹${Number(o.total_price || 0).toLocaleString("en-IN")}`}
                            </td>

                            <td style={{ padding: "16px 18px" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                  background: isPaid ? "rgba(30, 107, 55, 0.1)" : "rgba(184, 93, 25, 0.12)",
                                  color: isPaid ? "#1e6b37" : "#b85d19",
                                }}
                              >
                                {o.payment_method?.toUpperCase() || "UPI"} · {isPaid ? "Paid" : "Pending"}
                              </span>
                            </td>

                            <td style={{ padding: "16px 18px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  background:
                                    o.status === "delivered"
                                      ? "rgba(30, 107, 55, 0.12)"
                                      : o.status === "dispatched"
                                      ? "rgba(102, 51, 153, 0.12)"
                                      : o.status === "cancelled"
                                      ? "rgba(163, 77, 69, 0.15)"
                                      : "rgba(25, 25, 112, 0.1)",
                                  color:
                                    o.status === "delivered"
                                      ? "#1e6b37"
                                      : o.status === "dispatched"
                                      ? "#582a85"
                                      : o.status === "cancelled"
                                      ? "#a34d45"
                                      : "#191970",
                                }}
                              >
                                {o.status}
                              </span>
                            </td>

                            <td style={{ padding: "16px 18px" }}>
                              {o.tracking_number ? (
                                <span style={{ fontFamily: "monospace", fontSize: "10.5px", color: "#582a85", background: "rgba(88, 42, 133, 0.08)", padding: "3px 6px", borderRadius: "4px" }}>
                                  {o.tracking_number}
                                </span>
                              ) : (
                                <span style={{ color: "#a89487", fontSize: "11px" }}>Awaiting Dispatch</span>
                              )}
                            </td>

                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  style={{
                                    border: "1px solid rgba(42, 26, 20, 0.15)",
                                    background: "#ffffff",
                                    padding: "5px 10px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Details
                                </button>

                                {o.status === "processing" && (
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, "dispatched")}
                                    disabled={isUpdatingStatus}
                                    style={{
                                      border: "0",
                                      background: "#582a85",
                                      color: "#ffffff",
                                      padding: "5px 10px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Dispatch
                                  </button>
                                )}

                                {o.status === "dispatched" && (
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, "delivered")}
                                    disabled={isUpdatingStatus}
                                    style={{
                                      border: "0",
                                      background: "#1e6b37",
                                      color: "#ffffff",
                                      padding: "5px 10px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Deliver
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: CLIENTS DIRECTORY ================= */}
        {activeTab === "customers" && (
          <div>
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(42, 26, 20, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#191970", fontWeight: 700 }}>Maison Clientele Directory</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#765d50" }}>Dynamically aggregated from real-time authenticated order histories</p>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#191970" }}>{customersList.length} Registered Patrons</div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#fcf8f2", borderBottom: "1px solid rgba(42, 26, 20, 0.08)", color: "#765d50", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 18px" }}>Client</th>
                      <th style={{ padding: "14px 18px" }}>Contact</th>
                      <th style={{ padding: "14px 18px" }}>Primary Hub</th>
                      <th style={{ padding: "14px 18px" }}>Orders Placed</th>
                      <th style={{ padding: "14px 18px" }}>Lifetime Value (LTV)</th>
                      <th style={{ padding: "14px 18px" }}>Last Order</th>
                      <th style={{ padding: "14px 18px", textAlign: "right" }}>Filter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList.map((c) => (
                      <tr key={c.email} style={{ borderBottom: "1px solid rgba(42, 26, 20, 0.06)" }}>
                        <td style={{ padding: "16px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #191970, #2b0a05)", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "12px" }}>
                              {c.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          <div>{c.email}</div>
                          <div style={{ fontSize: "11px", color: "#765d50" }}>{c.phone}</div>
                        </td>
                        <td style={{ padding: "16px 18px", color: "#582a85", fontWeight: 500 }}>
                          <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
                          {c.city}
                        </td>
                        <td style={{ padding: "16px 18px", fontWeight: 600 }}>
                          {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                        </td>
                        <td style={{ padding: "16px 18px", fontWeight: 700, color: "#191970" }}>
                          ₹{c.totalSpent.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "16px 18px", color: "#765d50", fontSize: "11px" }}>
                          {new Date(c.lastOrderDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "16px 18px", textAlign: "right" }}>
                          <button
                            onClick={() => {
                              setSearchQuery(c.name);
                              setActiveTab("orders");
                            }}
                            style={{
                              border: "1px solid rgba(42, 26, 20, 0.15)",
                              background: "transparent",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              cursor: "pointer",
                              color: "#191970",
                              fontWeight: 600,
                            }}
                          >
                            View Orders
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 12 PIECES INVENTORY ================= */}
        {activeTab === "inventory" && (
          <div>
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid rgba(42, 26, 20, 0.08)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(42, 26, 20, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#191970", fontWeight: 700 }}>Signature 12-Piece Collection</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#765d50" }}>Official master inventory and authentic price registry</p>
                </div>
                <div style={{ fontSize: "11px", color: "#1e6b37", fontWeight: 600 }}>All 12 Active In Storefront</div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#fcf8f2", borderBottom: "1px solid rgba(42, 26, 20, 0.08)", color: "#765d50", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 18px" }}>Piece</th>
                      <th style={{ padding: "14px 18px" }}>Category</th>
                      <th style={{ padding: "14px 18px" }}>Official Price</th>
                      <th style={{ padding: "14px 18px" }}>Stock Level</th>
                      <th style={{ padding: "14px 18px", textAlign: "right" }}>Stock Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const stock = p.stock_quantity || 0;
                      const isLow = stock < 15;
                      return (
                        <tr key={p.slug} style={{ borderBottom: "1px solid rgba(42, 26, 20, 0.06)" }}>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(42,26,20,0.1)" }}
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: "10.5px", color: "#765d50" }}>{p.slug}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "14px 18px" }}>
                            <span style={{ background: "rgba(42, 26, 20, 0.06)", padding: "3px 8px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 500 }}>
                              {p.category}
                            </span>
                          </td>

                          <td style={{ padding: "14px 18px", fontWeight: 700, color: "#191970" }}>
                            ₹{p.price.toLocaleString("en-IN")}
                          </td>

                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: 600,
                                fontSize: "11px",
                                color: isLow ? "#b85d19" : "#1e6b37",
                              }}
                            >
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isLow ? "#b85d19" : "#1e6b37" }} />
                              {stock} units {isLow && "(Low Stock)"}
                            </span>
                          </td>

                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <button
                                onClick={() => handleAdjustStock(p.slug, -5)}
                                style={{
                                  border: "1px solid rgba(42, 26, 20, 0.15)",
                                  background: "#ffffff",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                }}
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p.slug, 5)}
                                style={{
                                  border: "1px solid rgba(42, 26, 20, 0.15)",
                                  background: "#ffffff",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                +5
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(42, 26, 20, 0.08)", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#765d50", textTransform: "uppercase" }}>Order Invoice & Fulfillment</span>
                <h2 style={{ margin: "4px 0 0", fontSize: "20px", color: "#191970", fontWeight: 700 }}>{selectedOrder.id}</h2>
                <div style={{ fontSize: "11px", color: "#765d50", marginTop: "2px" }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ border: "0", background: "transparent", cursor: "pointer", color: "#765d50" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Client & Shipping */}
            <div style={{ margin: "20px 0", background: "#fcf8f2", padding: "16px", borderRadius: "8px", border: "1px solid rgba(42, 26, 20, 0.08)" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#765d50", fontWeight: 600 }}>Delivery Details</div>
              <div style={{ fontWeight: 600, fontSize: "14px", marginTop: "4px" }}>{selectedOrder.client_name || selectedOrder.customer_name}</div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{selectedOrder.shipping_address}</div>
              <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "11px", color: "#765d50" }}>
                <span><Mail size={12} style={{ display: "inline", marginRight: "4px" }} />{selectedOrder.client_email || selectedOrder.customer_email}</span>
                <span><Phone size={12} style={{ display: "inline", marginRight: "4px" }} />{selectedOrder.client_phone || selectedOrder.customer_phone}</span>
              </div>
            </div>

            {/* Items */}
            <div style={{ margin: "20px 0" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#765d50", fontWeight: 600, marginBottom: "10px" }}>Ordered Pieces</div>
              {parseItems(selectedOrder.items).map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(42, 26, 20, 0.06)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "12px" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "#765d50" }}>Shade: {item.shade || "Standard"} · Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>
                    ₹{(item.itemTotal || item.unitPrice * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div style={{ background: "#f8f0e5", padding: "16px", borderRadius: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Subtotal</span>
                <span>₹{(selectedOrder.subtotal || selectedOrder.total_price || 0).toLocaleString("en-IN")}</span>
              </div>
              {selectedOrder.discount && selectedOrder.discount > 0 ? (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#1e6b37" }}>
                  <span>Aura Privilege Discount</span>
                  <span>-₹{selectedOrder.discount.toLocaleString("en-IN")}</span>
                </div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Shipping Fee</span>
                <span>{selectedOrder.shipping_fee === 0 ? "Complimentary" : `₹${selectedOrder.shipping_fee || 150}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#765d50" }}>
                <span>GST (18% inclusive)</span>
                <span>₹{(selectedOrder.tax_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "15px", color: "#191970", borderTop: "1px solid rgba(42, 26, 20, 0.15)", paddingTop: "8px", marginTop: "8px" }}>
                <span>Total Amount</span>
                <span>{selectedOrder.total_amount || `₹${Number(selectedOrder.total_price || 0).toLocaleString("en-IN")}`}</span>
              </div>
            </div>

            {/* Status & Fulfillment Actions */}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#765d50" }}>Current Status: </span>
                <span style={{ fontWeight: 700, textTransform: "capitalize", color: "#191970" }}>{selectedOrder.status}</span>
                {selectedOrder.tracking_number && (
                  <div style={{ fontSize: "11px", color: "#582a85", fontFamily: "monospace", marginTop: "2px" }}>
                    Track: {selectedOrder.tracking_number}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {selectedOrder.status === "processing" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "dispatched")}
                    style={{
                      background: "#582a85",
                      color: "#ffffff",
                      border: "0",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Dispatch via BlueDart
                  </button>
                )}
                {selectedOrder.status === "dispatched" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                    style={{
                      background: "#1e6b37",
                      color: "#ffffff",
                      border: "0",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
