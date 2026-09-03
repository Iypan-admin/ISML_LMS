"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Video, 
  PlayCircle, 
  Film, 
  BookOpen, 
  Headphones, 
  Mic, 
  FileText, 
  PenTool, 
  FileCheck2, 
  GraduationCap, 
  CalendarCheck, 
  Award, 
  MessageSquare, 
  ArrowRight,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { currentStudent } from '@/mock/students';
import { mockLiveClasses } from '@/mock/liveClasses';
import { mockPreRecordedSessions } from '@/mock/preRecorded';
import { mockLiveRecordings } from '@/mock/recordings';

export default function DashboardPage() {
  const liveNow = mockLiveClasses.find(c => c.status === 'LIVE_NOW');
  const inProgressPreRecorded = mockPreRecordedSessions.find(s => s.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 pb-8">
      {/* Top Welcome & Enrolled College Header */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#0052CC] shrink-0 shadow-2xs">
            <Image src={currentStudent.avatarUrl} alt={currentStudent.name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h1 className="text-sm sm:text-base font-bold text-[#0B2447] truncate">
                Welcome, {currentStudent.name}!
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200 shrink-0">
                {currentStudent.currentLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              <span className="font-semibold text-slate-700">{currentStudent.collegeName}</span>
              <span className="mx-1">•</span>
              <span>{currentStudent.enrolledCourse}</span>
            </p>
          </div>
        </div>

        <Link
          href="/learning"
          className="hidden xs:flex px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs items-center gap-1.5 shrink-0 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>My Learning</span>
        </Link>
      </div>

      {/* 🔴 1. PRIORITY SLIM BANNER BAR: LIVE CLASS NOW */}
      {liveNow && (
        <div className="bg-gradient-to-r from-[#0B2447] via-[#071730] to-[#1E3A8A] text-white p-3.5 sm:p-4 rounded-xl shadow-md border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans max-w-full overflow-hidden">
          <div className="space-y-1.5 min-w-0 max-w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] sm:text-xs font-extrabold rounded-full flex items-center gap-1.5 shrink-0 uppercase tracking-wider animate-live-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE NOW
              </span>
              <span className="text-[11px] text-cyan-300 font-semibold truncate">
                {liveNow.batchName}
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-extrabold text-white leading-snug break-words">
              {liveNow.topic}
            </h2>

            <p className="text-[11px] text-slate-300 flex items-center gap-x-2 gap-y-1 flex-wrap">
              <span className="text-cyan-300 font-semibold">{liveNow.tutorName}</span>
              <span>•</span>
              <span>{liveNow.timeSlot}</span>
              <span>•</span>
              <span className="text-cyan-300 font-mono">{liveNow.attendeesCount} Students</span>
            </p>
          </div>

          <Link
            href="/live-classes"
            className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-lg shadow-md flex items-center justify-center gap-1.5 shrink-0 transition-transform active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>JOIN LIVE CLASS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 2 & 3. TWO-COLUMN: Continue Pre-Recorded + Recent Recordings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ▶️ 2. Continue Pre-Recorded Session */}
        {inProgressPreRecorded && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-blue-50 text-[#0052CC]">
                    <PlayCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#0052CC] uppercase tracking-wider">
                      ▶ Pre-Recorded Session
                    </span>
                    <h3 className="text-sm font-bold text-[#0B2447]">Continue Learning</h3>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {inProgressPreRecorded.watchedMins} / {inProgressPreRecorded.durationMins} mins
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <p className="text-xs font-mono text-[#0052CC] font-semibold">{inProgressPreRecorded.moduleName}</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">{inProgressPreRecorded.sessionTitle}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0052CC] h-full rounded-full transition-all"
                    style={{ width: `${(inProgressPreRecorded.watchedMins / inProgressPreRecorded.durationMins) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              href="/pre-recorded"
              className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Resume Pre-Recorded Video</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 🎥 3. Recent Live Class Recordings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Film className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">
                    🎥 Replay Archive
                  </span>
                  <h3 className="text-sm font-bold text-[#0B2447]">Recent Live Class Recordings</h3>
                </div>
              </div>
              <Link href="/recordings" className="text-xs text-[#0052CC] font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {mockLiveRecordings.slice(0, 2).map((rec) => (
                <Link
                  key={rec.id}
                  href="/recordings"
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors group"
                >
                  <div className="space-y-0.5 max-w-xs">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#0052CC] line-clamp-1">
                      {rec.sessionTopic}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rec.recordedDate} • {rec.durationMins} mins
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 group-hover:bg-[#0052CC] group-hover:text-white group-hover:border-[#0052CC] transition-all">
                    <Film className="w-3.5 h-3.5" /> Watch
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center font-medium">
            ⚡ Missed a live session? Watch full HD class recordings anytime in the Recordings tab!
          </p>
        </div>
      </div>

      {/* 📚 4. COURSE PROGRESS & OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
            <BookOpen className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{currentStudent.overallProgress}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0052CC] h-full rounded-full" style={{ width: `${currentStudent.overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{currentStudent.overallAttendance}%</p>
          <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved by Tutor
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{currentStudent.averageScore}%</p>
          <p className="text-[11px] font-medium text-slate-500">From 3 Assessments</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certificate Status</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-amber-600">A1 In Progress</p>
          <p className="text-[11px] font-medium text-slate-500">Target Completion: Nov 2026</p>
        </div>
      </div>

      {/* 🎧 5. LSRW SKILL PRACTICE SUITE QUICK LAUNCHER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0B2447]">🎧 LSRW 4-Skill Practice Suite</h3>
            <p className="text-xs text-slate-500">Practice Listening, Speaking, Reading, and Writing daily with AI feedback.</p>
          </div>
          <Link href="/lsrw" className="text-xs text-[#0052CC] font-bold hover:underline">
            Launch Full LSRW Suite
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/lsrw"
            className="p-3.5 bg-blue-50/70 hover:bg-blue-100/80 rounded-xl border border-blue-200 flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <Headphones className="w-6 h-6 text-[#0052CC] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Listening (L)</span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Score: {currentStudent.lsrwScores.listening}%
            </span>
          </Link>

          <Link
            href="/lsrw"
            className="p-3.5 bg-rose-50/70 hover:bg-rose-100/80 rounded-xl border border-rose-200 flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <Mic className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Speaking (S)</span>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Whisper AI: {currentStudent.lsrwScores.speaking}%
            </span>
          </Link>

          <Link
            href="/lsrw"
            className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <FileText className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Reading (R)</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Score: {currentStudent.lsrwScores.reading}%
            </span>
          </Link>

          <Link
            href="/lsrw"
            className="p-3.5 bg-purple-50/70 hover:bg-purple-100/80 rounded-xl border border-purple-200 flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <PenTool className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Writing (W)</span>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Accent Keys: {currentStudent.lsrwScores.writing}%
            </span>
          </Link>
        </div>
      </div>

      {/* 📝 6, 7, 8, 9, 10. QUICK ACTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#0052CC]" /> Pending Homework
            </h3>
            <Link href="/assignments" className="text-xs text-[#0052CC] font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Due Tomorrow</span>
            <p className="text-xs font-bold text-slate-800">Module 1: French Accents Worksheet</p>
            <p className="text-[11px] text-slate-600">Handwriting PDF upload required.</p>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-600" /> Assessment Exams
            </h3>
            <Link href="/exams" className="text-xs text-[#0052CC] font-semibold hover:underline">
              View Exams
            </Link>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
            <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider">Available Now</span>
            <p className="text-xs font-bold text-slate-800">French A1 Mid-Term Test</p>
            <p className="text-[11px] text-slate-600">45 Mins • 30 Questions (Modules 1-3)</p>
          </div>
        </div>

        {/* Doubt Support */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-600" /> Doubt Q&A Support
            </h3>
            <Link href="/doubts" className="text-xs text-[#0052CC] font-semibold hover:underline">
              Ask Doubt
            </Link>
          </div>
          <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 space-y-1.5">
            <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider">Resolved Doubt</span>
            <p className="text-xs font-bold text-slate-800">'C'est' vs 'Il est' Grammar Rule</p>
            <p className="text-[11px] text-slate-600">Answered by Assistant Tutor Ananya.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
