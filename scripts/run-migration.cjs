const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read DATABASE_URL from .env
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);

if (!match) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

const connectionString = match[1].trim();
console.log("Connecting to Supabase PostgreSQL database...");

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log("SUCCESS: Connected to Supabase PostgreSQL database!");

    const migrationFile = path.resolve(__dirname, '..', 'supabase', 'migrations', '008_sync_12_products_and_orders.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log("Running migration 008...");
    await client.query(sql);
    console.log("SUCCESS: Migration 008 executed successfully!");

    const res = await client.query("SELECT COUNT(*) FROM products;");
    console.log(`Verified total products in database: ${res.rows[0].count}`);

    await client.end();
  } catch (err) {
    console.error("Migration error:", err.message);
    if (client) {
      try { await client.end(); } catch {}
    }
    process.exit(1);
  }
}

main();
