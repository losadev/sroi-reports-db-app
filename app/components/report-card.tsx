import { ExternalLink, Building2, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface ReportCardProps {
  id: string;
  title: string;
  date: string;
  abstract: string;
  thumbnail_url: string;
  file_url: string;
  accreditation?: string | null;
  organization?: string | null;
  editors?: string | null;
  budget_range?: string | null;
}

// Helper para mostrar el badge de acreditación
function getAccreditationBadge(accreditation: string | null | undefined) {
  if (!accreditation || accreditation === 'NO_ACCREDITED') return null;
  return (
    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
      Acreditado
    </span>
  );
}

// Helper para formatear el rango de presupuesto
function formatBudgetRange(budgetRange: string | null | undefined) {
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

export function ReportCard({
  id,
  title,
  date,
  abstract,
  thumbnail_url,
  file_url,
  accreditation,
  organization,
  editors,
  budget_range,
}: ReportCardProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-5 sm:py-6 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors px-4 sm:px-8">
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        <div className="w-full h-40 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-slate-200">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
            {title}
          </h3>
          {getAccreditationBadge(accreditation)}
        </div>
        <p className="text-sm font-semibold text-blue-600 mb-2 sm:mb-3">{date}</p>
        <p className="text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-3">
          {abstract}
        </p>
        
        {/* New fields display */}
        {(organization || editors || budget_range) && (
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-slate-500">
            {organization && (
              <span className="flex items-center gap-1">
                <Building2 size={12} />
                {organization}
              </span>
            )}
            {editors && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {editors}
              </span>
            )}
            {budget_range && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {formatBudgetRange(budget_range)}
              </span>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/reports/${id}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
          >
            Leer más
            <ExternalLink size={14} />
          </Link>
          {/* Button visible inline on mobile */}
          <a
            href={file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Ver informe
          </a>
        </div>
      </div>

      {/* Button - desktop only */}
      <div className="hidden sm:flex flex-shrink-0 items-start pt-1">
        <a
          href={file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          Ver informe
        </a>
      </div>
    </div>
  );
}
