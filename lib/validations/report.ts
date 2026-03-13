import { z } from "zod";

// Enum values from Prisma schema
export const accreditationCategoryEnum = z.enum([
  "ACCREDITED",
  "NO_ACCREDITED",
]);

export const budgetRangeEnum = z.enum([
  "RANGE_0_50000",
  "RANGE_50001_100000",
  "RANGE_100001_250000",
  "RANGE_250001_500000",
  "RANGE_500001_1000000",
  "RANGE_1000001_PLUS",
]);

// Validar que el string sea uno de los valores del enum
const validAccreditationValues = accreditationCategoryEnum.options;
const validBudgetRangeValues = budgetRangeEnum.options;

// Schema para crear un nuevo reporte
export const createReportSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(500, "El título no puede exceder 500 caracteres"),
  abstract: z
    .string()
    .min(1, "El resumen es obligatorio")
    .max(2000, "El resumen no puede exceder 2000 caracteres"),
  summary: z
    .string()
    .min(1, "El detalle es obligatorio")
    .max(10000, "El detalle no puede exceder 10000 caracteres"),
  area: z.string().min(1, "El área es obligatoria"),
  country: z.string().min(1, "El país es obligatorio"),
  publish_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  // Campo accreditation: ahora es enum (acepta valores del enum o string vacío)
  accreditation: z
    .string()
    .refine(
      (val) => val === "" || validAccreditationValues.includes(val as any),
      {
        message:
          "La acreditación debe ser ACCREDITED, NO_ACCREDITED o vacío",
      }
    )
    .optional()
    .nullable(),
  // Nuevos campos
  editors: z
    .string()
    .max(500, "Los editores no pueden exceder 500 caracteres")
    .optional()
    .nullable(),
  organization: z
    .string()
    .max(255, "La organización no puede exceder 255 caracteres")
    .optional()
    .nullable(),
  // Campo budget_range: ahora es enum
  budget_range: z
    .string()
    .refine(
      (val) => val === "" || validBudgetRangeValues.includes(val as any),
      {
        message:
          "El rango de presupuesto debe ser uno de los valores válidos o vacío",
      }
    )
    .optional()
    .nullable(),
  // Tags es un array de strings
  tags: z.array(z.string()).default([]),
});

// Schema para actualizar un reporte (todos los campos opcionales)
export const updateReportSchema = createReportSchema.partial();

// Schema para filtros de búsqueda en GET
export const reportFiltersSchema = z.object({
  search: z.string().optional(),
  accreditation: z
    .string()
    .refine(
      (val) => val === undefined || validAccreditationValues.includes(val as any),
      {
        message: "Filtro de acreditación inválido",
      }
    )
    .optional(),
  editors: z.string().optional(),
  organization: z.string().optional(),
  budget_range: z
    .string()
    .refine(
      (val) => val === undefined || validBudgetRangeValues.includes(val as any),
      {
        message: "Filtro de presupuesto inválido",
      }
    )
    .optional(),
  area: z.string().optional(),
  country: z.string().optional(),
  cursor: z.string().optional(),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional(),
});

// Tipos inferidos
export type CreateReportFormData = z.infer<typeof createReportSchema>;
export type UpdateReportFormData = z.infer<typeof updateReportSchema>;
export type ReportFilters = z.infer<typeof reportFiltersSchema>;

// Helper para convertir string a enum de Prisma
export function parseAccreditation(
  value: string | null | undefined
): "ACCREDITED" | "NO_ACCREDITED" | null {
  if (!value || value === "") return null;
  if (value === "ACCREDITED") return "ACCREDITED";
  if (value === "NO_ACCREDITED") return "NO_ACCREDITED";
  return null;
}

export function parseBudgetRange(
  value: string | null | undefined
):
  | "RANGE_0_50000"
  | "RANGE_50001_100000"
  | "RANGE_100001_250000"
  | "RANGE_250001_500000"
  | "RANGE_500001_1000000"
  | "RANGE_1000001_PLUS"
  | null {
  if (!value || value === "") return null;
  const validValues = [
    "RANGE_0_50000",
    "RANGE_50001_100000",
    "RANGE_100001_250000",
    "RANGE_250001_500000",
    "RANGE_500001_1000000",
    "RANGE_1000001_PLUS",
  ];
  return validValues.includes(value) ? (value as any) : null;
}
