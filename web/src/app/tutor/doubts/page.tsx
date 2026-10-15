// ============================================================================
// ISML COLLEGE LMS — TUTOR: DOUBT CLEARANCE DESK (/tutor/doubts)
// Step-by-Step Clean & User-Friendly Hierarchy:
// STEP 1: Select Course (French A1, French A2, French B1, French B2) in pastel cards
// STEP 2: Select Assigned Batch / Cohort Q&A Desk
// STEP 3: Manage Doubt Inquiries, Audio Pronunciation Questions & Thread Resolution
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Headphones,
  Mic,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Volume2,
  Paperclip,
  Check,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';

export interface DoubtMessage {
  id: string;
  sender: 'STUDENT' | 'TUTOR' | 'AI_ASSISTANT';
  senderName: string;
  text: string;
  timestamp: string;
  audioClipUrl?: string;
}

export interface CourseBatchDoubtItem {
  id: string;
  ticketNo: string;
  batchId: string;
  studentName: string;
  studentRollNo: string;
  studentAvatar: string;
  collegeName: string;
  topicTitle: string;
  category: 'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  messages: DoubtMessage[];
}

interface BatchDoubtGroup {
  batchId: string;
  batchName: string;
  sectionCode: string;
  dutyRole: string;
  dutyBadgeColor: string;
  doubts: CourseBatchDoubtItem[];
}

interface CourseDoubtGroup {
  id: string;
  code: string;
  levelBadge: string;
  name: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
  batches: BatchDoubtGroup[];
}

// Master Hierarchical Course & Batch Doubts Dataset
const COURSE_DOUBTS_DATA: CourseDoubtGroup[] = [
  {
    id: 'crs-fr-a1',
    code: 'FR-101',
    levelBadge: 'CEFR A1',
    name: 'French A1: Beginner Foundations & Phonetics',
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
        doubts: [
          {
            id: 'dbt-a1-01',
            ticketNo: 'DBT-FR-A1-101',
            batchId: 'batch-2026-fr-a1-morning',
            studentName: 'Bharathi M',
            studentRollNo: '2026-FR-8942',
            studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University, Chennai',
            topicTitle: "Difference between 'C'est un professeur' vs 'Il est professeur'",
            category: 'Grammar',
            status: 'RESOLVED',
            priority: 'MEDIUM',
            createdAt: 'Yesterday, 3:45 PM',
            messages: [
              {
                id: 'msg-1',
                sender: 'STUDENT',
                senderName: 'Bharathi M',
                text: "Hi Jay Sir! When should I use 'C'est un professeur' versus 'Il est professeur'? In today's live lecture slide 14, both were mentioned.",
                timestamp: 'Yesterday, 3:45 PM',
              },
              {
                id: 'msg-2',
                sender: 'AI_ASSISTANT',
                senderName: 'AI Grammar Assistant',
                text: "Quick Rule: Use 'C'est' + Article + Noun (e.g. C'est un professeur). Use 'Il est' directly with professions without an article (e.g. Il est professeur).",
                timestamp: 'Yesterday, 3:46 PM',
              },
              {
                id: 'msg-3',
                sender: 'TUTOR',
                senderName: 'Jay (Foreign Language Faculty)',
                text: "Excellent observation Bharathi! AI suggestion is spot on. Remember: If an adjective modifies the profession (e.g. 'un bon professeur'), you MUST use 'C'est un bon professeur'. Keep practicing!",
                timestamp: 'Yesterday, 4:02 PM',
              },
            ],
          },
          {
            id: 'dbt-a1-02',
            ticketNo: 'DBT-FR-A1-102',
            batchId: 'batch-2026-fr-a1-morning',
            studentName: 'Naveen Kumar B',
            studentRollNo: '2026-FR-8945',
            studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            collegeName: 'PSG College of Technology',
            topicTitle: 'Phonetic drill on nasal vowels "an", "on", "in" in French words',
            category: 'Pronunciation',
            status: 'OPEN',
            priority: 'HIGH',
            createdAt: 'Today, 10:15 AM',
            messages: [
              {
                id: 'msg-11',
                sender: 'STUDENT',
                senderName: 'Naveen Kumar B',
                text: "Bonjour Sir! When pronouncing 'croissant' and 'restaurant', my audio submission got flagged for mouth shape. How should I place my tongue?",
                timestamp: 'Today, 10:15 AM',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fr-a2',
    code: 'FR-102',
    levelBadge: 'CEFR A2',
    name: 'French A2: Elementary Narrative & Passé Composé',
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
        doubts: [
          {
            id: 'dbt-a2-01',
            ticketNo: 'DBT-FR-A2-201',
            batchId: 'batch-fr-a2',
            studentName: 'Alex D\'Souza',
            studentRollNo: '2026-FR-A2-101',
            studentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            topicTitle: 'Agreement of past participle with auxiliary "Être" vs "Avoir"',
            category: 'Grammar',
            status: 'OPEN',
            priority: 'HIGH',
            createdAt: 'Today, 09:30 AM',
            messages: [
              {
                id: 'msg-21',
                sender: 'STUDENT',
                senderName: 'Alex D\'Souza',
                text: "Sir, in Passé Composé, why does 'Elle est allée' add an extra 'e', but 'Elle a mangé' does not? When does auxiliary Avoir agree with the direct object?",
                timestamp: 'Today, 09:30 AM',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fr-b1',
    code: 'FR-201',
    levelBadge: 'CEFR B1',
    name: 'French B1: Independent Fluency & Subjunctive Mood',
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-800',
    batches: [
      {
        batchId: 'batch-fr-b1',
        batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
        sectionCode: 'Section Q (Evening Clinic)',
        dutyRole: 'Doubt Clearance Specialist',
        dutyBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        doubts: [
          {
            id: 'dbt-b1-01',
            ticketNo: 'DBT-FR-B1-301',
            batchId: 'batch-fr-b1',
            studentName: 'Sophie Martin',
            studentRollNo: '2026-FR-B1-201',
            studentAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            collegeName: 'ISML Global Executive Track',
            topicTitle: 'Why does "Je pense que" take Indicative but "Je ne pense pas que" takes Subjunctive?',
            category: 'Grammar',
            status: 'OPEN',
            priority: 'HIGH',
            createdAt: 'Today, 09:15 AM',
            messages: [
              {
                id: 'msg-31',
                sender: 'STUDENT',
                senderName: 'Sophie Martin',
                text: "Bonjour Jay Sir! In my B1 oral practice, why is 'Je pense qu'il vient' in indicative, but when negated 'Je ne pense pas qu'il vienne', it takes the subjunctive mood? Please clarify the nuance for viva.",
                timestamp: 'Today, 09:15 AM',
              },
            ],
          },
          {
            id: 'dbt-b1-02',
            ticketNo: 'DBT-FR-B1-302',
            batchId: 'batch-fr-b1',
            studentName: 'Dinesh Kumar',
            studentRollNo: '2026-FR-B1-202',
            studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            collegeName: 'PSG Tech Coimbatore',
            topicTitle: 'Mandatory liaison sound difference in "Ils ont" [il z‿ɔ̃] vs "Ils sont" [il sɔ̃]',
            category: 'Pronunciation',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            createdAt: 'Today, 10:45 AM',
            messages: [
              {
                id: 'msg-41',
                sender: 'STUDENT',
                senderName: 'Dinesh Kumar',
                text: "Sir, students in my group keep confusing the 'Z' buzz sound in 'Ils ont' and the crisp 'S' hiss in 'Ils sont'. Is there any oral practice drill you recommend?",
                timestamp: 'Today, 10:45 AM',
              },
              {
                id: 'msg-42',
                sender: 'TUTOR',
                senderName: 'Jay (Foreign Language Faculty)',
                text: "Hello Dinesh! Absolutely. Practice with a vocal buzz: put your fingers gently on your throat — 'Ils ont' causes vocal cord vibration [z]. In 'Ils sont', the [s] is completely unvoiced and unvibrating. Try recording a 10-second clip and send here!",
                timestamp: 'Today, 11:05 AM',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fr-b2',
    code: 'FR-202',
    levelBadge: 'CEFR B2',
    name: 'French B2: Advanced Oral Discourse & DELF Synthesis',
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
        doubts: [
          {
            id: 'dbt-b2-01',
            ticketNo: 'DBT-FR-B2-401',
            batchId: 'batch-fr-b2',
            studentName: 'Akash Sundaram',
            studentRollNo: '2026-FR-B2-301',
            studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University Guindy',
            topicTitle: 'Structuring DELF B2 formal essay with thesis, antithesis & synthesis connectors',
            category: 'Homework',
            status: 'OPEN',
            priority: 'HIGH',
            createdAt: 'Yesterday, 06:20 PM',
            messages: [
              {
                id: 'msg-51',
                sender: 'STUDENT',
                senderName: 'Akash Sundaram',
                text: "Sir, in the DELF B2 Dossier Synthèse, can I use 'Cependant' and 'Néanmoins' in the same transition paragraph or does it cause redundancy?",
                timestamp: 'Yesterday, 06:20 PM',
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function TutorDoubtsPage() {
  const { showSuccess, showInfo } = useToast();
  const { currentFaculty } = useTutor();

  // STEP 1: Selected Course ID (Defaults to French B1 where Jay has active Doubt Clearance Desk)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-b1');

  // STEP 2: Selected Batch ID (Defaults to French B1 Executive Cohort)
  const [selectedBatchId, setSelectedBatchId] = useState<string>('batch-fr-b1');

  // Active selected Course
  const activeCourse = useMemo(() => {
    return COURSE_DOUBTS_DATA.find((c) => c.id === selectedCourseId) || COURSE_DOUBTS_DATA[0];
  }, [selectedCourseId]);

  // Available batches under selected course
  const availableBatches = activeCourse.batches;

  // Active selected Batch
  const activeBatch = useMemo(() => {
    return availableBatches.find((b) => b.batchId === selectedBatchId) || availableBatches[0];
  }, [availableBatches, selectedBatchId]);

  // All doubts in active batch
  const [batchDoubts, setBatchDoubts] = useState<Record<string, CourseBatchDoubtItem[]>>(() => {
    const initial: Record<string, CourseBatchDoubtItem[]> = {};
    COURSE_DOUBTS_DATA.forEach((crs) => {
      crs.batches.forEach((b) => {
        initial[b.batchId] = b.doubts;
      });
    });
    return initial;
  });

  const currentDoubts = batchDoubts[activeBatch.batchId] || [];

  // Active Selected Doubt Thread
  const [activeDoubtId, setActiveDoubtId] = useState<string>(() => {
    return currentDoubts[0]?.id || 'dbt-b1-01';
  });

  const activeDoubt = useMemo(() => {
    return currentDoubts.find((d) => d.id === activeDoubtId) || currentDoubts[0];
  }, [currentDoubts, activeDoubtId]);

  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Grammar' | 'Pronunciation' | 'Homework'>('ALL');

  // Filtered Doubts in list
  const filteredDoubts = useMemo(() => {
    return currentDoubts.filter((d) => {
      if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.topicTitle.toLowerCase().includes(q) ||
          d.studentName.toLowerCase().includes(q) ||
          d.ticketNo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentDoubts, categoryFilter, searchQuery]);

  // Course Switch handler
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const crs = COURSE_DOUBTS_DATA.find((c) => c.id === courseId);
    if (crs && crs.batches.length > 0) {
      const firstBatch = crs.batches[0];
      setSelectedBatchId(firstBatch.batchId);
      const bDoubts = batchDoubts[firstBatch.batchId] || [];
      if (bDoubts.length > 0) setActiveDoubtId(bDoubts[0].id);
    }
  };

  // Batch Switch handler
  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    const bDoubts = batchDoubts[batchId] || [];
    if (bDoubts.length > 0) setActiveDoubtId(bDoubts[0].id);
  };

  // Reply submission
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDoubt) return;

    const newMsg: DoubtMessage = {
      id: `msg-${Date.now()}`,
      sender: 'TUTOR',
      senderName: currentFaculty.name,
      text: replyText,
      timestamp: 'Just now',
    };

    setBatchDoubts((prev) => {
      const updatedList = prev[activeBatch.batchId].map((d) => {
        if (d.id === activeDoubt.id) {
          return {
            ...d,
            status: 'IN_PROGRESS' as const,
            messages: [...d.messages, newMsg],
          };
        }
        return d;
      });
      return {
        ...prev,
        [activeBatch.batchId]: updatedList,
      };
    });

    setReplyText('');
    showSuccess('Explanation sent to student inquiry thread.');
  };

  // Mark Resolved
  const handleResolveDoubt = () => {
    if (!activeDoubt) return;

    setBatchDoubts((prev) => {
      const updatedList = prev[activeBatch.batchId].map((d) => {
        if (d.id === activeDoubt.id) {
          return {
            ...d,
            status: 'RESOLVED' as const,
          };
        }
        return d;
      });
      return {
        ...prev,
        [activeBatch.batchId]: updatedList,
      };
    });

    showSuccess(`Doubt ticket ${activeDoubt.ticketNo} marked as resolved!`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Doubt Clearance Desk' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Learner Doubt Clearance Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve student doubts and audio pronunciation inquiries across your assigned courses and batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold">
            {COURSE_DOUBTS_DATA.reduce((acc, c) => acc + c.batches.reduce((bAcc, b) => bAcc + b.doubts.length, 0), 0)} Total Doubt Tickets
          </span>
        </div>
      </div>

      {/* ─── STEP 1: SELECT COURSE (Mild Pastel Cards) ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Language Course
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Click course to reveal batch doubt clinics
          </span>
        </div>

        {/* 4 Mild Pastel Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {COURSE_DOUBTS_DATA.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const courseTotalDoubts = crs.batches.reduce(
              (acc, b) => acc + (batchDoubts[b.batchId]?.length || 0),
              0
            );

            return (
              <button
                key={crs.id}
                onClick={() => handleSelectCourse(crs.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected
                    ? `${crs.pastelBg} border-[#0052CC] ring-2 ring-blue-500/20 shadow-md`
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs'
                }`}
              >
                {/* Active selection ribbon */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]"></span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${crs.iconBg}`}>
                      {crs.code}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500">
                      {crs.levelBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-black leading-snug ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                      {crs.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">
                    {crs.batches.length} {crs.batches.length === 1 ? 'Cohort' : 'Cohorts'}
                  </span>
                  <span className={crs.accentColor}>
                    {courseTotalDoubts} Doubt Tickets
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
            {availableBatches.length} Assigned {availableBatches.length === 1 ? 'Batch' : 'Batches'}
          </span>
        </div>

        {/* Batch Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableBatches.map((b) => {
            const isSelected = selectedBatchId === b.batchId;
            const bDoubts = batchDoubts[b.batchId] || [];
            const openCount = bDoubts.filter((d) => d.status !== 'RESOLVED').length;

            return (
              <button
                key={b.batchId}
                onClick={() => handleSelectBatch(b.batchId)}
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
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-900">
                    {bDoubts.length} Tickets
                  </div>
                  <div className={`text-[11px] font-black ${openCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {openCount} Open Queries
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 3: DOUBT RESOLUTION SPLIT SCREEN (Left List, Right Conversation) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 cols): Doubts Queue for Active Batch */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[11px] font-black flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Q&A Queue ({filteredDoubts.length} Doubts)
              </span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
              {activeBatch.sectionCode}
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search question, student, or ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {(['ALL', 'Grammar', 'Pronunciation', 'Homework'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? 'All Queries' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of Doubt Cards */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredDoubts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No doubt tickets under this batch & filter.
              </div>
            ) : (
              filteredDoubts.map((t) => {
                const isSelected = activeDoubt?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveDoubtId(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[#0052CC] bg-blue-50/50 ring-2 ring-blue-500/10 shadow-xs'
                        : 'border-slate-200/80 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={t.studentAvatar}
                          alt={t.studentName}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <span className="text-xs font-bold text-slate-900">{t.studentName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                      {t.topicTitle}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {t.messages[0]?.text}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{t.ticketNo}</span>
                      <span>{t.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Active Doubt Conversation & Resolution Console */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden min-h-[580px]">
          {activeDoubt ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#0052CC]">
                      {activeDoubt.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      {activeDoubt.ticketNo}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{activeDoubt.collegeName}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                    {activeDoubt.topicTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeDoubt.status !== 'RESOLVED' ? (
                    <button
                      onClick={handleResolveDoubt}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[420px]">
                {activeDoubt.messages.map((m) => {
                  const isStudent = m.sender === 'STUDENT';
                  const isAI = m.sender === 'AI_ASSISTANT';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isStudent ? 'items-start' : isAI ? 'items-center' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-600">{m.senderName}</span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                          isStudent
                            ? 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                            : isAI
                            ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-[11px]'
                            : 'bg-[#0052CC] text-white rounded-tr-xs shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form Console */}
              <form
                onSubmit={handleSendReply}
                className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type pedagogical explanation or French grammar rule..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 m-auto">
              Select a doubt ticket from the left queue to open the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
