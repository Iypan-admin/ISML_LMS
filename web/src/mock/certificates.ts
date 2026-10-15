// ============================================================================
// ISML COLLEGE LMS — MOCK DIGITAL CERTIFICATES LEDGER
// Batch-wise, Student-wise, Course-wise CEFR Language Credentials & Verification
// ============================================================================

export interface DigitalCertificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  courseName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  cefrLevel: string;
  scorePercentage: number;
  issueDate: string;
  issuedBy: string;
  institutionName: string;
  status: 'ISSUED' | 'PENDING' | 'REVOKED';
  qrVerificationCode: string;
  verificationUrl: string;
  downloadPdfUrl: string;
}

export const mockCertificates: DigitalCertificate[] = [
  {
    id: "cert-2026-fr-01",
    certificateNumber: "ISML-CERT-2026-FR-08942",
    studentId: "ISML20260001",
    studentName: "Bharathi M",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    courseName: "French A1 Intensive Certification Program",
    languageFamily: "FRENCH",
    cefrLevel: "CEFR A1 (Breakthrough / Débutant)",
    scorePercentage: 96,
    issueDate: "Oct 12, 2026",
    issuedBy: "Indian School for Modern Languages (ISML) & IYPAN Academic Directorate",
    institutionName: "Loyola College of Arts & Science (Autonomous)",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-8942-FR",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-FR-08942",
    downloadPdfUrl: "#"
  },
  {
    id: "cert-2026-fr-02",
    certificateNumber: "ISML-CERT-2026-FR-08945",
    studentId: "ISML20260003",
    studentName: "Alex D'Souza",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    courseName: "French A1 Intensive Certification Program",
    languageFamily: "FRENCH",
    cefrLevel: "CEFR A1 (Breakthrough / Débutant)",
    scorePercentage: 83,
    issueDate: "Oct 12, 2026",
    issuedBy: "Indian School for Modern Languages (ISML) & IYPAN Academic Directorate",
    institutionName: "Loyola College of Arts & Science (Autonomous)",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-8945-FR",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-FR-08945",
    downloadPdfUrl: "#"
  },
  {
    id: "cert-2026-de-03",
    certificateNumber: "ISML-CERT-2026-DE-07412",
    studentId: "ISML20260002",
    studentName: "Pooja R",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    courseName: "German A1 Professional Career Track",
    languageFamily: "GERMAN",
    cefrLevel: "CEFR A1 (Start Deutsch 1 Equivalent)",
    scorePercentage: 95,
    issueDate: "Oct 10, 2026",
    issuedBy: "Indian School for Modern Languages (ISML) & IYPAN Academic Directorate",
    institutionName: "Loyola College of Arts & Science (Autonomous)",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-7412-DE",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-DE-07412",
    downloadPdfUrl: "#"
  },
  {
    id: "cert-2026-jp-04",
    certificateNumber: "ISML-CERT-2026-JA-06230",
    studentId: "ISML20260004",
    studentName: "Vigneshwaran K",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    courseName: "Japanese N5 Foundation & JLPT Mastery",
    languageFamily: "JAPANESE",
    cefrLevel: "JLPT N5 (Beginner Kanji & Kana)",
    scorePercentage: 78,
    issueDate: "Oct 09, 2026",
    issuedBy: "Indian School for Modern Languages (ISML) & IYPAN Academic Directorate",
    institutionName: "Loyola College of Arts & Science (Autonomous)",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-6230-JA",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-JA-06230",
    downloadPdfUrl: "#"
  },
  {
    id: "cert-2026-ko-05",
    certificateNumber: "ISML-CERT-2026-KO-05118",
    studentId: "ISML20250012",
    studentName: "Sneha Sundaram",
    batchId: "batch-2025-cs",
    batchName: "Cohort 2025–2028 (Section A & B)",
    courseName: "Korean TOPIK I Level 1 Intensive",
    languageFamily: "KOREAN",
    cefrLevel: "TOPIK I Level 1 (Hangul Fluency)",
    scorePercentage: 98,
    issueDate: "Oct 08, 2026",
    issuedBy: "Indian School for Modern Languages (ISML) & IYPAN Academic Directorate",
    institutionName: "Loyola College of Arts & Science (Autonomous)",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-5118-KO",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-KO-05118",
    downloadPdfUrl: "#"
  },
  {
    id: "cert-2026-es-06",
    certificateNumber: "ISML-CERT-2026-ES-04391",
    studentId: "ISML20260021",
    studentName: "Ananya Krishnan",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    courseName: "Spanish DELE A1 Conversational Track",
    languageFamily: "SPANISH",
    cefrLevel: "DELE A1 (Acceso / Beginner)",
    scorePercentage: 91,
    issueDate: "Oct 11, 2026",
    issuedBy: "Indian School for Modern Languages (ISML) & IYPAN Academic Directorate",
    institutionName: "Loyola College of Arts & Science (Autonomous)",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-4391-ES",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-ES-04391",
    downloadPdfUrl: "#"
  }
];
