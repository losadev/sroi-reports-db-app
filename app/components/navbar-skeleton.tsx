export function NavbarSkeleton() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-[22px] w-[22px] rounded bg-slate-200 animate-pulse" />
          <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Desktop links placeholder */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-5 w-36 rounded bg-slate-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Mobile hamburger placeholder */}
        <div className="sm:hidden h-[22px] w-[22px] rounded bg-slate-200 animate-pulse" />
      </div>
    </nav>
  );
}
