// ============================================================================
// ISML COLLEGE LMS — TUTOR / FACULTY APP SHELL & NAVIGATION FRAMEWORK
// Standard Super Admin & Academic Manager Theme (#0B2447 Navy, #0052CC Blue, Cyan Accents)
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  CalendarDays,
  Layers,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  Award,
  BookOpen,
  FileText,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
  Sparkles,
  Users,
  FileVideo,
} from 'lucide-react';
import { TUTOR_NAV_SECTIONS } from '@/config/tutorMenu';
import { mockFacultyMembers } from '@/mock/facultyAssignments';
import { TutorProvider, useTutor } from '@/context/TutorContext';
import { ToastProvider } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Video,
  FileVideo,
  CalendarDays,
  Layers,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  Award,
  BookOpen,
  FileText,
};

export function TutorSidebar({ activeFacultyId }: { activeFacultyId?: string }) {
  const pathname = usePathname();
  const currentFaculty = mockFacultyMembers.find((f) => f.id === activeFacultyId) || mockFacultyMembers[0];

  // Determine which section contains the active route initially
  const activeSectionTitle = React.useMemo(() => {
    for (const section of TUTOR_NAV_SECTIONS) {
      const hasActive = section.items.some(
        (item) =>
          pathname === item.route ||
          (item.route !== '/tutor/dashboard' && pathname.startsWith(item.route))
      );
      if (hasActive) return section.title;
    }
    return TUTOR_NAV_SECTIONS[0]?.title || null;
  }, [pathname]);

  // Collapsible dropdown state (Accordion mode matching Academic Manager & Super Admin)
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
    <aside className="hidden lg:flex flex-col w-72 bg-[#0B2447] text-white border-r border-[#1E3A8A] fixed left-0 top-0 bottom-0 z-40 shadow-xl overflow-hidden font-sans">
      {/* Brand Header */}
      <div className="px-4 py-3 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <Link href="/tutor/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="ISML Logo" fill sizes="28px" className="object-contain" priority />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white tracking-wider">
              FACULTY
            </span>
          </div>
        </Link>
      </div>

      {/* Faculty Profile Summary Strip */}
      <div className="px-4 py-3 bg-[#071730]/60 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shrink-0">
            <Image
              src={currentFaculty.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentFaculty.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span>{currentFaculty.primaryLanguage} Lead</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </p>
            <p className="text-xs font-bold text-slate-100 truncate" title={currentFaculty.name}>
              {currentFaculty.name}
            </p>
          </div>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div className="px-3.5 py-2 bg-[#0052CC]/15 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
          <UserCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <span className="truncate">Active Duties:</span>
          <span className="font-bold text-white text-[11px]">French A1 • A2 • B1 • B2</span>
        </div>
        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[9px] font-extrabold rounded border border-cyan-400/30 uppercase tracking-wider">
          CEFR
        </span>
      </div>

      {/* Categorized Dropdown / Accordion Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
        {TUTOR_NAV_SECTIONS.map((section) => {
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
                      (item.route !== '/tutor/dashboard' && pathname.startsWith(item.route));
                    const Icon = iconMap[item.iconName] || LayoutDashboard;

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
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full tracking-wider">
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

      {/* Bottom Profile Summary */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            TR
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">{currentFaculty.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentFaculty.email}</p>
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

export function TutorHeader({ activeFacultyId }: { activeFacultyId?: string }) {
  const currentFaculty = mockFacultyMembers.find((f) => f.id === activeFacultyId) || mockFacultyMembers[0];
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs font-sans">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tutor Master Console</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">•</span>
            <span className="hidden sm:inline text-xs font-bold text-slate-700">
              Foreign Language Pedagogy & Live Studio
            </span>
          </div>
        </div>

        {/* Right: Quick Portals & Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/tutor/live-classes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Studio</span>
          </Link>

          <Link
            href="/academic-manager/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <span>Academic Portal</span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#0052CC] shrink-0 shadow-2xs">
                <Image
                  src={currentFaculty.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                  alt={currentFaculty.name}
                  fill
                  className="object-cover"
                />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 text-xs space-y-1">
                  <div className="p-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentFaculty.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentFaculty.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Switch to Student View
                  </Link>
                  <Link
                    href="/academic-manager/dashboard"
                    className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Switch to Academic Manager
                  </Link>
                  <Link
                    href="/super-admin/dashboard"
                    className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Switch to Super Admin
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
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
  );
}

export function TutorMobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const quickLinks = [
    { label: 'Dashboard', route: '/tutor/dashboard', icon: LayoutDashboard },
    { label: 'Live Classes', route: '/tutor/live-classes', icon: Video },
    { label: 'Batches', route: '/tutor/batches', icon: Layers },
    { label: 'Doubts', route: '/tutor/doubts', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-[64px] left-0 right-0 bg-[#0B2447] text-white rounded-t-2xl z-50 lg:hidden max-h-[80vh] flex flex-col shadow-2xl border-t border-[#1E3A8A] overflow-hidden font-sans">
            <div className="p-4 border-b border-[#1E3A8A] flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">All Tutor Modules</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {TUTOR_NAV_SECTIONS.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{sec.title}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {sec.items.map((item) => {
                      const Icon = iconMap[item.iconName] || LayoutDashboard;
                      return (
                        <Link
                          key={item.id}
                          href={item.route}
                          onClick={() => setDrawerOpen(false)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-xs font-semibold"
                        >
                          <Icon className="w-4 h-4 text-cyan-300 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B2447] border-t border-[#1E3A8A] z-40 lg:hidden shadow-2xl font-sans">
        <nav className="flex items-center justify-around px-1 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route;
            return (
              <Link
                key={item.route}
                href={item.route}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#0052CC] text-white scale-105 shadow-sm' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold truncate max-w-full mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 flex-1 min-w-0 cursor-pointer"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">More</span>
          </button>
        </nav>
      </div>
    </>
  );
}

export default function TutorAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <CollegeProvider>
        <ToastProvider>
          <TutorProvider>
            <TutorAppShellInner>{children}</TutorAppShellInner>
          </TutorProvider>
        </ToastProvider>
      </CollegeProvider>
    </AuthRbacProvider>
  );
}

function TutorAppShellInner({ children }: { children: React.ReactNode }) {
  const { activeFacultyId } = useTutor();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden relative">
      <TutorSidebar activeFacultyId={activeFacultyId} />
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen pb-24 lg:pb-0 lg:pl-72 overflow-x-hidden">
        <TutorHeader activeFacultyId={activeFacultyId} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">{children}</main>
      </div>
      <TutorMobileNav />
    </div>
  );
}
