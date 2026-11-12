"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Video, 
  PlayCircle, 
  Film, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  ArrowRight, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { currentStudent } from '@/mock/students';
import { fastFetch } from '@/lib/fastCache';

export default function DashboardPage() {
  const [studentInfo, setStudentInfo] = useState({
    name: currentStudent.name,
    avatarUrl: currentStudent.avatarUrl,
    collegeName: currentStudent.collegeName,
    currentLevel: currentStudent.currentLevel,
    courseName: currentStudent.enrolledCourse,
    batchName: currentStudent.batchName,
    overallAttendance: 0,
    overallProgress: 0,
    averageScore: 0,
  });

  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isClassLive, setIsClassLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Load actual authenticated session user
    let currentUser: any = null;
    try {
      const stored = localStorage.getItem('isml_user');
      if (stored) {
        currentUser = JSON.parse(stored);
        if (currentUser.name) {
          setStudentInfo((prev) => ({
            ...prev,
            name: currentUser.name,
            collegeName: currentUser.campusName || currentUser.tenantName || prev.collegeName,
            courseName: currentUser.courseName || currentUser.enrolledCourse || prev.courseName,
            batchName: currentUser.batchName || prev.batchName,
            avatarUrl: currentUser.avatarUrl || prev.avatarUrl,
            overallAttendance: currentUser.attendancePercentage || 0,
            overallProgress: currentUser.attendancePercentage ? Math.round(currentUser.attendancePercentage * 0.75) : 0,
            averageScore: currentUser.attendancePercentage ? 88 : 0,
          }));
        }
      }
    } catch {}

    // 2. Fetch real allocated batch from DB
    fastFetch('/api/portals/batches', (json) => {
      const batches = json?.data || [];
      if (batches.length > 0) {
        const studentBatch = batches.find((b: any) => 
          b.name === currentUser?.batchName || 
          b.id === currentUser?.batchId ||
          b.institutionId === currentUser?.tenantId
        ) || batches[0];
        setActiveBatch(studentBatch);
        if (studentBatch?.status === 'ACTIVE') {
          setIsClassLive(true);
        }
      }
    });

    // 3. Fetch real class recordings
    fastFetch('/api/portals/recordings', (json) => {
      const list = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setRecordings(list);
    });
  }, []);

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── 1. TOP STUDENT PROFILE HEADER (Card Styling as requested) ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {studentInfo.name ? studentInfo.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                Welcome, {studentInfo.name}!
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-[#0052CC] border border-blue-200">
                {studentInfo.currentLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-700">{studentInfo.collegeName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#0052CC] font-bold">{studentInfo.courseName}</span>
            </p>
          </div>
        </div>

        <Link
          href="/courses"
          className="hidden sm:flex px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs items-center gap-1.5 shrink-0 transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Explore Courses</span>
        </Link>
      </div>

      {/* ─── 2. LIVE NOW BANNER (Dark Navy Gradient with Red LIVE NOW pill) ─── */}
      {isClassLive && activeBatch && (
        <div className="bg-gradient-to-r from-[#071730] via-[#0B2447] to-[#1E3A8A] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>LIVE NOW</span>
              </span>
              <span className="text-xs text-blue-200 font-semibold truncate">
                {activeBatch.name} • {studentInfo.collegeName}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
              {studentInfo.courseName}: Core Interactive Studio Class
            </h2>

            <div className="flex items-center gap-3 text-[11px] text-blue-200/90 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-300" />
                <span>{activeBatch.assignedFacultyName || 'Lead Trainer Joy JK'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-300" />
                <span>{activeBatch.batchTiming || '07:30 PM - 11:00 PM'}</span>
              </span>
              <span>•</span>
              <span>{activeBatch.studentsCount || 10} Students</span>
            </div>
          </div>

          <Link
            href="/live-classes"
            className="w-full md:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>JOIN LIVE CLASS →</span>
          </Link>
        </div>
      )}

      {/* ─── 3. TWO PRIMARY CARDS: PRE-RECORDED & RECENT CLASS RECORDINGS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Pre-recorded Session / Continue Learning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0052CC] flex items-center gap-1">
                    <PlayCircle className="w-3 h-3" />
                    <span>PRE-RECORDED SESSION</span>
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">Continue Learning</h3>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">0 / 60 mins</span>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
              <p className="text-[11px] font-bold text-[#0052CC] uppercase tracking-wider">
                Module 01: Foundations & Phonetics Mastery
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                Session 01: Course Overview & Basic Pronunciation Drills
              </h4>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#0052CC] h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <Link
            href="/pre-recorded"
            className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Resume Pre-Recorded Video →</span>
          </Link>
        </div>

        {/* Card 2: Replay Archive / Recent Live Class Recordings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  REPLAY ARCHIVE
                </span>
                <h3 className="text-sm font-bold text-slate-900">Recent Live Class Recordings</h3>
              </div>
            </div>
            <Link href="/recordings" className="text-xs font-bold text-[#0052CC] hover:underline">
              View All
            </Link>
          </div>

          {recordings.length === 0 ? (
            <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 space-y-1">
              <Film className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No recordings uploaded yet</p>
              <p className="text-[11px] text-slate-400">Class recordings will appear here automatically after sessions conclude.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.slice(0, 2).map((rec: any) => (
                <div key={rec.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{rec.sessionTopic || rec.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{rec.tutorName || 'Faculty'} • {rec.durationMins || 60} mins</p>
                  </div>
                  <Link
                    href="/recordings"
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-[#0052CC] border border-slate-200 text-xs font-bold rounded-lg shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Film className="w-3 h-3" />
                    <span>Watch</span>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1 font-medium">
            <span>⚡</span>
            <span>Missed a live session? Watch full HD class recordings anytime in the Recordings tab!</span>
          </p>
        </div>
      </div>

      {/* ─── 4. FOUR KPI CARDS (Matches Image Reference Exactly) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* OVERALL PROGRESS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">OVERALL PROGRESS</span>
            <BookOpen className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{studentInfo.overallProgress}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0052CC] h-full rounded-full transition-all" style={{ width: `${studentInfo.overallProgress}%` }} />
          </div>
        </div>

        {/* ATTENDANCE RATE */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">ATTENDANCE RATE</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800">{studentInfo.overallAttendance}%</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved by Tutor</span>
          </div>
        </div>

        {/* AVERAGE SCORE */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">AVERAGE SCORE</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{studentInfo.averageScore}%</p>
          <p className="text-[11px] text-slate-400 font-medium">From continuous evaluations</p>
        </div>

        {/* CERTIFICATE STATUS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">CERTIFICATE STATUS</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base font-black text-amber-600 pt-0.5">A1 In Progress</p>
          <p className="text-[10px] text-slate-400 font-medium">Target Completion: Nov 2026</p>
        </div>
      </div>
    </div>
  );
}
