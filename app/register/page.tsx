"use client";

import { useState } from "react";
import { Building2, Mail, Lock, ArrowRight, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ENTITY_TYPES = [
  "Universidad / Investigación",
  "Administración pública",
  "Empresa privada",
  "Tercer sector (ONG / Fundación / Asociación)",
  "Uso personal / Privado",
  "Prefiero no indicarlo",
];

export default function RegisterPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    orgName: "",
    entityType: "",
    email: "",
    password: "",
    newsletter: false,
    sroiInfo: false,
    downloadOnly: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          org_name: form.orgName,
          entity_type: form.entityType,
          newsletter: form.newsletter,
          sroi_info: form.sroiInfo,
          download_only: form.downloadOnly,
        },
      },
    });

    if (error) {
      console.error("Registration error:", error.message);
      return;
    }
    console.log("Registration successful:", data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Registro exitoso
          </h2>
          <p className="text-slate-600">
            Gracias, <span className="font-semibold">{form.orgName}</span>. Te
            hemos enviado un correo a{" "}
            <span className="font-semibold">{form.email}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-slate-600 mt-2">
            Regístrate para acceder a los reportes SROI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Nombre + Tipo de entidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nombre de organización o personal */}
            <div>
              <label
                htmlFor="orgName"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Organización o nombre personal
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  id="orgName"
                  name="orgName"
                  type="text"
                  required
                  value={form.orgName}
                  onChange={handleChange}
                  placeholder="Ej: Universidad de Barcelona"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Tipo de entidad */}
            <div>
              <label
                htmlFor="entityType"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                Tipo de entidad
              </label>
              <div className="relative">
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                />
                <select
                  id="entityType"
                  name="entityType"
                  required
                  value={form.entityType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Email (full width) */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-900 mb-2 block"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Row 3: Contraseña (full width) */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-900 mb-2 block"
            >
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Texto informativo */}
          <p className="text-xs text-slate-500 leading-relaxed">
            Usaremos esta información de forma agregada para entender quién
            consulta y descarga los informes, así como para enviar
            comunicaciones relacionadas con medición de impacto y metodología
            SROI si la persona lo desea.
          </p>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="newsletter"
                checked={form.newsletter}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 accent-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                Quiero recibir la newsletter
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="sroiInfo"
                checked={form.sroiInfo}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 accent-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                Quiero recibir información sobre SROI (formaciones, recursos,
                servicios, etc.)
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="downloadOnly"
                checked={form.downloadOnly}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 accent-slate-400 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                Solo quiero descargar el informe (sin recibir comunicaciones)
              </span>
            </label>
          </div>

          {/* Row 4: Botones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Registrarse
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                /* TODO: Google OAuth */
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700">
                Continuar con Google
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
