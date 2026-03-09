import { ExternalLink } from 'lucide-react';

interface ReportCardProps {
  id: string;
  title: string;
  date: string;
  abstract: string;
  thumbnail_url: string;
  file_url: string;
}

export function ReportCard({
  title,
  date,
  abstract,
  thumbnail_url,
  file_url,
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
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm font-semibold text-blue-600 mb-2 sm:mb-3">{date}</p>
        <p className="text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-3">
          {abstract}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
          >
            Read more
            <ExternalLink size={14} />
          </a>
          {/* Button visible inline on mobile */}
          <a
            href={file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            View report summary
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
          View report summary
        </a>
      </div>
    </div>
  );
}
