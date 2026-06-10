const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatch() {
  const testBody = {
    enabled: true,
    title: "CHRISTMAS SALE 2026",
    subtitle: "New discounts added!",
    countdownTo: new Date(Date.now() + 86400000).toISOString(),
    bgColor: "#ff0000",
    textColor: "#ffffff",
    accentColor: "#ffff00"
  };

  const { data, error } = await supabase
    .from("content_blocks")
    .upsert(
      { key: "sale_banner", type: "json", value: JSON.stringify(testBody) },
      { onConflict: "key" }
    )
    .select();

  if (error) {
    console.error("Error patching/upserting:", error);
  } else {
    console.log("Upsert succeeded. Result:", JSON.stringify(data, null, 2));
  }
}

testPatch();
