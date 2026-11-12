export type ExamLsrwFocus = 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'COMPREHENSIVE_LSRW';

export interface ExamModel {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  subjectCode: string;
  subjectName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  lsrwFocus: ExamLsrwFocus;
  type: 'MID_TERM' | 'QUIZ' | 'FINAL_EXAM' | 'LSRW_ASSESSMENT';
  status: 'AVAILABLE' | 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  durationMins: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  scheduledWindow: string;
  scoreAchieved?: number;
  resultStatus?: 'PASSED' | 'FAILED';
  proctoringEnabled: boolean;
  examDeliveryMode?: 'ONLINE_PORTAL' | 'LIVE_HUMAN_INTERVIEW' | 'PHYSICAL_CENTER' | 'OFFLINE_CENTER_ONLY' | 'ONLINE_HUMAN_SPEAKING_SLOT';
  isSpeakingExam?: boolean;
  examinerName?: string;
  liveHumanTutorSlot?: string;
  offlineCenterName?: string;
  offlineCenterAddress?: string;
  hallTicketRef?: string;
  liveVideoMeetingUrl?: string;
}

export type ExamItem = ExamModel;

export const mockExams: ExamModel[] = [];
