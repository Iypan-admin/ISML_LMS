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
import NotificationDrawer from './NotificationDrawer';

export default function SuperAdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { selectedCollegeId, setSelectedCollegeId, institutions, isOverall } = useCollege();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 shadow-2xs font-sans transition-all">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* ─── Left: Brand Logo & College Scope ─── */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <Link
              href="/super-admin/dashboard"
              className="flex items-center gap-2 shrink-0 group focus:outline-none"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="ISML Logo" fill className="object-contain" priority />
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

            {/* Desktop / Tablet College Scope Selector */}
            <div className="hidden md:flex items-center bg-slate-100 hover:bg-slate-100/90 border border-slate-200 rounded-xl px-2.5 py-1 text-xs transition-colors shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#0052CC] mr-1.5 shrink-0" />
              <select
                id="header-college-select-desktop"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer pr-1 truncate max-w-[220px] lg:max-w-[280px]"
                title="Select College Scope"
              >
                <option value={OVERALL_COLLEGE_ID}>🏛️ Overall (All Colleges)</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name}
                  </option>
                ))}
              </select>
              {isOverall ? (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-[#0052CC] border border-blue-200 uppercase tracking-wider shrink-0">
                  Overall
                </span>
              ) : (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider shrink-0">
                  Filtered
                </span>
              )}
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
            {/* Mobile College Selector Pill */}
            <div className="flex md:hidden items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-2 py-1 text-xs shrink-0 max-w-[125px]">
              <Building2 className="w-3.5 h-3.5 text-[#0052CC] mr-1 shrink-0" />
              <select
                id="header-college-select-mobile"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="bg-transparent text-slate-900 font-bold text-[11px] outline-none cursor-pointer w-full truncate pr-0.5"
                title="Select College Scope"
              >
                <option value={OVERALL_COLLEGE_ID}>🏛️ Overall</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.code}
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
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
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
