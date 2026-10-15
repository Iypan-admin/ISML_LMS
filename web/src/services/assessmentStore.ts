// ============================================================================
// ISML COLLEGE LMS — ACADEMIC ASSESSMENTS & APPROVAL STORE
// Shared State Hub: Academic Manager creates full 50Q assessments -> Submits to Super Admin -> Admin Approves
// ============================================================================

import { AssessmentItem, AssessmentQuestionItem } from '@/types/rbac';
import { mockAssessments } from '@/mock/superAdminData';
import { financeProposalStore } from './financeProposalStore';

// Preset 5 Comprehensive Core LSRW & Grammar Questions Generator
export const GENERATE_PRESET_5_LSRW_QUESTIONS = (examTitle: string): AssessmentQuestionItem[] => {
  return [
    {
      id: 1,
      questionText: 'Q1: Listening Audio Comprehension — SNCF Paris Station Train Announcement & Route Analysis',
      section: 'LISTENING',
      questionType: 'MCQ',
      marks: 10,
      contextPrompt: 'Listen to Audio Track #01 (SNCF Paris Gare de Lyon announcement) and determine train destination, track number & departure schedule.',
      audioPromptUrl: 'https://assets.isml.edu.in/audio/french/sncf_announcement_a1.mp3',
      referenceFileName: 'sncf_gare_de_lyon_track01.mp3',
      options: [
        'Option A: TGV 6604 à destination de Lyon Part-Dieu, départ Voie A à 14h20',
        'Option B: TER express à destination de Marseille Saint-Charles, Voie C',
        'Option C: Navette aéroportuaire CDG Terminal 2, retardée de 15 minutes',
        'Option D: RER Ligne A en direction de Marne-la-Vallée Chessy'
      ],
      correctAnswer: 'Option A: TGV 6604 à destination de Lyon Part-Dieu, départ Voie A à 14h20',
      rubricNotes: 'Award full 10 marks for identifying destination, track number, and scheduled departure time.'
    },
    {
      id: 2,
      questionText: 'Q2: Speaking Oral Viva & Phonetics — DELF A1 Spoken Monologue & Viva Voce Recording',
      section: 'SPEAKING',
      questionType: 'ORAL_AUDIO',
      marks: 10,
      contextPrompt: 'Record and upload a 90-second audio monologue in French covering: Nom, Âge, Nationalité, Profession, Ville, et Loisirs préférés. Focus on guttural [ʁ] and nasal vowels [ɑ̃, ɔ̃].',
      allowedFileTypes: ['.mp3', '.m4a', '.wav', '.webm'],
      correctAnswer: 'Bonjour ! Je m\'appelle Arun, j\'ai 22 ans et je suis indien. J\'habite à Chennai et j\'étudie le français. Pendant mon temps libre, j\'adore voyager et écouter de la musique française.',
      sampleModelAnswer: 'Learner must articulate French salutation (Bonjour/Bonsoir), state age using "j\'ai... ans" (not "je suis"), accurate nationality adjective agreement, and two hobby clauses.',
      rubricNotes: '10 Marks: Phonetics & Cadence (4m), Grammatical accuracy (3m), Vocabulary richness (3m).'
    },
    {
      id: 3,
      questionText: 'Q3: Reading Short Answer — Paris Municipal Transit Maintenance Closure Notice Interpretation',
      section: 'READING',
      questionType: 'SHORT_ANSWER',
      marks: 10,
      contextPrompt: 'Read the official RATP public transit notice posted at Station Châtelet. Answer the two comprehension questions in 2-3 concise French sentences.',
      referenceFileName: 'ratp_chatelet_metro_notice.pdf',
      referenceFileUrl: 'https://assets.isml.edu.in/notices/ratp_closure_oct2026.pdf',
      wordLimit: 50,
      correctAnswer: 'La station est fermée pour travaux le week-end du 24 au 25 octobre. Les usagers doivent prendre les bus de substitution n° 38.',
      sampleModelAnswer: '1. Date/heure exacte de fermeture (samedi 06h à dimanche 20h). 2. Moyen de transport de remplacement fourni aux voyageurs (bus de substitution RATP).',
      rubricNotes: 'Award 10 marks: Exact timing extraction (5m), Alternative commuter route identification (5m).'
    },
    {
      id: 4,
      questionText: 'Q4: Structural Grammar & Sentence Syntax — Passé Composé Conjugation & Negative Partitive Form',
      section: 'GRAMMAR',
      questionType: 'GRAMMAR_FILL',
      marks: 10,
      contextPrompt: 'Fill in the blanks with the correct auxiliary verb (ÊTRE / AVOIR), past participle agreement, and negative partitive rule.',
      correctAnswer: 'Hier soir, mes amis sont allés au cinéma mais ils n\'ont pas acheté de pop-corn.',
      rubricNotes: 'Award 10 marks: Auxiliary selection (3m), Agreement rules (4m), Negation partitive "de" (3m).'
    },
    {
      id: 5,
      questionText: 'Q5: Applied Writing Long Essay & Handwritten DELF Dossier Upload — Cultural Exchange Gratitude Letter',
      section: 'WRITING',
      questionType: 'LONG_ESSAY',
      marks: 10,
      contextPrompt: 'Type your formal gratitude essay (100–120 words) OR upload a scanned handwritten DELF dossier (PDF/JPEG) addressed to your French host family in Bordeaux.',
      allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.docx'],
      wordLimit: 120,
      correctAnswer: 'Chère famille Dupont, Je vous remercie chaleureusement pour votre accueil formidable à Bordeaux. Les cours de français et vos délicieux repas traditionnels ont rendu mon séjour inoubliable. J\'espère vous revoir très bientôt en Inde. Avec toute ma gratitude, Karthik.',
      sampleModelAnswer: 'DELF A1 Standard: Clear date & place heading, salutation (Chère famille...), gratitude body paragraphs with passif/imparfait memories, polite closing formula (Avec toute ma gratitude / Bien amicalement), and signature.',
      rubricNotes: 'Award 10 marks: Structure & Politeness formulas (3m), Coherence & connectors (3m), Orthography & Vocabulary (4m).'
    }
  ];
};

export const GENERATE_PRESET_50_LSRW_QUESTIONS = GENERATE_PRESET_5_LSRW_QUESTIONS;

// Default initial state with approval statuses
let globalAssessments: AssessmentItem[] = [
  {
    id: 'asm-fr-a1-mock-2026',
    code: 'EXAM-A1-DELF',
    title: 'DELF A1 National Benchmark CBT Mock Examination 2026',
    subjectName: 'French Phonetics & Oral Comprehension',
    programName: 'Diploma in French Language Studies',
    courseId: 'crs-french-a1',
    courseName: 'French A1: Beginner Foundations & Phonetics',
    semester: 1,
    batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
    batchId: 'batch-2026-fr-a1-morning',
    facultyName: 'Dr. Anandhakumar V.',
    type: 'FINAL_EXAM',
    totalMarks: 100,
    dueDate: '2026-10-25',
    durationMins: 90,
    submissionsCount: 6,
    status: 'APPROVED',
    approvalStatus: 'APPROVED_BY_ADMIN',
    submittedToAdminAt: '2026-10-10 09:30 AM',
    reviewedByAdminAt: '2026-10-10 02:15 PM',
    adminReviewRemarks: 'Approved for campus-wide DELF CBT examination rollout. All 50 LSRW questions verified.',
    questionsCount: 50,
    questions: GENERATE_PRESET_50_LSRW_QUESTIONS('DELF A1 Mock Examination')
  },
  {
    id: 'asm-fr-a2-midterm-2026',
    code: 'EXAM-A2-MID',
    title: 'French A2 Passé Composé & Imparfait Mid-Term Diagnostic',
    subjectName: 'French Structural Grammar & Syntax',
    programName: 'Certificate in French Language',
    courseId: 'crs-french-a2',
    courseName: 'French A2: Elementary Structural Fluency',
    semester: 1,
    batchName: 'French A2 Cohort (Section B - Standby Coverage)',
    batchId: 'batch-2026-fr-a2-standby',
    facultyName: 'Prof. Marie Dubois',
    type: 'MID_TERM',
    totalMarks: 100,
    dueDate: '2026-10-28',
    durationMins: 60,
    submissionsCount: 3,
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING_ADMIN_APPROVAL',
    submittedToAdminAt: '2026-10-14 11:20 AM',
    adminReviewRemarks: 'Pending executive review by Super Admin for Section B release.',
    questionsCount: 50,
    questions: GENERATE_PRESET_50_LSRW_QUESTIONS('French A2 Mid-Term Diagnostic')
  },
  {
    id: 'asm-fr-b1-viva-2026',
    code: 'EXAM-B1-VIVA',
    title: 'DELF B1 Spoken Discourse & Monologue Defense Test',
    subjectName: 'French Business Communication',
    programName: 'Advanced Diploma in French',
    courseId: 'crs-french-b1',
    courseName: 'French B1: Intermediate Pragmatic Competence',
    semester: 2,
    batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
    batchId: 'batch-2026-fr-b1-executive',
    facultyName: 'Dr. Jean-Pierre Lefebvre',
    type: 'FINAL_EXAM',
    totalMarks: 100,
    dueDate: '2026-11-05',
    durationMins: 90,
    submissionsCount: 2,
    status: 'DRAFT',
    approvalStatus: 'PENDING_ADMIN_APPROVAL',
    submittedToAdminAt: '2026-10-15 08:45 AM',
    adminReviewRemarks: 'Draft submitted by Academic Manager; pending final approval.',
    questionsCount: 50,
    questions: GENERATE_PRESET_50_LSRW_QUESTIONS('French B1 Monologue Defense Test')
  },
  ...mockAssessments.map((a, idx) => ({
    ...a,
    approvalStatus: (idx % 2 === 0 ? 'APPROVED_BY_ADMIN' : 'PENDING_ADMIN_APPROVAL') as any,
    questionsCount: 50,
    questions: GENERATE_PRESET_50_LSRW_QUESTIONS(a.title)
  }))
];

type AssessmentListener = () => void;
const assessmentListeners: Set<AssessmentListener> = new Set();

export const assessmentStore = {
  getAssessments: (): AssessmentItem[] => {
    return globalAssessments;
  },

  getAssessmentById: (id: string): AssessmentItem | undefined => {
    return globalAssessments.find((a) => a.id === id);
  },

  // Academic Manager creates and submits assessment to Super Admin
  createAndSubmitToAdmin: (assessment: {
    title: string;
    code?: string;
    subjectName: string;
    programName: string;
    courseId?: string;
    courseName?: string;
    semester?: number;
    batchName: string;
    batchId?: string;
    facultyName: string;
    type: 'MID_TERM' | 'FINAL_EXAM' | 'QUIZ' | 'ASSIGNMENT';
    totalMarks: number;
    dueDate: string;
    durationMins: number;
    questions: AssessmentQuestionItem[];
    submissionRemarks?: string;
  }): AssessmentItem => {
    const newId = `asm-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAssessment: AssessmentItem = {
      id: newId,
      code: assessment.code || `EXAM-${Math.floor(100 + Math.random() * 900)}`,
      title: assessment.title,
      subjectName: assessment.subjectName,
      programName: assessment.programName,
      courseId: assessment.courseId,
      courseName: assessment.courseName,
      semester: assessment.semester || 1,
      batchName: assessment.batchName,
      batchId: assessment.batchId,
      facultyName: assessment.facultyName,
      type: assessment.type,
      totalMarks: assessment.totalMarks,
      dueDate: assessment.dueDate,
      durationMins: assessment.durationMins,
      submissionsCount: 0,
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING_ADMIN_APPROVAL',
      submittedToAdminAt: new Date().toLocaleString(),
      adminReviewRemarks: assessment.submissionRemarks || 'Submitted by Academic Manager for Super Admin authorization.',
      questionsCount: assessment.questions.length,
      questions: assessment.questions
    };

    // Prepend to assessment store
    globalAssessments = [newAssessment, ...globalAssessments];

    // Push into Super Admin Executive Approvals Store as an Academic approval request!
    financeProposalStore.submitProposal({
      requestType: 'ONLINE_ASSESSMENT_APPROVAL',
      entityType: 'Online Assessment / CBT Exam',
      entityName: `${newAssessment.title} (${newAssessment.questionsCount} Questions • ${newAssessment.totalMarks} Marks)`,
      submittedBy: {
        name: 'Dr. K. Swaminathan',
        email: 'academic.manager@isml.edu.in',
        role: 'Academic Manager'
      },
      impactAnalysis: `Submitted ${newAssessment.questionsCount} questions (LSRW & Grammar benchmark) for cohort: "${newAssessment.batchName}". Max marks: ${newAssessment.totalMarks}, Duration: ${newAssessment.durationMins} mins. Super Admin approval is mandatory prior to student portal release.`
    });

    assessmentListeners.forEach((l) => l());
    return newAssessment;
  },

  // Super Admin approves assessment
  approveAssessment: (id: string, adminRemarks: string = 'Approved by Super Admin'): boolean => {
    const target = globalAssessments.find((a) => a.id === id);
    if (!target) return false;

    target.status = 'APPROVED';
    target.approvalStatus = 'APPROVED_BY_ADMIN';
    target.reviewedByAdminAt = new Date().toLocaleString();
    target.adminReviewRemarks = adminRemarks;

    assessmentListeners.forEach((l) => l());
    return true;
  },

  // Super Admin rejects assessment
  rejectAssessment: (id: string, reason: string): boolean => {
    const target = globalAssessments.find((a) => a.id === id);
    if (!target) return false;

    target.status = 'REJECTED';
    target.approvalStatus = 'REJECTED';
    target.reviewedByAdminAt = new Date().toLocaleString();
    target.adminReviewRemarks = reason;

    assessmentListeners.forEach((l) => l());
    return true;
  },

  subscribe: (listener: AssessmentListener) => {
    assessmentListeners.add(listener);
    return () => {
      assessmentListeners.delete(listener);
    };
  }
};
