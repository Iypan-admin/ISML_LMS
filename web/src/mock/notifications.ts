export interface NotificationItem {
  id: string;
  type: 'LIVE_CLASS' | 'RECORDING' | 'ASSIGNMENT' | 'EXAM' | 'CERTIFICATE' | 'DOUBT';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export const mockNotifications: NotificationItem[] = [];
