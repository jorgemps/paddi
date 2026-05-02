import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type SupabaseAppData = {
  patients: any[];
  agenda: any[];
  guides: any[];
  professionals: any[];
  clinic: any | null;
  qa: any | null;
};

export async function loadSupabaseAppData(): Promise<SupabaseAppData | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const [
    clinicRes,
    patientsRes,
    agendaRes,
    guidesRes,
    professionalsRes,
    qaRes
  ] = await Promise.all([
    supabase.from("clinics").select("*").limit(1),
    supabase.from("patients").select("*").order("nome", { ascending: true }).limit(500),
    supabase.from("schedule_events").select("*").order("data", { ascending: false }).limit(800),
    supabase.from("insurance_guides").select("*").limit(500),
    supabase.from("professionals").select("*").order("nome", { ascending: true }).limit(100),
    supabase.from("qa_import_stats").select("*").order("created_at", { ascending: false }).limit(1)
  ]);

  const errors = [clinicRes, patientsRes, agendaRes, guidesRes, professionalsRes, qaRes]
    .map((r: any) => r.error?.message)
    .filter(Boolean);

  if (errors.length) {
    console.warn("Supabase load errors:", errors);
    return null;
  }

  return {
    clinic: clinicRes.data?.[0] || null,
    patients: patientsRes.data || [],
    agenda: agendaRes.data || [],
    guides: guidesRes.data || [],
    professionals: professionalsRes.data || [],
    qa: qaRes.data?.[0] || null
  };
}

export async function insertSupabasePatient(patient: any) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.from("patients").insert(patient).select("*").single();
  if (error) throw error;
  return data;
}

export async function insertSupabaseSchedule(event: any) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.from("schedule_events").insert(event).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateSupabaseSchedule(id: number | string, patch: any) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.from("schedule_events").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateSupabaseGuide(id: number | string, patch: any) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.from("insurance_guides").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}
