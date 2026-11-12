// ============================================================================
// ISML COLLEGE LMS — MOCK ACADEMIC DOUBT RESOLUTION & TUTOR TICKETING
// Live student academic doubts, audio questions, and faculty allocations
// ============================================================================

export interface DoubtThread {
  id: string;
  topicTitle: string;
  category: 'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt';
  status: 'RESOLVED' | 'OPEN' | 'IN_PROGRESS';
  assignedTutorName: string;
  assignedTutorRole: 'Assistant Doubt Tutor' | 'Main Tutor';
  createdAt: string;
  messages: {
    id: string;
    sender: 'STUDENT' | 'TUTOR' | 'AI_ASSISTANT';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export const mockDoubtThreads: DoubtThread[] = [];

export interface DoubtTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  batchId: string;
  batchName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  courseName: string;
  moduleName: string;
  topicTitle: string;
  category: 'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt' | 'LSRW Oral';
  status: 'RESOLVED' | 'OPEN' | 'IN_PROGRESS';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTutorName: string;
  assignedTutorRole: 'Lead Instructor' | 'Assistant Doubt Tutor' | 'Substitute Tutor';
  createdAt: string;
  resolvedAt?: string;
  messagesCount: number;
  lastReplyBy: 'STUDENT' | 'TUTOR' | 'AI_ASSISTANT';
  studentQuery: string;
  tutorSolution?: string;
}

export const mockDoubtTickets: DoubtTicket[] = [];
