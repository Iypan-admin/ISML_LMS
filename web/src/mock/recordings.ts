export interface LiveRecording {
  id: string;
  sessionTopic: string;
  tutorName: string;
  recordedDate: string;
  durationMins: number;
  fileResolution: '1080p Full HD' | '720p HD';
  storageProvider: 'Cloudflare R2';
  uploadSlaStatus: 'UPLOADED_WITHIN_24H';
  expiresAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  viewsCount: number;
}

export const mockLiveRecordings: LiveRecordingItem[] = [];
