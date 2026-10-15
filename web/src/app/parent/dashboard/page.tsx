// ============================================================================
// ISML COLLEGE LMS — PARENT OVERSIGHT DASHBOARD (/parent/dashboard)
// Multi-Child Monitoring Switchboard, Real-Time Attendance Gauge,
// DELF/CEFR Marks Card, Live Class Access & Tutor Direct Connect
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Video,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  PhoneCall,
  Mail,
  ShieldCheck,
  Receipt,
  Sparkles,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  ArrowUpRight,
  CheckSquare,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';

export default function ParentDashboardPage() {
  const { parent, selectedChild, selectChild, allChildren } = useParent();

  const isAttendanceSafe = selectedChild.attendance.percentage >= 75;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'Ward Academic Dashboard' },
          ]}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Active Session:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autumn Term 2026</span>
          </span>
        </div>
      </div>

      {/* MULTI-CHILD SELECTION BANNER (TOP LEVEL SWITCHBOARD) */}
      <div className="bg-gradient-to-r from-[#0B2447] via-[#0D3268] to-[#0052CC] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-cyan-300 text-xs font-extrabold mb-2 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Ward Oversight Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome, {parent.name}
            </h1>
            <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
              Real-time academic monitoring console. Click on any ward below to instantly inspect live attendance, CEFR marks, live lectures, and teacher evaluations.
            </p>
          </div>

          {/* Child Selector Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {allChildren.map((child) => {
              const isSelected = child.id === selectedChild.id;
              return (
                <div
                  key={child.id}
                  onClick={() => selectChild(child.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 min-w-[200px] ${
                    isSelected
                      ? 'bg-white text-slate-900 border-cyan-400 shadow-lg scale-[1.02]'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shrink-0 shadow-xs">
                    <Image src={child.avatarUrl} alt={child.name} fill className="object-cover" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-black truncate ${isSelected ? 'text-[#0B2447]' : 'text-white'}`}>
                        {child.name}
                      </p>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className={`text-[10px] font-semibold truncate ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>
                      {child.relationship} • {child.primaryCourse.courseCode}
                    </p>
                    <p className={`text-[10px] font-extrabold ${
                      child.attendance.percentage >= 75
                        ? (isSelected ? 'text-emerald-700' : 'text-emerald-300')
                        : 'text-rose-400'
                    }`}>
                      {child.attendance.percentage}% Attended
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE WARD IDENTITY BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#0052CC] shrink-0 shadow-xs">
            <Image src={selectedChild.avatarUrl} alt={selectedChild.name} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-[#0B2447]">{selectedChild.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] text-[10px] font-black border border-blue-200">
                {selectedChild.rollNo}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                {selectedChild.primaryCourse.levelBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedChild.collegeName} • {selectedChild.department}
            </p>
          </div>
        </div>

        {/* Quick Duty Tutor Info */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assigned Lead Tutor</p>
            <p className="text-xs font-black text-[#0B2447]">{selectedChild.primaryCourse.leadTutorName}</p>
          </div>
          <Link
            href="/parent/tutor-connect"
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 transition-colors"
            title="Message Tutor"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KEY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cumulative Attendance</span>
            <div className={`p-2 rounded-xl ${isAttendanceSafe ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0B2447]">{selectedChild.attendance.percentage}%</span>
              <span className="text-xs text-slate-500 font-medium">({selectedChild.attendance.presentDays}/{selectedChild.attendance.totalWorkingDays} Days)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isAttendanceSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${selectedChild.attendance.percentage}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className={isAttendanceSafe ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
              {isAttendanceSafe ? '✓ NAAC Benchmark Met (>75%)' : '⚠ Critical Deficit (<75%)'}
            </span>
            <Link href="/parent/attendance" className="text-[#0052CC] font-bold hover:underline">
              Ledger →
            </Link>
          </div>
        </div>

        {/* Card 2: CEFR Language Progress */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Syllabus & Modules</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0052CC]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0B2447]">{selectedChild.primaryCourse.progressPercent}%</span>
              <span className="text-xs text-slate-500 font-medium">
                ({selectedChild.primaryCourse.completedModules}/{selectedChild.primaryCourse.totalModules} Units)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0052CC] transition-all"
                style={{ width: `${selectedChild.primaryCourse.progressPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium truncate">
              {selectedChild.primaryCourse.courseCode}
            </span>
            <Link href="/parent/courses" className="text-[#0052CC] font-bold hover:underline">
              Curriculum →
            </Link>
          </div>
        </div>

        {/* Card 3: LSRW Radar Average */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LSRW Overall Score</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0B2447]">{selectedChild.lsrwRadar.overall}%</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Grade A
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              L: {selectedChild.lsrwRadar.listening}% • S: {selectedChild.lsrwRadar.speaking}% • R: {selectedChild.lsrwRadar.reading}% • W: {selectedChild.lsrwRadar.writing}%
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold">DELF Benchmark Pass</span>
            <Link href="/parent/grades" className="text-[#0052CC] font-bold hover:underline">
              Report Card →
            </Link>
          </div>
        </div>

        {/* Card 4: Tuition Fee Ledger */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Semester Tuition Fee</span>
            <div className={`p-2 rounded-xl ${selectedChild.feeStatus.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0B2447]">
                ₹{selectedChild.feeStatus.paidAmount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                / ₹{selectedChild.feeStatus.totalFee.toLocaleString()}
              </span>
            </div>
            <span className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
              selectedChild.feeStatus.status === 'PAID'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {selectedChild.feeStatus.status === 'PAID' ? 'Full Cleared ✓' : `Pending ₹${selectedChild.feeStatus.pendingAmount.toLocaleString()}`}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 truncate">{selectedChild.feeStatus.dueDate}</span>
            <Link href="/parent/fees" className="text-[#0052CC] font-bold hover:underline">
              Receipts →
            </Link>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: LEFT: UPCOMING LIVE CLASSES & ATTENDANCE LOG, RIGHT: LSRW RADAR & RECENT GRADES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Spans): Today & Upcoming Live Sessions + Recent Attendance Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Live Classes Today */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0B2447]">Live Webinars & Classes</h3>
                  <p className="text-[11px] text-slate-500">Scheduled interactive live lectures for {selectedChild.name}</p>
                </div>
              </div>
              <Link
                href="/parent/live-classes"
                className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {selectedChild.upcomingLiveClasses.map((live) => (
                <div
                  key={live.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0052CC]">
                        {live.courseCode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {live.scheduledTime}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#0B2447]">{live.topic}</h4>
                    <p className="text-[11px] text-slate-500">
                      Instructor: <strong className="text-slate-800">{live.tutorName}</strong> ({live.tutorRole})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#0052CC] border border-blue-200">
                      Scheduled {live.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Live Attendance Check-In History */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0052CC]">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0B2447]">Recent Roll Call & Attendance Logs</h3>
                  <p className="text-[11px] text-slate-500">Official biometric & live webinar attendance timestamps</p>
                </div>
              </div>
              <Link
                href="/parent/attendance"
                className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
              >
                <span>View Full Month</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {selectedChild.attendance.recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#0B2447]">{log.date}</span>
                      <span className="text-[11px] text-slate-400">• Check-in: {log.timeIn}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 truncate">{log.sessionTitle}</p>
                    {log.remarks && (
                      <p className="text-[10px] text-slate-500 truncate italic">"{log.remarks}"</p>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                      log.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'ABSENT'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Span): LSRW Language Proficiency Radar & Recent Evaluation Scorecard */}
        <div className="space-y-6">
          {/* LSRW Skill Breakdown Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0B2447]">LSRW Skill Proficiency</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-100 text-cyan-800">
                /100 Scale
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Listening Comprehension', score: selectedChild.lsrwRadar.listening, color: 'bg-blue-600' },
                { label: 'Speaking & Oral Viva', score: selectedChild.lsrwRadar.speaking, color: 'bg-emerald-600' },
                { label: 'Reading & Text Analysis', score: selectedChild.lsrwRadar.reading, color: 'bg-purple-600' },
                { label: 'Writing & Sentence Accord', score: selectedChild.lsrwRadar.writing, color: 'bg-amber-600' },
              ].map((skill) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{skill.label}</span>
                    <span className="font-black text-[#0B2447]">{skill.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${skill.color} transition-all`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#0052CC] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedagogical Assessment</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedChild.name} demonstrates high oral and auditory fluency. Recommended to participate in the weekly Sunday live dialogue drills.
              </p>
            </div>
          </div>

          {/* Recent Exam Gradebook Snapshot */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0B2447]">Latest Marks & Feedback</h3>
              <Link href="/parent/grades" className="text-xs font-bold text-[#0052CC] hover:underline">
                All Marks →
              </Link>
            </div>

            <div className="space-y-3">
              {selectedChild.gradebook.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-black text-[#0B2447] line-clamp-1">{item.assessmentTitle}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0">
                      {item.grade} ({item.marksObtained}/{item.maxMarks})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic line-clamp-2">
                    "{item.tutorFeedback}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Support / Tutor Helpline Card */}
          <div className="bg-gradient-to-br from-[#071730] to-[#0B2447] text-white rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-black">Parent-Teacher Helpline</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Have concerns regarding your ward's attendance or exam scores? Connect with Lead Tutor {selectedChild.primaryCourse.leadTutorName}.
            </p>
            <div className="pt-1">
              <Link
                href="/parent/tutor-connect"
                className="w-full py-2 bg-[#0052CC] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Lead Tutor</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
