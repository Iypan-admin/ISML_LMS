// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN SIDEBAR
// Deep Navy Theme matching Student Portal, RBAC Permission-Gated Menus
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
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
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  Bell,
  ScrollText,
  Activity,
  Settings,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  UserCog,
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
import { useCollege } from '@/context/CollegeContext';

// Icon registry mapping string iconNames from menu registry
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

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { accessibleMenuGroups } = useRbac();
  const { currentUser, activeRole } = useAuth();
  const { selectedCollege, isOverall } = useCollege();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

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
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => activeGroupId);

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroupId(activeGroupId);
    }
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    // If clicking open group, close it; otherwise open it and close any previously open group
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#0B2447] text-white border-r border-[#1E3A8A] fixed left-0 top-0 bottom-0 z-40 shadow-xl overflow-hidden font-sans">
      {/* Brand Logo & Name Header */}
      <div className="px-4 py-3 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <Link href="/super-admin/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="ISML Logo" fill className="object-contain" priority />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white tracking-wider">
              ADMIN
            </span>
          </div>
        </Link>
      </div>

      {/* College Institution Context Header */}
      <div className="px-4 py-2.5 bg-[#071730]/60 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-[#0052CC]/20 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span>{isOverall ? 'Global Scope' : 'Campus Scope'}</span>
            </p>
            <p className="text-xs font-bold text-slate-100 truncate" title={isOverall ? 'Overall (All Colleges)' : selectedCollege?.name}>
              {isOverall ? 'Overall (All Colleges)' : selectedCollege?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-3 py-2 bg-[#0052CC]/15 border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <span className="truncate">Central <strong className="text-white">Super Administrator</strong></span>
        </div>
        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
          AUTHORIZED
        </span>
      </div>

      {/* Categorized Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
        {accessibleMenuGroups.map((group) => {
          const isOpen = openGroupId === group.id;
          return (
            <div key={group.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  isOpen
                    ? 'text-cyan-300 bg-white/5 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{group.title}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.route ||
                      (item.route !== '/super-admin/dashboard' &&
                        item.route !== '/super-admin/academic' &&
                        pathname.startsWith(item.route));

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

      {/* Bottom Profile & Sign Out Bar */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 bg-blue-900 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSignOutModal(!showSignOutModal)}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {showSignOutModal && (
            <div className="absolute bottom-full right-0 mb-2 w-60 p-3.5 bg-white text-slate-900 rounded-2xl border border-rose-200 shadow-2xl z-50 space-y-2.5 font-sans animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-[#0B2447]">Sign Out?</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Exit Super Admin session?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
