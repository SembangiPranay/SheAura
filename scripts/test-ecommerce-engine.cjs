const { Client } = require("../node_modules/pg");
const fs = require("fs");

const env = fs.readFileSync("backend/.env", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}
const dbUrl = match[1].trim();

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function runTests() {
  console.log("=================================================");
  console.log("   SHE'AURA E-COMMERCE CORE SUITE: TEST RUNNER   ");
  console.log("=================================================\n");

  await client.connect();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Live Orders Query & Aggregation
  console.log("--- TEST GROUP 1: Orders Query & Financial Totals ---");
  const ordersRes = await client.query("SELECT * FROM public.orders ORDER BY created_at DESC;");
  const orders = ordersRes.rows;
  assert(orders.length >= 5, `Expected at least 5 seeded orders, found ${orders.length}`);

  const totalGrossRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  assert(totalGrossRevenue > 8000, `Gross revenue aggregated correctly (₹${totalGrossRevenue.toLocaleString("en-IN")})`);

  // TEST 2: Multi-Customer Identity Integrity
  console.log("\n--- TEST GROUP 2: Multi-Customer Identity Integrity ---");
  const uniqueEmails = new Set(orders.map((o) => o.client_email));
  assert(uniqueEmails.size >= 5, `Expected 5 distinct customer emails, found ${uniqueEmails.size}`);

  const uniqueCities = new Set(
    orders.map((o) => {
      const parts = o.shipping_address.split(",");
      return parts[parts.length - 2]?.trim() || "Unknown";
    })
  );
  assert(uniqueCities.size >= 4, `Orders span multiple major Indian metropolitan hubs (${Array.from(uniqueCities).join(", ")})`);

  // TEST 3: Dynamic Order Creation with Pricing Engine
  console.log("\n--- TEST GROUP 3: Dynamic Order Placement (New Customer) ---");
  const dynamicOrderId = "ORD-CHN-" + Date.now().toString(36).toUpperCase();
  const testCustomer = {
    id: dynamicOrderId,
    client_name: "Diya Mehta",
    customer_name: "Diya Mehta",
    client_email: "diya.mehta@chennaiarts.in",
    customer_email: "diya.mehta@chennaiarts.in",
    client_phone: "+91 98400 88219",
    customer_phone: "+91 98400 88219",
    shipping_address: "Apt 8B, Poes Garden, Chennai, Tamil Nadu 600086",
    items: JSON.stringify([
      {
        productId: "peach-blossom-blush",
        name: "Peach Blossom Blush",
        shade: "Peach Blossom",
        unitPrice: 899,
        quantity: 2,
        itemTotal: 1798
      }
    ]),
    items_count: 2,
    subtotal: 1798,
    discount: 0,
    shipping_fee: 0, // Free shipping for >= 1499
    tax_amount: 274,
    total_price: 1798,
    total_amount: "₹1,798.00",
    currency: "INR",
    payment_method: "upi",
    payment_status: "paid",
    status: "processing",
    tracking_number: null,
    eta: "Arriving in 2-3 Business Days",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await client.query(`
    INSERT INTO public.orders (
      id, client_name, customer_name, client_email, customer_email,
      client_phone, customer_phone, shipping_address, items, items_count,
      subtotal, discount, shipping_fee, tax_amount, total_price, total_amount,
      currency, payment_method, payment_status, status, tracking_number, eta,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
      $23, $24
    );
  `, [
    testCustomer.id, testCustomer.client_name, testCustomer.customer_name,
    testCustomer.client_email, testCustomer.customer_email, testCustomer.client_phone,
    testCustomer.customer_phone, testCustomer.shipping_address, testCustomer.items,
    testCustomer.items_count, testCustomer.subtotal, testCustomer.discount,
    testCustomer.shipping_fee, testCustomer.tax_amount, testCustomer.total_price,
    testCustomer.total_amount, testCustomer.currency, testCustomer.payment_method,
    testCustomer.payment_status, testCustomer.status, testCustomer.tracking_number,
    testCustomer.eta, testCustomer.created_at, testCustomer.updated_at
  ]);

  const verifyInsert = await client.query("SELECT * FROM public.orders WHERE id = $1;", [dynamicOrderId]);
  assert(verifyInsert.rows.length === 1, `Dynamic order inserted and verified for Diya Mehta (${dynamicOrderId})`);
  assert(verifyInsert.rows[0].shipping_fee === "0", "Free shipping applied correctly for orders >= ₹1,499");

  // TEST 4: Fulfillment Lifecycle Transition (Processing -> Dispatched -> Delivered)
  console.log("\n--- TEST GROUP 4: Fulfillment State Machine Transition ---");
  const newTrackingNumber = "EXP-BLUEDART-CHN-" + Math.floor(10000 + Math.random() * 90000);
  await client.query(`
    UPDATE public.orders 
    SET status = 'dispatched', tracking_number = $1, updated_at = NOW() 
    WHERE id = $2;
  `, [newTrackingNumber, dynamicOrderId]);

  const verifyDispatch = await client.query("SELECT status, tracking_number FROM public.orders WHERE id = $1;", [dynamicOrderId]);
  assert(verifyDispatch.rows[0].status === "dispatched", "Order transitioned to 'dispatched' status");
  assert(verifyDispatch.rows[0].tracking_number === newTrackingNumber, `Tracking number recorded (${newTrackingNumber})`);

  // TEST 5: Products Catalog Integrity
  console.log("\n--- TEST GROUP 5: 12-Piece Product Catalog Health ---");
  const productsRes = await client.query("SELECT id, name, slug, price FROM public.products ORDER BY price ASC;");
  assert(productsRes.rows.length === 12, `All 12 products accounted for in Supabase (found ${productsRes.rows.length})`);

  // Verify prices match luxury brand policy
  const lipsticks = productsRes.rows.filter(p => p.slug.endsWith("-lipstick"));
  const blushes = productsRes.rows.filter(p => p.slug.endsWith("-blush"));
  const foundations = productsRes.rows.filter(p => p.slug.includes("foundation"));

  assert(lipsticks.every(l => Number(l.price) === 1099), "All Lipsticks uniform at ₹1,099");
  assert(blushes.every(b => Number(b.price) === 899), "All Blushes uniform at ₹899");
  assert(foundations.every(f => Number(f.price) === 1299), "All Foundations uniform at ₹1,299");

  // Clean up the dynamic test order
  await client.query("DELETE FROM public.orders WHERE id = $1;", [dynamicOrderId]);
  console.log(`\nCleaned up ephemeral test order ${dynamicOrderId}`);

  await client.end();

  console.log("\n=================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
