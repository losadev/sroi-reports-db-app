"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

function mapSupabaseError(message: string): string {
  if (
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "Ya existe una cuenta con este email";
  }
  if (message.includes("weak_password") || message.includes("too short")) {
    return "La contraseña es demasiado débil";
  }
  if (message.includes("Too many requests")) {
    return "Demasiados intentos. Espera unos minutos.";
  }
  return "Error al crear la cuenta. Inténtalo de nuevo.";
}

export async function registerUser(formData: RegisterFormData) {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapSupabaseError(error.message) };
  }

  if (!data.user) {
    return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
  }

  try {
    await prisma.user.create({
      data: {
        auth_user: data.user.id,
        email: parsed.data.email,
        org_name: parsed.data.orgName,
        entity_type: parsed.data.entityType,
        newsletter: parsed.data.newsletter,
        sroi_info: parsed.data.sroiInfo,
        download_only: parsed.data.downloadOnly,
      },
    });
  } catch {
    return { error: "Error al guardar los datos de registro." };
  }

  return { success: true };
}
