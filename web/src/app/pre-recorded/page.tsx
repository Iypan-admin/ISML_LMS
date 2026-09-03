"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PlaySquare, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  FileCheck2, 
  Headphones, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { mockPreRecordedSessions, PreRecordedSession } from '@/mock/preRecorded';

export default function PreRecordedPage() {
  const [selectedSession, setSelectedSession] = useState<PreRecordedSession>(mockPreRecordedSessions[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <PlaySquare className="w-4 h-4 text-[#0052CC]" />
          <span>Prepared Curriculum Video Library</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Pre-Recorded Learning Sessions</h1>
        <p className="text-xs text-slate-600">
          Self-paced curriculum video lectures prepared by master language faculty. Watch anytime & resume where you left off.
        </p>
      </div>

      {/* Main Video Player & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative aspect-video flex items-center justify-center group">
            <video
              src={selectedSession.videoUrl}
              poster={selectedSession.thumbnailUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>

          {/* Session Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-[#0052CC] font-mono text-xs font-bold rounded-full border border-blue-200">
                {selectedSession.moduleCode} • Sub-Level {selectedSession.subLevel}
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#0052CC]" /> {selectedSession.durationMins} Mins Duration
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-[#0B2447]">{selectedSession.sessionTitle}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedSession.description}</p>

            {/* Related Attachments */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Downloadable Lesson Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSession.resources.map((res, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[180px]">
                      <p className="text-xs font-bold text-slate-800 truncate">{res.title}</p>
                      <p className="text-[10px] text-slate-500">{res.type} • {res.size}</p>
                    </div>
                    <a
                      href={res.downloadUrl}
                      className="p-2 bg-white border border-slate-300 text-[#0052CC] hover:bg-[#0052CC] hover:text-white rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Action Bar */}
            <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
              <Link
                href="/assignments"
                className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
              >
                <FileCheck2 className="w-4 h-4" /> View Linked Homework
              </Link>

              <Link
                href="/lsrw"
                className="px-4 py-2 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
              >
                <Headphones className="w-4 h-4" /> Practice Linked LSRW Drill
              </Link>
            </div>
          </div>
        </div>

        {/* Playlist / Session Cards Sidebar */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#0B2447]">All Pre-Recorded Sessions</h3>
          <div className="space-y-3">
            {mockPreRecordedSessions.map((session) => {
              const isSelected = selectedSession.id === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected 
                      ? 'bg-[#0052CC] text-white border-cyan-400 shadow-md' 
                      : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {session.moduleCode}
                    </span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-200' : 'text-slate-500'}`}>
                      {session.durationMins} mins
                    </span>
                  </div>

                  <h4 className="text-xs font-bold line-clamp-2">{session.sessionTitle}</h4>

                  {session.status === 'IN_PROGRESS' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Resume Progress</span>
                        <span>{session.watchedMins} / {session.durationMins} mins</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full rounded-full" 
                          style={{ width: `${(session.watchedMins / session.durationMins) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
