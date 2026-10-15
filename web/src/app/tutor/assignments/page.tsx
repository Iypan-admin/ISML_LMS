// ============================================================================
// ISML COLLEGE LMS — TUTOR: HOMEWORK & ASSIGNMENTS EVALUATION DESK (/tutor/assignments)
// Step-by-Step Architecture:
// STEP 1: Select Language Course (French A1, A2, B1, B2) in pastel cards
// STEP 2: Select Assigned Batch / Cohort
// STEP 3: Homework Roster with Student-by-Student Exact Marks, Submissions & Activity Log
// Right-Side Slide-Over Evaluation Drawer for Grading & Pedagogical Feedback
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Users,
  Search,
  BookOpen,
  Headphones,
  Mic,
  FileText,
  PenTool,
  Star,
  Eye,
  X,
  Sparkles,
  Download,
  ExternalLink,
  ChevronRight,
  Filter,
  Award,
  AlertCircle,
  FileCheck,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';

// 50 Questions LSRW Assessment Item & Student Answer Interface
export interface LSRWQuestionItem {
  id: number;
  section: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';
  questionTitle: string;
  contextPrompt?: string;
  studentAnswer: string;
  idealAnswer: string;
  tutorCorrectedAnswer?: string;
  marksAwarded: number; // 1 mark each
  maxMarks: number;     // 1 mark
  grammarNote?: string;
  status: 'CORRECT' | 'PARTIAL' | 'INCORRECT' | 'PENDING';
}

// Student Submission Record with exact marks and activity
export interface StudentAssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  studentAvatar: string;
  collegeName: string;
  submittedAt: string;
  status: 'EVALUATED' | 'PENDING_REVIEW' | 'NOT_SUBMITTED' | 'RESUBMITTED';
  scoreAwarded?: number;
  maxScore: number;
  rubricScores: {
    grammarAccuracy: number; // out of 12.5 (or custom)
    vocabularyRange: number; // out of 12.5
    phoneticsPronunciation: number; // out of 12.5
    coherenceContext: number; // out of 12.5
  };
  tutorFeedback?: string;
  evaluatedAt?: string;
  submissionAttachment?: {
    type: 'AUDIO' | 'PDF' | 'TEXT';
    fileName: string;
    fileSize: string;
    fileUrl: string;
  };
  studentNotes?: string;
  studentSubmittedContent?: {
    frenchText: string;
    englishTranslation?: string;
  };
  tutorCorrections?: {
    correctedText: string;
    grammarNotes: string[];
    phoneticTips: string[];
  };
  lsrwQuestions?: LSRWQuestionItem[];
  submittedToAcademicManager?: boolean;
  academicManagerApprovedAt?: string;
}

// Assignment Task Definition
export interface CohortAssignmentItem {
  id: string;
  code: string;
  title: string;
  moduleName: string;
  lsrwSkill: 'L' | 'S' | 'R' | 'W' | 'INTEGRATED';
  dueDate: string;
  totalSubmissionsCount: number;
  maxScore: number;
  description: string;
  submissions: StudentAssignmentSubmission[];
  academicManagerBatchSubmitted?: boolean;
  academicManagerBatchSubmittedAt?: string;
}

interface BatchAssignmentGroup {
  batchId: string;
  batchName: string;
  sectionCode: string;
  dutyRole: string;
  dutyBadgeColor: string;
  schedule: string;
  assignments: CohortAssignmentItem[];
}

interface CourseAssignmentGroup {
  id: string;
  code: string;
  levelBadge: string;
  name: string;
  cefrTrack: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
  batches: BatchAssignmentGroup[];
}

// Helper to generate 50 realistic questions across Listening (12), Speaking (13), Reading (12), Writing (13)
// Helper to generate 5 focused realistic questions (10 marks each = 50 marks total)
export const GENERATE_50_LSRW_QUESTIONS = (
  studentName: string,
  isGraded: boolean = false
): LSRWQuestionItem[] => {
  const firstName = studentName.split(' ')[0] || 'Apprenant';

  const baseQuestions: {
    section: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';
    title: string;
    prompt?: string;
    rawAns: string;
    idealAns: string;
    correctedAns: string;
    grammarNote: string;
    defaultMark: number;
    maxMarks: number;
  }[] = [
    {
      section: 'LISTENING',
      title: 'Q1: Audio Drill — French Greeting Register & Salutations',
      prompt: 'Audio Clip (0:45): "Bonjour Madame, comment allez-vous ce matin? Je viens pour le cours de français."',
      rawAns: 'Formal / Polie (Register "Vous"). Greeting a teacher in the morning at 09:00 AM.',
      idealAns: 'Registre formel / poli (Vouvoiement de politesse). Salutation matinale à un professeur.',
      correctedAns: 'Registre formel (Vouvoiement) — Parfaite détection du ton poli et de l\'heure.',
      grammarNote: 'Full marks: accurate listening identification of polite vous register.',
      defaultMark: 10,
      maxMarks: 10,
    },
    {
      section: 'SPEAKING',
      title: 'Q2: Oral Viva & Phonetics — Self-Introduction & Nasal Vowel [ɑ̃]',
      prompt: 'Oral Audio Recording: Introduce your name, home city, and pronounce "France, grand, quarante-cinq".',
      rawAns: `Bonjour Monsieur. Je m'appelle ${firstName}. J'habite à Chennai en Inde. La France est un grand pays.`,
      idealAns: `Bonjour Monsieur. Je m'appelle ${firstName}, j'habite à Chennai en Inde. La France est un grand pays. [fʁɑ̃s, ɡʁɑ̃, ka.ʁɑ̃t.sɛ̃k]`,
      correctedAns: `Bonjour. Je m'appelle ${firstName}, j'habite à Chennai, en Inde. [fʁɑ̃s, ɡʁɑ̃] — Liaison et voyelles nasales fluides.`,
      grammarNote: 'Excellent oral rhythm and accurate guttural R [ʁ] pronunciation.',
      defaultMark: 10,
      maxMarks: 10,
    },
    {
      section: 'READING',
      title: 'Q3: Reading Comprehension — Paris Municipal Notice & Timetable',
      prompt: 'Document: "Bibliothèque municipale ouverte du mardi au samedi de 09h à 18h. Fermé dimanche et jours fériés."',
      rawAns: 'The library is open Tuesday to Saturday from 9 AM to 6 PM. It is closed on Sundays and public holidays.',
      idealAns: 'Ouvert du mardi au samedi (09h00 - 18h00). Fermeture hebdomadaire le dimanche et les jours fériés.',
      correctedAns: 'Ouvert du mardi au samedi de 9h à 18h. Fermé le dimanche et jours fériés.',
      grammarNote: 'Accurate translation and complete retention of operational conditions.',
      defaultMark: 10,
      maxMarks: 10,
    },
    {
      section: 'WRITING',
      title: 'Q4: Sentence Syntax & Grammar — Auxiliary Verbs (ÊTRE / AVOIR) & Negation',
      prompt: 'Conjugate in present and negate: "Nous __ (être) étudiants" & "Je mange de la viande."',
      rawAns: 'Nous sommes étudiants. Je ne mange pas de viande.',
      idealAns: 'Nous sommes étudiants. Je ne mange pas de viande.',
      correctedAns: 'Nous sommes étudiants. Je ne mange pas de viande.',
      grammarNote: 'Correct replacement of partitive "de la" with "de" in negative syntax (ne... pas de).',
      defaultMark: 10,
      maxMarks: 10,
    },
    {
      section: 'WRITING',
      title: 'Q5: Applied Writing — DELF A1 Formal Postcard / Bio Paragraph',
      prompt: 'Write a 30-word holiday postcard or professional bio describing your learning project in France.',
      rawAns: 'Chère Sophie, je suis à Paris pour une semaine. Il fait très beau. Hier j\'ai visité la Tour Eiffel et le Louvre. C\'est magnifique! À bientôt.',
      idealAns: 'Chère Sophie, je passe d\'excellentes vacances à Paris. Le temps est superbe. J\'ai visité la tour Eiffel et Notre-Dame. Amitiés.',
      correctedAns: 'Chère Sophie, je suis à Paris pour les vacances. Il fait très beau. J\'ai visité la tour Eiffel et le musée du Louvre. C\'est magnifique! Bises.',
      grammarNote: 'Natural register, correct past tense agreement and appropriate DELF closing salutation.',
      defaultMark: 10,
      maxMarks: 10,
    },
  ];

  return baseQuestions.map((q, idx) => ({
    id: idx + 1,
    section: q.section,
    questionTitle: q.title,
    contextPrompt: q.prompt,
    studentAnswer: q.rawAns,
    idealAnswer: q.idealAns,
    tutorCorrectedAnswer: q.correctedAns,
    marksAwarded: isGraded ? q.defaultMark : 0, // Starts at 0 for pending un-graded students
    maxMarks: q.maxMarks,
    grammarNote: q.grammarNote,
    status: isGraded
      ? q.defaultMark === q.maxMarks
        ? 'CORRECT'
        : q.defaultMark > 0
        ? 'PARTIAL'
        : 'INCORRECT'
      : 'PENDING',
  }));
};

// Master Course & Batch Assignment Dataset
const COURSE_ASSIGNMENTS_DATA: CourseAssignmentGroup[] = [
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
        batchId: 'batch-2026-fr-a1-morning',
        batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        sectionCode: 'Section A (Morning)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        schedule: 'Mon & Wed • 10:00 - 11:30 AM',
        assignments: [
          {
            id: 'asg-a1-01',
            code: 'HW-FR-A1-101',
            title: 'Audio Self-Introduction Drill & Nasal Vowel Recording',
            moduleName: 'Module 1: Salutations & Phonetics',
            lsrwSkill: 'S',
            dueDate: 'Tomorrow, 11:59 PM',
            totalSubmissionsCount: 6,
            maxScore: 50,
            description: 'Record a 90-second voice introduction stating your name, nationality, profession, and hometown using formal Vous register.',
            submissions: [
              {
                id: 'sub-01',
                studentId: 'stu-a1-01',
                studentName: 'Bharathi M',
                studentRollNo: '2026-FR-8942',
                studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University, Chennai',
                submittedAt: 'Today, 08:30 AM',
                status: 'EVALUATED',
                scoreAwarded: 47,
                maxScore: 50,
                rubricScores: {
                  grammarAccuracy: 12,
                  vocabularyRange: 12,
                  phoneticsPronunciation: 12,
                  coherenceContext: 11,
                },
                tutorFeedback: 'Superbe prononciation des voyelles nasales! Clean liaison observed in "Je suis étudiante".',
                evaluatedAt: 'Today, 10:15 AM',
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'bharathi_self_intro_parisienne.mp3',
                  fileSize: '3.4 MB',
                  fileUrl: 'https://isml.edu/audio/bharathi_intro.mp3',
                },
                studentNotes: 'I practiced the nasal vowels three times with the laboratory audio guide.',
                studentSubmittedContent: {
                  frenchText: "Bonjour Monsieur le Professeur. Je m'appelle Bharathi. Je suis étudiante en informatique à l'Université Anna de Chennai. Je viens de Madurai en Inde. J'ai vingt ans et j'aime apprendre la langue française pour mes études en France.",
                  englishTranslation: "Hello Professor. My name is Bharathi. I am a computer science student at Anna University, Chennai. I come from Madurai, India. I am twenty years old and I love learning French for my master's studies in France.",
                },
                tutorCorrections: {
                  correctedText: "Bonjour Monsieur le Professeur. Je m'appelle Bharathi. Je suis étudiante en informatique à l'Université Anna de Chennai. Je viens de Madurai, en Inde. J'ai vingt ans et j'aime apprendre le français pour mes études en France.",
                  grammarNotes: [
                    'Good use of formal title "Monsieur le Professeur".',
                    'Changed "la langue française" to the more natural phrasing "le français" in this communicative context.',
                  ],
                  phoneticTips: [
                    'Excellent nasal vowel resonance on "vingt" [vɛ̃] and "française" [fʁɑ̃sɛz].',
                    'Ensure final "s" in "ans" stays silent before pause.',
                  ],
                },
                submittedToAcademicManager: true,
                academicManagerApprovedAt: 'Today, 10:30 AM',
              },
              {
                id: 'sub-02',
                studentId: 'stu-a1-02',
                studentName: 'Karthikeyan S',
                studentRollNo: '2026-FR-8943',
                studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Loyola College (Autonomous)',
                submittedAt: 'Yesterday, 09:12 PM',
                status: 'PENDING_REVIEW',
                maxScore: 50,
                rubricScores: {
                  grammarAccuracy: 0,
                  vocabularyRange: 0,
                  phoneticsPronunciation: 0,
                  coherenceContext: 0,
                },
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'karthik_presentation_a1.mp3',
                  fileSize: '2.9 MB',
                  fileUrl: 'https://isml.edu/audio/karthik_intro.mp3',
                },
                studentNotes: 'Please check my pronunciation of numbers 1 to 20.',
                studentSubmittedContent: {
                  frenchText: "Salut! Je suis Karthik. J'ai 19 ans. J'habite à Chennai. Mon père est ingénieur et ma mère est professeur. J'étudie le commerce au collège Loyola.",
                  englishTranslation: "Hi! I am Karthik. I am 19 years old. I live in Chennai. My father is an engineer and my mother is a teacher. I study commerce at Loyola College.",
                },
                tutorCorrections: {
                  correctedText: "Bonjour Monsieur. Je m'appelle Karthik. J'ai dix-neuf ans. J'habite à Chennai. Mon père est ingénieur et ma mère est professeure. J'étudie le commerce à l'université Loyola.",
                  grammarNotes: [
                    'In formal presentations, avoid casual "Salut" — use "Bonjour".',
                    'Feminine form of professor is "professeure".',
                    'Write numbers in letters ("dix-neuf") rather than digits in DELF written evaluations.',
                  ],
                  phoneticTips: [
                    'Pronounce the "t" in "dix-neuf" softly as [diznœf].',
                    'Liaison required between "dix-neuf" and "ans" -> [diznœf z‿ɑ̃].',
                  ],
                },
                submittedToAcademicManager: false,
              },
              {
                id: 'sub-03',
                studentId: 'stu-a1-03',
                studentName: 'Divya Lakshmi R',
                studentRollNo: '2026-FR-8944',
                studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Madras Christian College (MCC)',
                submittedAt: 'Yesterday, 06:40 PM',
                status: 'EVALUATED',
                scoreAwarded: 49,
                maxScore: 50,
                rubricScores: {
                  grammarAccuracy: 12.5,
                  vocabularyRange: 12.5,
                  phoneticsPronunciation: 12,
                  coherenceContext: 12,
                },
                tutorFeedback: 'Impeccable fluency! Intonation matches native Parisian rhythm.',
                evaluatedAt: 'Today, 09:40 AM',
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'divya_a1_speaking.mp3',
                  fileSize: '3.8 MB',
                  fileUrl: 'https://isml.edu/audio/divya_intro.mp3',
                },
                studentNotes: 'Focused on correct elision in "je m\'appelle".',
              },
              {
                id: 'sub-04',
                studentId: 'stu-a1-04',
                studentName: 'Ananya Sharma',
                studentRollNo: '2026-FR-8945',
                studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Stella Maris College (Autonomous)',
                submittedAt: '2 days ago',
                status: 'EVALUATED',
                scoreAwarded: 45,
                maxScore: 50,
                rubricScores: {
                  grammarAccuracy: 11,
                  vocabularyRange: 11,
                  phoneticsPronunciation: 11.5,
                  coherenceContext: 11.5,
                },
                tutorFeedback: 'Very confident speech. Watch out for the distinction between [u] and [y].',
                evaluatedAt: 'Yesterday, 04:20 PM',
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'ananya_speech_a1.mp3',
                  fileSize: '3.1 MB',
                  fileUrl: 'https://isml.edu/audio/ananya.mp3',
                },
              },
              {
                id: 'sub-05',
                studentId: 'stu-a1-05',
                studentName: 'Rohan Mehra',
                studentRollNo: '2026-FR-8946',
                studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                collegeName: 'PSG College of Technology',
                submittedAt: 'Today, 07:15 AM',
                status: 'PENDING_REVIEW',
                maxScore: 50,
                rubricScores: {
                  grammarAccuracy: 0,
                  vocabularyRange: 0,
                  phoneticsPronunciation: 0,
                  coherenceContext: 0,
                },
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'rohan_audio_submission.mp3',
                  fileSize: '2.7 MB',
                  fileUrl: 'https://isml.edu/audio/rohan.mp3',
                },
                studentSubmittedContent: {
                  frenchText: "Bonjour Monsieur. Je m'appelle Rohan Mehra. J'habite à Coimbatore. J'étudie l'ingénierie mécanique au PSG College. J'ai vingt-et-un ans et je veux travailler en France.",
                  englishTranslation: "Hello Sir. My name is Rohan Mehra. I live in Coimbatore. I study mechanical engineering at PSG College. I am 21 years old and I want to work in France.",
                },
                tutorCorrections: {
                  correctedText: "Bonjour Monsieur. Je m'appelle Rohan Mehra. J'habite à Coimbatore. J'étudie le génie mécanique au PSG College of Technology. J'ai vingt et un ans et je souhaite travailler en France.",
                  grammarNotes: [
                    'Use "le génie mécanique" for mechanical engineering in university terminology.',
                    'Use "je souhaite" for a more polite, refined professional register than "je veux".',
                  ],
                  phoneticTips: [
                    'Liaison in "vingt et un" [vɛ̃teœ̃].',
                    'Nasal vowel in "France" [fʁɑ̃s].',
                  ],
                },
              },
              {
                id: 'sub-06',
                studentId: 'stu-a1-06',
                studentName: 'Siddharth Rao',
                studentRollNo: '2026-FR-8947',
                studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University Guindy',
                submittedAt: '--:--',
                status: 'NOT_SUBMITTED',
                maxScore: 50,
                rubricScores: {
                  grammarAccuracy: 0,
                  vocabularyRange: 0,
                  phoneticsPronunciation: 0,
                  coherenceContext: 0,
                },
                studentNotes: 'Extension requested due to semester lab exams.',
              },
            ],
          },
          {
            id: 'asg-a1-02',
            code: 'HW-FR-A1-102',
            title: 'Grammar Worksheet: Definite & Indefinite Articles in Context',
            moduleName: 'Module 2: La Famille & Articles',
            lsrwSkill: 'W',
            dueDate: 'In 3 days',
            totalSubmissionsCount: 6,
            maxScore: 50,
            description: 'Fill in the blanks with le/la/l\'/les or un/une/des and compose 5 sentences describing your family tree.',
            submissions: [],
          },
        ],
      },
      {
        batchId: 'batch-2026-fr-a1-weekend',
        batchName: 'French A1 Fast-Track Weekend Bootcamp',
        sectionCode: 'Section B (Weekend)',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
        schedule: 'Sat & Sun • 11:00 AM - 01:00 PM',
        assignments: [
          {
            id: 'asg-a1-wk-01',
            code: 'HW-FR-A1-201',
            title: 'Weekend Vocabulary Flashcard Synthesis & Spoken Dialogue',
            moduleName: 'Module 1: Everyday Salutations',
            lsrwSkill: 'S',
            dueDate: 'Sunday, 08:00 PM',
            totalSubmissionsCount: 2,
            maxScore: 100,
            description: 'Record an exchange with a peer ordering coffee and croissants in a Parisian café scenario.',
            submissions: [
              {
                id: 'sub-wk-01',
                studentId: 'std-a1-07',
                studentName: 'Preethi Sundar',
                studentRollNo: '2026-FR-9011',
                studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Women\'s Christian College (WCC)',
                submittedAt: 'Yesterday, 11:00 AM',
                status: 'EVALUATED',
                scoreAwarded: 96,
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 24,
                  vocabularyRange: 24,
                  phoneticsPronunciation: 24,
                  coherenceContext: 24,
                },
                tutorFeedback: 'Remarkable accuracy in polite requests ("Je voudrais un café, s\'il vous plaît").',
                evaluatedAt: 'Yesterday, 02:00 PM',
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'preethi_cafe_dialogue.mp3',
                  fileSize: '4.1 MB',
                  fileUrl: 'https://isml.edu/audio/preethi.mp3',
                },
              },
              {
                id: 'sub-wk-02',
                studentId: 'std-a1-08',
                studentName: 'Varun Nair',
                studentRollNo: '2026-FR-9012',
                studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Loyola College (Autonomous)',
                submittedAt: 'Today, 06:20 AM',
                status: 'PENDING_REVIEW',
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 22,
                  vocabularyRange: 21,
                  phoneticsPronunciation: 20,
                  coherenceContext: 22,
                },
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'varun_cafe_drill.mp3',
                  fileSize: '3.6 MB',
                  fileUrl: 'https://isml.edu/audio/varun.mp3',
                },
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
        assignments: [
          {
            id: 'asg-a2-01',
            code: 'HW-FR-A2-301',
            title: 'Narrative Essay: "Un Voyage Mémorable" (Passé Composé vs Imparfait)',
            moduleName: 'Module 3: Les Temps du Passé',
            lsrwSkill: 'W',
            dueDate: 'Friday, 05:00 PM',
            totalSubmissionsCount: 3,
            maxScore: 100,
            description: 'Write a 180-word personal reflection describing a past holiday trip using accurate auxiliary agreements with être and avoir.',
            submissions: [
              {
                id: 'sub-a2-01',
                studentId: 'std-a2-01',
                studentName: 'Alex D\'Souza',
                studentRollNo: '2026-FR-A2-101',
                studentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Loyola College (Autonomous)',
                submittedAt: 'Yesterday, 03:10 PM',
                status: 'EVALUATED',
                scoreAwarded: 88,
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 22,
                  vocabularyRange: 21,
                  phoneticsPronunciation: 22,
                  coherenceContext: 23,
                },
                tutorFeedback: 'Good past participle agreements with Dr. & Mrs. Vandertramp verbs. Be careful with imparfait weather descriptions.',
                evaluatedAt: 'Today, 08:30 AM',
                submissionAttachment: {
                  type: 'PDF',
                  fileName: 'alex_dsouza_voyage_passe_compose.pdf',
                  fileSize: '1.9 MB',
                  fileUrl: 'https://isml.edu/pdf/alex_essay.pdf',
                },
              },
              {
                id: 'sub-a2-02',
                studentId: 'std-a2-02',
                studentName: 'Sneha Patel',
                studentRollNo: '2026-FR-A2-102',
                studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University Guindy',
                submittedAt: 'Today, 09:00 AM',
                status: 'PENDING_REVIEW',
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 23,
                  vocabularyRange: 23,
                  phoneticsPronunciation: 22,
                  coherenceContext: 24,
                },
                submissionAttachment: {
                  type: 'PDF',
                  fileName: 'sneha_patel_a2_essay.pdf',
                  fileSize: '2.4 MB',
                  fileUrl: 'https://isml.edu/pdf/sneha_essay.pdf',
                },
              },
              {
                id: 'sub-a2-03',
                studentId: 'std-a2-03',
                studentName: 'Harish Kumar',
                studentRollNo: '2026-FR-A2-103',
                studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Madras Christian College (MCC)',
                submittedAt: '--:--',
                status: 'NOT_SUBMITTED',
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 0,
                  vocabularyRange: 0,
                  phoneticsPronunciation: 0,
                  coherenceContext: 0,
                },
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
        assignments: [
          {
            id: 'asg-b1-01',
            code: 'HW-FR-B1-401',
            title: 'Subjunctive Mood Argumentative Debate Speech: "Le Télétravail"',
            moduleName: 'Module 4: Le Subjonctif Présent',
            lsrwSkill: 'S',
            dueDate: 'Saturday, 12:00 PM',
            totalSubmissionsCount: 2,
            maxScore: 100,
            description: 'Construct a 3-minute debate speech on remote working utilizing at least 6 expressions of necessity and doubt with subjunctive.',
            submissions: [
              {
                id: 'sub-b1-01',
                studentId: 'std-b1-01',
                studentName: 'Naveen Chandran',
                studentRollNo: '2026-FR-B1-201',
                studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University Guindy',
                submittedAt: 'Yesterday, 07:45 PM',
                status: 'EVALUATED',
                scoreAwarded: 95,
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 24,
                  vocabularyRange: 24,
                  phoneticsPronunciation: 23,
                  coherenceContext: 24,
                },
                tutorFeedback: 'Excellente argumentation! "Il faut que nous soyons conscients" utilized flawlessly.',
                evaluatedAt: 'Today, 10:00 AM',
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'naveen_teletravail_subjonctif.mp3',
                  fileSize: '5.2 MB',
                  fileUrl: 'https://isml.edu/audio/naveen.mp3',
                },
              },
              {
                id: 'sub-b1-02',
                studentId: 'std-b1-02',
                studentName: 'Pooja Venkatesh',
                studentRollNo: '2026-FR-B1-202',
                studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Stella Maris College (Autonomous)',
                submittedAt: 'Today, 08:15 AM',
                status: 'PENDING_REVIEW',
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 24,
                  vocabularyRange: 23,
                  phoneticsPronunciation: 24,
                  coherenceContext: 23,
                },
                submissionAttachment: {
                  type: 'AUDIO',
                  fileName: 'pooja_subjonctif_speech.mp3',
                  fileSize: '4.8 MB',
                  fileUrl: 'https://isml.edu/audio/pooja.mp3',
                },
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
        assignments: [
          {
            id: 'asg-b2-01',
            code: 'HW-FR-B2-501',
            title: 'DELF B2 Dossier Synthèse: Transition Écologique & Énergies Renouvelables',
            moduleName: 'Module 5: Synthèse de Documents',
            lsrwSkill: 'W',
            dueDate: 'Sunday, 11:59 PM',
            totalSubmissionsCount: 2,
            maxScore: 100,
            description: 'Synthesize three distinct journalistic texts regarding carbon taxation into a neutral 250-word synthesis adhering to DELF B2 standards.',
            submissions: [
              {
                id: 'sub-b2-01',
                studentId: 'std-b2-01',
                studentName: 'Akash Sundaram',
                studentRollNo: '2026-FR-B2-301',
                studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Anna University Guindy',
                submittedAt: 'Yesterday, 02:20 PM',
                status: 'EVALUATED',
                scoreAwarded: 97,
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 25,
                  vocabularyRange: 24,
                  phoneticsPronunciation: 24,
                  coherenceContext: 24,
                },
                tutorFeedback: 'Exceptional neutral synthesis! Cohesive connectors (en revanche, d\'une part, néanmoins) applied rigorously.',
                evaluatedAt: 'Today, 09:10 AM',
                submissionAttachment: {
                  type: 'PDF',
                  fileName: 'akash_delf_b2_synthese.pdf',
                  fileSize: '3.2 MB',
                  fileUrl: 'https://isml.edu/pdf/akash_synthese.pdf',
                },
              },
              {
                id: 'sub-b2-02',
                studentId: 'std-b2-02',
                studentName: 'Meera Krishnan',
                studentRollNo: '2026-FR-B2-302',
                studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                collegeName: 'Loyola College (Autonomous)',
                submittedAt: 'Today, 07:30 AM',
                status: 'PENDING_REVIEW',
                maxScore: 100,
                rubricScores: {
                  grammarAccuracy: 23,
                  vocabularyRange: 23,
                  phoneticsPronunciation: 23,
                  coherenceContext: 23,
                },
                submissionAttachment: {
                  type: 'PDF',
                  fileName: 'meera_synthese_b2.pdf',
                  fileSize: '2.8 MB',
                  fileUrl: 'https://isml.edu/pdf/meera_synthese.pdf',
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function TutorAssignmentsPage() {
  const { showSuccess } = useToast();
  const { currentFaculty } = useTutor();

  // STEP 1: Selected Course ID
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-a1');

  // Active Course
  const activeCourse = useMemo(() => {
    return COURSE_ASSIGNMENTS_DATA.find((c) => c.id === selectedCourseId) || COURSE_ASSIGNMENTS_DATA[0];
  }, [selectedCourseId]);

  // STEP 2: Selected Batch ID under this Course
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeCourse.batches[0]?.batchId || '');

  // Active Batch
  const activeBatch = useMemo(() => {
    return activeCourse.batches.find((b) => b.batchId === selectedBatchId) || activeCourse.batches[0];
  }, [activeCourse, selectedBatchId]);

  // Active Assignments under Selected Batch
  const currentAssignments = activeBatch.assignments;

  // Selected Assignment Tab
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    currentAssignments[0]?.id || ''
  );

  const activeAssignment = useMemo(() => {
    return currentAssignments.find((a) => a.id === selectedAssignmentId) || currentAssignments[0];
  }, [currentAssignments, selectedAssignmentId]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EVALUATED' | 'PENDING_REVIEW' | 'NOT_SUBMITTED'>('ALL');

  // Right-Side Slide-Over Drawer State (Evaluate Student Submission)
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<StudentAssignmentSubmission | null>(null);
  const [activeLsrwQuestions, setActiveLsrwQuestions] = useState<LSRWQuestionItem[]>([]);
  const [activeSectionFilter, setActiveSectionFilter] = useState<'ALL' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('ALL');

  const [rubricScores, setRubricScores] = useState({
    grammarAccuracy: 0,
    vocabularyRange: 0,
    phoneticsPronunciation: 0,
    coherenceContext: 0,
  });
  const [feedbackRemarks, setFeedbackRemarks] = useState('');
  const [activeCorrectionText, setActiveCorrectionText] = useState('');
  const [activeGrammarNotes, setActiveGrammarNotes] = useState('');
  const [activeTabDrawer, setActiveTabDrawer] = useState<'CORRECTION' | 'RUBRIC' | 'FEEDBACK'>('CORRECTION');

  // Academic Manager Submission state per batch
  const [managerSubmittedBatches, setManagerSubmittedBatches] = useState<Record<string, boolean>>({});

  // Course Switch handler
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const crs = COURSE_ASSIGNMENTS_DATA.find((c) => c.id === courseId);
    if (crs && crs.batches.length > 0) {
      const firstBatch = crs.batches[0];
      setSelectedBatchId(firstBatch.batchId);
      if (firstBatch.assignments.length > 0) {
        setSelectedAssignmentId(firstBatch.assignments[0].id);
      }
    }
  };

  // Batch Switch handler
  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    const b = activeCourse.batches.find((batch) => batch.batchId === batchId);
    if (b && b.assignments.length > 0) {
      setSelectedAssignmentId(b.assignments[0].id);
    }
  };

  // Open Evaluation Drawer
  const handleOpenEvaluationDrawer = (sub: StudentAssignmentSubmission) => {
    setEvaluatingSubmission(sub);
    const isAlreadyEvaluated = sub.status === 'EVALUATED';

    // Initialize 50 LSRW questions for this student
    const questions = sub.lsrwQuestions && sub.lsrwQuestions.length > 0
      ? sub.lsrwQuestions
      : GENERATE_50_LSRW_QUESTIONS(sub.studentName, isAlreadyEvaluated);
    setActiveLsrwQuestions(questions);
    setActiveSectionFilter('ALL');

    // Calculate sum of marks awarded in 50 questions
    const currentSumMarks = questions.reduce((acc, q) => acc + q.marksAwarded, 0);

    // If evaluated, load previously awarded rubric scores; if pending (Grade Now), start fresh
    setRubricScores(
      isAlreadyEvaluated && sub.rubricScores
        ? sub.rubricScores
        : {
            grammarAccuracy: Number((currentSumMarks * 0.25).toFixed(1)),
            vocabularyRange: Number((currentSumMarks * 0.25).toFixed(1)),
            phoneticsPronunciation: Number((currentSumMarks * 0.25).toFixed(1)),
            coherenceContext: Number((currentSumMarks * 0.25).toFixed(1)),
          }
    );

    setFeedbackRemarks(
      sub.tutorFeedback ||
        (isAlreadyEvaluated
          ? 'Good performance.'
          : '')
    );
    setActiveCorrectionText(
      sub.tutorCorrections?.correctedText || sub.studentSubmittedContent?.frenchText || ''
    );
    setActiveGrammarNotes(
      sub.tutorCorrections?.grammarNotes?.join('\n') || ''
    );
    setActiveTabDrawer('CORRECTION');
  };

  // Update Mark for a specific question and auto-sync rubric
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

      // Recalculate 4 rubric slices from total of 50 marks
      const totalMarks = updated.reduce((sum, q) => sum + q.marksAwarded, 0);
      const quarter = Number((totalMarks / 4).toFixed(1));
      setRubricScores({
        grammarAccuracy: quarter,
        vocabularyRange: quarter,
        phoneticsPronunciation: quarter,
        coherenceContext: quarter,
      });

      return updated;
    });
  };

  // Update Tutor inline correction text for a specific question
  const handleUpdateQuestionCorrection = (qId: number, text: string) => {
    setActiveLsrwQuestions((prev) =>
      prev.map((item) => (item.id === qId ? { ...item, tutorCorrectedAnswer: text } : item))
    );
  };

  // Quick action: Mark all 5 tasks as Correct (Full 50 marks)
  const handleQuickMarkAllCorrect = () => {
    setActiveLsrwQuestions((prev) =>
      prev.map((item) => ({ ...item, marksAwarded: item.maxMarks || 10, status: 'CORRECT' }))
    );
    setRubricScores({
      grammarAccuracy: 12.5,
      vocabularyRange: 12.5,
      phoneticsPronunciation: 12.5,
      coherenceContext: 12.5,
    });
  };

  // Submit Evaluation & Correction
  const handleSaveEvaluation = () => {
    if (!evaluatingSubmission) return;

    // Total score is sum of 50 questions
    const totalCalculated = activeLsrwQuestions.reduce((sum, q) => sum + q.marksAwarded, 0);

    // Mutate state in active assignment
    evaluatingSubmission.status = 'EVALUATED';
    evaluatingSubmission.scoreAwarded = Math.round(totalCalculated);
    evaluatingSubmission.rubricScores = rubricScores;
    evaluatingSubmission.lsrwQuestions = activeLsrwQuestions;
    evaluatingSubmission.tutorFeedback = feedbackRemarks || 'All 50 LSRW questions evaluated and validated.';
    evaluatingSubmission.evaluatedAt = 'Just now';
    evaluatingSubmission.tutorCorrections = {
      correctedText: activeCorrectionText,
      grammarNotes: activeGrammarNotes.split('\n').filter((l) => l.trim()),
      phoneticTips: ['LSRW 50-item evaluation completed', 'Phonetics & grammar verified'],
    };

    showSuccess(`Corrections & score (${Math.round(totalCalculated)}/50) saved across all 50 questions for ${evaluatingSubmission.studentName}!`);
    setEvaluatingSubmission(null);
  };

  // Batch Submit to Academic Manager
  const handleSubmitBatchToAcademicManager = () => {
    if (!activeAssignment) return;
    setManagerSubmittedBatches((prev) => ({
      ...prev,
      [activeAssignment.id]: true,
    }));
    showSuccess(
      `Official Gradebook & Student Corrections for "${activeAssignment.title}" submitted to Academic Manager for final approval!`
    );
  };

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    if (!activeAssignment) return [];
    return activeAssignment.submissions.filter((sub) => {
      if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          sub.studentName.toLowerCase().includes(q) ||
          sub.studentRollNo.toLowerCase().includes(q) ||
          sub.collegeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeAssignment, statusFilter, searchQuery]);

  // Overall batch submission statistics
  const totalSubmissions = activeAssignment?.submissions.length || 0;
  const evaluatedCount = activeAssignment?.submissions.filter((s) => s.status === 'EVALUATED').length || 0;
  const pendingCount = activeAssignment?.submissions.filter((s) => s.status === 'PENDING_REVIEW').length || 0;
  const notSubmittedCount = activeAssignment?.submissions.filter((s) => s.status === 'NOT_SUBMITTED').length || 0;
  const evaluatedList = activeAssignment?.submissions.filter((s) => s.scoreAwarded !== undefined) || [];
  const averageScore =
    evaluatedList.length > 0
      ? Math.round(
          (evaluatedList.reduce((acc, s) => acc + (s.scoreAwarded || 0), 0) /
            evaluatedList.reduce((acc, s) => acc + (s.maxScore || 50), 0)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Homework Evaluation & Gradebook' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              Foreign Language Homework & LSRW Rubric Engine
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Instructor: {currentFaculty.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Homework Evaluation & Student Activity Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select course and cohort to inspect student submissions, audio drills, rubric mark breakdowns, and pedagogical feedback.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold">
            {COURSE_ASSIGNMENTS_DATA.reduce((acc, c) => acc + c.batches.reduce((bAcc, b) => bAcc + b.assignments.length, 0), 0)} Assigned Tasks In Queue
          </span>
        </div>
      </div>

      {/* ─── STEP 1: SELECT LANGUAGE COURSE (Mild Pastel Cards) ─── */}
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
            Click course to reveal assigned batch homework
          </span>
        </div>

        {/* 4 Mild Pastel Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {COURSE_ASSIGNMENTS_DATA.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const courseTotalAssignments = crs.batches.reduce((acc, b) => acc + b.assignments.length, 0);

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
                    {courseTotalAssignments} {courseTotalAssignments === 1 ? 'Homework' : 'Homeworks'}
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
            {activeCourse.batches.length} Assigned {activeCourse.batches.length === 1 ? 'Cohort' : 'Cohorts'}
          </span>
        </div>

        {/* Batch Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeCourse.batches.map((b) => {
            const isSelected = selectedBatchId === b.batchId;
            const batchPendingCount = b.assignments.reduce(
              (acc, a) => acc + a.submissions.filter((s) => s.status === 'PENDING_REVIEW').length,
              0
            );

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
                  <p className="text-[11px] text-slate-500">
                    {b.schedule}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-900">
                    {b.assignments.length} Tasks
                  </div>
                  <div className={`text-[11px] font-black ${batchPendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {batchPendingCount} To Evaluate
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 3: ASSIGNMENT ROSTER WITH EXACT STUDENT MARKS & ACTIVITY ─── */}
      <div className="space-y-4">
        {/* Assignment Task Selector Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Select Homework Task:
              </h2>
            </div>

            {/* Assignment Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {currentAssignments.map((asg) => {
                const isSelected = activeAssignment?.id === asg.id;
                return (
                  <button
                    key={asg.id}
                    onClick={() => setSelectedAssignmentId(asg.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#0052CC] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{asg.code}</span>
                    <span className="text-[10px] opacity-80">• {asg.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activeAssignment ? (
          <>
            {/* Active Assignment KPI Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#0052CC] text-white">
                    {activeAssignment.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Skill: {activeAssignment.lsrwSkill}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-semibold">
                    {activeAssignment.moduleName}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {activeAssignment.dueDate}</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {activeAssignment.title}
                </h3>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  {activeAssignment.description}
                </p>
              </div>

              {/* 4 Mild Pastel KPI Tiles & Submit to Academic Manager Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total</span>
                    <span className="text-base font-black text-slate-900">{totalSubmissions}</span>
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
                    <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Class Avg</span>
                    <span className="text-base font-black text-blue-950">{averageScore}%</span>
                  </div>
                </div>

                {/* Submit to Academic Manager Action */}
                <div className="shrink-0 flex items-center justify-end">
                  {managerSubmittedBatches[activeAssignment.id] ? (
                    <span className="px-3.5 py-2.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Submitted to Academic Manager</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleSubmitBatchToAcademicManager}
                      className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Submit all student grades & tutor corrections to Academic Manager"
                    >
                      <Send className="w-4 h-4 text-cyan-200" />
                      <span>Submit Batch to Academic Manager</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student name, roll number, or college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-900"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['ALL', 'PENDING_REVIEW', 'EVALUATED', 'NOT_SUBMITTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-[#0052CC] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL'
                      ? `All Students (${totalSubmissions})`
                      : st === 'PENDING_REVIEW'
                      ? `Pending Review (${pendingCount})`
                      : st === 'EVALUATED'
                      ? `Evaluated (${evaluatedCount})`
                      : `Not Submitted (${notSubmittedCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Submissions & Exact Marks Ledger Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-extrabold uppercase text-[10px]">
                      <th className="py-3 px-4">Student Profile</th>
                      <th className="py-3 px-4">Roll No & Institution</th>
                      <th className="py-3 px-4">Submission File / Activity</th>
                      <th className="py-3 px-4">Submission Time</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Exact Marks / 100</th>
                      <th className="py-3 px-4 text-right">Evaluation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                          No student submissions found matching this criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => {
                        const isEvaluated = sub.status === 'EVALUATED';
                        const isPending = sub.status === 'PENDING_REVIEW';
                        const notSubmitted = sub.status === 'NOT_SUBMITTED';

                        return (
                          <tr key={sub.id} className="hover:bg-blue-50/20 transition-colors">
                            {/* Profile */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={sub.studentAvatar}
                                  alt={sub.studentName}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{sub.studentName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{sub.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Roll No */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono text-[11px] font-bold text-slate-800">{sub.studentRollNo}</div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{sub.collegeName}</div>
                            </td>

                            {/* Submission Attachment / Activity */}
                            <td className="py-3.5 px-4">
                              {sub.submissionAttachment ? (
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate max-w-[180px]">
                                    {sub.submissionAttachment.type === 'AUDIO' ? (
                                      <Headphones className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    ) : (
                                      <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    )}
                                    <span className="truncate">{sub.submissionAttachment.fileName}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {sub.submissionAttachment.fileSize}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No file attached</span>
                              )}
                            </td>

                            {/* Submitted At */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                              {sub.submittedAt}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                                  isEvaluated
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {isEvaluated ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Evaluated</span>
                                  </>
                                ) : isPending ? (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>To Grade</span>
                                  </>
                                ) : (
                                  <span>Unsubmitted</span>
                                )}
                              </span>
                            </td>

                            {/* Exact Marks */}
                            <td className="py-3.5 px-4 text-center">
                              {sub.scoreAwarded !== undefined ? (
                                <div className="inline-flex flex-col items-center">
                                  <span
                                    className={`text-sm font-black font-mono ${
                                      sub.scoreAwarded >= (sub.maxScore || 50) * 0.85
                                        ? 'text-emerald-700'
                                        : sub.scoreAwarded >= (sub.maxScore || 50) * 0.7
                                        ? 'text-blue-700'
                                        : 'text-amber-700'
                                    }`}
                                  >
                                    {sub.scoreAwarded} / {sub.maxScore || 50}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    G:{sub.rubricScores.grammarAccuracy} V:{sub.rubricScores.vocabularyRange} P:{sub.rubricScores.phoneticsPronunciation}
                                  </span>
                                </div>
                              ) : notSubmitted ? (
                                <span className="text-xs text-slate-300 font-mono">-- / {sub.maxScore || 50}</span>
                              ) : (
                                <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                                  Ungraded
                                </span>
                              )}
                            </td>

                            {/* Action Button */}
                            <td className="py-3.5 px-4 text-right">
                              {notSubmitted ? (
                                <button
                                  disabled
                                  className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
                                >
                                  Awaiting
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenEvaluationDrawer(sub)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 ${
                                    isEvaluated
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                      : 'bg-[#0052CC] hover:bg-blue-700 active:scale-95 text-white'
                                  }`}
                                >
                                  <PenTool className="w-3.5 h-3.5" />
                                  <span>{isEvaluated ? 'Review Grade' : 'Grade Now'}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No homework assignments found for this batch.
          </div>
        )}
      </div>

      {/* ─── 4. FULL-SCREEN TUTOR CORRECTION STUDIO & MARKING DESK ─── */}
      {evaluatingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col font-sans animate-in fade-in duration-150">
          {/* Studio Top Navigation Bar */}
          <div className="bg-[#0B2447] text-white px-5 py-3.5 border-b border-[#1E3A8A] flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={evaluatingSubmission.studentAvatar}
                alt={evaluatingSubmission.studentName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                    Full-Screen Correction Desk
                  </span>
                  <span className="text-xs font-mono text-cyan-200">
                    {evaluatingSubmission.studentRollNo}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-blue-200 truncate">
                    {evaluatingSubmission.collegeName}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                  {evaluatingSubmission.studentName} — <span className="text-cyan-300 font-semibold">{activeAssignment?.title}</span>
                </h1>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 bg-blue-900/60 px-3.5 py-1.5 rounded-xl border border-blue-700/60">
                <span className="text-xs text-slate-300 font-bold">Total Score:</span>
                <span className="text-lg font-black font-mono text-cyan-300">
                  {activeLsrwQuestions.reduce((sum, q) => sum + q.marksAwarded, 0)} <span className="text-xs text-slate-400 font-normal">/ 50</span>
                </span>
              </div>

              <button
                onClick={handleSaveEvaluation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Grade & Corrections</span>
              </button>

              <button
                onClick={() => setEvaluatingSubmission(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Studio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Studio Full-Screen 2-Column Split Workspace */}
          <div className="flex-1 bg-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* ═══ LEFT PANE (7 cols): 50 QUESTIONS LSRW RAW ANSWERS & INTERACTIVE MARKING ═══ */}
            <div className="lg:col-span-7 bg-white overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Header with 5 Questions Badge and Section Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-[#0052CC] font-black text-xs flex items-center justify-center">
                    5Q
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#0052CC]" />
                      <span>5 Core Homework & Assessment Tasks</span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Listening (Q1) • Speaking (Q2) • Reading (Q3) • Grammar (Q4) • Applied Writing (Q5) = 50 Marks Total
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleQuickMarkAllCorrect}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Mark all 5 tasks as Correct (10 marks each = 50/50)"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Mark All (50/50)</span>
                  </button>
                </div>
              </div>

              {/* Student Audio Attachment preview if available */}
              {evaluatingSubmission.submissionAttachment && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {evaluatingSubmission.submissionAttachment.fileName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {evaluatingSubmission.submissionAttachment.fileSize} • Submitted: {evaluatingSubmission.submittedAt}
                      </p>
                    </div>
                  </div>

                  <a
                    href={evaluatingSubmission.submissionAttachment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              )}

              {/* Section Filters (L, S, R, W, ALL) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
                <button
                  onClick={() => setActiveSectionFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                    activeSectionFilter === 'ALL'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Tasks (5)
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
                  <span>Speaking (Q2)</span>
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
                  <span>Writing & Grammar (Q4 & Q5)</span>
                </button>
              </div>

              {/* LIST OF QUESTIONS (Interactive Cards) */}
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

                          {/* Marks Assignment Pill (0, 5, 8, 10 marks) */}
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

                        {/* Student Raw Submitted Answer */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/90 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span>Learner Homework Submission</span>
                            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              Awarded: {q.marksAwarded} / {q.maxMarks || 10} Marks
                            </span>
                          </div>
                          <p className="font-sans text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                            {q.studentAnswer}
                          </p>
                        </div>

                        {/* Ideal vs Tutor Correction Toggle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 space-y-0.5">
                            <span className="text-[10px] font-black text-[#0052CC] uppercase block">
                              Expected CEFR Ideal
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
                            <span className="font-bold text-slate-600">Tutor Note:</span>
                            <span>{q.grammarNote}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ═══ RIGHT PANE (5 cols): TUTOR LIVE CORRECTION & RUBRIC SCORING ═══ */}
            <div className="lg:col-span-5 bg-slate-50 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    B
                  </span>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-emerald-600" />
                    <span>LSRW Rubric & Score Breakdown</span>
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Live Synced
                </span>
              </div>

              {/* SECTION 1: TUTOR PROOFREADING / OVERALL REMARKS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tutor Corrected Model Answer (Overall):</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Visible to Student
                  </span>
                </div>
                <textarea
                  value={activeCorrectionText}
                  onChange={(e) => setActiveCorrectionText(e.target.value)}
                  rows={4}
                  className="w-full p-3 text-xs bg-emerald-50/40 border border-emerald-300 rounded-xl font-sans text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Provide corrected sentence syntax with proper French punctuation..."
                />
              </div>

              {/* SECTION 2: SPECIFIC GRAMMAR & PHONETIC EXPLANATIONS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Grammar & Linguistic Corrections (Bullet Points):
                </label>
                <textarea
                  value={activeGrammarNotes}
                  onChange={(e) => setActiveGrammarNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  placeholder="- Changed casual 'Salut' to formal 'Bonjour' for DELF A1&#10;- Addressed agreement with feminine subject"
                />
              </div>

              {/* SECTION 3: 4 LSRW SCORING RUBRIC SLIDERS (SCALE: 50 MARKS TOTAL) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>LSRW Rubric Marks Allocation</span>
                  </span>
                  <span className="text-sm font-black font-mono text-[#0052CC]">
                    Total: {rubricScores.grammarAccuracy + rubricScores.vocabularyRange + rubricScores.phoneticsPronunciation + rubricScores.coherenceContext} / {evaluatingSubmission.maxScore || 50}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Grammar Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">1. Grammar & Syntax:</label>
                      <span className="font-mono font-black text-[#0052CC]">{rubricScores.grammarAccuracy} / 12.5</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12.5}
                      step={0.5}
                      value={rubricScores.grammarAccuracy}
                      onChange={(e) =>
                        setRubricScores({ ...rubricScores, grammarAccuracy: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>

                  {/* Vocabulary Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">2. Vocabulary Range:</label>
                      <span className="font-mono font-black text-[#0052CC]">{rubricScores.vocabularyRange} / 12.5</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12.5}
                      step={0.5}
                      value={rubricScores.vocabularyRange}
                      onChange={(e) =>
                        setRubricScores({ ...rubricScores, vocabularyRange: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>

                  {/* Pronunciation Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">3. Phonetics & Accent:</label>
                      <span className="font-mono font-black text-[#0052CC]">{rubricScores.phoneticsPronunciation} / 12.5</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12.5}
                      step={0.5}
                      value={rubricScores.phoneticsPronunciation}
                      onChange={(e) =>
                        setRubricScores({ ...rubricScores, phoneticsPronunciation: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>

                  {/* Coherence Slider */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">4. Coherence & Fluency:</label>
                      <span className="font-mono font-black text-[#0052CC]">{rubricScores.coherenceContext} / 12.5</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12.5}
                      step={0.5}
                      value={rubricScores.coherenceContext}
                      onChange={(e) =>
                        setRubricScores({ ...rubricScores, coherenceContext: Number(e.target.value) })
                      }
                      className="w-full accent-[#0052CC] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: PEDAGOGICAL REMARKS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Tutor Pedagogical Remarks for Student:
                </label>
                <textarea
                  value={feedbackRemarks}
                  onChange={(e) => setFeedbackRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  placeholder="Encouraging feedback, oral delivery praise, or focus areas..."
                />
              </div>

              {/* Bottom Submit Action Strip */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setEvaluatingSubmission(null)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Cancel / Return
                </button>

                <button
                  onClick={handleSaveEvaluation}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Mark & Publish Corrections</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
