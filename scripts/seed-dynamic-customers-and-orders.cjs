const { Client } = require("../node_modules/pg");
const fs = require("fs");

const env = fs.readFileSync("backend/.env", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("No DATABASE_URL found in backend/.env");
  process.exit(1);
}
const dbUrl = match[1].trim();

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

const sampleOrders = [
  {
    id: "ORD-MUM-89102",
    client_name: "Ananya Sharma",
    customer_name: "Ananya Sharma",
    client_email: "ananya.sharma@gmail.com",
    customer_email: "ananya.sharma@gmail.com",
    client_phone: "+91 98201 44521",
    customer_phone: "+91 98201 44521",
    shipping_address: "Flat 14B, Sea Face Towers, Worli, Mumbai, Maharashtra 400018",
    items: JSON.stringify([
      {
        productId: "peach-blossom-blush",
        name: "Peach Blossom Blush",
        shade: "Peach Blossom",
        unitPrice: 899,
        quantity: 1,
        itemTotal: 899,
        image: "/products/Peach Blossom Blush.webp"
      },
      {
        productId: "scarlet-rose-lipstick",
        name: "Scarlet Rose Lipstick",
        shade: "Scarlet Rose",
        unitPrice: 1099,
        quantity: 1,
        itemTotal: 1099,
        image: "/products/Minimal_design/Scarlet Rose Lipstick_still.png"
      }
    ]),
    items_count: 2,
    total_amount: "₹1,998.00",
    subtotal: 1998,
    discount: 0,
    shipping_fee: 0,
    tax_amount: 305,
    total_price: 1998,
    currency: "INR",
    payment_method: "upi",
    payment_status: "paid",
    gateway_order_id: "order_rzp_live_89102",
    gateway_payment_id: "pay_upi_99218a",
    status: "processing",
    tracking_number: "EXP-BLUEDART-77218",
    eta: "Arriving tomorrow by 2:00 PM",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "ORD-DEL-44192",
    client_name: "Vikram Singhania",
    customer_name: "Vikram Singhania",
    client_email: "vikram.singhania@heritagegroup.in",
    customer_email: "vikram.singhania@heritagegroup.in",
    client_phone: "+91 98110 99201",
    customer_phone: "+91 98110 99201",
    shipping_address: "Bungalow 7, Amrita Shergill Marg, New Delhi, Delhi 110003",
    items: JSON.stringify([
      {
        productId: "sheaura-discovery-wardrobe",
        name: "She'Aura Discovery Wardrobe",
        shade: "Limited Vault Edition",
        unitPrice: 3299,
        quantity: 1,
        itemTotal: 3299,
        image: "/products/discovery-wardrobe-still.png"
      }
    ]),
    items_count: 1,
    total_amount: "₹3,299.00",
    subtotal: 3299,
    discount: 0,
    shipping_fee: 0,
    tax_amount: 503,
    total_price: 3299,
    currency: "INR",
    payment_method: "netbanking",
    payment_status: "paid",
    gateway_order_id: "order_rzp_live_44192",
    gateway_payment_id: "pay_hdfc_88192a",
    status: "delivered",
    tracking_number: "EXP-BLUEDART-44192",
    eta: "Delivered on October 22",
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "ORD-BLR-31908",
    client_name: "Rhea Kapoor",
    customer_name: "Rhea Kapoor",
    client_email: "rhea.kapoor@atelier.design",
    customer_email: "rhea.kapoor@atelier.design",
    client_phone: "+91 99001 22819",
    customer_phone: "+91 99001 22819",
    shipping_address: "Penthouse 4, Lavelle Road, Shanthala Nagar, Bengaluru, Karnataka 560001",
    items: JSON.stringify([
      {
        productId: "orchid-lipstick",
        name: "Orchid Lipstick",
        shade: "Cool Mauve Orchid",
        unitPrice: 1099,
        quantity: 1,
        itemTotal: 1099,
        image: "/products/Orchid Lipstick.webp"
      },
      {
        productId: "pink-blossom-blush",
        name: "Pink Blossom Blush",
        shade: "Romantic Pink Flush",
        unitPrice: 899,
        quantity: 1,
        itemTotal: 899,
        image: "/products/Pink Blossom Blush.webp"
      }
    ]),
    items_count: 2,
    total_amount: "₹1,798.00",
    subtotal: 1998,
    discount: 200,
    shipping_fee: 0,
    tax_amount: 274,
    total_price: 1798,
    currency: "INR",
    payment_method: "card",
    payment_status: "paid",
    gateway_order_id: "order_rzp_live_31908",
    gateway_payment_id: "pay_visa_99182b",
    status: "dispatched",
    tracking_number: "EXP-BLUEDART-31908",
    eta: "Arriving Friday, October 24",
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: "ORD-KOL-11920",
    client_name: "Natasha Roy",
    customer_name: "Natasha Roy",
    client_email: "natasha.roy@bengalart.org",
    customer_email: "natasha.roy@bengalart.org",
    client_phone: "+91 98300 77112",
    customer_phone: "+91 98300 77112",
    shipping_address: "Plot 42, Ballygunge Circular Road, Kolkata, West Bengal 700019",
    items: JSON.stringify([
      {
        productId: "molten-glow-highlighter",
        name: "Molten Glow Highlighter · Sunflower Gold",
        shade: "Sunflower Gold",
        unitPrice: 1199,
        quantity: 1,
        itemTotal: 1199,
        image: "/products/Minimal_design/Highlighter simple.png"
      }
    ]),
    items_count: 1,
    total_amount: "₹1,349.00",
    subtotal: 1199,
    discount: 0,
    shipping_fee: 150,
    tax_amount: 183,
    total_price: 1349,
    currency: "INR",
    payment_method: "cod",
    payment_status: "pending",
    gateway_order_id: null,
    gateway_payment_id: null,
    status: "processing",
    tracking_number: null,
    eta: "Arriving in 3-4 Business Days",
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: "ORD-AMD-55201",
    client_name: "Priya Patel",
    customer_name: "Priya Patel",
    client_email: "priya.patel@textiles.co.in",
    customer_email: "priya.patel@textiles.co.in",
    client_phone: "+91 98980 55123",
    customer_phone: "+91 98980 55123",
    shipping_address: "A-501, Bodakdev Enclave, SG Highway, Ahmedabad, Gujarat 380054",
    items: JSON.stringify([
      {
        productId: "hydrating-matte-foundation-daffodil",
        name: "Hydrating Matte Foundation · Daffodil",
        shade: "Daffodil (Warm Light)",
        unitPrice: 1299,
        quantity: 1,
        itemTotal: 1299,
        image: "/products/Daffodil.png"
      }
    ]),
    items_count: 1,
    total_amount: "₹1,449.00",
    subtotal: 1299,
    discount: 0,
    shipping_fee: 150,
    tax_amount: 198,
    total_price: 1449,
    currency: "INR",
    payment_method: "upi",
    payment_status: "paid",
    gateway_order_id: "order_rzp_live_55201",
    gateway_payment_id: "pay_upi_55201a",
    status: "dispatched",
    tracking_number: "EXP-BLUEDART-55201",
    eta: "Arriving October 24",
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

async function seed() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL!");

  // Clear existing orders to avoid duplicates
  await client.query("DELETE FROM public.orders WHERE id LIKE 'ORD-%';");

  for (const o of sampleOrders) {
    const q = `
      INSERT INTO public.orders (
        id, client_name, customer_name, client_email, customer_email,
        client_phone, customer_phone, shipping_address, items, items_count,
        total_amount, subtotal, discount, shipping_fee, tax_amount, total_price,
        currency, payment_method, payment_status, gateway_order_id, gateway_payment_id,
        status, tracking_number, eta, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26
      );
    `;
    const values = [
      o.id, o.client_name, o.customer_name, o.client_email, o.customer_email,
      o.client_phone, o.customer_phone, o.shipping_address, o.items, o.items_count,
      o.total_amount, o.subtotal, o.discount, o.shipping_fee, o.tax_amount, o.total_price,
      o.currency, o.payment_method, o.payment_status, o.gateway_order_id, o.gateway_payment_id,
      o.status, o.tracking_number, o.eta, o.created_at, o.updated_at
    ];
    await client.query(q, values);
    console.log(`Seeded order ${o.id} for ${o.client_name} (${o.total_amount}, ${o.status})`);
  }

  console.log("\nAll 5 dynamic multi-customer test orders seeded successfully!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
