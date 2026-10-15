// ============================================================================
// ISML COLLEGE LMS — ADVANCED 3-PANEL COURSE BUILDER STUDIO
// Modeled directly after NEET Platform Enterprise Course Builder Architecture:
// 1. Left Panel: Interactive Course Syllabus Tree (Subjects -> Chapters -> Topics)
// 2. Center Panel: Modular Content Block Workspace (Key Concept, Notes, Formulas, 
//    Worked Examples, Practice Questions, Text, PDF, Videos, External Links)
// 3. Right Panel: Topic Properties, Metadata, Settings & Learning Competencies
// 4. Modal: High-Fidelity Student Preview (Desktop & Mobile Simulation)
// ============================================================================

"use client";

import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Folder,
  FileText,
  GripVertical,
  Edit3,
  Trash2,
  Copy,
  Check,
  Eye,
  Send,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Award,
  Video,
  Link as LinkIcon,
  Upload,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  ExternalLink,
  X,
  Sigma,
  GraduationCap,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Headphones,
  Volume2,
  Mic,
  FileUp,
  Download,
  Play,
  Paperclip,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import {
  mockCourses,
  mockSubjects,
  mockLevels,
  mockModules,
  mockTopics,
} from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

// Block types matching NEET_platform & ISML language pedagogy
export type ContentBlockType =
  | 'KEY_CONCEPT'
  | 'IMPORTANT_NOTE'
  | 'FORMULA'
  | 'WORKED_EXAMPLE'
  | 'PRACTICE_QUESTION'
  | 'TEXT'
  | 'AUDIO'
  | 'PDF'
  | 'VIDEO'
  | 'LINK';

export interface ContentBlock {
  id: string;
  topicId: string;
  type: ContentBlockType;
  title: string;
  data: {
    text?: string;
    description?: string;
    formula?: string;
    question?: string;
    solution?: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    url?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    lsrwSkill?: 'L' | 'S' | 'R' | 'W' | 'GENERAL';
  };
}

const BLOCK_META_CONFIG: Record<
  ContentBlockType,
  { label: string; icon: any; color: string; bg: string; border: string; desc: string; lsrwBadge: string }
> = {
  AUDIO: {
    label: 'Audio Drill / Listening (LSRW - L)',
    icon: Headphones,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    desc: 'Upload MP3/WAV/AAC audio pronunciation, oral dictation, listening comprehension',
    lsrwBadge: 'LISTENING',
  },
  PDF: {
    label: 'Reading Worksheet / Document (LSRW - R/W)',
    icon: FileUp,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    desc: 'Upload PDF, DOCX, EPUB worksheets, grammar drills, character tracing sheets',
    lsrwBadge: 'READING & WRITING',
  },
  VIDEO: {
    label: 'Video Masterclass / Speaking (LSRW - S)',
    icon: Video,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Upload MP4/WebM video clip, native accent demonstration, dialogue roleplay',
    lsrwBadge: 'SPEAKING',
  },
  KEY_CONCEPT: {
    label: 'Key Concept',
    icon: Lightbulb,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Pedagogical foundation, grammar laws, pronunciation benchmarks',
    lsrwBadge: 'THEORY',
  },
  IMPORTANT_NOTE: {
    label: 'Important Note',
    icon: AlertCircle,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Critical exception, cultural etiquette, exam warning',
    lsrwBadge: 'ALERT',
  },
  FORMULA: {
    label: 'Sentence Formula / Syntax',
    icon: Sigma,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    desc: 'Linguistic patterns, conjugation rules, structural formula',
    lsrwBadge: 'GRAMMAR',
  },
  WORKED_EXAMPLE: {
    label: 'Worked Dialogue & Breakdown',
    icon: GraduationCap,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    desc: 'Conversational roleplay with detailed step-by-step translation',
    lsrwBadge: 'PRACTICE',
  },
  PRACTICE_QUESTION: {
    label: 'Practice Quiz / MCQ',
    icon: HelpCircle,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Formative checkpoint with option verification and rationale',
    lsrwBadge: 'ASSESSMENT',
  },
  TEXT: {
    label: 'Rich Text Lecture Note',
    icon: FileText,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    desc: 'Standard instructional paragraph and contextual definitions',
    lsrwBadge: 'NOTES',
  },
  LINK: {
    label: 'External Web Link',
    icon: LinkIcon,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    desc: 'Online dictionary link, external CEFR portal, external website URL',
    lsrwBadge: 'WEB LINK',
  },
};

function NeetCourseBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  const courseIdParam = searchParams.get('courseId') || mockCourses[0]?.id || 'crs-01';
  const topicIdParam = searchParams.get('topicId') || '';
  const moduleIdParam = searchParams.get('moduleId') || '';
  const subjectIdParam = searchParams.get('subjectId') || '';

  // Active Selected Course
  const [activeCourseId, setActiveCourseId] = useState(courseIdParam);
  const selectedCourse = useMemo(() => {
    return mockCourses.find((c) => c.id === activeCourseId) || mockCourses[0];
  }, [activeCourseId]);

  // Selected Topic in outline
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (topicIdParam) return topicIdParam;
    return mockTopics[0]?.id || 'top-fr-01';
  });

  // Expanded nodes state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-fr-01': true,
    'mod-fr-02': true,
    'mod-de-01': true,
  });

  // Layout UI Toggles (NEET Platform style panels)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isAddBlockPickerOpen, setIsAddBlockPickerOpen] = useState(false);

  // Active Topic entity
  const activeTopic = useMemo(() => {
    return mockTopics.find((t) => t.id === selectedTopicId) || mockTopics[0];
  }, [selectedTopicId]);

  // Topic Metadata in right properties panel
  const [topicName, setTopicName] = useState(activeTopic?.title || 'Lesson Title');
  const [topicObjective, setTopicObjective] = useState(activeTopic?.learningObjective || '');
  const [skillMapped, setSkillMapped] = useState(activeTopic?.skillMapped || 'Listening & Pronunciation');
  const [durationMins, setDurationMins] = useState(45);
  const [completionRule, setCompletionRule] = useState<'NONE' | 'OPEN' | 'WATCHED_FULL'>('OPEN');
  const [isSaving, setIsSaving] = useState(false);

  // Initial Content Blocks State (NEET Platform Modular Block Architecture)
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: 'blk-01',
      topicId: 'top-fr-01',
      type: 'KEY_CONCEPT',
      title: 'Core Linguistic Concept: Nasal Vowels & Liaison',
      data: {
        text: 'In French phonetics, when a vowel is followed by n or m in the same syllable, the vowel becomes nasalized. Furthermore, liaison connects the silent final consonant of a word to the initial vowel of the following word.',
      },
    },
    {
      id: 'blk-02',
      topicId: 'top-fr-01',
      type: 'IMPORTANT_NOTE',
      title: 'Formal "Vous" vs Informal "Tu" Distinction',
      data: {
        text: 'Always use "Vous" in professional, academic, or institutional settings with elders, supervisors, or acquaintances. Using "Tu" prematurely is considered impolite.',
      },
    },
    {
      id: 'blk-03',
      topicId: 'top-fr-01',
      type: 'FORMULA',
      title: 'Sentence Pattern: Formal Self-Introduction',
      data: {
        formula: 'Bonjour, je m\'appelle [Name] + je suis [Profession/Student] + chez [Institution].',
        description: 'Standard formula for meeting academic and professional peers.',
      },
    },
    {
      id: 'blk-04',
      topicId: 'top-fr-01',
      type: 'WORKED_EXAMPLE',
      title: 'Dialogue Example: Morning Briefing at ISML Campus',
      data: {
        question: 'How do you greet your French professor at 9:00 AM and ask about today\'s lecture?',
        solution: 'Student: "Bonjour Monsieur le Professeur, comment allez-vous aujourd\'hui ?"\nProfessor: "Bonjour Marc, je vais très bien. Êtes-vous prêt pour le cours de phonétique ?"\nStudent: "Oui professeur, tout à fait."',
      },
    },
    {
      id: 'blk-05',
      topicId: 'top-fr-01',
      type: 'PRACTICE_QUESTION',
      title: 'Self-Check Drill: Vowel Identification',
      data: {
        question: 'Which of the following phrases demonstrates mandatory liaison in spoken French?',
        options: [
          'A) Les étudiants arrivent',
          'B) Elle mange du pain',
          'C) Le chat dort',
          'D) Bonjour monsieur',
        ],
        correctAnswer: 'A) Les étudiants arrivent',
        explanation: 'The silent "s" in "Les" sounds like a [z] sound when linking to "étudiants".',
      },
    },
    {
      id: 'blk-06',
      topicId: 'top-fr-01',
      type: 'AUDIO',
      title: 'Listening Drill: Native French Vowel Nasalization Audio.mp3',
      data: {
        fileName: 'french_nasal_vowels_drill_01.mp3',
        fileSize: '4.2 MB',
        fileType: 'audio/mpeg',
        lsrwSkill: 'L',
        url: 'https://isml.edu/resources/audio/french_nasal_vowels_drill_01.mp3',
        description: 'Native Parisian accent phonetic listening exercise for vowel nasalization distinction (an, on, in).',
      },
    },
    {
      id: 'blk-07',
      topicId: 'top-fr-01',
      type: 'PDF',
      title: 'Reading & Writing Worksheet: French Alphabet & IPA Guide.pdf',
      data: {
        fileName: 'french-alphabet-ipa-worksheet.pdf',
        fileSize: '2.4 MB',
        fileType: 'application/pdf',
        lsrwSkill: 'R',
        url: 'https://isml.edu/resources/french-alphabet-guide.pdf',
        description: 'Complete phonetic pronunciation chart, IPA transcriptions and character handwriting practice.',
      },
    },
    {
      id: 'blk-08',
      topicId: 'top-fr-01',
      type: 'VIDEO',
      title: 'Speaking Demonstration: Pronunciation & Mouth Positioning.mp4',
      data: {
        fileName: 'french_speaking_mouth_position.mp4',
        fileSize: '38.5 MB',
        fileType: 'video/mp4',
        lsrwSkill: 'S',
        url: 'https://isml.edu/resources/videos/french_speaking_mouth_position.mp4',
        description: 'High-definition video showing native speaker mouth shape and tongue position for difficult French phonemes.',
      },
    },
    {
      id: 'blk-09',
      topicId: 'top-fr-01',
      type: 'LINK',
      title: 'Interactive Phonetics Online Lab (CEFR Portal)',
      data: {
        url: 'https://phonetique.free.fr/alpha.htm',
        description: 'Interactive audio dictionary and external French CEFR benchmark test simulator.',
      },
    },
  ]);

  // Update properties when selected topic changes
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    const found = mockTopics.find((t) => t.id === topicId);
    if (found) {
      setTopicName(found.title);
      setTopicObjective(found.learningObjective);
      setSkillMapped(found.skillMapped);
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Block management
  const handleAddBlock = (type: ContentBlockType) => {
    const meta = BLOCK_META_CONFIG[type];
    let defaultLsrw: 'L' | 'S' | 'R' | 'W' | 'GENERAL' = 'GENERAL';
    if (type === 'AUDIO') defaultLsrw = 'L';
    else if (type === 'VIDEO') defaultLsrw = 'S';
    else if (type === 'PDF') defaultLsrw = 'R';

    const newBlock: ContentBlock = {
      id: `blk-${Date.now()}`,
      topicId: selectedTopicId,
      type,
      title: `New ${meta.label}`,
      data: {
        text: type === 'TEXT' ? 'Enter instructional text content here...' : '',
        formula: type === 'FORMULA' ? 'Subject + Auxiliary Verb + Past Participle' : undefined,
        question: type === 'PRACTICE_QUESTION' ? 'Sample verification question...' : undefined,
        options: type === 'PRACTICE_QUESTION' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
        correctAnswer: type === 'PRACTICE_QUESTION' ? 'Option A' : undefined,
        url: type === 'LINK' ? 'https://isml.edu/portal' : undefined,
        lsrwSkill: defaultLsrw,
      },
    };
    setBlocks((prev) => [...prev, newBlock]);
    setIsAddBlockPickerOpen(false);
    showSuccess(`Added "${meta.label}" block.`);
  };

  // Direct File Upload Handler for Audio / Document / Video / LSRW Assets
  const handleFileUpload = (blockId: string, file: File, skill?: 'L' | 'S' | 'R' | 'W') => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const fakeObjectUrl = URL.createObjectURL(file);

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          title: file.name,
          data: {
            ...b.data,
            fileName: file.name,
            fileSize: `${sizeInMB} MB`,
            fileType: file.type,
            url: fakeObjectUrl,
            lsrwSkill: skill || b.data.lsrwSkill || 'GENERAL',
          },
        };
      })
    );
    showSuccess(`Uploaded "${file.name}" (${sizeInMB} MB) successfully.`);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    showSuccess('Block deleted.');
  };

  const handleDuplicateBlock = (block: ContentBlock) => {
    const dup: ContentBlock = {
      ...block,
      id: `blk-${Date.now()}`,
      title: `${block.title} (Copy)`,
    };
    setBlocks((prev) => [...prev, dup]);
    showSuccess('Block duplicated.');
  };

  const handleUpdateBlockField = (id: string, field: string, value: any) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          data: {
            ...b.data,
            [field]: value,
          },
        };
      })
    );
  };

  const handleSaveCourse = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showSuccess(`Curriculum Topic "${topicName}" saved and published successfully!`);
    }, 500);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP BUILDER HEADER (Sticky Studio Workspace Bar)                      */}
      {/* ========================================================================= */}
      <header className="shrink-0 z-30 bg-white border-b border-slate-200/90 px-4 py-2.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/academic-manager/curriculum')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-slate-200/70"
            title="Return to Curriculum Hub"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Course Name & Active Topic Header */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-[#0052CC] border border-blue-200/70 px-2 py-0.5 rounded-md shrink-0">
                {selectedCourse?.code || 'ISML-LANG'}
              </span>
              <span className="text-xs font-bold text-[#0B2447] truncate max-w-[160px] sm:max-w-[260px] md:max-w-[340px]">
                {selectedCourse?.name || 'Certification Course'}
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-slate-500 truncate max-w-[140px] sm:max-w-[200px] hidden sm:inline">
                {topicName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Preview Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Panel Toggles */}
          <button
            onClick={() => setIsLeftPanelOpen((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer hidden md:flex items-center gap-1.5 ${
              isLeftPanelOpen ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs' : 'bg-white text-slate-400 border-slate-200'
            }`}
            title="Toggle Course Outline Panel"
          >
            {isLeftPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-bold">Outline</span>
          </button>

          <button
            onClick={() => setIsRightPanelOpen((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer hidden lg:flex items-center gap-1.5 ${
              isRightPanelOpen ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs' : 'bg-white text-slate-400 border-slate-200'
            }`}
            title="Toggle Properties Panel"
          >
            {isRightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-bold">Properties</span>
          </button>

          {/* Top Quick Add Content Block Button */}
          <button
            onClick={() => setIsAddBlockPickerOpen((prev) => !prev)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Insert a new content block"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Content Block</span>
            <span className="sm:hidden">Add Block</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          {/* Student Live Preview Button */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200/80 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Student Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>

          {/* Publish & Save CTA */}
          <button
            onClick={handleSaveCourse}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Topic</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-PANEL STUDIO WORKSPACE                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full max-w-full">
        {/* PANEL 1 (LEFT): COURSE SYLLABUS OUTLINE TREE */}
        {isLeftPanelOpen && (
          <aside className="w-64 xl:w-72 bg-white border-r border-slate-200/90 flex flex-col shrink-0 overflow-hidden h-full">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0052CC]" />
                <span className="text-xs font-bold text-[#0B2447] uppercase tracking-wider">
                  Course Outline Tree
                </span>
              </div>
              <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs">
                {mockModules.length} Chapters
              </span>
            </div>

            {/* Tree Container with Level Grouping (e.g. A1, A2 or N5, N4) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {mockLevels.slice(0, 3).map((lvl) => {
                const lvlModules = mockModules.filter(
                  (m) => m.levelId === lvl.id || (m.subjectId === lvl.subjectId && m.levelCode === lvl.levelCode)
                );
                const lvlTopicsCount = mockTopics.filter((t) => lvlModules.some((m) => m.id === t.moduleId)).length;

                return (
                  <div key={lvl.id} className="space-y-2">
                    {/* Level Track Header */}
                    <div className="flex items-center justify-between px-2 py-1 bg-purple-100/60 border border-purple-200/80 rounded-lg">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Award className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span className="text-[11px] font-extrabold text-purple-900 truncate">
                          Level {lvl.levelCode}: {lvl.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-white px-1.5 py-0.2 rounded border border-purple-200 shrink-0">
                        {lvlModules.length} Units
                      </span>
                    </div>

                    {/* Modules under this level */}
                    <div className="space-y-2 pl-1.5 border-l-2 border-purple-200/70">
                      {(lvlModules.length > 0 ? lvlModules : mockModules.slice(0, 1)).map((mod) => {
                        const isExpanded = expandedModules[mod.id] ?? true;
                        const modTopics = mockTopics.filter((t) => t.moduleId === mod.id);

                        return (
                          <div key={mod.id} className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden transition-all">
                            {/* Chapter Header */}
                            <button
                              onClick={() => toggleModule(mod.id)}
                              className="w-full flex items-center justify-between p-2.5 hover:bg-slate-100/80 transition text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    Unit {mod.moduleNumber}: {mod.title}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {modTopics.length} Topics · {mod.estimatedHours}h
                                  </span>
                                </div>
                              </div>
                            </button>

                            {/* Topics Sub-Tree */}
                            {isExpanded && (
                              <div className="bg-white border-t border-slate-100 p-1.5 space-y-1">
                                {modTopics.map((top) => {
                                  const isSelected = top.id === selectedTopicId;
                                  return (
                                    <button
                                      key={top.id}
                                      onClick={() => handleSelectTopic(top.id)}
                                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer text-xs ${
                                        isSelected
                                          ? 'bg-blue-50/80 text-[#0052CC] font-bold border border-blue-200 shadow-2xs'
                                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#0052CC]' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                          #{top.topicNumber} {top.title}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                                        {blocks.filter((b) => b.topicId === top.id).length || 7} blk
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Module Footer */}
            <div className="p-3 border-t border-slate-200/90 bg-white shrink-0">
              <button
                onClick={() => showSuccess('New Chapter added to course.')}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chapter / Unit</span>
              </button>
            </div>
          </aside>
        )}

        {/* PANEL 2 (CENTER): MODULAR CONTENT BLOCK WORKSPACE */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 flex flex-col items-center min-h-0 min-w-0 bg-slate-100/70">
          <div className="max-w-3xl w-full space-y-4 pb-16">
            {/* Active Topic Card Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] font-mono font-bold text-[#0052CC] bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-md">
                  Topic Content Canvas
                </span>
                <span className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-md">
                  {blocks.length} Content Blocks Attached
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2447]">{topicName}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{topicObjective}</p>
            </div>

            {/* TOP "ADD CONTENT BLOCK" BAR & QUICK PICKER */}
            <div className="rounded-2xl border border-purple-200/80 bg-white p-3 shadow-xs">
              {!isAddBlockPickerOpen ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Add Learning Blocks to Topic</p>
                      <p className="text-[11px] text-slate-400">Insert concepts, practice quiz, audio/video, formula or study material</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddBlockPickerOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Content Block</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Choose Block Type to Insert
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsAddBlockPickerOpen(false)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Close Block Selector"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Grid of block options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(BLOCK_META_CONFIG) as ContentBlockType[]).map((bType) => {
                      const cfg = BLOCK_META_CONFIG[bType];
                      const IconComp = cfg.icon;
                      return (
                        <button
                          key={bType}
                          onClick={() => handleAddBlock(bType)}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition text-left cursor-pointer group bg-slate-50/50 hover:shadow-xs"
                        >
                          <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                              {cfg.label}
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                              {cfg.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Content Blocks Render List */}
            <div className="space-y-4">
              {blocks.map((blk, idx) => {
                const meta = BLOCK_META_CONFIG[blk.type] || BLOCK_META_CONFIG.TEXT;
                const IconComponent = meta.icon;

                return (
                  <div
                    key={blk.id}
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Block Title & Controls Header */}
                    <div className={`px-4 py-2.5 border-b flex items-center justify-between ${meta.bg} ${meta.border}`}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab shrink-0" />
                        <div className={`w-7 h-7 rounded-lg bg-white ${meta.color} flex items-center justify-center shrink-0 shadow-2xs border border-white/60`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/80 border ${meta.border} ${meta.color} shrink-0`}>
                          {meta.label}
                        </span>
                        <input
                          type="text"
                          value={blk.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBlocks((prev) =>
                              prev.map((b) => (b.id === blk.id ? { ...b, title: val } : b))
                            );
                          }}
                          className="text-xs font-bold text-slate-900 bg-transparent hover:bg-white/70 focus:bg-white border-none outline-none focus:ring-1 focus:ring-slate-300 rounded px-2 py-0.5 transition flex-1 min-w-0"
                        />
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => handleDuplicateBlock(blk)}
                          className="p-1.5 hover:bg-white/80 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Duplicate Block"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(blk.id)}
                          className="p-1.5 hover:bg-white/80 rounded-lg text-rose-500 hover:text-rose-700 transition cursor-pointer"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Block Body Interactive Editor */}
                    <div className="p-4 sm:p-5 space-y-3 text-xs bg-white">
                      {/* KEY CONCEPT & IMPORTANT NOTE & TEXT */}
                      {(blk.type === 'KEY_CONCEPT' || blk.type === 'IMPORTANT_NOTE' || blk.type === 'TEXT') && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Instructional Content & Guidance
                          </label>
                          <textarea
                            rows={3}
                            value={blk.data.text || ''}
                            onChange={(e) => handleUpdateBlockField(blk.id, 'text', e.target.value)}
                            placeholder="Type learning content, explanation, or key takeaways..."
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 leading-relaxed font-medium resize-none transition"
                          />
                        </div>
                      )}

                      {/* FORMULA / PATTERN */}
                      {blk.type === 'FORMULA' && (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block mb-1">
                              Sentence Pattern / Syntax Formula
                            </label>
                            <input
                              type="text"
                              value={blk.data.formula || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'formula', e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-violet-200 bg-violet-50/30 text-violet-950 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-violet-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Formula Usage Notes
                            </label>
                            <input
                              type="text"
                              value={blk.data.description || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'description', e.target.value)}
                              placeholder="e.g. Applicable for academic and formal workplace dialogue"
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      )}

                      {/* WORKED EXAMPLE */}
                      {blk.type === 'WORKED_EXAMPLE' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                              Conversational Context / Prompt
                            </label>
                            <textarea
                              rows={2}
                              value={blk.data.question || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'question', e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                              Step-by-Step Breakdown & Output
                            </label>
                            <textarea
                              rows={3}
                              value={blk.data.solution || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'solution', e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs text-emerald-950 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                        </div>
                      )}

                      {/* PRACTICE QUESTION / MCQ */}
                      {blk.type === 'PRACTICE_QUESTION' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                              Question Prompt
                            </label>
                            <input
                              type="text"
                              value={blk.data.question || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'question', e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              MCQ Options (Select / Edit)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(blk.data.options || []).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-2.5 py-1.5">
                                  <span className="w-5 h-5 rounded-md bg-white text-slate-500 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(blk.data.options || [])];
                                      newOpts[optIdx] = e.target.value;
                                      handleUpdateBlockField(blk.id, 'options', newOpts);
                                    }}
                                    className="bg-transparent text-xs text-slate-800 outline-none flex-1 min-w-0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AUDIO, PDF, VIDEO (FILE UPLOAD & LSRW ASSETS) */}
                      {(blk.type === 'AUDIO' || blk.type === 'PDF' || blk.type === 'VIDEO') && (
                        <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                          {/* File Details & LSRW Competency Switcher */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                                {blk.type} Asset
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {blk.data.fileName || blk.title}
                              </span>
                            </div>

                            {/* LSRW Skill Selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LSRW Skill:</span>
                              {(['L', 'S', 'R', 'W'] as const).map((skill) => {
                                const isSkillSelected = blk.data.lsrwSkill === skill;
                                const skillLabels: Record<string, string> = {
                                  L: 'L - Listening',
                                  S: 'S - Speaking',
                                  R: 'R - Reading',
                                  W: 'W - Writing',
                                };
                                return (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleUpdateBlockField(blk.id, 'lsrwSkill', skill)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition cursor-pointer ${
                                      isSkillSelected
                                        ? 'bg-[#0052CC] text-white shadow-2xs'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                    title={skillLabels[skill]}
                                  >
                                    {skill}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Upload Dropzone / File Picker or Existing File Display */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* File Upload Box */}
                            <div className="flex flex-col justify-center items-center border-2 border-dashed border-slate-300 hover:border-purple-500 bg-white hover:bg-purple-50/30 rounded-xl p-4 transition-all cursor-pointer relative group">
                              <input
                                type="file"
                                accept={
                                  blk.type === 'AUDIO'
                                    ? 'audio/mp3,audio/wav,audio/aac,audio/m4a,audio/ogg'
                                    : blk.type === 'VIDEO'
                                    ? 'video/mp4,video/webm,video/mkv'
                                    : '.pdf,.doc,.docx,.epub,.txt,.xls,.xlsx,.ppt,.pptx'
                                }
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(blk.id, file);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                                <Upload className="w-4 h-4" />
                              </div>
                              <p className="text-xs font-bold text-slate-800 text-center">
                                Click or Drag {blk.type} File to Upload
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 text-center">
                                {blk.type === 'AUDIO' && 'Supports MP3, WAV, AAC, M4A (Audio drill / dictation)'}
                                {blk.type === 'PDF' && 'Supports PDF, Word, EPUB (Worksheets, reading cards)'}
                                {blk.type === 'VIDEO' && 'Supports MP4, WebM 1080p (Video pronunciation demo)'}
                              </p>
                            </div>

                            {/* Active Upload Info & Media Player */}
                            <div className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Current File Status
                                  </span>
                                  {blk.data.fileSize && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {blk.data.fileSize}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-bold text-slate-900 truncate mt-1">
                                  {blk.data.fileName || 'No file selected yet'}
                                </p>
                              </div>

                              {/* Interactive Audio Player Preview */}
                              {blk.type === 'AUDIO' && blk.data.url && (
                                <div className="space-y-1 bg-teal-50/70 p-2 rounded-lg border border-teal-200">
                                  <div className="flex items-center gap-1.5 text-teal-800 text-[10px] font-bold">
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Listening Audio Track</span>
                                  </div>
                                  <audio controls src={blk.data.url} className="w-full h-8 mt-1" />
                                </div>
                              )}

                              {/* Video Player Preview */}
                              {blk.type === 'VIDEO' && blk.data.url && (
                                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video max-h-32 flex items-center justify-center">
                                  <video controls src={blk.data.url} className="w-full h-full object-contain" />
                                </div>
                              )}

                              {/* PDF / Document Download Button */}
                              {blk.type === 'PDF' && (
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[10px] text-slate-500 font-medium">Ready for student download</span>
                                  <a
                                    href={blk.data.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition flex items-center gap-1 shadow-2xs"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Open Document</span>
                                  </a>
                                </div>
                              )}

                              {/* Optional External Fallback URL */}
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Or Cloud Storage URL
                                </label>
                                <input
                                  type="text"
                                  value={blk.data.url || ''}
                                  onChange={(e) => handleUpdateBlockField(blk.id, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full text-[11px] font-mono text-blue-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Contextual Description */}
                          <div>
                            <input
                              type="text"
                              value={blk.data.description || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'description', e.target.value)}
                              placeholder="Add instructions or learning tips for this file (e.g. Listen twice before speaking)..."
                              className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-purple-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* EXTERNAL WEB LINK BLOCK */}
                      {blk.type === 'LINK' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Web Resource URL
                            </span>
                            <input
                              type="text"
                              value={blk.data.url || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'url', e.target.value)}
                              placeholder="https://..."
                              className="w-full text-xs font-mono font-bold text-blue-700 bg-transparent border-none outline-none focus:bg-white rounded px-1.5 py-0.5"
                            />
                            <input
                              type="text"
                              value={blk.data.description || ''}
                              onChange={(e) => handleUpdateBlockField(blk.id, 'description', e.target.value)}
                              placeholder="Description of external web lab or tool..."
                              className="w-full text-[11px] text-slate-500 bg-transparent border-none outline-none px-1.5"
                            />
                          </div>
                          <a
                            href={blk.data.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-2xs"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NEET Platform-style "Add Content Block" Dropdown Trigger */}
            <div className="pt-2">
              {!isAddBlockPickerOpen ? (
                <button
                  onClick={() => setIsAddBlockPickerOpen(true)}
                  className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-600 bg-white hover:bg-purple-50/40 text-purple-700 text-xs font-extrabold transition-all shadow-2xs hover:shadow-sm cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="uppercase tracking-wider">Add Content Block</span>
                  <Sparkles className="h-4 w-4 text-amber-500 opacity-90 group-hover:rotate-12 transition-transform" />
                </button>
              ) : (
                <div className="p-5 rounded-3xl bg-white border border-purple-300 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Select Block Type to Insert</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Click any card below to add directly into canvas</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddBlockPickerOpen(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Grid of block options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {(Object.keys(BLOCK_META_CONFIG) as ContentBlockType[]).map((bType) => {
                      const cfg = BLOCK_META_CONFIG[bType];
                      const IconComp = cfg.icon;
                      return (
                        <button
                          key={bType}
                          onClick={() => handleAddBlock(bType)}
                          className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition text-left cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                              {cfg.label}
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                              {cfg.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* PANEL 3 (RIGHT): TOPIC PROPERTIES & LEARNING METADATA */}
        {isRightPanelOpen && (
          <aside className="w-64 xl:w-80 bg-white border-l border-slate-200/90 flex flex-col shrink-0 overflow-hidden h-full">
            <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 shrink-0 bg-slate-50/50">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-[#0B2447] uppercase tracking-wider">
                Topic Properties & Meta
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Skill Competency (LSRW)
                </label>
                <select
                  value={skillMapped}
                  onChange={(e) => setSkillMapped(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="Listening & Pronunciation (LSRW - L)">Listening & Pronunciation (LSRW - L)</option>
                  <option value="Speaking & Conversational Fluency (LSRW - S)">Speaking & Conversational Fluency (LSRW - S)</option>
                  <option value="Reading & Reading Comprehension (LSRW - R)">Reading & Reading Comprehension (LSRW - R)</option>
                  <option value="Writing & Grammar Synthesis (LSRW - W)">Writing & Grammar Synthesis (LSRW - W)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Estimated Study Time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="text-xs text-slate-500 font-bold shrink-0">Minutes</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Completion Verification Rule
                </label>
                <select
                  value={completionRule}
                  onChange={(e) => setCompletionRule(e.target.value as any)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="OPEN">Marked Complete Upon Reading</option>
                  <option value="WATCHED_FULL">Pass Formative Quiz Required</option>
                  <option value="NONE">No Mandatory Tracking</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Pedagogical Objective
                </label>
                <textarea
                  rows={3}
                  value={topicObjective}
                  onChange={(e) => setTopicObjective(e.target.value)}
                  placeholder="Learning outcomes expected..."
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Status info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Publish State</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Status</span>
                  <StatusBadge status="ACTIVE" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Version</span>
                  <span className="font-mono">v1.2 (Active)</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. STUDENT LIVE PREVIEW — FULL SCREEN LEARNING EXPERIENCE & TAB/DESKTOP   */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 h-screen w-full overflow-hidden animate-in fade-in duration-200">
          {/* Top Fullscreen Preview Control Bar */}
          <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Student LMS Live Experience Preview
                  </h3>
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Student Mode
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Simulating active learner viewport in real-time
                </p>
              </div>
            </div>

            {/* Viewport Device Switcher: Desktop vs Tablet vs Mobile */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Full Desktop LMS Experience"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    previewDevice === 'tablet'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tablet / iPad Screen View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tab View</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Smartphone Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Exit Full Screen Preview */}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Exit Preview"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Preview</span>
              </button>
            </div>
          </header>

          {/* Full Screen Interactive Preview Arena */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 flex justify-center items-start">
            <div
              className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
                previewDevice === 'mobile'
                  ? 'w-[375px] min-h-[680px] rounded-[36px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] my-auto'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] min-h-[720px] rounded-3xl border-8 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] my-2'
                  : 'w-full max-w-5xl rounded-2xl border border-slate-200/90 shadow-2xl my-1'
              }`}
            >
              {/* Device Frame Notch/Speaker on Mobile */}
              {previewDevice === 'mobile' && (
                <div className="h-5 bg-slate-800 w-full flex items-center justify-center shrink-0">
                  <div className="w-16 h-1 rounded-full bg-slate-600" />
                </div>
              )}

              {/* Simulated Student Portal Header Bar */}
              <div className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0052CC] text-white flex items-center justify-center text-xs font-black">
                    ISML
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider truncate">
                      {selectedCourse?.code || 'ISML-LANG'} • {selectedCourse?.name || 'Certification Track'}
                    </p>
                    <p className="text-xs font-bold text-white truncate">
                      Unit 1: Salutations & Phonetics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    45m estimated
                  </span>
                </div>
              </div>

              {/* Body Content Container (Desktop side layout vs Tablet/Mobile stack) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Active Lesson Hero Banner */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/80 p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white text-[#0052CC] border border-blue-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      Lesson Competency: {skillMapped}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Progress: 0 / {blocks.length} Completed
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-[#0B2447] tracking-tight">
                    {topicName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {topicObjective || 'Complete the exercises and master the linguistic competencies below.'}
                  </p>
                </div>

                {/* Rendered Modular Learning Blocks */}
                <div className="space-y-4">
                  {blocks.map((blk) => {
                    const meta = BLOCK_META_CONFIG[blk.type];
                    const IconC = meta.icon;

                    if (blk.type === 'KEY_CONCEPT') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1">
                          <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            {blk.title}
                          </span>
                          <p className="text-xs text-amber-950 leading-relaxed font-medium">{blk.data.text}</p>
                        </div>
                      );
                    }

                    if (blk.type === 'IMPORTANT_NOTE') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1">
                          <span className="text-[10px] font-bold text-rose-800 uppercase flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {blk.title}
                          </span>
                          <p className="text-xs text-rose-950 leading-relaxed font-medium">{blk.data.text}</p>
                        </div>
                      );
                    }

                    if (blk.type === 'FORMULA') {
                      return (
                        <div key={blk.id} className="p-3 rounded-xl border border-violet-200 bg-violet-50/70 space-y-1">
                          <span className="text-[10px] font-bold text-violet-800 uppercase">{blk.title}</span>
                          <p className="font-mono text-xs font-bold text-violet-950 bg-white/70 p-2 rounded-lg border border-violet-200">
                            {blk.data.formula}
                          </p>
                        </div>
                      );
                    }

                    if (blk.type === 'WORKED_EXAMPLE') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 space-y-2">
                          <span className="text-[10px] font-bold text-indigo-800 uppercase">{blk.title}</span>
                          <div className="text-xs font-semibold text-slate-800">{blk.data.question}</div>
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 whitespace-pre-line">
                            {blk.data.solution}
                          </div>
                        </div>
                      );
                    }

                    if (blk.type === 'PRACTICE_QUESTION') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">{blk.title}</span>
                          <p className="text-xs font-bold text-slate-800">{blk.data.question}</p>
                          <div className="space-y-1">
                            {(blk.data.options || []).map((o, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                                {o}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (blk.type === 'AUDIO') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-teal-800 uppercase flex items-center gap-1.5">
                              <Headphones className="w-3.5 h-3.5 text-teal-600" />
                              {blk.title}
                            </span>
                            <span className="text-[9px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                              LSRW - LISTENING
                            </span>
                          </div>
                          {blk.data.description && (
                            <p className="text-xs text-teal-950 font-medium">{blk.data.description}</p>
                          )}
                          {blk.data.url ? (
                            <audio controls src={blk.data.url} className="w-full h-8 mt-1" />
                          ) : (
                            <div className="p-2 bg-white rounded border border-teal-200 text-[11px] text-teal-700 italic">
                              Audio track uploaded: {blk.data.fileName || 'Audio stream'} ({blk.data.fileSize || '3.5 MB'})
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (blk.type === 'VIDEO') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-blue-600" />
                              {blk.title}
                            </span>
                            <span className="text-[9px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              LSRW - SPEAKING DEMO
                            </span>
                          </div>
                          {blk.data.description && (
                            <p className="text-xs text-blue-950 font-medium">{blk.data.description}</p>
                          )}
                          {blk.data.url ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black aspect-video max-h-48 flex items-center justify-center">
                              <video controls src={blk.data.url} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-blue-200 text-center text-xs text-blue-800 font-semibold">
                              Video Lecture: {blk.data.fileName || 'Demonstration'} ({blk.data.fileSize || '35 MB'})
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (blk.type === 'PDF') {
                      return (
                        <div key={blk.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 flex items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <FileUp className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="text-xs font-bold text-rose-950 truncate">{blk.title}</span>
                            </div>
                            <p className="text-[11px] text-rose-800 line-clamp-1">{blk.data.description || 'Downloadable study worksheet & grammar drill'}</p>
                            <span className="inline-block text-[9px] font-extrabold text-rose-700 bg-white px-1.5 py-0.2 rounded border border-rose-200">
                              LSRW - READING & WRITING ({blk.data.fileSize || '2.4 MB'})
                            </span>
                          </div>
                          <a
                            href={blk.data.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0 shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      );
                    }

                    if (blk.type === 'LINK') {
                      return (
                        <div key={blk.id} className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 flex items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                              {blk.title}
                            </span>
                            <p className="text-[11px] text-sky-800 line-clamp-1">{blk.data.description || blk.data.url}</p>
                          </div>
                          <a
                            href={blk.data.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0 shadow-2xs"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    }

                    return (
                      <div key={blk.id} className="text-xs text-slate-800 leading-relaxed p-2 bg-slate-50 rounded-lg">
                        {blk.data.text}
                      </div>
                    );
                  })}
                </div>

                {/* Mark as read */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold opacity-80 cursor-default"
                  >
                    Mark Lesson as Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NeetCourseBuilderStudioPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading Course Builder Studio...</p>
        </div>
      </div>
    }>
      <NeetCourseBuilderContent />
    </Suspense>
  );
}
