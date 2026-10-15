// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: CREATE / UPLOAD LSRW EXERCISE DRAWER
// Dynamic Curriculum-First Engine:
// Subject change -> Chapters auto-populate -> Language Proficiency Benchmark (CEFR A1-B2 vs JLPT N5-N1) automatically adapts!
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Headphones,
  Mic,
  FileText,
  PenTool,
  X,
  Plus,
  Upload,
  Sparkles,
  Layers,
  BookOpen,
  Globe2,
  Paperclip,
  Check,
  Music,
  FileCheck2,
  FolderTree,
  Volume2
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { mockSubjects, mockModules, mockCourses } from '@/mock/superAdminData';

export type LsrwSkillType = 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';

export interface LsrwExerciseItem {
  id: string;
  skillType: LsrwSkillType;
  title: string;
  subjectId: string;
  subjectName: string;
  moduleId?: string;
  moduleName?: string;
  courseName: string;
  cefrLevel: string;
  audioUrl?: string;
  speakerAccent?: string;
  transcript?: string;
  targetPhrase?: string;
  phoneticGuide?: string;
  readingPassage?: string;
  writingPrompt?: string;
  minWordCount?: number;
  aiScoringModel?: string;
  createdAt: string;
}

interface CreateLsrwDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseCreated: (item: LsrwExerciseItem) => void;
  defaultSkill?: LsrwSkillType;
}

// Language Classification Helper for Proficiency Standard
type LanguageFamily = 'FRENCH' | 'GERMAN' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GENERAL';

function detectLanguageFamily(subjectName: string, code: string): LanguageFamily {
  const text = `${subjectName} ${code}`.toLowerCase();
  if (text.includes('french') || text.includes('fr-') || text.includes('fr101')) return 'FRENCH';
  if (text.includes('german') || text.includes('de-') || text.includes('de101') || text.includes('deutsch')) return 'GERMAN';
  if (text.includes('japanese') || text.includes('ja-') || text.includes('ja101') || text.includes('nihongo')) return 'JAPANESE';
  if (text.includes('korean') || text.includes('ko-') || text.includes('ko101') || text.includes('hangul') || text.includes('topik')) return 'KOREAN';
  if (text.includes('spanish') || text.includes('es-') || text.includes('es101') || text.includes('español')) return 'SPANISH';
  return 'GENERAL';
}

const LANGUAGE_LEVEL_PRESETS: Record<LanguageFamily, { benchmarkLabel: string; levels: { value: string; label: string }[] }> = {
  FRENCH: {
    benchmarkLabel: 'CEFR DELF / DALF Level',
    levels: [
      { value: 'A1.1', label: 'CEFR A1.1 (Beginner Foundation)' },
      { value: 'A1.2', label: 'CEFR A1.2 (Elementary DELF)' },
      { value: 'A2.1', label: 'CEFR A2.1 (Pre-Intermediate)' },
      { value: 'A2.2', label: 'CEFR A2.2 (Waystage French)' },
      { value: 'B1.1', label: 'CEFR B1.1 (Intermediate Threshold)' },
      { value: 'B2.1', label: 'CEFR B2.1 (Vantage Professional)' },
    ],
  },
  GERMAN: {
    benchmarkLabel: 'Goethe-Zertifikat / CEFR Level',
    levels: [
      { value: 'A1.1', label: 'Start Deutsch A1.1 (Grundstufe)' },
      { value: 'A1.2', label: 'Start Deutsch A1.2 (Elementary)' },
      { value: 'A2.1', label: 'Goethe A2.1 (Aufbaustufe)' },
      { value: 'A2.2', label: 'Goethe A2.2 (Pre-Intermediate)' },
      { value: 'B1.1', label: 'Zertifikat Deutsch B1.1' },
      { value: 'B2.1', label: 'Goethe B2.1 (Beruf Professional)' },
    ],
  },
  JAPANESE: {
    benchmarkLabel: 'JLPT (Japanese-Language Proficiency Test)',
    levels: [
      { value: 'JLPT N5 (Basic)', label: 'JLPT N5 — Basic (Hiragana/Katakana + 100 Kanji)' },
      { value: 'JLPT N5 (Adv)', label: 'JLPT N5 — Advanced Elementary Conversations' },
      { value: 'JLPT N4', label: 'JLPT N4 — Daily Life Japanese (300 Kanji)' },
      { value: 'JLPT N3', label: 'JLPT N3 — Business Intermediate Bridge' },
      { value: 'JLPT N2', label: 'JLPT N2 — Advanced Corporate Fluency' },
      { value: 'JLPT N1', label: 'JLPT N1 — Native / Diplomatic Mastery' },
    ],
  },
  KOREAN: {
    benchmarkLabel: 'TOPIK (Test of Proficiency in Korean)',
    levels: [
      { value: 'TOPIK I Level 1', label: 'TOPIK I Level 1 — Beginner (Hangul + Basic Greetings)' },
      { value: 'TOPIK I Level 2', label: 'TOPIK I Level 2 — Elementary (Daily Expressions & Numbers)' },
      { value: 'TOPIK II Level 3', label: 'TOPIK II Level 3 — Intermediate (Social & Public Facilities)' },
      { value: 'TOPIK II Level 4', label: 'TOPIK II Level 4 — Upper Intermediate (Workplace Korean)' },
      { value: 'TOPIK II Level 5', label: 'TOPIK II Level 5 — Advanced (Professional Business Research)' },
      { value: 'TOPIK II Level 6', label: 'TOPIK II Level 6 — Native / Academic Fluency' },
    ],
  },
  SPANISH: {
    benchmarkLabel: 'DELE / SIELE CEFR Level',
    levels: [
      { value: 'A1.1', label: 'DELE A1.1 (Acceso Inicial)' },
      { value: 'A1.2', label: 'DELE A1.2 (Plataforma A1)' },
      { value: 'A2.1', label: 'DELE A2.1 (Pre-Intermedio)' },
      { value: 'B1.1', label: 'DELE B1.1 (Umbral Intermedio)' },
      { value: 'B2.1', label: 'DELE B2.1 (Avanzado Profesional)' },
    ],
  },
  GENERAL: {
    benchmarkLabel: 'Proficiency Benchmark Scale',
    levels: [
      { value: 'Foundation 1', label: 'Level 1 — Foundation & Core Basics' },
      { value: 'Intermediate 2', label: 'Level 2 — Intermediate Application' },
      { value: 'Advanced 3', label: 'Level 3 — Advanced Professional Capstone' },
    ],
  },
};

export default function CreateLsrwDrawer({
  isOpen,
  onClose,
  onExerciseCreated,
  defaultSkill = 'LISTENING',
}: CreateLsrwDrawerProps) {
  const { showSuccess } = useToast();

  // 1️⃣ CURRICULUM SUBJECT STATE
  const [selectedSubjectId, setSelectedSubjectId] = useState(mockSubjects[0]?.id || 'subj-fr101');
  const selectedSubject = useMemo(() => {
    return mockSubjects.find(s => s.id === selectedSubjectId) || mockSubjects[0];
  }, [selectedSubjectId]);

  // Language family of selected subject (French, German, Japanese, Spanish, etc.)
  const languageFamily = useMemo(() => {
    return detectLanguageFamily(selectedSubject?.name || '', selectedSubject?.code || '');
  }, [selectedSubject]);

  const levelPreset = useMemo(() => {
    return LANGUAGE_LEVEL_PRESETS[languageFamily];
  }, [languageFamily]);

  // Modules belonging STRICTLY to selected subject
  const availableModules = useMemo(() => {
    const list = mockModules.filter(m => m.subjectId === selectedSubjectId);
    return list.length > 0 ? list : [
      {
        id: `mod-${selectedSubjectId}-01`,
        subjectId: selectedSubjectId,
        subjectName: selectedSubject.name,
        moduleNumber: 1,
        title: `Unit 1: ${selectedSubject.name} Fundamentals`,
        description: 'Core concepts, foundational vocabulary and basic structures.',
        topicsCount: 4,
        estimatedHours: 12,
        status: 'ACTIVE' as const,
      }
    ];
  }, [selectedSubjectId, selectedSubject]);

  const [selectedModuleId, setSelectedModuleId] = useState(availableModules[0]?.id || '');
  const selectedModule = useMemo(() => {
    return availableModules.find(m => m.id === selectedModuleId) || availableModules[0];
  }, [availableModules, selectedModuleId]);

  const [cefrLevel, setCefrLevel] = useState(levelPreset.levels[0]?.value || 'A1.1');

  // 🔄 AUTOMATIC SYNC: When Subject changes, automatically pick its first valid module & first valid language level!
  useEffect(() => {
    if (availableModules.length > 0) {
      setSelectedModuleId(availableModules[0].id);
    }
    if (levelPreset.levels.length > 0) {
      setCefrLevel(levelPreset.levels[0].value);
    }
  }, [selectedSubjectId, availableModules, levelPreset]);

  // 2️⃣ SKILL & DRILL DETAILS
  const [skillType, setSkillType] = useState<LsrwSkillType>(defaultSkill);
  const [title, setTitle] = useState('');

  // Universal Upload Mode: 'FILE' (Direct Device Upload) vs 'URL' (External Cloud URL)
  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>({
    name: 'french_a1_bistro_dialogue_native.mp3',
    size: '3.4 MB',
    type: 'audio/mpeg',
  });
  const [isDragging, setIsDragging] = useState(false);

  // Listening Fields
  const [audioFileUrl, setAudioFileUrl] = useState('https://storage.isml.edu/audio/bistro-french-a1.mp3');
  const [speakerAccent, setSpeakerAccent] = useState('Native Speaker (Standard)');
  const [transcript, setTranscript] = useState('Bonjour! Un café et un croissant s\'il vous plaît.');

  // Speaking Fields
  const [targetPhrase, setTargetPhrase] = useState('Comment allez-vous aujourd\'hui?');
  const [phoneticGuide, setPhoneticGuide] = useState('/kɔ.mɑ̃ ta.le vu o.ʒuʁ.dɥi/');
  const [aiModel, setAiModel] = useState('OpenAI Whisper Large-v3 French');

  // Reading Fields
  const [readingPassage, setReadingPassage] = useState('Je m\'appelle Thomas et j\'habite à Lyon. C\'est une très belle ville en France avec une gastronomie célèbre.');

  // Writing Fields
  const [writingPrompt, setWritingPrompt] = useState('Write a 50-word introduction about your favorite weekend routine.');
  const [minWords, setMinWords] = useState(50);

  // Sync default dummy text according to selected language
  useEffect(() => {
    if (languageFamily === 'JAPANESE') {
      setSpeakerAccent('Tokyo Standard Dialect (Kanto)');
      setTranscript('こんにちは、私は田中です。よろしくお願いします。(Konnichiwa, watashi wa Tanaka desu.)');
      setTargetPhrase('はじめまして、どうぞよろしくおねがいします。');
      setPhoneticGuide('Hajimemashite, douzo yoroshiku onegaishimasu.');
      setAiModel('OpenAI Whisper Large-v3 Japanese');
      setReadingPassage('私は毎朝七時に起きます。朝ご飯にパンとコーヒーを食べます。学校は八時半からです。');
      setWritingPrompt('Write 30 to 50 characters introducing yourself using basic Hiragana and Katakana.');
    } else if (languageFamily === 'KOREAN') {
      setSpeakerAccent('Seoul Standard Dialect (Standard Korean)');
      setTranscript('안녕하세요! 저는 김민수입니다. 만나서 반가워요. (Annyeonghaseyo! Jeoneun Kim Min-su imnida.)');
      setTargetPhrase('처음 뵙겠습니다. 잘 부탁드립니다.');
      setPhoneticGuide('Cheoeum boepgetseumnida. Jal butakdeurimnida.');
      setAiModel('OpenAI Whisper Large-v3 Korean');
      setReadingPassage('저는 한국어를 배우고 있습니다. 한국 음식 중에서 비빔밥과 김치찌개를 좋아합니다.');
      setWritingPrompt('Write 40 to 60 syllables introducing your name and daily routine in Hangul.');
    } else if (languageFamily === 'GERMAN') {
      setSpeakerAccent('Hochdeutsch (Standard German, Berlin)');
      setTranscript('Guten Tag! Ich möchte einen Kaffee und ein Croissant bitte.');
      setTargetPhrase('Wie geht es Ihnen heute? Ich lerne Deutsch.');
      setPhoneticGuide('/viː ɡeːt ɛs ˈiːnən ˈhɔɪ̯tə/');
      setAiModel('OpenAI Whisper Large-v3 German');
      setReadingPassage('Mein Name ist Lukas und ich wohne in München. München ist eine sehr schöne Stadt in Bayern.');
      setWritingPrompt('Schreiben Sie 50 Wörter über Ihre Hobbys und Wochenendroutine.');
    } else if (languageFamily === 'SPANISH') {
      setSpeakerAccent('Castilian Spanish (Madrid)');
      setTranscript('¡Hola! Un café con leche y una tostada, por favor.');
      setTargetPhrase('¿Cómo está usted hoy? Me gusta aprender español.');
      setPhoneticGuide('/ˈkomo esˈta usˈteð oj/');
      setAiModel('OpenAI Whisper Large-v3 Spanish');
      setReadingPassage('Me llamo Carlos y vivo en Madrid desde hace dos años. Es una ciudad hermosa con una cultura vibrante.');
      setWritingPrompt('Escribe un texto de 50 palabras presentándote y describiendo tu ciudad.');
    } else if (languageFamily === 'FRENCH') {
      setSpeakerAccent('Metropolitan French (Paris)');
      setTranscript('Bonjour Monsieur! Un café et un croissant s\'il vous plaît.');
      setTargetPhrase('Comment allez-vous aujourd\'hui?');
      setPhoneticGuide('/kɔ.mɑ̃ ta.le vu o.ʒuʁ.dɥi/');
      setAiModel('OpenAI Whisper Large-v3 French');
      setReadingPassage('Je m\'appelle Thomas et j\'habite à Lyon. C\'est une très belle ville en France avec une gastronomie célèbre.');
      setWritingPrompt('Write a 50-word introduction about your favorite French dish or weekend routine.');
    }
  }, [languageFamily]);

  // Adjust default uploaded mock file when skillType or language changes
  useEffect(() => {
    if (skillType === 'LISTENING') {
      setUploadedFile({
        name: `${languageFamily.toLowerCase()}_audio_listening_drill.mp3`,
        size: '3.8 MB',
        type: 'audio/mpeg',
      });
      setAudioFileUrl(`https://storage.isml.edu/audio/${languageFamily.toLowerCase()}-drill-native.mp3`);
    } else if (skillType === 'SPEAKING') {
      setUploadedFile({
        name: `${languageFamily.toLowerCase()}_reference_speech_audio.wav`,
        size: '2.1 MB',
        type: 'audio/wav',
      });
      setAudioFileUrl(`https://storage.isml.edu/audio/${languageFamily.toLowerCase()}-speech-ref.wav`);
    } else if (skillType === 'READING') {
      setUploadedFile({
        name: `${languageFamily.toLowerCase()}_reading_passage_doc.pdf`,
        size: '540 KB',
        type: 'application/pdf',
      });
    } else if (skillType === 'WRITING') {
      setUploadedFile({
        name: `${languageFamily.toLowerCase()}_writing_prompt_rubric.docx`,
        size: '210 KB',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    }
  }, [skillType, languageFamily]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: LsrwExerciseItem = {
      id: `lsrw-${Date.now().toString().slice(-4)}`,
      skillType,
      title: title || `${selectedSubject.code} ${skillType} Drill: ${selectedModule?.title || 'Chapter 1'}`,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      moduleId: selectedModule?.id,
      moduleName: selectedModule?.title || 'Module 1',
      courseName: selectedSubject.name,
      cefrLevel,
      audioUrl: skillType === 'LISTENING' || skillType === 'SPEAKING' ? audioFileUrl : undefined,
      speakerAccent: skillType === 'LISTENING' ? speakerAccent : undefined,
      transcript: skillType === 'LISTENING' ? transcript : undefined,
      targetPhrase: skillType === 'SPEAKING' ? targetPhrase : undefined,
      phoneticGuide: skillType === 'SPEAKING' ? phoneticGuide : undefined,
      readingPassage: skillType === 'READING' ? readingPassage : undefined,
      writingPrompt: skillType === 'WRITING' ? writingPrompt : undefined,
      minWordCount: skillType === 'WRITING' ? minWords : undefined,
      aiScoringModel: skillType === 'SPEAKING' ? aiModel : undefined,
      createdAt: 'Just now',
    };

    onExerciseCreated(newItem);
    showSuccess(`LSRW ${skillType} drill mapped to "${selectedSubject.name}" (${cefrLevel}) published!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
              {skillType === 'LISTENING' && <Headphones className="w-5 h-5 text-cyan-300" />}
              {skillType === 'SPEAKING' && <Mic className="w-5 h-5 text-rose-300" />}
              {skillType === 'READING' && <FileText className="w-5 h-5 text-emerald-300" />}
              {skillType === 'WRITING' && <PenTool className="w-5 h-5 text-purple-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Upload & Configure LSRW Exercise
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                  {languageFamily}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Dynamic curriculum mapping: Subject → Chapters → Benchmark level
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            
            {/* 🎯 STEP 1: DYNAMIC SUBJECT, CHAPTER & LANGUAGE LEVEL MAPPING */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#061A36] to-[#0D3166] text-white border border-[#1E4E8C] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider">
                    Step 1: Curriculum Subject & Level Mapping
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  <span>{languageFamily}</span>
                </span>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Target Curriculum Subject <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#041124] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                >
                  {mockSubjects.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter & Benchmark Level Adapt Automatically */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Dynamically Filtered Chapter/Module */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Chapter / Module Unit <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#041124] border border-cyan-500/30 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                  >
                    {availableModules.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white truncate">
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-cyan-300/80 mt-0.5 block">
                    {availableModules.length} units in this subject
                  </span>
                </div>

                {/* Dynamically Adapted Language Level (French/German=CEFR A1-B2 vs Japanese=JLPT N5-N1) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {levelPreset.benchmarkLabel} <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={cefrLevel}
                    onChange={(e) => setCefrLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#041124] border border-cyan-500/30 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                  >
                    {levelPreset.levels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value} className="bg-slate-900 text-white">
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-emerald-300 font-medium mt-0.5 block">
                    ✓ Auto-adapted for {languageFamily}
                  </span>
                </div>
              </div>
            </div>

            {/* 🎯 STEP 2: SELECT LSRW SKILL TYPE */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Step 2: Select LSRW Skill Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSkillType('LISTENING')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    skillType === 'LISTENING'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Listening</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillType('SPEAKING')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    skillType === 'SPEAKING'
                      ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-xs ring-1 ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Speaking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillType('READING')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    skillType === 'READING'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Reading</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillType('WRITING')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    skillType === 'WRITING'
                      ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-1 ring-purple-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  <span>Writing</span>
                </button>
              </div>
            </div>

            {/* Drill Title */}
            {/* Drill Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Exercise Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. ${selectedSubject.code} ${skillType} Practice Drill`}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            {/* 📁 UPLOAD METHOD SWITCHER (FILE UPLOAD vs CLOUD URL) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setUploadMode('FILE')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadMode === 'FILE'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Audio / Document File</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.2 rounded-full">Device</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('URL')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadMode === 'URL'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Storage / Stream URL</span>
              </button>
            </div>

            {/* 🎧 LISTENING SPECIFIC INPUTS */}
            {skillType === 'LISTENING' && (
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-blue-600" />
                    <span>Listening Audio Resource ({languageFamily})</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                    MP3, WAV, AAC, M4A
                  </span>
                </div>

                {uploadMode === 'FILE' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Upload Native Speaker Audio File <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setUploadedFile({
                            name: file.name,
                            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            type: file.type || 'audio/mpeg',
                          });
                          setAudioFileUrl(`https://storage.isml.edu/uploads/audio/${file.name}`);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                        isDragging ? 'border-blue-500 bg-blue-100/60' : 'border-blue-300 bg-white hover:border-blue-400'
                      }`}
                    >
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                        id="audio-file-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile({
                              name: file.name,
                              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                              type: file.type || 'audio/mpeg',
                            });
                            setAudioFileUrl(`https://storage.isml.edu/uploads/audio/${file.name}`);
                          }
                        }}
                      />
                      <label htmlFor="audio-file-input" className="cursor-pointer block">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                          <Music className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to browse or drag & drop native audio file
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          High-fidelity studio audio • Max 50 MB
                        </p>
                      </label>

                      {uploadedFile && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between text-left">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</p>
                              <p className="text-[10px] text-slate-500">{uploadedFile.size} • Ready for deployment</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                            Attached
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Direct Audio Cloud Stream URL (MP3 / WAV) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={audioFileUrl}
                      onChange={(e) => setAudioFileUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="https://storage.isml.edu/audio/example.mp3"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Native Speaker Accent Profile
                  </label>
                  <input
                    type="text"
                    value={speakerAccent}
                    onChange={(e) => setSpeakerAccent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. Standard Native Accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audio Transcript & Subtitle Guide (Answer Key)
                  </label>
                  <textarea
                    rows={2}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    placeholder="Transcript of the audio track..."
                  />
                </div>
              </div>
            )}

            {/* 🎤 SPEAKING SPECIFIC INPUTS */}
            {skillType === 'SPEAKING' && (
              <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-rose-600" />
                    <span>Speaking Benchmark & Reference Speech ({languageFamily})</span>
                  </div>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-medium">
                    Whisper AI + Reference Audio
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Speech Phrase <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetPhrase}
                    onChange={(e) => setTargetPhrase(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    placeholder="Enter target foreign language phrase"
                    required
                  />
                </div>

                {uploadMode === 'FILE' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Upload Native Pronunciation Reference Audio (Optional Model Audio)
                    </label>
                    <div className="border border-dashed border-rose-300 bg-white rounded-xl p-3 text-center">
                      <input
                        type="file"
                        accept="audio/*"
                        id="speaking-file-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile({
                              name: file.name,
                              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                              type: file.type,
                            });
                          }
                        }}
                      />
                      <label htmlFor="speaking-file-input" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-rose-700">
                        <Upload className="w-4 h-4" />
                        <span>{uploadedFile ? uploadedFile.name : 'Attach Reference Pronunciation Audio'}</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reference Audio URL
                    </label>
                    <input
                      type="url"
                      value={audioFileUrl}
                      onChange={(e) => setAudioFileUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      placeholder="https://storage.isml.edu/audio/ref-sample.mp3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phonetic Transcription Guide / Romaji
                  </label>
                  <input
                    type="text"
                    value={phoneticGuide}
                    onChange={(e) => setPhoneticGuide(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                    placeholder="Phonetic / Pronunciation breakdown"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    AI Speech Recognition Engine
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value={`OpenAI Whisper Large-v3 ${languageFamily}`}>OpenAI Whisper Large-v3 ({languageFamily} Native Model)</option>
                    <option value="Deepgram Nova-2 Multilingual">Deepgram Nova-2 Multilingual Engine</option>
                    <option value="Google Cloud Speech v2">Google Cloud Speech-to-Text v2</option>
                  </select>
                </div>
              </div>
            )}

            {/* 📖 READING SPECIFIC INPUTS */}
            {skillType === 'READING' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Comprehension Reading Text / Document ({languageFamily})</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    PDF, DOCX, TXT
                  </span>
                </div>

                {uploadMode === 'FILE' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Upload Reading Passage Document (PDF / DOCX)
                    </label>
                    <div className="border-2 border-dashed border-emerald-300 bg-white rounded-xl p-3 text-center">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        id="reading-doc-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile({
                              name: file.name,
                              size: `${(file.size / 1024).toFixed(0)} KB`,
                              type: file.type,
                            });
                          }
                        }}
                      />
                      <label htmlFor="reading-doc-input" className="cursor-pointer block">
                        <Upload className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                        <span className="text-xs font-bold text-emerald-800">
                          {uploadedFile ? `${uploadedFile.name} (${uploadedFile.size})` : 'Attach PDF / Article to auto-populate text'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reading Passage Content <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={readingPassage}
                    onChange={(e) => setReadingPassage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    placeholder={`Enter ${languageFamily} reading comprehension text...`}
                    required
                  />
                </div>
              </div>
            )}

            {/* ✍️ WRITING SPECIFIC INPUTS */}
            {skillType === 'WRITING' && (
              <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-600" />
                    <span>Writing Prompt & Rubric Specification ({languageFamily})</span>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                    Interactive Accent Keyboard
                  </span>
                </div>

                {uploadMode === 'FILE' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Upload Prompt Specification / Rubric Document
                    </label>
                    <div className="border-2 border-dashed border-purple-300 bg-white rounded-xl p-3 text-center">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        id="writing-doc-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile({
                              name: file.name,
                              size: `${(file.size / 1024).toFixed(0)} KB`,
                              type: file.type,
                            });
                          }
                        }}
                      />
                      <label htmlFor="writing-doc-input" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-purple-800">
                        <Upload className="w-4 h-4" />
                        <span>{uploadedFile ? `${uploadedFile.name} (${uploadedFile.size})` : 'Attach Rubric / Assignment Brief'}</span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Writing Prompt Instructions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={writingPrompt}
                    onChange={(e) => setWritingPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    placeholder={`Enter ${languageFamily} writing task instructions...`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Word Count Threshold
                  </label>
                  <input
                    type="number"
                    value={minWords}
                    onChange={(e) => setMinWords(Number(e.target.value))}
                    min={20}
                    max={500}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Drawer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
              Mapped to: <strong>{selectedSubject.code}</strong> • {cefrLevel}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Publish {skillType} Drill</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
