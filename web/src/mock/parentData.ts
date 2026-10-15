// ============================================================================
// ISML COLLEGE LMS — PARENT & GUARDIAN DATA ARCHITECTURE
// Comprehensive Multi-Child Schema, Academic History, Live Attendance,
// Gradebook, Live Classes Schedule & Tutor Direct Connect
// ============================================================================

export interface ChildLSRWScores {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  overall: number;
}

export interface ChildAttendanceSummary {
  presentDays: number;
  absentDays: number;
  totalWorkingDays: number;
  percentage: number;
  lastRecordedDate: string;
  naacCompliant: boolean; // >= 75%
  recentLogs: {
    id: string;
    date: string;
    sessionTitle: string;
    tutorName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    timeIn: string;
    remarks?: string;
  }[];
}

export interface ChildGradeItem {
  id: string;
  assessmentTitle: string;
  type: 'MID_TERM_CBT' | 'ORAL_VIVA' | 'WEEKLY_ASSIGNMENT' | 'DELF_MOCK';
  date: string;
  maxMarks: number;
  marksObtained: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'RE-EVAL';
  tutorFeedback: string;
  status: 'EVALUATED' | 'PENDING_REVIEW';
}

export interface ChildLiveClass {
  id: string;
  topic: string;
  courseCode: string;
  batchName: string;
  scheduledTime: string;
  duration: string;
  tutorName: string;
  tutorRole: string;
  tutorAvatar: string;
  status: 'LIVE_NOW' | 'UPCOMING' | 'COMPLETED';
  meetingUrl?: string;
  recordingUrl?: string;
}

export interface ChildCourseEnrollment {
  courseId: string;
  courseCode: string;
  courseName: string;
  levelBadge: string; // e.g. "CEFR A1"
  batchId: string;
  batchName: string;
  sectionCode: string;
  academicTerm: string;
  collegeName: string;
  campus: string;
  leadTutorName: string;
  leadTutorEmail: string;
  leadTutorPhone: string;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
}

export interface StudentChild {
  id: string;
  rollNo: string;
  name: string;
  avatarUrl: string;
  relationship: 'DAUGHTER' | 'SON' | 'WARD';
  dob: string;
  bloodGroup: string;
  collegeName: string;
  collegeCode: string;
  department: string;
  degreeYear: string;
  emergencyContact: string;

  // Active Enrollments
  primaryCourse: ChildCourseEnrollment;
  secondaryCourses?: ChildCourseEnrollment[];

  // Real-time Academic Tracking
  attendance: ChildAttendanceSummary;
  lsrwRadar: ChildLSRWScores;
  gradebook: ChildGradeItem[];
  upcomingLiveClasses: ChildLiveClass[];
  recentDoubtsCount: number;
  feeStatus: {
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    status: 'PAID' | 'PARTIAL' | 'OVERDUE';
    dueDate: string;
    lastReceiptNo: string;
  };
}

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  avatarUrl: string;
  linkedChildren: StudentChild[];
  notificationsCount: number;
}

// ============================================================================
// MOCK DATA: PARENT WITH MULTI-CHILD MONITORING
// Parent: Dr. Meenakshi Sundaram (Mother of 2 students at ISML)
// Child 1: Bharathi M (Anna University - French A1 Lead Track)
// Child 2: Karthikeyan S (Loyola College - French A1 Intensive Section B)
// ============================================================================

export const mockParentUser: ParentProfile = {
  id: 'par-meenakshi-01',
  name: 'Dr. Meenakshi Sundaram',
  email: 'meenakshi.sundaram@gmail.com',
  mobile: '+91 94440 12345',
  address: 'No. 42, Gandhi Nagar 2nd Main Road, Adyar',
  city: 'Chennai - 600020, Tamil Nadu',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  notificationsCount: 3,
  linkedChildren: [
    {
      id: 'stu-a1-01',
      rollNo: '2026-FR-8942',
      name: 'Ananya S',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      relationship: 'DAUGHTER',
      dob: '14 May 2005',
      bloodGroup: 'O+ve',
      collegeName: 'Anna University, Chennai',
      collegeCode: 'ANNA_UNIV',
      department: 'B.Tech Information Technology (3rd Year)',
      degreeYear: '2024 - 2028',
      emergencyContact: '+91 94440 12345 (Mother)',
      primaryCourse: {
        courseId: 'crs-fr-a1',
        courseCode: 'FR-101',
        courseName: 'French A1: Beginner Foundations & Phonetics',
        levelBadge: 'CEFR A1',
        batchId: 'batch-2026-fr-a1-morning',
        batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        sectionCode: 'Section A (Morning)',
        academicTerm: 'Autumn Semester 2026',
        collegeName: 'Anna University, Chennai',
        campus: 'CEG Guindy Campus',
        leadTutorName: 'Jay (fac-jay)',
        leadTutorEmail: 'jay.faculty@isml.edu',
        leadTutorPhone: '+91 98401 55667',
        progressPercent: 78,
        completedModules: 7,
        totalModules: 9,
      },
      attendance: {
        presentDays: 34,
        absentDays: 2,
        totalWorkingDays: 36,
        percentage: 94.5,
        lastRecordedDate: 'Today, 10:00 AM',
        naacCompliant: true,
        recentLogs: [
          {
            id: 'att-log-01',
            date: 'Today, Oct 15',
            sessionTitle: 'LSRW Speaking Drill: Subjunctive Expressions & Food Etiquette',
            tutorName: 'Jay (Lead Trainer)',
            status: 'PRESENT',
            timeIn: '09:58 AM',
            remarks: 'Joined on time via LiveKit Studio • Active participant',
          },
          {
            id: 'att-log-02',
            date: 'Oct 13, 2026',
            sessionTitle: 'Session #14: Irregular Passé Composé Verbs (Être vs Avoir)',
            tutorName: 'Jay (Lead Trainer)',
            status: 'PRESENT',
            timeIn: '10:01 AM',
            remarks: 'Present in full session',
          },
          {
            id: 'att-log-03',
            date: 'Oct 11, 2026',
            sessionTitle: 'DELF A1 Audio Drill: Train Station Announcements',
            tutorName: 'Arun Kumar (Standby Substitute)',
            status: 'PRESENT',
            timeIn: '10:00 AM',
            remarks: 'Listening test score: 24/25',
          },
          {
            id: 'att-log-04',
            date: 'Oct 08, 2026',
            sessionTitle: 'Session #12: Reflexive Verbs in Daily Routine',
            tutorName: 'Jay (Lead Trainer)',
            status: 'EXCUSED',
            timeIn: '-',
            remarks: 'College sports meet leave slip authorized by Academic Coordinator',
          },
          {
            id: 'att-log-05',
            date: 'Oct 06, 2026',
            sessionTitle: 'Formative Phonetics Clinic: Nasal Vowels [ɑ̃, ɛ̃, ɔ̃]',
            tutorName: 'Jay (Lead Trainer)',
            status: 'PRESENT',
            timeIn: '10:00 AM',
            remarks: 'High viva engagement',
          },
        ],
      },
      lsrwRadar: {
        listening: 88,
        speaking: 82,
        reading: 90,
        writing: 85,
        overall: 86.3,
      },
      gradebook: [
        {
          id: 'grd-bha-01',
          assessmentTitle: 'Mid-Term DELF A1 CBT Examination (50 Questions)',
          type: 'MID_TERM_CBT',
          date: 'Oct 10, 2026',
          maxMarks: 100,
          marksObtained: 92,
          percentage: 92,
          grade: 'A+',
          tutorFeedback: 'Exceptional listening comprehension. Pronunciation of liaisons is very clean.',
          status: 'EVALUATED',
        },
        {
          id: 'grd-bha-02',
          assessmentTitle: 'Speaking Viva: Mon Dialogue à la Boulangerie (Oral Drill)',
          type: 'ORAL_VIVA',
          date: 'Oct 04, 2026',
          maxMarks: 25,
          marksObtained: 22.5,
          percentage: 90,
          grade: 'A+',
          tutorFeedback: 'Confident intonation; slight hesitation on currency plural forms.',
          status: 'EVALUATED',
        },
        {
          id: 'grd-bha-03',
          assessmentTitle: 'Weekly Homework #06: Passé Composé Sentence Formulation',
          type: 'WEEKLY_ASSIGNMENT',
          date: 'Sep 28, 2026',
          maxMarks: 20,
          marksObtained: 18,
          percentage: 90,
          grade: 'A',
          tutorFeedback: 'Well structured handwriting and correct auxiliary accord.',
          status: 'EVALUATED',
        },
        {
          id: 'grd-bha-04',
          assessmentTitle: 'Pre-DELF Benchmark Simulation #01 (Full LSRW)',
          type: 'DELF_MOCK',
          date: 'Sep 15, 2026',
          maxMarks: 100,
          marksObtained: 84,
          percentage: 84,
          grade: 'A',
          tutorFeedback: 'Clear pass benchmark for France immigration and college credits.',
          status: 'EVALUATED',
        },
      ],
      upcomingLiveClasses: [
        {
          id: 'live-bha-01',
          topic: 'Session #16: Future Proche & Travel Vocabulary in Paris Metro',
          courseCode: 'FR-101',
          batchName: 'French A1 Intensive Cohort 2026',
          scheduledTime: 'Tomorrow • 10:00 - 11:30 AM',
          duration: '90 Mins',
          tutorName: 'Jay (fac-jay)',
          tutorRole: 'Lead Foreign Language Trainer',
          tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'UPCOMING',
          meetingUrl: '/tutor/live-classes',
        },
        {
          id: 'live-bha-02',
          topic: 'Special Doubt Clearance Desk: Irregular Participe Passé',
          courseCode: 'FR-101',
          batchName: 'French A1 Intensive Cohort 2026',
          scheduledTime: 'Friday • 05:30 - 06:30 PM',
          duration: '60 Mins',
          tutorName: 'Jay (fac-jay)',
          tutorRole: 'Doubt Desk Specialist',
          tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'UPCOMING',
          meetingUrl: '/tutor/live-classes',
        },
      ],
      recentDoubtsCount: 1,
      feeStatus: {
        totalFee: 18500,
        paidAmount: 18500,
        pendingAmount: 0,
        status: 'PAID',
        dueDate: 'Settled on 05 Aug 2026',
        lastReceiptNo: 'ISML-REC-2026-98124',
      },
    },
    {
      id: 'stu-a1-02',
      rollNo: '2026-FR-8943',
      name: 'Karthikeyan S',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      relationship: 'SON',
      dob: '22 Nov 2006',
      bloodGroup: 'B+ve',
      collegeName: 'Loyola College (Autonomous)',
      collegeCode: 'LOYOLA_COLL',
      department: 'B.Com Corporate Secretaryship (1st Year)',
      degreeYear: '2026 - 2029',
      emergencyContact: '+91 94440 12345 (Mother)',
      primaryCourse: {
        courseId: 'crs-fr-a1',
        courseCode: 'FR-101',
        courseName: 'French A1: Beginner Foundations & Phonetics',
        levelBadge: 'CEFR A1',
        batchId: 'batch-2026-fr-a1-weekend',
        batchName: 'French A1 Fast-Track Weekend Bootcamp',
        sectionCode: 'Section B (Weekend)',
        academicTerm: 'Autumn Semester 2026',
        collegeName: 'Loyola College (Autonomous)',
        campus: 'Nungambakkam Campus',
        leadTutorName: 'Marie Curie',
        leadTutorEmail: 'marie.curie@isml.edu',
        leadTutorPhone: '+91 98402 88990',
        progressPercent: 62,
        completedModules: 5,
        totalModules: 9,
      },
      attendance: {
        presentDays: 28,
        absentDays: 4,
        totalWorkingDays: 32,
        percentage: 87.5,
        lastRecordedDate: 'Oct 14, 02:00 PM',
        naacCompliant: true,
        recentLogs: [
          {
            id: 'att-log-k01',
            date: 'Oct 14, 2026',
            sessionTitle: 'Weekend Drill #08: French Numbers, Time & Days',
            tutorName: 'Marie Curie (Weekend Trainer)',
            status: 'PRESENT',
            timeIn: '11:02 AM',
            remarks: 'Active in pair-programming audio task',
          },
          {
            id: 'att-log-k02',
            date: 'Oct 12, 2026',
            sessionTitle: 'Session #07: Definite & Indefinite Articles (Le, La, Les)',
            tutorName: 'Marie Curie (Weekend Trainer)',
            status: 'PRESENT',
            timeIn: '11:00 AM',
            remarks: 'On time',
          },
          {
            id: 'att-log-k03',
            date: 'Oct 07, 2026',
            sessionTitle: 'Mid-Week Doubt Clinic: Gender of Nouns',
            tutorName: 'Jay (Lead Trainer)',
            status: 'ABSENT',
            timeIn: '-',
            remarks: 'Uninformed absence • SMS notification sent to parent',
          },
          {
            id: 'att-log-k04',
            date: 'Oct 05, 2026',
            sessionTitle: 'Session #06: Basic Greetings & Formal Tu vs Vous',
            tutorName: 'Marie Curie (Weekend Trainer)',
            status: 'PRESENT',
            timeIn: '11:05 AM',
            remarks: 'Good roleplay presentation',
          },
        ],
      },
      lsrwRadar: {
        listening: 80,
        speaking: 74,
        reading: 85,
        writing: 78,
        overall: 79.2,
      },
      gradebook: [
        {
          id: 'grd-kar-01',
          assessmentTitle: 'Mid-Term DELF A1 CBT Examination (50 Questions)',
          type: 'MID_TERM_CBT',
          date: 'Oct 10, 2026',
          maxMarks: 100,
          marksObtained: 78,
          percentage: 78,
          grade: 'B+',
          tutorFeedback: 'Good grammar grasp; speaking speed needs regular practice drills.',
          status: 'EVALUATED',
        },
        {
          id: 'grd-kar-02',
          assessmentTitle: 'Speaking Viva: Se Présenter en Français (Self Introduction)',
          type: 'ORAL_VIVA',
          date: 'Oct 02, 2026',
          maxMarks: 25,
          marksObtained: 19,
          percentage: 76,
          grade: 'B+',
          tutorFeedback: 'Good vocabulary; focus on nasal vowel ending resonance.',
          status: 'EVALUATED',
        },
        {
          id: 'grd-kar-03',
          assessmentTitle: 'Weekly Homework #04: Writing 5 Dialogues with Salutations',
          type: 'WEEKLY_ASSIGNMENT',
          date: 'Sep 25, 2026',
          maxMarks: 20,
          marksObtained: 16.5,
          percentage: 82.5,
          grade: 'A',
          tutorFeedback: 'Clean work. Submitted before deadline.',
          status: 'EVALUATED',
        },
      ],
      upcomingLiveClasses: [
        {
          id: 'live-kar-01',
          topic: 'Weekend Bootcamp Session #09: Ordering Food in a French Bistro',
          courseCode: 'FR-101',
          batchName: 'French A1 Fast-Track Weekend Bootcamp',
          scheduledTime: 'Saturday • 11:00 AM - 01:00 PM',
          duration: '120 Mins',
          tutorName: 'Marie Curie',
          tutorRole: 'Weekend Co-Trainer',
          tutorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          status: 'UPCOMING',
          meetingUrl: '/tutor/live-classes',
        },
      ],
      recentDoubtsCount: 3,
      feeStatus: {
        totalFee: 18500,
        paidAmount: 10000,
        pendingAmount: 8500,
        status: 'PARTIAL',
        dueDate: 'Due by 30 Oct 2026',
        lastReceiptNo: 'ISML-REC-2026-97210',
      },
    },
  ],
};
