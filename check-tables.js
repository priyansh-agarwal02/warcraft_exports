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

async function listTables() {
  const { data, error } = await supabase.rpc("list_tables_cols");
  // Let's run a raw query if RPC doesn't exist
  if (error) {
    console.log("RPC list_tables_cols failed, querying directly...");
    // We can query using postgres query or by requesting a dummy row from possible tables
    const tables = ["profiles", "user_profiles", "content_blocks"];
    for (const t of tables) {
      const { data: row, error: tErr } = await supabase.from(t).select("*").limit(1);
      if (tErr) {
        console.log(`Table '${t}' does NOT exist or error:`, tErr.message);
      } else {
        console.log(`Table '${t}' EXISTS! Sample row:`, row);
      }
    }
  } else {
    console.log("Tables info:", data);
  }
}

listTables();
