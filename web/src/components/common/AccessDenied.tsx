// ============================================================================
// ISML COLLEGE LMS — ACCESS DENIED (403) COMPONENT
// Enterprise RBAC Access Guard Feedback Screen
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LayoutDashboard, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthRbacContext';

interface AccessDeniedProps {
  requiredPermissionName?: string;
  customMessage?: string;
}

export default function AccessDenied({
  requiredPermissionName,
  customMessage = "You don't have permission to access this section.",
}: AccessDeniedProps) {
  const router = useRouter();
  const { activeRole } = useAuth();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-5 shadow-xs animate-in zoom-in-95 duration-200">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3 border border-slate-200">
        <KeyRound className="w-3.5 h-3.5 text-slate-500" />
        <span>HTTP 403 Forbidden • RBAC Protected</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
        Access Denied
      </h1>

      <p className="text-sm text-slate-600 max-w-md mt-2">
        {customMessage}
      </p>

      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-md w-full text-left space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Current Role:</span>
          <span className="font-bold text-[#0B2447]">{activeRole.name}</span>
        </div>
        {requiredPermissionName && (
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Missing Requirement:</span>
            <span className="font-semibold text-rose-600">{requiredPermissionName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <Link
          href="/super-admin/dashboard"
          className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
