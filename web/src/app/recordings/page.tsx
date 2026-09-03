"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Film, 
  Search, 
  Clock, 
  ShieldCheck, 
  Play, 
  Calendar, 
  Eye, 
  Sparkles,
  Download
} from 'lucide-react';
import { mockLiveRecordings, LiveRecording } from '@/mock/recordings';

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<LiveRecording | null>(null);

  const filteredRecordings = mockLiveRecordings.filter(rec => 
    rec.sessionTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
          <span>HD Video Replays • Access Anytime, Anywhere</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Live Class Recordings Archive</h1>
        <p className="text-xs text-slate-600">
          Missed a live class? Watch high-definition recorded replays of all past live sessions at your own pace.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recordings by topic, grammar lesson, or tutor name..."
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
        />
      </div>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecordings.map((recording) => (
          <div key={recording.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="relative aspect-video bg-slate-900 overflow-hidden group">
              <Image 
                src={recording.thumbnailUrl} 
                alt={recording.sessionTopic} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <button
                onClick={() => setSelectedRecording(recording)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <div className="p-4 rounded-full bg-[#0052CC] text-white shadow-xl transform group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 font-mono text-[10px] font-bold border border-slate-700">
                  {recording.fileResolution}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                  <Eye className="w-3.5 h-3.5" /> {recording.viewsCount} Student Views
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {recording.uploadSlaStatus}
                </span>
                <span className="text-xs font-mono text-slate-500">{recording.recordedDate}</span>
              </div>

              <h3 className="text-base font-bold text-[#0B2447] leading-snug">{recording.sessionTopic}</h3>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p><span className="font-semibold text-slate-800">Faculty:</span> {recording.tutorName}</p>
                <p className="text-[11px] text-amber-700 font-medium">⏳ Expiration: {recording.expiresAt}</p>
              </div>

              <button
                onClick={() => setSelectedRecording(recording)}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Live Webinar Replay</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#071730] border border-[#1E3A8A] rounded-2xl w-full max-w-4xl overflow-hidden text-white shadow-2xl space-y-4 p-4">
            <div className="flex items-center justify-between border-b border-[#1E3A8A] pb-3">
              <h3 className="text-sm font-bold text-white truncate">{selectedRecording.sessionTopic}</h3>
              <button
                onClick={() => setSelectedRecording(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs"
              >
                Close Replay
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video src={selectedRecording.videoUrl} controls autoPlay className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <p>Tutor: <span className="font-bold text-white">{selectedRecording.tutorName}</span></p>
              <p className="font-mono text-cyan-300">Secure HD Video Stream</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
