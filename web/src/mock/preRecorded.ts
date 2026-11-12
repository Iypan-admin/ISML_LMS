// ============================================================================
// ISML COLLEGE LMS — PRE-RECORDED LECTURE SESSIONS MASTER FIXTURE
// Shared across Academic Manager (/academic-manager/recorded-sessions) and Student Portal (/pre-recorded)
// Includes Batch Mapping, Date, Day, Tutor, and Module Details
// ============================================================================

export interface LessonResource {
  title: string;
  type: 'PDF' | 'PPT' | 'AUDIO' | 'DOCX' | 'VIDEO';
  size: string;
  downloadUrl: string;
}

export interface PreRecordedSession {
  id: string;
  subLevel: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  subjectCode: string;
  subjectName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  moduleCode: string;
  moduleName: string;
  sessionTitle: string;
  topicName: string;
  description: string;
  durationMins: number;
  watchedMins: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  thumbnailUrl: string;
  videoUrl: string;
  videoFileName?: string;
  videoFileSize?: string;
  resolution: '1080p Full HD' | '720p HD' | '4K UHD';
  instructorName: string;
  resources: LessonResource[];
  assignmentId?: string;
  lsrwType?: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';
  viewsCount: number;
  lectureDate: string; // e.g. "Oct 12, 2026"
  lectureDay: string;  // e.g. "Monday"
  uploadedAt: string;
}

export const mockPreRecordedSessions: PreRecordedSession[] = [];
