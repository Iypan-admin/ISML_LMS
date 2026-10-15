// ============================================================================
// ISML COLLEGE LMS — TUTOR: CURRICULUM & COURSE BUILDER TEACHING MATERIALS (/tutor/curriculum)
// Direct sync with Academic Manager Course Builder Studio
// Step 1: Select Course (French A1, A2, B1, B2) in pastel cards
// Step 2: Select Assigned Batch / Cohort
// Step 3: Browse Syllabus Tree (Modules & Topics) and Teaching Content Blocks
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Folder,
  Layers,
  Sparkles,
  FileText,
  Headphones,
  Video,
  FileUp,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  AlertCircle,
  Sigma,
  GraduationCap,
  HelpCircle,
  Search,
  Users,
  Clock,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import {
  mockModules,
  mockTopics,
} from '@/mock/superAdminData';

// Content Block structure created in Academic Manager Course Builder
export interface CurriculumBlock {
  id: string;
  topicId: string;
  type: 'KEY_CONCEPT' | 'IMPORTANT_NOTE' | 'FORMULA' | 'WORKED_EXAMPLE' | 'PRACTICE_QUESTION' | 'TEXT' | 'AUDIO' | 'PDF' | 'VIDEO' | 'LINK';
  title: string;
  lsrwSkill?: 'L' | 'S' | 'R' | 'W' | 'GENERAL';
  data: {
    text?: string;
    description?: string;
    formula?: string;
    question?: string;
    solution?: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    fileName?: string;
    fileSize?: string;
    url?: string;
  };
}

// Master materials curated from Academic Manager Course Builder Studio
const mockCurriculumBlocks: Record<string, CurriculumBlock[]> = {
  'top-fr-01': [
    {
      id: 'blk-01',
      topicId: 'top-fr-01',
      type: 'KEY_CONCEPT',
      title: 'Core Linguistic Concept: Nasal Vowels & Mandatory Liaison',
      lsrwSkill: 'L',
      data: {
        text: 'In French phonetics, when a vowel is followed by n or m in the same syllable, the vowel becomes nasalized. Furthermore, liaison connects the silent final consonant of a word to the initial vowel of the following word (e.g., "les étudiants" sounds like [le z‿etydjɑ̃]).',
      },
    },
    {
      id: 'blk-02',
      topicId: 'top-fr-01',
      type: 'IMPORTANT_NOTE',
      title: 'Formal "Vous" vs Informal "Tu" Politeness Boundary',
      lsrwSkill: 'S',
      data: {
        text: 'Always use "Vous" in professional, academic, or institutional settings with elders, supervisors, or acquaintances. Using "Tu" prematurely is considered impolite in French culture.',
      },
    },
    {
      id: 'blk-03',
      topicId: 'top-fr-01',
      type: 'FORMULA',
      title: 'Sentence Pattern: Formal Self-Introduction',
      lsrwSkill: 'S',
      data: {
        formula: 'Bonjour, je m\'appelle [Nom] + je suis [Profession/Étudiant] + chez [Institution].',
        description: 'Standard formula taught across CEFR A1 for meeting academic and professional peers.',
      },
    },
    {
      id: 'blk-04',
      topicId: 'top-fr-01',
      type: 'AUDIO',
      title: 'Audio Drill: Standard Parisian Pronunciation Guide (MP3)',
      lsrwSkill: 'L',
      data: {
        fileName: 'nasal_vowels_drill_a1.mp3',
        fileSize: '4.2 MB',
        description: 'Native speaker pronunciation drill for [ɑ̃], [ɛ̃], [ɔ̃], [œ̃]. Recommended to play during live sessions.',
        url: 'https://isml.edu/audio/nasal_vowels_drill_a1.mp3',
      },
    },
    {
      id: 'blk-05',
      topicId: 'top-fr-01',
      type: 'PDF',
      title: 'Class Handout: French Phonetics & Alphabet Chart.pdf',
      lsrwSkill: 'R',
      data: {
        fileName: 'phonetics_alphabet_cheat_sheet.pdf',
        fileSize: '2.4 MB',
        description: 'Printable color-coded IPA transcription worksheet for students.',
        url: 'https://isml.edu/resources/phonetics_alphabet_cheat_sheet.pdf',
      },
    },
    {
      id: 'blk-06',
      topicId: 'top-fr-01',
      type: 'WORKED_EXAMPLE',
      title: 'Dialogue Example: First Day at ISML Campus',
      lsrwSkill: 'S',
      data: {
        question: 'How to introduce yourself to a professor on the first day of class?',
        solution: 'Étudiant: Bonjour Professeur, je m\'appelle Anand, je suis étudiant en première année.\nProfesseur: Bonjour Anand, bienvenue à ISML ! Asseyez-vous, s\'il vous plaît.',
      },
    },
    {
      id: 'blk-07',
      topicId: 'top-fr-01',
      type: 'PRACTICE_QUESTION',
      title: 'Formative Checkpoint: Choosing the Correct Greeting',
      lsrwSkill: 'GENERAL',
      data: {
        question: 'Which greeting is appropriate when meeting a corporate recruiter at 10:00 AM?',
        options: ['Salut mon ami !', 'Bonjour Monsieur, enchanté.', 'Coucou !', 'Bonne nuit.'],
        correctAnswer: 'Bonjour Monsieur, enchanté.',
        explanation: '"Bonjour Monsieur, enchanté" maintains the necessary formal register required in professional settings.',
      },
    },
  ],
  'top-fr-02': [
    {
      id: 'blk-201',
      topicId: 'top-fr-02',
      type: 'KEY_CONCEPT',
      title: 'Greetings & Salutations Etiquette Matrix',
      lsrwSkill: 'S',
      data: {
        text: 'Morning: Bonjour. Evening: Bonsoir. Informal with friends: Salut / Coucou. Taking leave: Au revoir / À bientôt / À demain.',
      },
    },
    {
      id: 'blk-202',
      topicId: 'top-fr-02',
      type: 'PDF',
      title: 'Dialogue Script: Formal vs Informal Greetings Handout.pdf',
      lsrwSkill: 'R',
      data: {
        fileName: 'greetings_handout_delacroix.pdf',
        fileSize: '1.8 MB',
        description: 'Approved by Academic Manager for Section A & B classroom distribution.',
        url: 'https://isml.edu/resources/greetings-handout.pdf',
      },
    },
  ],
  'top-fr-03': [
    {
      id: 'blk-301',
      topicId: 'top-fr-03',
      type: 'FORMULA',
      title: 'Auxiliary Verb Conjugation: Être & Avoir',
      lsrwSkill: 'W',
      data: {
        formula: 'Être: Je suis, Tu es, Il/Elle est, Nous sommes, Vous êtes, Ils/Elles sont.\nAvoir: J\'ai, Tu as, Il/Elle a, Nous avons, Vous avez, Ils/Elles ont.',
        description: 'Foundational syntax required for constructing Passé Composé in French A2.',
      },
    },
    {
      id: 'blk-302',
      topicId: 'top-fr-03',
      type: 'PDF',
      title: 'Conjugation Tables & Practice Drill Sheets.pdf',
      lsrwSkill: 'W',
      data: {
        fileName: 'etre_avoir_mastery.pdf',
        fileSize: '3.1 MB',
        description: 'Complete color-coded tables with affirmative, negative, and question forms.',
        url: 'https://isml.edu/resources/etre-avoir-tables.pdf',
      },
    },
  ],
};

interface BatchCohortItem {
  batchId: string;
  batchName: string;
  sectionCode: string;
  dutyRole: string;
  dutyBadgeColor: string;
  schedule: string;
  studentsCount: number;
}

interface CoursePortfolioCurriculum {
  id: string;
  code: string;
  levelBadge: string;
  levelId: string;
  name: string;
  cefrTrack: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
  batches: BatchCohortItem[];
}

const COURSES_CURRICULUM_DATA: CoursePortfolioCurriculum[] = [
  {
    id: 'crs-fr-a1',
    code: 'FR-101',
    levelBadge: 'CEFR A1',
    levelId: 'lvl-fr-a1',
    name: 'French A1: Beginner Foundations & Phonetics',
    cefrTrack: 'DELF A1 Certification Track',
    pastelBg: 'bg-blue-50/70',
    pastelBorder: 'border-blue-200',
    accentColor: 'text-[#0052CC]',
    iconBg: 'bg-blue-100 text-[#0052CC]',
    batches: [
      {
        batchId: 'batch-2026-fr-a1-morning',
        batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        sectionCode: 'Section A (Morning)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        schedule: 'Mon & Wed • 10:00 - 11:30 AM',
        studentsCount: 6,
      },
      {
        batchId: 'batch-2026-fr-a1-weekend',
        batchName: 'French A1 Fast-Track Weekend Bootcamp',
        sectionCode: 'Section B (Weekend)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        schedule: 'Sat & Sun • 11:00 AM - 01:00 PM',
        studentsCount: 2,
      },
    ],
  },
  {
    id: 'crs-fr-a2',
    code: 'FR-102',
    levelBadge: 'CEFR A2',
    levelId: 'lvl-fr-a2',
    name: 'French A2: Elementary Narrative & Passé Composé',
    cefrTrack: 'DELF A2 Preparation',
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-800',
    batches: [
      {
        batchId: 'batch-fr-a2',
        batchName: 'French A2 Cohort (Section B - Standby Coverage)',
        sectionCode: 'Section B (Afternoon)',
        dutyRole: 'Substitute Standby',
        dutyBadgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
        schedule: 'Tue & Thu • 02:00 - 03:30 PM',
        studentsCount: 3,
      },
    ],
  },
  {
    id: 'crs-fr-b1',
    code: 'FR-201',
    levelBadge: 'CEFR B1',
    levelId: 'lvl-fr-b1',
    name: 'French B1: Intermediate & Subjunctive Mood',
    cefrTrack: 'DELF B1 Intermediate Professional',
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-800',
    batches: [
      {
        batchId: 'batch-fr-b1',
        batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
        sectionCode: 'Section Q (Executive)',
        dutyRole: 'Doubt Clearance Specialist',
        dutyBadgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        schedule: 'Tue & Thu • 05:30 - 07:00 PM',
        studentsCount: 2,
      },
    ],
  },
  {
    id: 'crs-fr-b2',
    code: 'FR-202',
    levelBadge: 'CEFR B2',
    levelId: 'lvl-fr-b2',
    name: 'French B2: Advanced Oral Discourse & DELF Synthesis',
    cefrTrack: 'DELF B2 Advanced Fluency',
    pastelBg: 'bg-purple-50/70',
    pastelBorder: 'border-purple-200',
    accentColor: 'text-purple-800',
    iconBg: 'bg-purple-100 text-purple-800',
    batches: [
      {
        batchId: 'batch-fr-b2',
        batchName: 'French B2 Advanced Cohort (Evaluation Desk)',
        sectionCode: 'Section V (Evaluation)',
        dutyRole: 'Assistant Evaluator',
        dutyBadgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
        schedule: 'Friday • 03:00 - 05:00 PM',
        studentsCount: 2,
      },
    ],
  },
  {
    id: 'crs-fr-c1',
    code: 'FR-301',
    levelBadge: 'CEFR C1',
    levelId: 'lvl-fr-c1',
    name: 'French C1: Professional Diplomacy & Academic Discourse',
    cefrTrack: 'DALF C1 Autonomous Masterclass',
    pastelBg: 'bg-rose-50/70',
    pastelBorder: 'border-rose-200',
    accentColor: 'text-rose-800',
    iconBg: 'bg-rose-100 text-rose-800',
    batches: [
      {
        batchId: 'batch-fr-c1',
        batchName: 'French C1 Diplomats & Academic Cohort',
        sectionCode: 'Section D (Evening)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-rose-50 text-rose-900 border-rose-200',
        schedule: 'Mon & Thu • 06:30 - 08:00 PM',
        studentsCount: 4,
      },
    ],
  },
  {
    id: 'crs-fr-biz',
    code: 'FR-BIZ',
    levelBadge: 'DFP B2',
    levelId: 'lvl-fr-biz',
    name: 'Business French: Corporate Communications & DFP Prep',
    cefrTrack: 'Chamber of Commerce (CCIP) Certification',
    pastelBg: 'bg-cyan-50/70',
    pastelBorder: 'border-cyan-200',
    accentColor: 'text-cyan-800',
    iconBg: 'bg-cyan-100 text-cyan-800',
    batches: [
      {
        batchId: 'batch-fr-biz',
        batchName: 'Corporate Executive French Masterclass',
        sectionCode: 'Section E (Executive)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
        schedule: 'Wed & Fri • 07:00 - 08:30 PM',
        studentsCount: 5,
      },
    ],
  },
  {
    id: 'crs-fr-lab',
    code: 'FR-LAB',
    levelBadge: 'Phonetics',
    levelId: 'lvl-fr-lab',
    name: 'French Pronunciation Clinic & Audio Acoustic Lab',
    cefrTrack: 'LSRW Acoustic Accent Mastery',
    pastelBg: 'bg-teal-50/70',
    pastelBorder: 'border-teal-200',
    accentColor: 'text-teal-800',
    iconBg: 'bg-teal-100 text-teal-800',
    batches: [
      {
        batchId: 'batch-fr-lab',
        batchName: 'Phonetics & Nasal Audio Lab Intensive',
        sectionCode: 'Section L (Studio Lab)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-teal-50 text-teal-900 border-teal-200',
        schedule: 'Saturday • 09:30 - 11:30 AM',
        studentsCount: 8,
      },
    ],
  },
];

export default function TutorCurriculumPage() {
  const { currentFaculty } = useTutor();

  // STEP 1: Selected Course ID (Defaults to French A1)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-a1');

  // Active Course
  const activeCourse = useMemo(() => {
    return COURSES_CURRICULUM_DATA.find((c) => c.id === selectedCourseId) || COURSES_CURRICULUM_DATA[0];
  }, [selectedCourseId]);

  // STEP 2: Selected Batch ID under this Course
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeCourse.batches[0]?.batchId || '');

  // Active Batch
  const activeBatch = useMemo(() => {
    return activeCourse.batches.find((b) => b.batchId === selectedBatchId) || activeCourse.batches[0];
  }, [activeCourse, selectedBatchId]);

  // Available batches for selected course
  const availableBatches = activeCourse.batches;

  // Selected Topic
  const [selectedTopicId, setSelectedTopicId] = useState<string>('top-fr-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<'ALL' | 'L' | 'S' | 'R' | 'W'>('ALL');

  // Course Switch handler
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const crs = COURSES_CURRICULUM_DATA.find((c) => c.id === courseId);
    if (crs && crs.batches.length > 0) {
      setSelectedBatchId(crs.batches[0].batchId);
    }
  };

  // Modules under active course level
  const activeModules = useMemo(() => {
    const list = mockModules.filter((m) => m.levelId === activeCourse.levelId);
    if (list.length === 0) {
      // Fallback for B1/B2 display so tutor has teaching modules to inspect
      return [
        {
          id: `mod-${activeCourse.code}-01`,
          subjectId: 'subj-fr101',
          subjectName: activeCourse.name,
          levelId: activeCourse.levelId,
          levelCode: activeCourse.levelBadge,
          moduleNumber: 1,
          title: `Module 1: ${activeCourse.levelBadge} Core Syntax & Academic Mastery`,
          description: `Curriculum modules approved by Academic Manager for ${activeCourse.name}`,
          topicsCount: 2,
          estimatedHours: 18,
          status: 'ACTIVE' as const,
        },
      ];
    }
    return list;
  }, [activeCourse]);

  // Topics under active modules
  const currentTopics = useMemo(() => {
    const moduleIds = activeModules.map((m) => m.id);
    const tops = mockTopics.filter((t) => moduleIds.includes(t.moduleId));
    if (tops.length === 0) {
      return [
        {
          id: `top-${activeCourse.code}-01`,
          moduleId: activeModules[0]?.id || 'mod-fallback',
          topicNumber: 1,
          title: `${activeCourse.levelBadge} Formative Linguistic Drill & Analysis`,
          learningObjective: `Master ${activeCourse.levelBadge} proficiency benchmarks aligned with CEFR criteria.`,
          skillMapped: 'LSRW Fluency',
          estimatedMinutes: 60,
          status: 'ACTIVE' as const,
        },
      ];
    }
    return tops;
  }, [activeModules, activeCourse]);

  // Active topic object
  const activeTopic = useMemo(() => {
    return currentTopics.find((t) => t.id === selectedTopicId) || currentTopics[0];
  }, [selectedTopicId, currentTopics]);

  // Filtered topics by search
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return currentTopics;
    const q = searchQuery.toLowerCase();
    return currentTopics.filter(
      (t) => t.title.toLowerCase().includes(q) || t.learningObjective.toLowerCase().includes(q)
    );
  }, [currentTopics, searchQuery]);

  // Blocks for active topic
  const activeBlocks = useMemo(() => {
    const list = mockCurriculumBlocks[activeTopic?.id] || mockCurriculumBlocks['top-fr-01'];
    if (selectedSkillFilter === 'ALL') return list;
    return list.filter((b) => b.lsrwSkill === selectedSkillFilter);
  }, [activeTopic, selectedSkillFilter]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Curriculum & Teaching Materials' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              CEFR Framework (A1 • A2 • B1 • B2)
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Academic Manager Syllabus Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Curriculum & Teaching Materials Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select course and batch to review modular lesson notes, grammar formulas, pronunciation audio drills, and handouts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tutor/live-classes"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Teach in Live Studio</span>
          </Link>
        </div>
      </div>

      {/* ─── STEP 1: SELECT LANGUAGE COURSE (7 Courses with Responsive Grid & Filter) ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
              1
            </span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Language Course
            </h2>
            <span className="text-[10px] font-black bg-blue-100 text-[#0052CC] px-2 py-0.5 rounded-full">
              {COURSES_CURRICULUM_DATA.length} Courses Allocated
            </span>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            Click any course card to reveal its batch curriculum
          </span>
        </div>

        {/* 7 Mild Pastel Course Cards — Clean 4-column responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {COURSES_CURRICULUM_DATA.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const totalCourseStudents = crs.batches.reduce((acc, b) => acc + b.studentsCount, 0);

            return (
              <button
                key={crs.id}
                onClick={() => handleSelectCourse(crs.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected
                    ? `${crs.pastelBg} border-[#0052CC] ring-2 ring-blue-500/20 shadow-md`
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Active selection indicator badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC] block ring-4 ring-blue-100"></span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${crs.iconBg}`}>
                      {crs.code}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500">
                      {crs.levelBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-black leading-snug line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                      {crs.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {crs.cefrTrack}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">
                    {crs.batches.length} {crs.batches.length === 1 ? 'Cohort' : 'Cohorts'}
                  </span>
                  <span className={crs.accentColor}>
                    {totalCourseStudents} Learners
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 2: SELECT BATCH (Under Selected Course) ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
              2
            </span>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Batch for <span className="text-[#0052CC]">{activeCourse.code}: {activeCourse.name}</span>
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 shrink-0">
            {availableBatches.length} Assigned {availableBatches.length === 1 ? 'Cohort' : 'Cohorts'}
          </span>
        </div>

        {/* Batch Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableBatches.map((b) => {
            const isSelected = selectedBatchId === b.batchId;

            return (
              <button
                key={b.batchId}
                onClick={() => setSelectedBatchId(b.batchId)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/90 border-[#0052CC] ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${b.dutyBadgeColor}`}>
                      Duty: {b.dutyRole}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {b.sectionCode}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {b.batchName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {b.schedule}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-900">
                    {b.studentsCount} Students
                  </div>
                  <span className="text-[10px] font-bold text-[#0052CC] bg-blue-100 px-2 py-0.5 rounded">
                    Active Syllabus
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 3: CURRICULUM SYLLABUS & TEACHING MATERIALS EXPLORER ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4 cols): Course Syllabus Tree (Modules & Topics) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[11px] font-black flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Syllabus Modules</span>
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {currentTopics.length} Topics
            </span>
          </div>

          {/* Search topics */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search module or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-800"
            />
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {activeModules.map((mod) => {
              const topics = filteredTopics.filter((t) => t.moduleId === mod.id);
              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-extrabold text-[#0052CC] uppercase tracking-wider block">
                      Module {mod.moduleNumber}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-900 leading-snug mt-0.5">
                      {mod.title.replace(/Module \d+:\s*/, '')}
                    </h3>
                  </div>

                  {/* Topics under module */}
                  <div className="pl-2 space-y-1">
                    {topics.map((top) => {
                      const isSelected = activeTopic?.id === top.id;
                      return (
                        <button
                          key={top.id}
                          onClick={() => setSelectedTopicId(top.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-[#0052CC] font-bold border border-blue-200 shadow-2xs'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {top.topicNumber}
                            </span>
                            <span className="truncate">{top.title}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#0052CC]' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Course Builder Teaching Content Blocks */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Topic Header Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0052CC] uppercase">
                    Topic {activeTopic?.topicNumber || 1}
                  </span>
                  <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {activeTopic?.skillMapped}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">
                    {activeBatch?.batchName}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {activeTopic?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Learning Objective:</strong> {activeTopic?.learningObjective}
                </p>
              </div>

              {/* LSRW Skill Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                {(['ALL', 'L', 'S', 'R', 'W'] as const).map((sk) => (
                  <button
                    key={sk}
                    onClick={() => setSelectedSkillFilter(sk)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      selectedSkillFilter === sk
                        ? 'bg-[#0052CC] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sk === 'ALL' ? 'All Blocks' : sk === 'L' ? '🎧 L' : sk === 'S' ? '🗣️ S' : sk === 'R' ? '📖 R' : '✍️ W'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Render Content Blocks curated from Academic Manager Course Builder */}
          <div className="space-y-3.5">
            {activeBlocks.map((block) => {
              return (
                <div
                  key={block.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {block.type === 'KEY_CONCEPT' && (
                        <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          <Lightbulb className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'IMPORTANT_NOTE' && (
                        <span className="p-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'FORMULA' && (
                        <span className="p-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                          <Sigma className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'WORKED_EXAMPLE' && (
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <GraduationCap className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'AUDIO' && (
                        <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                          <Headphones className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'PDF' && (
                        <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                          <FileUp className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'VIDEO' && (
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          <Video className="w-4 h-4" />
                        </span>
                      )}
                      {block.type === 'PRACTICE_QUESTION' && (
                        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <HelpCircle className="w-4 h-4" />
                        </span>
                      )}

                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {block.title}
                      </h3>
                    </div>

                    {block.lsrwSkill && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        LSRW: {block.lsrwSkill}
                      </span>
                    )}
                  </div>

                  {/* Block Content Payload */}
                  {block.data.text && (
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {block.data.text}
                    </p>
                  )}

                  {block.data.formula && (
                    <div className="p-3 bg-violet-50/70 rounded-xl border border-violet-200 space-y-1">
                      <code className="text-xs font-mono font-bold text-violet-900 block whitespace-pre-wrap">
                        {block.data.formula}
                      </code>
                      {block.data.description && (
                        <p className="text-[11px] text-violet-700">{block.data.description}</p>
                      )}
                    </div>
                  )}

                  {block.data.solution && (
                    <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-2 text-xs">
                      <p className="font-bold text-indigo-950">Prompt: {block.data.question}</p>
                      <pre className="font-sans text-[11px] text-indigo-900 whitespace-pre-wrap bg-white/70 p-2.5 rounded-lg border border-indigo-100">
                        {block.data.solution}
                      </pre>
                    </div>
                  )}

                  {/* Downloadable / Playable Teaching Media (Audio / PDF / Video) */}
                  {(block.type === 'AUDIO' || block.type === 'PDF' || block.type === 'VIDEO') && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          📎 {block.data.fileName || 'teaching_material.pdf'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {block.data.fileSize} • {block.data.description}
                        </span>
                      </div>

                      <a
                        href={block.data.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Handout</span>
                      </a>
                    </div>
                  )}

                  {/* Practice Question */}
                  {block.type === 'PRACTICE_QUESTION' && (
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
                      <p className="font-bold text-emerald-950">{block.data.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {block.data.options?.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg text-[11px] font-semibold border ${
                              opt === block.data.correctAnswer
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-slate-700 border-emerald-100'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-emerald-800 pt-1">
                        <strong>Answer Key:</strong> {block.data.correctAnswer} — {block.data.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
