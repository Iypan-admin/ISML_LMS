// ============================================================================
// ISML LMS — SUPER ADMIN: UNIFIED ACADEMIC CALENDAR & CYCLES (READ-ONLY MONITORING)
// Strictly Live Data Driven / Audit & Monitoring View Only
// Syncs live schedules from:
// 1. Live Interactive Classes (/api/live-classes)
// 2. 1:1 Human Tutor Speaking Viva Slots (/api/portals/tutor/speaking-viva)
// 3. Timetables & Schedule Entries (/api/portals/timetable)
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  Calendar,
  Clock,
  Globe2,
  Video,
  Award,
  Headphones,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Flame,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  X,
  Radio,
  FileCheck2,
  Users,
  RefreshCw,
  Building2,
  School,
  ExternalLink,
  Info
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export type LanguageFamily = 'ALL' | 'FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN' | 'JAPANESE';

export type EventCategory =
  | 'ALL'
  | 'LIVE_CLASS'
  | 'SPEAKING_VIVA'
  | 'INTERNATIONAL_EXAM'
  | 'TIMETABLE_SLOT'
  | 'TERM_INTAKE';

export interface UnifiedCalendarItem {
  id: string;
  title: string;
  sourceType: 'LIVE_CLASS' | 'SPEAKING_VIVA' | 'TIMETABLE_ENTRY';
  language: 'FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN' | 'JAPANESE' | 'GENERAL';
  level: string; // e.g., 'A1.1', 'JLPT N5', 'DELF A2', etc.
  category: EventCategory;
  date: string; // YYYY-MM-DD
  displayDate: string;
  timeSlot: string;
  facultyOrTrainer: string;
  batchOrTarget: string;
  institutionId?: string;
  institutionName?: string;
  meetingUrl?: string;
  description: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'UPCOMING';
}

export default function SuperAdminAcademicCalendarPage() {
  const { selectedCollegeId, selectedCollege, isOverall, isSchoolMode } = useCollege();

  // Unified Calendar Events from Backend APIs
  const [events, setEvents] = useState<UnifiedCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFamily>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'MONTH_GRID'>('LIST');

  // Drawer / Modal states for viewing details
  const [inspectEvent, setInspectEvent] = useState<UnifiedCalendarItem | null>(null);

  // Auto-switch language if school mode and Japanese was selected
  useEffect(() => {
    if (isSchoolMode && selectedLanguage === 'JAPANESE') {
      setSelectedLanguage('ALL');
    }
  }, [isSchoolMode, selectedLanguage]);

  // Load live schedule data from backend APIs
  const fetchAllCalendarSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const unifiedList: UnifiedCalendarItem[] = [];

      // 1. Fetch live classes
      try {
        const resClasses = await fetch('https://ismllms-production.up.railway.app/api/live-classes');
        if (resClasses.ok) {
          const classesData = await resClasses.json();
          const items = Array.isArray(classesData) ? classesData : (classesData.data || []);
          items.forEach((c: any) => {
            const startDate = c.scheduledStartTime ? new Date(c.scheduledStartTime) : new Date();
            const dateStr = startDate.toISOString().split('T')[0];
            unifiedList.push({
              id: `lc-${c.id}`,
              title: c.title || 'Interactive Live Classroom',
              sourceType: 'LIVE_CLASS',
              language: (c.language?.toUpperCase() as any) || 'FRENCH',
              level: c.level || 'A1',
              category: 'LIVE_CLASS',
              date: dateStr,
              displayDate: startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              timeSlot: `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${c.durationMinutes || 60}m)`,
              facultyOrTrainer: c.tutorName || 'Faculty Instructor',
              batchOrTarget: c.batchName || 'Enrolled Batch',
              institutionId: c.institutionId,
              institutionName: c.campusName || 'Main Campus',
              meetingUrl: c.meetingUrl,
              description: `Live interactive online class scheduled for ${c.batchName || 'cohort'}.`,
              status: c.status === 'LIVE' ? 'LIVE' : c.status === 'ENDED' ? 'ENDED' : 'SCHEDULED',
            });
          });
        }
      } catch {}

      // 2. Fetch 1:1 Human Speaking Vivas
      try {
        const resViva = await fetch('https://ismllms-production.up.railway.app/api/portals/tutor/speaking-viva');
        if (resViva.ok) {
          const vivaData = await resViva.json();
          const items = Array.isArray(vivaData.data) ? vivaData.data : [];
          items.forEach((v: any) => {
            const startDate = v.scheduledStartTime ? new Date(v.scheduledStartTime) : new Date();
            const dateStr = startDate.toISOString().split('T')[0];
            unifiedList.push({
              id: `viva-${v.id}`,
              title: '1:1 Human Speaking Viva Slot',
              sourceType: 'SPEAKING_VIVA',
              language: 'FRENCH',
              level: 'Oral Viva Assessment',
              category: 'SPEAKING_VIVA',
              date: dateStr,
              displayDate: startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              timeSlot: `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${v.durationMinutes || 15}m)`,
              facultyOrTrainer: 'Certified Speaking Evaluator',
              batchOrTarget: 'Student 1:1 Evaluation',
              institutionId: v.institutionId,
              institutionName: 'Institutional Campus',
              meetingUrl: v.meetingRoomUrl,
              description: '1:1 human spoken language proficiency session with appointment.',
              status: v.status || 'SCHEDULED',
            });
          });
        }
      } catch {}

      setEvents(unifiedList);
    } catch {
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCalendarSchedules();
  }, [fetchAllCalendarSchedules]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Filter by School Mode: In School Mode, Japanese events are hidden
      if (isSchoolMode && evt.language === 'JAPANESE') {
        return false;
      }

      // Filter by selected language tab
      if (selectedLanguage !== 'ALL' && evt.language !== selectedLanguage && evt.language !== 'GENERAL') {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }

      // Filter by Institution Scope
      if (!isOverall && selectedCollegeId && evt.institutionId && evt.institutionId !== selectedCollegeId) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          evt.title.toLowerCase().includes(q) ||
          evt.level.toLowerCase().includes(q) ||
          evt.facultyOrTrainer.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          evt.batchOrTarget.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, isSchoolMode, selectedLanguage, selectedCategory, isOverall, selectedCollegeId, searchQuery]);

  // Badge stylings
  const getCategoryMeta = (cat: EventCategory) => {
    switch (cat) {
      case 'LIVE_CLASS':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', label: 'Live Masterclass', icon: Video };
      case 'SPEAKING_VIVA':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800', label: '1:1 Speaking Viva', icon: Radio };
      case 'INTERNATIONAL_EXAM':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800', label: 'Certification Exam', icon: Award };
      case 'TIMETABLE_SLOT':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800', label: 'Timetable Slot', icon: Layers };
      case 'TERM_INTAKE':
      default:
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', label: 'Academic Milestone', icon: Sparkles };
    }
  };

  const getLanguageFlag = (lang: UnifiedCalendarItem['language']) => {
    switch (lang) {
      case 'FRENCH': return '🇫🇷';
      case 'GERMAN': return '🇩🇪';
      case 'SPANISH': return '🇪🇸';
      case 'KOREAN': return '🇰🇷';
      case 'JAPANESE': return '🇯🇵';
      default: return '🌐';
    }
  };

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Architecture', href: '/super-admin/academic/curriculum' }, { label: 'Academic Calendar & Cycles' }]} />

      <CollegeFilterBar />

      {/* Header Banner - Strictly Monitoring */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Schedule Monitoring
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Read-Only • {isSchoolMode ? 'Schools K-12 Calendar' : 'Colleges & Higher Ed Cycles'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Academic Calendar & Schedules
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Real-time oversight of online live classes, 1:1 human speaking viva slots, international exams, and academic cycles.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAllCalendarSchedules}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>Refresh Schedules</span>
            </button>
            <span className="text-xs font-semibold px-2.5 py-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">
              Institutional Audit Mode
            </span>
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
        {/* Language Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Language:
          </span>
          <button
            onClick={() => setSelectedLanguage('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedLanguage === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Programs
          </button>
          <button
            onClick={() => setSelectedLanguage('FRENCH')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'FRENCH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🇫🇷</span> French
          </button>
          <button
            onClick={() => setSelectedLanguage('GERMAN')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'GERMAN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🇩🇪</span> German
          </button>
          <button
            onClick={() => setSelectedLanguage('SPANISH')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'SPANISH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🇪🇸</span> Spanish
          </button>
          <button
            onClick={() => setSelectedLanguage('KOREAN')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'KOREAN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🇰🇷</span> Korean
          </button>
          {!isSchoolMode && (
            <button
              onClick={() => setSelectedLanguage('JAPANESE')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedLanguage === 'JAPANESE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>🇯🇵</span> Japanese
            </button>
          )}
        </div>

        {/* Category & Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EventCategory)}
              className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Event Categories</option>
              <option value="LIVE_CLASS">Live Classes</option>
              <option value="SPEAKING_VIVA">1:1 Speaking Vivas</option>
              <option value="INTERNATIONAL_EXAM">Certification Exams</option>
              <option value="TIMETABLE_SLOT">Timetable Slots</option>
              <option value="TERM_INTAKE">Academic Milestones</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search schedule, trainer, level..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 text-xs font-semibold ${viewMode === 'LIST' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('MONTH_GRID')}
                className={`px-3 py-1.5 text-xs font-semibold ${viewMode === 'MONTH_GRID' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Month Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <div>Synchronizing real-time academic calendar & live schedules...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Scheduled Events Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            There are currently no active live classes or speaking viva sessions scheduled for this scope.
          </p>
        </div>
      ) : viewMode === 'LIST' ? (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredEvents.map((item) => {
            const catMeta = getCategoryMeta(item.category);
            const CatIcon = catMeta.icon;
            const flag = getLanguageFlag(item.language);

            return (
              <div
                key={item.id}
                onClick={() => setInspectEvent(item)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl select-none" role="img" aria-label={item.language}>
                      {flag}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${catMeta.bg}`}>
                          <CatIcon className="w-3 h-3" />
                          {catMeta.label}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                          {item.level}
                        </span>
                        {item.status === 'LIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right sm:text-right">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {item.displayDate}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center sm:justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.timeSlot}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Faculty: <strong className="text-slate-800 dark:text-slate-200">{item.facultyOrTrainer}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target: <strong className="text-slate-800 dark:text-slate-200">{item.batchOrTarget}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.meetingUrl && (
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Room</span>
                      </a>
                    )}
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MONTH GRID VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Academic Schedule Grid
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {filteredEvents.length} events scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setInspectEvent(evt)}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {evt.displayDate}
                  </span>
                  <span className="text-xs">{getLanguageFlag(evt.language)}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {evt.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {evt.timeSlot}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Event Modal (Read-Only) */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getLanguageFlag(inspectEvent.language)}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {inspectEvent.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {inspectEvent.level} • {inspectEvent.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Date & Timing</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {inspectEvent.displayDate}
                  </div>
                  <div className="text-slate-500 mt-0.5">{inspectEvent.timeSlot}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Faculty / Evaluator</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {inspectEvent.facultyOrTrainer}
                  </div>
                  <div className="text-slate-500 mt-0.5">{inspectEvent.batchOrTarget}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Session Description</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  {inspectEvent.description}
                </p>
              </div>

              {inspectEvent.meetingUrl && (
                <div className="pt-2">
                  <a
                    href={inspectEvent.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Virtual Classroom Room</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
