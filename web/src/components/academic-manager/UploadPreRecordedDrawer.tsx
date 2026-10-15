// ============================================================================
// ISML COLLEGE LMS — UPLOAD PRE-RECORDED LECTURE DRAWER
// Academic Manager: Upload Video Masterclass, Slides, Audio Drills & Attachments
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  FileVideo,
  X,
  Upload,
  Play,
  Clock,
  Layers,
  BookOpen,
  Globe2,
  FileText,
  Paperclip,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Trash2,
  Video,
  Music,
  Calendar,
  Users
} from 'lucide-react';
import { PreRecordedSession, LessonResource } from '@/mock/preRecorded';
import { mockSubjects, mockCourses, mockModules, mockBatches } from '@/mock/superAdminData';
import { mockFacultyMembers } from '@/mock/facultyAssignments';
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

  const [selectedSubjectId, setSelectedSubjectId] = useState(mockSubjects[0]?.id || 'subj-fr101');
  const selectedSubject = useMemo(() => {
    return mockSubjects.find(s => s.id === selectedSubjectId) || mockSubjects[0];
  }, [selectedSubjectId]);

  // Language Family
  const languageFamily = useMemo<'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN'>(() => {
    if (selectedSubject.code.startsWith('JA')) return 'JAPANESE';
    if (selectedSubject.code.startsWith('KO')) return 'KOREAN';
    if (selectedSubject.code.startsWith('ES')) return 'SPANISH';
    if (selectedSubject.code.startsWith('DE')) return 'GERMAN';
    return 'FRENCH';
  }, [selectedSubject]);

  // Available Modules
  const availableModules = useMemo(() => {
    const list = mockModules.filter(m => m.subjectId === selectedSubjectId);
    return list.length > 0 ? list : [
      {
        id: `mod-${selectedSubject.code}-01`,
        subjectId: selectedSubjectId,
        subjectName: selectedSubject.name,
        moduleNumber: 1,
        title: `Module 1: ${selectedSubject.name.split(':')[0]} Foundations & Phonetics`,
        description: 'Core pronunciation and foundational vocabulary.',
        topicsCount: 4,
        estimatedHours: 12,
        status: 'ACTIVE' as const
      }
    ];
  }, [selectedSubjectId, selectedSubject]);

  const [selectedModuleId, setSelectedModuleId] = useState(availableModules[0]?.id || '');
  const selectedModule = useMemo(() => {
    return availableModules.find(m => m.id === selectedModuleId) || availableModules[0];
  }, [availableModules, selectedModuleId]);

  // Update selected module when subject changes
  React.useEffect(() => {
    if (availableModules.length > 0) {
      setSelectedModuleId(availableModules[0].id);
    }
  }, [availableModules]);

  // Available Courses
  const availableCourses = useMemo(() => {
    return mockCourses.filter(c => c.department.includes(selectedSubject.name.split(':')[0]) || c.name.toLowerCase().includes(languageFamily.toLowerCase()));
  }, [selectedSubject, languageFamily]);

  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || 'crs-01');
  const selectedCourse = useMemo(() => {
    return mockCourses.find(c => c.id === selectedCourseId) || mockCourses[0];
  }, [selectedCourseId]);

  // Native Trainer
  const availableTrainers = useMemo(() => {
    const list = mockFacultyMembers.filter(f => f.primaryLanguage === languageFamily);
    return list.length > 0 ? list : mockFacultyMembers;
  }, [languageFamily]);

  const [instructorName, setInstructorName] = useState(availableTrainers[0]?.name || 'Prof. Marie Delacroix');

  React.useEffect(() => {
    if (availableTrainers.length > 0) {
      setInstructorName(availableTrainers[0].name);
    }
  }, [availableTrainers]);

  const [selectedBatchId, setSelectedBatchId] = useState(mockBatches[0]?.id || 'batch-2026-fr');
  const selectedBatch = useMemo(() => {
    return mockBatches.find(b => b.id === selectedBatchId) || mockBatches[0];
  }, [selectedBatchId]);

  // Session Fields
  const [sessionTitle, setSessionTitle] = useState('');
  const [topicName, setTopicName] = useState('Phonetics, Vowel Harmony & Daily Social Expressions');
  const [description, setDescription] = useState('');
  const [durationMins, setDurationMins] = useState(45);
  const [resolution, setResolution] = useState<'1080p Full HD' | '720p HD' | '4K UHD'>('1080p Full HD');
  const [lsrwType, setLsrwType] = useState<'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('SPEAKING');

  // Date and Day
  const [lectureDate, setLectureDate] = useState('2026-10-14');
  const lectureDay = useMemo(() => {
    try {
      const d = new Date(lectureDate);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return 'Wednesday';
    }
  }, [lectureDate]);

  // Video File Upload state
  const [uploadedVideoFile, setUploadedVideoFile] = useState<{
    name: string;
    size: string;
  } | null>({
    name: 'french_a1_masterclass_phonetics.mp4',
    size: '240 MB'
  });

  // Additional Lesson Materials / Attachments (PDF / PPT / Audio)
  const [attachedResources, setAttachedResources] = useState<LessonResource[]>([
    { title: 'Lecture Presentation Slides.pptx', type: 'PPT', size: '8.4 MB', downloadUrl: '#' },
    { title: 'Handout Worksheet & Vocabulary List.pdf', type: 'PDF', size: '1.8 MB', downloadUrl: '#' }
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSession: PreRecordedSession = {
      id: `pr-sess-${Date.now().toString().slice(-4)}`,
      subLevel: languageFamily === 'JAPANESE' ? 'JLPT N5' : languageFamily === 'KOREAN' ? 'TOPIK I Level 1' : 'A1 / DELF',
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      languageFamily,
      moduleCode: `MOD-${selectedSubject.code}-01`,
      moduleName: selectedModule.title,
      sessionTitle: sessionTitle || `${selectedSubject.code} Masterclass: ${selectedModule.title}`,
      topicName: topicName || `${selectedSubject.code} Topic Unit`,
      description: description || `Pre-recorded core lesson prepared by ${instructorName} for ${selectedBatch.name}.`,
      durationMins,
      watchedMins: 0,
      status: 'NOT_STARTED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoFileName: uploadedVideoFile?.name || 'lecture_recording.mp4',
      videoFileSize: uploadedVideoFile?.size || '195 MB',
      resolution,
      instructorName,
      resources: attachedResources,
      lsrwType,
      viewsCount: 0,
      lectureDate: new Date(lectureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lectureDay,
      uploadedAt: 'Today'
    };

    onSessionUploaded(newSession);
    showSuccess(`Pre-recorded lecture "${newSession.sessionTitle}" uploaded for ${selectedBatch.name}!`);
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
                  Upload Pre-Recorded Video Lecture
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-600 text-white uppercase tracking-wider">
                  STUDY VIDEO
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Curriculum Lecture Ingestion, Cloud Storage & Study Deck Attachment
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
            {/* Step 1: Curriculum & Module Mapping */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Step 1: Curriculum Subject & Chapter Mapping
              </span>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Foreign Language Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {mockSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Student Batch Cohort */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Student Batch Cohort <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {mockBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.programName || b.departmentName || 'Foreign Language Track'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Enrolled students in this batch cohort will receive instant LMS access to this lecture video.
                </p>
              </div>

              {/* Chapter & Lead Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Module / Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {availableModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lead Instructor / Faculty Tutor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {availableTrainers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Name & Lecture Date / Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Curriculum Topic Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g. Phonetics & Social Expressions"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Lecture Date & Day <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                      {lectureDay}
                    </span>
                  </label>
                  <input
                    type="date"
                    value={lectureDate}
                    onChange={(e) => setLectureDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Video File Upload Dropzone */}
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Upload High-Definition Lecture Video (MP4 / WebM)</span> <span className="text-rose-500">*</span>
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
                        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
                      });
                    }
                  }}
                />
                <label htmlFor="lecture-video-file" className="cursor-pointer block">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop lecture video file
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    H.264 / AAC 1080p Full HD format recommended
                  </p>
                </label>

                {uploadedVideoFile && (
                  <div className="mt-3 p-2.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{uploadedVideoFile.name}</p>
                        <p className="text-[10px] text-slate-500">{uploadedVideoFile.size} • Video encoded ready for HLS streaming</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedVideoFile(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lecture Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lecture Video Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={`e.g. ${selectedSubject.code} Session 01: Vowels and Pronunciation Rules`}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lecture Overview & Key Learning Objectives <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of concepts covered in this video..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                required
              />
            </div>

            {/* Video Duration, Resolution & LSRW Skill Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  min={5}
                  max={180}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Video Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="1080p Full HD">1080p Full HD</option>
                  <option value="720p HD">720p HD</option>
                  <option value="4K UHD">4K UHD</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Primary LSRW Skill
                </label>
                <select
                  value={lsrwType}
                  onChange={(e) => setLsrwType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="SPEAKING">Speaking Drill</option>
                  <option value="LISTENING">Listening Drill</option>
                  <option value="READING">Reading Passage</option>
                  <option value="WRITING">Writing & Grammar</option>
                </select>
              </div>
            </div>

            {/* Attach Lesson Slides & Downloadable Resources */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Attach Downloadable Slides & Study Handouts (PDF / PPT / Audio)
              </label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                {attachedResources.map((res, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{res.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      {res.type} • {res.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
              Module: <strong>{selectedModule.title}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Lecture Video</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
