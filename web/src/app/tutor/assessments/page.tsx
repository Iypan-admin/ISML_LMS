// ============================================================================
// ISML COLLEGE LMS — TUTOR: EXAMS, CEFR ASSESSMENTS & GRADEBOOK (/tutor/assessments)
// Step-by-Step Clean & Professional Hierarchy:
// STEP 1: Course Selection in Mild Pastel Cards (French A1, A2, B1, B2)
// STEP 2: Batch Selection under selected Course
// STEP 3: Assessment Type Filters (DELF CBT Mocks, Oral Vivas, Quizzes, End-Term)
// STEP 4: Interactive Cohort Roster Gradebook Table with individual student scores
// STEP 5: Right-Side Slide-Over Evaluation & Viva Scoring Desk (NO center popups!)
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  Clock,
  Users,
  Search,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Headphones,
  Mic,
  FileText,
  PenTool,
  Download,
  Eye,
  X,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  CheckSquare,
  FileCheck,
  Percent,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';

import { GENERATE_50_LSRW_QUESTIONS, LSRWQuestionItem } from '../assignments/page';

// Student Exam Result Record
export interface StudentAssessmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  studentAvatar: string;
  collegeName: string;
  status: 'EVALUATED' | 'PENDING_EVALUATION' | 'ABSENT' | 'IN_PROGRESS';
  submittedAt: string;
  totalScore?: number;
  maxScore: number;
  lsrwBreakdown: {
    listening: number; // out of 25
    speaking: number;  // out of 25
    reading: number;   // out of 25
    writing: number;   // out of 25
  };
  cefrVerdict?: 'CEFR_A1_CERTIFIED' | 'PASS_WITH_HONORS' | 'PASS' | 'NEEDS_RETEST';
  proctoringFlags: number;
  vivaAudioUrl?: string;
  vivaRecordingTime?: string;
  tutorFeedback?: string;
  evaluatorNotes?: string;
  lsrwQuestions?: LSRWQuestionItem[];
}

// Assessment / Exam Definition
export interface CohortExamItem {
  id: string;
  code: string;
  title: string;
  type: 'DELF_CBT_MOCK' | 'ORAL_VIVA' | 'MID_TERM' | 'FINAL_EXAM' | 'UNIT_QUIZ';
  lsrwFocus: 'COMPREHENSIVE_LSRW' | 'SPEAKING' | 'LISTENING' | 'WRITING' | 'READING';
  totalQuestions: number;
  durationMins: number;
  totalMarks: number;
  passingMarks: number;
  scheduledWindow: string;
  proctoringEnabled: boolean;
  status: 'PUBLISHED' | 'EVALUATION_ACTIVE' | 'ARCHIVED';
  studentsCount: number;
  evaluatedCount: number;
  cohortAveragePercent: number;
  records: StudentAssessmentRecord[];
}

interface BatchExamGroup {
  batchId: string;
  batchName: string;
  sectionCode: string;
  schedule: string;
  dutyRole: string;
  dutyBadgeColor: string;
  exams: CohortExamItem[];
}

interface CourseExamGroup {
  id: string;
  code: string;
  levelBadge: string;
  name: string;
  cefrTrack: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
  batches: BatchExamGroup[];
}

// Master Course & Batch Exams Dataset for Jay (French Specialist)
const COURSE_ASSESSMENTS_DATA: CourseExamGroup[] = [
  {
    id: 'crs-fr-a1',
    code: 'FR-101',
    levelBadge: 'CEFR A1',
    name: 'French A1: Beginner Foundations & Phonetics',
    cefrTrack: 'DELF A1 Official Certification Track',
    pastelBg: 'bg-blue-50/70',
    pastelBorder: 'border-blue-200',
    accentColor: 'text-[#0052CC]',
    iconBg: 'bg-blue-100 text-[#0052CC]',
    batches: [
      {
        batchId: 'batch-2026-fr-a1-morning',
        batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        sectionCode: 'Section A (Morning)',
        schedule: 'Mon & Wed • 10:00 - 11:30 AM',
        dutyRole: 'Lead Trainer & Chief Examiner',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        exams: [
          {
            id: 'exam-a1-delf-mock',
            code: 'EXAM-A1-01',
            title: 'DELF A1 National Benchmark CBT Mock Examination 2026',
            type: 'DELF_CBT_MOCK',
            lsrwFocus: 'COMPREHENSIVE_LSRW',
            totalQuestions: 50,
            durationMins: 80,
            totalMarks: 100,
            passingMarks: 50,
            scheduledWindow: 'Exam Window: Mon, Oct 12 • 10:00 AM - 12:00 PM',
            proctoringEnabled: true,
            status: 'EVALUATION_ACTIVE',
            studentsCount: 6,
            evaluatedCount: 4,
            cohortAveragePercent: 84,
            records: [
              {
                id: 'rec-a1-01',
                studentId: 'stu-a1-01',
                studentName: 'Bharathi M',
                studentRollNo: '2026-FR-8942',
                studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University, Chennai',
                status: 'EVALUATED',
                submittedAt: 'Oct 12, 11:24 AM',
                totalScore: 92,
                maxScore: 100,
                lsrwBreakdown: { listening: 24, speaking: 22, reading: 24, writing: 22 },
                cefrVerdict: 'CEFR_A1_CERTIFIED',
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/bharathi_delf_viva.mp3',
                vivaRecordingTime: '12m 45s',
                tutorFeedback: 'Superb control over nasal vowels and natural polite greetings. Ready for A2!',
                evaluatorNotes: 'Distinction level performance. Perfect phonetic liaison.',
              },
              {
                id: 'rec-a1-02',
                studentId: 'stu-a1-02',
                studentName: 'Karthikeyan S',
                studentRollNo: '2026-FR-8943',
                studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Loyola College (Autonomous)',
                status: 'PENDING_EVALUATION',
                submittedAt: 'Oct 12, 11:42 AM',
                maxScore: 100,
                lsrwBreakdown: { listening: 0, speaking: 0, reading: 0, writing: 0 },
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/karthik_oral_viva.mp3',
                vivaRecordingTime: '11m 15s',
                tutorFeedback: '',
                evaluatorNotes: 'Oral Viva audio pending review. CBT parts auto-graded.',
              },
              {
                id: 'rec-a1-03',
                studentId: 'stu-a1-03',
                studentName: 'Divya Lakshmi R',
                studentRollNo: '2026-FR-8944',
                studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Madras Christian College (MCC)',
                status: 'EVALUATED',
                submittedAt: 'Oct 12, 11:18 AM',
                totalScore: 95,
                maxScore: 100,
                lsrwBreakdown: { listening: 25, speaking: 23, reading: 25, writing: 22 },
                cefrVerdict: 'CEFR_A1_CERTIFIED',
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/divya_viva.mp3',
                vivaRecordingTime: '14m 20s',
                tutorFeedback: 'Exemplary reading and listening speed. Near-native French cadence.',
                evaluatorNotes: 'Highest score in Section A.',
              },
              {
                id: 'rec-a1-04',
                studentId: 'stu-a1-04',
                studentName: 'Rohan Mehra',
                studentRollNo: '2026-FR-8945',
                studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                collegeName: 'PSG College of Technology',
                status: 'PENDING_EVALUATION',
                submittedAt: 'Oct 12, 11:50 AM',
                maxScore: 100,
                lsrwBreakdown: { listening: 0, speaking: 0, reading: 0, writing: 0 },
                proctoringFlags: 1,
                vivaAudioUrl: 'https://isml.edu/audio/rohan_oral_viva.mp3',
                vivaRecordingTime: '10m 05s',
                tutorFeedback: '',
                evaluatorNotes: 'Minor screen switch flag detected; verify viva consistency.',
              },
              {
                id: 'rec-a1-05',
                studentId: 'stu-a1-05',
                studentName: 'Sneha Venkatesh',
                studentRollNo: '2026-FR-8946',
                studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Stella Maris College',
                status: 'EVALUATED',
                submittedAt: 'Oct 12, 11:29 AM',
                totalScore: 88,
                maxScore: 100,
                lsrwBreakdown: { listening: 22, speaking: 21, reading: 23, writing: 22 },
                cefrVerdict: 'CEFR_A1_CERTIFIED',
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/sneha_viva.mp3',
                vivaRecordingTime: '13m 10s',
                tutorFeedback: 'Solid understanding of regular ER verbs and question inversions.',
              },
              {
                id: 'rec-a1-06',
                studentId: 'stu-a1-06',
                studentName: 'Praveen Kumar M',
                studentRollNo: '2026-FR-8947',
                studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
                collegeName: 'SRM Institute of Science and Tech',
                status: 'EVALUATED',
                submittedAt: 'Oct 12, 11:35 AM',
                totalScore: 78,
                maxScore: 100,
                lsrwBreakdown: { listening: 19, speaking: 18, reading: 21, writing: 20 },
                cefrVerdict: 'PASS',
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/praveen_viva.mp3',
                vivaRecordingTime: '11m 40s',
                tutorFeedback: 'Good effort. Keep practicing number dictation and listening speed.',
              },
            ],
          },
          {
            id: 'exam-a1-oral-viva',
            code: 'EXAM-A1-VIVA',
            title: 'CEFR A1 1-on-1 Interactive Oral Viva Examination',
            type: 'ORAL_VIVA',
            lsrwFocus: 'SPEAKING',
            totalQuestions: 15,
            durationMins: 20,
            totalMarks: 50,
            passingMarks: 25,
            scheduledWindow: 'Live Viva Desk: Wed, Oct 14 • 02:00 - 05:00 PM',
            proctoringEnabled: true,
            status: 'PUBLISHED',
            studentsCount: 6,
            evaluatedCount: 2,
            cohortAveragePercent: 82,
            records: [
              {
                id: 'rec-viva-01',
                studentId: 'stu-a1-01',
                studentName: 'Bharathi M',
                studentRollNo: '2026-FR-8942',
                studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University, Chennai',
                status: 'EVALUATED',
                submittedAt: 'Oct 14, 02:20 PM',
                totalScore: 46,
                maxScore: 50,
                lsrwBreakdown: { listening: 11, speaking: 23, reading: 6, writing: 6 },
                cefrVerdict: 'PASS_WITH_HONORS',
                proctoringFlags: 0,
                tutorFeedback: 'Fluid answers to situational roleplay in French boulangerie.',
              },
              {
                id: 'rec-viva-02',
                studentId: 'stu-a1-03',
                studentName: 'Divya Lakshmi R',
                studentRollNo: '2026-FR-8944',
                studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Madras Christian College (MCC)',
                status: 'EVALUATED',
                submittedAt: 'Oct 14, 02:45 PM',
                totalScore: 48,
                maxScore: 50,
                lsrwBreakdown: { listening: 12, speaking: 24, reading: 6, writing: 6 },
                cefrVerdict: 'PASS_WITH_HONORS',
                proctoringFlags: 0,
                tutorFeedback: 'Remarkable oral eloquence and pronunciation.',
              },
            ],
          },
        ],
      },
      {
        batchId: 'batch-2026-fr-a1-weekend',
        batchName: 'French A1 Fast-Track Weekend Bootcamp',
        sectionCode: 'Section B (Weekend)',
        schedule: 'Sat & Sun • 11:00 AM - 01:00 PM',
        dutyRole: 'Lead Trainer & Chief Examiner',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        exams: [
          {
            id: 'exam-a1-wknd-mid',
            code: 'EXAM-A1-WK-01',
            title: 'Weekend Mid-Term Modular Checkpoint (Phonetics & Vocabulary)',
            type: 'MID_TERM',
            lsrwFocus: 'COMPREHENSIVE_LSRW',
            totalQuestions: 40,
            durationMins: 60,
            totalMarks: 50,
            passingMarks: 25,
            scheduledWindow: 'Online Window: Saturday • 11:00 AM - 12:00 PM',
            proctoringEnabled: false,
            status: 'PUBLISHED',
            studentsCount: 2,
            evaluatedCount: 2,
            cohortAveragePercent: 86,
            records: [
              {
                id: 'rec-wk-01',
                studentId: 'stu-a1-wk-01',
                studentName: 'Ananya Sharma',
                studentRollNo: '2026-FR-8948',
                studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                collegeName: 'SRM Institute, Kattankulathur',
                status: 'EVALUATED',
                submittedAt: 'Oct 11, 11:58 AM',
                totalScore: 45,
                maxScore: 50,
                lsrwBreakdown: { listening: 12, speaking: 11, reading: 11, writing: 11 },
                cefrVerdict: 'PASS_WITH_HONORS',
                proctoringFlags: 0,
                tutorFeedback: 'Strong grammar baseline.',
              },
              {
                id: 'rec-wk-02',
                studentId: 'stu-a1-wk-02',
                studentName: 'Vikram Sundaram',
                studentRollNo: '2026-FR-8949',
                studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Hindustan University',
                status: 'EVALUATED',
                submittedAt: 'Oct 11, 11:55 AM',
                totalScore: 41,
                maxScore: 50,
                lsrwBreakdown: { listening: 10, speaking: 10, reading: 11, writing: 10 },
                cefrVerdict: 'PASS',
                proctoringFlags: 0,
                tutorFeedback: 'Steady progression across all phonetics drills.',
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
    name: 'French A2: Elementary Communication & Practical Fluency',
    cefrTrack: 'DELF A2 Certification Track',
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
    batches: [
      {
        batchId: 'batch-fr-a2',
        batchName: 'French A2 Cohort (Section B - Standby Coverage)',
        sectionCode: 'Section B (Afternoon)',
        schedule: 'Tue & Thu • 02:00 - 03:30 PM',
        dutyRole: 'Substitute Standby & Co-Examiner',
        dutyBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        exams: [
          {
            id: 'exam-a2-delf-sim',
            code: 'EXAM-A2-01',
            title: 'DELF A2 Official Simulation Examination (Passé Composé & Imparfait)',
            type: 'DELF_CBT_MOCK',
            lsrwFocus: 'COMPREHENSIVE_LSRW',
            totalQuestions: 45,
            durationMins: 90,
            totalMarks: 100,
            passingMarks: 50,
            scheduledWindow: 'Exam Window: Tuesday • 02:00 - 03:30 PM',
            proctoringEnabled: true,
            status: 'EVALUATION_ACTIVE',
            studentsCount: 3,
            evaluatedCount: 2,
            cohortAveragePercent: 81,
            records: [
              {
                id: 'rec-a2-01',
                studentId: 'stu-a2-01',
                studentName: 'Harish R',
                studentRollNo: '2026-FR-7101',
                studentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
                collegeName: 'PSG Tech, Coimbatore',
                status: 'EVALUATED',
                submittedAt: 'Oct 13, 03:22 PM',
                totalScore: 84,
                maxScore: 100,
                lsrwBreakdown: { listening: 21, speaking: 20, reading: 22, writing: 21 },
                cefrVerdict: 'PASS_WITH_HONORS',
                proctoringFlags: 0,
                tutorFeedback: 'Proper agreement of past participles with être verbs.',
              },
              {
                id: 'rec-a2-02',
                studentId: 'stu-a2-02',
                studentName: 'Kavitha S',
                studentRollNo: '2026-FR-7102',
                studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                collegeName: 'SSN College of Engineering',
                status: 'PENDING_EVALUATION',
                submittedAt: 'Oct 13, 03:28 PM',
                maxScore: 100,
                lsrwBreakdown: { listening: 0, speaking: 0, reading: 0, writing: 0 },
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/kavitha_a2_viva.mp3',
                vivaRecordingTime: '12m 30s',
                evaluatorNotes: 'Pending evaluation of Section C essay and viva recording.',
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
    name: 'French B1: Intermediate Fluency & Complex Expression',
    cefrTrack: 'DELF B1 Professional Certification Track',
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-800',
    batches: [
      {
        batchId: 'batch-fr-b1',
        batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
        sectionCode: 'Section C (Evening Executive)',
        schedule: 'Tue & Thu • 05:30 - 07:00 PM',
        dutyRole: 'Doubt Clearance & Oral Viva Examiner',
        dutyBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        exams: [
          {
            id: 'exam-b1-viva-subjunctive',
            code: 'EXAM-B1-ORAL',
            title: 'DELF B1 Speaking & Argumentation Assessment (Subjunctive & Defense)',
            type: 'ORAL_VIVA',
            lsrwFocus: 'SPEAKING',
            totalQuestions: 20,
            durationMins: 45,
            totalMarks: 50,
            passingMarks: 30,
            scheduledWindow: 'Viva Desk: Thursday • 05:30 - 07:00 PM',
            proctoringEnabled: true,
            status: 'EVALUATION_ACTIVE',
            studentsCount: 2,
            evaluatedCount: 1,
            cohortAveragePercent: 88,
            records: [
              {
                id: 'rec-b1-01',
                studentId: 'stu-b1-01',
                studentName: 'Suresh Kumar',
                studentRollNo: '2026-FR-6011',
                studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'IIT Madras (Continuing Education)',
                status: 'EVALUATED',
                submittedAt: 'Oct 08, 06:15 PM',
                totalScore: 44,
                maxScore: 50,
                lsrwBreakdown: { listening: 10, speaking: 23, reading: 5, writing: 6 },
                cefrVerdict: 'PASS_WITH_HONORS',
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/suresh_b1_viva.mp3',
                vivaRecordingTime: '15m 45s',
                tutorFeedback: 'Superb defense of cultural preservation thesis using subjunctive triggers.',
              },
              {
                id: 'rec-b1-02',
                studentId: 'stu-b1-02',
                studentName: 'Pooja Iyer',
                studentRollNo: '2026-FR-6012',
                studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Great Lakes Institute of Management',
                status: 'PENDING_EVALUATION',
                submittedAt: 'Oct 08, 06:40 PM',
                maxScore: 50,
                lsrwBreakdown: { listening: 0, speaking: 0, reading: 0, writing: 0 },
                proctoringFlags: 0,
                vivaAudioUrl: 'https://isml.edu/audio/pooja_b1_viva.mp3',
                vivaRecordingTime: '16m 10s',
                evaluatorNotes: 'Oral defense recorded; rubric marking required.',
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
    name: 'French B2: Advanced Oral Discourse & Synthesizing Text',
    cefrTrack: 'DELF B2 Academic & Immigration Track',
    pastelBg: 'bg-purple-50/70',
    pastelBorder: 'border-purple-200',
    accentColor: 'text-purple-700',
    iconBg: 'bg-purple-100 text-purple-700',
    batches: [
      {
        batchId: 'batch-fr-b2',
        batchName: 'French B2 Advanced Cohort (Evaluation Desk)',
        sectionCode: 'Section D (Friday Intensive)',
        schedule: 'Friday • 03:00 - 05:00 PM',
        dutyRole: 'Assistant Evaluator & Thesis Reader',
        dutyBadgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
        exams: [
          {
            id: 'exam-b2-synthese-eval',
            code: 'EXAM-B2-01',
            title: 'DELF B2 Formal Synthesis & Argumentative Essay Evaluation',
            type: 'FINAL_EXAM',
            lsrwFocus: 'COMPREHENSIVE_LSRW',
            totalQuestions: 25,
            durationMins: 120,
            totalMarks: 100,
            passingMarks: 60,
            scheduledWindow: 'Evaluation Window: Friday • 03:00 - 05:00 PM',
            proctoringEnabled: true,
            status: 'EVALUATION_ACTIVE',
            studentsCount: 2,
            evaluatedCount: 1,
            cohortAveragePercent: 86,
            records: [
              {
                id: 'rec-b2-01',
                studentId: 'stu-b2-01',
                studentName: 'Meera Nambiar',
                studentRollNo: '2026-FR-5021',
                studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Loyola College (Autonomous)',
                status: 'EVALUATED',
                submittedAt: 'Oct 09, 04:50 PM',
                totalScore: 89,
                maxScore: 100,
                lsrwBreakdown: { listening: 22, speaking: 23, reading: 22, writing: 22 },
                cefrVerdict: 'CEFR_A1_CERTIFIED',
                proctoringFlags: 0,
                tutorFeedback: 'Flawless textual synthesis adhering to DELF B2 standard guidelines.',
              },
              {
                id: 'rec-b2-02',
                studentId: 'stu-b2-02',
                studentName: 'Aditya Varma',
                studentRollNo: '2026-FR-5022',
                studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'National Institute of Design',
                status: 'PENDING_EVALUATION',
                submittedAt: 'Oct 09, 04:55 PM',
                maxScore: 100,
                lsrwBreakdown: { listening: 0, speaking: 0, reading: 0, writing: 0 },
                proctoringFlags: 0,
                evaluatorNotes: 'Argumentative synthesis essay under review by Jay.',
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function TutorAssessmentsPage() {
  const { showSuccess } = useToast();
  const { currentFaculty } = useTutor();

  // STEP 1: Selected Course ID
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-a1');

  // Active Course
  const activeCourse = useMemo(() => {
    return COURSE_ASSESSMENTS_DATA.find((c) => c.id === selectedCourseId) || COURSE_ASSESSMENTS_DATA[0];
  }, [selectedCourseId]);

  // STEP 2: Selected Batch ID under this Course
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeCourse.batches[0]?.batchId || '');

  // Active Batch
  const activeBatch = useMemo(() => {
    return activeCourse.batches.find((b) => b.batchId === selectedBatchId) || activeCourse.batches[0];
  }, [activeCourse, selectedBatchId]);

  // Current Exams under Active Batch
  const currentExams = activeBatch.exams;

  // Selected Exam ID
  const [selectedExamId, setSelectedExamId] = useState<string>(currentExams[0]?.id || '');

  const activeExam = useMemo(() => {
    return currentExams.find((e) => e.id === selectedExamId) || currentExams[0];
  }, [currentExams, selectedExamId]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EVALUATED' | 'PENDING_EVALUATION'>('ALL');

  // FULL-SCREEN EVALUATION STUDIO STATE (NO CENTER POPUPS!)
  const [evaluatingRecord, setEvaluatingRecord] = useState<StudentAssessmentRecord | null>(null);
  const [activeLsrwQuestions, setActiveLsrwQuestions] = useState<LSRWQuestionItem[]>([]);
  const [activeSectionFilter, setActiveSectionFilter] = useState<'ALL' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('ALL');

  // Rubric Scores for the slide-over / studio
  const [drawerScores, setDrawerScores] = useState({
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  });
  const [drawerVerdict, setDrawerVerdict] = useState<
    'CEFR_A1_CERTIFIED' | 'PASS_WITH_HONORS' | 'PASS' | 'NEEDS_RETEST'
  >('PASS');
  const [drawerRemarks, setDrawerRemarks] = useState('');
  const [drawerEvaluatorNote, setDrawerEvaluatorNote] = useState('');

  // Course Switch handler
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const crs = COURSE_ASSESSMENTS_DATA.find((c) => c.id === courseId);
    if (crs && crs.batches.length > 0) {
      const firstBatch = crs.batches[0];
      setSelectedBatchId(firstBatch.batchId);
      if (firstBatch.exams.length > 0) {
        setSelectedExamId(firstBatch.exams[0].id);
      }
    }
  };

  // Batch Switch handler
  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    const b = activeCourse.batches.find((batch) => batch.batchId === batchId);
    if (b && b.exams.length > 0) {
      setSelectedExamId(b.exams[0].id);
    }
  };

  // Open Full-Screen Evaluation Studio
  const handleOpenEvaluationDrawer = (rec: StudentAssessmentRecord) => {
    setEvaluatingRecord(rec);
    const isAlreadyEvaluated = rec.status === 'EVALUATED';

    // Initialize 50 LSRW questions for this candidate
    const questions = rec.lsrwQuestions && rec.lsrwQuestions.length > 0
      ? rec.lsrwQuestions
      : GENERATE_50_LSRW_QUESTIONS(rec.studentName, isAlreadyEvaluated);
    setActiveLsrwQuestions(questions);
    setActiveSectionFilter('ALL');

    // Calculate marks per section (scale 25 each out of 100 max)
    const listeningMarks = questions.filter((q) => q.section === 'LISTENING').reduce((sum, q) => sum + q.marksAwarded, 0);
    const speakingMarks = questions.filter((q) => q.section === 'SPEAKING').reduce((sum, q) => sum + q.marksAwarded, 0);
    const readingMarks = questions.filter((q) => q.section === 'READING').reduce((sum, q) => sum + q.marksAwarded, 0);
    const writingMarks = questions.filter((q) => q.section === 'WRITING').reduce((sum, q) => sum + q.marksAwarded, 0);

    // If evaluated, populate existing scores; if pending review, start fresh with 0 marks
    setDrawerScores(
      isAlreadyEvaluated
        ? rec.lsrwBreakdown
        : {
            listening: Math.round((listeningMarks / 10) * 25),
            speaking: Math.round((speakingMarks / 10) * 25),
            reading: Math.round((readingMarks / 10) * 25),
            writing: Math.round((writingMarks / 20) * 25),
          }
    );
    setDrawerVerdict(rec.cefrVerdict || 'PASS');
    setDrawerRemarks(rec.tutorFeedback || '');
    setDrawerEvaluatorNote(rec.evaluatorNotes || '');
  };

  // Update Mark for a specific question (0 to 10 marks) and recalculate
  const handleUpdateQuestionMark = (qId: number, newMark: number) => {
    setActiveLsrwQuestions((prev) => {
      const updated = prev.map((item) => {
        if (item.id === qId) {
          const max = item.maxMarks || 10;
          const status: 'CORRECT' | 'PARTIAL' | 'INCORRECT' =
            newMark === max ? 'CORRECT' : newMark > 0 ? 'PARTIAL' : 'INCORRECT';
          return { ...item, marksAwarded: newMark, status };
        }
        return item;
      });

      // Recalculate 4 LSRW categories for the 100 mark exam scale
      const lMarks = updated.filter((q) => q.section === 'LISTENING').reduce((sum, q) => sum + q.marksAwarded, 0);
      const sMarks = updated.filter((q) => q.section === 'SPEAKING').reduce((sum, q) => sum + q.marksAwarded, 0);
      const rMarks = updated.filter((q) => q.section === 'READING').reduce((sum, q) => sum + q.marksAwarded, 0);
      const wMarks = updated.filter((q) => q.section === 'WRITING').reduce((sum, q) => sum + q.marksAwarded, 0);

      const total50 = updated.reduce((sum, q) => sum + q.marksAwarded, 0);

      setDrawerScores({
        listening: Math.round((lMarks / 10) * 25),
        speaking: Math.round((sMarks / 10) * 25),
        reading: Math.round((rMarks / 10) * 25),
        writing: Math.round((wMarks / 20) * 25),
      });

      // Automatically recommend CEFR verdict based on total percentage
      if (total50 >= 45) {
        setDrawerVerdict('CEFR_A1_CERTIFIED');
      } else if (total50 >= 38) {
        setDrawerVerdict('PASS_WITH_HONORS');
      } else if (total50 >= 25) {
        setDrawerVerdict('PASS');
      } else {
        setDrawerVerdict('NEEDS_RETEST');
      }

      return updated;
    });
  };

  // Update Tutor inline correction text for a specific question
  const handleUpdateQuestionCorrection = (qId: number, text: string) => {
    setActiveLsrwQuestions((prev) =>
      prev.map((item) => (item.id === qId ? { ...item, tutorCorrectedAnswer: text } : item))
    );
  };

  // Quick action: Mark all 5 tasks as Correct (100% full marks: 50/50 raw = 100/100 scaled)
  const handleQuickMarkAllCorrect = () => {
    setActiveLsrwQuestions((prev) =>
      prev.map((item) => ({ ...item, marksAwarded: item.maxMarks || 10, status: 'CORRECT' }))
    );
    setDrawerScores({
      listening: 25,
      speaking: 25,
      reading: 25,
      writing: 25,
    });
    setDrawerVerdict('CEFR_A1_CERTIFIED');
  };

  // Save Evaluation & Recalculate Total
  const handleSaveAssessmentEvaluation = () => {
    if (!evaluatingRecord) return;

    const total50Marks = activeLsrwQuestions.reduce((sum, q) => sum + q.marksAwarded, 0);
    // Scale 50 marks to exam maxScore (e.g. 100 or 50)
    const scaledScore = Math.round((total50Marks / 50) * (evaluatingRecord.maxScore || 100));

    // Mutate state in active exam record
    evaluatingRecord.status = 'EVALUATED';
    evaluatingRecord.totalScore = scaledScore;
    evaluatingRecord.lsrwBreakdown = drawerScores;
    evaluatingRecord.cefrVerdict = drawerVerdict;
    evaluatingRecord.lsrwQuestions = activeLsrwQuestions;
    evaluatingRecord.tutorFeedback =
      drawerRemarks || '50 Questions evaluated and verified by Chief Language Examiner.';
    evaluatingRecord.evaluatorNotes = drawerEvaluatorNote;

    showSuccess(
      `Official marks (${scaledScore}/${evaluatingRecord.maxScore}) & CEFR verdict saved for ${evaluatingRecord.studentName} across all 50 questions!`
    );
    setEvaluatingRecord(null);
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    if (!activeExam) return [];
    return activeExam.records.filter((rec) => {
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          rec.studentName.toLowerCase().includes(q) ||
          rec.studentRollNo.toLowerCase().includes(q) ||
          rec.collegeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeExam, statusFilter, searchQuery]);

  // Overall batch submission statistics
  const totalStudents = activeExam?.records.length || 0;
  const evaluatedCount = activeExam?.records.filter((r) => r.status === 'EVALUATED').length || 0;
  const pendingCount = activeExam?.records.filter((r) => r.status === 'PENDING_EVALUATION').length || 0;
  const evaluatedList = activeExam?.records.filter((r) => r.totalScore !== undefined) || [];
  const cohortAveragePercent =
    evaluatedList.length > 0
      ? Math.round(
          (evaluatedList.reduce((acc, r) => acc + (r.totalScore || 0), 0) /
            evaluatedList.reduce((acc, r) => acc + (r.maxScore || 100), 0)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Exams, CEFR Assessments & Gradebook' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              CEFR International Benchmark Exams & CBT Mocks
            </span>
            <span className="text-xs font-mono text-slate-400">
              Evaluator: {currentFaculty?.name || 'Jay'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0052CC]" />
            <span>Exams, Mocks & Cohort Gradebook</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Select course first, then choose batch to view DELF/JLPT CBT simulations, oral vivas, and publish validated CEFR scores to the Academic Manager ledger.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Course</span>
            <span className="text-xs font-black text-[#0052CC] font-mono">{activeCourse.code}</span>
          </div>
          <div className="px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cohort Avg</span>
            <span className="text-xs font-black text-emerald-900 font-mono">{cohortAveragePercent}%</span>
          </div>
        </div>
      </div>

      {/* ─── STEP 1: SELECT COURSE (MILD PASTEL CARDS) ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[10px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Select Course (CEFR Level Track):</span>
          </h2>
          <span className="text-[11px] font-medium text-slate-500">
            4 Assigned CEFR Levels
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COURSE_ASSESSMENTS_DATA.map((course) => {
            const isSelected = course.id === selectedCourseId;
            const totalBatches = course.batches.length;
            const totalExams = course.batches.reduce(
              (acc, b) => acc + b.exams.length,
              0
            );

            return (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${course.pastelBg} ${course.pastelBorder} ring-2 ring-[#0052CC] shadow-sm`
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${course.iconBg}`}
                    >
                      {course.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      {course.levelBadge}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold leading-tight ${
                        isSelected ? 'text-slate-900' : 'text-slate-800'
                      }`}
                    >
                      {course.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {course.cefrTrack}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium text-[11px]">
                    {totalBatches} {totalBatches === 1 ? 'Batch' : 'Batches'} • {totalExams} Exams
                  </span>
                  <span
                    className={`font-black text-xs ${
                      isSelected ? 'text-[#0052CC]' : 'text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Active ✓' : 'Select →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 2: SELECT BATCH UNDER SELECTED COURSE ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            <span>Select Batch for {activeCourse.code}:</span>
          </h2>
          <span className="text-[11px] font-medium text-slate-500">
            {activeCourse.batches.length} Assigned Cohort{activeCourse.batches.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeCourse.batches.map((batch) => {
            const isBatchSelected = batch.batchId === selectedBatchId;

            return (
              <div
                key={batch.batchId}
                onClick={() => handleSelectBatch(batch.batchId)}
                className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isBatchSelected
                    ? 'bg-blue-50/60 border-blue-300 ring-2 ring-[#0052CC] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${batch.dutyBadgeColor}`}
                    >
                      {batch.dutyRole}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {batch.sectionCode}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {batch.batchName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{batch.schedule}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium text-[11px]">
                    {batch.exams.length} Assessment{batch.exams.length > 1 ? 's' : ''}
                  </span>
                  <span
                    className={`font-black text-xs ${
                      isBatchSelected ? 'text-[#0052CC]' : 'text-slate-400'
                    }`}
                  >
                    {isBatchSelected ? 'Selected Batch ✓' : 'Switch Batch →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 3: SELECT SPECIFIC EXAM / CBT MOCK / VIVA TAB ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              <span>Available Assessments for {activeBatch.sectionCode}:</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Switch between CBT mock simulation, 1-on-1 oral viva desk, or modular unit quizzes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {currentExams.map((exam) => {
              const isExamActive = exam.id === selectedExamId;
              return (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isExamActive
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {exam.type === 'ORAL_VIVA' ? (
                    <Mic className="w-3.5 h-3.5" />
                  ) : (
                    <Award className="w-3.5 h-3.5" />
                  )}
                  <span>{exam.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Exam Overview Banner */}
        {activeExam && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#0052CC] text-white">
                  {activeExam.code}
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">
                  Focus: {activeExam.lsrwFocus}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-semibold">
                  Duration: {activeExam.durationMins} mins
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeExam.scheduledWindow}</span>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                {activeExam.title}
              </h3>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Total Questions: {activeExam.totalQuestions} • Passing Cutoff: {activeExam.passingMarks} / {activeExam.totalMarks} Marks • Anti-Cheat AI Proctoring: {activeExam.proctoringEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            {/* 4 Mild Pastel KPI Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto shrink-0">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Roster</span>
                <span className="text-base font-black text-slate-900">{totalStudents}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Evaluated</span>
                <span className="text-base font-black text-emerald-950">{evaluatedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase block">Pending</span>
                <span className="text-base font-black text-amber-950">{pendingCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Batch Avg</span>
                <span className="text-base font-black text-blue-950">{cohortAveragePercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: COHORT ROSTER GRADEBOOK TABLE ─── */}
        <div className="space-y-3 pt-2">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate by name, roll no or college..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Learners ({totalStudents})
              </button>
              <button
                onClick={() => setStatusFilter('EVALUATED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  statusFilter === 'EVALUATED'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Evaluated ({evaluatedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('PENDING_EVALUATION')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  statusFilter === 'PENDING_EVALUATION'
                    ? 'bg-white text-amber-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Review ({pendingCount})</span>
              </button>
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student & College</th>
                  <th className="py-3 px-4">Exam Timestamp</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">LSRW Marks Breakdown</th>
                  <th className="py-3 px-4 text-center">Total Score</th>
                  <th className="py-3 px-4 text-center">CEFR Verdict</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No candidate assessment records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const isEvaluated = rec.status === 'EVALUATED';
                    const isPending = rec.status === 'PENDING_EVALUATION';

                    return (
                      <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors">
                        {/* Student Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={rec.studentAvatar}
                              alt={rec.studentName}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{rec.studentName}</div>
                              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                                <span>{rec.studentRollNo}</span>
                                <span>•</span>
                                <span className="truncate max-w-[180px]">{rec.collegeName}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Submission Time */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                          {rec.submittedAt}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                              isEvaluated
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {isEvaluated ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Evaluated</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>To Grade</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* LSRW Breakdown Pills */}
                        <td className="py-3.5 px-4 text-center">
                          {isEvaluated ? (
                            <div className="inline-flex items-center gap-1 font-mono text-[10px] font-bold">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                L:{rec.lsrwBreakdown.listening}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                                S:{rec.lsrwBreakdown.speaking}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                R:{rec.lsrwBreakdown.reading}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                W:{rec.lsrwBreakdown.writing}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">-- / --</span>
                          )}
                        </td>

                        {/* Exact Marks */}
                        <td className="py-3.5 px-4 text-center">
                          {isEvaluated ? (
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`text-sm font-black font-mono ${
                                  (rec.totalScore || 0) >= rec.maxScore * 0.85
                                    ? 'text-emerald-700'
                                    : (rec.totalScore || 0) >= rec.maxScore * 0.7
                                    ? 'text-blue-700'
                                    : 'text-amber-700'
                                }`}
                              >
                                {rec.totalScore} / {rec.maxScore}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                {Math.round(((rec.totalScore || 0) / rec.maxScore) * 100)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                              Ungraded
                            </span>
                          )}
                        </td>

                        {/* CEFR Verdict */}
                        <td className="py-3.5 px-4 text-center">
                          {rec.cefrVerdict ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {rec.cefrVerdict.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Pending Verdict</span>
                          )}
                        </td>

                        {/* Action: Open Right Slide-Over Drawer */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEvaluationDrawer(rec)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ml-auto cursor-pointer ${
                              isEvaluated
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                : 'bg-[#0052CC] hover:bg-blue-700 text-white'
                            }`}
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>{isEvaluated ? 'Review Grade' : 'Grade Candidate'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── STEP 5: FULL-SCREEN CANDIDATE EXAMINATION STUDIO & 50 QUESTIONS VIVA DESK ─── */}
      {evaluatingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col font-sans animate-in fade-in duration-150">
          {/* Top Bar Navigation */}
          <div className="bg-[#0B2447] text-white px-5 py-3.5 border-b border-[#1E3A8A] flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={evaluatingRecord.studentAvatar}
                alt={evaluatingRecord.studentName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                    Full-Screen Exam Studio
                  </span>
                  <span className="text-xs font-mono text-cyan-200">
                    {evaluatingRecord.studentRollNo}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-blue-200 truncate">
                    {evaluatingRecord.collegeName}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                  {evaluatingRecord.studentName} — <span className="text-cyan-300 font-semibold">{activeExam?.title}</span>
                </h1>
              </div>
            </div>

            {/* Top Right Live Total Score & Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 bg-blue-900/60 px-3.5 py-1.5 rounded-xl border border-blue-700/60">
                <span className="text-xs text-slate-300 font-bold">5Q Raw Marks:</span>
                <span className="text-lg font-black font-mono text-cyan-300">
                  {activeLsrwQuestions.reduce((sum, q) => sum + q.marksAwarded, 0)} <span className="text-xs text-slate-400 font-normal">/ 50</span>
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs text-slate-300 font-bold">Scaled Exam Mark:</span>
                <span className="text-lg font-black font-mono text-emerald-300">
                  {Math.round((activeLsrwQuestions.reduce((sum, q) => sum + q.marksAwarded, 0) / 50) * (evaluatingRecord.maxScore || 100))} <span className="text-xs text-slate-400 font-normal">/ {evaluatingRecord.maxScore}</span>
                </span>
              </div>

              <button
                onClick={handleSaveAssessmentEvaluation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Grade & Publish to Gradebook</span>
              </button>

              <button
                onClick={() => setEvaluatingRecord(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Studio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Full-Screen 2-Column Split Workspace */}
          <div className="flex-1 bg-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* ═══ LEFT PANE (7 cols): 5 QUESTIONS STUDENT RAW CBT ANSWERS & LIVE MARKING ═══ */}
            <div className="lg:col-span-7 bg-white overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Header with 5 Questions Badge and Quick Mark Shortcut */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-[#0052CC] font-black text-xs flex items-center justify-center">
                    5Q
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#0052CC]" />
                      <span>5 Core Examination & Viva Tasks</span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Listening (Q1) • Speaking (Q2) • Reading (Q3) • Grammar (Q4) • Applied Writing (Q5)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleQuickMarkAllCorrect}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Mark all 5 questions as Correct (100% full marks: 50/50 raw)"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Mark All (50/50)</span>
                  </button>
                </div>
              </div>

              {/* Section Filter Pills (L, S, R, W, ALL) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
                <button
                  onClick={() => setActiveSectionFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                    activeSectionFilter === 'ALL'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Questions (5)
                </button>
                <button
                  onClick={() => setActiveSectionFilter('LISTENING')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    activeSectionFilter === 'LISTENING'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Headphones className="w-3 h-3" />
                  <span>Listening (Q1)</span>
                </button>
                <button
                  onClick={() => setActiveSectionFilter('SPEAKING')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    activeSectionFilter === 'SPEAKING'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>Speaking & Viva (Q2)</span>
                </button>
                <button
                  onClick={() => setActiveSectionFilter('READING')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    activeSectionFilter === 'READING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Reading (Q3)</span>
                </button>
                <button
                  onClick={() => setActiveSectionFilter('WRITING')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    activeSectionFilter === 'WRITING'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Writing (Q4 & Q5)</span>
                </button>
              </div>

              {/* LIST OF 50 QUESTIONS (Interactive Question Cards) */}
              <div className="space-y-3 pt-1">
                {activeLsrwQuestions
                  .filter(
                    (q) => activeSectionFilter === 'ALL' || q.section === activeSectionFilter
                  )
                  .map((q) => {
                    const isCorrect = q.marksAwarded === 1;
                    const isPartial = q.marksAwarded > 0 && q.marksAwarded < 1;
                    const isZero = q.marksAwarded === 0;

                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : isPartial
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        } shadow-2xs space-y-2`}
                      >
                        {/* Question Title & Section Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-black text-slate-800">
                                #{q.id}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                  q.section === 'LISTENING'
                                    ? 'bg-blue-100 text-blue-800'
                                    : q.section === 'SPEAKING'
                                    ? 'bg-teal-100 text-teal-800'
                                    : q.section === 'READING'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {q.section}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {q.questionTitle}
                              </span>
                            </div>
                            {q.contextPrompt && (
                              <p className="text-[11px] text-slate-500 italic pl-1">
                                {q.contextPrompt}
                              </p>
                            )}
                          </div>

                          {/* Quick Mark Assignment Buttons (0, 5, 8, 10 marks) */}
                          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                              onClick={() => handleUpdateQuestionMark(q.id, 0)}
                              className={`px-2 py-0.5 rounded text-xs font-black transition-all cursor-pointer ${
                                isZero
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                              title="0 Marks"
                            >
                              0
                            </button>
                            <button
                              onClick={() => handleUpdateQuestionMark(q.id, 5)}
                              className={`px-2 py-0.5 rounded text-xs font-black transition-all cursor-pointer ${
                                q.marksAwarded === 5
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                              title="5 Marks (Half)"
                            >
                              5
                            </button>
                            <button
                              onClick={() => handleUpdateQuestionMark(q.id, 8)}
                              className={`px-2 py-0.5 rounded text-xs font-black transition-all cursor-pointer ${
                                q.marksAwarded === 8
                                  ? 'bg-teal-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                              title="8 Marks (Good)"
                            >
                              8
                            </button>
                            <button
                              onClick={() => handleUpdateQuestionMark(q.id, 10)}
                              className={`px-2 py-0.5 rounded text-xs font-black transition-all cursor-pointer ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                              title="10 Marks (Full Marks)"
                            >
                              10
                            </button>
                          </div>
                        </div>

                        {/* Candidate Raw Submitted Response */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/90 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span>Candidate Submitted Response</span>
                            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              Awarded: {q.marksAwarded} / {q.maxMarks || 10} Marks
                            </span>
                          </div>
                          <p className="font-sans text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                            {q.studentAnswer}
                          </p>
                        </div>

                        {/* Benchmark Ideal vs Tutor Proofread Field */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 space-y-0.5">
                            <span className="text-[10px] font-black text-[#0052CC] uppercase block">
                              CEFR Benchmark Ideal
                            </span>
                            <p className="text-slate-800">{q.idealAnswer}</p>
                          </div>

                          <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1">
                            <span className="text-[10px] font-black text-emerald-800 uppercase block">
                              Tutor Live Proofread / Correction
                            </span>
                            <input
                              type="text"
                              value={q.tutorCorrectedAnswer || ''}
                              onChange={(e) => handleUpdateQuestionCorrection(q.id, e.target.value)}
                              placeholder="Type corrected version..."
                              className="w-full text-[11px] bg-white border border-emerald-300 rounded px-2 py-1 outline-none text-slate-900 focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Linguistic Note */}
                        {q.grammarNote && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span className="font-bold text-slate-600">Examiner Note:</span>
                            <span>{q.grammarNote}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ═══ RIGHT PANE (5 cols): VIVA AUDIO, CEFR RUBRIC & CERTIFICATION VERDICT ═══ */}
            <div className="lg:col-span-5 bg-slate-50 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    B
                  </span>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-emerald-600" />
                    <span>LSRW Score Breakdown & CEFR Verdict</span>
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Live Synced
                </span>
              </div>

              {/* Oral Viva Audio Recording Player if available */}
              {evaluatingRecord.vivaAudioUrl && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Recorded Oral Viva Audio
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Length: {evaluatingRecord.vivaRecordingTime || '12m 30s'} • High-Fidelity Capture
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Proctored Recording
                    </span>
                  </div>

                  {/* Interactive Player bar */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs font-bold cursor-pointer shrink-0">
                      ▶
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>04:12</span>
                        <span>{evaluatingRecord.vivaRecordingTime || '12:30'}</span>
                      </div>
                      <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0052CC] h-full w-1/3 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4 LSRW Score Sliders (Equal Distribution to Max Score) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>LSRW 4-Skill Marks Allocation</span>
                  </span>
                  <span className="text-sm font-black font-mono text-[#0052CC]">
                    Total: {drawerScores.listening + drawerScores.speaking + drawerScores.reading + drawerScores.writing} / {evaluatingRecord.maxScore}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Listening Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5 text-blue-600" />
                        <span>1. Compréhension Orale (Listening):</span>
                      </label>
                      <span className="font-mono font-black text-[#0052CC]">
                        {drawerScores.listening} / {evaluatingRecord.maxScore / 4}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={evaluatingRecord.maxScore / 4}
                      step={0.5}
                      value={drawerScores.listening}
                      onChange={(e) =>
                        setDrawerScores({ ...drawerScores, listening: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>

                  {/* Speaking Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-teal-600" />
                        <span>2. Production Orale (Speaking & Viva):</span>
                      </label>
                      <span className="font-mono font-black text-[#0052CC]">
                        {drawerScores.speaking} / {evaluatingRecord.maxScore / 4}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={evaluatingRecord.maxScore / 4}
                      step={0.5}
                      value={drawerScores.speaking}
                      onChange={(e) =>
                        setDrawerScores({ ...drawerScores, speaking: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>

                  {/* Reading Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>3. Compréhension des Écrits (Reading):</span>
                      </label>
                      <span className="font-mono font-black text-[#0052CC]">
                        {drawerScores.reading} / {evaluatingRecord.maxScore / 4}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={evaluatingRecord.maxScore / 4}
                      step={0.5}
                      value={drawerScores.reading}
                      onChange={(e) =>
                        setDrawerScores({ ...drawerScores, reading: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>

                  {/* Writing Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-purple-600" />
                        <span>4. Production Écrite (Writing Synthesis):</span>
                      </label>
                      <span className="font-mono font-black text-[#0052CC]">
                        {drawerScores.writing} / {evaluatingRecord.maxScore / 4}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={evaluatingRecord.maxScore / 4}
                      step={0.5}
                      value={drawerScores.writing}
                      onChange={(e) =>
                        setDrawerScores({ ...drawerScores, writing: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* CEFR Certification Verdict Selection */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Official CEFR Outcome Verdict:
                </label>
                <select
                  value={drawerVerdict}
                  onChange={(e) => setDrawerVerdict(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="CEFR_A1_CERTIFIED">CEFR Certified (Distinction / Passed)</option>
                  <option value="PASS_WITH_HONORS">Passed With Honors</option>
                  <option value="PASS">Passed Regular Level</option>
                  <option value="NEEDS_RETEST">Needs Remedial Retest</option>
                </select>
              </div>

              {/* Feedback remarks */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Tutor Feedback for Candidate Transcript:
                </label>
                <textarea
                  value={drawerRemarks}
                  onChange={(e) => setDrawerRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  placeholder="Commend pronunciation cadence, grammar structure..."
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setEvaluatingRecord(null)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Cancel / Return
                </button>

                <button
                  onClick={handleSaveAssessmentEvaluation}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Mark & Publish to Gradebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
