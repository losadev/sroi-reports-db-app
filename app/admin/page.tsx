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

const CURRENT_YEAR = new Date().getFullYear().toString();

export default function AdminPage() {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    summary: "",
    area: "",
    country: "",
    publish_year: CURRENT_YEAR,
    accredited: false,
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
        accredited: extracted.accredited || false,
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
    formData.append("accredited", String(form.accredited));
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
        throw new Error(data.error || "Error al crear el reporte");
      }

      setResult({ ok: true, message: "Reporte creado correctamente" });
      setForm({
        title: "",
        abstract: "",
        summary: "",
        area: "",
        country: "",
        publish_year: CURRENT_YEAR,
        accredited: false,
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
          <h1 className="text-3xl font-bold text-slate-900">Subir reporte</h1>
          <p className="text-slate-600 mt-2">
            Completa los datos del reporte SROI y sube los archivos
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
                placeholder="Título del reporte SROI"
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
              placeholder="Resumen breve para el listado de reportes..."
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

          {/* Año + Acreditado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="accredited"
                  checked={form.accredited}
                  onChange={handleChange}
                  className="w-4 h-4 accent-green-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                  Reporte acreditado
                </span>
              </label>
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
                PDF del reporte <span className="text-red-500">*</span>
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
                Subir reporte
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
