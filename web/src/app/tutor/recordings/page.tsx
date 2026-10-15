// ============================================================================
// ISML COLLEGE LMS — TUTOR: RECORDED SESSIONS & CLOUD VOD ARCHIVE (/tutor/recordings)
// Auto-Recorded Live Webinars (Cloudflare R2) + Pre-Recorded Curriculum Videos
// Tutor can review auto-recordings, check student views & verify cloud processing status
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Video,
  Film,
  Calendar,
  Clock,
  Eye,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Search,
  Radio,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useTutor } from '@/context/TutorContext';
import { mockPreRecordedSessions, PreRecordedSession } from '@/mock/preRecorded';
import { mockLiveRecordings, LiveRecording } from '@/mock/recordings';

export default function TutorRecordingsPage() {
  const { currentFaculty } = useTutor();
  const [activeTab, setActiveTab] = useState<'AUTO_WEBINARS' | 'PRE_RECORDED'>('AUTO_WEBINARS');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewVideo, setPreviewVideo] = useState<{ title: string; url: string } | null>(null);

  // Auto Cloud Recordings for Live Webinars conducted by Jay
  const autoCloudRecordings = [
    {
      id: 'rec-jay-01',
      sessionTopic: 'Live Webinar 01: French A1 Salutations, Vowels & Dialogue au Café',
      courseName: 'French A1 Intensive Certification Program',
      batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
      recordedDate: 'Yesterday, 10:30 AM',
      durationMins: 90,
      fileResolution: '1080p Full HD (60fps)',
      storageProvider: 'Cloudflare R2 & AWS S3 Cold Storage',
      autoStatus: 'AUTO_ENCODED_READY',
      viewsCount: 58,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'rec-jay-02',
      sessionTopic: 'Live Webinar 02: Essential French Verbs (Avoir, Être et Premier Groupe)',
      courseName: 'French A1 Intensive Certification Program',
      batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
      recordedDate: 'Oct 12, 2026',
      durationMins: 88,
      fileResolution: '1080p Full HD',
      storageProvider: 'Cloudflare R2',
      autoStatus: 'AUTO_ENCODED_READY',
      viewsCount: 62,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'rec-jay-03',
      sessionTopic: 'Emergency Standby Covered Webinar: French A2 Passé Composé Auxiliary Verbs',
      courseName: 'French A2: Elementary Communication',
      batchName: 'French A2 Cohort (Section B)',
      recordedDate: 'Oct 09, 2026',
      durationMins: 85,
      fileResolution: '1080p Full HD',
      storageProvider: 'Cloudflare R2',
      autoStatus: 'AUTO_ENCODED_READY',
      viewsCount: 44,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // Pre-recorded curriculum lessons
  const frenchPreRecorded = mockPreRecordedSessions.filter((s) => s.languageFamily === 'FRENCH');

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console', href: '/tutor/dashboard' }, { label: 'Recorded Sessions & Cloud VOD' }]} />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              Automated Archive
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">
              Instructor: {currentFaculty.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Webinar Recordings & VOD Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated session recordings and pre-recorded language masterclasses available for student on-demand playback.
          </p>
        </div>

        <Link
          href="/tutor/live-classes"
          className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Radio className="w-4 h-4" />
          <span>Go to Live Studio</span>
        </Link>
      </div>

      {/* Tab Selector & Search */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('AUTO_WEBINARS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'AUTO_WEBINARS'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Auto-Recorded Live Webinars ({autoCloudRecordings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PRE_RECORDED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PRE_RECORDED'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Curriculum Pre-Recorded Lessons ({frenchPreRecorded.length})</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recording topic, date or cohort..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>
      </div>

      {/* ─── TAB 1: AUTO RECORDED LIVE WEBINARS ─── */}
      {activeTab === 'AUTO_WEBINARS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {autoCloudRecordings.map((rec) => (
            <div
              key={rec.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                  <Image src={rec.thumbnailUrl} alt={rec.sessionTopic} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <button
                      onClick={() => setPreviewVideo({ title: rec.sessionTopic, url: rec.videoUrl })}
                      className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#0052CC] flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Play className="w-7 h-7" />
                    </button>
                  </div>
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black bg-slate-900/90 text-white border border-white/20">
                    {rec.fileResolution}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-cyan-300">
                    {rec.durationMins} mins
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Auto Saved to Cloud</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.recordedDate}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {rec.sessionTopic}
                  </h3>
                  <p className="text-[11px] text-blue-600 font-semibold mt-1 truncate">{rec.batchName}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-bold">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rec.viewsCount} Student Views</span>
                </div>
                <button
                  onClick={() => setPreviewVideo({ title: rec.sessionTopic, url: rec.videoUrl })}
                  className="px-3 py-1 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Play VOD
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 2: PRE-RECORDED CURRICULUM LESSONS ─── */}
      {activeTab === 'PRE_RECORDED' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frenchPreRecorded.map((sess) => (
            <div
              key={sess.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                  <Image src={sess.thumbnailUrl} alt={sess.sessionTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <button
                      onClick={() => setPreviewVideo({ title: sess.sessionTitle, url: sess.videoUrl })}
                      className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#0052CC] flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Play className="w-7 h-7" />
                    </button>
                  </div>
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white">
                    {sess.subLevel}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white">
                    {sess.durationMins} mins
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {sess.moduleName}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                    {sess.sessionTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sess.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-600">{sess.viewsCount} Views</span>
                <button
                  onClick={() => setPreviewVideo({ title: sess.sessionTitle, url: sess.videoUrl })}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Inspect Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {previewVideo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 truncate">{previewVideo.title}</span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
              <video src={previewVideo.url} controls autoPlay className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Cloud Storage: Cloudflare R2 Stream (1080p Auto CDN)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Available for Student Re-watch</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
