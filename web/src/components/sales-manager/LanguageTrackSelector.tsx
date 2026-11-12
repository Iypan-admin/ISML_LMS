"use client";

import React, { useState } from 'react';
import {
  SCHOOL_CURRICULUM_DATA,
  COLLEGE_CURRICULUM_DATA,
  SchoolCurriculumLevel,
  CollegeCurriculumLevel,
} from '@/lib/curriculumStandards';
import { BookOpen, Sparkles, Clock, Calendar, CheckCircle2, ChevronRight, GraduationCap, School } from 'lucide-react';

interface LanguageTrackSelectorProps {
  mode: 'COLLEGE' | 'SCHOOL';
  selectedLanguage: string;
  selectedLevel: string;
  selectedSubOption?: string; // e.g. "Cat 3 (45m)" or "Intensive (90m)"
  onSelect: (selection: {
    language: string;
    level: string;
    trackName: string;
    metricsSummary: string;
    fullSpec: any;
  }) => void;
}

export default function LanguageTrackSelector({
  mode,
  selectedLanguage,
  selectedLevel,
  selectedSubOption,
  onSelect,
}: LanguageTrackSelectorProps) {
  // Available Languages
  const languages = mode === 'COLLEGE'
    ? ['French', 'German', 'Spanish', 'Korean', 'Japanese']
    : ['French', 'German', 'Spanish', 'Korean'];

  const [activeLang, setActiveLang] = useState<string>(selectedLanguage || 'French');
  const [activeLevel, setActiveLevel] = useState<string>(
    selectedLevel || (mode === 'COLLEGE' ? (activeLang === 'Japanese' ? 'N5' : 'A1 / L1') : 'A1.1')
  );

  // For College: 'standard' | 'intensive' | 'superIntensive'
  const [collegePacing, setCollegePacing] = useState<'standard' | 'intensive' | 'superIntensive'>('intensive');
  // For School: 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5' | 'cat6'
  const [schoolPeriodCat, setSchoolPeriodCat] = useState<'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5' | 'cat6'>('cat3');

  // Filter levels for the chosen language
  const collegeLevels = COLLEGE_CURRICULUM_DATA.filter((item) =>
    item.languages.includes(activeLang)
  );

  const schoolLevels = SCHOOL_CURRICULUM_DATA;

  // Current active level object
  const currentCollegeLevel = collegeLevels.find((l) => l.levelCode === activeLevel) || collegeLevels[0];
  const currentSchoolLevel = schoolLevels.find((l) => l.levelCode === activeLevel) || schoolLevels[0];

  // Helper trigger
  const handleLangChange = (lang: string) => {
    setActiveLang(lang);
    if (mode === 'COLLEGE') {
      const available = COLLEGE_CURRICULUM_DATA.filter((i) => i.languages.includes(lang));
      const firstLevel = available[0]?.levelCode || 'A1 / L1';
      setActiveLevel(firstLevel);
      emitCollegeSelection(lang, firstLevel, collegePacing, available[0]);
    } else {
      emitSchoolSelection(lang, activeLevel, schoolPeriodCat, currentSchoolLevel);
    }
  };

  const handleLevelChange = (lvl: string) => {
    setActiveLevel(lvl);
    if (mode === 'COLLEGE') {
      const found = collegeLevels.find((l) => l.levelCode === lvl);
      emitCollegeSelection(activeLang, lvl, collegePacing, found);
    } else {
      const found = schoolLevels.find((l) => l.levelCode === lvl);
      emitSchoolSelection(activeLang, lvl, schoolPeriodCat, found);
    }
  };

  const emitCollegeSelection = (
    lang: string,
    lvl: string,
    pacing: 'standard' | 'intensive' | 'superIntensive',
    lvlObj: CollegeCurriculumLevel | undefined
  ) => {
    if (!lvlObj) return;
    const metrics = lvlObj[pacing];
    const pacingLabel =
      pacing === 'standard' ? 'Standard (60 min/session)' : pacing === 'intensive' ? 'Intensive (90 min/session)' : 'Super-Intensive (120 min/session)';
    const summary = metrics
      ? `${metrics.minsPerSession}m/session • ${metrics.sessionsRequired} sessions • ${metrics.sessionsPerWeek}x/wk • ${metrics.monthsRequired} months (${lvlObj.durationHours}h total)`
      : `${lvlObj.durationHours}h total`;

    onSelect({
      language: lang,
      level: lvl,
      trackName: `${lang} ${lvl} — ${pacingLabel}`,
      metricsSummary: summary,
      fullSpec: { ...lvlObj, selectedPacing: pacing, metrics },
    });
  };

  const emitSchoolSelection = (
    lang: string,
    lvl: string,
    cat: 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5' | 'cat6',
    lvlObj: SchoolCurriculumLevel | undefined
  ) => {
    if (!lvlObj) return;
    const catData = lvlObj.categories[cat];
    const summary = `${catData.name} • ${catData.periodsPerWeek} periods/wk • ${catData.totalPeriods} total periods (${lvlObj.durationHours}h total)`;

    onSelect({
      language: lang,
      level: lvl,
      trackName: `${lang} (${lvl}) — ${catData.name}`,
      metricsSummary: summary,
      fullSpec: { ...lvlObj, selectedCategory: cat, catData },
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Language Selection Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>1. Select Language Track</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {languages.map((lang) => {
            const isSelected = activeLang === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? mode === 'COLLEGE'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{lang}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Level Selection Cards */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700">
            2. CEFR / Curriculum Proficiency Level
          </label>
          <span className="text-[10px] text-slate-500 font-semibold">
            {mode === 'COLLEGE' ? 'Teaching hours exclusive of exam' : 'School 6-Category Period Matrix'}
          </span>
        </div>

        {mode === 'COLLEGE' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {collegeLevels.map((lvl) => {
              const isSelected = activeLevel === lvl.levelCode;
              return (
                <div
                  key={lvl.levelCode}
                  onClick={() => handleLevelChange(lvl.levelCode)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#0052CC] ring-2 ring-[#0052CC]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0B2447]">{lvl.levelCode}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                      {lvl.durationHours}h
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 space-y-0.5">
                    <div>{lvl.assessmentsCount} Assessments</div>
                    <div>{lvl.speakingMinsPerWeek}m/wk Speaking</div>
                    <div>{lvl.aiSpeakingPerDay}x AI Daily</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {schoolLevels.map((lvl) => {
              const isSelected = activeLevel === lvl.levelCode;
              return (
                <button
                  key={lvl.levelCode}
                  type="button"
                  onClick={() => handleLevelChange(lvl.levelCode)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{lvl.levelCode}</div>
                  <div className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {lvl.durationHours}h
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Detailed Pacing / Period Configuration Track */}
      {mode === 'COLLEGE' && currentCollegeLevel && (
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              3. Delivery Pacing Mode (College Standard / Intensive / Super)
            </span>
            <span className="text-[11px] font-bold text-blue-700">
              {currentCollegeLevel.levelCode} ({currentCollegeLevel.durationHours} Hours)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Standard */}
            {currentCollegeLevel.standard && (
              <div
                onClick={() => {
                  setCollegePacing('standard');
                  emitCollegeSelection(activeLang, activeLevel, 'standard', currentCollegeLevel);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  collegePacing === 'standard'
                    ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B2447]">Standard Pacing</span>
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {currentCollegeLevel.standard.minsPerSession} min
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 space-y-0.5 font-medium">
                  <div>• Sessions: <strong>{currentCollegeLevel.standard.sessionsRequired} sessions</strong></div>
                  <div>• Frequency: <strong>{currentCollegeLevel.standard.sessionsPerWeek} sessions / week</strong></div>
                  <div>• Duration: <strong>{currentCollegeLevel.standard.monthsRequired} Months</strong></div>
                </div>
              </div>
            )}

            {/* Intensive */}
            {currentCollegeLevel.intensive && (
              <div
                onClick={() => {
                  setCollegePacing('intensive');
                  emitCollegeSelection(activeLang, activeLevel, 'intensive', currentCollegeLevel);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  collegePacing === 'intensive'
                    ? 'bg-white border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B2447]">Intensive Pacing</span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {currentCollegeLevel.intensive.minsPerSession} min
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 space-y-0.5 font-medium">
                  <div>• Sessions: <strong>{currentCollegeLevel.intensive.sessionsRequired} sessions</strong></div>
                  <div>• Frequency: <strong>{currentCollegeLevel.intensive.sessionsPerWeek} sessions / week</strong></div>
                  <div>• Duration: <strong>{currentCollegeLevel.intensive.monthsRequired} Months</strong></div>
                </div>
              </div>
            )}

            {/* Super Intensive */}
            {currentCollegeLevel.superIntensive && (
              <div
                onClick={() => {
                  setCollegePacing('superIntensive');
                  emitCollegeSelection(activeLang, activeLevel, 'superIntensive', currentCollegeLevel);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  collegePacing === 'superIntensive'
                    ? 'bg-white border-rose-600 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B2447]">Super-Intensive</span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    {currentCollegeLevel.superIntensive.minsPerSession} min
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 space-y-0.5 font-medium">
                  <div>• Sessions: <strong>{currentCollegeLevel.superIntensive.sessionsRequired} sessions</strong></div>
                  <div>• Frequency: <strong>{currentCollegeLevel.superIntensive.sessionsPerWeek} sessions / week</strong></div>
                  <div>• Duration: <strong>{currentCollegeLevel.superIntensive.monthsRequired} Months</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. School Period Category Matrix Track */}
      {mode === 'SCHOOL' && currentSchoolLevel && (
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              3. School Timetable Period Category (Cat 1 to Cat 6)
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              Level {currentSchoolLevel.levelCode} ({currentSchoolLevel.durationHours} Teaching Hours)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(
              [
                { key: 'cat1', label: 'Cat 1 (35m)' },
                { key: 'cat2', label: 'Cat 2 (40m)' },
                { key: 'cat3', label: 'Cat 3 (45m)' },
                { key: 'cat4', label: 'Cat 4 (50m)' },
                { key: 'cat5', label: 'Cat 5 (55m)' },
                { key: 'cat6', label: 'Cat 6 (60m)' },
              ] as const
            ).map((c) => {
              const catData = currentSchoolLevel.categories[c.key];
              const isSelected = schoolPeriodCat === c.key;
              return (
                <div
                  key={c.key}
                  onClick={() => {
                    setSchoolPeriodCat(c.key);
                    emitSchoolSelection(activeLang, activeLevel, c.key, currentSchoolLevel);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all ${
                    isSelected
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-[#0B2447]">{c.label}</div>
                  <div className="mt-1 text-[10px] text-slate-600 space-y-0.5">
                    <div><strong>{catData.periodsPerWeek}</strong> periods/wk</div>
                    <div className="font-black text-emerald-700"><strong>{catData.totalPeriods}</strong> total</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Academic Specs Banner */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
            <span>• Pre-final Assessments: <strong className="text-slate-800">{currentSchoolLevel.assessmentsCount}</strong></span>
            <span>• Speaking Practice: <strong className="text-slate-800">{currentSchoolLevel.speakingMinsPer2Weeks} min (bi-weekly)</strong></span>
            <span>• AI Speaking Practice: <strong className="text-slate-800">{currentSchoolLevel.aiSpeakingPerDay} times / day</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

