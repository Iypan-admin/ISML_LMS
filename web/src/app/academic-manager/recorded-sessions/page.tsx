// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: PRE-RECORDED LECTURE SESSIONS MASTER
// (/academic-manager/recorded-sessions)
// Upload, manage, and audit curriculum video masterclasses across the 5 languages
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  FileVideo,
  Plus,
  Play,
  Clock,
  Users,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Video,
  Sparkles,
  Headphones,
  Mic,
  FileText,
  PenTool
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import { mockPreRecordedSessions, PreRecordedSession } from '@/mock/preRecorded';
import UploadPreRecordedDrawer from '@/components/academic-manager/UploadPreRecordedDrawer';

export default function AcademicManagerRecordedSessionsPage() {
  const { showSuccess } = useToast();
  const [sessions, setSessions] = useState<PreRecordedSession[]>(mockPreRecordedSessions);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [previewSession, setPreviewSession] = useState<PreRecordedSession | null>(null);

  // Extract distinct batches from existing sessions for dynamic dropdown
  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach(s => {
      if (s.batchId && s.batchName) {
        map.set(s.batchId, s.batchName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedLanguageFilter !== 'ALL' && s.languageFamily !== selectedLanguageFilter) {
        return false;
      }
      if (selectedBatchFilter !== 'ALL' && s.batchId !== selectedBatchFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          s.sessionTitle.toLowerCase().includes(q) ||
          (s.topicName && s.topicName.toLowerCase().includes(q)) ||
          s.moduleName.toLowerCase().includes(q) ||
          s.subjectCode.toLowerCase().includes(q) ||
          s.instructorName.toLowerCase().includes(q) ||
          (s.batchName && s.batchName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sessions, selectedLanguageFilter, selectedBatchFilter, searchQuery]);

  const handleSessionUploaded = (newSession: PreRecordedSession) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Pre-Recorded Video Library' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <FileVideo className="w-6 h-6 text-purple-600" />
            <span>Pre-Recorded Lectures & Masterclass Library</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest and manage curriculum video lectures, downloadable slide decks, audio drills, and student watch statistics by batch cohort.
          </p>
        </div>

        <button
          onClick={() => setIsUploadDrawerOpen(true)}
          className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Lecture Video</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Published Masterclasses</span>
            <Video className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{sessions.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">1080p HLS streaming ready</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Student Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">
            {sessions.reduce((acc, curr) => acc + curr.viewsCount, 0)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Across all enrolled cohorts</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Downloadable Handouts</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">
            {sessions.reduce((acc, curr) => acc + curr.resources.length, 0)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">PDFs, Slide Decks & Audio zips</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Languages Covered</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">5 Languages</p>
          <p className="text-[10px] text-slate-500 mt-0.5">French, Japanese, Korean, Spanish, German</p>
        </div>
      </div>

      {/* Filter and Search Bar: Batch Selection + Language Tabs */}
      <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures by topic, title, batch, tutor, or module..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Batch Cohort Dropdown Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 shrink-0">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Batch:</span>
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-indigo-950 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Batches & Cohorts ({sessions.length})</option>
                {batchOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 5 Core Languages Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0">Language:</span>
          {['ALL', 'FRENCH', 'JAPANESE', 'KOREAN', 'SPANISH', 'GERMAN'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguageFilter(lang)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLanguageFilter === lang
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'ALL' ? 'All Languages' : lang}
            </button>
          ))}

          {/* Result Count Badge */}
          <span className="ml-auto text-xs font-bold text-slate-500 shrink-0">
            Showing <strong className="text-slate-800">{filteredSessions.length}</strong> sessions
          </span>
        </div>
      </div>

      {/* Video Sessions Cards Grid */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileVideo className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No recorded sessions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No video lectures match the selected batch or filter criteria. Click &quot;Upload Lecture Video&quot; to add a new lecture.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group border-t-4 border-t-blue-600"
            >
              <div>
                {/* Video Thumbnail with Play Badge */}
                <div 
                  onClick={() => setPreviewSession(session)}
                  className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={session.thumbnailUrl}
                    alt={session.sessionTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/95 text-[#0052CC] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/85 text-white backdrop-blur-xs">
                      {session.subjectCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-xs">
                      {session.subLevel}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white flex items-center gap-1 backdrop-blur-xs">
                    <Clock className="w-3 h-3 text-cyan-300" />
                    <span>{session.durationMins} Mins</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Date, Day & Batch Cohort Header Badge Bar */}
                  <div className="flex items-center justify-between gap-1 text-[11px] pb-2 border-b border-slate-100 flex-wrap">
                    {/* Date and Day */}
                    <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg font-bold">
                      <span className="text-blue-700">📅 {session.lectureDay || 'Weekday'}</span>
                      <span className="text-slate-400">•</span>
                      <span>{session.lectureDate || 'Scheduled'}</span>
                    </div>

                    {/* Batch Cohort Badge */}
                    <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-lg text-[10px] font-extrabold truncate max-w-[170px]">
                      <Users className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">{session.batchName || 'Core Cohort'}</span>
                    </div>
                  </div>

                  {/* Topic Name (Prominent & Clear) */}
                  <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wide block">
                      Topic Name:
                    </span>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {session.topicName || session.moduleName}
                    </p>
                  </div>

                  {/* Session Title */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2447] leading-snug line-clamp-2">
                      {session.sessionTitle}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                      {session.description}
                    </p>
                  </div>

                  {/* Tutor / Lead Instructor Info */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {session.instructorName.slice(0, 1)}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Faculty Tutor</span>
                        <strong className="text-slate-800 text-xs truncate block">{session.instructorName}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold shrink-0">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>{session.viewsCount} views</span>
                    </div>
                  </div>

                  {/* Attached Lesson Materials Pill List */}
                  {session.resources.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Downloadable Materials ({session.resources.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {session.resources.map((res, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            <Download className="w-2.5 h-2.5 text-blue-600" />
                            <span className="truncate max-w-[130px]">{res.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {session.resolution} • {session.videoFileSize || '200 MB'}
                </span>

                <button
                  onClick={() => setPreviewSession(session)}
                  className="px-3 py-1 bg-white hover:bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Preview Lecture</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Playback Modal */}
      {previewSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 space-y-4 p-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {previewSession.subjectCode} • {previewSession.subLevel}
                </span>
                <h3 className="text-base font-bold text-[#0B2447] mt-1">{previewSession.sessionTitle}</h3>
              </div>
              <button
                onClick={() => setPreviewSession(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
              <video
                src={previewSession.videoUrl}
                poster={previewSession.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Taught by: <strong>{previewSession.instructorName}</strong></span>
              <span>Duration: <strong>{previewSession.durationMins} mins</strong> ({previewSession.resolution})</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Pre-Recorded Video Drawer */}
      <UploadPreRecordedDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onSessionUploaded={handleSessionUploaded}
      />
    </div>
  );
}
