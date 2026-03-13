import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  orgName: z.string().min(1, "El nombre es obligatorio"),
  entityType: z.string().min(1, "Selecciona un tipo de entidad"),
  newsletter: z.boolean(),
  sroiInfo: z.boolean(),
  downloadOnly: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
