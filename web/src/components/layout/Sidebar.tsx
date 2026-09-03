"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
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
  Bell, 
  User, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { currentStudent } from '@/mock/students';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Learning', href: '/learning', icon: BookOpen },
  { name: 'Live Classes', href: '/live-classes', icon: Video, badge: 'LIVE' },
  { name: 'Pre-Recorded', href: '/pre-recorded', icon: PlaySquare },
  { name: 'Class Recordings', href: '/recordings', icon: Film },
  { name: 'LSRW Practice', href: '/lsrw', icon: Headphones },
  { name: 'Assignments', href: '/assignments', icon: FileCheck2 },
  { name: 'Exams & Tests', href: '/exams', icon: GraduationCap },
  { name: 'Results & Analytics', href: '/results', icon: BarChart3 },
  { name: 'Attendance Tracker', href: '/attendance', icon: CalendarCheck },
  { name: 'Digital Certificate', href: '/certificate', icon: Award },
  { name: 'Doubt Support', href: '/doubts', icon: MessageSquare },
  { name: 'Career Portal', href: '/career', icon: Briefcase },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Student Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Hide sidebar on login page
  if (pathname === '/login') return null;

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#0B2447] text-white border-r border-[#1E3A8A] h-screen sticky top-0 z-40 transition-all duration-300 shadow-xl overflow-hidden shrink-0">
      {/* College Institution Badge */}
      <div className="px-4 py-3 bg-[#0052CC]/15 border-b border-[#1E3A8A] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Your Institution</p>
            <p className="text-xs font-bold text-slate-100 truncate">{currentStudent.collegeName}</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Student Portal Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#0052CC] text-white font-semibold shadow-md shadow-blue-900/50 border-l-4 border-cyan-400'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-full animate-live-pulse uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Summary */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2">
        <Link href="/profile" className="flex items-center gap-2.5 truncate group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shrink-0">
            <Image src={currentStudent.avatarUrl} alt={currentStudent.name} fill className="object-cover" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">{currentStudent.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentStudent.rollNo}</p>
          </div>
        </Link>
        <div className="relative">
          <button 
            onClick={() => setShowSignOutModal(!showSignOutModal)} 
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer" 
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* 🔴 COMPACT FLOATING SIGN OUT POPOVER */}
          {showSignOutModal && (
            <div className="absolute bottom-full right-0 mb-2 w-60 p-3.5 bg-white text-slate-900 rounded-2xl border border-rose-200 shadow-2xl z-50 space-y-2.5 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
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
