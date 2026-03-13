"use client";

import { useState } from "react";
import {
  FileText,
  Image,
  Globe,
  Tag,
  Calendar,
  ChevronDown,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Building2,
  Users,
  DollarSign,
} from "lucide-react";

const AREAS = [
  "Educación",
  "Salud",
  "Medio ambiente",
  "Empleo",
  "Vivienda",
  "Cultura",
  "Deporte",
  "Inclusión social",
  "Cooperación internacional",
  "Otro",
];

// Opciones de acreditación
const ACCREDITATION_OPTIONS = [
  { value: "", label: "Sin acreditación" },
  { value: "ACCREDITED", label: "Acreditado" },
  { value: "NO_ACCREDITED", label: "No Acreditado" },
];

// Opciones de rango de presupuesto
const BUDGET_OPTIONS = [
  { value: "", label: "Seleccionar presupuesto" },
  { value: "RANGE_0_50000", label: "Hasta $50K" },
  { value: "RANGE_50001_100000", label: "$50K - $100K" },
  { value: "RANGE_100001_250000", label: "$100K - $250K" },
  { value: "RANGE_250001_500000", label: "$250K - $500K" },
  { value: "RANGE_500001_1000000", label: "$500K - $1M" },
  { value: "RANGE_1000001_PLUS", label: "Más de $1M" },
];

const CURRENT_YEAR = new Date().getFullYear().toString();

export default function AdminPage() {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    summary: "",
    area: "",
    country: "",
    publish_year: CURRENT_YEAR,
    accreditation: "",
    editors: "",
    organization: "",
    budget_range: "",
    tags: "",
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleExtract = async () => {
    if (!pdf) return;

    setExtracting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", pdf);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al extraer datos");
      }

      const extracted = await res.json();

      setForm({
        title: extracted.title || "",
        abstract: extracted.abstract || "",
        summary: extracted.summary || "",
        area: AREAS.includes(extracted.area) ? extracted.area : "",
        country: extracted.country || "",
        publish_year: extracted.publish_year
          ? String(extracted.publish_year)
          : CURRENT_YEAR,
        accreditation: extracted.accreditation || "",
        editors: extracted.editors || "",
        organization: extracted.organization || "",
        budget_range: extracted.budget_range || "",
        tags: Array.isArray(extracted.tags) ? extracted.tags.join(", ") : "",
      });

      setResult({ ok: true, message: "Datos extraidos del PDF con IA" });
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Error al extraer datos",
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called", { pdf: !!pdf, thumbnail: !!thumbnail, form });
    if (!pdf || !thumbnail) {
      setResult({ ok: false, message: "PDF y miniatura son obligatorios" });
      return;
    }

    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("abstract", form.abstract);
    formData.append("summary", form.summary);
    formData.append("area", form.area);
    formData.append("country", form.country);
    formData.append("publish_year", form.publish_year);
    formData.append("accreditation", form.accreditation);
    formData.append("editors", form.editors);
    formData.append("organization", form.organization);
    formData.append("budgetRange", form.budget_range);
    formData.append(
      "tags",
      JSON.stringify(
        form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    );
    formData.append("pdf", pdf);
    formData.append("thumbnail", thumbnail);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el informe");
      }

      setResult({ ok: true, message: "Informe creado correctamente" });
      setForm({
        title: "",
        abstract: "",
        summary: "",
        area: "",
        country: "",
        publish_year: CURRENT_YEAR,
        accreditation: "",
        editors: "",
        organization: "",
        budget_range: "",
        tags: "",
      });
      setPdf(null);
      setThumbnail(null);
      setThumbnailPreview(null);
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Subir informe</h1>
          <p className="text-slate-600 mt-2">
            Completa los datos del informe SROI y sube los archivos
          </p>
        </div>

        {result && (
          <div
            className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${result.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
          >
            {result.ok ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <p className="text-sm font-medium">{result.message}</p>
            <button
              onClick={() => setResult(null)}
              className="ml-auto p-1 hover:bg-black/5 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 sm:p-10 space-y-6"
        >
          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="text-sm font-semibold text-slate-900 mb-2 block"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Título del informe SROI"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label
              htmlFor="abstract"
              className="text-sm font-semibold text-slate-900 mb-2 block"
            >
              Resumen corto <span className="text-red-500">*</span>
            </label>
            <textarea
              id="abstract"
              name="abstract"
              required
              rows={3}
              value={form.abstract}
              onChange={handleChange}
              placeholder="Resumen breve para el listado de informes..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary"
              className="text-sm font-semibold text-slate-900 mb-2 block"
            >
              Resumen largo <span className="text-red-500">*</span>
            </label>
            <textarea
              id="summary"
              name="summary"
              required
              rows={5}
              value={form.summary}
              onChange={handleChange}
              placeholder="Resumen detallado para la vista de detalle..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Área + País */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="area"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Área <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                />
                <select
                  id="area"
                  name="area"
                  required
                  value={form.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
                >
                  <option value="" disabled>
                    Selecciona un área
                  </option>
                  {AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="country"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                País <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Ej: España"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Año + Acreditación + Presupuesto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="publish_year"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Año de publicación <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  id="publish_year"
                  name="publish_year"
                  type="number"
                  required
                  min={2000}
                  max={2099}
                  value={form.publish_year}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="accreditation"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Acreditación
              </label>
              <div className="relative">
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                />
                <select
                  id="accreditation"
                  name="accreditation"
                  value={form.accreditation}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
                >
                  {ACCREDITATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="budget_range"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Presupuesto
              </label>
              <div className="relative">
                <DollarSign
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                />
                <select
                  id="budget_range"
                  name="budget_range"
                  value={form.budget_range}
                  onChange={handleChange}
                  className="w-full pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Editors + Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="organization"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Organización
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Nombre de la organización"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="editors"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Editores / Autores
              </label>
              <div className="relative">
                <Users
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  id="editors"
                  name="editors"
                  type="text"
                  value={form.editors}
                  onChange={handleChange}
                  placeholder="Nombres de editores o autores"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="text-sm font-semibold text-slate-900 mb-2 block"
            >
              Etiquetas
            </label>
            <div className="relative">
              <Tag
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                id="tags"
                name="tags"
                type="text"
                value={form.tags}
                onChange={handleChange}
                placeholder="educación, salud, impacto (separadas por coma)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Archivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* PDF */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                PDF del informe <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                <Upload size={24} className="text-slate-400" />
                <span className="text-sm text-slate-600 text-center">
                  {pdf ? pdf.name : "Seleccionar PDF"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              {pdf && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setPdf(null)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Quitar archivo
                  </button>
                  <button
                    type="button"
                    onClick={handleExtract}
                    disabled={extracting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {extracting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Extrayendo...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Extraer con IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Miniatura <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer overflow-hidden">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-20 object-contain"
                  />
                ) : (
                  <>
                    <Image size={24} className="text-slate-400" />
                    <span className="text-sm text-slate-600 text-center">
                      Seleccionar imagen
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  className="hidden"
                />
              </label>
              {thumbnail && (
                <button
                  type="button"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={16} />
                Subir informe
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
