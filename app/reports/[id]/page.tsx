'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  summary: string;
  thumbnail_url: string;
  file_url: string;
  area: string;
  tags: string[];
  accredited: boolean;
  country: string;
  publish_year: number;
  created_at: string;
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${id}`);
        if (!response.ok) throw new Error('Reporte no encontrado');
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte');
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
          <p className="text-slate-600">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 mb-2">
            {error || 'Reporte no encontrado'}
          </p>
          <Link
            href="/reports"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver a reportes
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
          Volver a reportes
        </Link>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {report.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8">
          <span>{report.country}</span>
          <span className="text-slate-300">·</span>
          <span>{report.publish_year}</span>
          <span className="text-slate-300">·</span>
          <span>{report.area}</span>
          {report.accredited && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-green-600 font-medium">Acreditado</span>
            </>
          )}
        </div>

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
          Descargar reporte
        </a>
      </div>
    </div>
  );
}
