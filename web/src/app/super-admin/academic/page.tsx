// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN: ACADEMIC ARCHITECTURE & COURSE BATCH EXPLORER
// Modern, clean, spacious UI/UX with responsive Course & Batch Cards,
// Course Builder Workspace, Live Lesson Inspector, and Student Live Preview.
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Folder,
  FileText,
  Eye,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Award,
  Video,
  Link as LinkIcon,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  X,
  Sigma,
  GraduationCap,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Headphones,
  FileUp,
  Download,
  Play,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  Filter,
  BarChart3,
  BookMarked,
  SlidersHorizontal,
} from 'lucide-react';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import { Batch, AcademicTopic } from '@/types/rbac';
import {
  mockCourses,
  mockBatches,
  mockSubjects,
  mockLevels,
  mockModules,
  mockTopics,
} from '@/mock/superAdminData';

// Content Block Types matching Academic Manager Course Builder
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
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; desc: string; lsrwBadge: string }
> = {
  AUDIO: {
    label: 'Audio Drill / Listening (LSRW - L)',
    icon: Headphones,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    desc: 'Audio pronunciation, oral dictation, listening comprehension drills',
    lsrwBadge: 'LISTENING',
  },
  PDF: {
    label: 'Reading Worksheet / Document (LSRW - R/W)',
    icon: FileUp,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    desc: 'PDF, DOCX worksheets, grammar drills, character tracing sheets',
    lsrwBadge: 'READING & WRITING',
  },
  VIDEO: {
    label: 'Video Masterclass / Speaking (LSRW - S)',
    icon: Video,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Native accent demonstration, dialogue roleplay & lecture clip',
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
    desc: 'Online dictionary link, external CEFR portal, benchmark website URL',
    lsrwBadge: 'WEB LINK',
  },
};

// Course-specific and topic-specific learning blocks for realistic Course Builder experience
const COURSE_LEARNING_BLOCKS: Record<string, ContentBlock[]> = {
  'crs-01': [
    {
      id: 'blk-fr-01',
      topicId: 'top-fr-01',
      type: 'KEY_CONCEPT',
      title: 'Core Linguistic Concept: Nasal Vowels & Phonetic Liaison',
      data: {
        text: 'In French phonetics, when a vowel is followed by n or m in the same syllable, the vowel becomes nasalized ([ɑ̃], [ɛ̃], [ɔ̃], [œ̃]). Furthermore, liaison connects the silent final consonant of a word to the initial vowel of the following word (e.g. "les_amis").',
      },
    },
    {
      id: 'blk-fr-02',
      topicId: 'top-fr-01',
      type: 'IMPORTANT_NOTE',
      title: 'Formal "Vous" vs Informal "Tu" Distinction (CEFR A1)',
      data: {
        text: 'Always use "Vous" in professional, academic, or institutional settings with tutors, professors, elders, and colleagues. Using "Tu" prematurely violates French polite registers (Vouvoiement).',
      },
    },
    {
      id: 'blk-fr-03',
      topicId: 'top-fr-01',
      type: 'FORMULA',
      title: 'Sentence Pattern: Formal Self-Introduction Syntax',
      data: {
        formula: 'Bonjour, je m\'appelle [Nom] + je suis étudiant(e) à [Institution] + j\'apprends le français.',
        description: 'Standard formula for greeting academic and corporate interlocutors in Francophone contexts.',
      },
    },
    {
      id: 'blk-fr-04',
      topicId: 'top-fr-01',
      type: 'WORKED_EXAMPLE',
      title: 'Dialogue Example: Morning Briefing at ISML Campus',
      data: {
        question: 'How do you greet your French professor at 09:00 AM and ask about today\'s phonetics lecture?',
        solution: 'Student: "Bonjour Madame Fontaine, comment allez-vous aujourd\'hui ?"\nProfessor: "Bonjour Marc, je vais très bien, merci. Êtes-vous prêt pour le cours de phonétique ?"\nStudent: "Oui Madame, j\'ai préparé les exercices de liaison."',
      },
    },
    {
      id: 'blk-fr-05',
      topicId: 'top-fr-01',
      type: 'PRACTICE_QUESTION',
      title: 'Self-Check Drill: French Liaison Identification',
      data: {
        question: 'Which of the following phrases demonstrates mandatory phonetic liaison in spoken French?',
        options: [
          'A) Les étudiants arrivent à la bibliothèque',
          'B) Elle mange du pain frais',
          'C) Le garçon regarde la télévision',
          'D) Demain nous allons marcher',
        ],
        correctAnswer: 'A',
        explanation: 'In "Les étudiants" (/le.z‿e.ty.djɑ̃/), the plural article "Les" links its silent \'s\' as a /z/ sound to the initial vowel of "étudiants".',
      },
    },
    {
      id: 'blk-fr-06',
      topicId: 'top-fr-01',
      type: 'AUDIO',
      title: 'Liaison & Nasal Vowel Minimal Pairs (Native Speaker Drill)',
      data: {
        fileName: 'french_a1_nasal_vowels_native_drill.mp3',
        fileSize: '4.2 MB',
        description: 'Listen to native Parisian French pronunciation: an vs on vs un, and oral vowel pairings.',
        lsrwSkill: 'L',
      },
    },
    {
      id: 'blk-fr-07',
      topicId: 'top-fr-01',
      type: 'PDF',
      title: 'French A1 Alphabet & Phonetics IPA Cheat Sheet.pdf',
      data: {
        fileName: 'french_alphabet_ipa_cheat_sheet.pdf',
        fileSize: '2.4 MB',
        description: 'Complete International Phonetic Alphabet (IPA) reference chart with accent rules (aigu, grave, circonflexe).',
        url: 'https://isml.edu/resources/french-alphabet-guide.pdf',
        lsrwSkill: 'R',
      },
    },
    {
      id: 'blk-fr-08',
      topicId: 'top-fr-01',
      type: 'VIDEO',
      title: 'Video Masterclass: Mastering the French "R" and Nasal Vowels',
      data: {
        fileName: 'masterclass_french_r_sound.mp4',
        fileSize: '48.5 MB',
        description: '15-minute high-definition tutorial on tongue placement for the guttural French "r" and nasal resonance.',
        lsrwSkill: 'S',
      },
    },
    {
      id: 'blk-fr-09',
      topicId: 'top-fr-01',
      type: 'LINK',
      title: 'Interactive Phonetics Online Lab (TV5Monde CEFR Portal)',
      data: {
        url: 'https://apprendre.tv5monde.com/fr/exercices/a1-debutant/saluer',
        description: 'External CEFR A1 validated pronunciation simulator with audio feedback.',
      },
    },
  ],
  'crs-02': [
    {
      id: 'blk-de-01',
      topicId: 'top-de-01',
      type: 'KEY_CONCEPT',
      title: 'German Umlauts & Vowel Length Rules (Goethe A1)',
      data: {
        text: 'The German Umlauts (ä, ö, ü) shift vowel articulation forward and upward. Vowels preceding a double consonant are short (e.g. "bitte"), while vowels followed by a single consonant or "h" are long (e.g. "wohnen").',
      },
    },
    {
      id: 'blk-de-02',
      topicId: 'top-de-01',
      type: 'IMPORTANT_NOTE',
      title: 'Capitalization of All German Nouns & Formal "Sie"',
      data: {
        text: 'In German orthography, ALL nouns without exception must begin with a capital letter (der Tisch, das Buch). In professional settings, always address clients and colleagues with "Sie" (capitalized).',
      },
    },
    {
      id: 'blk-de-03',
      topicId: 'top-de-01',
      type: 'FORMULA',
      title: 'Sentence Pattern: Verb-Second (V2) Word Order',
      data: {
        formula: 'Position 1 [Subject / Time Adverb] + Position 2 [Conjugated Verb] + [Rest of Predicate]',
        description: 'The conjugated verb is strictly anchored in Position 2 in all declarative main clauses: "Heute lerne ich Deutsch".',
      },
    },
    {
      id: 'blk-de-04',
      topicId: 'top-de-01',
      type: 'WORKED_EXAMPLE',
      title: 'Dialogue Example: Introducing Yourself in a German Corporate Setting',
      data: {
        question: 'How do you introduce yourself and state your profession in Berlin during an interview?',
        solution: 'Applicant: "Guten Tag, mein Name ist Rahul Verma. Ich bin Softwareentwickler bei ISML."\nInterviewer: "Sehr angenehm, Herr Verma. Willkommen in unserem Team!"',
      },
    },
    {
      id: 'blk-de-05',
      topicId: 'top-de-01',
      type: 'PRACTICE_QUESTION',
      title: 'Grammar Drill: Position 2 Verb Placement',
      data: {
        question: 'Which of the following sentences follows correct German V2 word order?',
        options: [
          'A) Am Montag spiele ich Fußball mit Kollegen',
          'B) Am Montag ich spiele Fußball mit Kollegen',
          'C) Ich am Montag spiele Fußball',
          'D) Fußball am Montag ich spiele',
        ],
        correctAnswer: 'A',
        explanation: 'When "Am Montag" occupies Position 1, the conjugated verb "spiele" must immediately follow in Position 2, placing the subject "ich" in Position 3.',
      },
    },
    {
      id: 'blk-de-06',
      topicId: 'top-de-01',
      type: 'AUDIO',
      title: 'Goethe A1 Hören Listening Comprehension (Audio File)',
      data: {
        fileName: 'goethe_a1_hoeren_teil1.mp3',
        fileSize: '5.1 MB',
        description: 'Authentic train station and airport announcements from Berlin Hauptbahnhof with questions.',
        lsrwSkill: 'L',
      },
    },
    {
      id: 'blk-de-07',
      topicId: 'top-de-01',
      type: 'PDF',
      title: 'German A1 Vocabulary List & Article Guide (der, die, das).pdf',
      data: {
        fileName: 'german_a1_essential_articles_guide.pdf',
        fileSize: '3.2 MB',
        description: 'Color-coded gender noun list with plurals and sample sentences for Goethe-Zertifikat A1.',
        url: 'https://isml.edu/resources/german-articles-guide.pdf',
        lsrwSkill: 'R',
      },
    },
  ],
  'crs-03': [
    {
      id: 'blk-ja-01',
      topicId: 'top-ja-01',
      type: 'KEY_CONCEPT',
      title: 'Japanese Writing Systems: Hiragana, Katakana & Basic Kanji',
      data: {
        text: 'Japanese uses three interconnected scripts: Hiragana (native grammatical particles & verb endings), Katakana (foreign loanwords, e.g. コンピューター), and Kanji (ideograms conveying core conceptual meaning).',
      },
    },
    {
      id: 'blk-ja-02',
      topicId: 'top-ja-01',
      type: 'FORMULA',
      title: 'Sentence Pattern: Basic Copula Sentence (A は B です)',
      data: {
        formula: 'Topic [Noun A] + は (wa) + Complement [Noun B] + です (desu)',
        description: 'Fundamental sentence structure for equivalence: "わたし は がくせい です" (I am a student).',
      },
    },
    {
      id: 'blk-ja-03',
      topicId: 'top-ja-01',
      type: 'WORKED_EXAMPLE',
      title: 'Dialogue Example: Business Card Exchange (Meishi Koukan)',
      data: {
        question: 'How do you introduce yourself and present your business card with both hands?',
        solution: 'Speaker: "はじめまして。ISML の ラフル ともうします。どうぞ よろしく おねがいします。"\nMeaning: "Pleased to meet you. I am Rahul from ISML. I look forward to working with you."',
      },
    },
    {
      id: 'blk-ja-04',
      topicId: 'top-ja-01',
      type: 'PRACTICE_QUESTION',
      title: 'JLPT N5 Checkpoint: Topic Particle Identification',
      data: {
        question: 'Which particle correctly marks the topic in "田中さん ___ 日本人です" (Mr. Tanaka is Japanese)?',
        options: ['A) は (wa)', 'B) を (wo)', 'C) に (ni)', 'D) で (de)'],
        correctAnswer: 'A',
        explanation: 'The particle は (pronounced "wa") is the primary topic marker indicating what the sentence is about.',
      },
    },
    {
      id: 'blk-ja-05',
      topicId: 'top-ja-01',
      type: 'PDF',
      title: 'JLPT N5 Hiragana & Katakana Stroke Order Practice Grids.pdf',
      data: {
        fileName: 'japanese_kana_stroke_order_sheets.pdf',
        fileSize: '4.8 MB',
        description: 'Tracing worksheets with stroke sequence numbers for 46 Hiragana and 46 Katakana symbols.',
        lsrwSkill: 'W',
      },
    },
  ],
};

export default function SuperAdminAcademicArchitecturePage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall, getCollegeName } = useCollege();

  // 1. Available Courses filtered by selected College context
  const filteredCourses = useMemo(() => {
    if (isOverall || !selectedCollegeId) return mockCourses;
    return mockCourses.filter((c) => !c.collegeId || c.collegeId === selectedCollegeId);
  }, [selectedCollegeId, isOverall]);

  // 2. Active Selected Course
  const [activeCourseId, setActiveCourseId] = useState<string>(() => filteredCourses[0]?.id || mockCourses[0]?.id || 'crs-01');

  // Verify that activeCourseId exists in filtered list, fallback if needed
  const selectedCourse = useMemo(() => {
    return filteredCourses.find((c) => c.id === activeCourseId) || filteredCourses[0] || mockCourses[0];
  }, [activeCourseId, filteredCourses]);

  // 3. Batches belonging to the Active Course
  const courseBatches = useMemo(() => {
    const directMatches = mockBatches.filter((b) => {
      const matchCourseId = b.courseIds?.includes(selectedCourse?.id || '');
      const matchCourseName = b.courseNames?.some((cn) => cn.toLowerCase().includes(selectedCourse?.name?.toLowerCase() || ''));
      const matchCollege = isOverall || !selectedCollegeId || !b.institutionId || b.institutionId === selectedCollegeId;
      return (matchCourseId || matchCourseName) && matchCollege;
    });

    if (directMatches.length > 0) return directMatches;

    // Fallback: Return any college batch or first batch so UI always has clean active batches
    const collegeBatches = mockBatches.filter((b) => isOverall || !selectedCollegeId || !b.institutionId || b.institutionId === selectedCollegeId);
    return collegeBatches.length > 0 ? collegeBatches : mockBatches;
  }, [selectedCourse, selectedCollegeId, isOverall]);

  // 4. Active Selected Batch
  const [activeBatchId, setActiveBatchId] = useState<string>(() => courseBatches[0]?.id || 'batch-2026-cs');

  // Sync active batch when course changes
  const selectedBatch: Batch = useMemo(() => {
    const match = courseBatches.find((b) => b.id === activeBatchId);
    if (match) return match;
    return courseBatches[0] || mockBatches[0];
  }, [activeBatchId, courseBatches]);

  // 5. Active Subject & Levels linked to Selected Course
  const courseSubject = useMemo(() => {
    return (
      mockSubjects.find((s) => s.courseId === selectedCourse?.id) ||
      mockSubjects.find((s) => s.courseName?.toLowerCase().includes(selectedCourse?.name?.toLowerCase() || '')) ||
      mockSubjects[0]
    );
  }, [selectedCourse]);

  // Levels for this Course Subject
  const courseLevels = useMemo(() => {
    const levels = mockLevels.filter((l) => l.subjectId === courseSubject?.id);
    return levels.length > 0 ? levels : mockLevels.slice(0, 2);
  }, [courseSubject]);

  // Modules / Chapters for this Subject
  const courseModules = useMemo(() => {
    const modules = mockModules.filter((m) => m.subjectId === courseSubject?.id);
    return modules.length > 0 ? modules : mockModules.slice(0, 3);
  }, [courseSubject]);

  // 6. Selected Topic in Outline
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => mockTopics[0]?.id || 'top-fr-01');

  // Active Topic entity
  const activeTopic: AcademicTopic = useMemo(() => {
    const match = mockTopics.find((t) => t.id === selectedTopicId);
    return match || mockTopics[0];
  }, [selectedTopicId]);

  // Active Module
  const activeModule = useMemo(() => {
    return courseModules.find((m) => m.id === activeTopic?.moduleId) || courseModules[0];
  }, [activeTopic, courseModules]);

  // Expanded nodes state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-fr-01': true,
    'mod-fr-02': true,
    'mod-de-01': true,
    'mod-ja-01': true,
  });

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Layout UI Toggles
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'builder' | 'batch_progress'>('builder');

  // Search filter inside outline
  const [searchTopicQuery, setSearchTopicQuery] = useState('');

  // Content Blocks for the Course Builder Workspace
  const blocks = useMemo(() => {
    return COURSE_LEARNING_BLOCKS[selectedCourse?.id] || COURSE_LEARNING_BLOCKS['crs-01'] || [];
  }, [selectedCourse]);

  return (
    <div className="flex flex-col min-h-screen -m-4 sm:-m-6 font-sans bg-[#F4F6F9] text-slate-900">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION BAR (CLEAN & NON-OVERLAPPING)                   */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer border border-slate-200/80 shadow-2xs"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#0B2447] tracking-tight">
                Academic Architecture & Course Builder
              </h1>
              <span className="font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Auditor View
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Inspect curriculum modules, lesson blocks, and cohort delivery progress in real-time.
            </p>
          </div>
        </div>

        {/* Viewport & Simulation Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* View Tab Switcher: Builder vs Batch Delivery */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'bg-white text-[#0052CC] shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Content</span>
            </button>
            <button
              onClick={() => setActiveTab('batch_progress')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'batch_progress'
                  ? 'bg-white text-emerald-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Batch Delivery</span>
            </button>
          </div>

          {/* Student Live Simulation Button */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Student Live Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>

          {/* Verification Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Syllabus Audited</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DEDICATED SELECTION CARDS SECTION: COURSES & BATCHES (RESPONSIVE GRID)  */}
      {/* ========================================================================= */}
      <section className="p-4 sm:p-6 pb-2 space-y-4">
        {/* ROW 1: COURSE SELECTION CARDS (HORIZONTAL SCROLL / GRID) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Select Course Program ({filteredCourses.length})</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Click a course card to switch curriculum
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {filteredCourses.map((c) => {
              const isSelected = selectedCourse?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCourseId(c.id);
                    showSuccess(`Selected Course: ${c.name}`);
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-[#0052CC] text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {c.code}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">
                        {c.enrolledStudents} students
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="font-black text-xs sm:text-sm text-[#0B2447] leading-snug line-clamp-2 mb-2">
                    {c.name}
                  </h3>

                  {/* Card Meta Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[120px]">{c.facultyName}</span>
                    <span className="font-bold text-emerald-600">{c.completionRate}% Done</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: BATCH SELECTION CARDS (FOR SELECTED COURSE) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Cohorts & Batches for {selectedCourse?.code} ({courseBatches.length})</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Select a batch to inspect its active teaching and schedule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courseBatches.map((b) => {
              const isSelected = selectedBatch?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setActiveBatchId(b.id);
                    showSuccess(`Selected Batch: ${b.name}`);
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition duration-200 flex flex-col justify-between cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-black text-xs sm:text-sm text-[#0B2447] truncate">
                        {b.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Batch Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 my-1.5 py-1.5 border-y border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{b.studentsCount} Learners</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{b.batchTiming || '10:00 AM - 11:30 AM'}</span>
                    </div>
                  </div>

                  {/* Footer Faculty & Schedule */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {b.assignedFacultyName || 'Mme. Claire Fontaine'}
                    </span>
                    <span className="font-mono text-slate-400">
                      {b.scheduleDays?.join(', ') || 'MON, WED, FRI'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN 3-PANEL STUDIO WORKSPACE (CONTENT BUILDER VIEW)                    */}
      {/* ========================================================================= */}
      <div className="flex-1 px-4 sm:px-6 pb-6 pt-2 flex flex-col">
        {/* Workspace Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[640px]">
          {/* Workspace Subheader Bar */}
          <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>{selectedCourse?.code} Curriculum Studio</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Cohort: {selectedBatch?.name}
              </span>
            </div>

            {/* Panel Visibility Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLeftPanelOpen((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer hidden md:flex items-center gap-1.5 ${
                  isLeftPanelOpen
                    ? 'bg-white text-[#0052CC] border-blue-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {isLeftPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
                <span>Syllabus Outline</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRightPanelOpen((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer hidden xl:flex items-center gap-1.5 ${
                  isRightPanelOpen
                    ? 'bg-white text-[#0052CC] border-blue-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {isRightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
                <span>Properties</span>
              </button>
            </div>
          </div>

          {/* 3-Panel Split Area */}
          <div className="flex-1 flex overflow-hidden min-h-[560px]">
            {/* PANEL 1 (LEFT): COURSE SYLLABUS OUTLINE TREE */}
            {isLeftPanelOpen && (
              <aside className="w-64 xl:w-72 bg-slate-50/40 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden h-full">
                <div className="p-3 border-b border-slate-200/80 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Outline Navigator
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#0052CC] px-2 py-0.5 rounded-full border border-blue-200">
                      {courseModules.length} Chapters
                    </span>
                  </div>

                  {/* Search within Outline */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search lessons..."
                      value={searchTopicQuery}
                      onChange={(e) => setSearchTopicQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                {/* Tree Items Container */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {courseLevels.map((lvl) => {
                    const lvlModules = courseModules.filter(
                      (m) => m.levelId === lvl.id || m.levelCode === lvl.levelCode || courseModules.indexOf(m) === 0
                    );

                    return (
                      <div key={lvl.id} className="border border-purple-200 bg-purple-50/20 rounded-xl overflow-hidden shadow-2xs">
                        <div className="p-2 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 flex items-center justify-between">
                          <span className="text-xs font-black text-purple-950 truncate">
                            {lvl.levelCode}: {lvl.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                            {lvl.targetCefrOrJlpt || 'CEFR'}
                          </span>
                        </div>

                        <div className="p-1 space-y-1 bg-white">
                          {lvlModules.map((mod) => {
                            const isModOpen = Boolean(expandedModules[mod.id]);
                            const modTopics = mockTopics.filter((t) => t.moduleId === mod.id);
                            const displayedTopics = modTopics.length > 0 ? modTopics : mockTopics.slice(0, 3);
                            const filteredTopics = displayedTopics.filter((t) =>
                              t.title.toLowerCase().includes(searchTopicQuery.toLowerCase())
                            );

                            return (
                              <div key={mod.id} className="rounded-lg overflow-hidden border border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => toggleModule(mod.id)}
                                  className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-left"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {isModOpen ? (
                                      <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                                    )}
                                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span className="text-xs font-bold text-slate-800 truncate">
                                      Unit {mod.moduleNumber}: {mod.title}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {mod.estimatedHours}h
                                  </span>
                                </button>

                                {isModOpen && (
                                  <div className="pl-3 pr-1 py-1 space-y-0.5 border-l border-amber-200 ml-3">
                                    {filteredTopics.map((top) => {
                                      const isSelected = selectedTopicId === top.id;
                                      return (
                                        <button
                                          key={top.id}
                                          type="button"
                                          onClick={() => setSelectedTopicId(top.id)}
                                          className={`w-full text-left p-1.5 px-2 rounded-lg text-xs transition flex items-center justify-between gap-1.5 cursor-pointer ${
                                            isSelected
                                              ? 'bg-blue-50 text-[#0052CC] font-bold border border-blue-200 shadow-2xs'
                                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <FileText
                                              className={`w-3.5 h-3.5 shrink-0 ${
                                                isSelected ? 'text-[#0052CC]' : 'text-slate-400'
                                              }`}
                                            />
                                            <span className="truncate">
                                              #{top.topicNumber} {top.title}
                                            </span>
                                          </div>
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                                            {top.skillMapped.substring(0, 4)}
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

                <div className="p-2.5 border-t border-slate-200 bg-white text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{courseModules.length} Modules Curated</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Verified
                  </span>
                </div>
              </aside>
            )}

            {/* PANEL 2 (CENTER): MODULAR CONTENT BLOCK WORKSPACE / BATCH DELIVERY PROGRESS */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden h-full">
              {activeTab === 'builder' ? (
                <>
                  {/* Active Topic Banner Bar */}
                  <div className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                            Lesson #{activeTopic?.topicNumber || 1}
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {activeTopic?.skillMapped || 'Listening & Speaking'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {activeModule?.title || 'Salutations & Phonetics'}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-xl font-black text-[#0B2447] tracking-tight leading-snug">
                          {activeTopic?.title || 'Lesson Title'}
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                          {activeTopic?.learningObjective || 'Master core phonetic benchmarks, vocabulary registers and linguistic distinctions.'}
                        </p>
                      </div>

                      {/* Batch Synchronization Status */}
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Delivering to {selectedBatch?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Content Blocks Viewer */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
                    <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
                      <span className="font-bold text-[#0B2447]">
                        {blocks.length} Content Blocks Published by Academic Manager
                      </span>
                      <span>Read-only inspection mode active</span>
                    </div>

                    {blocks.map((blk, idx) => {
                      const meta = BLOCK_META_CONFIG[blk.type] || BLOCK_META_CONFIG.TEXT;
                      const IconComp = meta.icon;

                      return (
                        <div
                          key={blk.id}
                          className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition overflow-hidden"
                        >
                          {/* Block Header */}
                          <div className={`px-4 py-2.5 border-b flex items-center justify-between ${meta.bg} ${meta.border}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`p-1.5 rounded-lg bg-white ${meta.color} shadow-2xs`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${meta.color}`}>
                                {meta.label}
                              </span>
                              <span className="text-xs font-extrabold text-slate-900 truncate">
                                {blk.title}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                              Block #{idx + 1}
                            </span>
                          </div>

                          {/* Block Content Body */}
                          <div className="p-4 sm:p-5 space-y-3">
                            {/* KEY CONCEPT & IMPORTANT NOTE & TEXT */}
                            {(blk.type === 'KEY_CONCEPT' || blk.type === 'IMPORTANT_NOTE' || blk.type === 'TEXT') && (
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                {blk.data.text}
                              </p>
                            )}

                            {/* FORMULA / PATTERN */}
                            {blk.type === 'FORMULA' && (
                              <div className="space-y-2">
                                <div className="p-3.5 bg-violet-50/70 border border-violet-200 rounded-xl font-mono text-xs sm:text-sm font-bold text-violet-950">
                                  {blk.data.formula}
                                </div>
                                {blk.data.description && (
                                  <p className="text-xs text-slate-500 italic">
                                    {blk.data.description}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* WORKED EXAMPLE */}
                            {blk.type === 'WORKED_EXAMPLE' && (
                              <div className="space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                                <div>
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                                    Dialogue Context
                                  </span>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 whitespace-pre-line">
                                    {blk.data.question}
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-indigo-100">
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                                    Transcription & Translation Output
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                                    {blk.data.solution}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* PRACTICE QUESTION / MCQ */}
                            {blk.type === 'PRACTICE_QUESTION' && (
                              <div className="space-y-3 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs sm:text-sm font-bold text-slate-900">
                                  {blk.data.question}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {(blk.data.options || []).map((opt, optIdx) => {
                                    const isCorrect = opt.startsWith('A)');
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
                                          isCorrect
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                            : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <span
                                          className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span>{opt}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {blk.data.explanation && (
                                  <p className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                                    💡 <strong>Pedagogical Rationale:</strong> {blk.data.explanation}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* AUDIO DRILL */}
                            {blk.type === 'AUDIO' && (
                              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/60 flex items-center justify-between gap-3 flex-wrap">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Headphones className="w-5 h-5 text-teal-700 shrink-0" />
                                    <span className="text-xs sm:text-sm font-bold text-teal-950 truncate">
                                      {blk.data.fileName || blk.title}
                                    </span>
                                  </div>
                                  <p className="text-xs text-teal-800 line-clamp-1">{blk.data.description}</p>
                                  <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 inline-block">
                                    LSRW LISTENING COMPREHENSION • {blk.data.fileSize || '4.2 MB'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => showSuccess(`Audio stream live demo: ${blk.data.fileName}`)}
                                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Play Drill</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* PDF WORKSHEET */}
                            {blk.type === 'PDF' && (
                              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between gap-3 flex-wrap">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <FileUp className="w-5 h-5 text-rose-700 shrink-0" />
                                    <span className="text-xs sm:text-sm font-bold text-rose-950 truncate">
                                      {blk.data.fileName || blk.title}
                                    </span>
                                  </div>
                                  <p className="text-xs text-rose-800 line-clamp-1">{blk.data.description}</p>
                                  <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 inline-block">
                                    LSRW READING & WRITING • {blk.data.fileSize || '2.4 MB'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={blk.data.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Inspect PDF</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* VIDEO CLIP */}
                            {blk.type === 'VIDEO' && (
                              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between gap-3 flex-wrap">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-5 h-5 text-[#0052CC] shrink-0" />
                                    <span className="text-xs sm:text-sm font-bold text-blue-950 truncate">
                                      {blk.data.fileName || blk.title}
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-800 line-clamp-1">{blk.data.description}</p>
                                  <span className="text-[10px] font-bold text-[#0052CC] bg-white px-2 py-0.5 rounded border border-blue-200 inline-block">
                                    LSRW SPEAKING CLINIC • {blk.data.fileSize || '38.5 MB'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => showSuccess(`Video masterclass stream demo: ${blk.data.fileName}`)}
                                    className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Preview Video</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* EXTERNAL LINK */}
                            {blk.type === 'LINK' && (
                              <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/60 flex items-center justify-between gap-3">
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
                                  <span>Visit URL</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* TAB 2: BATCH ACADEMIC DELIVERY PROGRESS SNAPSHOT */
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#0B2447]">
                          {selectedBatch?.name} — Delivery Audit
                        </h2>
                        <p className="text-xs text-slate-500">
                          Tracking completed, in-progress and scheduled syllabus modules for this cohort.
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl self-start sm:self-auto">
                        {selectedBatch?.studentsCount} Enrolled Students
                      </span>
                    </div>

                    {/* Batch Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Modules</span>
                        <strong className="text-lg font-black text-[#0B2447]">2 / {courseModules.length} Units</strong>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">On Schedule</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Unit</span>
                        <strong className="text-sm font-black text-[#0B2447] truncate block">{activeModule?.title}</strong>
                        <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Active Teaching</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch Completion</span>
                        <strong className="text-lg font-black text-emerald-600">{selectedCourse?.completionRate || 68}%</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">LSRW Checkpoints Passed</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Faculty</span>
                        <strong className="text-xs font-black text-slate-800 truncate block">
                          {selectedBatch?.assignedFacultyName || 'Mme. Claire Fontaine'}
                        </strong>
                        <span className="text-[10px] text-purple-600 font-bold block mt-0.5">Head Language Tutor</span>
                      </div>
                    </div>

                    {/* Unit by Unit Progress Table */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Unit-by-Unit Delivery Schedule
                      </h3>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="p-3">Unit / Module</th>
                              <th className="p-3">Estimated Hours</th>
                              <th className="p-3">Topics Count</th>
                              <th className="p-3">Batch Status</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {courseModules.map((m, idx) => (
                              <tr key={m.id} className="hover:bg-slate-50/70 transition">
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block">{m.title}</span>
                                  <span className="text-[11px] text-slate-400 line-clamp-1">{m.description}</span>
                                </td>
                                <td className="p-3 font-mono text-slate-600">{m.estimatedHours} hrs</td>
                                <td className="p-3">{m.topicsCount || 4} Lessons</td>
                                <td className="p-3">
                                  {idx === 0 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                      COMPLETED
                                    </span>
                                  ) : idx === 1 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 font-bold text-[10px]">
                                      IN PROGRESS
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px]">
                                      UPCOMING
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      setActiveTab('builder');
                                      setSelectedTopicId(mockTopics[0]?.id || 'top-fr-01');
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                  >
                                    View Content
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* PANEL 3 (RIGHT): BATCH & TOPIC PEDAGOGICAL PROPERTIES & CEFR METADATA */}
            {isRightPanelOpen && (
              <aside className="w-72 xl:w-80 bg-slate-50/40 border-l border-slate-200 flex flex-col shrink-0 overflow-hidden h-full">
                <div className="p-3 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Metadata & Inspection</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Selected Batch Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                        Active Cohort Profile
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                        {selectedBatch?.status}
                      </span>
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      {selectedBatch?.name}
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Institution:</span>
                        <strong className="text-slate-900 truncate max-w-[140px]">
                          {getCollegeName(selectedBatch?.institutionId) || selectedBatch?.institutionName}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Strength:</span>
                        <strong className="text-slate-900">{selectedBatch?.studentsCount} Learners</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Timing:</span>
                        <strong className="text-slate-900 font-mono">{selectedBatch?.batchTiming || '10:00 AM - 11:30 AM'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Tutor:</span>
                        <strong className="text-slate-900 truncate max-w-[130px]">
                          {selectedBatch?.assignedFacultyName || 'Mme. Claire Fontaine'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Hierarchy Context */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Curriculum Hierarchy
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Course:</span>
                      <span className="font-bold text-[#0B2447] truncate max-w-[160px]">{selectedCourse?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Subject:</span>
                      <span className="font-bold text-[#0B2447] truncate max-w-[160px]">{courseSubject?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Chapter Unit:</span>
                      <span className="font-bold text-[#0B2447] truncate max-w-[160px]">{activeModule?.title}</span>
                    </div>
                  </div>

                  {/* Lesson Properties */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        Lesson Title
                      </label>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                        {activeTopic?.title}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        Primary CEFR Competency
                      </label>
                      <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 flex items-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>{activeTopic?.skillMapped}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        Estimated Student Workload
                      </label>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Standard Duration</span>
                        </span>
                        <strong className="text-slate-900 font-black">45 Minutes</strong>
                      </div>
                    </div>

                    {/* LSRW Coverage Distribution in this Lesson */}
                    <div className="pt-3 border-t border-slate-200">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                        LSRW Skill Distribution
                      </span>
                      <div className="space-y-1.5">
                        {[
                          { skill: 'Listening (L)', count: '1 Audio Drill', color: 'bg-teal-500', width: '30%' },
                          { skill: 'Speaking (S)', count: '1 Masterclass', color: 'bg-blue-500', width: '25%' },
                          { skill: 'Reading (R)', count: '1 PDF Sheet', color: 'bg-rose-500', width: '25%' },
                          { skill: 'Writing / Grammar', count: '2 Formulas', color: 'bg-violet-500', width: '20%' },
                        ].map((item) => (
                          <div key={item.skill} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-semibold text-slate-600">{item.skill}</span>
                              <span className="text-slate-400">{item.count}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Link to Curriculum Matrix */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <Link
                    href="/super-admin/academic/curriculum"
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#0052CC] font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    <span>Curriculum Matrix Overview</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STUDENT LMS LIVE SIMULATION PREVIEW MODAL                                */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 overflow-hidden font-sans">
          {/* Preview Navigation Header */}
          <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Student LMS Live Experience Preview
                  </h3>
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {selectedBatch?.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Simulating active learner viewport for {selectedCourse?.name}
                </p>
              </div>
            </div>

            {/* Viewport Device Switcher */}
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
                  title="Tablet Screen View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
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

              {/* Exit Preview */}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Exit Preview"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </header>

          {/* Interactive Preview Arena */}
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
                      {selectedCourse?.code} • {selectedBatch?.name}
                    </p>
                    <p className="text-xs font-bold text-white truncate">
                      {activeModule?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    45m estimated
                  </span>
                </div>
              </div>

              {/* Body Content Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/80 p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white text-[#0052CC] border border-blue-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      Lesson Competency: {activeTopic?.skillMapped}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Progress: 0 / {blocks.length} Completed
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-[#0B2447] tracking-tight">
                    {activeTopic?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeTopic?.learningObjective}
                  </p>
                </div>

                {/* Lesson Blocks Sequence */}
                <div className="space-y-4">
                  {blocks.map((blk) => {
                    const meta = BLOCK_META_CONFIG[blk.type] || BLOCK_META_CONFIG.TEXT;
                    const IconComp = meta.icon;

                    if (blk.type === 'KEY_CONCEPT' || blk.type === 'IMPORTANT_NOTE') {
                      return (
                        <div
                          key={blk.id}
                          className={`p-4 rounded-xl border ${meta.border} ${meta.bg} space-y-1.5`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComp className={`w-4 h-4 ${meta.color}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${meta.color}`}>
                              {blk.title}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-6">
                            {blk.data.text}
                          </p>
                        </div>
                      );
                    }

                    if (blk.type === 'FORMULA') {
                      return (
                        <div key={blk.id} className="p-4 rounded-xl border border-violet-200 bg-violet-50/70 space-y-2">
                          <div className="flex items-center gap-2 text-violet-800">
                            <Sigma className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{blk.title}</span>
                          </div>
                          <div className="p-3 bg-white rounded-lg font-mono text-xs sm:text-sm font-bold text-violet-950 border border-violet-200/80 shadow-2xs">
                            {blk.data.formula}
                          </div>
                          {blk.data.description && (
                            <p className="text-xs text-violet-900/80 pl-1">{blk.data.description}</p>
                          )}
                        </div>
                      );
                    }

                    if (blk.type === 'WORKED_EXAMPLE') {
                      return (
                        <div key={blk.id} className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                          <div className="flex items-center gap-2 text-indigo-800">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{blk.title}</span>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                            <p className="font-bold text-slate-900 whitespace-pre-line">{blk.data.question}</p>
                            <div className="pt-2 border-t border-slate-100 text-slate-700 whitespace-pre-line">
                              {blk.data.solution}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (blk.type === 'PRACTICE_QUESTION') {
                      return (
                        <div key={blk.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                          <div className="flex items-center gap-2 text-emerald-800">
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Practice Checkpoint: {blk.title}</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">{blk.data.question}</p>
                          <div className="space-y-1.5">
                            {(blk.data.options || []).map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                type="button"
                                className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-xs font-medium text-slate-800 transition flex items-center gap-2 cursor-pointer"
                              >
                                <span className="w-5 h-5 rounded-md bg-slate-100 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (blk.type === 'AUDIO') {
                      return (
                        <div key={blk.id} className="p-4 rounded-xl border border-teal-200 bg-teal-50/70 flex items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Headphones className="w-5 h-5 text-teal-700 shrink-0" />
                              <span className="text-xs sm:text-sm font-bold text-teal-950 truncate">{blk.title}</span>
                            </div>
                            <p className="text-xs text-teal-800 line-clamp-1">{blk.data.description}</p>
                          </div>
                          <button
                            type="button"
                            className="px-3.5 py-2 bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Play</span>
                          </button>
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
                            <p className="text-[11px] text-rose-800 line-clamp-1">{blk.data.description}</p>
                          </div>
                          <a
                            href={blk.data.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-2xs"
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
                            className="px-3 py-1.5 bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-2xs"
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

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                  Student Learning Viewport Simulation • ISML LMS Multi-Tenant SaaS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
