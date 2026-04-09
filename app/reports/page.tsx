"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { ReportCard } from "@/app/components/report-card";

// Tipos para los nuevos campos
interface Report {
  id: string;
  title: string;
  abstract: string;
  thumbnail_url: string;
  file_url: string;
  accreditation: string | null;
  organization: string | null;
  editors: string | null;
  budget_range: string | null;
  area: string;
  country: string;
  publish_year: number;
  created_at: string;
}

// Opciones de acreditación
const ACCREDITATION_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "ACCREDITED", label: "Acreditado" },
  { value: "NO_ACCREDITED", label: "No Acreditado" },
];

// Opciones de rango de presupuesto
const BUDGET_OPTIONS = [
  { value: "", label: "Cualquier presupuesto" },
  { value: "RANGE_0_50000", label: "Hasta $50K" },
  { value: "RANGE_50001_100000", label: "$50K - $100K" },
  { value: "RANGE_100001_250000", label: "$100K - $250K" },
  { value: "RANGE_250001_500000", label: "$250K - $500K" },
  { value: "RANGE_500001_1000000", label: "$500K - $1M" },
  { value: "RANGE_1000001_PLUS", label: "Más de $1M" },
];

function ReportsPage() {
  // Applied filters (used for actual filtering)
  const [search, setSearch] = useState("");
  const [accreditation, setAccreditation] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState<string | null>(null);

  // Pending filters (mobile only, applied on sidebar close)
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingAccreditation, setPendingAccreditation] = useState<
    string | null
  >(null);
  const [pendingBudgetRange, setPendingBudgetRange] = useState<string | null>(
    null,
  );

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener("close-sidebar", handler);
    return () => window.removeEventListener("close-sidebar", handler);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (accreditation !== null) params.append("accreditation", accreditation);
      if (budgetRange) params.append("budgetRange", budgetRange);

      try {
        const response = await fetch(`/api/reports?${params}`);
        console.log(response);
        const json = await response.json();
        setReports(json.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchReports, 300);
    return () => clearTimeout(timer);
  }, [search, accreditation, budgetRange]);

  const isMobile = () => window.innerWidth < 768;

  const applyFilters = () => {
    setSearch(pendingSearch);
    setAccreditation(pendingAccreditation);
    setBudgetRange(pendingBudgetRange);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile()) {
      applyFilters();
      setSidebarOpen(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setPendingSearch(value);
    if (!isMobile()) setSearch(value);
  };

  const handleAccreditationChange = (value: string | null) => {
    const apiValue = value === "all" ? null : value;
    setPendingAccreditation(apiValue);
    if (!isMobile()) setAccreditation(apiValue);
  };

  const handleBudgetRangeChange = (value: string | null) => {
    setPendingBudgetRange(value);
    if (!isMobile()) setBudgetRange(value);
  };

  const handleOpenSidebar = () => {
    // Sync pending with current applied filters when opening
    setPendingSearch(search);
    setPendingAccreditation(accreditation);
    setPendingBudgetRange(budgetRange);
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden relative">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed overlay on mobile, inline on desktop */}
      <aside
        className={`
          fixed md:relative z-40 md:z-auto top-0 left-0 h-full
          ${sidebarOpen ? "translate-x-0 md:w-72" : "-translate-x-full md:translate-x-0 md:w-0"}
          w-72 md:border-r border-slate-200 bg-white
          transition-all duration-300 ease-out overflow-hidden flex flex-col
        `}
      >
        <div className="hidden md:flex p-6 border-b border-slate-100 items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter size={20} className="text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Filtros</h2>
            </div>
            <p className="text-sm text-slate-500">Refina tu búsqueda</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Colapsar sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <div className="md:hidden flex justify-end p-4 border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Search Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-3 block">
              Búsqueda por palabra
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                type="text"
                placeholder="Título, abstract, tags..."
                value={pendingSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") closeSidebarOnMobile();
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button
              onClick={() => {
                closeSidebarOnMobile();
                setPendingSearch("");
              }}
              className="md:hidden w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Accreditation Filter - Dropdown */}
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-3 block">
              Acreditación
            </label>
            <div className="relative">
              <select
                value={
                  pendingAccreditation === null ? "all" : pendingAccreditation
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleAccreditationChange(value === "all" ? null : value);
                  closeSidebarOnMobile();
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
              >
                {ACCREDITATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-3 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Budget Range Filter - Dropdown */}
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-3 block">
              Presupuesto
            </label>
            <div className="relative">
              <select
                value={pendingBudgetRange || ""}
                onChange={(e) => {
                  handleBudgetRangeChange(e.target.value || null);
                  closeSidebarOnMobile();
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-3 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">
              {reports?.length}
            </span>{" "}
            informes encontrados
          </p>
        </div>
      </aside>

      {/* Desktop expand button (when sidebar is collapsed) */}
      {!sidebarOpen && (
        <div className="hidden md:flex items-start pt-4 px-2 border-r border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Expandir sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 bg-white">
          {/* Mobile only: filter button */}
          <div className="flex justify-end md:hidden">
            <button
              onClick={handleOpenSidebar}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filtros</span>
            </button>
          </div>
          <h1 className="hidden sm:block text-3xl font-bold text-slate-900">
            Informes SROI
          </h1>
          <p className="hidden sm:block text-base text-slate-600 mt-1">
            Base de datos de informes de Retorno Social de la Inversión
          </p>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Cargando informes...</p>
              </div>
            </div>
          ) : reports?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <p className="text-lg font-medium mb-1">No hay informes</p>
                <p className="text-sm">Intenta cambiar tus filtros</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <ReportCard
                    id={report.id}
                    title={report.title}
                    date={String(report.publish_year)}
                    abstract={report.abstract}
                    thumbnail_url={report.thumbnail_url}
                    file_url={report.file_url}
                    accreditation={report.accreditation}
                    organization={report.organization}
                    editors={report.editors}
                    budget_range={report.budget_range}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ReportsPage;
