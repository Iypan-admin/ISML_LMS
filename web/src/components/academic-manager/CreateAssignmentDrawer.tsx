// ============================================================================
// ISML COLLEGE LMS — PROFESSIONAL FULL SCREEN ASSIGNMENT CREATOR STUDIO
// Maps Assignments to Courses, Batches, Subjects, and LSRW Skills
// Includes dual attachments: Academic Manager Worksheet / Audio & Student Deliverable Specs
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  X,
  Upload,
  Calendar,
  Layers,
  BookOpen,
  Users,
  Headphones,
  Mic,
  FileText,
  PenTool,
  CheckCircle2,
  FileCheck2,
  Music,
  Video,
  Trash2,
  Volume2,
  Sparkles,
  Sliders,
  Send,
  Eye,
  Info,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { HomeworkAssignment, AssignmentLsrwSkill } from '@/mock/assignments';
import { mockSubjects, mockCourses, mockBatches } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateAssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: (newAssignment: HomeworkAssignment) => void;
}

export default function CreateAssignmentDrawer({
  isOpen,
  onClose,
  onAssignmentCreated,
}: CreateAssignmentDrawerProps) {
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState<'STUDIO' | 'PREVIEW'>('STUDIO');

  const [selectedSubjectId, setSelectedSubjectId] = useState(mockSubjects[0]?.id || 'subj-fr101');
  const selectedSubject = useMemo(() => {
    return mockSubjects.find(s => s.id === selectedSubjectId) || mockSubjects[0];
  }, [selectedSubjectId]);

  // Infer Language Family
  const languageFamily = useMemo<'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN'>(() => {
    if (selectedSubject.code.startsWith('JA')) return 'JAPANESE';
    if (selectedSubject.code.startsWith('KO')) return 'KOREAN';
    if (selectedSubject.code.startsWith('ES')) return 'SPANISH';
    if (selectedSubject.code.startsWith('DE')) return 'GERMAN';
    return 'FRENCH';
  }, [selectedSubject]);

  // Filter Courses and Batches relevant
  const availableCourses = useMemo(() => {
    return mockCourses.filter(c => c.department.includes(selectedSubject.name.split(':')[0]) || c.name.toLowerCase().includes(languageFamily.toLowerCase()));
  }, [selectedSubject, languageFamily]);

  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || 'crs-01');
  const selectedCourse = useMemo(() => {
    return mockCourses.find(c => c.id === selectedCourseId) || mockCourses[0];
  }, [selectedCourseId]);

  const [selectedBatchId, setSelectedBatchId] = useState(mockBatches[0]?.id || 'batch-2026-fr');
  const selectedBatch = useMemo(() => {
    return mockBatches.find(b => b.id === selectedBatchId) || mockBatches[0];
  }, [selectedBatchId]);

  const [lsrwSkill, setLsrwSkill] = useState<AssignmentLsrwSkill>('WRITING');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [moduleName, setModuleName] = useState('Module 1: Foundations & Phonetics');
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [dueTime, setDueTime] = useState('23:59');

  // Allowed Student Submission Formats (Checklist)
  const [allowedStudentFormats, setAllowedStudentFormats] = useState<string[]>([
    '.pdf',
    '.docx',
    '.jpg'
  ]);

  // Dynamic File Upload configuration based on LSRW Skill Selection
  const skillFileConfig = useMemo(() => {
    switch (lsrwSkill) {
      case 'LISTENING':
        return {
          label: 'Teacher Audio Resource / Dialogue Clip (.mp3, .wav, .m4a)',
          accept: 'audio/*,.mp3,.wav,.m4a',
          defaultName: `${languageFamily.toLowerCase()}_listening_dialogue_track01.mp3`,
          defaultSize: '4.8 MB',
          badgeText: 'Audio Resource Active',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-300',
          bgColor: 'bg-blue-50/70',
          hint: 'Students will listen to this audio in their portal before writing/submitting answers',
          fileTypeTag: 'AUDIO RESOURCE'
        };
      case 'SPEAKING':
        return {
          label: 'Pronunciation Reference Video / Audio Prompt',
          accept: 'audio/*,video/*,.mp3,.wav,.mp4',
          defaultName: `${languageFamily.toLowerCase()}_speaking_benchmark_model.mp4`,
          defaultSize: '12.4 MB',
          badgeText: 'Oral Benchmark Active',
          iconColor: 'text-rose-600',
          borderColor: 'border-rose-300',
          bgColor: 'bg-rose-50/70',
          hint: 'Native speaker pronunciation model or speaking situation prompt',
          fileTypeTag: 'ORAL BENCHMARK'
        };
      case 'READING':
        return {
          label: 'Reading Comprehension Article / Dossier Sheet (.pdf, .docx)',
          accept: '.pdf,.docx,.txt',
          defaultName: `${languageFamily.toLowerCase()}_reading_passage_dossier.pdf`,
          defaultSize: '1.6 MB',
          badgeText: 'Passage Attached',
          iconColor: 'text-emerald-600',
          borderColor: 'border-emerald-300',
          bgColor: 'bg-emerald-50/70',
          hint: 'Reading text article or newspaper excerpt students need to analyze',
          fileTypeTag: 'READING DOSSIER'
        };
      case 'WRITING':
      default:
        return {
          label: 'Writing Worksheet Template / Prompt Brief (.pdf, .docx)',
          accept: '.pdf,.docx,.txt',
          defaultName: `${languageFamily.toLowerCase()}_handwriting_worksheet_template.pdf`,
          defaultSize: '1.2 MB',
          badgeText: 'Worksheet Template Attached',
          iconColor: 'text-purple-600',
          borderColor: 'border-purple-300',
          bgColor: 'bg-purple-50/70',
          hint: 'Fillable worksheet, handwriting grid, or prompt rubrics for learners',
          fileTypeTag: 'WORKSHEET TEMPLATE'
        };
    }
  }, [lsrwSkill, languageFamily]);

  // File Upload state (auto-updates dynamically with skill selection)
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type?: string } | null>({
    name: 'french_handwriting_worksheet_template.pdf',
    size: '1.2 MB'
  });

  // When LSRW skill changes, set appropriate default formats and presets
  React.useEffect(() => {
    setAttachedFile({
      name: skillFileConfig.defaultName,
      size: skillFileConfig.defaultSize
    });

    if (lsrwSkill === 'LISTENING') {
      setAllowedStudentFormats(['.pdf', '.docx', '.txt']);
    } else if (lsrwSkill === 'SPEAKING') {
      setAllowedStudentFormats(['.mp3', '.m4a', '.wav', '.mp4']);
    } else if (lsrwSkill === 'READING') {
      setAllowedStudentFormats(['.pdf', '.docx']);
    } else {
      setAllowedStudentFormats(['.pdf', '.docx', '.jpg']);
    }
  }, [skillFileConfig, lsrwSkill]);

  if (!isOpen) return null;

  const toggleStudentFormat = (fmt: string) => {
    if (allowedStudentFormats.includes(fmt)) {
      if (allowedStudentFormats.length > 1) {
        setAllowedStudentFormats(prev => prev.filter(f => f !== fmt));
      }
    } else {
      setAllowedStudentFormats(prev => [...prev, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAssignment: HomeworkAssignment = {
      id: `asg-${Date.now().toString().slice(-4)}`,
      title: title || `${selectedSubject.code} ${lsrwSkill} Assignment: ${selectedCourse.name}`,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      languageFamily,
      lsrwSkill,
      moduleCode: `MOD-${selectedSubject.code}-01`,
      moduleName: moduleName || 'Foundations & Practical Unit 1',
      dueDate: `${dueDate} at ${dueTime}`,
      status: 'PENDING',
      instructions: instructions || `Complete the assigned ${lsrwSkill.toLowerCase()} exercises for ${languageFamily} cohort.`,
      attachedFile: attachedFile ? {
        name: attachedFile.name,
        size: attachedFile.size,
        downloadUrl: '#'
      } : undefined,
      maxScore
    };

    onAssignmentCreated(newAssignment);
    showSuccess(`Assignment "${newAssignment.title}" published for ${selectedBatch.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      {/* Full-Screen Workspace Form Container */}
      <div className="relative w-full h-full bg-white flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Executive Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <ClipboardList className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Academic Assignment & Worksheet Publishing Studio
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  FULL SCREEN STUDIO
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>NAAC / CEFR Standards</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Target Foreign Language • Batch Cohort Mapping • Audio/Doc Resource Upload • Student Submission Controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-blue-900/60 px-3.5 py-1.5 rounded-xl border border-blue-700/60 text-xs">
              <span className="text-slate-300 font-bold">Max Marks:</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {maxScore}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 font-bold">Skill:</span>
              <span className="font-mono font-black text-cyan-300 text-xs">
                {lsrwSkill}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
              title="Close Full Screen Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Fast Metadata Summary */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 py-2">
            <button
              type="button"
              onClick={() => setActiveTab('STUDIO')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'STUDIO'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Assignment Studio & Configuration</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'PREVIEW'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Student Portal Preview</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <strong className="text-slate-800">{selectedCourse.name}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <strong className="text-indigo-900">{selectedBatch.name}</strong>
            </span>
          </div>
        </div>

        {/* Main Workspace Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          
          {activeTab === 'STUDIO' ? (
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-100/60">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* SECTION 1: TARGET PROGRAM, COURSE & BATCH COHORT */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center text-[11px] font-black">1</span>
                      <span>Target Language, Course & Batch Cohort</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Select which cohort will receive and submit this assignment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Foreign Language Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Foreign Language Level / Subject <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        {mockSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} — {s.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Language Family: <strong>{languageFamily}</strong>
                      </p>
                    </div>

                    {/* Course */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target Course Curriculum <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        {mockCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Code: {selectedCourse.code || 'CRS-ISML'}
                      </p>
                    </div>

                    {/* Batch Cohort */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target Student Batch Cohort <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        {mockBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-indigo-700 font-semibold mt-1">
                        Enrolled learners in this batch will be notified
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: LSRW COMPETENCY & SKILL FOCUS */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center text-[11px] font-black">2</span>
                      <span>LSRW Competency & Primary Skill Focus</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Select primary modality to adapt student upload requirements
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setLsrwSkill('LISTENING')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        lsrwSkill === 'LISTENING'
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Listening (Compréhension)</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Audio/Podcast drill with response worksheet</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLsrwSkill('SPEAKING')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        lsrwSkill === 'SPEAKING'
                          ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Speaking (Production Orale)</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Phonetics viva or voice monologue recording</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLsrwSkill('READING')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        lsrwSkill === 'READING'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Reading (Compréhension Écrite)</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Passage analysis & text comprehension</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLsrwSkill('WRITING')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        lsrwSkill === 'WRITING'
                          ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Writing (Production Écrite)</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Handwritten worksheet or composition essay</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* SECTION 3: ASSIGNMENT TITLE, MODULE & DETAILED INSTRUCTIONS */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center text-[11px] font-black">3</span>
                      <span>Task Brief & Student Instructions</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Clear prompt guidelines and CEFR rubric instructions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Assignment Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`e.g. ${selectedSubject.code} ${lsrwSkill} Assignment: Salutations & Phonetic Accents`}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Curriculum Module Tag <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        placeholder="e.g. Module 1: Salutations et Phonétique"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Student Homework Instructions & Rubric Brief <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder={`Provide full instructions for students in ${selectedBatch.name}. Mention expected length, vocabulary guidelines, formatting rules, and whether handwriting or audio recording is mandatory...`}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      required
                    />
                  </div>
                </div>

                {/* SECTION 4: TEACHER ATTACHMENT & STUDENT UPLOAD CONTROLS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Academic Manager Resource Upload */}
                  <div className={`p-5 rounded-2xl border ${skillFileConfig.borderColor} ${skillFileConfig.bgColor} space-y-3.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#0052CC]" />
                        <span>Teacher Resource / Audio Attachment</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {skillFileConfig.fileTypeTag}
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-white hover:border-blue-400 transition-all">
                      <input
                        type="file"
                        id="fullscreen-assignment-file"
                        accept={skillFileConfig.accept}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const sizeFormatted = f.size > 1024 * 1024
                              ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
                              : `${(f.size / 1024).toFixed(0)} KB`;
                            setAttachedFile({
                              name: f.name,
                              size: sizeFormatted
                            });
                          }
                        }}
                      />
                      <label htmlFor="fullscreen-assignment-file" className="cursor-pointer block">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs">
                          {lsrwSkill === 'LISTENING' && <Volume2 className="w-5 h-5 text-blue-600" />}
                          {lsrwSkill === 'SPEAKING' && <Mic className="w-5 h-5 text-rose-600" />}
                          {lsrwSkill === 'READING' && <FileText className="w-5 h-5 text-emerald-600" />}
                          {lsrwSkill === 'WRITING' && <PenTool className="w-5 h-5 text-purple-600" />}
                        </div>

                        <p className="text-xs font-bold text-slate-800">
                          Click to upload {lsrwSkill === 'LISTENING' ? 'Audio Track (.mp3, .wav)' : 'Worksheet / Prompt File (.pdf, .docx)'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {skillFileConfig.hint}
                        </p>
                      </label>

                      {attachedFile && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-left">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {lsrwSkill === 'LISTENING' ? (
                              <Volume2 className="w-5 h-5 text-blue-600 shrink-0" />
                            ) : (
                              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{attachedFile.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {attachedFile.size} • Attached to Student Assignment Portal
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0 ml-2"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Permitted Student Upload Formats & Due Date */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                    <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider block">
                      Permitted Student Submission Formats
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Select which file types students are allowed to submit for this assignment:
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { ext: '.pdf', label: 'PDF Document' },
                        { ext: '.mp3', label: 'MP3 Voice / Audio' },
                        { ext: '.m4a', label: 'M4A Audio' },
                        { ext: '.wav', label: 'WAV Audio' },
                        { ext: '.docx', label: 'Word Document' },
                        { ext: '.jpg', label: 'Scanned Image (.jpg)' },
                        { ext: '.png', label: 'Photo (.png)' },
                        { ext: '.mp4', label: 'Video Clip (.mp4)' },
                      ].map((item) => {
                        const isSelected = allowedStudentFormats.includes(item.ext);
                        return (
                          <button
                            key={item.ext}
                            type="button"
                            onClick={() => toggleStudentFormat(item.ext)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className="text-[10px] font-mono opacity-80 uppercase">{item.ext}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Submission Deadline Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Deadline Time & Max Marks <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                            required
                          />
                          <input
                            type="number"
                            value={maxScore}
                            onChange={(e) => setMaxScore(Number(e.target.value))}
                            min={10}
                            max={200}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ) : (
            /* PREVIEW TAB: Exact Student View Mockup */
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong>Student Portal Simulation:</strong> This is exactly how students enrolled in <strong>{selectedBatch.name}</strong> will see this assignment.
                  </span>
                </div>

                {/* Assignment Student Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-[#0B2447] text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500 text-white uppercase">
                        {lsrwSkill} ASSIGNMENT
                      </span>
                      <span className="text-xs text-blue-200 font-medium">
                        {selectedSubject.code} • {selectedCourse.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {title || 'French A1 Salutations & Accent Marks Handwriting Drill'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Target Batch: {selectedBatch.name} • Max Score: {maxScore} Marks
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Instructions from Academic Manager / Tutor:
                      </h4>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        {instructions || 'Complete the exercises on accent marks and upload your response as a PDF document.'}
                      </div>
                    </div>

                    {/* Attached Audio or Document Player */}
                    {attachedFile && (
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-2">
                          {lsrwSkill === 'LISTENING' ? <Volume2 className="w-4 h-4 text-amber-800" /> : <FileText className="w-4 h-4 text-amber-800" />}
                          <span>{lsrwSkill === 'LISTENING' ? 'Audio Resource for Students (Listen & Answer)' : 'Attached Reference Template File'}</span>
                        </span>
                        
                        <div className="p-3 bg-white rounded-lg border border-amber-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {lsrwSkill === 'LISTENING' ? (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center font-bold">
                                ▶
                              </div>
                            ) : (
                              <FileCheck2 className="w-5 h-5 text-emerald-600" />
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900">{attachedFile.name}</p>
                              <p className="text-[10px] text-slate-500">{attachedFile.size} • Ready for download / playback</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#0052CC] underline cursor-pointer">
                            Download File
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Student Submission Upload Box */}
                    <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70 text-center space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Student Upload Area</p>
                      <p className="text-[11px] text-slate-500">
                        Permitted formats: {allowedStudentFormats.join(', ').toUpperCase()}
                      </p>
                      <button type="button" disabled className="px-4 py-1.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed">
                        Browse Student File to Submit
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1 font-semibold text-rose-600">
                        <Clock className="w-3.5 h-3.5" />
                        Due Date: {dueDate} at {dueTime}
                      </span>
                      <span className="font-bold text-slate-700">
                        Max Score: {maxScore} Marks
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer Bar */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Publishing to:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-700" />
                <span>{selectedBatch.name}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#0052CC] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Publish Assignment to Students</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
