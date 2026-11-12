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
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { currentStudent } from '@/mock/students';

// Concise, organized student navigation grouping
const studentNavGroups = [
  {
    groupTitle: 'Core Learning',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Curriculum', href: '/learning', icon: BookOpen },
      { name: 'Explore Courses', href: '/courses', icon: Compass, badge: 'ENROLL' },
      { name: 'Live Classes', href: '/live-classes', icon: Video, badge: 'LIVE' },
      { name: 'Class Recordings', href: '/recordings', icon: Film },
    ],
  },
  {
    groupTitle: 'Practice & Tasks',
    items: [
      { name: 'Assignments', href: '/assignments', icon: FileCheck2 },
      { name: 'Exams & Tests', href: '/exams', icon: GraduationCap },
      { name: 'Doubt Support', href: '/doubts', icon: MessageSquare },
    ],
  },
  {
    groupTitle: 'Records & Credentials',
    items: [
      { name: 'Results & Reports', href: '/results', icon: BarChart3 },
      { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
      { name: 'Certificate', href: '/certificate', icon: Award },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [student, setStudent] = useState({
    name: currentStudent.name,
    rollNo: currentStudent.rollNo,
    avatarUrl: currentStudent.avatarUrl,
    collegeName: currentStudent.collegeName,
    isSchool: false,
    courseName: currentStudent.enrolledCourse,
    batchName: currentStudent.batchName,
  });

  React.useEffect(() => {
    let hasLocalUser = false;
    try {
      const stored = localStorage.getItem('isml_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) {
          hasLocalUser = true;
          const isSchoolStudent = /school|siva|lion|matric/i.test(u.campusName || u.tenantName || '');
          setStudent((prev) => ({
            ...prev,
            name: u.name,
            rollNo: u.rollNo || u.studentId || prev.rollNo,
            collegeName: u.campusName || u.tenantName || prev.collegeName,
            isSchool: isSchoolStudent,
            courseName: u.courseName || prev.courseName,
            batchName: u.batchName || prev.batchName,
          }));
        }
      }
    } catch { }

    fetch('http://localhost:4000/api/portals/student/profile')
      .then((r) => r.json())
      .then((json) => {
        if (json.status === 'success' && json.data && !hasLocalUser) {
          const isSchoolStudent = /school|siva|lion|matric/i.test(json.data.collegeName || '');
          setStudent((prev) => ({
            ...prev,
            name: json.data.name || prev.name,
            rollNo: json.data.rollNo || prev.rollNo,
            avatarUrl: json.data.avatarUrl || prev.avatarUrl,
            collegeName: json.data.collegeName || prev.collegeName,
            isSchool: isSchoolStudent,
            courseName: json.data.courseName || prev.courseName,
            batchName: json.data.batchName || prev.batchName,
          }));
        }
      })
      .catch(() => { });
  }, []);

  // Hide sidebar on login page
  if (pathname === '/login') return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0B2447] text-white border-r border-[#1E3A8A] fixed left-0 top-0 bottom-0 z-40 shadow-xl overflow-hidden font-sans">
      {/* Brand Logo & Name Header */}
      <div className="px-4 py-3 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="ISML Logo" fill sizes="28px" className="object-contain" priority />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">ISML LMS</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider text-white ${
              student.isSchool ? 'bg-amber-600' : 'bg-[#0052CC]'
            }`}>
              {student.isSchool ? 'PUPIL' : 'STUDENT'}
            </span>
          </div>
        </Link>
      </div>

      {/* Dynamic Institution Badge (School vs College) */}
      <div className="px-3.5 py-2.5 bg-[#071730]/70 border-b border-[#1E3A8A] flex items-center gap-2.5 shrink-0">
        <div className={`p-1.5 rounded-lg shrink-0 ${
          student.isSchool ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-[#0052CC]/20 border border-cyan-500/30 text-cyan-400'
        }`}>
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1 truncate">
          <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider truncate">
            {student.isSchool ? 'Enrolled School' : 'Enrolled College'}
          </p>
          <p className="text-xs font-bold text-slate-100 truncate" title={student.collegeName}>
            {student.collegeName}
          </p>
        </div>
      </div>

      {/* Clean, Grouped Crisp Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
        {studentNavGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-0.5">
            <p className="px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {group.groupTitle}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#0052CC] text-white font-semibold shadow-md shadow-blue-900/50 border-l-4 border-cyan-400'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-rose-500 text-white rounded-full animate-live-pulse uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile Summary */}
      <div className="p-2.5 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2 shrink-0">
        <Link href="/profile" className="flex items-center gap-2.5 truncate group min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm border border-cyan-400/40">
            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="truncate min-w-0">
            <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">{student.name}</p>
            <p className="text-[10px] text-slate-400 truncate font-mono">{student.rollNo}</p>
          </div>
        </Link>
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSignOutModal(!showSignOutModal)}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* 🔴 COMPACT FLOATING SIGN OUT POPOVER */}
          {showSignOutModal && (
            <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-white text-slate-900 rounded-2xl border border-rose-200 shadow-2xl z-50 space-y-2 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-[#0B2447]">Sign Out?</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Are you sure you want to log out?</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
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
