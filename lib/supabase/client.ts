import { getEnvironmentVariable } from "@/utils";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function createClient() {
  const { supabaseUrl, supabaseKey } = getEnvironmentVariable();
  if (!supabase) {
    supabase = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}
