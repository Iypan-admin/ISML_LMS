"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Video, 
  User, 
  ShieldCheck, 
  Menu, 
  X,
  LayoutDashboard,
  BookOpen,
  PlaySquare,
  Film,
  Headphones,
  FileCheck2,
  GraduationCap,
  BarChart3,
  CalendarCheck,
  Award,
  MessageSquare,
  Briefcase,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { currentStudent } from '@/mock/students';
import { mockNotifications } from '@/mock/notifications';

const mobileNavLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Learning', href: '/learning', icon: BookOpen },
  { name: 'Live Classes', href: '/live-classes', icon: Video, badge: 'LIVE' },
  { name: 'Pre-Recorded Sessions', href: '/pre-recorded', icon: PlaySquare },
  { name: 'Class Recordings Archive', href: '/recordings', icon: Film },
  { name: 'LSRW Practice Engine', href: '/lsrw', icon: Headphones },
  { name: 'Assignments & Homework', href: '/assignments', icon: FileCheck2 },
  { name: 'Exams & Assessments', href: '/exams', icon: GraduationCap },
  { name: 'Results & Performance', href: '/results', icon: BarChart3 },
  { name: 'Attendance Tracker', href: '/attendance', icon: CalendarCheck },
  { name: 'Digital Certificate', href: '/certificate', icon: Award },
  { name: 'Academic Doubt Support', href: '/doubts', icon: MessageSquare },
  { name: 'Career Portal', href: '/career', icon: Briefcase },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Student Profile & Settings', href: '/profile', icon: User },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  if (pathname === '/login') return null;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Brand Logo & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-11 h-11 shrink-0">
              <Image src="/logo.png" alt="ISML Logo" fill className="object-contain" />
            </div>
            <span className="font-extrabold text-sm text-[#0B2447] hidden xs:inline">ISML LMS</span>
          </div>

          {/* Global Search Bar */}
          <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 w-64 md:w-80 focus-within:ring-2 focus-within:ring-[#0052CC] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              id="header-search-input"
              name="search"
              type="text"
              placeholder="Search lessons, grammar rules, recordings..."
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Right: Live Badge, Notifications, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Live Class Indicator */}
          <Link
            href="/live-classes"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-all shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <Video className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">1 Class Live</span>
          </Link>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="relative p-2 text-slate-600 hover:text-[#0052CC] hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#0052CC] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* College Tag on Header */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>{currentStudent.collegeName}</span>
          </div>

          {/* User Avatar */}
          <Link href="/profile" className="flex items-center gap-2 pl-1 border-l border-slate-200 hover:opacity-90">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#0052CC] shrink-0 shadow-2xs">
              <Image src={currentStudent.avatarUrl} alt={currentStudent.name} fill className="object-cover" />
            </div>
          </Link>
        </div>
      </header>

      {/* 📱 SLIDE-OUT MOBILE SIDEBAR NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Sidebar Panel */}
          <div className="relative w-72 sm:w-80 bg-[#0B2447] text-white h-full flex flex-col justify-between shadow-2xl z-10 border-r border-[#1E3A8A] overflow-y-auto">
            {/* Sidebar Top Branding & Close */}
            <div className="p-4 border-b border-[#1E3A8A] flex items-center justify-between bg-[#071730]">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white p-1 border border-slate-300 shrink-0">
                  <Image src="/logo.png" alt="ISML Logo" fill className="object-contain" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white">ISML LMS Portal</h2>
                  <p className="text-[10px] text-cyan-300 font-mono">{currentStudent.collegeName}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Mini Profile Info */}
            <div className="p-4 bg-[#071730]/60 border-b border-[#1E3A8A] flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 shrink-0">
                <Image src={currentStudent.avatarUrl} alt={currentStudent.name} fill className="object-cover" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentStudent.name}</p>
                <p className="text-[10px] text-slate-300 font-mono truncate">{currentStudent.rollNo} • {currentStudent.subLevel}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
              {mobileNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#0052CC] text-white border border-cyan-400 shadow-sm' 
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-cyan-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Footer */}
            <div className="p-4 border-t border-[#1E3A8A] bg-[#071730] relative">
              <button
                onClick={() => setShowSignOutModal(!showSignOutModal)}
                className="w-full py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-500/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>

              {/* 🔴 COMPACT FLOATING SIGN OUT POPOVER */}
              {showSignOutModal && (
                <div className="absolute bottom-full left-4 right-4 mb-2 p-3.5 bg-white text-slate-900 rounded-2xl border border-rose-200 shadow-2xl z-50 space-y-2.5 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-extrabold text-[#0B2447]">Sign Out?</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Are you sure you want to log out?</p>
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
                      onClick={() => { setMobileMenuOpen(false); router.push('/login'); }}
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
        </div>
      )}
    </>
  );
}
