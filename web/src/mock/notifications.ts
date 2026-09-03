export interface NotificationItem {
  id: string;
  type: 'LIVE_CLASS' | 'RECORDING' | 'ASSIGNMENT' | 'EXAM' | 'CERTIFICATE' | 'DOUBT';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "LIVE_CLASS",
    title: "Live Class Starting Now",
    message: "Module 3: Ordering Food in French & Café Conversations is currently live. Click to join the batch webinar.",
    timestamp: "10 mins ago",
    isRead: false,
    actionUrl: "/live-classes"
  },
  {
    id: "notif-2",
    type: "RECORDING",
    title: "New Live Class Recording Available",
    message: "Recording for Module 2: Self Introduction & Alphabet has been transcoded and added to your replay library.",
    timestamp: "2 hours ago",
    isRead: false,
    actionUrl: "/recordings"
  },
  {
    id: "notif-3",
    type: "ASSIGNMENT",
    title: "Homework Due Tomorrow",
    message: "Homework Assignment 1: French Accents & Vowels Handwriting Worksheet is due tomorrow at 11:59 PM.",
    timestamp: "5 hours ago",
    isRead: true,
    actionUrl: "/assignments"
  },
  {
    id: "notif-4",
    type: "DOUBT",
    title: "Tutor Replied to your Doubt",
    message: "Assistant Tutor Ananya responded to your grammar doubt on 'C'est' vs 'Il est'.",
    timestamp: "1 day ago",
    isRead: true,
    actionUrl: "/doubts"
  }
];
