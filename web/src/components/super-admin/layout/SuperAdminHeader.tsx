// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN RESPONSIVE HEADER
// Modern Top Navigation with Institution / College Scoping ("Overall" default)
// Fully responsive across Mobile, Tablet, and Desktop viewports
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Building2,
  GraduationCap,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthRbacContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import { notificationStore } from '@/services/notificationStore';
import { soundNotification } from '@/lib/soundNotification';
import NotificationDrawer from './NotificationDrawer';

export default function SuperAdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    setUnreadCount(notificationStore.getUnreadCount());
    const unsub = notificationStore.subscribe(() => {
      setUnreadCount(notificationStore.getUnreadCount());
    });
    return () => unsub();
  }, []);
  const {
    selectedCollegeId,
    setSelectedCollegeId,
    institutions,
    filteredInstitutions,
    institutionCategory,
    setInstitutionCategory,
    isOverall,
    isSchoolMode,
  } = useCollege();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <header className="fixed lg:sticky top-0 left-0 right-0 lg:left-auto lg:right-auto z-50 bg-white/98 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-2xs font-sans transition-all w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* ─── Left: Brand Logo & College Scope ─── */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <Link
              href="/super-admin/dashboard"
              className="flex items-center gap-2 shrink-0 group focus:outline-none"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="ISML Logo" fill sizes="(max-width: 640px) 28px, 32px" className="object-contain" priority />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-extrabold text-xs sm:text-sm text-[#0B2447] tracking-tight whitespace-nowrap">
                  ISML LMS
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white tracking-wider">
                  ADMIN
                </span>
              </div>
            </Link>

            {/* College vs School Segmented Switcher & Campus Scope */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
              {/* Mode Toggle: College vs School */}
              <div className="flex items-center bg-white/90 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setInstitutionCategory('COLLEGE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${institutionCategory === 'COLLEGE'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  title="Switch to College Scope (Degrees, Semesters, Batches)"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>College</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInstitutionCategory('SCHOOL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${institutionCategory === 'SCHOOL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  title="Switch to School Scope (Grades, Sections, Terms)"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>School</span>
                </button>
              </div>

              {/* Scoped Institution Dropdown */}
              <div className="flex items-center pl-1.5 pr-2 py-0.5">
                <select
                  id="header-college-select-desktop"
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer pr-1 truncate max-w-[180px] lg:max-w-[240px]"
                  title={`Select ${isSchoolMode ? 'School' : 'College'} Scope`}
                >
                  <option value={OVERALL_COLLEGE_ID}>
                    {isSchoolMode ? '🏫 Overall (All Schools)' : '🏛️ Overall (All Colleges)'}
                  </option>
                  {filteredInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.type === 'SCHOOL' ? '🏫' : '🎓'} {inst.name}
                    </option>
                  ))}
                </select>
                {isOverall ? (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${isSchoolMode ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-[#0052CC] border border-blue-200'
                    }`}>
                    All
                  </span>
                ) : (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white uppercase tracking-wider shrink-0">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── Center: Desktop Global Search Bar ─── */}
          <div className="hidden lg:flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 w-64 xl:w-80 focus-within:ring-2 focus-within:ring-[#0052CC] focus-within:bg-white transition-all shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search students, faculty, courses, fees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* ─── Right: Mobile College Scoper, Notifications & Profile (No Search Icon on Mobile) ─── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile College/School Selector Pill */}
            <div className="flex md:hidden items-center bg-slate-100 border border-slate-200 rounded-xl px-1.5 py-1 text-xs shrink-0 max-w-[150px] gap-1">
              <button
                type="button"
                onClick={() => setInstitutionCategory(isSchoolMode ? 'COLLEGE' : 'SCHOOL')}
                className={`p-1 rounded-lg text-[10px] font-black shrink-0 ${isSchoolMode ? 'bg-emerald-600 text-white' : 'bg-[#0052CC] text-white'
                  }`}
                title={`Currently in ${isSchoolMode ? 'School' : 'College'} Mode. Tap to switch.`}
              >
                {isSchoolMode ? 'SCH' : 'COL'}
              </button>
              <select
                id="header-college-select-mobile"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="bg-transparent text-slate-900 font-bold text-[11px] outline-none cursor-pointer w-full truncate pr-0.5"
                title={`Select ${isSchoolMode ? 'School' : 'College'} Scope`}
              >
                <option value={OVERALL_COLLEGE_ID}>
                  {isSchoolMode ? '🏫 All Schools' : '🏛️ All Colleges'}
                </option>
                {filteredInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.type === 'SCHOOL' ? '🏫' : '🎓'} {inst.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications Bell */}
            <button
              type="button"
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-[#0052CC] hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {mounted && unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
              )}
            </button>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Account Settings"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B2447] to-[#0052CC] text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-[#0B2447] leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Super Admin</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                      <p className="font-bold text-[#0B2447] text-xs truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#0052CC]">
                        <ShieldCheck className="w-3 text-[#0052CC]" />
                        <span>Central Super Administrator</span>
                      </div>
                    </div>

                    <Link
                      href="/super-admin/institutions"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Institutions & Campuses</span>
                    </Link>

                    <Link
                      href="/super-admin/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>System Settings</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Right-Side Slide-Over Notification Drawer ─── */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />
    </>
  );
}
