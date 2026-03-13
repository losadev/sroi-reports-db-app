'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, Download, Loader2, Building2, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  summary: string;
  thumbnail_url: string;
  file_url: string;
  area: string;
  tags: string[];
  accreditation: string | null;
  organization: string | null;
  editors: string | null;
  budget_range: string | null;
  country: string;
  publish_year: number;
  created_at: string;
}

// Helper para formatear el rango de presupuesto
function formatBudgetRange(budgetRange: string | null) {
  if (!budgetRange) return null;
  const labels: Record<string, string> = {
    'RANGE_0_50000': 'Hasta $50K',
    'RANGE_50001_100000': '$50K - $100K',
    'RANGE_100001_250000': '$100K - $250K',
    'RANGE_250001_500000': '$250K - $500K',
    'RANGE_500001_1000000': '$500K - $1M',
    'RANGE_1000001_PLUS': 'Más de $1M',
  };
  return labels[budgetRange] || budgetRange;
}

// Helper para mostrar la acreditación
function getAccreditationLabel(accreditation: string | null) {
  if (!accreditation || accreditation === 'NO_ACCREDITED') return null;
  return 'Acreditado';
}

function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${id}`);
        if (!response.ok) throw new Error('Informe no encontrado');
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el informe');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Cargando informe...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 mb-2">
            {error || 'Informe no encontrado'}
          </p>
          <Link
            href="/reports"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver a informes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {/* Back link */}
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver a informes
        </Link>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {report.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
          <span>{report.country}</span>
          <span className="text-slate-300">·</span>
          <span>{report.publish_year}</span>
          <span className="text-slate-300">·</span>
          <span>{report.area}</span>
          {getAccreditationLabel(report.accreditation) && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-green-600 font-medium">Acreditado</span>
            </>
          )}
        </div>

        {/* New fields display */}
        {(report.organization || report.editors || report.budget_range) && (
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            {report.organization && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 size={16} className="text-slate-400" />
                <span>{report.organization}</span>
              </div>
            )}
            {report.editors && (
              <div className="flex items-center gap-2 text-slate-600">
                <Users size={16} className="text-slate-400" />
                <span>{report.editors}</span>
              </div>
            )}
            {report.budget_range && (
              <div className="flex items-center gap-2 text-slate-600">
                <DollarSign size={16} className="text-slate-400" />
                <span>{formatBudgetRange(report.budget_range)}</span>
              </div>
            )}
          </div>
        )}

        {/* Summary + Thumbnail */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-10">
          <div className="flex-1 min-w-0">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {report.summary}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-full sm:w-56 h-56 sm:h-72 rounded-lg overflow-hidden bg-slate-100">
              <img
                src={report.thumbnail_url}
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        {report.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {report.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Download button */}
        <a
          href={report.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
        >
          <Download size={18} />
          Descargar informe
        </a>
      </div>
    </div>
  );
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600">Cargando informe...</p>
          </div>
        </div>
      }
    >
      <ReportDetail params={params} />
    </Suspense>
  );
}
