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

export const mockDoubtThreads: DoubtThread[] = [
  {
    id: "dbt-101",
    topicTitle: "Difference between 'C'est' and 'Il est' in French sentences",
    category: "Grammar",
    status: "RESOLVED",
    assignedTutorName: "Assistant Tutor Ananya",
    assignedTutorRole: "Assistant Doubt Tutor",
    createdAt: "Yesterday, 3:45 PM",
    messages: [
      {
        id: "msg-1",
        sender: "STUDENT",
        senderName: "Bharathi M",
        text: "Hi Mam! When should I use 'C'est un professeur' versus 'Il est professeur'?",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "msg-2",
        sender: "AI_ASSISTANT",
        senderName: "AI Tutor Suggestion",
        text: "Quick AI Tip: Use 'C'est' + Article + Noun (e.g. C'est un professeur). Use 'Il est' + Noun without article (e.g. Il est professeur).",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "msg-3",
        sender: "TUTOR",
        senderName: "Assistant Tutor Ananya",
        text: "Spot on! AI suggestion is correct. Remember: 'C'est' is used when introducing someone with a modified noun (e.g., C'est un grand homme).",
        timestamp: "Yesterday, 4:02 PM"
      }
    ]
  }
];
