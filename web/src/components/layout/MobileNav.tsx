"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  Headphones, 
  Menu, 
  X, 
  PlaySquare, 
  Film, 
  FileCheck2, 
  GraduationCap, 
  BarChart3, 
  CalendarCheck, 
  Award, 
  MessageSquare, 
  Briefcase, 
  Bell, 
  User,
  ShieldCheck,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { currentStudent } from '@/mock/students';

const primaryMobileItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Learning', href: '/learning', icon: BookOpen },
  { name: 'Live', href: '/live-classes', icon: Video, badge: 'LIVE' },
  { name: 'LSRW', href: '/lsrw', icon: Headphones },
];

const secondaryMobileItems = [
  { name: 'Pre-Recorded Sessions', href: '/pre-recorded', icon: PlaySquare },
  { name: 'Class Recordings Archive', href: '/recordings', icon: Film },
  { name: 'Assignments & Homework', href: '/assignments', icon: FileCheck2 },
  { name: 'Exams & Assessments', href: '/exams', icon: GraduationCap },
  { name: 'Results & Performance', href: '/results', icon: BarChart3 },
  { name: 'Attendance Tracker', href: '/attendance', icon: CalendarCheck },
  { name: 'Digital Certificate', href: '/certificate', icon: Award },
  { name: 'Academic Doubt Chat', href: '/doubts', icon: MessageSquare },
  { name: 'Career Portal', href: '/career', icon: Briefcase },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Student Profile & Settings', href: '/profile', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSignOutPopover, setShowSignOutPopover] = useState(false);

  // Auto-close drawer whenever page navigation occurs
  useEffect(() => {
    setDrawerOpen(false);
    setShowSignOutPopover(false);
  }, [pathname]);

  if (pathname === '/login') return null;

  return (
    <>
      {/* Mobile Drawer Overlay & Content */}
      {drawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-Up More Menu Drawer */}
          <div 
            className="fixed bottom-16 left-0 right-0 bg-[#0B2447] text-white rounded-t-2xl z-50 lg:hidden max-h-[75vh] flex flex-col shadow-2xl border-t border-[#1E3A8A] overflow-hidden"
          >
            <div className="p-4 border-b border-[#1E3A8A] flex items-center justify-between bg-[#071730] rounded-t-2xl shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs font-bold text-white">{currentStudent.collegeName}</p>
                  <p className="text-[10px] text-slate-300">{currentStudent.enrolledCourse}</p>
                </div>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5">
              {secondaryMobileItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium border ${
                      isActive 
                        ? 'bg-[#0052CC] border-cyan-400 text-white font-bold' 
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-cyan-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Drawer Footer with Sign Out Button & Popover */}
            <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] shrink-0 relative">
              <button
                onClick={() => setShowSignOutPopover(!showSignOutPopover)}
                className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-500/30 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Portal</span>
              </button>

              {/* 🔴 COMPACT FLOATING SIGN OUT POPOVER */}
              {showSignOutPopover && (
                <div className="absolute bottom-full left-3 right-3 mb-2 p-3.5 bg-white text-slate-900 rounded-2xl border border-rose-200 shadow-2xl z-50 space-y-2.5 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
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
                      onClick={() => setShowSignOutPopover(false)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setDrawerOpen(false); router.push('/login'); }}
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
        </>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B2447] border-t border-[#1E3A8A] z-40 lg:hidden flex items-center justify-around px-2 py-2 shadow-2xl">
        {primaryMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all relative ${
                isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-300 scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
              {item.badge && (
                <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </Link>
          );
        })}

        {/* More Drawer Trigger Button */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all cursor-pointer ${
            drawerOpen ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {drawerOpen ? <X className="w-5 h-5 text-cyan-300" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] mt-0.5">{drawerOpen ? 'Close' : 'More'}</span>
        </button>
      </div>
    </>
  );
}
