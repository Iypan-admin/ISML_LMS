// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: CAREER PORTAL & PLACEMENTS
// (/academic-manager/career)
// Manage foreign language enterprise recruitment, job postings & batch drives
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Filter,
  Plus,
  Users,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  X,
  FileCheck2
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import { mockJobPostings, JobPosting } from '@/mock/career';

export default function AcademicManagerCareerPage() {
  const { showSuccess } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>(mockJobPostings);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewJob, setPreviewJob] = useState<JobPosting | null>(null);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (
        selectedLanguageFilter !== 'ALL' &&
        j.requiredLanguage.toUpperCase() !== selectedLanguageFilter
      ) {
        return false;
      }
      if (selectedTypeFilter !== 'ALL' && j.jobType !== selectedTypeFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          j.jobTitle.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.requiredCefrLevel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, selectedLanguageFilter, selectedTypeFilter, searchQuery]);

  // Aggregate stats
  const totalOpenings = useMemo(() => {
    return jobs.reduce((acc, curr) => acc + curr.openingsCount, 0);
  }, [jobs]);

  const totalApplicants = useMemo(() => {
    return jobs.reduce((acc, curr) => acc + curr.applicantsCount, 0);
  }, [jobs]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Career & Industry Placements' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Career Portal & Language Placement Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee foreign language hiring drives, partner corporate openings, and student placement applications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => showSuccess('Placements summary ledger exported to Excel!')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Placement Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Active Job Openings</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalOpenings}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Across {jobs.length} Partner Firms</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Student Applicants</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalApplicants}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Enrolled batch candidates</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Languages Recruited</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">5 Languages</p>
          <p className="text-[10px] text-slate-500 mt-0.5">French, German, Japanese, Korean, Spanish</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Highest Package</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">₹8.5 LPA</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Fujitsu Bilingual IT Lead</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities by title, corporate recruiter, location, or skill..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0">
            <span>Job Type:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* 5 Core Languages Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0">Language:</span>
          {['ALL', 'FRENCH', 'GERMAN', 'JAPANESE', 'KOREAN', 'SPANISH'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguageFilter(lang)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLanguageFilter === lang
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'ALL' ? 'All Roles' : lang}
            </button>
          ))}

          <span className="ml-auto text-xs font-bold text-slate-500 shrink-0">
            Showing <strong className="text-slate-800">{filteredJobs.length}</strong> opportunities
          </span>
        </div>
      </div>

      {/* Opportunities Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4 border-t-4 border-t-blue-600"
          >
            <div>
              {/* Header: Company & Job Type */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2447] leading-snug line-clamp-1">
                      {job.jobTitle}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.companyName}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges: Language, Level, Location */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  {job.requiredLanguage} ({job.requiredCefrLevel})
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>{job.location}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {job.salaryRange}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 mt-3 leading-relaxed">
                {job.description}
              </p>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Metrics & Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-500 text-[11px] font-semibold">
                <span>{job.openingsCount} Vacancies</span>
                <span>•</span>
                <span className="text-blue-600 font-bold">{job.applicantsCount} Enrolled Applicants</span>
              </div>

              <button
                onClick={() => setPreviewJob(job)}
                className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* JOB DETAIL MODAL */}
      {previewJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 space-y-5 p-6 font-sans">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={previewJob.companyLogo}
                  alt={previewJob.companyName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2447]">{previewJob.jobTitle}</h3>
                  <p className="text-xs text-slate-600 font-medium">{previewJob.companyName} • {previewJob.location}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">PACKAGE</span>
                <strong className="text-xs font-bold text-emerald-700">{previewJob.salaryRange}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">REQUIRED CEFR</span>
                <strong className="text-xs font-bold text-purple-700">{previewJob.requiredCefrLevel}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL VACANCIES</span>
                <strong className="text-xs font-bold text-slate-900">{previewJob.openingsCount} Positions</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">STUDENT APPLICATIONS</span>
                <strong className="text-xs font-bold text-blue-700">{previewJob.applicantsCount} Applied</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role Overview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{previewJob.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Competency Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {previewJob.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold border border-blue-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Posted {previewJob.postedDate} • Approved by Academic Directorate
              </span>

              <button
                onClick={() => {
                  showSuccess(`Direct batch recommendation dispatched for ${previewJob.jobTitle}!`);
                  setPreviewJob(null);
                }}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Dispatch Batch Recommendation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
