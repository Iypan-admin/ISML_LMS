// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN APP SHELL & NAVIGATION FRAMEWORK
// High-fidelity Navy theme with Campus Selector, Notifications, and Navigation Drawer
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  UserPlus,
  CreditCard,
  Receipt,
  BookOpen,
  Layers,
  Users,
  UserCheck,
  Award,
  Building2,
  Lock,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { COLLEGE_ADMIN_NAV_SECTIONS } from '@/config/collegeAdminMenu';
import { useToast } from '@/context/ToastContext';
import NotificationDrawer from '@/components/super-admin/layout/NotificationDrawer';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  GraduationCap,
  UserPlus,
  CreditCard,
  Receipt,
  BookOpen,
  Layers,
  Users,
  UserCheck,
  Award,
  Building2,
  Lock,
};

export default function CollegeAdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showSuccess } = useToast();

  // Active college state for College Admin (synced from logged in user session or DB)
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    campusId?: string;
    campusName?: string;
  } | null>(null);

  const [activeCollegeId, setActiveCollegeId] = useState<string>('inst-01');
  const [activeCollege, setActiveCollege] = useState<{
    id: string;
    name: string;
    code: string;
    type?: string;
  }>({
    id: 'inst-01',
    name: 'Affiliated College Campus',
    code: 'COLLEGE',
    type: 'COLLEGE',
  });

  const [institutions, setInstitutions] = useState<any[]>([]);

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('isml_admin_user') || localStorage.getItem('isml_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          const isAmer = (parsed.email && parsed.email.includes('americancollege')) || (parsed.institutionCode === 'AMER-COL') || (parsed.name && parsed.name.includes('American'));

          if (isAmer) {
            setActiveCollege({
              id: '521323cd-00da-49a6-98ed-6b7918d181b4',
              name: 'The American College',
              code: 'AMER-COL',
              type: 'COLLEGE',
            });
            setActiveCollegeId('AMER-COL');
          } else if (parsed.campusName || parsed.campusId) {
            setActiveCollege({
              id: parsed.campusId || 'inst-user',
              name: parsed.campusName || 'Partner Institutional Campus',
              code: parsed.institutionCode || (parsed.campusName ? parsed.campusName.split(' ').map((w: string) => w[0]?.toUpperCase()).join('').slice(0, 6) : 'CAMPUS'),
              type: parsed.role === 'SCHOOL_ADMIN' ? 'SCHOOL' : 'COLLEGE',
            });
            setActiveCollegeId(parsed.campusId || 'inst-user');
          }
        }
      }
    } catch {
      // Fallback
    }

    // Fetch live institutions from backend (zero mock)
    fetch('https://ismllms-production.up.railway.app/api/portals/institutions')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.data && json.data.length > 0) {
          setInstitutions(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex font-sans">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (DEEP NAVY LUXURY THEME)                               */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-64 bg-[#0B192C] text-slate-300 flex-col shrink-0 border-r border-slate-800 h-screen sticky top-0 select-none z-30">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/college-admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              ISML
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight">ISML LMS</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  COLLEGE ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Campus Management Console</p>
            </div>
          </Link>
        </div>

        {/* Active Campus Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-400" />
              <span>Campus</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeCollege.code}
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-1 leading-snug line-clamp-2">
            {activeCollege.name}
          </p>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {COLLEGE_ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {section.title}
              </span>

              {section.items.map((item) => {
                const IconComp = iconMap[item.iconName] || LayoutDashboard;
                const isActive = pathname === item.route;

                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition group ${
                      isActive
                        ? 'bg-[#0052CC] text-white shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComp
                        className={`w-4 h-4 shrink-0 transition ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white text-[#0052CC]'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer User Info & Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                CA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">College Administrator</p>
                <p className="text-[10px] text-slate-400 truncate">{activeCollege.code} Campus</p>
              </div>
            </div>

            <button
              onClick={() => setShowSignOutModal(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA WITH TOP NAV BAR                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Active Campus Tag */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-black text-[#0B2447] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[240px] md:max-w-[340px]">{activeCollege.name}</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200">
                {activeCollege.code}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Notifications Trigger */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-[#0052CC] hover:bg-blue-50 border border-slate-200 relative transition cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            {/* Profile Tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CA'}
              </div>
              <div className="hidden sm:block text-left max-w-[160px]">
                <p className="text-xs font-bold text-slate-800 leading-none truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-blue-600 font-semibold leading-none mt-1 truncate">
                  {currentUser?.role === 'SCHOOL_ADMIN' ? 'School Principal' : 'Campus Registrar'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-OVER DRAWER                                               */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div className="w-72 bg-[#0B192C] text-slate-200 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
            <div>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    CA
                  </div>
                  <span className="font-black text-sm text-white">College Admin</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Campus Selector in Mobile */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Campus
                </span>
                <select
                  value={activeCollegeId}
                  onChange={(e) => {
                    setActiveCollegeId(e.target.value);
                    setIsMobileMenuOpen(false);
                    const col = institutions.find((i) => i.id === e.target.value);
                    showSuccess(`Switched to: ${col?.name || 'Campus'}`);
                  }}
                  className="w-full text-xs font-bold text-white bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer truncate"
                >
                  {institutions.length === 0 ? (
                    <option value="inst-01">Loyola College of Arts & Science</option>
                  ) : (
                    institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Mobile Navigation Links */}
              <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {COLLEGE_ADMIN_NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {section.title}
                    </span>
                    {section.items.map((item) => {
                      const IconComp = iconMap[item.iconName] || LayoutDashboard;
                      const isActive = pathname === item.route;

                      return (
                        <Link
                          key={item.route}
                          href={item.route}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                            isActive ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComp className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  try {
                    localStorage.removeItem('isml_user');
                    localStorage.removeItem('isml_admin_user');
                    sessionStorage.clear();
                  } catch {}
                  window.location.href = '/login';
                }}
                className="w-full py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Sign Out of College Admin?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You will be redirected back to the primary authentication portal.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  router.push('/auth/login');
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
