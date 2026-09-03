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

export const mockLiveRecordings: LiveRecording[] = [
  {
    id: "rec-100",
    sessionTopic: "Live Batch Webinar: Module 2 — Self Introduction & Alphabet Pronunciation",
    tutorName: "Prof. Hélène Dubois",
    recordedDate: "Sep 2, 2026",
    durationMins: 114,
    fileResolution: "1080p Full HD",
    storageProvider: "Cloudflare R2",
    uploadSlaStatus: "UPLOADED_WITHIN_24H",
    expiresAt: "Sep 2, 2027 (1 Year Access)",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    viewsCount: 194
  },
  {
    id: "rec-099",
    sessionTopic: "Live Batch Webinar: Module 1 — Introduction to French Language & CEFR A1 Overview",
    tutorName: "Prof. Hélène Dubois",
    recordedDate: "Aug 29, 2026",
    durationMins: 108,
    fileResolution: "1080p Full HD",
    storageProvider: "Cloudflare R2",
    uploadSlaStatus: "UPLOADED_WITHIN_24H",
    expiresAt: "Aug 29, 2027 (1 Year Access)",
    thumbnailUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    viewsCount: 230
  }
];
