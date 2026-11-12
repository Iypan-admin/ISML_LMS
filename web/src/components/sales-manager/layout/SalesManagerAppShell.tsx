// ============================================================================
// ISML LMS — SALES MANAGER APP SHELL & LAYOUT
// Premium Responsive Sidebar, Topbar, Campus Scoper & Quick Registration Triggers
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  KanbanSquare,
  CalendarDays,
  GraduationCap,
  School,
  QrCode,
  CreditCard,
  BarChart3,
  Building2,
  PhoneCall,
  Search,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { SALES_MANAGER_NAV_SECTIONS, SalesMenuItem } from '@/config/salesManagerMenu';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  KanbanSquare,
  CalendarDays,
  GraduationCap,
  School,
  QrCode,
  CreditCard,
  BarChart3,
  Building2,
};

export function SalesManagerSidebar({ onClose, isMobile = false }: { onClose?: () => void; isMobile?: boolean }) {
  const pathname = usePathname();
  const { selectedCollege, isOverall, isSchoolMode, labels } = useCollege();

  return (
    <aside
      className={
        isMobile
          ? "w-72 bg-[#0B2447] text-white flex flex-col h-full border-r border-[#1E3A8A] select-none shadow-2xl font-sans"
          : "hidden lg:flex flex-col w-72 bg-[#0B2447] text-white border-r border-[#1E3A8A] fixed left-0 top-0 bottom-0 z-40 shadow-xl overflow-hidden font-sans select-none"
      }
    >
      {/* 1. Header & Logo */}
      <div className="px-4 py-3 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <Link href="/sales-manager/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="ISML Logo" fill sizes="28px" className="object-contain" priority />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white tracking-wider">
                ADMISSION & SALES
              </span>
            </div>
            <p className="text-[10px] text-cyan-200/70 font-medium">Admissions & Intake Desk</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Institutional Scope Header */}
      <div className="px-4 py-2.5 bg-[#071730]/60 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-[#0052CC]/20 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span>Campus Scope</span>
            </p>
            <p className="text-xs font-bold text-slate-100 truncate">
              {isOverall ? 'Overall Network' : selectedCollege?.name || 'Central Network'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quick Action CTA Pills */}
      <div className="p-3 bg-[#071730]/40 mx-3 mt-3 rounded-2xl border border-[#1E3A8A] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Quick Forms</span>
          <span className="text-[9px] bg-blue-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-bold border border-cyan-400/20">Active</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/sales-manager/register-college"
            className="px-2 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/60 border border-blue-400/30 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span>+ College</span>
          </Link>
          <Link
            href="/sales-manager/register-school"
            className="px-2 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-400/30 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <School className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span>+ School</span>
          </Link>
        </div>
      </div>

      {/* 4. Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {SALES_MANAGER_NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.iconName] || LayoutDashboard;
                const isActive = pathname === item.path || (item.path !== '/sales-manager/dashboard' && pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#0052CC] text-white shadow-md shadow-blue-950/50 border-l-4 border-cyan-400 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-200' : 'text-slate-400 group-hover:text-white'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Sales Officer Profile Footer */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white border border-cyan-400/30 flex items-center justify-center font-bold text-xs shrink-0">
            KS
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">Karthik Subramanian</p>
            <p className="text-[10px] text-cyan-300/80 truncate">Admissions Lead</p>
          </div>
        </div>
        <Link
          href="/login"
          title="Sign Out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}

export function SalesManagerHeader({ onOpenMobile }: { onOpenMobile: () => void }) {
  const router = useRouter();
  const {
    selectedCollegeId,
    setSelectedCollegeId,
    filteredInstitutions,
    institutionCategory,
    setInstitutionCategory,
    isOverall,
    selectedCollege,
    isSchoolMode,
  } = useCollege();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
      {/* Mobile Drawer Trigger */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-sm text-[#0B2447]">Sales Portal</span>
      </div>

      {/* 🏛️ School / College Quick Segmented Switcher in Header */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setInstitutionCategory('COLLEGE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              institutionCategory === 'COLLEGE'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Colleges</span>
          </button>
          <button
            type="button"
            onClick={() => setInstitutionCategory('SCHOOL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              institutionCategory === 'SCHOOL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Schools</span>
          </button>
        </div>

        {/* Institution Scope Dropdown */}
        <select
          value={selectedCollegeId}
          onChange={(e) => setSelectedCollegeId(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#0052CC]"
        >
          <option value={OVERALL_COLLEGE_ID}>
            {isSchoolMode ? '🏫 Overall (All Schools)' : '🏛️ Overall (All Colleges)'}
          </option>
          {filteredInstitutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.code} — {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right Actions: Public Registration Links Dropdown & Counselor Hotline */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/register/college"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
        >
          <span>College Form</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/register/school"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
        >
          <span>School Form</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0052CC] font-bold text-xs flex items-center justify-center">
            CRM
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Sales Helpdesk</p>
            <p className="text-[10px] text-slate-400 leading-tight">+91 98401 22334</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function SalesManagerAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CollegeProvider>
      <ToastProvider>
        <AuthRbacProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden relative" suppressHydrationWarning>
            {/* Desktop Fixed Sidebar */}
            <SalesManagerSidebar />

            {/* Mobile Drawer */}
            {mobileOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileOpen(false)}
                />
                <div className="relative w-72 max-w-full h-full z-10 animate-in slide-in-from-left duration-200">
                  <SalesManagerSidebar onClose={() => setMobileOpen(false)} isMobile={true} />
                </div>
              </div>
            )}

            {/* Main Application Area (Padded on Desktop for Fixed Sidebar) */}
            <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen pb-24 lg:pb-0 lg:pl-72 overflow-x-hidden">
              <SalesManagerHeader onOpenMobile={() => setMobileOpen(true)} />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </AuthRbacProvider>
      </ToastProvider>
    </CollegeProvider>
  );
}
