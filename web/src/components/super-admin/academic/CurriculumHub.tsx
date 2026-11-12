// ============================================================================
// ISML LMS — UNIFIED CURRICULUM & SYLLABUS MONITORING HUB
// Strictly Read-Only / Real-time Monitoring for Schools & Colleges
// Exact Master Architecture based on Official ISML Curriculum Matrix
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  School,
  Building2,
  Globe,
  FileText,
  AlertCircle,
  ExternalLink,
  Info,
  Calendar,
  Bot,
  UserCheck,
  Timer,
  Hash,
  Activity
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

// ----------------------------------------------------------------------------
// DATA SPECIFICATIONS FROM USER MASTER MATRIX
// ----------------------------------------------------------------------------

export interface CollegeTrackOption {
  trackName: 'Standard' | 'Intensive' | 'Super-Intensive';
  minutesPerSession: number;
  sessionsRequired: number;
  sessionsPerWeek: number;
  monthsRequired: number;
}

export interface CollegeLevelSpec {
  code: string;
  name: string;
  durationHours: number;
  assessmentsCount: number;
  humanSpeakingMinutesPerWeek: number;
  aiSpeakingPracticePerDay: number;
  tracks: {
    standard?: {
      minutesPerSession: number;
      sessionsRequired: number;
      sessionsPerWeek: number;
      monthsRequired: number;
    };
    intensive?: {
      minutesPerSession: number;
      sessionsRequired: number;
      sessionsPerWeek: number;
      monthsRequired: number;
    };
    superIntensive?: {
      minutesPerSession: number;
      sessionsRequired: number;
      sessionsPerWeek: number;
      monthsRequired: number;
    };
  };
}

export interface SchoolCategoryPeriodSpec {
  catName: string;
  minutesPerPeriod: number;
  periodsPerWeek: number;
  totalPeriods: number;
}

export interface SchoolLevelSpec {
  code: string;
  name: string;
  durationHours: number;
  assessmentsCount: number;
  humanSpeakingMinutesOnceIn2Weeks: number;
  aiSpeakingPracticePerDay: number;
  categories: {
    cat1_35min: { periodsPerWeek: number; totalPeriods: number };
    cat2_40min: { periodsPerWeek: number; totalPeriods: number };
    cat3_45min: { periodsPerWeek: number; totalPeriods: number };
    cat4_50min: { periodsPerWeek: number; totalPeriods: number };
    cat5_55min: { periodsPerWeek: number; totalPeriods: number };
    cat6_60min: { periodsPerWeek: number; totalPeriods: number };
  };
}

// ----------------------------------------------------------------------------
// COLLEGE CURRICULUM MATRIX (5 Languages: French, German, Spanish, Korean + Japanese)
// ----------------------------------------------------------------------------

export const COLLEGE_GENERAL_LEVELS: CollegeLevelSpec[] = [
  {
    code: 'A1 / L1',
    name: 'Beginner (A1 / TOPIK L1)',
    durationHours: 80,
    assessmentsCount: 4,
    humanSpeakingMinutesPerWeek: 10,
    aiSpeakingPracticePerDay: 3,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 80, sessionsPerWeek: 2, monthsRequired: 11 },
      intensive: { minutesPerSession: 90, sessionsRequired: 54, sessionsPerWeek: 2, monthsRequired: 7 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 40, sessionsPerWeek: 2, monthsRequired: 5 }
    }
  },
  {
    code: 'A2 / L2',
    name: 'Elementary (A2 / TOPIK L2)',
    durationHours: 100,
    assessmentsCount: 4,
    humanSpeakingMinutesPerWeek: 20,
    aiSpeakingPracticePerDay: 5,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 100, sessionsPerWeek: 3, monthsRequired: 8 },
      intensive: { minutesPerSession: 90, sessionsRequired: 67, sessionsPerWeek: 3, monthsRequired: 6 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsRequired: 4 }
    }
  },
  {
    code: 'B1 / L3',
    name: 'Intermediate (B1 / TOPIK L3)',
    durationHours: 140,
    assessmentsCount: 5,
    humanSpeakingMinutesPerWeek: 30,
    aiSpeakingPracticePerDay: 7,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 140, sessionsPerWeek: 4, monthsRequired: 8 },
      intensive: { minutesPerSession: 90, sessionsRequired: 94, sessionsPerWeek: 4, monthsRequired: 6 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 70, sessionsPerWeek: 4, monthsRequired: 4 }
    }
  },
  {
    code: 'B2 / L4',
    name: 'Upper Intermediate (B2 / TOPIK L4)',
    durationHours: 180,
    assessmentsCount: 5,
    humanSpeakingMinutesPerWeek: 40,
    aiSpeakingPracticePerDay: 10,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 180, sessionsPerWeek: 5, monthsRequired: 9 },
      intensive: { minutesPerSession: 90, sessionsRequired: 120, sessionsPerWeek: 5, monthsRequired: 6 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 90, sessionsPerWeek: 5, monthsRequired: 5 }
    }
  }
];

export const COLLEGE_JAPANESE_LEVELS: CollegeLevelSpec[] = [
  {
    code: 'N5',
    name: 'JLPT N5 (Basic Foundation)',
    durationHours: 100,
    assessmentsCount: 5,
    humanSpeakingMinutesPerWeek: 10,
    aiSpeakingPracticePerDay: 3,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 100, sessionsPerWeek: 2, monthsRequired: 12 },
      intensive: { minutesPerSession: 90, sessionsRequired: 67, sessionsPerWeek: 2, monthsRequired: 8 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsRequired: 4 }
    }
  },
  {
    code: 'N4',
    name: 'JLPT N4 (Elementary Comprehension)',
    durationHours: 120,
    assessmentsCount: 5,
    humanSpeakingMinutesPerWeek: 20,
    aiSpeakingPracticePerDay: 5,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 120, sessionsPerWeek: 3, monthsRequired: 10 },
      intensive: { minutesPerSession: 90, sessionsRequired: 80, sessionsPerWeek: 3, monthsRequired: 7 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 60, sessionsPerWeek: 3, monthsRequired: 5 }
    }
  },
  {
    code: 'N3',
    name: 'JLPT N3 (Bridge Intermediate)',
    durationHours: 160,
    assessmentsCount: 6,
    humanSpeakingMinutesPerWeek: 30,
    aiSpeakingPracticePerDay: 7,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 160, sessionsPerWeek: 4, monthsRequired: 10 },
      intensive: { minutesPerSession: 90, sessionsRequired: 107, sessionsPerWeek: 4, monthsRequired: 7 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 80, sessionsPerWeek: 4, monthsRequired: 5 }
    }
  },
  {
    code: 'N2',
    name: 'JLPT N2 (Pre-Advanced Business)',
    durationHours: 200,
    assessmentsCount: 6,
    humanSpeakingMinutesPerWeek: 40,
    aiSpeakingPracticePerDay: 10,
    tracks: {
      standard: { minutesPerSession: 60, sessionsRequired: 200, sessionsPerWeek: 5, monthsRequired: 10 },
      intensive: { minutesPerSession: 90, sessionsRequired: 134, sessionsPerWeek: 5, monthsRequired: 7 },
      superIntensive: { minutesPerSession: 120, sessionsRequired: 100, sessionsPerWeek: 5, monthsRequired: 5 }
    }
  }
];

// ----------------------------------------------------------------------------
// SCHOOL CURRICULUM MATRIX (Strictly 4 Languages: French, German, Spanish, Korean — NO JAPANESE)
// ----------------------------------------------------------------------------

export const SCHOOL_LEVELS: SchoolLevelSpec[] = [
  {
    code: 'A1.1',
    name: 'Introductory Stage 1',
    durationHours: 60,
    assessmentsCount: 4,
    humanSpeakingMinutesOnceIn2Weeks: 10,
    aiSpeakingPracticePerDay: 2,
    categories: {
      cat1_35min: { periodsPerWeek: 3, totalPeriods: 103 },
      cat2_40min: { periodsPerWeek: 3, totalPeriods: 90 },
      cat3_45min: { periodsPerWeek: 3, totalPeriods: 80 },
      cat4_50min: { periodsPerWeek: 3, totalPeriods: 72 },
      cat5_55min: { periodsPerWeek: 2, totalPeriods: 70 },
      cat6_60min: { periodsPerWeek: 2, totalPeriods: 70 }
    }
  },
  {
    code: 'A1.2',
    name: 'Introductory Stage 2',
    durationHours: 60,
    assessmentsCount: 4,
    humanSpeakingMinutesOnceIn2Weeks: 10,
    aiSpeakingPracticePerDay: 2,
    categories: {
      cat1_35min: { periodsPerWeek: 3, totalPeriods: 103 },
      cat2_40min: { periodsPerWeek: 3, totalPeriods: 90 },
      cat3_45min: { periodsPerWeek: 3, totalPeriods: 80 },
      cat4_50min: { periodsPerWeek: 3, totalPeriods: 72 },
      cat5_55min: { periodsPerWeek: 2, totalPeriods: 70 },
      cat6_60min: { periodsPerWeek: 2, totalPeriods: 70 }
    }
  },
  {
    code: 'A2.1',
    name: 'Elementary Stage 1',
    durationHours: 80,
    assessmentsCount: 5,
    humanSpeakingMinutesOnceIn2Weeks: 15,
    aiSpeakingPracticePerDay: 3,
    categories: {
      cat1_35min: { periodsPerWeek: 4, totalPeriods: 138 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat3_45min: { periodsPerWeek: 3, totalPeriods: 107 },
      cat4_50min: { periodsPerWeek: 3, totalPeriods: 96 },
      cat5_55min: { periodsPerWeek: 3, totalPeriods: 105 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  },
  {
    code: 'A2.2',
    name: 'Elementary Stage 2',
    durationHours: 80,
    assessmentsCount: 5,
    humanSpeakingMinutesOnceIn2Weeks: 15,
    aiSpeakingPracticePerDay: 3,
    categories: {
      cat1_35min: { periodsPerWeek: 4, totalPeriods: 138 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat3_45min: { periodsPerWeek: 3, totalPeriods: 107 },
      cat4_50min: { periodsPerWeek: 3, totalPeriods: 96 },
      cat5_55min: { periodsPerWeek: 3, totalPeriods: 105 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  },
  {
    code: 'A2.3',
    name: 'Elementary Consolidation Stage 3',
    durationHours: 80,
    assessmentsCount: 5,
    humanSpeakingMinutesOnceIn2Weeks: 15,
    aiSpeakingPracticePerDay: 3,
    categories: {
      cat1_35min: { periodsPerWeek: 4, totalPeriods: 138 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat3_45min: { periodsPerWeek: 3, totalPeriods: 107 },
      cat4_50min: { periodsPerWeek: 3, totalPeriods: 96 },
      cat5_55min: { periodsPerWeek: 3, totalPeriods: 105 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  },
  {
    code: 'B1.1',
    name: 'Intermediate Stage 1',
    durationHours: 100,
    assessmentsCount: 6,
    humanSpeakingMinutesOnceIn2Weeks: 20,
    aiSpeakingPracticePerDay: 4,
    categories: {
      cat1_35min: { periodsPerWeek: 5, totalPeriods: 172 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 150 },
      cat3_45min: { periodsPerWeek: 4, totalPeriods: 134 },
      cat4_50min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat5_55min: { periodsPerWeek: 4, totalPeriods: 140 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  },
  {
    code: 'B1.2',
    name: 'Intermediate Stage 2',
    durationHours: 100,
    assessmentsCount: 6,
    humanSpeakingMinutesOnceIn2Weeks: 20,
    aiSpeakingPracticePerDay: 4,
    categories: {
      cat1_35min: { periodsPerWeek: 5, totalPeriods: 172 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 150 },
      cat3_45min: { periodsPerWeek: 4, totalPeriods: 134 },
      cat4_50min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat5_55min: { periodsPerWeek: 4, totalPeriods: 140 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  },
  {
    code: 'B1.3',
    name: 'Intermediate Stage 3',
    durationHours: 100,
    assessmentsCount: 6,
    humanSpeakingMinutesOnceIn2Weeks: 20,
    aiSpeakingPracticePerDay: 4,
    categories: {
      cat1_35min: { periodsPerWeek: 5, totalPeriods: 172 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 150 },
      cat3_45min: { periodsPerWeek: 4, totalPeriods: 134 },
      cat4_50min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat5_55min: { periodsPerWeek: 4, totalPeriods: 140 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  },
  {
    code: 'B1.4',
    name: 'Intermediate Consolidation Stage 4',
    durationHours: 100,
    assessmentsCount: 6,
    humanSpeakingMinutesOnceIn2Weeks: 20,
    aiSpeakingPracticePerDay: 4,
    categories: {
      cat1_35min: { periodsPerWeek: 5, totalPeriods: 172 },
      cat2_40min: { periodsPerWeek: 4, totalPeriods: 150 },
      cat3_45min: { periodsPerWeek: 4, totalPeriods: 134 },
      cat4_50min: { periodsPerWeek: 4, totalPeriods: 120 },
      cat5_55min: { periodsPerWeek: 4, totalPeriods: 140 },
      cat6_60min: { periodsPerWeek: 3, totalPeriods: 105 }
    }
  }
];

// Supported languages definition
export interface LanguageMeta {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  availableInSchool: boolean;
  availableInCollege: boolean;
  color: string;
}

export const ALL_SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { id: 'FRENCH', name: 'French', nativeName: 'Français', flag: '🇫🇷', availableInSchool: true, availableInCollege: true, color: 'text-blue-500' },
  { id: 'GERMAN', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', availableInSchool: true, availableInCollege: true, color: 'text-amber-500' },
  { id: 'SPANISH', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', availableInSchool: true, availableInCollege: true, color: 'text-rose-500' },
  { id: 'KOREAN', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', availableInSchool: true, availableInCollege: true, color: 'text-purple-500' },
  { id: 'JAPANESE', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', availableInSchool: false, availableInCollege: true, color: 'text-emerald-500' },
];

export interface CurriculumHubProps {
  portalRole?: 'super-admin' | 'academic-manager';
}

export default function CurriculumHub({ portalRole = 'super-admin' }: CurriculumHubProps = {}) {
  const {
    selectedCollegeId,
    selectedCollege,
    isOverall,
    isSchoolMode,
    isCollegeMode
  } = useCollege();

  // Filter available languages based on active mode (School has 4, College has 5)
  const activeLanguagesList = useMemo(() => {
    if (isSchoolMode) {
      // In School mode: strictly French, German, Spanish, Korean. NO Japanese!
      return ALL_SUPPORTED_LANGUAGES.filter(l => l.availableInSchool);
    }
    // In College or Overall mode: all 5 languages available
    return ALL_SUPPORTED_LANGUAGES;
  }, [isSchoolMode]);

  // Selected Language Tab (default French)
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('FRENCH');

  // When switching to school mode, ensure selected language is valid (not Japanese)
  useEffect(() => {
    if (isSchoolMode && selectedLanguageId === 'JAPANESE') {
      setSelectedLanguageId('FRENCH');
    }
  }, [isSchoolMode, selectedLanguageId]);

  // Selected Level inside Language
  const [selectedLevelCode, setSelectedLevelCode] = useState<string>('');

  // Selected Track for College (Standard, Intensive, Super-Intensive)
  const [selectedCollegeTrack, setSelectedCollegeTrack] = useState<'Standard' | 'Intensive' | 'Super-Intensive'>('Standard');

  // Selected Category for School (Cat 1 to Cat 6)
  const [selectedSchoolCat, setSelectedSchoolCat] = useState<'cat1_35min' | 'cat2_40min' | 'cat3_45min' | 'cat4_50min' | 'cat5_55min' | 'cat6_60min'>('cat1_35min');

  const activeLanguage = useMemo(() => {
    return activeLanguagesList.find(l => l.id === selectedLanguageId) || activeLanguagesList[0];
  }, [activeLanguagesList, selectedLanguageId]);

  // Determine current levels list based on mode & language
  const currentLevels = useMemo(() => {
    if (isSchoolMode) {
      return SCHOOL_LEVELS;
    }
    // College mode
    if (activeLanguage.id === 'JAPANESE') {
      return COLLEGE_JAPANESE_LEVELS;
    }
    return COLLEGE_GENERAL_LEVELS;
  }, [isSchoolMode, activeLanguage]);

  // Keep selected level code valid
  useEffect(() => {
    const exists = currentLevels.some((l: any) => l.code === selectedLevelCode);
    if (!exists && currentLevels.length > 0) {
      setSelectedLevelCode(currentLevels[0].code);
    }
  }, [currentLevels, selectedLevelCode]);

  const activeLevel = useMemo(() => {
    return currentLevels.find((l: any) => l.code === selectedLevelCode) || currentLevels[0];
  }, [currentLevels, selectedLevelCode]);

  // Live Courses loaded from API (no mock data)
  const [liveCourses, setLiveCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCourses() {
      try {
        setIsLoadingCourses(true);
        const res = await fetch('https://ismllms-production.up.railway.app/api/portals/courses');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLiveCourses(Array.isArray(data) ? data : (data.courses || []));
          }
        } else {
          if (isMounted) setLiveCourses([]);
        }
      } catch (err) {
        if (isMounted) setLiveCourses([]);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    }
    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const matchedCourses = useMemo(() => {
    return liveCourses.filter((course) => {
      const langName = activeLanguage.name.toLowerCase();
      const codeMatches = (course.code || '').toLowerCase().includes(langName) ||
                          (course.name || '').toLowerCase().includes(langName);

      if (!isOverall && selectedCollegeId) {
        const instMatch = course.institutionId === selectedCollegeId || course.collegeId === selectedCollegeId;
        return codeMatches && instMatch;
      }

      return codeMatches;
    });
  }, [liveCourses, activeLanguage, isOverall, selectedCollegeId]);

  return (
    <div className="space-y-6">
      {/* Scope Filter Bar (College vs School & Single vs Overall) */}
      <CollegeFilterBar />

      {/* Header Banner - Read-Only Live Monitoring Notice */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring Hub
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Read-Only • Strictly Configured Architecture
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Curriculum & Syllabus Architecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {isSchoolMode ? (
                <>Official K-12 School Curriculum Matrix across <strong>4 Languages (French, German, Spanish, Korean)</strong> with 6 School Period Categories (35 to 60 mins).</>
              ) : (
                <>Higher Ed College Curriculum Matrix across <strong>5 Languages (French, German, Spanish, Korean, Japanese)</strong> with Standard, Intensive & Super-Intensive Tracks.</>
              )}
            </p>
          </div>

          {/* Active Context Metric Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-300">Target Framework</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                {isSchoolMode ? (
                  <>
                    <School className="w-3.5 h-3.5 text-amber-500" />
                    School System (4 Languages • 9 Sub-stages)
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    College System (5 Languages • 3 Tracks)
                  </>
                )}
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-300">Active Scope</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px] mt-0.5" title={selectedCollege ? selectedCollege.name : 'All Campuses'}>
                {isOverall ? 'All Institutions' : (selectedCollege?.name || 'Selected Campus')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selector Bar (Dynamically respects School vs College rules) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-sm">
        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            Language Programs ({activeLanguagesList.length} Languages Active for {isSchoolMode ? 'Schools' : 'Colleges'})
          </span>
          {isSchoolMode && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Japanese not applicable for Schools (Colleges only)
            </span>
          )}
        </div>

        <div className={`grid gap-2 ${isSchoolMode ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
          {activeLanguagesList.map((lang) => {
            const isSelected = lang.id === selectedLanguageId;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguageId(lang.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl select-none" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {lang.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {lang.nativeName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Levels & Stages List | Right Detailed Architecture Metrics & Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Levels / Stages based on exact Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">{activeLanguage.flag}</span>
                  {activeLanguage.name} {isSchoolMode ? 'School Stages' : 'College Levels'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isSchoolMode ? '9 Stage School Sub-levels' : 'CEFR / JLPT Higher Ed Levels'}
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                {currentLevels.length} Levels
              </span>
            </div>

            {/* Level Selector Buttons */}
            <div className="space-y-2">
              {currentLevels.map((lvl: any) => {
                const isSelected = lvl.code === selectedLevelCode;
                return (
                  <button
                    key={lvl.code}
                    onClick={() => setSelectedLevelCode(lvl.code)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {lvl.code}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {lvl.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {lvl.durationHours} hrs
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{lvl.assessmentsCount} Assessments before Exam</span>
                      <span>
                        {isSchoolMode 
                          ? `${lvl.humanSpeakingMinutesOnceIn2Weeks}m speaking / 2wks` 
                          : `${lvl.humanSpeakingMinutesPerWeek}m speaking / wk`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Master Matrix Metrics & Empty Topic Monitor */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Active Level Header & Exact Requirements from User Request */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {isSchoolMode ? 'School Curriculum Specification' : 'College Academic Track Specification'}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>{activeLanguage.name} — {activeLevel?.code} ({activeLevel?.name})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {activeLevel?.durationHours} Teaching Hours
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {activeLevel?.assessmentsCount} Assessments
                </span>
              </div>
            </div>

            {/* Core Practice Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  Teaching Hours
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {activeLevel?.durationHours} hrs
                </div>
                <div className="text-[10px] text-slate-400">Excl. assessments & exams</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Pre-Exam Tests
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {activeLevel?.assessmentsCount} Tests
                </div>
                <div className="text-[10px] text-slate-400">Continuous assessments</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-500" />
                  Human Speaking
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {isSchoolMode 
                    ? `${(activeLevel as SchoolLevelSpec)?.humanSpeakingMinutesOnceIn2Weeks} mins` 
                    : `${(activeLevel as CollegeLevelSpec)?.humanSpeakingMinutesPerWeek} mins`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isSchoolMode ? 'Once in 2 weeks appointment' : 'Per week with appointment'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-purple-500" />
                  AI Speaking
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {activeLevel?.aiSpeakingPracticePerDay}x / day
                </div>
                <div className="text-[10px] text-slate-400">Daily conversational drill</div>
              </div>
            </div>

            {/* COLLEGE SPECIFIC: Standard vs Intensive vs Super-Intensive Tracks */}
            {!isSchoolMode && (activeLevel as CollegeLevelSpec)?.tracks && (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    Pacing Track Breakdown (Standard vs Intensive vs Super-Intensive)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Standard Track */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Standard Track</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                        {(activeLevel as CollegeLevelSpec).tracks.standard?.monthsRequired} Months
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Session Length:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.standard?.minutesPerSession} mins</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions Required:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.standard?.sessionsRequired} sessions</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Frequency:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.standard?.sessionsPerWeek} / week</strong>
                      </div>
                    </div>
                  </div>

                  {/* Intensive Track */}
                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20">
                    <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                      <span>Intensive Track</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                        {(activeLevel as CollegeLevelSpec).tracks.intensive?.monthsRequired} Months
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Session Length:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.intensive?.minutesPerSession} mins</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions Required:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.intensive?.sessionsRequired} sessions</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Frequency:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.intensive?.sessionsPerWeek} / week</strong>
                      </div>
                    </div>
                  </div>

                  {/* Super-Intensive Track */}
                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20">
                    <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
                      <span>Super-Intensive</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold">
                        {(activeLevel as CollegeLevelSpec).tracks.superIntensive?.monthsRequired} Months
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Session Length:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.superIntensive?.minutesPerSession} mins</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions Required:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.superIntensive?.sessionsRequired} sessions</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Frequency:</span>
                        <strong className="text-slate-900 dark:text-white">{(activeLevel as CollegeLevelSpec).tracks.superIntensive?.sessionsPerWeek} / week</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCHOOL SPECIFIC: 6 Categories of Period Lengths */}
            {isSchoolMode && (activeLevel as SchoolLevelSpec)?.categories && (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                    School Period Allocation across Categories (Cat 1 to Cat 6)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* Cat 1: 35 min */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cat 1 (35m)</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat1_35min.periodsPerWeek} / wk
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat1_35min.totalPeriods} Total
                    </div>
                  </div>

                  {/* Cat 2: 40 min */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cat 2 (40m)</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat2_40min.periodsPerWeek} / wk
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat2_40min.totalPeriods} Total
                    </div>
                  </div>

                  {/* Cat 3: 45 min */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cat 3 (45m)</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat3_45min.periodsPerWeek} / wk
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat3_45min.totalPeriods} Total
                    </div>
                  </div>

                  {/* Cat 4: 50 min */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cat 4 (50m)</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat4_50min.periodsPerWeek} / wk
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat4_50min.totalPeriods} Total
                    </div>
                  </div>

                  {/* Cat 5: 55 min */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cat 5 (55m)</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat5_55min.periodsPerWeek} / wk
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat5_55min.totalPeriods} Total
                    </div>
                  </div>

                  {/* Cat 6: 60 min */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cat 6 (60m)</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat6_60min.periodsPerWeek} / wk
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {(activeLevel as SchoolLevelSpec).categories.cat6_60min.totalPeriods} Total
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Associated Courses Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Live Platform Courses Mapped ({matchedCourses.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live course codes registered in database matching {activeLanguage.name}
                </p>
              </div>
            </div>

            {isLoadingCourses ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                <div>Loading live courses from platform...</div>
              </div>
            ) : matchedCourses.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No courses registered yet for {activeLanguage.name} in {isOverall ? 'all campuses' : (selectedCollege?.name || 'this campus')}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedCourses.map((c: any) => (
                  <div key={c.id || c.code} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {c.code}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                        Active
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1 truncate">
                      {c.name}
                    </div>
                    {c.institutionName && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {c.institutionName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Topics & Lessons Monitoring Card — Kept Clean & Empty as Requested */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Syllabus Units, Topics & Lessons
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed lesson outlines and pedagogical topics for {activeLanguage.name} {activeLevel?.code}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                0 Topics Active
              </span>
            </div>

            {/* Empty State Banner (Clean placeholder as requested by user) */}
            <div className="py-12 px-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/40 dark:bg-slate-800/20">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                No Topics or Lessons Published Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                Detailed lesson outlines, unit chapters, and interactive exercises for <strong>{activeLanguage.name} ({activeLevel?.code})</strong> will be populated here once authored.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Monitoring Mode Active (Read-Only)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
