// ============================================================================
// ISML COLLEGE LMS — ONLINE SCHEDULE & VIRTUAL STUDIO MANAGEMENT
// Online Live Virtual Broadcasts & Digital LSRW Interactive Studios
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Video,
  Radio,
  Headphones,
  Sparkles,
  Layers,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function ScheduleManagementPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Scheduling' }, { label: 'Schedule Hub' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Online Schedule & Virtual Studio Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Live Virtual Classrooms, LSRW Audio-Interactive Studios, and Weekly Online Timetables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
            <Wifi className="w-3.5 h-3.5" />
            <span>Live Interactive Studios</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Video className="w-3.5 h-3.5" />
            <span>Cloud Recorded Masterclasses</span>
          </span>
        </div>
      </div>

      {/* Primary Scheduling Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Timetable Grid */}
        <Link
          href="/super-admin/scheduling/timetable"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-[#0052CC] hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-1.5">
                <span>Weekly Timetable Grid</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Filter and allocate weekly online lecture periods by Department, Language Cohort, and Virtual Studio.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0052CC]">
            <span>View Full Grid</span>
            <span className="bg-blue-50 px-2 py-0.5 rounded text-[10px]">5 Working Days</span>
          </div>
        </Link>

        {/* Card 2: Live Classes & Sessions */}
        <Link
          href="/super-admin/classes"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-[#0052CC] hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-1.5">
                <span>Class Sessions & Live Studios</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage today's ongoing online sessions, Google Meet broadcast rooms, and self-paced LSRW workshop slots.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
            <span>Manage Classes</span>
            <span className="bg-purple-50 px-2 py-0.5 rounded text-[10px]">100% Online</span>
          </div>
        </Link>

        {/* Card 3: Campus Period Rules */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2447]">Lecture Blocks & Intervals</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Standardized 60-minute period allocations, live pronunciation drills, and digital language lab intervals.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Standard Slots</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">6 Periods / Day</span>
          </div>
        </div>
      </div>

      {/* Online Infrastructure Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Live Interactive Broadcast Studios */}
        <div className="p-4 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B2447]">Live Interactive Virtual Studios</h4>
              <p className="text-[10px] text-slate-500">Real-time video broadcasts and 2-way student speaking practice</p>
            </div>
          </div>
          <ul className="text-xs space-y-1.5 text-slate-600 pl-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
              <span>ISML Live Studio A, B & C (HD Google Meet / LiveKit Broadcasts)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
              <span>Single-Click Secure Access for Enrolled Foreign Language Batches</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
              <span>Automated Real-Time Attendance Ledger Sync upon Room Entry</span>
            </li>
          </ul>
        </div>

        {/* Digital LSRW & Recorded Studio Labs */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B2447]">Digital LSRW & Cloud Playback Studios</h4>
              <p className="text-[10px] text-slate-500">Listening audio labs, speaking assessments, and recorded lectures</p>
            </div>
          </div>
          <ul className="text-xs space-y-1.5 text-slate-600 pl-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Native Audio Listening Booths & Whisper Speech AI Scoring</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>On-Demand Cloud Masterclass Archive with LSRW Practice Sheets</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Conflict-Free Virtual Scheduling Across All Language Cohorts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
