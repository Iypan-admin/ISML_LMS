// ============================================================================
// ISML COLLEGE LMS — STAT KPI CARD COMPONENT
// Production Metric Card with Trend, Subtext & Loading Skeleton
// ============================================================================

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  iconColor = 'text-[#0052CC]',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs animate-pulse font-sans">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-slate-200 rounded-md w-24"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-7 bg-slate-200 rounded-md w-20 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded-md w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all font-sans">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </p>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl font-extrabold text-[#0B2447] tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
