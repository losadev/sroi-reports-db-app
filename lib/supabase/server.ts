import { getEnvironmentVariable } from "@/utils";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const { supabaseUrl, supabaseKey } = getEnvironmentVariable();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.log(
            "Warning: Attempted to set cookies from a Server Component. This is not supported and will not work. Please make sure to only call `setAll` from a Server Action or API Route.",
            error,
          );
        }
      },
    },
  });
}
