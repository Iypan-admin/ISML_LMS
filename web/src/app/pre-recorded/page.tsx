"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  RefreshCw,
  Maximize,
  Volume2,
  Calendar,
  Users
} from 'lucide-react';

export interface RecordedSessionItem {
  id: string;
  sessionTopic: string;
  courseName: string;
  batchName: string;
  recordedDate: string;
  durationMins: number;
  durationSecs: number;
  durationText?: string;
  fileResolution?: string;
  storageProvider?: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  sharedContent?: any;
  chats?: any[];
  attendance?: any[];
}

export default function PreRecordedPage() {
  const [sessions, setSessions] = useState<RecordedSessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<RecordedSessionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch real original recorded sessions from backend
  const fetchRealRecordings = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://ismllms-production.up.railway.app/api/live-classes/recordings/all');
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        setSessions(json.data);
        if (!selectedSession) {
          setSelectedSession(json.data[0]);
        }
      } else {
        // Check localStorage fallback for client-archived sessions
        try {
          const saved = JSON.parse(localStorage.getItem('isml_archived_live_recordings') || '[]');
          if (Array.isArray(saved) && saved.length > 0) {
            setSessions(saved);
            if (!selectedSession) setSelectedSession(saved[0]);
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Error fetching real recordings:', err);
      try {
        const saved = JSON.parse(localStorage.getItem('isml_archived_live_recordings') || '[]');
        if (Array.isArray(saved) && saved.length > 0) {
          setSessions(saved);
          if (!selectedSession) setSelectedSession(saved[0]);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealRecordings();

    const handleUpdate = (e: any) => {
      if (e?.detail?.type === 'RECORDINGS_UPDATED' || e?.detail?.type === 'LIVE_CLASS_ENDED') {
        fetchRealRecordings();
      }
    };
    window.addEventListener('isml-realtime-event', handleUpdate);
    return () => window.removeEventListener('isml-realtime-event', handleUpdate);
  }, []);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs === Infinity) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (newTime: number) => {
    const v = videoRef.current;
    if (v) {
      const clamped = Math.max(0, Math.min(newTime, videoDuration || v.duration || 60));
      v.currentTime = clamped;
      setCurrentTime(clamped);
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
            <PlaySquare className="w-4 h-4 text-[#0052CC]" />
            <span>Original Cloud VOD & Live Classroom Recordings</span>
          </div>
          <button
            onClick={fetchRealRecordings}
            className="flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Pre-Recorded & Archived Class Sessions</h1>
        <p className="text-xs text-slate-600">
          Watch high-definition replays of all recorded live classroom sessions, whiteboard annotations, and shared materials.
        </p>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading original recorded sessions...</p>
        </div>
      ) : !selectedSession || sessions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <PlaySquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Recorded Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once a tutor ends a live webinar with recording, the real recorded video session will appear here automatically.
          </p>
        </div>
      ) : (
        /* Main Video Player & Details Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative aspect-video flex flex-col justify-between group">
              <div className="relative w-full flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  key={selectedSession.id + (selectedSession.videoUrl || '')}
                  src={selectedSession.videoUrl || '/samples/french-lecture.mp4'}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => {
                    const v = videoRef.current;
                    if (v) {
                      if (v.paused) {
                        v.play();
                        setIsPlaying(true);
                      } else {
                        v.pause();
                        setIsPlaying(false);
                      }
                    }
                  }}
                  onTimeUpdate={() => {
                    const v = videoRef.current;
                    if (v) {
                      setCurrentTime(v.currentTime);
                      if (!videoDuration || videoDuration === 0) {
                        const d = (v.duration && !isNaN(v.duration) && v.duration !== Infinity && v.duration > 0)
                          ? v.duration
                          : (selectedSession.durationSecs || selectedSession.durationMins * 60 || 60);
                        setVideoDuration(d);
                      }
                    }
                  }}
                  onLoadedMetadata={() => {
                    const v = videoRef.current;
                    if (v) {
                      const d = (v.duration && !isNaN(v.duration) && v.duration !== Infinity && v.duration > 0)
                        ? v.duration
                        : (selectedSession.durationSecs || selectedSession.durationMins * 60 || 60);
                      setVideoDuration(d);
                      setIsPlaying(!v.paused);
                    }
                  }}
                  onError={() => {
                    if (selectedSession.videoUrl !== '/samples/french-lecture.mp4') {
                      setSelectedSession((prev) => prev ? { ...prev, videoUrl: '/samples/french-lecture.mp4' } : null);
                    }
                  }}
                />
              </div>

              {/* Fast Skip & Playback Toolbar */}
              <div className="w-full bg-slate-900/95 border-t border-white/10 px-3 py-2 flex items-center justify-between text-xs text-white z-20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSeek(currentTime - 10)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg font-semibold cursor-pointer transition-colors"
                    title="Rewind 10 seconds"
                  >
                    ⏪ -10s
                  </button>

                  <button
                    onClick={() => handleSeek(currentTime + 10)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg font-semibold cursor-pointer transition-colors"
                    title="Forward 10 seconds"
                  >
                    +10s ⏩
                  </button>

                  {/* Timestamp: Current Time / Total Duration */}
                  <div className="font-mono text-xs text-slate-300 bg-black/50 px-2 py-0.5 rounded border border-white/10">
                    <span className="text-white font-bold">{formatTime(currentTime)}</span>
                    <span className="mx-1 text-slate-500">/</span>
                    <span className="text-cyan-300 font-bold">{formatTime(videoDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed selector */}
                  {[1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        if (videoRef.current) videoRef.current.playbackRate = speed;
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                      title={`${speed}x Speed`}
                    >
                      {speed}x
                    </button>
                  ))}

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => {
                      const v = videoRef.current;
                      if (v) {
                        if (!document.fullscreenElement) {
                          if (v.requestFullscreen) {
                            v.requestFullscreen().catch(() => {});
                          } else if ((v as any).webkitRequestFullscreen) {
                            (v as any).webkitRequestFullscreen();
                          }
                        } else {
                          document.exitFullscreen().catch(() => {});
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-[#0052CC] text-white flex items-center gap-1 cursor-pointer transition-colors"
                    title="Full Screen (F)"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold hidden sm:inline">Fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Session Overview & Meta Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-[#0052CC] font-mono text-xs font-bold rounded-full border border-blue-200">
                  {selectedSession.batchName || 'Language Cohort'}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#0052CC]" /> {selectedSession.durationText || `${selectedSession.durationMins || 1} mins`} Duration
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-[#0B2447]">{selectedSession.sessionTopic}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Course: <strong className="text-slate-800">{selectedSession.courseName}</strong> • Recorded on {selectedSession.recordedDate}
              </p>

              {/* Shared Material & In-Class Chats Details */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#0052CC]" />
                    <span>Shared Material</span>
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">
                    {selectedSession.sharedContent?.title || 'Interactive Whiteboard & Audio-Visual Teaching'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Type: {selectedSession.sharedContent?.type || 'CORE_SESSION'} • Archived for Student Revision
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In-Class Attendance & Chats</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {selectedSession.chats?.length || 0} discussion messages recorded.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Storage: Supabase Storage Bucket (live-recordings)
                  </p>
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
                  href="/assignments"
                  className="px-4 py-2 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
                >
                  <Headphones className="w-4 h-4" /> Practice Linked LSRW Drill
                </Link>
              </div>
            </div>
          </div>

          {/* Original Recordings Playlist Sidebar */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0B2447] flex items-center justify-between">
              <span>Original Recordings ({sessions.length})</span>
              <span className="text-[11px] font-normal text-slate-500">Real Supabase Streams</span>
            </h3>
            
            <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
              {sessions.map((session) => {
                const isSelected = selectedSession.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      setCurrentTime(0);
                      setVideoDuration(session.durationSecs || session.durationMins * 60 || 60);
                    }}
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
                        {session.batchName || 'Cohort'}
                      </span>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-200' : 'text-slate-500'}`}>
                        {session.durationText || `${session.durationMins || 1} mins`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold line-clamp-2">{session.sessionTopic}</h4>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10">
                      <span className={isSelected ? 'text-blue-100' : 'text-slate-500'}>{session.recordedDate}</span>
                      <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-cyan-200' : 'text-[#0052CC]'}`}>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Video</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

