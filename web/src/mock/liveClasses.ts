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

export const mockLiveClasses: LiveClass[] = [
  {
    id: "live-session-101",
    topic: "French A1 Module 3: Ordering Food & Café Dialogue (Salutations et Au Café)",
    tutorName: "Jay (Foreign Language Faculty)",
    tutorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Lead French Trainer • CEFR Certified",
    status: "LIVE_NOW",
    date: "Today",
    timeSlot: "10:00 AM - 11:30 AM",
    durationMins: 90,
    batchCode: "FR-101",
    batchName: "French A1 Intensive Cohort 2026 (Live Webinar Batch)",
    moduleName: "Module 3: Daily Social Life & Dialogue",
    roomToken: "livekit-room-fr-a1-mod3",
    attendeesCount: 48,
    recordingAvailable: false
  },
  {
    id: "live-session-102",
    topic: "French B1 Interactive Masterclass: Subjunctive Mood Debates & Opinion Expressions",
    tutorName: "Prof. Marie Delacroix (Lead Faculty)",
    tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Senior Master Trainer • Marie Delacroix is Broadcasting",
    status: "LIVE_NOW",
    date: "Today",
    timeSlot: "10:30 AM - 12:00 PM",
    durationMins: 90,
    batchCode: "FR-201",
    batchName: "French B1 Executive Cohort (1-on-1 Q&A Desk)",
    moduleName: "Module 3: Subjunctive Mood Debate",
    roomToken: "livekit-room-fr-b1-delacroix",
    attendeesCount: 62,
    recordingAvailable: false
  },
  {
    id: "live-session-103",
    topic: "Module 5: Directions & Shopping Vocabulary (Demander son Chemin et les Achats)",
    tutorName: "Dr. Rajesh Varma",
    tutorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Associate Professor of Foreign Languages",
    status: "UPCOMING",
    date: "Tomorrow, Sep 4",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 5: Travel & Directions",
    roomToken: "livekit-room-fr-a1-mod5",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-104",
    topic: "Module 6: Telling Time, Days & Weather Expressions (Quelle heure est-il et la Météo)",
    tutorName: "Prof. Hélène Dubois",
    tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Senior French Language Instructor",
    status: "UPCOMING",
    date: "Friday, Sep 5",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 6: Time & Expressions",
    roomToken: "livekit-room-fr-a1-mod6",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-105",
    topic: "Module 7: Family Members & Possessive Adjectives (La Famille et les Adjectifs Possessifs)",
    tutorName: "Dr. Rajesh Varma",
    tutorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Associate Professor of Foreign Languages",
    status: "UPCOMING",
    date: "Saturday, Sep 6",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 7: Family & Possessives",
    roomToken: "livekit-room-fr-a1-mod7",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-106",
    topic: "Module 8: Housing, Rooms & Furniture Vocabulary (Ma Maison et les Pièces)",
    tutorName: "Prof. Hélène Dubois",
    tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Senior French Language Instructor",
    status: "UPCOMING",
    date: "Monday, Sep 8",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 8: House & Furniture",
    roomToken: "livekit-room-fr-a1-mod8",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-107",
    topic: "Module 9: Expressing Likes, Dislikes & Hobbies (Les Goûts et les Passetemps)",
    tutorName: "Dr. Rajesh Varma",
    tutorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Associate Professor of Foreign Languages",
    status: "UPCOMING",
    date: "Tuesday, Sep 9",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 9: Hobbies & Preferences",
    roomToken: "livekit-room-fr-a1-mod9",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-108",
    topic: "Module 10: French Past Tense Fundamentals (Introduction au Passé Composé avec Avoir)",
    tutorName: "Prof. Hélène Dubois",
    tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Senior French Language Instructor",
    status: "UPCOMING",
    date: "Wednesday, Sep 10",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 10: Grammar - Passé Composé",
    roomToken: "livekit-room-fr-a1-mod10",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-109",
    topic: "Module 11: Travel, Booking Hotels & Transportation (Voyager et Réserver un Hôtel)",
    tutorName: "Dr. Rajesh Varma",
    tutorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Associate Professor of Foreign Languages",
    status: "UPCOMING",
    date: "Thursday, Sep 11",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 11: Travel & Logistics",
    roomToken: "livekit-room-fr-a1-mod11",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-110",
    topic: "Module 12: CEFR A1 Exam Oral Practice & Mock Conversation (Préparation à l'Examen Oral A1)",
    tutorName: "Prof. Hélène Dubois",
    tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Senior French Language Instructor",
    status: "UPCOMING",
    date: "Friday, Sep 12",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 12: Exam Oral Prep",
    roomToken: "livekit-room-fr-a1-mod12",
    attendeesCount: 0,
    recordingAvailable: false
  },
  {
    id: "live-session-100",
    topic: "Module 2: Self Introduction & Alphabet Pronunciation (Se Présenter et l'Alphabet)",
    tutorName: "Prof. Hélène Dubois",
    tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tutorTitle: "Senior French Language Instructor",
    status: "COMPLETED",
    date: "Yesterday, Sep 2",
    timeSlot: "10:30 AM - 12:30 PM",
    durationMins: 120,
    batchCode: "FR-A1-2026-A",
    batchName: "French A1 Morning Batch A",
    moduleName: "Module 2: Basics & Alphabet",
    roomToken: "livekit-room-fr-a1-mod2",
    attendeesCount: 284,
    recordingAvailable: true,
    recordingUrl: "/recordings/rec-100"
  }
];
