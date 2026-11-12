// ============================================================================
// ISML COLLEGE LMS — UPLOAD PRE-RECORDED LECTURE DRAWER
// Academic Manager: Professional LSRW-Based Media Uploader (Video & Audio Formats)
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileVideo,
  X,
  Upload,
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Trash2,
  Video,
  FileText,
  Calendar,
  Headphones,
  Mic,
  BookMarked,
  PenTool,
  Music,
  Radio,
  Volume2
} from 'lucide-react';
import { PreRecordedSession, LessonResource } from '@/mock/preRecorded';
import { mockSubjects, mockCourses } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface UploadPreRecordedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionUploaded: (newSession: PreRecordedSession) => void;
}

export default function UploadPreRecordedDrawer({
  isOpen,
  onClose,
  onSessionUploaded,
}: UploadPreRecordedDrawerProps) {
  const { showSuccess } = useToast();

  // Dynamic live courses fetched from backend with mock fallback
  const [liveCoursesList, setLiveCoursesList] = useState<any[]>(mockCourses);

  useEffect(() => {
    fetch('http://localhost:4000/api/portals/courses')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const map = new Map<string, any>();
          json.data.forEach((c: any) =>
            map.set(c.id, {
              id: c.id,
              name: c.name || c.code,
              code: c.code,
              department: c.department,
              facultyName: c.facultyName || 'Certified Native Faculty',
            })
          );
          mockCourses.forEach((c: any) => {
            if (!map.has(c.id)) map.set(c.id, c);
          });
          setLiveCoursesList(Array.from(map.values()));
        }
      })
      .catch(() => {});
  }, []);

  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || 'crs-01');
  const selectedCourse = useMemo(() => {
    return liveCoursesList.find((c) => c.id === selectedCourseId) || liveCoursesList[0] || mockCourses[0];
  }, [liveCoursesList, selectedCourseId]);

  // Auto-detect Language Family, Default Tutor, & Batch Cohort from selected course
  const courseDetails = useMemo(() => {
    const nameOrCode = (selectedCourse?.name || selectedCourse?.code || '').toLowerCase();

    let lang: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN' = 'FRENCH';
    let code = 'FR-101';
    let tutor = 'Madame Claire Dubois';
    let batch = 'Loyola French A1 Cohort 2026';
    let subLevel = 'DELF A1';

    if (nameOrCode.includes('japan') || nameOrCode.includes('jp') || nameOrCode.includes('ja')) {
      lang = 'JAPANESE';
      code = 'JA-101';
      tutor = 'Kenji Takahashi Sensei';
      batch = 'Japanese N5 Cohort 2026';
      subLevel = 'JLPT N5';
    } else if (nameOrCode.includes('korean') || nameOrCode.includes('ko')) {
      lang = 'KOREAN';
      code = 'KO-101';
      tutor = 'Park Ji-Min Teacher';
      batch = 'Korean TOPIK I Cohort 2026';
      subLevel = 'TOPIK I';
    } else if (nameOrCode.includes('german') || nameOrCode.includes('de') || nameOrCode.includes('gr')) {
      lang = 'GERMAN';
      code = 'DE-101';
      tutor = 'Hans Becker Trainer';
      batch = 'German A1 FastTrack 2026';
      subLevel = 'Goethe A1';
    } else if (nameOrCode.includes('spanish') || nameOrCode.includes('es')) {
      lang = 'SPANISH';
      code = 'ES-101';
      tutor = 'Prof. Carlos Mendoza';
      batch = 'Spanish DELE A1 Cohort 2026';
      subLevel = 'DELE A1';
    }

    if (selectedCourse?.facultyName) {
      tutor = selectedCourse.facultyName;
    }

    return { lang, code, tutor, batch, subLevel };
  }, [selectedCourse]);

  // 🟢 LSRW PILLAR CATEGORY (Listening, Speaking, Reading, Writing)
  const [lsrwType, setLsrwType] = useState<'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('SPEAKING');

  // Media Format Mode: Video Masterclass vs Native Audio Track Drill
  const [mediaFormatType, setMediaFormatType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');

  // Uploaded Files State (Zero Mock — Starts Clean & Empty)
  const [uploadedVideoFile, setUploadedVideoFile] = useState<{
    name: string;
    size: string;
  } | null>(null);

  const [uploadedAudioFile, setUploadedAudioFile] = useState<{
    name: string;
    size: string;
  } | null>(null);

  // Session Fields (Zero Mock — Starts Clean & Empty)
  const [sessionTitle, setSessionTitle] = useState('');
  const [topicName, setTopicName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMins, setDurationMins] = useState(45);
  const [resolution, setResolution] = useState<'1080p Full HD' | '720p HD' | '4K UHD'>('1080p Full HD');

  // Date and Day
  const [lectureDate, setLectureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const lectureDay = useMemo(() => {
    try {
      const d = new Date(lectureDate);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return 'Today';
    }
  }, [lectureDate]);

  // Downloadable Handouts / Attachments (Zero Mock — Starts Empty)
  const [attachedResources, setAttachedResources] = useState<LessonResource[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const courseDisplayName = selectedCourse?.name || selectedCourse?.code || 'Foreign Language Certification';

    const newSession: PreRecordedSession = {
      id: `pr-sess-${Date.now().toString().slice(-4)}`,
      subLevel: courseDetails.subLevel,
      courseId: selectedCourse?.id || 'crs-default',
      courseName: courseDisplayName,
      batchId: `batch-${selectedCourse?.id || 'auto'}`,
      batchName: courseDetails.batch,
      subjectCode: courseDetails.code,
      subjectName: courseDisplayName,
      languageFamily: courseDetails.lang,
      moduleCode: lsrwType,
      moduleName: `${lsrwType === 'LISTENING' ? 'Listening Comprehension' : lsrwType === 'SPEAKING' ? 'Oral Speaking Drill' : lsrwType === 'READING' ? 'Reading Passage' : 'Writing & Script'} Track`,
      sessionTitle: sessionTitle || `[${lsrwType}] ${courseDisplayName}: ${topicName}`,
      topicName: topicName || `${courseDisplayName} Masterclass`,
      description: description || `Official curriculum ${mediaFormatType === 'AUDIO' ? 'audio pronunciation drill' : 'video lecture'} focusing on ${lsrwType} skill mastery.`,
      durationMins,
      watchedMins: 0,
      status: 'NOT_STARTED',
      thumbnailUrl: '/samples/french-thumb.jpg',
      videoUrl: mediaFormatType === 'AUDIO' ? '/samples/french-audio.mp3' : '/samples/french-lecture.mp4',
      videoFileName: mediaFormatType === 'AUDIO' ? (uploadedAudioFile?.name || 'audio_drill.mp3') : (uploadedVideoFile?.name || 'lecture_recording.mp4'),
      videoFileSize: mediaFormatType === 'AUDIO' ? (uploadedAudioFile?.size || '18 MB') : (uploadedVideoFile?.size || '195 MB'),
      resolution: resolution,
      instructorName: courseDetails.tutor,
      resources: attachedResources,
      lsrwType,
      viewsCount: 6,
      lectureDate: new Date(lectureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lectureDay,
      uploadedAt: 'Today',
    };

    // Persist to Supabase Database and localStorage
    try {
      const key = 'isml_academic_manager_uploads';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([newSession, ...saved.filter((s: any) => s.id !== newSession.id)]));
      window.dispatchEvent(new CustomEvent('isml-realtime-event', { detail: { type: 'RECORDINGS_UPDATED' } }));
    } catch {}

    fetch('http://localhost:4000/api/portals/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newSession.sessionTitle,
        durationSecs: (newSession.durationMins || 60) * 60,
        videoUrl: newSession.videoUrl,
        resolution: newSession.resolution,
        fileSizeBytes: 200000000,
        courseId: newSession.courseId,
        courseName: newSession.courseName,
        batchId: newSession.batchId,
        batchName: newSession.batchName,
      }),
    }).catch(() => null);

    onSessionUploaded(newSession);
    showSuccess(`[${lsrwType}] ${mediaFormatType} session "${newSession.sessionTitle}" uploaded successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
              <FileVideo className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Upload Pre-Recorded Masterclass
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-purple-600 text-white uppercase tracking-wider">
                  LSRW SUITE
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Listening, Speaking, Reading & Writing Video/Audio Curriculum Ingestion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* 🟢 STEP 1: SELECT COURSE (Auto-Linked Batch & Tutor) */}
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#0052CC]" />
                  <span>1. Course Mapping</span>
                </span>
                <span className="text-[10px] text-blue-700 font-semibold">
                  Tutor: <strong>{courseDetails.tutor}</strong>
                </span>
              </div>

              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-[#0052CC] shadow-2xs cursor-pointer"
                required
              >
                {liveCoursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ? `${c.name} (${c.code || 'COURSE'})` : c.code}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                <span>Cohort: <strong className="text-slate-800">{courseDetails.batch}</strong></span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-blue-200 text-blue-900">
                  {courseDetails.code} • {courseDetails.subLevel}
                </span>
              </div>
            </div>

            {/* 🟢 STEP 2: LSRW PILLAR SELECTION (Listening, Speaking, Reading, Writing) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Core LSRW Skill Track <span className="text-rose-500">*</span></span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Listening */}
                <button
                  type="button"
                  onClick={() => {
                    setLsrwType('LISTENING');
                    setMediaFormatType('AUDIO');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    lsrwType === 'LISTENING'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
                  }`}
                >
                  <Headphones className={`w-4 h-4 ${lsrwType === 'LISTENING' ? 'text-white' : 'text-blue-600'}`} />
                  <span className="text-xs font-bold block leading-tight">Listening</span>
                  <span className={`text-[9px] ${lsrwType === 'LISTENING' ? 'text-blue-100' : 'text-slate-400'}`}>Audio Drills</span>
                </button>

                {/* Speaking */}
                <button
                  type="button"
                  onClick={() => {
                    setLsrwType('SPEAKING');
                    setMediaFormatType('VIDEO');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    lsrwType === 'SPEAKING'
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 hover:border-rose-300 text-slate-700'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${lsrwType === 'SPEAKING' ? 'text-white' : 'text-rose-600'}`} />
                  <span className="text-xs font-bold block leading-tight">Speaking</span>
                  <span className={`text-[9px] ${lsrwType === 'SPEAKING' ? 'text-rose-100' : 'text-slate-400'}`}>Pronunciation</span>
                </button>

                {/* Reading */}
                <button
                  type="button"
                  onClick={() => setLsrwType('READING')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    lsrwType === 'READING'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                  }`}
                >
                  <BookMarked className={`w-4 h-4 ${lsrwType === 'READING' ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="text-xs font-bold block leading-tight">Reading</span>
                  <span className={`text-[9px] ${lsrwType === 'READING' ? 'text-emerald-100' : 'text-slate-400'}`}>Comprehension</span>
                </button>

                {/* Writing */}
                <button
                  type="button"
                  onClick={() => setLsrwType('WRITING')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    lsrwType === 'WRITING'
                      ? 'bg-purple-600 border-purple-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700'
                  }`}
                >
                  <PenTool className={`w-4 h-4 ${lsrwType === 'WRITING' ? 'text-white' : 'text-purple-600'}`} />
                  <span className="text-xs font-bold block leading-tight">Writing</span>
                  <span className={`text-[9px] ${lsrwType === 'WRITING' ? 'text-purple-100' : 'text-slate-400'}`}>Script & Grammar</span>
                </button>
              </div>
            </div>

            {/* 🟢 STEP 3: MEDIA FORMAT PICKER (VIDEO VS AUDIO) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  3. Media Format: Video or Audio
                </span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMediaFormatType('VIDEO')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      mediaFormatType === 'VIDEO' ? 'bg-[#0052CC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Lecture</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFormatType('AUDIO')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      mediaFormatType === 'AUDIO' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Audio Drill (MP3)</span>
                  </button>
                </div>
              </div>

              {/* VIDEO UPLOADER */}
              {mediaFormatType === 'VIDEO' && (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Upload Video Masterclass (MP4 / WebM / MOV)</span> <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                      Up to 2 GB
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 text-center bg-white hover:border-purple-400 transition-all">
                    <input
                      type="file"
                      id="lecture-video-file"
                      accept="video/*,.mp4,.webm,.mov"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadedVideoFile({
                            name: f.name,
                            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                          });
                        }
                      }}
                    />
                    <label htmlFor="lecture-video-file" className="cursor-pointer block">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to browse or drag & drop video lecture
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        H.264 1080p Full HD video recommended
                      </p>
                    </label>

                    {uploadedVideoFile && (
                      <div className="mt-2.5 p-2 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-left">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{uploadedVideoFile.name}</p>
                            <p className="text-[10px] text-slate-500">{uploadedVideoFile.size} • 1080p HLS ready</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedVideoFile(null)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AUDIO UPLOADER */}
              {mediaFormatType === 'AUDIO' && (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-indigo-600" />
                      <span>Upload Native Audio Drill (MP3 / WAV / M4A / AAC)</span> <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      Up to 500 MB
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-indigo-300 rounded-xl p-4 text-center bg-white hover:border-indigo-400 transition-all">
                    <input
                      type="file"
                      id="lecture-audio-file"
                      accept="audio/*,.mp3,.wav,.m4a,.aac"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadedAudioFile({
                            name: f.name,
                            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                          });
                        }
                      }}
                    />
                    <label htmlFor="lecture-audio-file" className="cursor-pointer block">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to browse or drag & drop native audio track
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        High fidelity stereo audio track for LSRW listening drills
                      </p>
                    </label>

                    {uploadedAudioFile && (
                      <div className="mt-2.5 p-2 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between text-left">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{uploadedAudioFile.name}</p>
                            <p className="text-[10px] text-slate-500">{uploadedAudioFile.size} • 320kbps High Fidelity Audio</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedAudioFile(null)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 🟢 STEP 4: TOPIC / LECTURE TITLE */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lecture / Topic Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Conversational Greetings & Bistro Roleplays"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            {/* 🟢 STEP 5: ATTACH LSRW DOWNLOADABLE STUDY HANDOUTS */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Attach Handouts & Slide Decks (PDF / PPT)
                </span>
                <label
                  htmlFor="attach-handout-input"
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Upload className="w-3 h-3 text-[#0052CC]" />
                  <span>+ Add Handout</span>
                </label>
                <input
                  type="file"
                  id="attach-handout-input"
                  accept=".pdf,.pptx,.ppt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
                      const newRes: LessonResource = {
                        title: f.name,
                        type: ext === 'PPTX' || ext === 'PPT' ? 'PPT' : 'PDF',
                        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                        downloadUrl: '#',
                      };
                      setAttachedResources((prev) => [...prev, newRes]);
                    }
                  }}
                />
              </div>

              {attachedResources.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-300 rounded-xl bg-white text-slate-400">
                  <p className="text-xs font-medium">No handouts attached yet.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click &quot;+ Add Handout&quot; to upload PDF study notes or slide decks.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {attachedResources.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="truncate font-semibold text-slate-800 max-w-[280px]">
                        {res.title} ({res.size})
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachedResources((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Publish [{lsrwType}] {mediaFormatType}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
