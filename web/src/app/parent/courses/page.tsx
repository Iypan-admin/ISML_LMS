// ============================================================================
// ISML COLLEGE LMS — PARENT: ENROLLED COURSES & SYLLABUS (/parent/courses)
// Curriculum hierarchy, CEFR language levels, module progress & teaching materials
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  User,
  GraduationCap,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';

export default function ParentCoursesPage() {
  const { selectedChild, selectChild, allChildren } = useParent();
  const course = selectedChild.primaryCourse;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'Enrolled Courses & Syllabus' },
          ]}
        />
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {allChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChild(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                c.id === selectedChild.id
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course & Pedagogical Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Curriculum: {selectedChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {course.collegeName} • {course.batchName} ({course.sectionCode})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-black">
            {course.levelBadge}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            {course.progressPercent}% Completed
          </span>
        </div>
      </div>

      {/* PRIMARY COURSE OVERVIEW CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black text-[#0052CC] uppercase tracking-wider block">
              Official Course Syllabus
            </span>
            <h2 className="text-base font-black text-[#0B2447] mt-0.5">{course.courseName}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Lead Faculty</p>
            <p className="text-xs font-black text-[#0B2447]">{course.leadTutorName}</p>
          </div>
        </div>

        {/* Units / Modules Progression List */}
        <div className="space-y-3">
          {[
            { num: 'Unit 01', title: 'Phonetics, Salutations & Alphabet Accord', status: 'COMPLETED', desc: 'Nasal vowel resonance [ɑ̃, ɛ̃, ɔ̃] and formal greetings' },
            { num: 'Unit 02', title: 'Definite & Indefinite Articles, Gender of Nouns', status: 'COMPLETED', desc: 'Le, la, les, un, une, des & pluralization rules' },
            { num: 'Unit 03', title: 'Numbers, Time, Days & Travel Dialogue', status: 'COMPLETED', desc: 'Ordering at a café, metro ticketing and time expressions' },
            { num: 'Unit 04', title: 'Regular -ER, -IR Verbs & Present Tense Conjugation', status: 'COMPLETED', desc: 'Parler, Finir, Habiter with daily conversational drills' },
            { num: 'Unit 05', title: 'Passé Composé with Avoir & Être (Narrative Past)', status: 'COMPLETED', desc: 'Irregular past participles (fait, pris, vu, été) and DR MRS VANDERTRAMP' },
            { num: 'Unit 06', title: 'Reflexive Verbs & Daily Routine (Se Réveiller, Se Lever)', status: 'COMPLETED', desc: 'Pronominal verbs with negative form ne...pas' },
            { num: 'Unit 07', title: 'Food, Cuisine & Ordering at a Parisian Bistro', status: 'COMPLETED', desc: 'Partitive articles du, de la, des & polite requests' },
            { num: 'Unit 08', title: 'Future Proche & Travel Arrangements', status: 'IN_PROGRESS', desc: 'Aller + Infinitive construction for immediate future events' },
            { num: 'Unit 09', title: 'Final DELF A1 Benchmark Revision & Mock CBT', status: 'UPCOMING', desc: 'Full 100-mark LSRW rehearsal under timed conditions' },
          ].map((mod) => (
            <div
              key={mod.num}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                mod.status === 'COMPLETED'
                  ? 'bg-emerald-50/40 border-emerald-200/70'
                  : mod.status === 'IN_PROGRESS'
                  ? 'bg-blue-50/60 border-[#0052CC]/50 ring-1 ring-blue-500/20'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black text-slate-500">{mod.num}</span>
                  <h4 className="text-xs font-black text-[#0B2447] truncate">{mod.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{mod.desc}</p>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  mod.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : mod.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-[#0052CC] animate-pulse'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {mod.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
