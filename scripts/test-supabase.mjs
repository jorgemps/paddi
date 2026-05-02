import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Variáveis ausentes: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key);

const checks = [
  ["clinics", "id"],
  ["patients", "id"],
  ["schedule_events", "id"],
  ["insurance_guides", "id"],
  ["professionals", "id"],
  ["qa_import_stats", "id"]
];

for (const [table, col] of checks) {
  const { count, error } = await supabase.from(table).select(col, { count: "exact", head: true });
  if (error) {
    console.error(`${table}: ERRO - ${error.message}`);
  } else {
    console.log(`${table}: OK - ${count} registros`);
  }
}
