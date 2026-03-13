"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

function mapSupabaseError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Email o contraseña incorrectos";
  }
  if (message.includes("Email not confirmed")) {
    return "Confirma tu email antes de iniciar sesión";
  }
  if (message.includes("Too many requests")) {
    return "Demasiados intentos. Espera unos minutos.";
  }
  return "Error al iniciar sesión. Inténtalo de nuevo.";
}

export async function loginUser(formData: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapSupabaseError(error.message) };
  }

  redirect("/reports");
}
