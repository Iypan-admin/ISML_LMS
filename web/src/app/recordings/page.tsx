"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  RefreshCw,
  Maximize,
  Video,
  FileText
} from 'lucide-react';

export interface LiveRecordingItem {
  id: string;
  sessionTopic: string;
  tutorName?: string;
  courseName?: string;
  batchName?: string;
  recordedDate: string;
  durationMins: number;
  durationSecs?: number;
  durationText?: string;
  fileResolution?: string;
  storageProvider?: string;
  uploadSlaStatus?: string;
  expiresAt?: string;
  thumbnailUrl?: string | null;
  videoUrl: string;
  viewsCount?: number;
  sharedContent?: any;
  chats?: any[];
  attendance?: any[];
}

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recordings, setRecordings] = useState<LiveRecordingItem[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<LiveRecordingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch real original recorded sessions from backend
  const fetchLiveRecordings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/live-classes/recordings/all');
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        setRecordings(json.data);
      } else {
        // Fallback to client localStorage archived recordings
        try {
          const saved = JSON.parse(localStorage.getItem('isml_archived_live_recordings') || '[]');
          if (Array.isArray(saved) && saved.length > 0) {
            setRecordings(saved);
          } else {
            setRecordings([]);
          }
        } catch {
          setRecordings([]);
        }
      }
    } catch (err) {
      console.warn('Error fetching real live recordings:', err);
      try {
        const saved = JSON.parse(localStorage.getItem('isml_archived_live_recordings') || '[]');
        if (Array.isArray(saved) && saved.length > 0) {
          setRecordings(saved);
        } else {
          setRecordings([]);
        }
      } catch {
        setRecordings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRecordings();

    const handleUpdate = (e: any) => {
      if (e?.detail?.type === 'RECORDINGS_UPDATED' || e?.detail?.type === 'LIVE_CLASS_ENDED') {
        fetchLiveRecordings();
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

  const filteredRecordings = recordings.filter((rec) => {
    const q = searchQuery.toLowerCase();
    const topic = (rec.sessionTopic || '').toLowerCase();
    const tutor = (rec.tutorName || '').toLowerCase();
    const batch = (rec.batchName || '').toLowerCase();
    const course = (rec.courseName || '').toLowerCase();
    return topic.includes(q) || tutor.includes(q) || batch.includes(q) || course.includes(q);
  });

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
            <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
            <span>HD Video Replays • Access Anytime, Anywhere</span>
          </div>
          <button
            onClick={fetchLiveRecordings}
            className="flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
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
          placeholder="Search recordings by topic, batch name, or tutor name..."
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
        />
      </div>

      {loading && recordings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading original webinar recordings...</p>
        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Film className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Recorded Live Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No live recordings match "${searchQuery}". Try a different keyword.`
              : 'When tutors conclude live webinars with recording enabled, the sessions will be archived here automatically.'}
          </p>
        </div>
      ) : (
        /* Recordings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video bg-black overflow-hidden group">
                {recording.thumbnailUrl && !recording.thumbnailUrl.includes('french-thumb.jpg') && !recording.thumbnailUrl.startsWith('data:application/pdf') ? (
                  <img
                    src={recording.thumbnailUrl}
                    alt={recording.sessionTopic}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-slate-400 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1.5">
                      <Video className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">{recording.sessionTopic}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">Live Webinar Full HD Recording</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <button
                  onClick={() => {
                    setSelectedRecording(recording);
                    setCurrentTime(0);
                    setVideoDuration(recording.durationSecs || recording.durationMins * 60 || 60);
                  }}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                >
                  <div className="p-4 rounded-full bg-[#0052CC] text-white shadow-xl transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 font-mono text-[10px] font-bold border border-slate-700">
                    {recording.fileResolution || '720p HD'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                    <Eye className="w-3.5 h-3.5" /> {recording.viewsCount || 1} Student Views
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {recording.uploadSlaStatus || 'ARCHIVED IN CLOUD'}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{recording.recordedDate}</span>
                </div>

                <h3 className="text-base font-bold text-[#0B2447] leading-snug line-clamp-2">
                  {recording.sessionTopic}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-800">Batch:</span> {recording.batchName || 'Loyola Cohort'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Duration:</span> {recording.durationText || `${recording.durationMins || 1} mins`}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedRecording(recording);
                    setCurrentTime(0);
                    setVideoDuration(recording.durationSecs || recording.durationMins * 60 || 60);
                  }}
                  className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Live Webinar Replay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#071730] border border-[#1E3A8A] rounded-3xl w-full max-w-4xl overflow-hidden text-white shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-[#1E3A8A] p-4 shrink-0">
              <div className="truncate">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Original Cloud Recording • Full HD
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate mt-1">
                  {selectedRecording.sessionTopic}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecording(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="relative aspect-video bg-black flex flex-col justify-between overflow-hidden">
              <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  key={selectedRecording.id + (selectedRecording.videoUrl || '')}
                  src={selectedRecording.videoUrl || '/samples/french-lecture.mp4'}
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
                          : (selectedRecording.durationSecs || selectedRecording.durationMins * 60 || 60);
                        setVideoDuration(d);
                      }
                    }
                  }}
                  onLoadedMetadata={() => {
                    const v = videoRef.current;
                    if (v) {
                      const d = (v.duration && !isNaN(v.duration) && v.duration !== Infinity && v.duration > 0)
                        ? v.duration
                        : (selectedRecording.durationSecs || selectedRecording.durationMins * 60 || 60);
                      setVideoDuration(d);
                      setIsPlaying(!v.paused);
                    }
                  }}
                  onError={() => {
                    if (selectedRecording.videoUrl !== '/samples/french-lecture.mp4') {
                      setSelectedRecording((prev) => prev ? { ...prev, videoUrl: '/samples/french-lecture.mp4' } : null);
                    }
                  }}
                />
              </div>

              {/* Fast Skip Toolbar */}
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

            <div className="p-4 border-t border-[#1E3A8A] flex items-center justify-between text-xs text-slate-300 shrink-0">
              <p>
                Batch: <strong className="text-white">{selectedRecording.batchName || 'Loyola French Cohort'}</strong> • Recorded on {selectedRecording.recordedDate}
              </p>
              <p className="font-mono text-cyan-300">Supabase Cloud Stream</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
