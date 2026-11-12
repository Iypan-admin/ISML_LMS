// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: ONLINE FOREIGN LANGUAGE ACADEMIC CALENDAR
// (/academic-manager/academic-calendar)
// 100% Online Foreign Language LMS: JLPT, DELF/DALF, Goethe, TOPIK, DELE
// Live Masterclasses, LSRW Bootcamps, Speaking Vivas, Mock Drills & Intake Milestones
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
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
  Users
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export type LanguageFamily = 'ALL' | 'JAPANESE' | 'FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN';

export type EventCategory =
  | 'ALL'
  | 'INTERNATIONAL_EXAM'
  | 'LIVE_MASTERCLASS'
  | 'LSRW_BOOTCAMP'
  | 'TERM_INTAKE'
  | 'SPEAKING_VIVA';

export interface CalendarEventItem {
  id: string;
  title: string;
  language: 'JAPANESE' | 'FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN' | 'GENERAL';
  level: string; // e.g., 'JLPT N4', 'DELF A2', 'Goethe B1', 'TOPIK II', 'DELE B2'
  category: 'INTERNATIONAL_EXAM' | 'LIVE_MASTERCLASS' | 'LSRW_BOOTCAMP' | 'TERM_INTAKE' | 'SPEAKING_VIVA';
  date: string; // YYYY-MM-DD
  displayDate: string;
  timeSlot: string;
  trainer: string;
  virtualStudioUrl?: string;
  targetBatches: string[];
  description: string;
  status: 'UPCOMING' | 'LIVE_TODAY' | 'COMPLETED';
}

export const initialForeignLanguageCalendar: CalendarEventItem[] = [];

export default function AcademicManagerCalendarPage() {
  const { showSuccess } = useToast();
  const [events, setEvents] = useState<CalendarEventItem[]>(initialForeignLanguageCalendar);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFamily>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'MONTH_GRID'>('LIST');

  // New Milestone Drawer State
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [inspectEvent, setInspectEvent] = useState<CalendarEventItem | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState<'JAPANESE' | 'FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN' | 'GENERAL'>('JAPANESE');
  const [newLevel, setNewLevel] = useState('JLPT N4');
  const [newCategory, setNewCategory] = useState<CalendarEventItem['category']>('LSRW_BOOTCAMP');
  const [newDate, setNewDate] = useState('2026-11-25');
  const [newTime, setNewTime] = useState('06:00 PM – 07:30 PM IST');
  const [newTrainer, setNewTrainer] = useState('');
  const [newBatch, setNewBatch] = useState('Batch 2026 Section A');
  const [newDesc, setNewDesc] = useState('');

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedLanguage !== 'ALL' && evt.language !== selectedLanguage && evt.language !== 'GENERAL') {
        return false;
      }
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          evt.title.toLowerCase().includes(q) ||
          evt.level.toLowerCase().includes(q) ||
          evt.trainer.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, selectedLanguage, selectedCategory, searchQuery]);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: CalendarEventItem = {
      id: `cal-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      language: newLanguage,
      level: newLevel,
      category: newCategory,
      date: newDate,
      displayDate: new Date(newDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      timeSlot: newTime,
      trainer: newTrainer || 'Native Language Trainer',
      targetBatches: [newBatch],
      description: newDesc || 'Online virtual foreign language training milestone.',
      status: 'UPCOMING',
    };

    setEvents((prev) => [created, ...prev]);
    showSuccess(`Academic milestone "${newTitle}" scheduled successfully.`);
    setIsAddDrawerOpen(false);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
  };

  // Helper Badge Colors
  const getCategoryBadge = (cat: CalendarEventItem['category']) => {
    switch (cat) {
      case 'INTERNATIONAL_EXAM':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Certification Exam', icon: Award };
      case 'LIVE_MASTERCLASS':
        return { bg: 'bg-blue-50 text-[#0052CC] border-blue-200', label: 'Live Masterclass', icon: Video };
      case 'LSRW_BOOTCAMP':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'LSRW Drill Bootcamp', icon: Headphones };
      case 'SPEAKING_VIVA':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Speaking Oral Viva', icon: Radio };
      case 'TERM_INTAKE':
      default:
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Intake Milestone', icon: Sparkles };
    }
  };

  const getLanguageTag = (lang: CalendarEventItem['language']) => {
    switch (lang) {
      case 'JAPANESE': return 'bg-red-50 text-red-700 border-red-200';
      case 'FRENCH': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'GERMAN': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SPANISH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'KOREAN': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Overview' }, { label: 'Academic Calendar' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-[#0052CC]" />
            <span>Online Foreign Language Academic Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized master timeline for JLPT, DELF, Goethe, TOPIK & DELE exams, live audio bootcamps, and speaking vivas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showSuccess('Exporting Academic Calendar schedule as iCal / CSV...')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Calendar</span>
          </button>
          <button
            onClick={() => setIsAddDrawerOpen(true)}
            className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Milestone</span>
          </button>
        </div>
      </div>

      {/* Language Track Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'All 5 Languages', count: events.length },
          { key: 'JAPANESE', label: 'Japanese (JLPT)', count: events.filter(e => e.language === 'JAPANESE').length },
          { key: 'FRENCH', label: 'French (DELF/DALF)', count: events.filter(e => e.language === 'FRENCH').length },
          { key: 'GERMAN', label: 'German (Goethe)', count: events.filter(e => e.language === 'GERMAN').length },
          { key: 'SPANISH', label: 'Spanish (DELE)', count: events.filter(e => e.language === 'SPANISH').length },
          { key: 'KOREAN', label: 'Korean (TOPIK)', count: events.filter(e => e.language === 'KOREAN').length },
        ].map((tab) => {
          const isActive = selectedLanguage === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedLanguage(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* KPI Stats Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-rose-700">Certification Exams</span>
            <Award className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">
            {events.filter(e => e.category === 'INTERNATIONAL_EXAM').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">JLPT, DELF, Goethe, DELE</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-purple-700">LSRW Bootcamps</span>
            <Headphones className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">
            {events.filter(e => e.category === 'LSRW_BOOTCAMP').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Listening & writing sprints</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-emerald-700">Speaking Oral Vivas</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">
            {events.filter(e => e.category === 'SPEAKING_VIVA').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">1-on-1 virtual fluency tests</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-blue-700">Live Masterclasses</span>
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">
            {events.filter(e => e.category === 'LIVE_MASTERCLASS').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Native speaker broadcasts</p>
        </div>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestones by title, CEFR level, trainer name or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            <option value="INTERNATIONAL_EXAM">Certification Exams (JLPT/DELF)</option>
            <option value="LSRW_BOOTCAMP">LSRW 4-Skills Bootcamps</option>
            <option value="SPEAKING_VIVA">Speaking & Oral Vivas</option>
            <option value="LIVE_MASTERCLASS">Live Masterclasses</option>
            <option value="TERM_INTAKE">Term Intake & Orientations</option>
          </select>
        </div>
      </div>

      {/* Timeline Event Cards List */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => {
            const badge = getCategoryBadge(evt.category);
            const CategoryIcon = badge.icon;
            const langClass = getLanguageTag(evt.language);

            return (
              <div
                key={evt.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Date Block & Title */}
                <div className="flex items-start gap-4">
                  {/* Calendar Date Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-[#0052CC] flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {evt.displayDate.split(' ')[0]}
                    </span>
                    <span className="text-xl font-black text-[#0B2447] leading-tight">
                      {evt.displayDate.split(' ')[1].replace(',', '')}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {evt.displayDate.split(' ')[2]}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${langClass}`}>
                        {evt.language} • {evt.level}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0B2447] leading-snug">{evt.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{evt.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700">{evt.timeSlot}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.trainer}</span>
                      </span>
                      <span>•</span>
                      <span className="text-indigo-700 font-semibold">
                        Cohorts: {evt.targetBatches.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {evt.virtualStudioUrl && (
                    <a
                      href={evt.virtualStudioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Studio Room</span>
                    </a>
                  )}

                  <button
                    onClick={() => setInspectEvent(evt)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs italic">
            No academic calendar milestones found for the selected language or event filter.
          </div>
        )}
      </div>

      {/* ─── ADD CALENDAR MILESTONE RIGHT SLIDE-OVER DRAWER ─── */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20">
                    <CalendarDays className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Schedule Language Milestone</h3>
                    <p className="text-xs text-blue-200 mt-0.5">Add CEFR exams, LSRW bootcamps & speaking vivas</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form id="add-milestone-form" onSubmit={handleCreateMilestone} className="p-5 space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Event / Exam Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. DELF A2 Reading Benchmark Exam or Kanji Sprint"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Language Track</label>
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="JAPANESE">Japanese (JLPT)</option>
                      <option value="FRENCH">French (DELF/DALF)</option>
                      <option value="GERMAN">German (Goethe)</option>
                      <option value="SPANISH">Spanish (DELE)</option>
                      <option value="KOREAN">Korean (TOPIK)</option>
                      <option value="GENERAL">General Milestone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Target CEFR Level</label>
                    <input
                      type="text"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      placeholder="e.g. JLPT N4 / Goethe B1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category Type</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="LSRW_BOOTCAMP">LSRW Drill Bootcamp</option>
                      <option value="INTERNATIONAL_EXAM">Certification Exam</option>
                      <option value="SPEAKING_VIVA">Speaking Oral Viva</option>
                      <option value="LIVE_MASTERCLASS">Live Masterclass</option>
                      <option value="TERM_INTAKE">Term Intake / Orientation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Event Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="06:00 PM – 08:00 PM IST"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Lead Faculty / Proctor</label>
                    <input
                      type="text"
                      value={newTrainer}
                      onChange={(e) => setNewTrainer(e.target.value)}
                      placeholder="e.g. Sensei Tanaka (Tokyo)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Batches / Cohorts</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    placeholder="e.g. French FastTrack Cohort A, Weekend Batch"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description & Guidelines</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide exam instructions, materials covered, or audio drill criteria..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddDrawerOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-milestone-form"
                className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
              >
                Confirm & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EVENT DETAILS QUICK SLIDE-OVER DRAWER ─── */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                    {inspectEvent.language} • {inspectEvent.level}
                  </span>
                  <h3 className="text-base font-bold text-white leading-tight mt-0.5">{inspectEvent.title}</h3>
                </div>
                <button
                  onClick={() => setInspectEvent(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <strong className="text-slate-900">{inspectEvent.displayDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Time Slot:</span>
                    <strong className="text-[#0052CC]">{inspectEvent.timeSlot}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event Classification:</span>
                    <strong className="text-slate-900">{inspectEvent.category.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lead Faculty / Proctor:</span>
                    <strong className="text-slate-900">{inspectEvent.trainer}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Cohorts:</span>
                    <strong className="text-indigo-700">{inspectEvent.targetBatches.join(', ')}</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Milestone Overview
                  </h4>
                  <p className="text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-200/80 leading-relaxed">
                    {inspectEvent.description}
                  </p>
                </div>

                {inspectEvent.virtualStudioUrl && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <Video className="w-4 h-4 text-emerald-600" />
                      <span>Live Broadcast Room Access</span>
                    </div>
                    <p className="text-[11px] font-mono text-emerald-800 break-all">
                      {inspectEvent.virtualStudioUrl}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              {inspectEvent.virtualStudioUrl && (
                <a
                  href={inspectEvent.virtualStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Join Virtual Studio
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
