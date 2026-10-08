// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN MOBILE NAVIGATION & DRAWER
// Mobile-first bottom bar + slide-up drawer matching Student Portal UX
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GitFork,
  Menu,
  X,
  Building2,
  Shield,
  KeyRound,
  Network,
  GraduationCap,
  Layers,
  CalendarRange,
  BookMarked,
  FolderTree,
  ListTree,
  BookOpen,
  Files,
  Video,
  FileCheck2,
  CalendarDays,
  Clock,
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  Bell,
  ScrollText,
  Activity,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  BadgeDollarSign,
  Receipt,
  Coins,
  Percent,
  CreditCard,
  RotateCcw,
  FileCheck,
  BarChart2,
  History,
} from 'lucide-react';
import { useRbac, useAuth } from '@/context/AuthRbacContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CheckSquare,
  Building2,
  Users,
  Shield,
  KeyRound,
  GitFork,
  Network,
  GraduationCap,
  Layers,
  CalendarRange,
  BookMarked,
  FolderTree,
  ListTree,
  BookOpen,
  Files,
  Video,
  FileCheck2,
  CalendarDays,
  Clock,
  BadgeDollarSign,
  Receipt,
  Coins,
  Percent,
  CreditCard,
  RotateCcw,
  FileCheck,
  BarChart2,
  History,
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  Bell,
  ScrollText,
  Activity,
  Settings,
};

export default function SuperAdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { accessibleMenuGroups } = useRbac();
  const { currentUser, activeRole } = useAuth();
  const { selectedCollegeId, setSelectedCollegeId, institutions, isOverall } = useCollege();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Determine which group contains the active route initially
  const activeGroupId = useMemo(() => {
    for (const group of accessibleMenuGroups) {
      const hasActive = group.items.some(
        (item) =>
          pathname === item.route ||
          (item.route !== '/super-admin/dashboard' &&
            item.route !== '/super-admin/academic' &&
            pathname.startsWith(item.route))
      );
      if (hasActive) return group.id;
    }
    return accessibleMenuGroups[0]?.id || null;
  }, [accessibleMenuGroups, pathname]);

  // Only one group can be open at a time (accordion behavior)
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroupId(activeGroupId);
    }
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    // If clicking open group, close it; otherwise open it and close any previously open group
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  // Auto close drawer when page changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const quickLinks = [
    { label: 'Dashboard', route: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Colleges', route: '/super-admin/institutions', icon: Building2 },
    { label: 'Academic', route: '/super-admin/academic', icon: GitFork },
    { label: 'Users', route: '/super-admin/users', icon: Users },
  ];

  return (
    <>
      {/* ─── Slide-Up Full Menu Drawer (Mobile & Tablet) ─── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed bottom-[64px] left-0 right-0 bg-[#0B2447] text-white rounded-t-2xl z-50 lg:hidden max-h-[75vh] flex flex-col shadow-2xl border-t border-[#1E3A8A] overflow-hidden animate-in slide-in-from-bottom duration-200 font-sans">
            {/* Drawer Top Header */}
            <div className="p-3.5 border-b border-[#1E3A8A] flex items-center justify-between bg-[#071730] rounded-t-2xl shrink-0">
              <div className="flex items-center gap-2 truncate">
                <div className="p-1.5 rounded-lg bg-[#0052CC]/25 text-cyan-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-cyan-300 font-semibold truncate">Central Super Admin</p>
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
            <div className="p-3 bg-[#0052CC]/15 border-b border-[#1E3A8A]">
              <label className="block text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Active College Scope:</span>
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full bg-[#071730] border border-cyan-500/40 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
              >
                <option value={OVERALL_COLLEGE_ID}>🏛️ Overall (All Colleges Combined)</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categorized Menu Groups inside Drawer (Clean 1-column list for perfect mobile fit) */}
            <div className="p-3 overflow-y-auto space-y-2">
              {accessibleMenuGroups.map((group) => {
                const isOpen = openGroupId === group.id;
                return (
                  <div key={group.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                        isOpen
                          ? 'text-cyan-300 bg-white/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{group.title}</span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="space-y-1 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {group.items.map((item) => {
                          const Icon = iconMap[item.iconName] || LayoutDashboard;
                          const isActive =
                            pathname === item.route ||
                            (item.route !== '/super-admin/dashboard' &&
                              item.route !== '/super-admin/academic' &&
                              pathname.startsWith(item.route));
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
                                <Icon
                                  className={`w-4 h-4 shrink-0 ${
                                    isActive ? 'text-cyan-300' : 'text-slate-400'
                                  }`}
                                />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full tracking-wider shrink-0 ml-2">
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

              {/* Sign Out Option in Drawer */}
              <div className="pt-2 border-t border-[#1E3A8A]">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/login');
                  }}
                  className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Super Admin</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Sticky Mobile Bottom Navigation Bar (5 tabs, perfect fit with safe-area) ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B2447] border-t border-[#1E3A8A] z-40 lg:hidden shadow-2xl font-sans">
        <nav className="flex items-center justify-around px-1 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.route ||
              (item.route !== '/super-admin/dashboard' &&
                item.route !== '/super-admin/academic' &&
                pathname.startsWith(item.route));
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
                    isActive ? 'bg-[#0052CC]/50 text-cyan-300 scale-105' : ''
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
                drawerOpen ? 'bg-cyan-500/20 text-cyan-300 scale-105' : ''
              }`}
            >
              {drawerOpen ? <X className="w-5 h-5 text-cyan-300" /> : <Menu className="w-5 h-5" />}
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
