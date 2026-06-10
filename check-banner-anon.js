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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBanner() {
  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("key", "sale_banner")
    .single();

  if (error) {
    console.error("Error fetching sale banner with ANON key:", error);
  } else {
    console.log("Sale Banner Row in DB with ANON key:", JSON.stringify(data, null, 2));
  }
}

checkBanner();
