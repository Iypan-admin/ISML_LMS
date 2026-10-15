// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER APP SHELL & SIDEBAR
// Dedicated Navigation & Header for Campus Finance & Fee Administration
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Users,
  CreditCard,
  Percent,
  RotateCcw,
  FileCheck,
  BarChart3,
  Building2,
  ShieldCheck,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  X,
  Coins,
  BadgeDollarSign,
  ArrowRight,
  Menu,
} from 'lucide-react';
import {
  FINANCE_MANAGER_NAV_SECTIONS,
  FINANCE_MANAGER_MENU_ITEMS,
  FinanceMenuItem,
} from '@/config/financeManagerMenu';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import NotificationDrawer from '@/components/super-admin/layout/NotificationDrawer';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Receipt,
  Users,
  CreditCard,
  Percent,
  RotateCcw,
  FileCheck,
  BarChart3,
  Building2,
};

export function FinanceManagerSidebar() {
  const pathname = usePathname();
  const { selectedCollege, isOverall } = useCollege();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#0B2447] text-white border-r border-[#1E3A8A] fixed left-0 top-0 bottom-0 z-40 shadow-xl overflow-hidden font-sans">
      {/* Brand Header */}
      <div className="px-4 py-3 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <Link href="/finance-manager/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="ISML Logo" fill sizes="28px" className="object-contain" priority />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white tracking-wider">
              FINANCE
            </span>
          </div>
        </Link>
      </div>

      {/* College Identity Box */}
      <div className="px-4 py-2.5 bg-[#071730]/60 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-[#0052CC]/20 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span>{isOverall ? 'Global Scope' : 'Assigned Campus'}</span>
            </p>
            <p className="text-xs font-bold text-slate-100 truncate" title={isOverall ? 'All Colleges (Consolidated)' : selectedCollege?.name}>
              {isOverall ? 'All Campuses (Consolidated)' : selectedCollege?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div className="px-3.5 py-2 bg-[#0052CC]/15 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
          <Coins className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <span className="truncate">Role: <strong className="text-white">Finance Manager</strong></span>
        </div>
        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[9px] font-extrabold rounded border border-cyan-400/30 uppercase tracking-wider">
          TREASURY
        </span>
      </div>

      {/* Menu Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {FINANCE_MANAGER_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
                const Icon = iconMap[item.iconName] || LayoutDashboard;

                return (
                  <Link
                    key={item.id}
                    href={item.route}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#0052CC] text-white font-semibold shadow-md shadow-blue-900/50 border-l-4 border-cyan-400'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full tracking-wider"
                      >
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

      {/* User Footer */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            FM
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">Finance Controller</p>
            <p className="text-[10px] text-slate-400 truncate">finance@isml.edu</p>
          </div>
        </div>
        <Link
          href="/login"
          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}

export function FinanceManagerHeader() {
  const router = useRouter();
  const { selectedCollegeId, setSelectedCollegeId, institutions, isOverall } = useCollege();
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="fixed lg:sticky top-0 left-0 right-0 lg:left-auto lg:right-auto z-50 bg-white/98 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 shadow-2xs font-sans transition-all w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo & College Scope */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <Link
              href="/finance-manager/dashboard"
              className="flex items-center gap-2 shrink-0 group focus:outline-none"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="ISML Logo" fill className="object-contain" priority />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-extrabold text-xs sm:text-sm text-[#0B2447] tracking-tight whitespace-nowrap">
                  ISML LMS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white tracking-wider">
                  FINANCE
                </span>
              </div>
            </Link>

            {/* Desktop / Tablet College Scope Selector */}
            <div className="hidden md:flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-2.5 py-1 text-xs transition-colors shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#0052CC] mr-1.5 shrink-0" />
              <select
                id="header-college-select-desktop"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer pr-1 truncate max-w-[220px] lg:max-w-[280px]"
                title="Select Campus Scope"
              >
                <option value={OVERALL_COLLEGE_ID}>🏛️ All Campuses (Consolidated)</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name}
                  </option>
                ))}
              </select>
              {isOverall ? (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-[#0052CC] border border-blue-200 uppercase tracking-wider shrink-0">
                  Global
                </span>
              ) : (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider shrink-0">
                  Campus
                </span>
              )}
            </div>
          </div>

          {/* Right: Mobile College Scoper, Notifications & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile College Selector Pill */}
            <div className="flex md:hidden items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-2 py-1 text-xs shrink-0 max-w-[125px]">
              <Building2 className="w-3.5 h-3.5 text-[#0052CC] mr-1 shrink-0" />
              <select
                id="header-college-select-mobile"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="bg-transparent text-slate-900 font-bold text-[11px] outline-none cursor-pointer w-full truncate pr-0.5"
                title="Select Campus Scope"
              >
                <option value={OVERALL_COLLEGE_ID}>🏛️ Overall</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.code}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/finance-manager/approvals"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Pending Super Admin</span>
            </Link>

            {/* Notification Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-[#0052CC] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Finance Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-[#0052CC] ring-2 ring-white animate-pulse" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B2447] to-[#0052CC] text-white flex items-center justify-center font-bold text-xs border border-white">
                  FC
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-none">Finance Controller</p>
                  <p className="text-[10px] text-[#0052CC] mt-0.5 font-semibold">Campus Accounts</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2.5 bg-blue-50 rounded-xl mb-1 border border-blue-100">
                      <p className="font-bold text-slate-950 text-xs">Finance Controller</p>
                      <p className="text-[11px] text-slate-600">finance@isml.edu</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#0052CC]">
                        <ShieldCheck className="w-3 h-3 text-[#0052CC]" />
                        <span>Campus Treasury Officer</span>
                      </div>
                    </div>
                    <Link
                      href="/super-admin/dashboard"
                      className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Switch to Super Admin
                    </Link>
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Sign Out
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />
    </>
  );
}

export function FinanceManagerMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedCollegeId, setSelectedCollegeId, institutions, isOverall } = useCollege();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto close drawer when page changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const quickLinks = [
    { label: 'Dashboard', route: '/finance-manager/dashboard', icon: LayoutDashboard },
    { label: 'Fee Rules', route: '/finance-manager/fee-structures', icon: Receipt },
    { label: 'Student Fees', route: '/finance-manager/student-fees', icon: Users },
    { label: 'Ledger', route: '/finance-manager/transactions', icon: CreditCard },
  ];

  return (
    <>
      {/* ─── Slide-Up Full Menu Drawer (All Modules) ─── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed bottom-[64px] left-0 right-0 bg-[#0B2447] text-white rounded-t-2xl z-50 lg:hidden max-h-[80vh] flex flex-col shadow-2xl border-t border-[#1E3A8A] overflow-hidden animate-in slide-in-from-bottom duration-200 font-sans">
            {/* Drawer Top Header */}
            <div className="p-3.5 border-b border-[#1E3A8A] flex items-center justify-between bg-[#071730] rounded-t-2xl shrink-0">
              <div className="flex items-center gap-2.5 truncate">
                <div className="p-1.5 rounded-lg bg-[#0052CC]/20 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">Finance Controller</p>
                  <p className="text-[10px] text-cyan-300 font-semibold truncate">All Campus Financial Portals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white cursor-pointer shrink-0"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* College Context Selector inside Mobile Drawer */}
            <div className="p-3 bg-[#071730]/60 border-b border-[#1E3A8A]">
              <label className="block text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Active Campus Scope:</span>
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full bg-[#0B2447] border border-[#1E3A8A] text-white rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
              >
                <option value={OVERALL_COLLEGE_ID}>🏛️ All Campuses (Consolidated)</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Complete Organized Menus inside Mobile Drawer */}
            <div className="p-3 overflow-y-auto space-y-4 flex-1">
              {FINANCE_MANAGER_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = iconMap[item.iconName] || LayoutDashboard;
                      const isActive = pathname === item.route || pathname.startsWith(item.route + '/');

                      return (
                        <Link
                          key={item.id}
                          href={item.route}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-[#0052CC] text-white font-bold shadow-md border-l-4 border-cyan-400'
                              : 'bg-white/5 hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full tracking-wider shrink-0 ml-2"
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Sign Out Option in Drawer */}
              <div className="pt-2 border-t border-[#1E3A8A] mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/login');
                  }}
                  className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Finance Manager</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Sticky Mobile Bottom Navigation Bar (4 primary + 1 More menu trigger) ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B2447] border-t border-[#1E3A8A] z-40 lg:hidden shadow-2xl font-sans">
        <nav className="flex items-center justify-around px-1 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative flex-1 min-w-0 ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-[#0052CC] text-white scale-105 shadow-sm' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-tight truncate max-w-full mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer flex-1 min-w-0 ${
              drawerOpen ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={drawerOpen ? 'Close Navigation Menu' : 'Open Full Navigation Menu'}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                drawerOpen ? 'bg-[#0052CC] text-white scale-105 shadow-sm' : ''
              }`}
            >
              {drawerOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-semibold tracking-tight truncate max-w-full mt-0.5">
              {drawerOpen ? 'Close' : 'More'}
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}

import { ToastProvider } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

function FinanceManagerShellContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden relative">
      <FinanceManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen pb-24 lg:pb-0 lg:pl-72 overflow-x-hidden pt-[53px] lg:pt-0">
        <FinanceManagerHeader />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 w-full max-w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
      <FinanceManagerMobileNav />
    </div>
  );
}

export default function FinanceManagerAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <CollegeProvider>
        <ToastProvider>
          <FinanceManagerShellContent>{children}</FinanceManagerShellContent>
        </ToastProvider>
      </CollegeProvider>
    </AuthRbacProvider>
  );
}
