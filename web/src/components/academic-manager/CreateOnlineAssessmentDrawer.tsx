// ============================================================================
// ISML COLLEGE LMS — FULL FORM: 50 QUESTIONS ASSESSMENT & EXAM BUILDER DRAWER
// Academic Manager can build/edit 50 questions with 2mrk, 5mrk, 10mrk across LSRW & Grammar
// Submits to Super Admin for official executive approval
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Award,
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Wifi,
  FileCheck2,
  HelpCircle,
  Sparkles,
  Layers,
  GraduationCap,
  Send,
  CheckCircle2,
  Headphones,
  Mic,
  FileText,
  PenTool,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Download,
  Volume2,
  Upload
} from 'lucide-react';
import { AssessmentItem, AssessmentQuestionItem } from '@/types/rbac';
import { mockSubjects, mockBatches, mockPrograms, mockCourses } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import {
  assessmentStore,
  GENERATE_PRESET_50_LSRW_QUESTIONS
} from '@/services/assessmentStore';

interface CreateOnlineAssessmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCreated: (newAssessment: AssessmentItem) => void;
}

export default function CreateOnlineAssessmentDrawer({
  isOpen,
  onClose,
  onAssessmentCreated,
}: CreateOnlineAssessmentDrawerProps) {
  const { showSuccess, showError } = useToast();

  // Basic Information
  const [title, setTitle] = useState('DELF A1 National Benchmark CBT Mock Examination 2026');
  const [code, setCode] = useState('EXAM-A1-DELF-CBT');
  const [subjectName, setSubjectName] = useState(mockSubjects[0]?.name || 'French Phonetics & Oral Comprehension');
  const [batchName, setBatchName] = useState(mockBatches[0]?.name || 'French A1 Intensive Cohort 2026 (Live Webinar Batch)');
  const [programName, setProgramName] = useState(mockPrograms[0]?.name || 'Diploma in French Language Studies');
  const [facultyName, setFacultyName] = useState('Dr. Anandhakumar V.');
  const [type, setType] = useState<'FINAL_EXAM' | 'MID_TERM' | 'QUIZ' | 'ASSIGNMENT'>('FINAL_EXAM');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [durationMins, setDurationMins] = useState(90);
  const [proctoredOnline, setProctoredOnline] = useState(true);
  const [submissionRemarks, setSubmissionRemarks] = useState(
    'Comprehensive 50 Questions LSRW & Grammar Examination deck prepared in accordance with CEFR Foreign Language Standards. Requesting Super Admin approval for student CBT portal activation.'
  );

  // Active View Tab in Drawer
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'QUESTIONS_50' | 'APPROVAL_PREVIEW'>('QUESTIONS_50');

  // 50 Questions State
  const [questions, setQuestions] = useState<AssessmentQuestionItem[]>(() =>
    GENERATE_PRESET_50_LSRW_QUESTIONS('DELF A1 Examination')
  );

  // Filter for Questions View
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'GRAMMAR'>('ALL');
  const [searchQuestion, setSearchQuestion] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);

  if (!isOpen) return null;

  // Calculate dynamic total marks from questions
  const totalCalculatedMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  // Update a specific question field
  const handleUpdateQuestion = (id: number, field: keyof AssessmentQuestionItem, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Add a new question to the deck
  const handleAddNewQuestion = () => {
    const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    const defaultSection = sectionFilter === 'ALL' ? 'GRAMMAR' : sectionFilter;
    const defaultType = defaultSection === 'SPEAKING' ? 'ORAL_AUDIO' : defaultSection === 'WRITING' ? 'LONG_ESSAY' : 'MCQ';
    const newQ: AssessmentQuestionItem = {
      id: nextId,
      questionText: `New Question #${nextId}: Specify task prompt`,
      section: defaultSection,
      questionType: defaultType,
      marks: defaultType === 'LONG_ESSAY' || defaultType === 'ORAL_AUDIO' ? 5 : 2,
      options: defaultType === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: defaultType === 'MCQ' ? 'Option A' : '',
      contextPrompt: 'Contextual guideline for students',
      rubricNotes: 'Rubric criteria for tutor evaluation'
    };
    setQuestions((prev) => [...prev, newQ]);
    setExpandedQuestionId(nextId);
    showSuccess(`Question #${nextId} added to assessment.`);
  };

  // Delete a question
  const handleDeleteQuestion = (id: number) => {
    if (questions.length <= 1) {
      showError('Assessment must have at least 1 question.');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Reset to default 50 questions
  const handleResetTo50Preset = () => {
    setQuestions(GENERATE_PRESET_50_LSRW_QUESTIONS(title));
    showSuccess('Populated 50 comprehensive LSRW & Grammar questions.');
  };

  // Submit assessment to Admin for approval
  const handleSubmitToAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (questions.length === 0) {
      showError('Please add at least 1 question before submitting.');
      return;
    }

    const created = assessmentStore.createAndSubmitToAdmin({
      title,
      code,
      subjectName,
      programName,
      batchName,
      facultyName,
      type,
      totalMarks: totalCalculatedMarks,
      dueDate,
      durationMins,
      questions,
      submissionRemarks
    });

    onAssessmentCreated(created);
    showSuccess(
      `Assessment "${title}" created with ${questions.length} questions and submitted to Super Admin for approval!`
    );
    onClose();
  };

  // Filtered Questions List
  const filteredQuestions = questions.filter((q) => {
    if (sectionFilter !== 'ALL' && q.section !== sectionFilter) return false;
    if (searchQuestion.trim()) {
      const s = searchQuestion.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(s) ||
        (q.contextPrompt && q.contextPrompt.toLowerCase().includes(s)) ||
        (q.correctAnswer && q.correctAnswer.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      {/* Full-Screen Workspace Form Container */}
      <div className="relative w-full h-full bg-white flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Academic Assessment & CBT Examination Studio
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  <span>Submit to Admin for Approval</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  FULL SCREEN STUDIO
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                5 Core LSRW & Grammar Tasks • 2mrk, 5mrk, 10mrk Marks Configuration • Executive Super Admin Approval Gate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-900/60 px-3.5 py-1.5 rounded-xl border border-blue-700/60 text-xs">
              <span className="text-slate-300 font-bold">Total Marks:</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {totalCalculatedMarks}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 font-bold">Total Qs:</span>
              <span className="font-mono font-black text-cyan-300 text-sm">
                {questions.length}
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

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('QUESTIONS_50')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'QUESTIONS_50'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Questions Deck ({questions.length} Tasks)</span>
            </button>

            <button
              onClick={() => setActiveTab('DETAILS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'DETAILS'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Exam Schedule & Cohort Details</span>
            </button>

            <button
              onClick={() => setActiveTab('APPROVAL_PREVIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'APPROVAL_PREVIEW'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Admin Approval Dispatch & Impact</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetTo50Preset}
              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Reset with 5 core LSRW questions preset"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reset 5 Core LSRW Tasks</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitToAdmin} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
            {/* ══════════ TAB 1: 50 QUESTIONS QUESTIONNAIRE BUILDER ══════════ */}
            {activeTab === 'QUESTIONS_50' && (
              <div className="space-y-4">
                {/* Top Summary Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0052CC] text-white flex items-center justify-center font-black text-xs shrink-0">
                      5Q
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#0B2447]">
                        Core LSRW & Grammar Assessment Deck ({questions.length} Questions)
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Listening (Q1) • Speaking (Q2) • Reading (Q3) • Grammar (Q4) • Applied Writing (Q5) — Fully Configurable Marks (2m, 5m, 10m)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddNewQuestion}
                      className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {/* Section Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSectionFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        sectionFilter === 'ALL'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All ({questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionFilter('LISTENING')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        sectionFilter === 'LISTENING'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Headphones className="w-3 h-3" />
                      <span>Listening (2mrk)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionFilter('READING')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        sectionFilter === 'READING'
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Reading (2mrk)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionFilter('GRAMMAR')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        sectionFilter === 'GRAMMAR'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Grammar (2mrk)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionFilter('SPEAKING')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        sectionFilter === 'SPEAKING'
                          ? 'bg-teal-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                      <span>Speaking (5mrk / 10mrk)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionFilter('WRITING')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        sectionFilter === 'WRITING'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck2 className="w-3 h-3" />
                      <span>Writing (5mrk / 10mrk)</span>
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuestion}
                      onChange={(e) => setSearchQuestion(e.target.value)}
                      placeholder="Search question text or context..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>
                </div>

                {/* Questions List Accordion Cards */}
                <div className="space-y-3">
                  {filteredQuestions.map((q) => {
                    const isExpanded = expandedQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border transition-all ${
                          isExpanded
                            ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        {/* Question Card Header */}
                        <div
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-mono font-black text-xs flex items-center justify-center shrink-0">
                              #{q.id}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                q.section === 'LISTENING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : q.section === 'READING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : q.section === 'GRAMMAR'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : q.section === 'SPEAKING'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {q.section}
                            </span>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {q.questionText}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Marks Selector Pill: 2mrk, 5mrk, 10mrk */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs"
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(q.id, 'marks', 2)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  q.marks === 2
                                    ? 'bg-[#0052CC] text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                2 Marks
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(q.id, 'marks', 5)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  q.marks === 5
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                5 Marks
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(q.id, 'marks', 10)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  q.marks === 10
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                10 Marks
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(q.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Question Editing Panel */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                              {/* Section & Type */}
                              <div className="sm:col-span-3">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Section (LSRW & Grammar)
                                </label>
                                <select
                                  value={q.section}
                                  onChange={(e) =>
                                    handleUpdateQuestion(q.id, 'section', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                                >
                                  <option value="LISTENING">Listening (Audio Comprehension)</option>
                                  <option value="READING">Reading (Comprehension & Analysis)</option>
                                  <option value="GRAMMAR">Grammar & Syntax Structure</option>
                                  <option value="SPEAKING">Speaking (Phonetics & Oral Viva)</option>
                                  <option value="WRITING">Writing (Applied Task / Essay)</option>
                                </select>
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Question Format Type
                                </label>
                                <select
                                  value={q.questionType}
                                  onChange={(e) => {
                                    const nextType = e.target.value as any;
                                    setQuestions((prev) =>
                                      prev.map((item) => {
                                        if (item.id !== q.id) return item;
                                        const isNextMcq = nextType === 'MCQ';
                                        return {
                                          ...item,
                                          questionType: nextType,
                                          options: isNextMcq
                                            ? item.options?.length
                                              ? item.options
                                              : ['Option A', 'Option B', 'Option C', 'Option D']
                                            : undefined,
                                          correctAnswer: isNextMcq
                                            ? item.correctAnswer?.startsWith('Option')
                                              ? item.correctAnswer
                                              : 'Option A'
                                            : item.correctAnswer?.startsWith('Option')
                                            ? ''
                                            : item.correctAnswer,
                                        };
                                      })
                                    );
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#0052CC]"
                                >
                                  <option value="MCQ">Multiple Choice (MCQ)</option>
                                  <option value="SHORT_ANSWER">Short Answer (Typed 50 words)</option>
                                  <option value="LONG_ESSAY">Long Essay / Descriptive (Typed 150-300w)</option>
                                  <option value="GRAMMAR_FILL">Grammar Syntax & Fill-in-Blank</option>
                                  <option value="ORAL_AUDIO">Oral Viva / Audio Voice Recording (.mp3)</option>
                                  <option value="FILE_UPLOAD">File / PDF / Scanned Sheet Upload</option>
                                </select>
                              </div>

                              <div className="sm:col-span-6">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Context / Audio Prompt / Reference Material
                                </label>
                                <input
                                  type="text"
                                  value={q.contextPrompt || ''}
                                  onChange={(e) =>
                                    handleUpdateQuestion(q.id, 'contextPrompt', e.target.value)
                                  }
                                  placeholder="e.g. SNCF Paris Station announcement audio clip (Track #01)"
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                                />
                              </div>
                            </div>

                            {/* SPECIAL LISTENING AUDIO PROMPT ATTACHMENT (When Section is LISTENING or Audio Prompt is needed) */}
                            {q.section === 'LISTENING' && (
                              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                                    <Volume2 className="w-4 h-4 text-amber-700" />
                                    <span>Listening Section: Audio Track for Students to Hear during Exam</span>
                                  </span>
                                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                    Format: .MP3 / .WAV audio drill
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                                  <div className="sm:col-span-7">
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                                      Audio Track File Name / CDN Stream URL
                                    </label>
                                    <input
                                      type="text"
                                      value={q.audioPromptUrl || ''}
                                      onChange={(e) => {
                                        handleUpdateQuestion(q.id, 'audioPromptUrl', e.target.value);
                                        if (!q.referenceFileName) {
                                          handleUpdateQuestion(q.id, 'referenceFileName', 'sncf_gare_de_lyon_track01.mp3');
                                        }
                                      }}
                                      placeholder="https://assets.isml.edu.in/audio/french/sncf_announcement_a1.mp3"
                                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono text-slate-900"
                                    />
                                  </div>

                                  <div className="sm:col-span-5 flex items-end">
                                    <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-400 rounded-lg text-xs font-bold text-amber-900 cursor-pointer transition-colors shadow-2xs">
                                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                                      <span>Upload .MP3 / .WAV Audio</span>
                                      <input
                                        type="file"
                                        accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleUpdateQuestion(q.id, 'referenceFileName', file.name);
                                            handleUpdateQuestion(
                                              q.id,
                                              'audioPromptUrl',
                                              `https://assets.isml.edu.in/audio/french/${file.name}`
                                            );
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                {q.referenceFileName && (
                                  <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-white/80 p-1.5 rounded-lg border border-amber-200">
                                    <span className="font-bold">Attached Track:</span>
                                    <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-mono text-[10px]">
                                      {q.referenceFileName}
                                    </code>
                                    <span className="text-[10px] text-emerald-700 font-bold ml-auto flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Ready for Student Audio Player
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Full Question Prompt Text & Academic Manager Attachment Uploader */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  Question Prompt / Written Text Instructions <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  You can type below AND/OR upload an audio/document file as the question
                                </span>
                              </div>

                              <textarea
                                rows={2}
                                value={q.questionText}
                                onChange={(e) =>
                                  handleUpdateQuestion(q.id, 'questionText', e.target.value)
                                }
                                placeholder="Type the question instructions here, or explain what is in the attached audio/file..."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                                required
                              />

                              {/* Academic Manager Question File & Audio Attachment Bar */}
                              <div className="p-3 bg-slate-100/90 rounded-xl border border-slate-200/90 space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-[11px] font-bold text-[#0B2447] flex items-center gap-1.5">
                                    <Upload className="w-3.5 h-3.5 text-[#0052CC]" />
                                    <span>Attach Question File for Students (Audio, PDF, or Sheet)</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Students will listen to or download this during the exam
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Upload Audio Question Button */}
                                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-300 hover:border-blue-400 rounded-xl text-xs font-bold text-[#0052CC] cursor-pointer transition-colors shadow-2xs">
                                    <Volume2 className="w-3.5 h-3.5 text-[#0052CC]" />
                                    <span>Upload Question Audio (.mp3, .wav, .m4a)</span>
                                    <input
                                      type="file"
                                      accept="audio/*,.mp3,.wav,.m4a"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleUpdateQuestion(q.id, 'questionAttachmentName', file.name);
                                          handleUpdateQuestion(q.id, 'questionAttachmentType', 'AUDIO');
                                          handleUpdateQuestion(
                                            q.id,
                                            'questionAttachmentUrl',
                                            `https://assets.isml.edu.in/questions/audio/${file.name}`
                                          );
                                        }
                                      }}
                                    />
                                  </label>

                                  {/* Upload Document / Question Sheet Button */}
                                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 border border-purple-300 hover:border-purple-400 rounded-xl text-xs font-bold text-purple-700 cursor-pointer transition-colors shadow-2xs">
                                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                                    <span>Upload Question Document (.pdf, .docx, .png)</span>
                                    <input
                                      type="file"
                                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleUpdateQuestion(q.id, 'questionAttachmentName', file.name);
                                          handleUpdateQuestion(
                                            q.id,
                                            'questionAttachmentType',
                                            file.name.match(/\.(jpg|jpeg|png)$/i) ? 'IMAGE' : 'DOCUMENT'
                                          );
                                          handleUpdateQuestion(
                                            q.id,
                                            'questionAttachmentUrl',
                                            `https://assets.isml.edu.in/questions/docs/${file.name}`
                                          );
                                        }
                                      }}
                                    />
                                  </label>

                                  {q.questionAttachmentName && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateQuestion(q.id, 'questionAttachmentName', undefined);
                                        handleUpdateQuestion(q.id, 'questionAttachmentUrl', undefined);
                                        handleUpdateQuestion(q.id, 'questionAttachmentType', undefined);
                                      }}
                                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline ml-auto"
                                    >
                                      Remove Attachment
                                    </button>
                                  )}
                                </div>

                                {/* Active Attachment Preview Pill */}
                                {q.questionAttachmentName && (
                                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-300 text-xs">
                                    {q.questionAttachmentType === 'AUDIO' ? (
                                      <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                                    )}
                                    <span className="font-bold text-slate-800 truncate">
                                      {q.questionAttachmentName}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 ml-auto shrink-0 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      {q.questionAttachmentType === 'AUDIO' ? 'Student Audio Player Active' : 'Student Download File Attached'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Options ONLY if MCQ */}
                            {q.questionType === 'MCQ' && (
                              <div className="space-y-2.5 p-3.5 bg-blue-50/50 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#0B2447] uppercase tracking-wider block">
                                    Multiple Choice Options (A, B, C, D)
                                  </span>
                                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded-full">
                                    Click A, B, C or D pill to choose correct key
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {(q.options && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D']).map(
                                    (opt, optIdx) => {
                                      const optLetter = String.fromCharCode(65 + optIdx);
                                      const isCorrect = q.correctAnswer?.startsWith(optLetter) || q.correctAnswer === opt;
                                      return (
                                        <div
                                          key={optIdx}
                                          className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                                            isCorrect
                                              ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                                              : 'bg-white border-slate-200 hover:border-slate-300'
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleUpdateQuestion(q.id, 'correctAnswer', `${optLetter}: ${opt}`);
                                            }}
                                            className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                              isCorrect
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                            title="Click to set as correct answer"
                                          >
                                            {optLetter}
                                          </button>
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                              const updatedOpts = [
                                                ...(q.options && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'])
                                              ];
                                              updatedOpts[optIdx] = e.target.value;
                                              handleUpdateQuestion(q.id, 'options', updatedOpts);
                                              if (isCorrect) {
                                                handleUpdateQuestion(q.id, 'correctAnswer', `${optLetter}: ${e.target.value}`);
                                              }
                                            }}
                                            placeholder={`Enter choice ${optLetter}...`}
                                            className="flex-1 px-2 py-1 bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none"
                                          />
                                          {isCorrect && (
                                            <span className="text-[10px] font-bold text-emerald-700 mr-2 shrink-0">
                                              Correct Key ✓
                                            </span>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Short Answer / Long Essay Specific Controls */}
                            {(q.questionType === 'SHORT_ANSWER' || q.questionType === 'LONG_ESSAY') && (
                              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#0B2447] flex items-center gap-1.5">
                                    <PenTool className="w-3.5 h-3.5 text-[#0052CC]" />
                                    <span>Written Text Response Configuration ({q.questionType === 'SHORT_ANSWER' ? 'Short Answer' : 'Long Essay'})</span>
                                  </span>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-600 font-bold">Word Limit:</span>
                                    <input
                                      type="number"
                                      value={q.wordLimit || (q.questionType === 'SHORT_ANSWER' ? 50 : 250)}
                                      onChange={(e) =>
                                        handleUpdateQuestion(q.id, 'wordLimit', Number(e.target.value))
                                      }
                                      className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                                    />
                                    <span className="text-slate-500 text-[11px]">words</span>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Sample Benchmark / Ideal Model Answer (For Tutor Auto-Rubric)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={q.sampleModelAnswer || ''}
                                    onChange={(e) =>
                                      handleUpdateQuestion(q.id, 'sampleModelAnswer', e.target.value)
                                    }
                                    placeholder="Enter ideal high-scoring French paragraph/sentences for tutor comparison..."
                                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Oral Audio / Voice Recording Controls */}
                            {q.questionType === 'ORAL_AUDIO' && (
                              <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-teal-950 flex items-center gap-1.5">
                                    <Mic className="w-3.5 h-3.5 text-teal-700" />
                                    <span>Student Speaking Submission: Audio / Voice Recording Upload</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                                    Audio Upload Required (.MP3 / .M4A / .WAV)
                                  </span>
                                </div>

                                {/* Quick format selection pills for Audio */}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1.5">
                                    Allowed Student Audio Formats:
                                  </label>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {['.mp3', '.m4a', '.wav', '.webm'].map((fmt) => {
                                      const currentList = q.allowedFileTypes || ['.mp3', '.m4a', '.wav'];
                                      const isSelected = currentList.includes(fmt);

                                      return (
                                        <button
                                          key={fmt}
                                          type="button"
                                          onClick={() => {
                                            const updated = isSelected
                                              ? currentList.filter((f) => f !== fmt)
                                              : [...currentList, fmt];
                                            handleUpdateQuestion(q.id, 'allowedFileTypes', updated);
                                          }}
                                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                            isSelected
                                              ? 'bg-teal-700 text-white shadow-2xs'
                                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>{fmt.toUpperCase()}</span>
                                          {isSelected && <span>✓</span>}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                    Phonetic Rubric Criteria for Grading Tutor
                                  </label>
                                  <input
                                    type="text"
                                    value={q.sampleModelAnswer || 'Guttural [ʁ], nasal vowels [ɑ̃, ɔ̃], natural intonation'}
                                    onChange={(e) =>
                                      handleUpdateQuestion(q.id, 'sampleModelAnswer', e.target.value)
                                    }
                                    placeholder="e.g. Check for guttural [ʁ] articulation and nasal vowels"
                                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                            )}

                            {/* File Upload / Scanned PDF Sheet Controls */}
                            {q.questionType === 'FILE_UPLOAD' && (
                              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                                    <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
                                    <span>Student File Upload Task: Documents, Audio, or Scanned Sheets</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                                    Multi-Format Support
                                  </span>
                                </div>

                                {/* Quick format selector pills: MP3, PDF, DOCX, JPG */}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1.5">
                                    Select What Students Are Allowed to Upload:
                                  </label>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {[
                                      { ext: '.pdf', label: 'PDF Document (.pdf)' },
                                      { ext: '.mp3', label: 'Audio MP3 (.mp3)' },
                                      { ext: '.docx', label: 'Word Doc (.docx)' },
                                      { ext: '.jpg', label: 'Scanned Image (.jpg / .png)' },
                                    ].map((fmtItem) => {
                                      const currentList = q.allowedFileTypes || ['.pdf', '.jpg', '.jpeg'];
                                      const isSelected = currentList.some((f) => f.includes(fmtItem.ext.replace('.', '')));

                                      return (
                                        <button
                                          key={fmtItem.ext}
                                          type="button"
                                          onClick={() => {
                                            const updated = isSelected
                                              ? currentList.filter((f) => !f.includes(fmtItem.ext.replace('.', '')))
                                              : [...currentList, fmtItem.ext];
                                            handleUpdateQuestion(q.id, 'allowedFileTypes', updated);
                                          }}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                              ? 'bg-purple-700 text-white shadow-2xs'
                                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>{fmtItem.label}</span>
                                          {isSelected && <span>✓</span>}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Custom Allowed Extensions
                                    </label>
                                    <input
                                      type="text"
                                      value={(q.allowedFileTypes || ['.pdf', '.jpg', '.jpeg', '.docx']).join(', ')}
                                      onChange={(e) =>
                                        handleUpdateQuestion(
                                          q.id,
                                          'allowedFileTypes',
                                          e.target.value.split(',').map((s) => s.trim())
                                        )
                                      }
                                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Reference Attachment / Template File Name
                                    </label>
                                    <input
                                      type="text"
                                      value={q.referenceFileName || ''}
                                      onChange={(e) =>
                                        handleUpdateQuestion(q.id, 'referenceFileName', e.target.value)
                                      }
                                      placeholder="e.g. DELF_A1_Writing_Template_2026.pdf"
                                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Dynamic Correct Answer / Key & Rubric Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  {q.questionType === 'MCQ'
                                    ? 'Correct Answer Key (Selected from options above)'
                                    : q.questionType === 'ORAL_AUDIO'
                                    ? 'Spoken Monologue Transcript / Benchmark Key'
                                    : q.questionType === 'FILE_UPLOAD'
                                    ? 'Expected Evaluation Criteria / Solution Summary'
                                    : q.questionType === 'SHORT_ANSWER'
                                    ? 'Correct Short Answer Benchmark Key'
                                    : q.questionType === 'LONG_ESSAY'
                                    ? 'Model Thesis / Key Argument Points'
                                    : 'Correct Benchmark Answer / Key'}
                                </label>
                                <input
                                  type="text"
                                  value={q.correctAnswer || ''}
                                  onChange={(e) =>
                                    handleUpdateQuestion(q.id, 'correctAnswer', e.target.value)
                                  }
                                  placeholder={
                                    q.questionType === 'MCQ'
                                      ? 'e.g. Option A'
                                      : q.questionType === 'SHORT_ANSWER'
                                      ? 'e.g. Exact French answer sentence or phrase'
                                      : q.questionType === 'LONG_ESSAY'
                                      ? 'e.g. Expected DELF structure: Introduction, Body, Conclusion'
                                      : q.questionType === 'ORAL_AUDIO'
                                      ? 'e.g. Bonjour, je m\'appelle Arun, j\'ai 22 ans...'
                                      : q.questionType === 'FILE_UPLOAD'
                                      ? 'e.g. Formally completed DELF A1 worksheet submission'
                                      : 'e.g. Conjugated auxiliary verb and agreement'
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Tutor Scoring Rubric Guideline
                                </label>
                                <input
                                  type="text"
                                  value={q.rubricNotes || ''}
                                  onChange={(e) =>
                                    handleUpdateQuestion(q.id, 'rubricNotes', e.target.value)
                                  }
                                  placeholder={
                                    q.questionType === 'ORAL_AUDIO'
                                      ? 'e.g. Phonetics (4m), Grammar (3m), Vocabulary (3m)'
                                      : q.questionType === 'LONG_ESSAY'
                                      ? 'e.g. Structure & Politeness (4m), Connectors (3m), Orthography (3m)'
                                      : q.questionType === 'MCQ'
                                      ? 'e.g. Full marks for correct option, 0 for incorrect'
                                      : 'e.g. Award full marks for accurate spelling & syntax'
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════ TAB 2: SCHEDULE & COHORT DETAILS ══════════ */}
            {activeTab === 'DETAILS' && (
              <div className="space-y-4 max-w-3xl mx-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-2.5">
                  <Wifi className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-[#0B2447]">100% Online Computer-Based Exam (CBT)</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Exam window will open automatically for enrolled students once Super Admin approves this assessment.
                    </p>
                  </div>
                </div>

                {/* Exam Title & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exam / Assessment Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. DELF A1 National Benchmark CBT Mock Examination 2026"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exam Reference Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. EXAM-A1-DELF"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* Assessment Type & Assigned Faculty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Examination Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value="FINAL_EXAM">Final Semester / National Certification Mock</option>
                      <option value="MID_TERM">Mid-Term Diagnostic Assessment</option>
                      <option value="QUIZ">Interactive Continuous Quiz</option>
                      <option value="ASSIGNMENT">Written Task Assignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chief Examiner / Lead Faculty
                    </label>
                    <input
                      type="text"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* Subject and Target Batch */}
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Target Language Course & Student Batch Cohort
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Foreign Language Subject <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      {mockSubjects.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Course Track
                      </label>
                      <select
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        {mockCourses.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Target Student Batch <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        {mockBatches.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Exam Due Date & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Online Exam Scheduled Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exam Duration (Minutes)
                    </label>
                    <select
                      value={durationMins}
                      onChange={(e) => setDurationMins(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value={30}>30 Minutes (Quick Quiz)</option>
                      <option value={60}>60 Minutes (1 Hour Test)</option>
                      <option value={90}>90 Minutes (Standard Exam)</option>
                      <option value={120}>120 Minutes (Full Certification)</option>
                    </select>
                  </div>
                </div>

                {/* Proctoring */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0B2447]">Webcam & Audio Proctoring</p>
                    <p className="text-[10px] text-slate-500">Require student camera and mic verification during test</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={proctoredOnline}
                    onChange={(e) => setProctoredOnline(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ══════════ TAB 3: ADMIN APPROVAL PREVIEW ══════════ */}
            {activeTab === 'APPROVAL_PREVIEW' && (
              <div className="space-y-4 max-w-3xl mx-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-950 text-sm">
                      Executive Super Admin Authorization Workflow
                    </p>
                    <p className="text-amber-800">
                      As per ISML College Governance, assessments containing 50 questions require formal Super Admin approval. Upon submission, an entry is automatically created in the Super Admin Approval Center (`/super-admin/approvals`).
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Assessment Submission Snapshot
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Title:</span>
                      <span className="font-bold text-slate-900">{title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Cohort:</span>
                      <span className="font-bold text-slate-900">{batchName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Questions:</span>
                      <span className="font-mono font-bold text-cyan-700">{questions.length} Questions</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Marks:</span>
                      <span className="font-mono font-bold text-emerald-700">{totalCalculatedMarks} Marks</span>
                    </div>
                  </div>
                </div>

                {/* Submission Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Manager Submission Remarks for Super Admin <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={submissionRemarks}
                    onChange={(e) => setSubmissionRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    This note will be visible to the Super Admin in the executive audit ledger.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status upon submit:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                PENDING_ADMIN_APPROVAL
              </span>
            </div>

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
                className="px-5 py-2 bg-gradient-to-r from-[#0052CC] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Assessment to Super Admin</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
