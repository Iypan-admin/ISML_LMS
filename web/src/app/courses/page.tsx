"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  ArrowRight, 
  Bot, 
  Headphones, 
  Layers, 
  Search, 
  ShieldCheck, 
  Check, 
  X,
  GraduationCap,
  Building2,
  Filter,
  Compass,
  Lock,
  AlertCircle
} from 'lucide-react';
import { 
  COLLEGE_CURRICULUM_CATALOG, 
  SCHOOL_CURRICULUM_CATALOG, 
  CollegeCurriculumItem, 
  SchoolCurriculumItem 
} from '@/lib/curriculumCatalog';

export default function ExploreCoursesPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSchoolStudent, setIsSchoolStudent] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('French');
  const [selectedTrackType, setSelectedTrackType] = useState<'Standard' | 'Intensive' | 'Super-Intensive'>('Intensive');
  const [selectedPeriodCat, setSelectedPeriodCat] = useState<'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5' | 'cat6'>('cat2');
  
  // Completed levels state: By default, A1 / A1.1 is active, higher levels are locked until prerequisite completion
  const [completedLevelCodes, setCompletedLevelCodes] = useState<Set<string>>(new Set([]));
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set(['col-french-a1', 'sch-french-a11']));
  const [enrollModalItem, setEnrollModalItem] = useState<any>(null);
  const [enrollSuccessToast, setEnrollSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_user');
        if (stored) {
          const u = JSON.parse(stored);
          setUserProfile(u);
          const isSchool = /school|siva|lion|matric/i.test(u.campusName || u.tenantName || '');
          setIsSchoolStudent(isSchool);
        }
        const savedEnrolls = localStorage.getItem('isml_enrolled_courses');
        if (savedEnrolls) {
          setEnrolledCourseIds(new Set(JSON.parse(savedEnrolls)));
        }
        const savedCompleted = localStorage.getItem('isml_completed_levels');
        if (savedCompleted) {
          setCompletedLevelCodes(new Set(JSON.parse(savedCompleted)));
        }
      }
    } catch {}
  }, []);

  const handleConfirmEnroll = (item: any, trackName: string) => {
    const nextSet = new Set(enrolledCourseIds);
    nextSet.add(item.id);
    setEnrolledCourseIds(nextSet);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isml_enrolled_courses', JSON.stringify(Array.from(nextSet)));
      }
    } catch {}
    setEnrollModalItem(null);
    setEnrollSuccessToast(`Congratulations! Successfully enrolled in ${item.courseTitle} (${trackName}). Access granted in My Curriculum!`);
    setTimeout(() => setEnrollSuccessToast(null), 4000);
  };

  // College languages vs School languages
  const collegeLanguages = [
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'Korean', flag: '🇰🇷' },
    { name: 'Japanese', flag: '🇯🇵' },
  ];

  const schoolLanguages = [
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'Korean', flag: '🇰🇷' },
  ];

  const currentLanguages = isSchoolStudent ? schoolLanguages : collegeLanguages;

  const filteredCollegeCourses = COLLEGE_CURRICULUM_CATALOG.filter((item) => {
    return item.language === selectedLanguage;
  });

  const filteredSchoolCourses = SCHOOL_CURRICULUM_CATALOG.filter((item) => {
    return item.language === selectedLanguage;
  });

  // College level hierarchy order: A1 -> A2 -> B1 -> B2 (Japanese: N5 -> N4 -> N3 -> N2)
  const isCollegeLevelUnlocked = (levelCode: string): { unlocked: boolean; prerequisiteName?: string } => {
    if (levelCode === 'A1' || levelCode === 'N5') return { unlocked: true };
    if (levelCode === 'A2') {
      const a1Done = completedLevelCodes.has('A1') || completedLevelCodes.has('col-french-a1');
      return { unlocked: a1Done, prerequisiteName: 'Complete Level A1 First' };
    }
    if (levelCode === 'B1') {
      const a2Done = completedLevelCodes.has('A2');
      return { unlocked: a2Done, prerequisiteName: 'Complete Level A2 First' };
    }
    if (levelCode === 'B2') {
      const b1Done = completedLevelCodes.has('B1');
      return { unlocked: b1Done, prerequisiteName: 'Complete Level B1 First' };
    }
    if (levelCode === 'N4') {
      const n5Done = completedLevelCodes.has('N5');
      return { unlocked: n5Done, prerequisiteName: 'Pass JLPT N5 First' };
    }
    if (levelCode === 'N3') {
      const n4Done = completedLevelCodes.has('N4');
      return { unlocked: n4Done, prerequisiteName: 'Pass JLPT N4 First' };
    }
    if (levelCode === 'N2') {
      const n3Done = completedLevelCodes.has('N3');
      return { unlocked: n3Done, prerequisiteName: 'Pass JLPT N3 First' };
    }
    return { unlocked: false, prerequisiteName: 'Prerequisite Required' };
  };

  // School level hierarchy order: A1.1 -> A1.2 -> A2.1 -> A2.2 -> A2.3 -> B1.1 -> B1.2 -> B1.3 -> B1.4
  const isSchoolLevelUnlocked = (level: string): { unlocked: boolean; prerequisiteName?: string } => {
    if (level === 'A1.1') return { unlocked: true };
    const schoolOrder = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'A2.3', 'B1.1', 'B1.2', 'B1.3', 'B1.4'];
    const currIdx = schoolOrder.indexOf(level);
    if (currIdx > 0) {
      const prevLevel = schoolOrder[currIdx - 1];
      const prevDone = completedLevelCodes.has(prevLevel);
      return { unlocked: prevDone, prerequisiteName: `Complete Level ${prevLevel} First` };
    }
    return { unlocked: false, prerequisiteName: 'Prerequisite Required' };
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ─── Hero Header Banner ─── */}
      <div className={`p-5 sm:p-7 rounded-2xl shadow-lg border space-y-3 text-white ${
        isSchoolStudent
          ? 'bg-gradient-to-r from-[#2B1704] via-[#432306] to-[#78350F] border-amber-900/60'
          : 'bg-gradient-to-r from-[#0B2447] via-[#071730] to-[#1E3A8A] border-blue-900/50'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
              isSchoolStudent ? 'bg-amber-600 text-white' : 'bg-[#0052CC] text-white'
            }`}>
              <Compass className="w-3 h-3 text-cyan-300" />
              {isSchoolStudent ? 'School Junior Immersion Catalog' : 'College University Catalog'}
            </span>
            <span className="text-xs text-blue-200">
              {isSchoolStudent ? 'Structured School Timetable Periods' : 'CEFR & JLPT Accredited Programs'}
            </span>
          </div>
          <Link
            href="/learning"
            className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition"
          >
            <span>My Active Batches & Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {isSchoolStudent
              ? 'Available School Foreign Language Programs'
              : 'Explore University Foreign Language Certifications'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl mt-1">
            {isSchoolStudent
              ? 'Designed exclusively for school pupils. Higher levels (A1.2, A2, B1) unlock systematically as you complete prerequisite term assessments.'
              : 'University language pathways with sequential progression. Complete A1 to unlock A2 enrollment, and clear each milestone to advance to B1 and B2 Vantage.'}
          </p>
        </div>

        {/* Institution Badge */}
        <div className="pt-2 flex items-center gap-2 text-xs">
          <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold ${
            isSchoolStudent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#0052CC]/30 text-cyan-200 border border-cyan-500/30'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>Enrolled Institution: {userProfile?.campusName || userProfile?.tenantName || (isSchoolStudent ? 'Sivakasi Lions School' : 'The American College')}</span>
          </div>
        </div>
      </div>

      {/* ─── Language Selector Bar ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Distinct Language Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Language:
            </span>
            {currentLanguages.map((lang) => {
              const isSelected = selectedLanguage === lang.name;
              return (
                <button
                  key={lang.name}
                  onClick={() => setSelectedLanguage(lang.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isSchoolStudent ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30' : 'bg-[#0052CC] text-white shadow-md shadow-blue-900/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>

          {/* Study Pace selector (College) vs Period Category (School) */}
          {!isSchoolStudent ? (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['Standard', 'Intensive', 'Super-Intensive'] as const).map((track) => (
                <button
                  key={track}
                  onClick={() => setSelectedTrackType(track)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTrackType === track
                      ? 'bg-white text-[#0052CC] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {track} Pace
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              {[
                { key: 'cat1', label: 'Cat 1 (35m)' },
                { key: 'cat2', label: 'Cat 2 (40m)' },
                { key: 'cat3', label: 'Cat 3 (45m)' },
                { key: 'cat4', label: 'Cat 4 (50m)' },
                { key: 'cat5', label: 'Cat 5 (55m)' },
                { key: 'cat6', label: 'Cat 6 (60m)' },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedPeriodCat(c.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    selectedPeriodCat === c.key
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── College Dedicated Language & Level Cards (Only for College Students) ─── */}
      {!isSchoolStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>{filteredCollegeCourses[0]?.flagEmoji}</span>
              <span>{selectedLanguage} Language Certification Levels ({filteredCollegeCourses.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              Levels A1 → A2 → B1 → B2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCollegeCourses.map((c) => {
              const isEnrolled = enrolledCourseIds.has(c.id);
              const lockInfo = isCollegeLevelUnlocked(c.levelCode);
              const isLocked = !lockInfo.unlocked;

              const activeTrack =
                (selectedTrackType === 'Standard' && c.tracks.standard) ||
                (selectedTrackType === 'Intensive' && c.tracks.intensive) ||
                (selectedTrackType === 'Super-Intensive' && c.tracks.superIntensive) ||
                c.tracks.intensive ||
                c.tracks.standard ||
                c.tracks.superIntensive;

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden ${
                    isLocked
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-md'
                  }`}
                >
                  {/* Top Level & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.flagEmoji}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg font-black text-xs border ${c.accentBg} ${c.accentBorder} ${c.accentText}`}>
                        Level {c.levelCode}
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Enrolled
                      </span>
                    ) : isLocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-extrabold flex items-center gap-1 border border-slate-300">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Locked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-[10px] font-extrabold flex items-center gap-1 border border-blue-200">
                        Eligible
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#0B2447] leading-snug">
                      {c.courseTitle}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {c.cefrEquiv}
                    </p>
                  </div>

                  {/* Pedagogical Metrics */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Course Duration:</span>
                      <span className="font-extrabold text-slate-800">{c.courseDurationHours} Hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Assessments:</span>
                      <span className="font-extrabold text-slate-800">{c.assessmentsCount} Tests</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500">Human Speaking:</span>
                      <span className="font-extrabold text-[#0052CC] flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {c.humanSpeakingMinsPerWeek} Mins/Wk
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">AI Speaking Practice:</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {c.aiSpeakingPracticePerDay}x / Day
                      </span>
                    </div>
                  </div>

                  {/* Active Track Details */}
                  {activeTrack ? (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#0052CC]">
                        <span>{activeTrack.trackType} Pace</span>
                        <span>{activeTrack.monthsToComplete} Months</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{activeTrack.minsPerSession} Mins/Session</span>
                        <span>{activeTrack.sessionsPerWeek} Sessions/Wk</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Action button: Disable if prerequisite not completed */}
                  <div className="pt-2">
                    {isEnrolled ? (
                      <Link
                        href="/learning"
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open in My Learning</span>
                      </Link>
                    ) : isLocked ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 bg-slate-200 text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-300"
                        title={lockInfo.prerequisiteName}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lockInfo.prerequisiteName}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEnrollModalItem({ ...c, activeTrack })}
                        className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Enroll in {c.language} {c.levelCode}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── School Dedicated Language & Level Cards (Only for School Pupils) ─── */}
      {isSchoolStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>{filteredSchoolCourses[0]?.flagEmoji}</span>
              <span>{selectedLanguage} School Immersion Levels ({filteredSchoolCourses.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              Progressive: A1.1 → A1.2 → A2.1 → A2.2 ...
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchoolCourses.map((c) => {
              const isEnrolled = enrolledCourseIds.has(c.id);
              const lockInfo = isSchoolLevelUnlocked(c.level);
              const isLocked = !lockInfo.unlocked;
              const periodData = c.categories[selectedPeriodCat];

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden ${
                    isLocked
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.flagEmoji}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg font-black text-xs border ${c.accentBg} ${c.accentBorder} ${c.accentText}`}>
                        Level {c.level}
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Enrolled
                      </span>
                    ) : isLocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-extrabold flex items-center gap-1 border border-slate-300">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Locked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1 border border-amber-300">
                        Eligible
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#0B2447] leading-snug">
                      {c.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Structured school timetable periods with pronunciation practice and oral LSRW drills.
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Course Duration:</span>
                      <span className="font-extrabold text-slate-800">{c.courseDurationHours} Hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Assessments:</span>
                      <span className="font-extrabold text-slate-800">{c.assessmentsCount} Tests</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500">Human Speaking:</span>
                      <span className="font-extrabold text-amber-800 flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {c.humanSpeakingMinsBiWeekly}m / 2-Weeks
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">AI Speaking Practice:</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {c.aiSpeakingPracticePerDay}x / Day
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span>{periodData.minsPerPeriod} Mins / Period</span>
                      <span>{periodData.totalPeriods} Total Periods</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Timetable: <strong>{periodData.periodsPerWeek} Periods / Week</strong>
                    </p>
                  </div>

                  {/* School Action Button */}
                  <div className="pt-2">
                    {isEnrolled ? (
                      <Link
                        href="/learning"
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open in My Learning</span>
                      </Link>
                    ) : isLocked ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 bg-slate-200 text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-300"
                        title={lockInfo.prerequisiteName}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lockInfo.prerequisiteName}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEnrollModalItem({ ...c, periodData })}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Enroll in {c.language} {c.level}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Enrollment Confirmation Modal ─── */}
      {enrollModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-100 text-[#0052CC]">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B2447]">Confirm Course Enrollment</h3>
                  <p className="text-xs text-slate-500">Official Curriculum Track</p>
                </div>
              </div>
              <button
                onClick={() => setEnrollModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-extrabold text-slate-900">{enrollModalItem.courseTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Language:</span>
                <span className="font-bold text-[#0052CC] flex items-center gap-1">
                  <span>{enrollModalItem.flagEmoji}</span>
                  <span>{enrollModalItem.language}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Teaching Duration:</span>
                <span className="font-bold text-slate-900">{enrollModalItem.courseDurationHours} Hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assessments Before Exam:</span>
                <span className="font-bold text-slate-900">{enrollModalItem.assessmentsCount} Tests</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              By enrolling, <strong>{enrollModalItem.courseTitle}</strong> will be added to your active student records. You will gain access to live classes, timetable batches, and AI speaking drills.
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEnrollModalItem(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmEnroll(enrollModalItem, enrollModalItem.activeTrack?.trackType || 'Standard')}
                className="flex-1 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Enroll</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Success Toast ─── */}
      {enrollSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{enrollSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
