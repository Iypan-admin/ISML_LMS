// ============================================================================
// ISML COLLEGE LMS — PARENT APP SHELL & NAVIGATION FRAMEWORK
// Ultra-Premium Theme Matching Academic Manager & Super Admin
// Sleek Single-Line Header, Elegant Ward Switcher Modal/Dropdown & Pure Pro Typography
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Award,
  Video,
  MessageSquare,
  Receipt,
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  PhoneCall,
  Mail,
  School,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PARENT_NAV_SECTIONS } from '@/config/parentMenu';
import { ParentProvider, useParent } from '@/context/ParentContext';
import { ToastProvider } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Award,
  Video,
  MessageSquare,
  Receipt,
};

export function ParentSidebar() {
  const pathname = usePathname();
  const { parent, selectedChild, selectChild, allChildren } = useParent();
  const [showChildPicker, setShowChildPicker] = useState(false);

  // Accordion state
  const activeSectionTitle = React.useMemo(() => {
    for (const section of PARENT_NAV_SECTIONS) {
      const hasActive = section.items.some(
        (item) =>
          pathname === item.route ||
          (item.route !== '/parent/dashboard' && pathname.startsWith(item.route))
      );
      if (hasActive) return section.title;
    }
    return PARENT_NAV_SECTIONS[0]?.title || null;
  }, [pathname]);

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
      {/* ─── Brand Header ─── */}
      <div className="px-4 py-3.5 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <Link href="/parent/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7 shrink-0 transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="ISML Logo" fill sizes="28px" className="object-contain" priority />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950 tracking-wider uppercase shadow-xs">
              PARENT
            </span>
          </div>
        </Link>
      </div>

      {/* ─── ACTIVE MONITORED WARD CARD WITH CLEAN SWITCHER ─── */}
      <div className="p-3 bg-[#0a203f]/90 border-b border-[#1E3A8A] shrink-0 relative">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Monitored Ward</span>
          </span>
          <button
            onClick={() => setShowChildPicker(!showChildPicker)}
            className="text-[10px] text-slate-300 hover:text-white font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <span>Switch</span>
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          </button>
        </div>

        {/* Selected Child Showcase Card */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#0052CC]/40 to-[#0052CC]/10 border border-[#0052CC] text-white shadow-md flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-400 shrink-0 shadow-xs">
            <Image
              src={selectedChild.avatarUrl}
              alt={selectedChild.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="truncate flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-white truncate">{selectedChild.name}</p>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ring-2 ring-emerald-300/40" />
            </div>
            <p className="text-[10px] text-cyan-200 font-semibold truncate">
              {selectedChild.primaryCourse.courseCode} • {selectedChild.primaryCourse.levelBadge}
            </p>
            <p className="text-[10px] text-slate-300 truncate">
              {selectedChild.collegeName.split(',')[0]}
            </p>
          </div>
        </div>

        {/* Dropdown Popover to pick other children */}
        {showChildPicker && (
          <div className="absolute top-full left-3 right-3 mt-1.5 p-2 bg-[#071730] rounded-xl border border-cyan-500/40 shadow-2xl z-50 space-y-1.5 animate-in fade-in duration-150">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold px-1.5 py-0.5">
              Select Ward to Monitor:
            </p>
            {allChildren.map((c) => {
              const isSelected = c.id === selectedChild.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    selectChild(c.id);
                    setShowChildPicker(false);
                  }}
                  className={`p-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#0052CC] text-white font-bold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/30">
                      <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{c.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{c.primaryCourse.courseCode}</p>
                    </div>
                  </div>
                  {isSelected && <span className="text-[9px] font-bold text-cyan-300">Active</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Parent Profile Summary Strip ─── */}
      <div className="px-3.5 py-2.5 bg-[#071730]/60 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-emerald-400/60 shrink-0 shadow-xs">
            <Image
              src={parent.avatarUrl}
              alt={parent.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-100 truncate">{parent.name}</p>
            <p className="text-[10px] text-emerald-400 font-semibold truncate">
              Parent of {allChildren.length} Enrolled Learners
            </p>
          </div>
        </div>
      </div>

      {/* ─── Navigation Accordion ─── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
        {PARENT_NAV_SECTIONS.map((section) => {
          const isOpen = openSectionTitle === section.title;
          return (
            <div key={section.title} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  isOpen
                    ? 'text-cyan-300 bg-white/5'
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
                      (item.route !== '/parent/dashboard' && pathname.startsWith(item.route));
                    const Icon = iconMap[item.iconName] || LayoutDashboard;

                    return (
                      <Link
                        key={item.id}
                        href={item.route}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full tracking-wider">
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

      {/* ─── Bottom Support & Sign Out ─── */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2 shrink-0">
        <div className="truncate">
          <p className="text-[10px] text-slate-400">ISML Parent Helpline:</p>
          <p className="text-xs font-bold text-white tracking-wide">+91 44 2235 7000</p>
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

export function ParentHeader() {
  const { parent, selectedChild, selectChild, allChildren } = useParent();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs font-sans">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Role Scope Badge */}
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parent Oversight Portal</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            {selectedChild.collegeName}
          </span>
        </div>

        {/* Right: Quick Multi-Child Switcher Pills & Direct Tutor Connect */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Ward Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {allChildren.map((c) => {
              const isSelected = c.id === selectedChild.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectChild(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                    <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" />
                  </div>
                  <span>{c.name.split(' ')[0]}</span>
                  <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                    {c.primaryCourse.levelBadge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tutor Direct Connect Button */}
          <Link
            href="/parent/tutor-connect"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0052CC] text-xs font-bold hover:bg-blue-100 transition-all shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tutor Helpline</span>
          </Link>

          {/* Parent Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#0052CC] shrink-0 shadow-xs">
            <Image src={parent.avatarUrl} alt={parent.name} fill className="object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ParentAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <CollegeProvider>
        <ToastProvider>
          <ParentProvider>
            <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
              {/* Desktop Sidebar */}
              <ParentSidebar />

              {/* Main Content Area */}
              <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
                <ParentHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                  {children}
                </main>
              </div>
            </div>
          </ParentProvider>
        </ToastProvider>
      </CollegeProvider>
    </AuthRbacProvider>
  );
}
