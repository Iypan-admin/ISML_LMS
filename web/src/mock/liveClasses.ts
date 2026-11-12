export interface LiveClass {
  id: string;
  topic: string;
  tutorName: string;
  tutorAvatar: string;
  tutorTitle: string;
  status: 'LIVE_NOW' | 'TODAY' | 'UPCOMING' | 'COMPLETED';
  date: string;
  timeSlot: string;
  durationMins: number;
  batchCode: string;
  batchName: string;
  moduleName: string;
  roomToken: string;
  attendeesCount: number;
  recordingAvailable: boolean;
  recordingUrl?: string;
}

export const mockLiveClasses: LiveClassSession[] = [];
