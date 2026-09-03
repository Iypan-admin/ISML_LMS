"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  PlayCircle, 
  Video, 
  FileText, 
  FileCheck2, 
  Headphones, 
  CheckCircle2, 
  Clock, 
  Lock,
  Download,
  FolderOpen
} from 'lucide-react';
import { currentStudent } from '@/mock/students';

const courseHierarchy = {
  language: "French (Français)",
  courseName: "French A1 Master Certificate",
  levels: [
    {
      levelId: "lvl-a1",
      levelName: "CEFR A1 (Breakthrough Level)",
      subLevels: [
        {
          subLevelId: "sub-a1-1",
          subLevelName: "A1.1 — Elementary Basics & Phonetics",
          modules: [
            {
              moduleId: "mod-1",
              moduleCode: "Module 01",
              moduleTitle: "French Accents & Phonetics Mastery",
              sessions: [
                {
                  sessionId: "sess-1",
                  sessionTitle: "Session 01: Vowel Pronunciation & Silent Endings",
                  status: "COMPLETED",
                  type: "PRE_RECORDED",
                  duration: "35 mins",
                  topics: [
                    "Native Vowel Sound Variations",
                    "Nasal Vowels (an, in, on)",
                    "Silent Final Consonants (Paris, Salut)"
                  ],
                  resourcesCount: 2,
                  assignmentTitle: "Worksheet 1: Vowel Handwriting",
                  lsrwType: "SPEAKING"
                },
                {
                  sessionId: "sess-2",
                  sessionTitle: "Session 02: Accents & Soft Keyboards (É, È, À, Ç, Œ)",
                  status: "IN_PROGRESS",
                  type: "PRE_RECORDED",
                  duration: "40 mins",
                  topics: [
                    "Aigu, Grave, and Circonflexe Accents",
                    "Cédille (Ç) pronunciation rules",
                    "Virtual Soft Keyboard Usage"
                  ],
                  resourcesCount: 1,
                  assignmentTitle: "Worksheet 2: Accent Keyboard Drill",
                  lsrwType: "WRITING"
                }
              ]
            },
            {
              moduleId: "mod-2",
              moduleCode: "Module 02",
              moduleTitle: "Essential Greetings & Self Introduction",
              sessions: [
                {
                  sessionId: "sess-3",
                  sessionTitle: "Session 03: Formal vs Informal Greetings (Bonjour vs Salut)",
                  status: "UPCOMING",
                  type: "LIVE_CLASS",
                  duration: "120 mins",
                  topics: [
                    "Tu vs Vous cultural distinction",
                    "Se Présenter (Introducing yourself)",
                    "Nationalities and Professions"
                  ],
                  resourcesCount: 3,
                  assignmentTitle: "Audio Homework: Dialogue Recording",
                  lsrwType: "LISTENING"
                }
              ]
            }
          ]
        },
        {
          subLevelId: "sub-a1-2",
          subLevelName: "A1.2 — Intermediate Grammar & Conversations",
          modules: [
            {
              moduleId: "mod-3",
              moduleCode: "Module 03",
              moduleTitle: "Ordering Food & Restaurant Vocabulary",
              sessions: [
                {
                  sessionId: "sess-4",
                  sessionTitle: "Session 04: At the French Café & Bistro Dialogue",
                  status: "LOCKED",
                  type: "LIVE_CLASS",
                  duration: "120 mins",
                  topics: [
                    "Menu items and Prices in Euros",
                    "Polite ordering phrases (Je voudrais...)",
                    "Asking for the bill (L'addition s'il vous plaît)"
                  ],
                  resourcesCount: 2,
                  assignmentTitle: "Café Conversation Homework",
                  lsrwType: "READING"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default function MyLearningPage() {
  const [expandedSubLevel, setExpandedSubLevel] = useState<string>("sub-a1-1");
  const [expandedModule, setExpandedModule] = useState<string>("mod-1");

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <span>{courseHierarchy.language}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#0052CC]" />
          <span>{courseHierarchy.courseName}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">My Learning Curriculum</h1>
        <p className="text-xs text-slate-600">
          Structured pedagogical progression from language basics to advanced conversational fluency.
        </p>
      </div>

      {/* Curriculum Hierarchy Tree */}
      <div className="space-y-4">
        {courseHierarchy.levels[0].subLevels.map((subLevel) => {
          const isSubLevelOpen = expandedSubLevel === subLevel.subLevelId;
          return (
            <div key={subLevel.subLevelId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              {/* Sub-Level Accordion Header */}
              <button
                onClick={() => setExpandedSubLevel(isSubLevelOpen ? "" : subLevel.subLevelId)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors border-b border-slate-200"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="p-2 rounded-lg bg-[#0052CC] text-white">
                    <FolderOpen className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#0B2447]">{subLevel.subLevelName}</h2>
                    <p className="text-xs text-slate-500">{subLevel.modules.length} Academic Modules</p>
                  </div>
                </div>
                {isSubLevelOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>

              {/* Sub-Level Body */}
              {isSubLevelOpen && (
                <div className="p-4 space-y-4 bg-slate-50/50">
                  {subLevel.modules.map((module) => {
                    const isModuleOpen = expandedModule === module.moduleId;
                    return (
                      <div key={module.moduleId} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        {/* Module Header */}
                        <div 
                          onClick={() => setExpandedModule(isModuleOpen ? "" : module.moduleId)}
                          className="p-3.5 bg-slate-100/60 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#0052CC] text-white">
                              {module.moduleCode}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800">{module.moduleTitle}</h3>
                          </div>
                          <span className="text-xs font-medium text-slate-500">{module.sessions.length} Sessions</span>
                        </div>

                        {/* Module Sessions List */}
                        {isModuleOpen && (
                          <div className="p-3 space-y-3 divide-y divide-slate-100">
                            {module.sessions.map((session) => (
                              <div key={session.sessionId} className="pt-3 first:pt-0 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        session.type === 'LIVE_CLASS' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-[#0052CC]'
                                      }`}>
                                        {session.type === 'LIVE_CLASS' ? '🔴 Live Webinar' : '▶ Pre-Recorded Video'}
                                      </span>
                                      <span className="text-xs font-bold text-[#0B2447]">{session.sessionTitle}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5" /> {session.duration}
                                      <span>•</span>
                                      <span>{session.resourcesCount} Downloadable Resources</span>
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 self-start sm:self-auto">
                                    {session.status === 'COMPLETED' && (
                                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                      </span>
                                    )}

                                    {session.status === 'LOCKED' ? (
                                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5" /> Locked
                                      </span>
                                    ) : (
                                      <Link
                                        href={session.type === 'LIVE_CLASS' ? '/live-classes' : '/pre-recorded'}
                                        className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                      >
                                        {session.type === 'LIVE_CLASS' ? <Video className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                        <span>Open Session</span>
                                      </Link>
                                    )}
                                  </div>
                                </div>

                                {/* Covered Topics Chips */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Topics:</span>
                                  {session.topics.map((t, idx) => (
                                    <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
