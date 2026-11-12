// ============================================================================
// ISML COLLEGE LMS — TUTOR: DOUBT CLEARANCE DESK (/tutor/doubts)
// Step-by-Step Clean & User-Friendly Hierarchy:
// STEP 1: Select Course (French A1, French A2, French B1, French B2) in pastel cards
// STEP 2: Select Assigned Batch / Cohort Q&A Desk
// STEP 3: Manage Doubt Inquiries, Audio Pronunciation Questions & Thread Resolution
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  CheckCheck,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';
import { fastFetch } from '@/lib/fastCache';
import { playMessageSound } from '@/lib/soundEffects';

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

const PASTEL_STYLES = [
  {
    pastelBg: 'bg-indigo-50/70',
    pastelBorder: 'border-indigo-200',
    accentColor: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-700',
  },
  {
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    pastelBg: 'bg-rose-50/70',
    pastelBorder: 'border-rose-200',
    accentColor: 'text-rose-700',
    iconBg: 'bg-rose-100 text-rose-700',
  },
];

export default function TutorDoubtsPage() {
  const { showSuccess, showInfo } = useToast();
  const { currentFaculty, myAllocations } = useTutor();

  const [coursesData, setCoursesData] = useState<CourseDoubtGroup[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [batchDoubts, setBatchDoubts] = useState<Record<string, CourseBatchDoubtItem[]>>({});
  const [activeDoubtId, setActiveDoubtId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Grammar' | 'Pronunciation' | 'Homework'>('ALL');

  const [isStudentTyping, setIsStudentTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const broadcastTutorTyping = () => {
    try {
      const bc = new BroadcastChannel('isml_doubts_webhook');
      bc.postMessage({ type: 'TYPING', sender: 'TUTOR', threadId: activeDoubt?.id });
      bc.close();
    } catch { }
  };

  // Load dynamically assigned courses, batches, and doubt inquiries for this tutor
  useEffect(() => {
    let isCancelled = false;

    async function loadDoubtDesk() {
      try {
        let rawCourses: any[] = [];
        let rawBatches: any[] = [];

        await Promise.all([
          fastFetch('/api/portals/courses', (cJson) => {
            if (cJson?.data) rawCourses = cJson.data;
          }),
          fastFetch('/api/portals/batches', (bJson) => {
            if (bJson?.data) rawBatches = bJson.data;
          }),
        ]);

        if (isCancelled) return;

        // Filter strictly to courses & batches assigned to this tutor (e.g. Joy JK)
        const allocatedCourseIds = new Set(myAllocations.map((a) => a.courseId).filter(Boolean));
        const allocatedCourseNames = new Set(myAllocations.map((a) => a.courseName?.toLowerCase()).filter(Boolean));
        const allocatedSubjectCodes = new Set(myAllocations.map((a) => a.subjectCode?.toLowerCase()).filter(Boolean));
        const allocatedBatchIds = new Set(myAllocations.map((a) => a.batchId).filter(Boolean));
        const allocatedBatchNames = new Set(myAllocations.map((a) => a.batchName?.toLowerCase()).filter(Boolean));

        const assignedCourses = rawCourses.filter((c: any) => {
          if (myAllocations.length === 0) return true;
          return (
            allocatedCourseIds.has(c.id) ||
            allocatedCourseNames.has(c.name?.toLowerCase()) ||
            allocatedSubjectCodes.has(c.code?.toLowerCase())
          );
        });

        // Check if student raised any doubts stored in DB (/api/portals/doubts) or shared localStorage
        let studentRaisedThreads: any[] = [];
        try {
          const dbtRes = await fetch('/api/portals/doubts');
          const dbtJson = await dbtRes.json();
          if (dbtJson?.data && Array.isArray(dbtJson.data)) {
            studentRaisedThreads = dbtJson.data;
          }
        } catch { }

        if (studentRaisedThreads.length === 0) {
          try {
            if (typeof window !== 'undefined') {
              const raw = localStorage.getItem('isml_student_doubts');
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) studentRaisedThreads = parsed;
              }
            }
          } catch { }
        }

        const initialDoubtsMap: Record<string, CourseBatchDoubtItem[]> = {};

        const parsedCourses: CourseDoubtGroup[] = assignedCourses.map((c: any, idx: number) => {
          const style = PASTEL_STYLES[idx % PASTEL_STYLES.length];
          const courseBatches: BatchDoubtGroup[] = rawBatches
            .filter((b: any) => {
              const matchesCourse =
                b.programId === c.id ||
                b.courseIds?.includes(c.id) ||
                (b.programName && c.name && b.programName.toLowerCase() === c.name.toLowerCase()) ||
                (b.code && c.code && b.code.toLowerCase().includes(c.code.toLowerCase()));
              const matchesAllocation =
                myAllocations.length === 0 ||
                allocatedBatchIds.has(b.id) ||
                allocatedBatchNames.has(b.name?.toLowerCase());
              return matchesCourse || matchesAllocation;
            })
            .map((b: any, bIdx: number) => {
              const matchedAlloc = myAllocations.find(
                (a) => a.batchId === b.id || a.batchName?.toLowerCase() === b.name?.toLowerCase()
              );
              const dutyRole =
                matchedAlloc?.tutorRole === 'LEAD_TRAINER'
                  ? 'Lead Native Trainer'
                  : matchedAlloc?.tutorRole === 'SUBSTITUTE_TUTOR'
                    ? 'Substitute Standby'
                    : matchedAlloc?.tutorRole === 'DOUBT_SOLVING_TUTOR'
                      ? 'Doubt Solving Tutor'
                      : 'Assistant Evaluator';

              // Map doubts assigned strictly to this tutor or this batch or available doubts
              const assignedDoubts: CourseBatchDoubtItem[] = studentRaisedThreads
                .filter((th: any) => {
                  const tutorMatch =
                    !th.assignedTutorName ||
                    th.assignedTutorName.toLowerCase().includes(currentFaculty.name.toLowerCase()) ||
                    currentFaculty.name.toLowerCase().includes((th.assignedTutorName || '').toLowerCase());
                  const batchMatch =
                    !th.batchName ||
                    th.batchName.toLowerCase().trim() === b.name?.toLowerCase().trim() ||
                    th.batchId === b.id;
                  const courseMatch =
                    !th.courseName ||
                    th.courseName.toLowerCase().trim() === c.name?.toLowerCase().trim();
                  return tutorMatch || batchMatch || courseMatch || studentRaisedThreads.length === 1;
                })
                .map((th: any, tIdx: number) => ({
                  id: th.id || `dbt-${b.id}-${tIdx + 1}`,
                  ticketNo: th.ticketNo || `TKT-${th.id?.slice(-4) || '9102'}`,
                  batchId: b.id,
                  studentName: th.studentName || th.messages?.[0]?.senderName || 'Muthu Pandian',
                  studentRollNo: th.studentRollNo || 'AMER-COL-STD-23',
                  studentAvatar: th.studentAvatar || `https://images.unsplash.com/photo-1534528741775?w=150`,
                  collegeName: th.collegeName || 'The American College',
                  topicTitle: th.topicTitle || 'Live Session Inquiry',
                  category: (th.category || 'Grammar') as any,
                  status: (th.status || 'OPEN') as any,
                  priority: (th.priority || 'HIGH') as const,
                  createdAt: th.createdAt || 'Today',
                  messages: (th.messages || []).map((m: any, mIdx: number) => ({
                    id: m.id || `msg-${mIdx}`,
                    sender: m.sender || 'STUDENT',
                    senderName: m.senderName || 'Student',
                    text: m.text || '',
                    timestamp: m.timestamp || 'Just now',
                  })),
                }));

              initialDoubtsMap[b.id] = assignedDoubts;

              return {
                batchId: b.id,
                batchName: b.name,
                sectionCode: `SEC-${String.fromCharCode(65 + bIdx)}`,
                dutyRole,
                dutyBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                doubts: assignedDoubts,
              };
            });

          return {
            id: c.id,
            code: c.code || `CRS-${idx + 1}`,
            levelBadge: c.program || 'Certificate',
            name: c.name,
            ...style,
            batches: courseBatches,
          };
        });

        if (!isCancelled) {
          setCoursesData(parsedCourses);
          setBatchDoubts(initialDoubtsMap);
          if (parsedCourses.length > 0) {
            setSelectedCourseId(parsedCourses[0].id);
            if (parsedCourses[0].batches.length > 0) {
              const firstBatch = parsedCourses[0].batches[0];
              setSelectedBatchId(firstBatch.batchId);
              const bDoubts = initialDoubtsMap[firstBatch.batchId] || [];
              if (bDoubts.length > 0) {
                setActiveDoubtId(bDoubts[0].id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load doubt desk:', err);
      }
    }

    loadDoubtDesk();

    // 1. Cross-tab BroadcastChannel webhook
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('isml_doubts_webhook');
      channel.onmessage = (event) => {
        if (event?.data?.type === 'DOUBTS_UPDATED') {
          setIsStudentTyping(false);
          loadDoubtDesk();
        } else if (event?.data?.type === 'TYPING' && event?.data?.sender === 'STUDENT') {
          setIsStudentTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsStudentTyping(false), 2500);
        }
      };
    } catch { }

    // 2. Window event listeners
    const handleDoubtUpdated = (e: any) => {
      loadDoubtDesk();
    };
    window.addEventListener('isml-doubt-thread-updated', handleDoubtUpdated);
    window.addEventListener('isml-realtime-event', handleDoubtUpdated);

    // 3. Ultra-fast 1.5s live polling webhook (zero page refresh needed)
    const interval = setInterval(loadDoubtDesk, 1500);

    return () => {
      isCancelled = true;
      channel?.close();
      window.removeEventListener('isml-doubt-thread-updated', handleDoubtUpdated);
      window.removeEventListener('isml-realtime-event', handleDoubtUpdated);
      clearInterval(interval);
    };
  }, [myAllocations, currentFaculty.name]);

  // Active selected Course
  const activeCourse = useMemo(() => {
    return coursesData.find((c) => c.id === selectedCourseId) || coursesData[0] || {
      id: 'crs-none',
      code: 'COURSE',
      levelBadge: 'CEFR',
      name: 'No Active Courses Assigned',
      pastelBg: 'bg-slate-50',
      pastelBorder: 'border-slate-200',
      accentColor: 'text-slate-600',
      iconBg: 'bg-slate-100 text-slate-600',
      batches: []
    };
  }, [coursesData, selectedCourseId]);

  // Available batches under selected course
  const availableBatches = activeCourse?.batches || [];

  // Active selected Batch
  const activeBatch = useMemo(() => {
    return availableBatches.find((b) => b.batchId === selectedBatchId) || availableBatches[0] || {
      batchId: 'batch-none',
      batchName: 'No Batches Assigned',
      sectionCode: 'Section',
      dutyRole: 'Tutor',
      dutyBadgeColor: 'bg-slate-50 text-slate-600 border-slate-200',
      doubts: []
    };
  }, [availableBatches, selectedBatchId]);

  const currentDoubts = (activeBatch?.batchId && batchDoubts[activeBatch.batchId]) || [];

  const activeDoubt = useMemo(() => {
    return currentDoubts.find((d) => d.id === activeDoubtId) || currentDoubts[0];
  }, [currentDoubts, activeDoubtId]);

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
    const crs = coursesData.find((c) => c.id === courseId);
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

  const tutorMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToTutorBottom = () => {
    tutorMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTutorBottom();
  }, [activeDoubt?.messages, isStudentTyping]);

  // Reply submission
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDoubt) return;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

    const newMsg: DoubtMessage = {
      id: `msg-${Date.now()}`,
      sender: 'TUTOR',
      senderName: currentFaculty.name,
      text: replyText,
      timestamp: formattedTime,
    };

    setBatchDoubts((prev) => {
      const updatedList = (prev[activeBatch.batchId] || []).map((d) => {
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

    // Sync back to student thread storage & API
    try {
      fetch('/api/portals/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPLY',
          threadId: activeDoubt.id,
          status: 'IN_PROGRESS',
          message: newMsg,
        }),
      }).catch(() => null);

      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('isml_student_doubts');
        if (raw) {
          const parsed = JSON.parse(raw);
          const updated = parsed.map((th: any) => {
            if (th.id === activeDoubt.id) {
              return {
                ...th,
                status: 'IN_PROGRESS',
                messages: [...(th.messages || []), newMsg],
              };
            }
            return th;
          });
          localStorage.setItem('isml_student_doubts', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('isml-doubt-thread-updated', { detail: updated }));
          window.dispatchEvent(new CustomEvent('isml-realtime-event', { detail: { type: 'DOUBTS_UPDATED' } }));
          try {
            const bc = new BroadcastChannel('isml_doubts_webhook');
            bc.postMessage({ type: 'DOUBTS_UPDATED' });
            bc.close();
          } catch { }
        }
      }
    } catch { }

    setReplyText('');
    playMessageSound('SENT');
    showSuccess(`Explanation sent to ${activeDoubt.studentName}'s inquiry thread.`);
  };

  // Mark Resolved
  const handleResolveDoubt = () => {
    if (!activeDoubt) return;

    setBatchDoubts((prev) => {
      const updatedList = (prev[activeBatch.batchId] || []).map((d) => {
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

    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('isml_student_doubts');
        if (raw) {
          const parsed = JSON.parse(raw);
          const updated = parsed.map((th: any) => {
            if (th.id === activeDoubt.id) {
              return { ...th, status: 'RESOLVED' };
            }
            return th;
          });
          localStorage.setItem('isml_student_doubts', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('isml-doubt-thread-updated', { detail: updated }));
        }
      }
    } catch { }

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
            {coursesData.reduce((acc, c) => acc + c.batches.reduce((bAcc, b) => bAcc + (batchDoubts[b.batchId]?.length || 0), 0), 0)} Total Doubt Tickets
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
          {coursesData.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const courseTotalDoubts = crs.batches.reduce(
              (acc, b) => acc + (batchDoubts[b.batchId]?.length || 0),
              0
            );

            return (
              <button
                key={crs.id}
                onClick={() => handleSelectCourse(crs.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${isSelected
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
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${categoryFilter === cat
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
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${isSelected
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
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${t.status === 'RESOLVED'
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
              <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[440px] bg-slate-50/70 font-sans">
                {activeDoubt.messages.map((m, mIdx) => {
                  const isStudent = m.sender === 'STUDENT';
                  const isAI = m.sender === 'AI_ASSISTANT';

                  return (
                    <div
                      key={m.id || mIdx}
                      className={`flex items-end gap-2 ${isStudent ? 'justify-start' : isAI ? 'justify-center' : 'justify-end'
                        } animate-in fade-in slide-in-from-bottom-2 duration-150`}
                    >
                      {isStudent && (
                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-blue-200 shadow-2xs">
                          {activeDoubt.studentName?.[0] || 'M'}
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[85%] sm:max-w-md p-3.5 sm:p-4 rounded-2xl space-y-1.5 text-xs sm:text-[13px] shadow-sm transition-all ${isStudent
                            ? 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-slate-200/50'
                            : isAI
                              ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-xl text-xs max-w-sm'
                              : 'bg-gradient-to-br from-[#0052CC] to-[#1E3A8A] text-white rounded-br-xs shadow-blue-500/10'
                          }`}
                      >
                        <div className={`flex items-center justify-between text-[11px] gap-2 pb-1 border-b ${!isStudent && !isAI ? 'border-white/15 text-blue-100 font-semibold' : 'border-slate-100 text-slate-500 font-bold'
                          }`}>
                          <span className="flex items-center gap-1.5 truncate">
                            {isAI ? 'AI Assistant' : isStudent ? `${activeDoubt.studentName} (${activeDoubt.studentRollNo})` : `You (${currentFaculty.name})`}
                          </span>
                          <span className="text-[10px] font-mono opacity-80 shrink-0">{m.timestamp}</span>
                        </div>

                        <p className="leading-relaxed whitespace-pre-line font-normal tracking-wide">
                          {m.text}
                        </p>

                        {!isStudent && !isAI && (
                          <div className="flex justify-end pt-0.5">
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-300 opacity-90" />
                          </div>
                        )}
                      </div>

                      {!isStudent && !isAI && (
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-emerald-200 shadow-2xs">
                          T
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 💬 Messenger Typing Indicator Dot Animation for Tutor View */}
                {isStudentTyping && (
                  <div className="flex items-end gap-2 justify-start animate-in fade-in slide-in-from-bottom-1 duration-150">
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-blue-200 shadow-2xs">
                      {activeDoubt.studentName?.[0] || 'M'}
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-xs shadow-sm flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">{activeDoubt.studentName} is typing</span>
                      <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-bounce"></span>
                    </div>
                  </div>
                )}
                <div ref={tutorMessagesEndRef} />
              </div>

              {/* Reply Form Console */}
              <form
                onSubmit={handleSendReply}
                className="p-3 sm:p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shadow-lg"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type reply or explanation to student... (Press Enter to Send)"
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      broadcastTutorTyping();
                    }}
                    className="w-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0052CC] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-3 bg-[#0052CC] hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#0052CC] text-white rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send Reply</span>
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
