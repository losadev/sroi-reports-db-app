'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ReportCard } from '@/app/components/report-card';

interface Report {
  id: string;
  title: string;
  abstract: string;
  thumbnail_url: string;
  file_url: string;
  accredited: boolean;
  area: string;
  country: string;
  publish_year: number;
  created_at: string;
}

// Mock data for design preview
const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Global Economic Outlook 2025: Trends and Forecasts',
    abstract: 'This comprehensive report examines the current state of the global economy and provides detailed forecasts for the coming year. Key areas of focus include inflation trends, employment rates, and GDP growth across major economies. The analysis incorporates data...',
    thumbnail_url: 'https://images.unsplash.com/photo-1579532537598-459e26a7fa38?w=200&h=200&fit=crop',
    file_url: '#',
    accredited: true,
    area: 'Economics',
    country: 'Global',
    publish_year: 2025,
    created_at: '2025-03-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Climate Change Impact Assessment: Agriculture Sector',
    abstract: 'An in-depth analysis of how climate change is affecting agricultural production worldwide. This report covers crop yield variations, water scarcity challenges, and adaptation strategies being implemented by farmers and governments. Special attention is given to vulnerable...',
    thumbnail_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop',
    file_url: '#',
    accredited: false,
    area: 'Agriculture',
    country: 'Global',
    publish_year: 2025,
    created_at: '2025-02-28T00:00:00Z',
  },
  {
    id: '3',
    title: 'Digital Transformation in Healthcare: A Global Perspective',
    abstract: 'Exploring the rapid digitalization of healthcare services across developed and developing nations. Topics include telemedicine adoption rates, electronic health records implementation, AI-assisted diagnostics, and the regulatory frameworks governing digital health innovations...',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=200&h=200&fit=crop',
    file_url: '#',
    accredited: true,
    area: 'Healthcare',
    country: 'USA',
    publish_year: 2025,
    created_at: '2025-01-20T00:00:00Z',
  },
  {
    id: '4',
    title: 'Renewable Energy Transition: Policy and Implementation',
    abstract: 'A comprehensive study of renewable energy policies and their real-world implementation across different regions. The report analyzes solar, wind, and hydroelectric projects, their efficiency rates, cost analysis, and environmental benefits. It also examines government incentives and international agreements...',
    thumbnail_url: 'https://images.unsplash.com/photo-1509391366360-2e938f0deba0?w=200&h=200&fit=crop',
    file_url: '#',
    accredited: true,
    area: 'Energy',
    country: 'Europe',
    publish_year: 2025,
    created_at: '2025-01-10T00:00:00Z',
  },
];

function ReportsPage() {
  // Applied filters (used for actual filtering)
  const [search, setSearch] = useState('');
  const [accredited, setAccredited] = useState<string | null>(null);

  // Pending filters (mobile only, applied on sidebar close)
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingAccredited, setPendingAccredited] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener('close-sidebar', handler);
    return () => window.removeEventListener('close-sidebar', handler);
  }, []);

  const isMobile = () => window.innerWidth < 768;

  const applyFilters = () => {
    setSearch(pendingSearch);
    setAccredited(pendingAccredited);
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

  const handleAccreditedChange = (value: string | null) => {
    setPendingAccredited(value);
    if (!isMobile()) setAccredited(value);
  };

  const handleOpenSidebar = () => {
    // Sync pending with current applied filters when opening
    setPendingSearch(search);
    setPendingAccredited(accredited);
    setSidebarOpen(!sidebarOpen);
  };

  // Filter mock data based on search and accreditation
  const filteredReports = MOCK_REPORTS.filter((report) => {
    const matchesSearch =
      search === '' ||
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.abstract.toLowerCase().includes(search.toLowerCase());

    const matchesAccreditation =
      accredited === null || report.accredited === (accredited === 'true');

    return matchesSearch && matchesAccreditation;
  });

  // TODO: Uncomment when API is ready and remove mock data filtering
  /*
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (accredited !== null) params.append('accredited', accredited);

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();
      setReports(data);
      setLoading(false);
    };

    const timer = setTimeout(fetchReports, 300);
    return () => clearTimeout(timer);
  }, [search, accredited]);
  */

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
          ${sidebarOpen ? 'translate-x-0 md:w-72' : '-translate-x-full md:translate-x-0 md:w-0'}
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
                onKeyDown={(e) => { if (e.key === 'Enter') closeSidebarOnMobile(); }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button
              onClick={() => { closeSidebarOnMobile(); setPendingSearch(''); }}
              className="md:hidden w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Accreditation Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-3 block">
              Acreditación
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="accredited"
                  value="all"
                  checked={pendingAccredited === null}
                  onChange={() => { handleAccreditedChange(null); closeSidebarOnMobile(); }}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                  Todos
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="accredited"
                  value="true"
                  checked={pendingAccredited === 'true'}
                  onChange={() => { handleAccreditedChange('true'); closeSidebarOnMobile(); }}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                  Acreditado
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="accredited"
                  value="false"
                  checked={pendingAccredited === 'false'}
                  onChange={() => { handleAccreditedChange('false'); closeSidebarOnMobile(); }}
                  className="w-4 h-4 accent-slate-400"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                  No acreditado
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filteredReports.length}</span>{' '}
            reportes encontrados
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
          <h1 className="hidden sm:block text-3xl font-bold text-slate-900">Reportes SROI</h1>
          <p className="hidden sm:block text-base text-slate-600 mt-1">
            Base de datos de reportes de Retorno Social de la Inversión
          </p>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Cargando reportes...</p>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <p className="text-lg font-medium mb-1">No hay reportes</p>
                <p className="text-sm">Intenta cambiar tus filtros</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredReports.map((report, index) => (
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
                    date={new Date(report.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    abstract={report.abstract}
                    thumbnail_url={report.thumbnail_url}
                    file_url={report.file_url}
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
