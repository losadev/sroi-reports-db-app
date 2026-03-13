export function getEnvironmentVariable() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if(!supabaseUrl || !supabaseKey) {
        throw new Error("Missing environment variables for Supabase");
    }
    return { supabaseUrl, supabaseKey };
}