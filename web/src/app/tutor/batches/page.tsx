// ============================================================================
// ISML COLLEGE LMS — TUTOR: MY BATCHES & ENROLLED STUDENTS (/tutor/batches)
// Step-by-Step Clean & User-Friendly Hierarchy:
// STEP 1: Select Course (French A1, French A2, French B1, French B2) in pastel cards
// STEP 2: View and Select Batches under that specific course
// STEP 3: Click "View Student Roster" to open the Right-Side Slide-Over Drawer
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layers,
  Users,
  Search,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  CheckSquare,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Award,
  Video,
  Radio,
  FileText,
  Mail,
  Phone,
  Eye,
  X,
  Filter,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';

export interface BatchStudent {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  mobile: string;
  avatarUrl: string;
  collegeName: string;
  attendancePercentage: number;
  cefrLevel: string;
  lsrwStatus: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  assessmentsCompleted: number;
  doubtsRaised: number;
  gradeStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
}

interface BatchCardItem {
  id: string;
  batchId: string;
  batchName: string;
  sectionCode: string;
  schedule: string;
  dutyRole: string;
  dutyBadgeColor: string;
  studentsCount: number;
  students: BatchStudent[];
}

interface CoursePortfolioItem {
  id: string;
  code: string;
  levelBadge: string;
  name: string;
  cefrTrack: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
  batches: BatchCardItem[];
}

// Master Course & Batch Data Structure for Batches Page
const COURSES_PORTFOLIO: CoursePortfolioItem[] = [
  {
    id: 'crs-fr-a1',
    code: 'FR-101',
    levelBadge: 'CEFR A1',
    name: 'French A1: Beginner Foundations & Phonetics',
    cefrTrack: 'DELF A1 Certification Track',
    pastelBg: 'bg-blue-50/70',
    pastelBorder: 'border-blue-200',
    accentColor: 'text-[#0052CC]',
    iconBg: 'bg-blue-100 text-[#0052CC]',
    batches: [
      {
        id: 'alloc-jay-fr-a1-morning',
        batchId: 'batch-2026-fr-a1-morning',
        batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        sectionCode: 'Section A (Morning)',
        schedule: 'Mon & Wed • 10:00 - 11:30 AM',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        studentsCount: 6,
        students: [
          {
            id: 'stu-a1-01',
            name: 'Bharathi M',
            rollNo: '2026-FR-8942',
            email: 'bharathi.m@isml.edu',
            mobile: '+91 98401 23456',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University, Chennai',
            attendancePercentage: 94.5,
            cefrLevel: 'A1.2 (Elementary)',
            lsrwStatus: { listening: 88, speaking: 82, reading: 90, writing: 85 },
            assessmentsCompleted: 6,
            doubtsRaised: 2,
            gradeStatus: 'EXCELLENT',
          },
          {
            id: 'stu-a1-02',
            name: 'Karthikeyan S',
            rollNo: '2026-FR-8943',
            email: 'karthik.s@isml.edu',
            mobile: '+91 98402 34567',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            attendancePercentage: 88.0,
            cefrLevel: 'A1.1 (Beginner)',
            lsrwStatus: { listening: 80, speaking: 74, reading: 85, writing: 78 },
            assessmentsCompleted: 5,
            doubtsRaised: 4,
            gradeStatus: 'GOOD',
          },
          {
            id: 'stu-a1-03',
            name: 'Divya Lakshmi R',
            rollNo: '2026-FR-8944',
            email: 'divya.r@isml.edu',
            mobile: '+91 98403 45678',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Madras Christian College (MCC)',
            attendancePercentage: 96.0,
            cefrLevel: 'A1.2 (Elementary)',
            lsrwStatus: { listening: 92, speaking: 89, reading: 94, writing: 91 },
            assessmentsCompleted: 6,
            doubtsRaised: 1,
            gradeStatus: 'EXCELLENT',
          },
          {
            id: 'stu-a1-04',
            name: 'Naveen Kumar B',
            rollNo: '2026-FR-8945',
            email: 'naveen.b@isml.edu',
            mobile: '+91 98404 56789',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            collegeName: 'PSG College of Technology',
            attendancePercentage: 68.5,
            cefrLevel: 'A1.1 (Struggling)',
            lsrwStatus: { listening: 65, speaking: 58, reading: 70, writing: 62 },
            assessmentsCompleted: 3,
            doubtsRaised: 6,
            gradeStatus: 'NEEDS_ATTENTION',
          },
          {
            id: 'stu-a1-05',
            name: 'Ananya Deshmukh',
            rollNo: '2026-FR-8946',
            email: 'ananya.d@isml.edu',
            mobile: '+91 98405 67890',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Stella Maris College',
            attendancePercentage: 91.0,
            cefrLevel: 'A1.2 (Elementary)',
            lsrwStatus: { listening: 86, speaking: 84, reading: 88, writing: 82 },
            assessmentsCompleted: 6,
            doubtsRaised: 3,
            gradeStatus: 'GOOD',
          },
          {
            id: 'stu-a1-06',
            name: 'Siddharth Rao',
            rollNo: '2026-FR-8947',
            email: 'siddharth.r@isml.edu',
            mobile: '+91 98406 12345',
            avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University Guindy',
            attendancePercentage: 85.0,
            cefrLevel: 'A1.2 (Elementary)',
            lsrwStatus: { listening: 82, speaking: 79, reading: 85, writing: 80 },
            assessmentsCompleted: 5,
            doubtsRaised: 2,
            gradeStatus: 'GOOD',
          },
        ],
      },
      {
        id: 'alloc-jay-fr-a1-weekend',
        batchId: 'batch-2026-fr-a1-weekend',
        batchName: 'French A1 Fast-Track Weekend Bootcamp',
        sectionCode: 'Section B (Weekend)',
        schedule: 'Sat & Sun • 11:00 AM - 01:00 PM',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        studentsCount: 2,
        students: [
          {
            id: 'std-a1-07',
            name: 'Preethi Sundar',
            rollNo: '2026-FR-9011',
            email: 'preethi.s@isml.edu',
            mobile: '+91 98407 11223',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Women\'s Christian College (WCC)',
            attendancePercentage: 95.0,
            cefrLevel: 'A1.2 (Elementary)',
            lsrwStatus: { listening: 90, speaking: 87, reading: 93, writing: 89 },
            assessmentsCompleted: 6,
            doubtsRaised: 1,
            gradeStatus: 'EXCELLENT',
          },
          {
            id: 'std-a1-08',
            name: 'Varun Nair',
            rollNo: '2026-FR-9012',
            email: 'varun.n@isml.edu',
            mobile: '+91 98408 22334',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            attendancePercentage: 91.0,
            cefrLevel: 'A1.1 (Beginner)',
            lsrwStatus: { listening: 85, speaking: 81, reading: 88, writing: 84 },
            assessmentsCompleted: 5,
            doubtsRaised: 3,
            gradeStatus: 'GOOD',
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
    cefrTrack: 'DELF A2 Preparation',
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-800',
    batches: [
      {
        id: 'alloc-jay-fr-a2',
        batchId: 'batch-fr-a2',
        batchName: 'French A2 Cohort (Section B - Standby Coverage)',
        sectionCode: 'Section B (Afternoon)',
        schedule: 'Tue & Thu • 02:00 - 03:30 PM',
        dutyRole: 'Substitute Standby',
        dutyBadgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
        studentsCount: 3,
        students: [
          {
            id: 'std-a2-01',
            name: 'Alex D\'Souza',
            rollNo: '2026-FR-A2-101',
            email: 'alex.dsouza@isml.edu',
            mobile: '+91 98406 78901',
            avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            attendancePercentage: 92.5,
            cefrLevel: 'A2.1 (Elementary Fluency)',
            lsrwStatus: { listening: 84, speaking: 80, reading: 86, writing: 79 },
            assessmentsCompleted: 8,
            doubtsRaised: 3,
            gradeStatus: 'GOOD',
          },
          {
            id: 'std-a2-02',
            name: 'Pooja Ramachandran',
            rollNo: '2026-FR-A2-102',
            email: 'pooja.r@isml.edu',
            mobile: '+91 98407 89012',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University, CEG',
            attendancePercentage: 95.0,
            cefrLevel: 'A2.2 (Passé Composé Ready)',
            lsrwStatus: { listening: 91, speaking: 88, reading: 92, writing: 89 },
            assessmentsCompleted: 8,
            doubtsRaised: 1,
            gradeStatus: 'EXCELLENT',
          },
          {
            id: 'std-a2-03',
            name: 'Rohan Mehra',
            rollNo: '2026-FR-A2-103',
            email: 'rohan.m@isml.edu',
            mobile: '+91 98408 90123',
            avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
            collegeName: 'MCC Chennai',
            attendancePercentage: 74.0,
            cefrLevel: 'A2.1 (Needs Practice)',
            lsrwStatus: { listening: 72, speaking: 68, reading: 75, writing: 70 },
            assessmentsCompleted: 5,
            doubtsRaised: 5,
            gradeStatus: 'NEEDS_ATTENTION',
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
    cefrTrack: 'DELF B1 Intermediate Track',
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-800',
    batches: [
      {
        id: 'alloc-jay-fr-b1',
        batchId: 'batch-fr-b1',
        batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
        sectionCode: 'Section Q (Evening Clinic)',
        schedule: 'Tue & Thu • 05:30 - 07:00 PM',
        dutyRole: 'Doubt Clearance Specialist',
        dutyBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        studentsCount: 2,
        students: [
          {
            id: 'std-b1-01',
            name: 'Sophie Martin',
            rollNo: '2026-FR-B1-201',
            email: 'sophie.m@isml.edu',
            mobile: '+91 98409 01234',
            avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            collegeName: 'ISML Global Executive Track',
            attendancePercentage: 97.0,
            cefrLevel: 'B1 Independent Speaker',
            lsrwStatus: { listening: 94, speaking: 90, reading: 95, writing: 92 },
            assessmentsCompleted: 10,
            doubtsRaised: 2,
            gradeStatus: 'EXCELLENT',
          },
          {
            id: 'std-b1-02',
            name: 'Dinesh Kumar',
            rollNo: '2026-FR-B1-202',
            email: 'dinesh.k@isml.edu',
            mobile: '+91 98410 12345',
            avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            collegeName: 'PSG Tech Coimbatore',
            attendancePercentage: 89.5,
            cefrLevel: 'B1 Subjunctive Fluency',
            lsrwStatus: { listening: 86, speaking: 82, reading: 88, writing: 84 },
            assessmentsCompleted: 9,
            doubtsRaised: 4,
            gradeStatus: 'GOOD',
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
    cefrTrack: 'DELF B2 Advanced Fluency',
    pastelBg: 'bg-purple-50/70',
    pastelBorder: 'border-purple-200',
    accentColor: 'text-purple-800',
    iconBg: 'bg-purple-100 text-purple-800',
    batches: [
      {
        id: 'alloc-jay-fr-b2',
        batchId: 'batch-fr-b2',
        batchName: 'French B2 Advanced Cohort (Evaluation Desk)',
        sectionCode: 'Section V (Evaluation)',
        schedule: 'Friday • 03:00 - 05:00 PM',
        dutyRole: 'Assistant Evaluator',
        dutyBadgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
        studentsCount: 2,
        students: [
          {
            id: 'std-b2-01',
            name: 'Akash Sundaram',
            rollNo: '2026-FR-B2-301',
            email: 'akash.s@isml.edu',
            mobile: '+91 98411 23456',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University Guindy',
            attendancePercentage: 98.0,
            cefrLevel: 'DELF B2 Candidate',
            lsrwStatus: { listening: 95, speaking: 92, reading: 96, writing: 94 },
            assessmentsCompleted: 12,
            doubtsRaised: 1,
            gradeStatus: 'EXCELLENT',
          },
          {
            id: 'std-b2-02',
            name: 'Meera Krishnan',
            rollNo: '2026-FR-B2-302',
            email: 'meera.k@isml.edu',
            mobile: '+91 98412 34567',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            attendancePercentage: 93.0,
            cefrLevel: 'DELF B2 Argumentative',
            lsrwStatus: { listening: 90, speaking: 88, reading: 91, writing: 87 },
            assessmentsCompleted: 11,
            doubtsRaised: 2,
            gradeStatus: 'EXCELLENT',
          },
        ],
      },
    ],
  },
];

export default function TutorBatchesPage() {
  const { currentFaculty } = useTutor();

  // STEP 1: Selected Course ID (Defaults to French A1)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-a1');
  const [searchQuery, setSearchQuery] = useState('');

  // Right-Side Drawer State (Student Roster)
  const [activeBatchDrawer, setActiveBatchDrawer] = useState<{
    batchId: string;
    batchName: string;
    courseName: string;
    roleName: string;
    students: BatchStudent[];
  } | null>(null);

  // Student inspection inside right side drawer
  const [inspectStudent, setInspectStudent] = useState<BatchStudent | null>(null);

  // Active selected Course
  const activeCourse = useMemo(() => {
    return COURSES_PORTFOLIO.find((c) => c.id === selectedCourseId) || COURSES_PORTFOLIO[0];
  }, [selectedCourseId]);

  // Batches under the active course
  const currentBatches = activeCourse.batches;

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    if (!searchQuery) return currentBatches;
    const q = searchQuery.toLowerCase();
    return currentBatches.filter(
      (b) =>
        b.batchName.toLowerCase().includes(q) ||
        b.dutyRole.toLowerCase().includes(q) ||
        b.sectionCode.toLowerCase().includes(q)
    );
  }, [currentBatches, searchQuery]);

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Assigned Cohorts & Student Directory' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Assigned Cohorts & Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your language course and explore allocated cohorts, student rosters, and performance dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold">
            {COURSES_PORTFOLIO.reduce((acc, c) => acc + c.batches.length, 0)} Active Teaching Cohorts
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
            Click course card to reveal assigned batches
          </span>
        </div>

        {/* 4 Mild Pastel Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {COURSES_PORTFOLIO.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const totalCourseStudents = crs.batches.reduce((acc, b) => acc + b.studentsCount, 0);

            return (
              <button
                key={crs.id}
                onClick={() => setSelectedCourseId(crs.id)}
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
                    <p className="text-[11px] text-slate-500 mt-0.5">
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

      {/* ─── STEP 2: ASSIGNED BATCHES UNDER SELECTED COURSE ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
              2
            </span>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Assigned Batches for <span className="text-[#0052CC]">{activeCourse.code}: {activeCourse.name}</span>
            </h2>
          </div>

          {/* Search within course batches */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batch or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-800"
            />
          </div>
        </div>

        {/* Batches Grid under this Course */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBatches.map((b) => {
            const isCurrentlyInspecting = activeBatchDrawer?.batchId === b.batchId;

            return (
              <div
                key={b.id}
                className={`p-5 bg-white rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isCurrentlyInspecting
                    ? 'border-[#0052CC] ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/90 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${b.dutyBadgeColor}`}>
                      Duty: {b.dutyRole}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {b.sectionCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {b.batchName}
                    </h3>
                    <p className="text-xs text-[#0052CC] font-bold mt-0.5">
                      {activeCourse.name}
                    </p>
                  </div>

                  {/* Info row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0052CC]" />
                      <span><strong>{b.studentsCount}</strong> Enrolled Learners</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{b.schedule}</span>
                    </div>
                  </div>

                  {/* Avatar Peek Preview */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2 overflow-hidden">
                      {b.students.slice(0, 4).map((st) => (
                        <img
                          key={st.id}
                          src={st.avatarUrl}
                          alt={st.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      +{b.studentsCount > 4 ? b.studentsCount - 4 : 0} enrolled students
                    </span>
                  </div>
                </div>

                {/* Action Buttons: High-Fidelity Professional Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {/* Primary Action: View Student Roster Drawer */}
                  <button
                    onClick={() => {
                      setActiveBatchDrawer({
                        batchId: b.batchId,
                        batchName: b.batchName,
                        courseName: activeCourse.name,
                        roleName: b.dutyRole,
                        students: b.students,
                      });
                      setInspectStudent(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isCurrentlyInspecting
                        ? 'bg-[#0052CC] text-white shadow-md'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50/70 hover:from-blue-100 hover:to-indigo-100 text-[#0052CC] border border-blue-200/90'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>View Student Roster ({b.studentsCount})</span>
                  </button>

                  {/* Secondary Quick Action Buttons */}
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href="/tutor/attendance"
                      className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs"
                      title="Take daily student attendance for this batch"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Take Attendance</span>
                    </Link>

                    <Link
                      href="/tutor/live-classes"
                      className="flex-1 sm:flex-initial px-3 py-2 bg-[#0052CC] hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
                      title="Enter live webinar broadcast studio"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-300 shrink-0" />
                      <span>Live Studio</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 4. PROFESSIONAL RIGHT-SIDE SLIDE-OVER DRAWER (NO POP-UPS!) ─── */}
      {activeBatchDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-end p-0 font-sans animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Top Navigation & Header */}
            <div className="p-5 bg-gradient-to-r from-[#0B2447] via-[#092B5A] to-[#1E3A8A] text-white flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                    {activeBatchDrawer.roleName}
                  </span>
                  <span className="text-xs text-slate-300">Cohort Roster Drawer</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-1 truncate">
                  {activeBatchDrawer.batchName}
                </h2>
                <p className="text-xs text-blue-200 truncate">{activeBatchDrawer.courseName}</p>
              </div>

              <button
                onClick={() => {
                  setActiveBatchDrawer(null);
                  setInspectStudent(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Main Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {inspectStudent ? (
                /* Sub-view: Detailed Student Performance Inspection */
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <button
                      onClick={() => setInspectStudent(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Student Roster</span>
                    </button>
                    <span className="text-xs font-extrabold text-[#0052CC]">
                      Individual Student Dossier
                    </span>
                  </div>

                  {/* Student Header Card */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200/80 flex items-center gap-3.5">
                    <img
                      src={inspectStudent.avatarUrl}
                      alt={inspectStudent.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-xs"
                    />
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{inspectStudent.name}</h3>
                      <p className="text-xs text-blue-700 font-mono font-bold">{inspectStudent.rollNo}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{inspectStudent.collegeName}</p>
                    </div>
                  </div>

                  {/* Contact & Attendance */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Verified Email:</span>
                      <span className="font-bold text-[#0052CC]">{inspectStudent.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mobile:</span>
                      <span className="font-bold text-slate-800">{inspectStudent.mobile}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Current CEFR Level:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0052CC]">
                        {inspectStudent.cefrLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                      <span className="text-slate-500">Live Attendance:</span>
                      <span className="font-black text-emerald-600 text-sm">
                        {inspectStudent.attendancePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* CEFR LSRW Competency Scores */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      DELF French LSRW Competency Matrix
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-bold text-blue-700">🎧 LISTENING</span>
                        <div className="text-base font-black text-blue-900 mt-0.5">
                          {inspectStudent.lsrwStatus.listening}/100
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                        <span className="text-[10px] font-bold text-indigo-700">🗣️ SPEAKING</span>
                        <div className="text-base font-black text-indigo-900 mt-0.5">
                          {inspectStudent.lsrwStatus.speaking}/100
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <span className="text-[10px] font-bold text-purple-700">📖 READING</span>
                        <div className="text-base font-black text-purple-900 mt-0.5">
                          {inspectStudent.lsrwStatus.reading}/100
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-700">✍️ WRITING</span>
                        <div className="text-base font-black text-emerald-900 mt-0.5">
                          {inspectStudent.lsrwStatus.writing}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Performance */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Tests Completed</span>
                      <span className="font-black text-slate-900 text-sm">
                        {inspectStudent.assessmentsCompleted} / 12 Submissions
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Doubts Asked</span>
                      <span className="font-black text-[#0052CC] text-sm">
                        {inspectStudent.doubtsRaised} Q&A Tickets
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Primary View: Full Cohort Student Directory */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Enrolled Students ({activeBatchDrawer.students.length} Learners)
                    </span>
                    <span className="text-[11px] font-bold text-[#0052CC]">
                      DELF French Roster
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {activeBatchDrawer.students.map((st) => (
                      <div
                        key={st.id}
                        className="p-3.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3 bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{st.name}</h4>
                            <p className="text-[11px] font-mono text-slate-500">{st.rollNo}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-50 text-[#0052CC] border border-blue-200">
                                {st.cefrLevel}
                              </span>
                              <span className="text-[11px] font-bold text-emerald-600">
                                {st.attendancePercentage}% Att.
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setInspectStudent(st)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-[#0052CC] hover:text-white text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">
                Official Roster • {activeBatchDrawer.students.length} Learners
              </span>
              <button
                onClick={() => {
                  setActiveBatchDrawer(null);
                  setInspectStudent(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
