// ============================================================================
// ISML COLLEGE LMS — BREADCRUMBS & SMART BACK NAVIGATION COMPONENT
// Contextual Navigation Trail for College Hierarchy with Responsive Back Button
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function Breadcrumbs({
  items,
  className = '',
  showBackButton = true,
  backHref,
  backLabel = 'Back',
}: BreadcrumbsProps) {
  const router = useRouter();

  // Determine smart fallback URL if backHref is not provided:
  // 1. If previous item in breadcrumbs has href, use it
  // 2. Else default to dashboard
  const fallbackHref = React.useMemo<string>(() => {
    if (backHref) return backHref;
    for (let i = items.length - 2; i >= 0; i--) {
      const prevHref = items[i]?.href;
      if (prevHref) return prevHref;
    }
    return '/super-admin/dashboard';
  }, [backHref, items]);

  const handleBackClick = (e: React.MouseEvent) => {
    // If browser has history, use router.back(), otherwise navigate to fallbackHref
    if (typeof window !== 'undefined' && window.history.length > 1 && !backHref) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 py-1 font-sans ${className}`}>
      {/* ─── Responsive Back Button ─── */}
      {showBackButton && (
        <div className="shrink-0">
          <Link
            href={fallbackHref}
            onClick={handleBackClick}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-[#0052CC] border border-slate-200/90 shadow-2xs text-xs font-bold transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
            title="Go back to previous page"
            aria-label="Back button"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0052CC] group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline font-semibold">{backLabel}</span>
          </Link>
        </div>
      )}

      {/* ─── Breadcrumb Hierarchy Trail ─── */}
      <nav aria-label="Breadcrumb" className="flex-1 flex items-center text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 min-w-0">
        <ol className="flex items-center gap-1.5 min-w-0">
          <li>
            <Link
              href="/super-admin/dashboard"
              className="flex items-center gap-1 text-slate-400 hover:text-[#0052CC] transition-colors p-1 rounded-lg hover:bg-slate-100/80"
              title="Super Admin Dashboard"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </li>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5 min-w-0">
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                {isLast || !item.href ? (
                  <span className="font-bold text-[#0B2447] truncate max-w-[180px] sm:max-w-none">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-[#0052CC] hover:underline transition-colors truncate max-w-[130px] sm:max-w-none font-medium text-slate-600"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
