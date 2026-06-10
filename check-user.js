const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  console.log("Fetching profiles via service role...");
  const { data: profiles, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Error fetching profiles:", error.message);
    return;
  }
  console.log("Profiles list in DB:");
  profiles.forEach(p => {
    console.log(`- User: id=${p.id}, email=${p.email}, full_name=${p.full_name}, role=${p.role}`);
  });
}

checkUsers();
