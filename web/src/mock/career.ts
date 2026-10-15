// ============================================================================
// ISML COLLEGE LMS — MOCK CAREER PORTAL & PLACEMENT ASSISTANCE
// Foreign Language Industry Jobs, Internships & Batch Placements
// ============================================================================

export interface JobPosting {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  location: string;
  requiredLanguage: 'French' | 'German' | 'Japanese' | 'Korean' | 'Spanish';
  requiredCefrLevel: string;
  salaryRange: string;
  jobType: 'Full-time' | 'Contract' | 'Remote' | 'Internship';
  postedDate: string;
  openingsCount: number;
  applicantsCount: number;
  status: 'ACTIVE' | 'CLOSING_SOON' | 'FILLED';
  description: string;
  skills: string[];
}

export const mockJobPostings: JobPosting[] = [
  {
    id: "job-01",
    jobTitle: "Junior French Translator & Content Specialist",
    companyName: "Capgemini India",
    companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80",
    location: "Chennai / Hybrid",
    requiredLanguage: "French",
    requiredCefrLevel: "DELF A1 / A2 Certificate",
    salaryRange: "₹4.8 LPA - ₹6.2 LPA",
    jobType: "Full-time",
    postedDate: "2 days ago",
    openingsCount: 8,
    applicantsCount: 24,
    status: "ACTIVE",
    description: "Translate enterprise documentation, review technical articles, and liaise with European client teams.",
    skills: ["French A2", "Technical Translation", "MS Office", "LSRW Oral"]
  },
  {
    id: "job-02",
    jobTitle: "Bilingual Operations Associate (German / English)",
    companyName: "Siemens Technology India",
    companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
    location: "Bengaluru, India",
    requiredLanguage: "German",
    requiredCefrLevel: "Goethe A1 / Start Deutsch",
    salaryRange: "₹5.5 LPA - ₹7.0 LPA",
    jobType: "Full-time",
    postedDate: "3 days ago",
    openingsCount: 5,
    applicantsCount: 19,
    status: "ACTIVE",
    description: "Handle vendor communications and customer ticketing for German-speaking client regions in DACH.",
    skills: ["German A1/A2", "Email Etiquette", "SAP ERP", "Client Communication"]
  },
  {
    id: "job-03",
    jobTitle: "Japanese Language Technical Analyst (Bilingual IT)",
    companyName: "Fujitsu India & NTT Data",
    companyLogo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=80",
    location: "Chennai / Tokyo Remote",
    requiredLanguage: "Japanese",
    requiredCefrLevel: "JLPT N5 / N4 Certification",
    salaryRange: "₹6.0 LPA - ₹8.5 LPA",
    jobType: "Full-time",
    postedDate: "Yesterday",
    openingsCount: 6,
    applicantsCount: 15,
    status: "ACTIVE",
    description: "Bridge communication between Japanese product managers and Indian software engineering squads.",
    skills: ["JLPT N5", "Software Support", "Business Keigo Basics", "Bilingual Tech Docs"]
  },
  {
    id: "job-04",
    jobTitle: "Korean Content Moderation & Localization Specialist",
    companyName: "Krafton & Webzen Localization",
    companyLogo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
    location: "Hyderabad / Remote",
    requiredLanguage: "Korean",
    requiredCefrLevel: "TOPIK I Level 1 or 2",
    salaryRange: "₹5.0 LPA - ₹6.8 LPA",
    jobType: "Full-time",
    postedDate: "4 days ago",
    openingsCount: 4,
    applicantsCount: 12,
    status: "ACTIVE",
    description: "Review gaming dialogues, community guidelines, and localization assets for Korean entertainment platforms.",
    skills: ["TOPIK I", "Hangul Fluency", "Cultural Localization", "Gaming Media"]
  },
  {
    id: "job-05",
    jobTitle: "Spanish Customer Success Executive (LATAM Operations)",
    companyName: "Zoho Corporation",
    companyLogo: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80",
    location: "Estancia IT Park, Chennai",
    requiredLanguage: "Spanish",
    requiredCefrLevel: "DELE A1 / A2 Certificate",
    salaryRange: "₹4.5 LPA - ₹5.8 LPA",
    jobType: "Full-time",
    postedDate: "5 days ago",
    openingsCount: 10,
    applicantsCount: 31,
    status: "ACTIVE",
    description: "Support customers in Mexico, Spain, and Latin America through live chat, product onboarding, and email.",
    skills: ["Spanish DELE A1", "SaaS Onboarding", "CRM Tools", "Conversational Spanish"]
  }
];
