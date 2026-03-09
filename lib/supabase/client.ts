import { getEnvironmentVariable } from "@/utils";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseSchema = Record<string, never>;

let supabase: SupabaseClient<SupabaseSchema> | null = null;

export function createClient() {
  const { supabaseUrl, supabaseKey } = getEnvironmentVariable();
  if (!supabase) {
    supabase = createBrowserClient<SupabaseSchema>(supabaseUrl, supabaseKey);
  }
  return supabase;
}
