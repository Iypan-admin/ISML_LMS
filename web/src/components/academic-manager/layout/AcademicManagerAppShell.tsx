// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER APP SHELL & NAVIGATION FRAMEWORK
// Fully Responsive Navy-Themed Architecture with Campus Scoper & Mobile Drawer
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  FolderTree,
  ListTree,
  Files,
  Users,
  UserCheck,
  UserPlus,
  UserCog,
  Video,
  FileVideo,
  FileText,
  ClipboardList,
  Award,
  TrendingUp,
  CalendarRange,
  CheckSquare,
  BarChart3,
  Send,
  FileSpreadsheet,
  LogOut,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  MessageSquare,
  Search,
  Headphones,
} from 'lucide-react';
import {
  ACADEMIC_MANAGER_NAV_SECTIONS,
  AcademicMenuItem,
} from '@/config/academicManagerMenu';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import NotificationDrawer from '@/components/super-admin/layout/NotificationDrawer';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarDays,
  Bell,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  FolderTree,
  ListTree,
  Files,
  Users,
  UserCheck,
  UserPlus,
  UserCog,
  Video,
  FileVideo,
  FileText,
  Headphones,
  ClipboardList,
  Award,
  TrendingUp,
  CalendarRange,
  CheckSquare,
  BarChart3,
  Send,
  FileSpreadsheet,
  Briefcase,
  MessageSquare,
};

export function AcademicManagerSidebar() {
  const pathname = usePathname();
  const { selectedCollege, isOverall } = useCollege();

  // Determine which section contains the active route initially
  const activeSectionTitle = React.useMemo(() => {
    for (const section of ACADEMIC_MANAGER_NAV_SECTIONS) {
      const hasActive = section.items.some(
        (item) =>
          pathname === item.route ||
          (item.route !== '/academic-manager/dashboard' && pathname.startsWith(item.route))
      );
      if (hasActive) return section.title;
    }
    return ACADEMIC_MANAGER_NAV_SECTIONS[0]?.title || null;
  }, [pathname]);

  // Collapsible dropdown state (Accordion mode matching Super Admin)
  const [openSectionTitle, setOpenSectionTitle] = React.useState<string | null>(() => activeSectionTitle);

  React.useEffect(() => {
    if (activeSectionTitle) {
      setOpenSectionTitle(activeSectionTitle);
    }
  }, [activeSectionTitle]);

  const toggleSection = (sectionTitle: string) => {
    setOpenSectionTitle((prev) => (prev === sectionTitle ? null : sectionTitle));
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#061A36] text-white border-r border-[#153460] fixed left-0 top-0 bottom-0 z-40 shadow-xl overflow-hidden font-sans">
      {/* Brand Header */}
      <div className="px-4 py-3 bg-[#041226] border-b border-[#153460] flex items-center justify-between shrink-0">
        <Link href="/academic-manager/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="ISML Logo" fill sizes="28px" className="object-contain" priority />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white tracking-wider">
              ACADEMIC
            </span>
          </div>
        </Link>
      </div>

      {/* College Institution Scope Box */}
      <div className="px-4 py-3 bg-[#0a2347]/60 border-b border-[#153460] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span>{isOverall ? 'Global Scope' : 'Assigned Campus'}</span>
            </p>
            <p className="text-xs font-bold text-slate-100 truncate" title={isOverall ? 'All Colleges (Consolidated)' : selectedCollege?.name}>
              {isOverall ? 'All Campuses (Consolidated)' : selectedCollege?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div className="px-3.5 py-2 bg-blue-500/10 border-b border-[#153460] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-200">
          <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">Role: <strong className="text-white">Academic Manager</strong></span>
        </div>
        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-extrabold rounded border border-blue-500/30 uppercase">
          FACULTY & CURR
        </span>
      </div>

      {/* Categorized Dropdown / Accordion Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
        {ACADEMIC_MANAGER_NAV_SECTIONS.map((section) => {
          const isOpen = openSectionTitle === section.title;
          return (
            <div key={section.title} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  isOpen
                    ? 'text-cyan-300 bg-white/5 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{section.title}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.route ||
                      (item.route !== '/academic-manager/dashboard' &&
                        pathname.startsWith(item.route));
                    const Icon = iconMap[item.iconName] || BookOpen;

                    return (
                      <Link
                        key={item.id}
                        href={item.route}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#0052CC] text-white font-bold shadow-md shadow-blue-950/50 border-l-4 border-cyan-400'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-cyan-200' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full tracking-wider whitespace-nowrap shrink-0 ml-1.5 ${
                              item.badge === 'LiveKit'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                : item.badge === 'Core' || item.badge === 'Builder'
                                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                                : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#153460] bg-[#041226] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-blue-800 text-blue-200 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0">
            AM
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">Academic Coordinator</p>
            <p className="text-[10px] text-slate-400 truncate">academics@isml.edu</p>
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

export function AcademicManagerHeader() {
  const { selectedCollegeId, setSelectedCollegeId, isOverall, institutions } = useCollege();
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  return (
    <>
      <header className="fixed lg:sticky top-0 left-0 right-0 lg:left-auto lg:right-auto z-50 bg-white/98 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 shadow-2xs font-sans transition-all w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo & College Scope */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <Link
              href="/academic-manager/dashboard"
              className="flex items-center gap-2 shrink-0 group focus:outline-none"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="ISML Logo" fill className="object-contain" priority />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-extrabold text-xs sm:text-sm text-[#061A36] tracking-tight whitespace-nowrap">
                  ISML LMS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white tracking-wider">
                  ACADEMIC
                </span>
              </div>
            </Link>

            {/* Desktop / Tablet College Scope Selector */}
            <div className="hidden md:flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-2.5 py-1 text-xs transition-colors shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
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
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider shrink-0">
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
              <Building2 className="w-3.5 h-3.5 text-blue-600 mr-1 shrink-0" />
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
              href="/academic-manager/approvals"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Approvals</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
            </Link>

            <Link
              href="/academic-manager/live-classes"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-rose-600" />
              <span>Live Classes</span>
            </Link>

            {/* Notification Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Academic Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white animate-pulse" />
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 pl-1.5 sm:pl-2 sm:border-l sm:border-slate-200 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                AM
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">Prof. M. K. Sundaram</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Academic Coordinator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />
    </>
  );
}

export function AcademicManagerMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpenSectionTitle, setMobileOpenSectionTitle] = useState<string | null>(
    ACADEMIC_MANAGER_NAV_SECTIONS[0]?.title || null
  );
  const { institutions, selectedCollegeId, setSelectedCollegeId, isOverall } = useCollege();

  const mobilePrimaryLinks = [
    { label: 'Dashboard', route: '/academic-manager/dashboard', icon: LayoutDashboard },
    { label: 'Courses', route: '/academic-manager/courses', icon: BookOpen },
    { label: 'Batches', route: '/academic-manager/batches', icon: Layers },
    { label: 'Live', route: '/academic-manager/live-classes', icon: Video },
    { label: 'Timetable', route: '/academic-manager/timetable', icon: CalendarRange },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-200"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-Up Mobile Navigation Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 max-h-[85vh] bg-[#061A36] text-white z-50 rounded-t-3xl border-t border-[#153460] shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-out font-sans ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-4 border-b border-[#153460] flex items-center justify-between shrink-0 bg-[#041226] rounded-t-3xl">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-extrabold text-white">All Academic Modules</h3>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organized Menus inside Mobile Drawer with Dropdown Feel */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {ACADEMIC_MANAGER_NAV_SECTIONS.map((section) => {
            const isSectionOpen = mobileOpenSectionTitle === section.title;
            return (
              <div key={section.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    setMobileOpenSectionTitle((prev) =>
                      prev === section.title ? null : section.title
                    )
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    isSectionOpen
                      ? 'text-cyan-300 bg-white/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{section.title}</span>
                  {isSectionOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {isSectionOpen && (
                  <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {section.items.map((item) => {
                      const Icon = iconMap[item.iconName] || BookOpen;
                      const isActive = pathname === item.route || pathname.startsWith(item.route + '/');

                      return (
                        <Link
                          key={item.id}
                          href={item.route}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-[#0052CC] text-white font-bold shadow-md border-l-4 border-cyan-300'
                              : 'bg-white/5 hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full tracking-wider bg-blue-400/20 text-blue-300 border border-blue-400/30">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sign Out Option */}
          <div className="pt-2 border-t border-[#153460] mt-2">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                router.push('/login');
              }}
              className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Academic Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#061A36]/95 backdrop-blur-md border-t border-[#153460] py-1 px-1 font-sans shadow-lg">
        <nav className="flex items-center justify-around">
          {mobilePrimaryLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route || pathname.startsWith(item.route + '/');

            return (
              <Link
                key={item.route}
                href={item.route}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-blue-600/30 text-cyan-300 scale-105' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold tracking-tight truncate max-w-full mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Drawer Trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer flex-1 min-w-0 ${
              drawerOpen ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${drawerOpen ? 'bg-blue-600/30 text-cyan-300' : ''}`}>
              {drawerOpen ? <X className="w-4 h-4 text-cyan-300" /> : <Menu className="w-4 h-4" />}
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

function AcademicManagerShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBuilderStudio = pathname?.startsWith('/academic-manager/curriculum/builder');

  // Full-screen immersive canvas for Course Builder Studio
  if (isBuilderStudio) {
    return (
      <div className="h-screen w-full max-w-full overflow-hidden bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden relative">
      <AcademicManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen pb-24 lg:pb-0 lg:pl-72 overflow-x-hidden pt-[53px] lg:pt-0">
        <AcademicManagerHeader />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 w-full max-w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
      <AcademicManagerMobileNav />
    </div>
  );
}

export default function AcademicManagerAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <CollegeProvider>
        <ToastProvider>
          <AcademicManagerShellContent>{children}</AcademicManagerShellContent>
        </ToastProvider>
      </CollegeProvider>
    </AuthRbacProvider>
  );
}
