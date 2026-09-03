export interface JobPosting {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  location: string;
  requiredLanguage: string;
  requiredCefrLevel: string;
  salaryRange: string;
  jobType: 'Full-time' | 'Contract' | 'Remote';
  postedDate: string;
}

export const mockJobPostings: JobPosting[] = [
  {
    id: "job-01",
    jobTitle: "Junior French Translator & Content Specialist",
    companyName: "Capgemini India",
    companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80",
    location: "Chennai / Remote",
    requiredLanguage: "French",
    requiredCefrLevel: "A1 / A2 Certificate",
    salaryRange: "₹4.5 LPA - ₹6.0 LPA",
    jobType: "Full-time",
    postedDate: "2 days ago"
  },
  {
    id: "job-02",
    jobTitle: "Bilingual Customer Operations Specialist (French)",
    companyName: "Amazon Global Business Services",
    companyLogo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=80",
    location: "Bengaluru, India",
    requiredLanguage: "French",
    requiredCefrLevel: "A1 Completed",
    salaryRange: "₹5.0 LPA - ₹7.2 LPA",
    jobType: "Full-time",
    postedDate: "1 week ago"
  }
];
