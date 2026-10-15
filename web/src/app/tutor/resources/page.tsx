// ============================================================================
// ISML COLLEGE LMS — TUTOR: TEACHING MATERIALS & HANDOUTS (/tutor/resources)
// Tutor Perspective: Lecture slide decks, handouts, audio drills & grammar references
// ============================================================================

"use client";

import React from 'react';
import { FileText, Download, Headphones, BookOpen, Share2 } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';

export default function TutorResourcesPage() {
  const { currentFaculty } = useTutor();

  const resources = [
    {
      id: 'res-01',
      title: 'DELF A1 & A2 Comprehensive Grammar Rulebook (PDF)',
      type: 'GRAMMAR_HANDOUT',
      size: '4.8 MB',
      updatedAt: 'Yesterday',
    },
    {
      id: 'res-02',
      title: 'Café & Restaurant French Conversation Audio Pack (.mp3)',
      type: 'AUDIO_DRILL',
      size: '24.2 MB',
      updatedAt: '3 days ago',
    },
    {
      id: 'res-03',
      title: 'Verb Conjugation Drill Sheets & Homework Prompts',
      type: 'WORKSHEET',
      size: '1.9 MB',
      updatedAt: 'Last week',
    },
    {
      id: 'res-04',
      title: 'Oral Viva Scoring Criteria & CEFR Examiner Guidelines',
      type: 'EXAMINER_GUIDE',
      size: '2.1 MB',
      updatedAt: '2 weeks ago',
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console', href: '/tutor/dashboard' }, { label: 'Teaching Materials & Handouts' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0052CC]" />
            <span>Teaching Handouts & Audio Drills Archive</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download pedagogical slides, phonetic audio clips & share student homework sheets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res) => (
          <div
            key={res.id}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                {res.type.replace(/_/g, ' ')}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2">{res.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">File size: {res.size} • Updated {res.updatedAt}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Available to Enrolled Students</span>
              <button
                className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
