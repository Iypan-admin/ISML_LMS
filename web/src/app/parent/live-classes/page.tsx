// ============================================================================
// ISML COLLEGE LMS — PARENT: LIVE CLASSES & TIMETABLE (/parent/live-classes)
// Scheduled webinars, LiveKit virtual classrooms, faculty details & recordings
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Play,
  Sparkles,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';

export default function ParentLiveClassesPage() {
  const { selectedChild, selectChild, allChildren } = useParent();

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'Live Classes & Timetable' },
          ]}
        />
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {allChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChild(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                c.id === selectedChild.id
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>Live Interactive Lectures & Web Conferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Live Schedule: {selectedChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedChild.primaryCourse.courseCode} • {selectedChild.primaryCourse.batchName} ({selectedChild.primaryCourse.sectionCode})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold">
            LiveKit High-Definition Virtual Studio
          </span>
        </div>
      </div>

      {/* SCHEDULED SESSIONS LIST */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-[#0B2447]">Upcoming & This Week's Live Classes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedChild.upcomingLiveClasses.map((live) => (
            <div
              key={live.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0052CC]">
                    {live.courseCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {live.status}
                  </span>
                </div>

                <h4 className="text-sm font-black text-[#0B2447]">{live.topic}</h4>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{live.scheduledTime} ({live.duration})</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Conducting Tutor</p>
                  <p className="text-xs font-black text-slate-800">{live.tutorName}</p>
                </div>

                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Ward Access Link Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECORDED SESSIONS ARCHIVE NOTICE */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#0052CC] text-white shrink-0 mt-0.5">
          <FileVideo className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black text-[#0B2447]">Automatic Cloud Webinar Playbacks</h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            All live webinar sessions are automatically recorded by the ISML LiveKit server and made available in the student portal within 30 minutes of class completion for asynchronous revision.
          </p>
        </div>
      </div>
    </div>
  );
}
