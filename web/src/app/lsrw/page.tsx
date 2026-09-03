"use client";

import React, { useState } from 'react';
import { 
  Headphones, 
  Mic, 
  FileText, 
  PenTool, 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Key, 
  Bot,
  BarChart2
} from 'lucide-react';
import { mockLsrwData } from '@/mock/lsrw';
import ParagraphTypingEngine from '@/components/lsrw/ParagraphTypingEngine';

export default function LsrwPage() {
  const [activeTab, setActiveTab] = useState<'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('LISTENING');

  // Listening State
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedListeningAnswers, setSelectedListeningAnswers] = useState<{ [key: string]: number }>({});
  const [listeningSubmitted, setListeningSubmitted] = useState(false);

  // Speaking State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);

  // Writing State
  const [writingMode, setWritingMode] = useState<'WHITEBOARD' | 'ESSAY'>('WHITEBOARD');
  const [essayText, setEssayText] = useState('');
  const [aiWritingChecked, setAiWritingChecked] = useState(false);

  // Reading State
  const [selectedWordNote, setSelectedWordNote] = useState<{ word: string; translation: string; grammarNote: string } | null>(null);

  const handleVirtualKeyClick = (char: string) => {
    setEssayText(prev => prev + char);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDone(false);
    setAiScore(null);
    setTimeout(() => {
      setIsRecording(false);
      setRecordingDone(true);
      setAiScore(88); // Mock Whisper STT AI score
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-3 border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
            <Sparkles className="w-4 h-4 text-[#0052CC]" />
            <span>4-Skill Language Practice • Learn at Your Own Pace</span>
          </div>

          {/* Active Target Language Pill */}
          <div className="flex items-center gap-2 bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-[#0B2447] self-start sm:self-auto">
            <span>Active Language:</span>
            <span className="text-[#0052CC] font-extrabold">French (Français A1)</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">LSRW 4-Skill Practice Suite</h1>
        <p className="text-xs text-slate-600">
          Master French Listening (L), Speaking (S), Reading (R), and Writing (W) with instant AI audio evaluation, French accent keyboards, and paragraph typing practice.
        </p>
      </div>

      {/* 4 Skill Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'LISTENING', label: 'Listening (L)', icon: Headphones, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { key: 'SPEAKING', label: 'Speaking (S)', icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { key: 'READING', label: 'Reading (R)', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { key: 'WRITING', label: 'Writing (W)', icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#0052CC] text-white border-cyan-400 shadow-md scale-102' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. LISTENING TAB */}
      {activeTab === 'LISTENING' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-wider font-mono">CEFR {mockLsrwData.listening[0].cefrLevel} Audio Drill</span>
              <h2 className="text-lg font-bold text-[#0B2447]">{mockLsrwData.listening[0].title}</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Accent: {mockLsrwData.listening[0].speakerNativeAccent}
            </span>
          </div>

          {/* Audio Player Widget */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#0052CC]" /> Native Speaker Audio Track
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500">Speed:</span>
                {[0.75, 1.0, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      playbackSpeed === speed ? 'bg-[#0052CC] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <audio controls className="w-full">
              <source src={mockLsrwData.listening[0].audioUrl} type="audio/mp3" />
            </audio>
          </div>

          {/* Comprehension Questions */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-[#0B2447]">Listening Comprehension Quiz</h3>
            {mockLsrwData.listening[0].questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800">{qIdx + 1}. {q.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedListeningAnswers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedListeningAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                        className={`p-2.5 rounded-lg text-xs text-left font-medium border transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#0052CC] text-white border-[#0052CC]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => setListeningSubmitted(true)}
              className="px-6 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Submit Listening Answers
            </button>

            {listeningSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Great job! 2 / 2 Answers Correct (100% Score).</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SPEAKING TAB (WHISPER AI MOCK) */}
      {activeTab === 'SPEAKING' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider font-mono">Whisper STT Speech Recognition</span>
            <h2 className="text-lg font-bold text-[#0B2447]">{mockLsrwData.speaking[0].title}</h2>
          </div>

          <div className="p-5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Phrase to Pronounce:</p>
            <p className="text-lg font-extrabold text-[#0B2447] font-serif">"{mockLsrwData.speaking[0].targetPhrase}"</p>
            <p className="text-xs text-slate-600 font-mono">{mockLsrwData.speaking[0].phoneticGuide}</p>
            <p className="text-xs text-slate-500 italic">"{mockLsrwData.speaking[0].englishTranslation}"</p>

            <div className="pt-3 flex justify-center">
              <button
                onClick={handleStartRecording}
                disabled={isRecording}
                className={`px-8 py-3.5 rounded-full font-bold text-xs text-white shadow-lg flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
                  isRecording ? 'bg-rose-600 animate-pulse' : 'bg-[#0052CC] hover:bg-blue-700'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>{isRecording ? 'Listening & Transcribing Voice...' : 'Record Voice Pronunciation'}</span>
              </button>
            </div>
          </div>

          {/* AI Score Feedback */}
          {recordingDone && aiScore !== null && (
            <div className="p-5 bg-white border-2 border-emerald-300 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-600" /> Python Whisper STT AI Evaluation Result
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-sm rounded-full">
                  Pronunciation Score: {aiScore}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
                <p><span className="font-bold text-emerald-700">✓ Phoneme Accuracy:</span> Excellent pronunciation of 'Bonjour' and 'm'appelle'.</p>
                <p><span className="font-bold text-amber-700">! Improvement Tip:</span> Soften the ending 't' in 'est' for native French rhythm.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. READING TAB (WITH VOCAB NOTES) */}
      {activeTab === 'READING' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono">Reading Comprehension & Vocab Notes</span>
            <h2 className="text-lg font-bold text-[#0B2447]">{mockLsrwData.reading[0].title}</h2>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#0B2447]">{mockLsrwData.reading[0].passageTitle}</h3>
            <p className="text-sm text-slate-800 leading-relaxed font-serif">
              Je suis à Paris. La ville est <span onClick={() => setSelectedWordNote(mockLsrwData.reading[0].vocabularyNotes[0])} className="underline decoration-emerald-500 font-bold text-emerald-700 cursor-pointer">magnifique</span>! Le matin, je prends un croissant <span onClick={() => setSelectedWordNote(mockLsrwData.reading[0].vocabularyNotes[1])} className="underline decoration-emerald-500 font-bold text-emerald-700 cursor-pointer">près de</span> la Tour Eiffel. L'après-midi, je visite le <span onClick={() => setSelectedWordNote(mockLsrwData.reading[0].vocabularyNotes[2])} className="underline decoration-emerald-500 font-bold text-emerald-700 cursor-pointer">musée</span> du Louvre.
            </p>
            <p className="text-[11px] text-slate-500 italic">💡 Tap highlighted green words above to reveal grammar notes & definitions.</p>
          </div>

          {/* Vocab Note Card */}
          {selectedWordNote && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-emerald-900">Word: "{selectedWordNote.word}" → {selectedWordNote.translation}</p>
              <p className="text-xs text-emerald-700 font-medium">Grammar Note: {selectedWordNote.grammarNote}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. WRITING TAB (PARAGRAPH TYPING PRACTICE ENGINE) */}
      {activeTab === 'WRITING' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider font-mono">Paragraph Typing Practice</span>
            <h2 className="text-lg font-bold text-[#0B2447]">{mockLsrwData.writing[0].title}</h2>
          </div>

          <ParagraphTypingEngine />
        </div>
      )}
    </div>
  );
}
