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

export const mockCertificates: DigitalCertificate[] = [];
