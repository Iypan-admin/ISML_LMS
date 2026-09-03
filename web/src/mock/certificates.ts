export interface DigitalCertificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  cefrLevel: string;
  issueDate: string;
  issuedBy: string;
  institutionName: string;
  status: 'ISSUED' | 'PENDING' | 'REVOKED';
  qrVerificationCode: string;
  verificationUrl: string;
}

export const mockCertificates: DigitalCertificate[] = [
  {
    id: "cert-2026-fr-89",
    certificateNumber: "ISML-CERT-2026-FR-08942",
    studentName: "Bharathi M",
    courseName: "French Language Proficiency Certificate",
    cefrLevel: "A1 (Breakthrough)",
    issueDate: "Expected Completion: Nov 2026",
    issuedBy: "Indian School for Modern Languages (IYPAN)",
    institutionName: "Anna University",
    status: "ISSUED",
    qrVerificationCode: "ISML-QR-VERIFY-8942-ANNA",
    verificationUrl: "https://isml-lms.edu/verify/ISML-CERT-2026-FR-08942"
  }
];
