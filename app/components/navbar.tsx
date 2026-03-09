'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, Menu, X } from 'lucide-react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-white z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/reports"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Database size={22} className="text-blue-600" />
          <span className="font-bold text-base sm:text-lg text-slate-900">SROI Reports</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://thesocialconsulting.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            The Social Consulting
          </a>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Registrarse
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
          <a
            href="https://thesocialconsulting.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            The Social Consulting
          </a>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Registrarse
          </Link>
        </div>
      )}
    </nav>
  );
}
