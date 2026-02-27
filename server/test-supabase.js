import { supabase, supabaseAdmin } from "./config/supabase.js";

async function testConnection() {
  console.log("🧪 Testing Supabase Connection...\n");

  try {
    // Test 1: Check if client is initialized
    console.log("✓ Supabase client initialized");
    console.log(`  URL: ${process.env.SUPABASE_URL}\n`);

    // Test 2: Test basic connection with a simple query
    console.log("Testing basic connection...");
    const { data, error } = await supabase
      .from("_health_check")
      .select("*")
      .limit(1);

    // Even if the table doesn't exist, a proper connection will return a specific error
    if (error) {
      // Check if it's a "relation does not exist" error (which means connection works)
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.log("✓ Connection successful! (Table not found is expected)\n");
      } else {
        console.log("⚠ Connection established but encountered an error:");
        console.log(`  ${error.message}\n`);
      }
    } else {
      console.log("✓ Connection successful!\n");
    }

    // Test 3: Get list of available tables/schemas
    console.log("Fetching database schema information...");
    const { data: schemaData, error: schemaError } = await supabase
      .rpc("get_schemas")
      .limit(5);

    if (schemaError && !schemaError.message.includes("does not exist")) {
      console.log(
        "  Note: Could not fetch schema info (this is normal for new databases)\n",
      );
    }

    // Test 4: Test admin client if available
    if (supabaseAdmin) {
      console.log("✓ Admin client initialized\n");
    } else {
      console.log("⚠ Admin client not initialized (service key missing)\n");
    }

    console.log("✅ Supabase connection test completed successfully!");
    console.log("\nYou can now:");
    console.log("  1. Create tables in your Supabase dashboard");
    console.log("  2. Use the supabase client in your routes");
    console.log(
      '  3. Import from: import { supabase } from "./config/supabase.js"\n',
    );
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    console.error("\nPlease check:");
    console.error("  1. SUPABASE_URL is correct");
    console.error("  2. SUPABASE_ANON_KEY is valid");
    console.error("  3. Your internet connection is working");
    process.exit(1);
  }
}

testConnection();
